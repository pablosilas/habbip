import { useState, useEffect, useCallback, useRef } from "react"

const MAX_HISTORY = 10

export function getEntryTerm(entry) {
  if (!entry) return ""
  return typeof entry === "string" ? entry : entry.term ?? ""
}

// ── Hook interno com suporte a servidor ─────────────────────────────────────

function useHistoryStore(serverData, fieldKey, markDirty, isLoggedIn) {
  const [history, setHistory] = useState(() => {
    if (!isLoggedIn) return []
    try {
      const raw = localStorage.getItem(`habbip:anon:history:${fieldKey}`)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })
  const [favorites, setFavorites] = useState(() => {
    if (!isLoggedIn) return []
    try {
      const raw = localStorage.getItem(`habbip:anon:favorites:${fieldKey}`)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })
  const hydrated = useRef(false)

  // Quando os dados do servidor chegarem, substitui o estado local
  useEffect(() => {
    if (!serverData || !isLoggedIn) return
    const d = serverData[fieldKey]
    if (!d) return
    setHistory(Array.isArray(d.history) ? d.history : [])
    setFavorites(Array.isArray(d.favorites) ? d.favorites : [])
    hydrated.current = true
  }, [serverData, fieldKey, isLoggedIn])

  // Persiste no localStorage para anônimos
  useEffect(() => {
    if (isLoggedIn) return
    try {
      localStorage.setItem(`habbip:anon:history:${fieldKey}`, JSON.stringify(history))
      localStorage.setItem(`habbip:anon:favorites:${fieldKey}`, JSON.stringify(favorites))
    } catch { }
  }, [history, favorites, fieldKey, isLoggedIn])

  // Sincroniza com servidor quando logado
  useEffect(() => {
    if (!isLoggedIn || !hydrated.current) return
    markDirty?.(fieldKey, { history, favorites })
  }, [history, favorites, isLoggedIn, fieldKey, markDirty])

  const addToHistory = useCallback((entry) => {
    const term = getEntryTerm(entry) || (typeof entry === "string" ? entry : "")
    if (!term?.trim()) return
    setHistory((prev) => {
      const filtered = prev.filter((h) => getEntryTerm(h).toLowerCase() !== term.toLowerCase())
      return [entry, ...filtered].slice(0, MAX_HISTORY)
    })
  }, [])

  const removeFromHistory = useCallback((term) => {
    setHistory((prev) => prev.filter((h) => getEntryTerm(h) !== term))
  }, [])

  const clearHistory = useCallback(() => setHistory([]), [])

  const toggleFavorite = useCallback((term) => {
    if (!term?.trim()) return
    setFavorites((prev) =>
      prev.includes(term) ? prev.filter((f) => f !== term) : [term, ...prev]
    )
  }, [])

  const isFavorite = useCallback((term) => favorites.includes(term), [favorites])

  return { history, favorites, addToHistory, removeFromHistory, clearHistory, toggleFavorite, isFavorite }
}

// ── Hooks públicos ────────────────────────────────────────────────────────────

export function useMobiHistory(serverData, markDirty, isLoggedIn) {
  return useHistoryStore(serverData, "mobi_history", markDirty, isLoggedIn)
}

export function useUserHistory(serverData, markDirty, isLoggedIn) {
  return useHistoryStore(serverData, "user_history", markDirty, isLoggedIn)
}

export function useInventoryHistory(serverData, markDirty, isLoggedIn) {
  return useHistoryStore(serverData, "inv_history", markDirty, isLoggedIn)
}