import { useReducer, useEffect, useCallback, useRef } from "react"

const MAX_HISTORY = 4

export function getEntryTerm(entry) {
  if (!entry) return ""
  return typeof entry === "string" ? entry : entry.term ?? ""
}

function makeInitialState(fieldKey, isLoggedIn) {
  if (isLoggedIn) return { history: [], favorites: [] }
  try {
    const h = localStorage.getItem(`habbip:anon:history:${fieldKey}`)
    const f = localStorage.getItem(`habbip:anon:favorites:${fieldKey}`)
    return {
      history: h ? JSON.parse(h) : [],
      favorites: f ? JSON.parse(f) : [],
    }
  } catch {
    return { history: [], favorites: [] }
  }
}

function historyReducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return {
        history: Array.isArray(action.payload.history) ? action.payload.history : [],
        favorites: Array.isArray(action.payload.favorites) ? action.payload.favorites : [],
      }
    case "ADD_TO_HISTORY": {
      const { entry, term } = action.payload
      const filtered = state.history.filter(
        (h) => getEntryTerm(h).toLowerCase() !== term.toLowerCase()
      )
      return { ...state, history: [entry, ...filtered].slice(0, MAX_HISTORY) }
    }
    case "REMOVE_FROM_HISTORY":
      return {
        ...state,
        history: state.history.filter((h) => getEntryTerm(h) !== action.payload),
      }
    case "CLEAR_HISTORY":
      return { ...state, history: [] }
    case "TOGGLE_FAVORITE": {
      // payload pode ser string (legado) ou objeto { term, classname, ... }
      const entry = action.payload
      const term = getEntryTerm(entry) || (typeof entry === "string" ? entry : "")
      const exists = state.favorites.some((f) => getEntryTerm(f) === term)
      return {
        ...state,
        favorites: exists
          ? state.favorites.filter((f) => getEntryTerm(f) !== term)
          // Guarda o objeto completo — preserva classname para a imagem no dropdown
          : [entry, ...state.favorites],
      }
    }
    default:
      return state
  }
}

function useHistoryStore(serverData, fieldKey, markDirty, isLoggedIn, updateLocalData) {
  const [{ history, favorites }, dispatch] = useReducer(
    historyReducer,
    undefined,
    () => makeInitialState(fieldKey, isLoggedIn)
  )

  const hydrated = useRef(false)
  const skipNextSync = useRef(false)

  const favoritesRef = useRef(favorites)
  useEffect(() => {
    favoritesRef.current = favorites
  }, [favorites])

  useEffect(() => {
    if (!serverData || !isLoggedIn) return
    const d = serverData[fieldKey]
    if (!d) return
    skipNextSync.current = true
    hydrated.current = true
    dispatch({ type: "HYDRATE", payload: d })
  }, [serverData, fieldKey, isLoggedIn])

  // IMPORTANTE: `isLoggedIn` removido das deps intencionalmente.
  // Evita sobrescrever o localStorage anônimo com dados do usuário logado no logout.
  useEffect(() => {
    if (isLoggedIn) return
    try {
      localStorage.setItem(`habbip:anon:history:${fieldKey}`, JSON.stringify(history))
      localStorage.setItem(`habbip:anon:favorites:${fieldKey}`, JSON.stringify(favorites))
    } catch { /* empty */ }
  }, [history, favorites, fieldKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isLoggedIn || !hydrated.current) return
    if (skipNextSync.current) {
      skipNextSync.current = false
      return
    }
    markDirty?.(fieldKey, { history, favorites })
  }, [history, favorites, isLoggedIn, fieldKey, markDirty])

  const prevIsLoggedInRef = useRef(isLoggedIn)
  useEffect(() => {
    const wasLoggedIn = prevIsLoggedInRef.current
    prevIsLoggedInRef.current = isLoggedIn

    if (!wasLoggedIn && isLoggedIn) {
      dispatch({ type: "HYDRATE", payload: { history: [], favorites: [] } })
      hydrated.current = false
      return
    }

    if (wasLoggedIn && !isLoggedIn) {
      try {
        const h = localStorage.getItem(`habbip:anon:history:${fieldKey}`)
        const f = localStorage.getItem(`habbip:anon:favorites:${fieldKey}`)
        dispatch({
          type: "HYDRATE",
          payload: {
            history: h ? JSON.parse(h) : [],
            favorites: f ? JSON.parse(f) : [],
          },
        })
      } catch {
        dispatch({ type: "HYDRATE", payload: { history: [], favorites: [] } })
      }
      hydrated.current = false
    }
  }, [isLoggedIn, fieldKey])

  const addToHistory = useCallback((entry) => {
    const term = getEntryTerm(entry) || (typeof entry === "string" ? entry : "")
    if (!term?.trim()) return
    dispatch({ type: "ADD_TO_HISTORY", payload: { entry, term } })
  }, [])

  const removeFromHistory = useCallback((term) => {
    dispatch({ type: "REMOVE_FROM_HISTORY", payload: term })
  }, [])

  const clearHistory = useCallback(() => {
    dispatch({ type: "CLEAR_HISTORY" })
    updateLocalData?.(fieldKey, { history: [], favorites: favoritesRef.current })
  }, [fieldKey, updateLocalData])

  // Aceita string (legado) ou objeto completo { term, classname, ... }
  const toggleFavorite = useCallback((entry) => {
    const term = getEntryTerm(entry) || (typeof entry === "string" ? entry : "")
    if (!term?.trim()) return
    dispatch({ type: "TOGGLE_FAVORITE", payload: entry })
  }, [])

  // isFavorite recebe só o term (string) para comparação simples
  const isFavorite = useCallback(
    (term) => favorites.some((f) => getEntryTerm(f) === term),
    [favorites]
  )

  return { history, favorites, addToHistory, removeFromHistory, clearHistory, toggleFavorite, isFavorite }
}

export function useMobiHistory(serverData, markDirty, isLoggedIn, updateLocalData) {
  return useHistoryStore(serverData, "mobi_history", markDirty, isLoggedIn, updateLocalData)
}

export function useUserHistory(serverData, markDirty, isLoggedIn, updateLocalData) {
  return useHistoryStore(serverData, "user_history", markDirty, isLoggedIn, updateLocalData)
}

export function useInventoryHistory(serverData, markDirty, isLoggedIn, updateLocalData) {
  return useHistoryStore(serverData, "inv_history", markDirty, isLoggedIn, updateLocalData)
}