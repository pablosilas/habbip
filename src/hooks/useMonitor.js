import { useState, useReducer, useEffect, useCallback, useRef } from 'react'

const MAX_NOTIFICATIONS = 50

const initialState = { notifications: [], unreadCount: 0 }

function notifReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': {
      const serverNotifs = action.payload

      // Preserva notificações entregues via SSE que ainda não foram
      // persistidas no servidor (evita race condition entre addNotification e fetchUserData)
      const serverIds = new Set(serverNotifs.map((n) => n.id))
      const localOnly = state.notifications.filter((n) => !serverIds.has(n.id))

      const merged = [...localOnly, ...serverNotifs]
        .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
        .slice(0, MAX_NOTIFICATIONS)

      return {
        notifications: merged,
        unreadCount: merged.filter((n) => !n.read).length,
      }
    }
    case 'ADD': {
      const notif = action.payload
      const duplicate = state.notifications.some(
        (n) =>
          n.id === notif.id ||
          (n.className === notif.className &&
            n.oldPrice === notif.oldPrice &&
            n.newPrice === notif.newPrice)
      )
      if (duplicate) return state
      const notifications = [notif, ...state.notifications].slice(0, MAX_NOTIFICATIONS)
      return { notifications, unreadCount: state.unreadCount + 1 }
    }
    case 'MARK_ALL_READ':
      return {
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }
    case 'CLEAR':
      return initialState
    case 'REMOVE': {
      const notifications = state.notifications.filter((n) => n.id !== action.payload)
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      }
    }
    case 'REMOVE_BY_CLASSNAME': {
      const notifications = state.notifications.filter(
        (n) => n.className !== action.payload
      )
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      }
    }
    default:
      return state
  }
}

export function useMonitor({ serverData, markDirty, isLoggedIn }) {
  const [{ notifications, unreadCount }, dispatch] = useReducer(
    notifReducer,
    initialState
  )
  const hydrated = useRef(false)
  const skipNextSync = useRef(false)

  // Hidrata notificações do servidor (banco)
  useEffect(() => {
    if (!serverData || !isLoggedIn) return
    if (Array.isArray(serverData.notifications)) {
      skipNextSync.current = true
      hydrated.current = true
      dispatch({ type: 'HYDRATE', payload: serverData.notifications })
    }
  }, [serverData, isLoggedIn])

  // Sincroniza com servidor via markDirty
  useEffect(() => {
    if (!isLoggedIn || !hydrated.current) return
    if (skipNextSync.current) {
      skipNextSync.current = false
      return
    }
    markDirty?.('notifications', notifications)
  }, [notifications, isLoggedIn, markDirty])

  // Chamado pelo SSE via HabbipApp
  const addNotification = useCallback((notif) => {
    const stateAddedAt = Date.now()

    if (notif.detectedAt) {
      console.log(
        `[UI] ${notif.className}/${notif.hotel} detectado -> addNotification: ${stateAddedAt - notif.detectedAt}ms`
      )
    }

    if (notif.clientReceivedAt) {
      console.log(
        `[UI] ${notif.className}/${notif.hotel} browser -> addNotification: ${stateAddedAt - notif.clientReceivedAt}ms`
      )
    }

    dispatch({
      type: 'ADD',
      payload: {
        ...notif,
        stateAddedAt,
      },
    })
  }, [])

  const markAllRead = useCallback(() => dispatch({ type: 'MARK_ALL_READ' }), [])
  const clearNotifications = useCallback(() => dispatch({ type: 'CLEAR' }), [])
  const removeNotification = useCallback(
    (id) => dispatch({ type: 'REMOVE', payload: id }),
    []
  )

  const removeNotificationsByClassName = useCallback(
    (className) => dispatch({ type: 'REMOVE_BY_CLASSNAME', payload: className }),
    []
  )

  return {
    notifications,
    unreadCount,
    addNotification, // ← exposto para o HabbipApp
    markAllRead,
    clearNotifications,
    removeNotification,
    removeNotificationsByClassName
  }
}