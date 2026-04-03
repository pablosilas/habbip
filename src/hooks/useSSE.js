import { useEffect, useRef } from "react"
import { getAccessToken, refreshAccessToken } from "../services/authService"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

const RECONNECT_BASE_MS = 3000
const RECONNECT_MAX_MS = 30000

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    // margem de 30s para compensar dessincronismo de relógio
    return payload.exp ? payload.exp * 1000 <= Date.now() + 30_000 : false
  } catch {
    return true
  }
}

export function useSSE({ isLoggedIn, onPriceChanged, onStatusChange }) {
  const esRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const consecutiveErrorsRef = useRef(0)
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
      consecutiveErrorsRef.current = 0
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
      connect()
    }, delay)
  }

  async function connect() {
    if (!mountedRef.current) return
    if (!isLoggedIn) return

    let token = getAccessToken()
    if (!token) {
      emitStatus("disconnected")
      return
    }

    // Se o token já expirou (com margem de 30s), renova antes de abrir o EventSource
    if (isTokenExpired(token)) {
      console.log("[SSE] Token expirado antes de conectar — renovando...")
      try {
        token = await refreshAccessToken()
      } catch (err) {
        console.warn("[SSE] Falha ao renovar token:", err.message)
        emitStatus("disconnected")
        return
      }
    }

    if (!mountedRef.current) return

    clearReconnectTimer()
    closeConnection()
    emitStatus("connecting")

    const url = `${API_BASE}/stream?token=${encodeURIComponent(token)}`
    const es = new EventSource(url)
    esRef.current = es

    es.onopen = () => {
      console.log("[SSE] Conexão aberta")
      reconnectAttemptsRef.current = 0
      consecutiveErrorsRef.current = 0
      emitStatus("connected")
      // Dispara re-fetch dos dados para pegar notificações perdidas durante desconexão
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("habbip:sse-reconnected"))
      }, 1500)
    }

    es.onmessage = (e) => {
      if (!e.data) return

      try {
        const event = JSON.parse(e.data)
        const clientReceivedAt = Date.now()

        switch (event.type) {
          case "connected":
            reconnectAttemptsRef.current = 0
            consecutiveErrorsRef.current = 0
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
      consecutiveErrorsRef.current += 1
      closeConnection()

      // Após 2 erros consecutivos, força refresh do token antes de reconectar
      // (cobre casos de token rejeitado pelo servidor mesmo sem expirar localmente)
      if (consecutiveErrorsRef.current >= 2) {
        console.warn("[SSE] Erros consecutivos — forçando refresh do token...")
        refreshAccessToken()
          .catch(() => {
            if (mountedRef.current) emitStatus("disconnected")
          })
          .finally(() => {
            if (mountedRef.current) scheduleReconnect()
          })
      } else {
        scheduleReconnect()
      }
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

    // Quando o token for renovado, reconecta o SSE com o token novo
    function handleSessionRefreshed() {
      if (!mountedRef.current) return
      console.log("[SSE] Token renovado — reconectando...")
      reconnectAttemptsRef.current = 0
      consecutiveErrorsRef.current = 0
      connect()
    }

    // Quando o usuário volta para a aba, verifica se o SSE ainda está ativo
    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") return
      if (!mountedRef.current || !isLoggedIn) return

      if (!esRef.current || esRef.current.readyState === EventSource.CLOSED) {
        console.log("[SSE] Aba voltou ao foco — reconectando...")
        reconnectAttemptsRef.current = 0
        consecutiveErrorsRef.current = 0
        connect()
      }
    }

    window.addEventListener("habbip:session-refreshed", handleSessionRefreshed)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      mountedRef.current = false
      emitStatus("disconnected")
      cleanup(true)
      window.removeEventListener("habbip:session-refreshed", handleSessionRefreshed)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isLoggedIn])

  return {
    reconnectNow: () => {
      if (!mountedRef.current) return
      reconnectAttemptsRef.current = 0
      consecutiveErrorsRef.current = 0
      connect()
    },
    disconnect: () => {
      emitStatus("disconnected")
      cleanup(true)
    },
  }
}