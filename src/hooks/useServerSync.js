import React from "react"
import { fetchUserData, syncField, syncAllData } from "../services/authService"
import { migrateLocalStorage } from "../services/migrateLocalStorage"

const SYNC_DEBOUNCE_MS = 1500

export function useServerSync(isLoggedIn) {
  const [serverData, setServerData] = React.useState(null)
  const [loadingData, setLoadingData] = React.useState(false)
  const [syncError, setSyncError] = React.useState(null)
  const dirtyRef = React.useRef({})
  const timerRef = React.useRef(null)
  const isLoggedInRef = React.useRef(isLoggedIn)

  React.useEffect(() => {
    isLoggedInRef.current = isLoggedIn
  }, [isLoggedIn])

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
        const storedUser = JSON.parse(localStorage.getItem("habbip:user") || "null")
        if (storedUser?.username) {
          await migrateLocalStorage(storedUser.username).catch(() => { })
        }
        setServerData(data)
      })
      .catch((err) => setSyncError(err.message))
      .finally(() => setLoadingData(false))
  }, [isLoggedIn])

  React.useEffect(() => {
    function handleRefreshed() {
      if (!isLoggedInRef.current) return
      setLoadingData(true)
      setSyncError(null)
      fetchUserData()
        .then((data) => setServerData(data))
        .catch((err) => setSyncError(err.message))
        .finally(() => setLoadingData(false))
    }

    window.addEventListener("habbip:session-refreshed", handleRefreshed)
    return () => window.removeEventListener("habbip:session-refreshed", handleRefreshed)
  }, [])

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
      dirtyRef.current = { ...toSync, ...dirtyRef.current }
    }
  }, [])

  const markDirty = React.useCallback((field, value) => {
    if (!isLoggedInRef.current) return
    dirtyRef.current[field] = value
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(flush, SYNC_DEBOUNCE_MS)
  }, [flush])

  const syncFieldNow = React.useCallback(async (field, value) => {
    if (!isLoggedInRef.current) return
    try {
      await syncField(field, value)
      setSyncError(null)
    } catch (err) {
      setSyncError(err.message)
    }
  }, [])

  // Atualiza serverData em memória imediatamente E agenda sync com servidor.
  // Use para ações críticas onde o componente pode desmontar antes do debounce
  // (ex: limpar histórico e trocar de aba logo em seguida).
  const updateLocalData = React.useCallback((field, value) => {
    setServerData((prev) => prev ? { ...prev, [field]: value } : prev)
    if (!isLoggedInRef.current) return
    dirtyRef.current[field] = value
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(flush, SYNC_DEBOUNCE_MS)
  }, [flush])

  React.useEffect(() => {
    return () => {
      clearTimeout(timerRef.current)
      if (isLoggedInRef.current && Object.keys(dirtyRef.current).length > 0) {
        syncAllData(dirtyRef.current).catch(() => { })
      }
    }
  }, [])

  return { serverData, loadingData, syncError, markDirty, syncFieldNow, updateLocalData }
}