import { useState, useEffect, useCallback, useRef } from "react"
import {
  fetchMarketHistory,
  fetchOfficialMarketBatch,
  mergeOfficialMarketData,
} from "../services/habboApi"

const POLL_INTERVAL_MS = 5 * 60 * 1000
const MAX_NOTIFICATIONS = 50

export function useMonitor({ watchlist, updateWatchlistItem, serverData, markDirty, isLoggedIn }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isPolling, setIsPolling] = useState(false)
  const timerRef = useRef(null)
  const pollingRef = useRef(false)
  const hydrated = useRef(false)
  const skipNextSync = useRef(false)
  const isLoggedInRef = useRef(isLoggedIn)

  useEffect(() => { isLoggedInRef.current = isLoggedIn }, [isLoggedIn])

  // Hidrata notificações do servidor
  useEffect(() => {
    if (!serverData || !isLoggedIn) return
    if (Array.isArray(serverData.notifications)) {
      skipNextSync.current = true
      hydrated.current = true
      setNotifications(serverData.notifications)
      setUnreadCount(serverData.notifications.filter((n) => !n.read).length)
    }
  }, [serverData, isLoggedIn])

  // Sincroniza notificações com servidor
  useEffect(() => {
    if (!isLoggedIn || !hydrated.current) return
    if (skipNextSync.current) {
      skipNextSync.current = false
      return
    }
    markDirty?.("notifications", notifications)
  }, [notifications, isLoggedIn, markDirty])

  const addNotification = useCallback((notif) => {
    setNotifications((prev) => {
      // Evita duplicata com notificação já gerada pelo job do backend
      if (prev.some((n) => n.id === notif.id || (
        n.className === notif.className &&
        n.oldPrice === notif.oldPrice &&
        n.newPrice === notif.newPrice
      ))) return prev
      return [notif, ...prev].slice(0, MAX_NOTIFICATIONS)
    })
    setUnreadCount((v) => v + 1)
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id)
      setUnreadCount(updated.filter((n) => !n.read).length)
      return updated
    })
  }, [])

  const checkItem = useCallback(async (watchedItem) => {
    try {
      const legacyData = await fetchMarketHistory({
        classname: watchedItem.ClassName,
        hotel: watchedItem.hotel ?? "br",
        days: "7",
      })

      const legacyItems = (Array.isArray(legacyData) ? legacyData : []).filter(
        (item) => !!item?.ClassName?.trim()
      )
      if (legacyItems.length === 0) return

      const batchItems = legacyItems.map((item) => ({
        classname: item.ClassName,
        furniType: item.FurniType === "wallItem" ? "wallItem" : "roomItem",
      }))

      let officialBatch = null
      try {
        officialBatch = await fetchOfficialMarketBatch(batchItems, watchedItem.hotel ?? "br")
      } catch { }

      const merged = officialBatch
        ? mergeOfficialMarketData(legacyItems, officialBatch)
        : legacyItems

      const found = merged.find(
        (i) => i.ClassName?.toLowerCase() === watchedItem.ClassName?.toLowerCase()
      )
      if (!found) return

      const newPrice =
        found?.marketData?.currentPrice ??
        (found?.marketData?.history?.length > 0
          ? found.marketData.history[found.marketData.history.length - 1]?.[0]
          : null) ??
        found?.marketData?.averagePrice ?? null

      if (newPrice == null || newPrice === 0) return

      const oldPrice = watchedItem.basePrice
      if (!oldPrice || oldPrice === newPrice) {
        updateWatchlistItem(watchedItem.ClassName, found.marketData)
        return
      }

      const diff = newPrice - oldPrice
      const pct = ((diff / oldPrice) * 100).toFixed(1)

      addNotification({
        id: `${watchedItem.ClassName}-${Date.now()}`,
        className: watchedItem.ClassName,
        furniName: watchedItem.FurniName,
        oldPrice,
        newPrice,
        diff,
        pct: parseFloat(pct),
        direction: diff > 0 ? "up" : "down",
        hotel: watchedItem.hotel ?? "br",
        read: false,
        createdAt: Date.now(),
      })

      updateWatchlistItem(watchedItem.ClassName, found.marketData)
    } catch { }
  }, [addNotification, updateWatchlistItem])

  const pollAll = useCallback(async () => {
    if (pollingRef.current || watchlist.length === 0) return
    pollingRef.current = true
    setIsPolling(true)

    for (const item of watchlist) {
      await checkItem(item)
      await new Promise((r) => setTimeout(r, 500))
    }

    pollingRef.current = false
    setIsPolling(false)
  }, [watchlist, checkItem])

  useEffect(() => {
    if (watchlist.length === 0) {
      clearInterval(timerRef.current)
      return
    }
    pollAll()
    timerRef.current = setInterval(pollAll, POLL_INTERVAL_MS)
    return () => clearInterval(timerRef.current)
  }, [watchlist.length, pollAll])

  return {
    notifications,
    unreadCount,
    isPolling,
    markAllRead,
    clearNotifications,
    removeNotification,
    pollNow: pollAll,
  }
}