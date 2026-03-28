import { useReducer, useEffect, useCallback, useRef } from "react"

const MAX_HISTORY = 4

export function getEntryTerm(entry) {
  if (!entry) return ""
  return typeof entry === "string" ? entry : entry.term ?? ""
}

function makeInitialState(fieldKey, isLoggedIn) {
  // Anônimo: lê do localStorage imediatamente (histórico local persiste entre sessões)
  // Logado: começa vazio — será hidratado pelo servidor via useEffect
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
      const term = action.payload
      const exists = state.favorites.includes(term)
      return {
        ...state,
        favorites: exists
          ? state.favorites.filter((f) => f !== term)
          : [term, ...state.favorites],
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

  // Sempre aponta para o favorites atual sem precisar de dependência no callback
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

  useEffect(() => {
    if (isLoggedIn) return
    try {
      localStorage.setItem(`habbip:anon:history:${fieldKey}`, JSON.stringify(history))
      localStorage.setItem(`habbip:anon:favorites:${fieldKey}`, JSON.stringify(favorites))
    } catch { /* empty */ }
  }, [history, favorites, fieldKey, isLoggedIn])

  useEffect(() => {
    if (!isLoggedIn || !hydrated.current) return
    if (skipNextSync.current) {
      skipNextSync.current = false
      return
    }
    markDirty?.(fieldKey, { history, favorites })
  }, [history, favorites, isLoggedIn, fieldKey, markDirty])

  // Gerencia transições de autenticação — mantém históricos separados
  const prevIsLoggedInRef = useRef(isLoggedIn)
  useEffect(() => {
    const wasLoggedIn = prevIsLoggedInRef.current
    prevIsLoggedInRef.current = isLoggedIn

    // Transição anônimo → logado: limpa estado (servidor vai hidratar em seguida)
    if (!wasLoggedIn && isLoggedIn) {
      dispatch({ type: "HYDRATE", payload: { history: [], favorites: [] } })
      hydrated.current = false
      return
    }

    // Transição logado → deslogado: restaura histórico anônimo do localStorage
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
    // Atualiza serverData em memória imediatamente para que ao trocar de aba
    // (desmonta/remonta o hook) a hydratação não restaure o histórico antigo
    updateLocalData?.(fieldKey, { history: [], favorites: favoritesRef.current })
  }, [fieldKey, updateLocalData])

  const toggleFavorite = useCallback((term) => {
    if (!term?.trim()) return
    dispatch({ type: "TOGGLE_FAVORITE", payload: term })
  }, [])

  const isFavorite = useCallback((term) => favorites.includes(term), [favorites])

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