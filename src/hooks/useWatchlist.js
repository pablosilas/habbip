import { useState, useCallback, useEffect, useRef } from 'react'
import {
  fetchSubscriptions,
  addSubscription,
  removeSubscription,
  updateAlertConfig,
} from '../services/subscriptionService'

export function useWatchlist(isLoggedIn) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  // Carrega inscrições do servidor quando loga
  useEffect(() => {
    if (!isLoggedIn) {
      setItems([])
      return
    }
    setLoading(true)
    fetchSubscriptions()
      .then((rows) => {
        setItems(
          rows.map((row) => ({
            ClassName: row.classname,
            FurniName: row.furni_name,
            FurniType: row.furni_type,
            hotel: row.hotel,
            basePrice: row.current_price ?? row.base_price ?? 0,
            alertConfig: row.alert_config ?? { alertMode: 'any', targetPrice: null, priceMargin: null },
            marketData: row.market_data ?? null,
            addedAt: new Date(row.created_at).getTime(),
          }))
        )
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isLoggedIn])

  // Chamado pelo SSE quando um preço muda
  const handlePriceChanged = useCallback((event) => {
    setItems((prev) =>
      prev.map((item) => {
        if (
          item.ClassName.toLowerCase() !== event.className.toLowerCase() ||
          item.hotel !== event.hotel
        ) return item

        return {
          ...item,
          basePrice: event.newPrice,
          marketData: item.marketData
            ? { ...item.marketData, currentPrice: event.newPrice }
            : { currentPrice: event.newPrice },
        }
      })
    )
  }, [])

  const isWatching = useCallback(
    (className) =>
      items.some((i) => i.ClassName.toLowerCase() === className.toLowerCase()),
    [items]
  )

  const addToWatchlist = useCallback(
    async (item) => {
      if (!isLoggedIn) return
      const price =
        item?.marketData?.currentPrice ??
        (item?.marketData?.history?.length > 0
          ? item.marketData.history[item.marketData.history.length - 1]?.[0]
          : null) ??
        item?.marketData?.averagePrice ??
        0

      const sub = {
        ClassName: item.ClassName,
        FurniName: item.FurniName,
        FurniType: item.FurniType,
        hotel: item.hotel_domain ?? 'br',
        basePrice: price,
        alertConfig: { alertMode: 'any', targetPrice: null, priceMargin: null },
        marketData: item.marketData ?? null,
        addedAt: Date.now(),
      }

      // Otimista: atualiza UI antes da resposta
      setItems((prev) => {
        if (prev.some((i) => i.ClassName === item.ClassName)) return prev
        return [...prev, sub]
      })

      try {
        await addSubscription({
          classname: item.ClassName,
          hotel: item.hotel_domain ?? 'br',
          furniName: item.FurniName,
          furniType: item.FurniType,
          basePrice: price,
        })
      } catch (err) {
        console.error('[Watchlist] Erro ao adicionar:', err.message)
        // Reverte se falhou
        setItems((prev) => prev.filter((i) => i.ClassName !== item.ClassName))
      }
    },
    [isLoggedIn]
  )

  const removeFromWatchlist = useCallback(
    async (className) => {
      if (!isLoggedIn) return

      // Otimista
      setItems((prev) => prev.filter((i) => i.ClassName !== className))

      try {
        const item = items.find((i) => i.ClassName === className)
        await removeSubscription(className, item?.hotel ?? 'br')
      } catch (err) {
        console.error('[Watchlist] Erro ao remover:', err.message)
      }
    },
    [isLoggedIn, items]
  )

  const toggleWatchlist = useCallback(
    (item) => {
      if (isWatching(item.ClassName)) removeFromWatchlist(item.ClassName)
      else addToWatchlist(item)
    },
    [isWatching, addToWatchlist, removeFromWatchlist]
  )

  const updateWatchlistItem = useCallback((className, newMarketData) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.ClassName !== className) return i
        const newPrice =
          newMarketData?.currentPrice ??
          (newMarketData?.history?.length > 0
            ? newMarketData.history[newMarketData.history.length - 1]?.[0]
            : null) ??
          newMarketData?.averagePrice ??
          i.basePrice
        return { ...i, basePrice: newPrice, marketData: newMarketData }
      })
    )
  }, [])

  const updateWatchlistConfig = useCallback(
    async (className, newConfig) => {
      if (!isLoggedIn) return

      // Otimista
      setItems((prev) =>
        prev.map((i) =>
          i.ClassName !== className
            ? i
            : { ...i, alertConfig: { ...i.alertConfig, ...newConfig } }
        )
      )

      try {
        const item = items.find((i) => i.ClassName === className)
        await updateAlertConfig(className, item?.hotel ?? 'br', newConfig)
      } catch (err) {
        console.error('[Watchlist] Erro ao atualizar config:', err.message)
      }
    },
    [isLoggedIn, items]
  )

  const clearWatchlist = useCallback(async () => {
    if (!isLoggedIn) return
    const snapshot = [...items]
    setItems([])
    try {
      await Promise.all(
        snapshot.map((i) => removeSubscription(i.ClassName, i.hotel))
      )
    } catch (err) {
      console.error('[Watchlist] Erro ao limpar:', err.message)
      setItems(snapshot) // reverte
    }
  }, [isLoggedIn, items])

  return {
    watchlist: items,
    loading,
    isWatching,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    updateWatchlistItem,
    updateWatchlistConfig,
    clearWatchlist,
    handlePriceChanged, // ← exposto para o HabbipApp conectar ao SSE
  }
}