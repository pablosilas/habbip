import { useState, useEffect, useCallback } from "react"

const MAX_HISTORY = 10

function resolveUserKey(loggedUserName) {
  if (!loggedUserName?.trim()) return "anonymous"
  return loggedUserName.trim().toLowerCase().replace(/\s+/g, "_")
}

function buildKeys(type, userKey) {
  return {
    historyKey: `habbodesk:${userKey}:history:${type}`,
    favoritesKey: `habbodesk:${userKey}:favorites:${type}`,
  }
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch { /* empty */ }
}

// Extrai o termo de busca de uma entrada (string simples ou objeto { term, ... })
export function getEntryTerm(entry) {
  if (!entry) return ""
  return typeof entry === "string" ? entry : entry.term ?? ""
}

// ─── Hook genérico interno ────────────────────────────────────────────────────

function useStoredList(historyKey, favoritesKey) {
  const [activeKeys, setActiveKeys] = useState({ historyKey, favoritesKey })
  const [history, setHistory] = useState(() => loadJSON(historyKey, []))
  const [favorites, setFavorites] = useState(() => loadJSON(favoritesKey, []))

  if (
    activeKeys.historyKey !== historyKey ||
    activeKeys.favoritesKey !== favoritesKey
  ) {
    setActiveKeys({ historyKey, favoritesKey })
    setHistory(loadJSON(historyKey, []))
    setFavorites(loadJSON(favoritesKey, []))
  }

  useEffect(() => { saveJSON(historyKey, history) }, [history, historyKey])
  useEffect(() => { saveJSON(favoritesKey, favorites) }, [favorites, favoritesKey])

  /**
   * Adiciona ao histórico.
   * entry pode ser string simples ou objeto { term, classname, ... }
   */
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

  const isFavorite = useCallback(
    (term) => favorites.includes(term),
    [favorites]
  )

  return {
    history,
    favorites,
    addToHistory,
    removeFromHistory,
    clearHistory,
    toggleFavorite,
    isFavorite,
  }
}

// ─── Hooks públicos ───────────────────────────────────────────────────────────

export function useMobiHistory(loggedUserName) {
  const userKey = resolveUserKey(loggedUserName)
  const { historyKey, favoritesKey } = buildKeys("mobi", userKey)
  return useStoredList(historyKey, favoritesKey)
}

export function useUserHistory(loggedUserName) {
  const userKey = resolveUserKey(loggedUserName)
  const { historyKey, favoritesKey } = buildKeys("user", userKey)
  return useStoredList(historyKey, favoritesKey)
}