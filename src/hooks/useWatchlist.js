import { useState, useCallback, useEffect, useRef } from "react"

export function useWatchlist(serverData, markDirty, isLoggedIn) {
  const [items, setItems] = useState([])
  const hydrated = useRef(false)
  const skipNextSync = useRef(false)

  // Hidrata do servidor — marca skipNextSync para não sincronizar de volta
  useEffect(() => {
    if (!serverData || !isLoggedIn) return
    if (Array.isArray(serverData.watchlist)) {
      skipNextSync.current = true
      hydrated.current = true
      setItems(serverData.watchlist)
    }
  }, [serverData, isLoggedIn])

  // Sincroniza com servidor — pula logo após hydrate
  useEffect(() => {
    if (!isLoggedIn || !hydrated.current) return
    if (skipNextSync.current) {
      skipNextSync.current = false
      return
    }
    markDirty?.("watchlist", items)
  }, [items, isLoggedIn, markDirty])

  const isWatching = useCallback(
    (className) => items.some((i) => i.ClassName === className),
    [items]
  )

  const addToWatchlist = useCallback((item) => {
    const price =
      item?.marketData?.currentPrice ??
      (item?.marketData?.history?.length > 0
        ? item.marketData.history[item.marketData.history.length - 1]?.[0]
        : null) ??
      item?.marketData?.averagePrice ?? 0

    setItems((prev) => {
      if (prev.some((i) => i.ClassName === item.ClassName)) return prev
      return [...prev, {
        ClassName: item.ClassName,
        FurniName: item.FurniName,
        FurniType: item.FurniType,
        hotel: item.hotel_domain ?? "br",
        basePrice: price,
        addedAt: Date.now(),
        marketData: item.marketData ?? null,
        alertConfig: {
          alertMode: "any",
          targetPrice: null,
        },
      }]
    })
  }, [])

  const removeFromWatchlist = useCallback((className) => {
    setItems((prev) => prev.filter((i) => i.ClassName !== className))
  }, [])

  const toggleWatchlist = useCallback((item) => {
    if (isWatching(item.ClassName)) removeFromWatchlist(item.ClassName)
    else addToWatchlist(item)
  }, [isWatching, addToWatchlist, removeFromWatchlist])

  const updateWatchlistItem = useCallback((className, newMarketData) => {
    setItems((prev) => prev.map((i) => {
      if (i.ClassName !== className) return i
      const newPrice =
        newMarketData?.currentPrice ??
        (newMarketData?.history?.length > 0
          ? newMarketData.history[newMarketData.history.length - 1]?.[0]
          : null) ??
        newMarketData?.averagePrice ?? i.basePrice
      return { ...i, basePrice: newPrice, marketData: newMarketData }
    }))
  }, [])

  const updateWatchlistConfig = useCallback((className, newConfig) => {
    setItems((prev) => prev.map((i) => {
      if (i.ClassName !== className) return i
      return { ...i, alertConfig: { ...i.alertConfig, ...newConfig } }
    }))
  }, [])

  const clearWatchlist = useCallback(() => {
    setItems([])
  }, [])

  return { watchlist: items, isWatching, addToWatchlist, removeFromWatchlist, toggleWatchlist, updateWatchlistItem, updateWatchlistConfig, clearWatchlist }
}