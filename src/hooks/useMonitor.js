import { useState, useReducer, useEffect, useCallback, useRef } from "react"
import {
  fetchMarketHistory,
  fetchOfficialMarketBatch,
  mergeOfficialMarketData,
} from "../services/habboApi"

const POLL_INTERVAL_MS = 5 * 60 * 1000
const MAX_NOTIFICATIONS = 50

// ─── Reducer para notifications + unreadCount ─────────────────────────────────
//
// notifications e unreadCount sempre mudam juntos — toda operação (hydrate, add,
// markAllRead, clear, remove) precisava atualizar os dois estados separadamente,
// gerando dois renders por ação e causando o warning de setState em cascata.
//
// useReducer resolve isso: cada dispatch é uma única atualização atômica que
// produz um único render, independente de quantos campos do estado mudam.

const initialNotifState = { notifications: [], unreadCount: 0 }

function notifReducer(state, action) {
  switch (action.type) {
    case "HYDRATE": {
      const notifications = action.payload
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      }
    }
    case "ADD": {
      const notif = action.payload
      const duplicate = state.notifications.some(
        (n) => n.id === notif.id || (
          n.className === notif.className &&
          n.oldPrice === notif.oldPrice &&
          n.newPrice === notif.newPrice
        )
      )
      if (duplicate) return state
      const notifications = [notif, ...state.notifications].slice(0, MAX_NOTIFICATIONS)
      return { notifications, unreadCount: state.unreadCount + 1 }
    }
    case "MARK_ALL_READ": {
      return {
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }
    }
    case "CLEAR":
      return initialNotifState
    case "REMOVE": {
      const notifications = state.notifications.filter((n) => n.id !== action.payload)
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      }
    }
    default:
      return state
  }
}

export function useMonitor({ watchlist, updateWatchlistItem, serverData, markDirty, isLoggedIn }) {
  const [{ notifications, unreadCount }, dispatch] = useReducer(notifReducer, initialNotifState)
  const [isPolling, setIsPolling] = useState(false)
  const timerRef = useRef(null)
  const initialPollRef = useRef(null)
  const pollingRef = useRef(false)
  const hydrated = useRef(false)
  const skipNextSync = useRef(false)
  const isLoggedInRef = useRef(isLoggedIn)

  // ─── Refs para evitar dependências instáveis que mudam a cada render ──────
  //
  // Problema original: watchlist era dependência direta de pollAll/checkItem.
  // Cada chamada a updateWatchlistItem recriava o array watchlist, o que
  // recriava checkItem e pollAll, e por sua vez re-disparava o useEffect de
  // agendamento — reiniciando o setInterval a cada item verificado.
  //
  // Solução: acessar watchlist e updateWatchlistItem sempre pela ref, mantendo
  // pollAll e checkItem com identidade estável durante toda a vida do componente.
  const watchlistRef = useRef(watchlist)
  const updateWatchlistItemRef = useRef(updateWatchlistItem)

  useEffect(() => { isLoggedInRef.current = isLoggedIn }, [isLoggedIn])
  useEffect(() => { watchlistRef.current = watchlist }, [watchlist])
  useEffect(() => { updateWatchlistItemRef.current = updateWatchlistItem }, [updateWatchlistItem])

  // Hidrata notificações do servidor — dispatch é atômico, render único
  useEffect(() => {
    if (!serverData || !isLoggedIn) return
    if (Array.isArray(serverData.notifications)) {
      skipNextSync.current = true
      hydrated.current = true
      dispatch({ type: "HYDRATE", payload: serverData.notifications })
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
    dispatch({ type: "ADD", payload: notif })
  }, [])

  const markAllRead = useCallback(() => {
    dispatch({ type: "MARK_ALL_READ" })
  }, [])

  const clearNotifications = useCallback(() => {
    dispatch({ type: "CLEAR" })
  }, [])

  const removeNotification = useCallback((id) => {
    dispatch({ type: "REMOVE", payload: id })
  }, [])

  // checkItem lê watchlist e updateWatchlistItem pelas refs — identidade estável
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
      } catch { /* empty */ }

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
        // Atualiza via ref — não recria checkItem nem pollAll
        updateWatchlistItemRef.current(watchedItem.ClassName, found.marketData)
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

      // Atualiza via ref — não recria checkItem nem pollAll
      updateWatchlistItemRef.current(watchedItem.ClassName, found.marketData)
    } catch { /* empty */ }
  }, [addNotification]) // removido updateWatchlistItem das deps — acessa pela ref

  // pollAll lê a watchlist pela ref — identidade estável, não recria ao mudar itens
  const pollAll = useCallback(async () => {
    if (pollingRef.current || watchlistRef.current.length === 0) return
    pollingRef.current = true
    setIsPolling(true)

    for (const item of watchlistRef.current) {
      await checkItem(item)
      await new Promise((r) => setTimeout(r, 500))
    }

    pollingRef.current = false
    setIsPolling(false)
  }, [checkItem]) // checkItem é estável, então pollAll também é estável

  // Agendamento do polling
  //
  // Antes: dependia de [watchlist.length, pollAll]. Como pollAll era recriado
  // a cada mudança de watchlist (inclusive por updateWatchlistItem), o intervalo
  // era cancelado e reiniciado constantemente durante uma varredura ativa.
  //
  // Agora: depende apenas de [watchlist.length, pollAll]. pollAll é estável,
  // então o efeito só re-executa quando itens são adicionados ou removidos da
  // watchlist — que é o único momento em que faz sentido reconfigurar o intervalo.
  //
  // pollAll() não é chamado diretamente no corpo do efeito porque internamente
  // ele chama setIsPolling(true), o que causaria um setState síncrono dentro
  // de um efeito — gerando renders em cascata. O setTimeout(..., 0) adia a
  // chamada para fora do ciclo síncrono de commit do React.
  useEffect(() => {
    clearInterval(timerRef.current)
    clearTimeout(initialPollRef.current)

    if (watchlist.length === 0) return

    initialPollRef.current = setTimeout(pollAll, 0)
    timerRef.current = setInterval(pollAll, POLL_INTERVAL_MS)

    return () => {
      clearInterval(timerRef.current)
      clearTimeout(initialPollRef.current)
    }
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