import { useEffect, useRef, useCallback } from 'react'
import { getAccessToken } from '../services/authService'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export function useSSE({ isLoggedIn, onPriceChanged }) {
  const esRef = useRef(null)
  const onPriceChangedRef = useRef(onPriceChanged)
  const retryRef = useRef(null)

  useEffect(() => {
    onPriceChangedRef.current = onPriceChanged
  }, [onPriceChanged])

  const disconnect = useCallback(() => {
    clearTimeout(retryRef.current)
    esRef.current?.close()
    esRef.current = null
  }, [])

  const connect = useCallback(() => {
    if (!isLoggedIn) return
    const token = getAccessToken()
    if (!token) return

    disconnect()

    const url = `${API_BASE}/stream?token=${encodeURIComponent(token)}`
    const es = new EventSource(url)

      es.onmessage = (e) => {
      if (!e.data || e.data.startsWith(':')) return

      try {
        const event = JSON.parse(e.data)
        const clientReceivedAt = Date.now()

        if (event.type === 'price_changed') {
          const enrichedEvent = {
            ...event,
            clientReceivedAt,
          }

          if (event.detectedAt) {
            console.log(
              `[Front] ${event.className}/${event.hotel} detectado -> browser: ${clientReceivedAt - event.detectedAt}ms`
            )
          }

          if (event.publishAt) {
            console.log(
              `[Front] ${event.className}/${event.hotel} publish -> browser: ${clientReceivedAt - event.publishAt}ms`
            )
          }

          if (event.sseSentAt) {
            console.log(
              `[Front] ${event.className}/${event.hotel} SSE write -> browser: ${clientReceivedAt - event.sseSentAt}ms`
            )
          }

          onPriceChangedRef.current?.(enrichedEvent)
        }
      } catch {}
    }

    es.onerror = () => {
      es.close()
      esRef.current = null
      // Reconecta após 5s
      retryRef.current = setTimeout(connect, 5000)
    }

    esRef.current = es
  }, [isLoggedIn, disconnect])

  useEffect(() => {
    if (isLoggedIn) {
      connect()
    } else {
      disconnect()
    }
    return disconnect
  }, [isLoggedIn, connect, disconnect])
}