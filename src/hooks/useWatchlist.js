import { useState, useCallback, useEffect } from "react"

function resolveKey(loggedUserName) {
  if (!loggedUserName?.trim()) return "habbodesk:anonymous:watchlist"
  return `habbodesk:${loggedUserName.trim().toLowerCase().replace(/\s+/g, "_")}:watchlist`
}

function loadWatchlist(loggedUserName) {
  try {
    const raw = localStorage.getItem(resolveKey(loggedUserName))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveWatchlist(loggedUserName, items) {
  try {
    localStorage.setItem(resolveKey(loggedUserName), JSON.stringify(items))
  } catch { /* empty */ }
}

/**
 * useWatchlist
 *
 * Gerencia a lista de mobis monitorados por usuário.
 * Cada entrada armazena o item completo + o preço no momento em que foi adicionado.
 *
 * Estrutura de um item na watchlist:
 * {
 *   ClassName: string,
 *   FurniName: string,
 *   FurniType: string,
 *   hotel: string,           // hotel_domain do item
 *   basePrice: number,       // preço no momento da adição
 *   addedAt: number,         // timestamp ms
 *   marketData: object,      // snapshot dos dados de mercado
 * }
 */
export function useWatchlist(loggedUserName) {
  const [items, setItems] = useState(() => loadWatchlist(loggedUserName))

  // Recarrega ao trocar de usuário
  useEffect(() => {
    setItems(loadWatchlist(loggedUserName))
  }, [loggedUserName])

  // Persiste sempre que items mudar
  useEffect(() => {
    saveWatchlist(loggedUserName, items)
  }, [items, loggedUserName])

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
      item?.marketData?.averagePrice ??
      0

    setItems((prev) => {
      if (prev.some((i) => i.ClassName === item.ClassName)) return prev
      return [
        ...prev,
        {
          ClassName: item.ClassName,
          FurniName: item.FurniName,
          FurniType: item.FurniType,
          hotel: item.hotel_domain ?? "br",
          basePrice: price,
          addedAt: Date.now(),
          marketData: item.marketData ?? null,
        },
      ]
    })
  }, [])

  const removeFromWatchlist = useCallback((className) => {
    setItems((prev) => prev.filter((i) => i.ClassName !== className))
  }, [])

  const toggleWatchlist = useCallback(
    (item) => {
      if (isWatching(item.ClassName)) {
        removeFromWatchlist(item.ClassName)
      } else {
        addToWatchlist(item)
      }
    },
    [isWatching, addToWatchlist, removeFromWatchlist]
  )

  /**
   * Atualiza os dados de mercado e o preço base de um item monitorado.
   * Chamado pelo useMonitor após buscar novos dados.
   */
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
        return {
          ...i,
          basePrice: newPrice,
          marketData: newMarketData,
        }
      })
    )
  }, [])

  return {
    watchlist: items,
    isWatching,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    updateWatchlistItem,
  }
}