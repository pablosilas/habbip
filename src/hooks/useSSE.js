import { useEffect, useRef } from "react"
import { getAccessToken } from "../services/authService"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

export function useSSE({ isLoggedIn, onPriceChanged }) {
  const esRef = useRef(null)
  const onPriceChangedRef = useRef(onPriceChanged)

  useEffect(() => {
    onPriceChangedRef.current = onPriceChanged
  }, [onPriceChanged])

  useEffect(() => {
    if (!isLoggedIn) {
      esRef.current?.close()
      esRef.current = null
      return
    }

    const token = getAccessToken()
    if (!token) return

    if (esRef.current) return

    const url = `${API_BASE}/stream?token=${encodeURIComponent(token)}`
    const es = new EventSource(url)

    es.onmessage = (e) => {
      if (!e.data || e.data.startsWith(":")) return

      try {
        const event = JSON.parse(e.data)
        const clientReceivedAt = Date.now()

        if (event.type === "price_changed") {
          onPriceChangedRef.current?.({
            ...event,
            clientReceivedAt,
          })
        }
      } catch (err) {
        console.error("[SSE] Erro ao processar mensagem:", err)
      }
    }

    es.onerror = () => {
      console.warn("[SSE] Erro na conexão")
    }

    esRef.current = es

    return () => {
      es.close()
      esRef.current = null
    }
  }, [isLoggedIn])
}