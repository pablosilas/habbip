import { useState, useEffect, useCallback, useRef } from "react"
import {
  fetchMarketHistory,
  fetchOfficialMarketBatch,
  mergeOfficialMarketData,
} from "../services/habboApi"

const POLL_INTERVAL_MS = 5 * 60 * 1000 // 5 minutos
const MAX_NOTIFICATIONS = 50

function resolveNotifKey(loggedUserName) {
  if (!loggedUserName?.trim()) return "habbodesk:anonymous:notifications"
  return `habbodesk:${loggedUserName.trim().toLowerCase().replace(/\s+/g, "_")}:notifications`
}

function loadNotifications(loggedUserName) {
  try {
    const raw = localStorage.getItem(resolveNotifKey(loggedUserName))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveNotifications(loggedUserName, notifs) {
  try {
    localStorage.setItem(resolveNotifKey(loggedUserName), JSON.stringify(notifs))
  } catch { /* empty */ }
}

/**
 * useMonitor
 *
 * Faz polling periódico dos itens na watchlist e emite notificações
 * quando o preço sobe ou cai em relação ao último preço registrado.
 *
 * Props:
 *   watchlist           {Array}    Lista de itens monitorados (do useWatchlist)
 *   updateWatchlistItem {function} Atualiza marketData de um item na watchlist
 *   loggedUserName      {string}   Nome do usuário logado (para persistência)
 */
export function useMonitor({ watchlist, updateWatchlistItem, loggedUserName }) {
  const [notifications, setNotifications] = useState(() =>
    loadNotifications(loggedUserName)
  )
  const [unreadCount, setUnreadCount] = useState(0)
  const [isPolling, setIsPolling] = useState(false)
  const timerRef = useRef(null)
  const pollingRef = useRef(false)

  // Recarrega notificações ao trocar de usuário
  useEffect(() => {
    const loaded = loadNotifications(loggedUserName)
    setNotifications(loaded)
    setUnreadCount(loaded.filter((n) => !n.read).length)
  }, [loggedUserName])

  // Persiste notificações
  useEffect(() => {
    saveNotifications(loggedUserName, notifications)
  }, [notifications, loggedUserName])

  const addNotification = useCallback((notif) => {
    setNotifications((prev) => {
      const updated = [notif, ...prev].slice(0, MAX_NOTIFICATIONS)
      return updated
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

  /**
   * Busca dados atualizados de um item e compara com o preço base.
   * Emite notificação se houver variação.
   */
  const checkItem = useCallback(
    async (watchedItem) => {
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
          officialBatch = await fetchOfficialMarketBatch(
            batchItems,
            watchedItem.hotel ?? "br"
          )
        } catch { /* continua com legado */ }

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
          found?.marketData?.averagePrice ??
          null

        if (newPrice == null || newPrice === 0) return

        const oldPrice = watchedItem.basePrice
        if (!oldPrice || oldPrice === newPrice) {
          // Apenas atualiza sem notificar se não mudou
          updateWatchlistItem(watchedItem.ClassName, found.marketData)
          return
        }

        const diff = newPrice - oldPrice
        const pct = ((diff / oldPrice) * 100).toFixed(1)
        const direction = diff > 0 ? "up" : "down"

        addNotification({
          id: `${watchedItem.ClassName}-${Date.now()}`,
          className: watchedItem.ClassName,
          furniName: watchedItem.FurniName,
          oldPrice,
          newPrice,
          diff,
          pct: parseFloat(pct),
          direction,
          hotel: watchedItem.hotel ?? "br",
          read: false,
          createdAt: Date.now(),
        })

        updateWatchlistItem(watchedItem.ClassName, found.marketData)
      } catch {
        /* silencia erros individuais */
      }
    },
    [addNotification, updateWatchlistItem]
  )

  /**
   * Roda uma checagem em todos os itens da watchlist.
   */
  const pollAll = useCallback(async () => {
    if (pollingRef.current || watchlist.length === 0) return
    pollingRef.current = true
    setIsPolling(true)

    for (const item of watchlist) {
      await checkItem(item)
      // Pequena pausa entre requisições para não sobrecarregar a API
      await new Promise((r) => setTimeout(r, 500))
    }

    pollingRef.current = false
    setIsPolling(false)
  }, [watchlist, checkItem])

  // Agenda o polling periódico
  useEffect(() => {
    if (watchlist.length === 0) {
      clearInterval(timerRef.current)
      return
    }

    // Roda imediatamente ao montar ou ao mudar a watchlist
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