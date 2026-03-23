import { useReducer, useEffect, useCallback, useRef } from "react"

const MAX_HISTORY = 4

export function getEntryTerm(entry) {
  if (!entry) return ""
  return typeof entry === "string" ? entry : entry.term ?? ""
}

// ── Reducer para history + favorites ─────────────────────────────────────────
//
// history e favorites sempre mudam juntos na hydratação — com dois useState
// separados isso gerava dois renders encadeados e o warning de setState em
// cascata dentro do useEffect de hydratação.
//
// useReducer unifica os dois em um único estado atômico: cada dispatch produz
// exatamente um render, independente de quantos campos mudam.

function makeInitialState(fieldKey, isLoggedIn) {
  if (!isLoggedIn) return { history: [], favorites: [] }
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

// ── Hook interno com suporte a servidor ──────────────────────────────────────

function useHistoryStore(serverData, fieldKey, markDirty, isLoggedIn) {
  const [{ history, favorites }, dispatch] = useReducer(
    historyReducer,
    // Estado inicial calculado uma única vez via função init — lê localStorage
    // para anônimos sem recalcular a cada render
    undefined,
    () => makeInitialState(fieldKey, isLoggedIn)
  )

  const hydrated = useRef(false)
  const skipNextSync = useRef(false)

  // Hydratação a partir do servidor — dispatch atômico, render único.
  //
  // skipNextSync evita que o useEffect de sync logo abaixo envie de volta ao
  // servidor os mesmos dados que acabaram de vir dele.
  useEffect(() => {
    if (!serverData || !isLoggedIn) return
    const d = serverData[fieldKey]
    if (!d) return
    skipNextSync.current = true
    hydrated.current = true
    dispatch({ type: "HYDRATE", payload: d })
  }, [serverData, fieldKey, isLoggedIn])

  // Persiste no localStorage para usuários anônimos
  useEffect(() => {
    if (isLoggedIn) return
    try {
      localStorage.setItem(`habbip:anon:history:${fieldKey}`, JSON.stringify(history))
      localStorage.setItem(`habbip:anon:favorites:${fieldKey}`, JSON.stringify(favorites))
    } catch { /* empty */ }
  }, [history, favorites, fieldKey, isLoggedIn])

  // Sincroniza com servidor quando logado.
  // Não executa antes da hydratação para não sobrescrever dados do servidor
  // com o estado local inicial. Pula a execução imediatamente após a hydratação
  // (skipNextSync) para não fazer write com os dados recém-recebidos.
  useEffect(() => {
    if (!isLoggedIn || !hydrated.current) return
    if (skipNextSync.current) {
      skipNextSync.current = false
      return
    }
    markDirty?.(fieldKey, { history, favorites })
  }, [history, favorites, isLoggedIn, fieldKey, markDirty])

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
  }, [])

  const toggleFavorite = useCallback((term) => {
    if (!term?.trim()) return
    dispatch({ type: "TOGGLE_FAVORITE", payload: term })
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