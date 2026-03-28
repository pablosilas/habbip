import { useEffect, useRef } from "react"
import { getAccessToken } from "../services/authService"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

const RECONNECT_BASE_MS = 3000
const RECONNECT_MAX_MS = 30000

export function useSSE({ isLoggedIn, onPriceChanged, onStatusChange }) {
  const esRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const mountedRef = useRef(false)

  const onPriceChangedRef = useRef(onPriceChanged)
  const onStatusChangeRef = useRef(onStatusChange)

  useEffect(() => {
    onPriceChangedRef.current = onPriceChanged
  }, [onPriceChanged])

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange
  }, [onStatusChange])

  function emitStatus(status) {
    onStatusChangeRef.current?.(status)
  }

  function clearReconnectTimer() {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
  }

  function closeConnection() {
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }
  }

  function cleanup(resetAttempts = true) {
    clearReconnectTimer()
    closeConnection()

    if (resetAttempts) {
      reconnectAttemptsRef.current = 0
    }
  }

  function scheduleReconnect() {
    if (!mountedRef.current) return
    if (!isLoggedIn) return

    const token = getAccessToken()
    if (!token) {
      emitStatus("disconnected")
      return
    }

    clearReconnectTimer()

    const attempts = reconnectAttemptsRef.current
    const delay = Math.min(RECONNECT_BASE_MS * 2 ** attempts, RECONNECT_MAX_MS)

    reconnectAttemptsRef.current = attempts + 1
    emitStatus("reconnecting")

    console.log(`[SSE] Reconectando em ${delay}ms (tentativa ${attempts + 1})`)

    reconnectTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return
      if (!getAccessToken()) {
        emitStatus("disconnected")
        return
      }

      connect()
    }, delay)
  }

  function connect() {
    const token = getAccessToken()

    if (!mountedRef.current) return
    if (!isLoggedIn) return
    if (!token) {
      emitStatus("disconnected")
      return
    }

    clearReconnectTimer()
    closeConnection()

    emitStatus("connecting")

    const url = `${API_BASE}/stream?token=${encodeURIComponent(token)}`
    const es = new EventSource(url)
    esRef.current = es

    es.onopen = () => {
      console.log("[SSE] Conexão aberta")
      reconnectAttemptsRef.current = 0
      emitStatus("connected")
    }

    es.onmessage = (e) => {
      if (!e.data) return

      try {
        const event = JSON.parse(e.data)
        const clientReceivedAt = Date.now()

        switch (event.type) {
          case "connected":
            reconnectAttemptsRef.current = 0
            emitStatus("connected")
            break

          case "price_changed":
            onPriceChangedRef.current?.({
              ...event,
              clientReceivedAt,
            })
            break

          default:
            break
        }
      } catch (err) {
        console.error("[SSE] Erro ao processar mensagem:", err)
      }
    }

    es.onerror = () => {
      console.warn("[SSE] Erro na conexão — tentando reconectar...")
      closeConnection()
      scheduleReconnect()
    }
  }

  useEffect(() => {
    mountedRef.current = true

    if (!isLoggedIn) {
      emitStatus("disconnected")
      cleanup(true)
      return () => {
        mountedRef.current = false
        cleanup(true)
      }
    }

    connect()

    return () => {
      mountedRef.current = false
      emitStatus("disconnected")
      cleanup(true)
    }
  }, [isLoggedIn])

  return {
    reconnectNow: () => {
      if (!mountedRef.current) return
      reconnectAttemptsRef.current = 0
      connect()
    },
    disconnect: () => {
      emitStatus("disconnected")
      cleanup(true)
    },
  }
}