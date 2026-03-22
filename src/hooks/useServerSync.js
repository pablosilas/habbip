import React from "react"
import { fetchUserData, syncField, syncAllData } from "../services/authService"
import { migrateLocalStorage } from "../services/migrateLocalStorage"

const SYNC_DEBOUNCE_MS = 1500 // espera 1.5s sem mudanças antes de sincronizar

/**
 * useServerSync
 *
 * Carrega os dados do servidor ao logar e sincroniza mudanças de volta.
 * Retorna:
 *   serverData       — dados carregados do servidor (null enquanto carrega)
 *   loadingData      — true durante o carregamento inicial
 *   syncError        — erro de sincronização (string ou null)
 *   syncField        — função para sincronizar um campo específico agora
 *   markDirty        — marca um campo como "precisa sincronizar" (debounced)
 */
export function useServerSync(isLoggedIn) {
  const [serverData, setServerData] = React.useState(null)
  const [loadingData, setLoadingData] = React.useState(false)
  const [syncError, setSyncError] = React.useState(null)
  const dirtyRef = React.useRef({}) // { field: value } — campos pendentes
  const timerRef = React.useRef(null)
  const isLoggedInRef = React.useRef(isLoggedIn)

  React.useEffect(() => {
    isLoggedInRef.current = isLoggedIn
  }, [isLoggedIn])

  // Carrega dados do servidor ao logar
  React.useEffect(() => {
    if (!isLoggedIn) {
      setServerData(null)
      dirtyRef.current = {}
      clearTimeout(timerRef.current)
      return
    }

    setLoadingData(true)
    setSyncError(null)
    fetchUserData()
      .then(async (data) => {
        // Tenta migrar dados do localStorage legado (roda só uma vez)
        const storedUser = JSON.parse(localStorage.getItem("habbip:user") || "null")
        if (storedUser?.username) {
          await migrateLocalStorage(storedUser.username).catch(() => { })
        }
        setServerData(data)
      })
      .catch((err) => setSyncError(err.message))
      .finally(() => setLoadingData(false))
  }, [isLoggedIn])

  // Flush: envia todos os campos dirty para o servidor
  const flush = React.useCallback(async () => {
    if (!isLoggedInRef.current) return
    const toSync = { ...dirtyRef.current }
    if (Object.keys(toSync).length === 0) return
    dirtyRef.current = {}
    try {
      await syncAllData(toSync)
      setSyncError(null)
    } catch (err) {
      setSyncError(err.message)
      // Volta os campos para dirty se falhar
      dirtyRef.current = { ...toSync, ...dirtyRef.current }
    }
  }, [])

  // Marca campo como dirty e agenda flush debounced
  const markDirty = React.useCallback((field, value) => {
    if (!isLoggedInRef.current) return
    dirtyRef.current[field] = value
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(flush, SYNC_DEBOUNCE_MS)
  }, [flush])

  // Sincroniza imediatamente um campo específico (para ações críticas)
  const syncFieldNow = React.useCallback(async (field, value) => {
    if (!isLoggedInRef.current) return
    try {
      await syncField(field, value)
      setSyncError(null)
    } catch (err) {
      setSyncError(err.message)
    }
  }, [])

  // Flush ao desmontar / ao fazer logout
  React.useEffect(() => {
    return () => {
      clearTimeout(timerRef.current)
      // Tentativa best-effort de salvar na desmontagem
      if (isLoggedInRef.current && Object.keys(dirtyRef.current).length > 0) {
        syncAllData(dirtyRef.current).catch(() => { })
      }
    }
  }, [])

  return { serverData, loadingData, syncError, markDirty, syncFieldNow }
}