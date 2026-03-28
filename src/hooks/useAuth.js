import React from "react"
import {
  register,
  login,
  logout,
  getStoredUser,
  clearSession,
  scheduleProactiveRefresh,
  cancelProactiveRefresh,
} from "../services/authService"
import {
  fetchUserByName,
  fetchUserProfileById,
  fetchUserBadgesById,
  fetchUserGroupsById,
  fetchUserRoomsById,
} from "../services/habboApi"
import { migrateAnonDataOnRegister } from "../services/migrateLocalStorage"

// Busca tudo: dados básicos + profile + badges + groups + rooms
async function enrichWithHabboProfile(user) {
  if (!user?.habboNick) return user
  try {
    const basicUser = await fetchUserByName(user.habboNick)
    if (!basicUser?.uniqueId) return user

    const id = basicUser.uniqueId

    const [profileData, badges, groups, rooms] = await Promise.allSettled([
      fetchUserProfileById(id),
      fetchUserBadgesById(id),
      fetchUserGroupsById(id),
      fetchUserRoomsById(id),
    ])

    const habboProfile = {
      ...basicUser,
      ...(profileData.status === "fulfilled" ? profileData.value : {}),
      badges: badges.status === "fulfilled" ? (badges.value ?? []) : [],
      groups: groups.status === "fulfilled" ? (groups.value ?? []) : [],
      rooms: rooms.status === "fulfilled" ? (rooms.value ?? []) : [],
    }

    return { ...user, habboProfile }
  } catch {
    return user
  }
}

function storeEnrichedUser(user) {
  try {
    localStorage.setItem("habbip:user", JSON.stringify(user))
  } catch { /* empty */ }
}

export function useAuth() {
  const [loggedUser, setLoggedUser] = React.useState(() => getStoredUser())
  // Modal começa FECHADO — usuário entra direto como anônimo
  const [loginModalOpen, setLoginModalOpen] = React.useState(false)
  const [authMode, setAuthMode] = React.useState("login")
  const [loginLoading, setLoginLoading] = React.useState(false)
  const [loginError, setLoginError] = React.useState("")

  React.useEffect(() => {
    const stored = getStoredUser()
    if (stored) scheduleProactiveRefresh()
    return () => cancelProactiveRefresh()
  }, [])

  // Não abre modal automaticamente ao carregar — removido o useEffect anterior

  React.useEffect(() => {
    function handleExpired() {
      setLoggedUser(null)
      cancelProactiveRefresh()
      setLoginError("Sua sessão expirou. Faça login novamente.")
      setLoginModalOpen(true)
    }
    window.addEventListener("habbip:session-expired", handleExpired)
    return () => window.removeEventListener("habbip:session-expired", handleExpired)
  }, [])

  // Se já tem sessão salva mas sem perfil completo, busca em background
  React.useEffect(() => {
    const stored = getStoredUser()
    if (stored?.habboNick && !stored?.habboProfile) {
      enrichWithHabboProfile(stored).then((enriched) => {
        setLoggedUser(enriched)
        storeEnrichedUser(enriched)
      })
    }
  }, [])

  const handleLogin = async ({ habboNick, password }) => {
    setLoginLoading(true)
    setLoginError("")
    try {
      const user = await login({ habboNick, password })
      const enriched = await enrichWithHabboProfile(user)
      storeEnrichedUser(enriched)
      setLoggedUser(enriched)
      scheduleProactiveRefresh()
      setLoginModalOpen(false)
      return enriched
    } catch (err) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setLoginError("Não foi possível conectar ao servidor. Verifique sua conexão.")
      } else {
        setLoginError(err.message || "Erro ao fazer login.")
      }
      return null
    } finally {
      setLoginLoading(false)
    }
  }

  const handleRegister = async ({ habboNick, password }) => {
    setLoginLoading(true)
    setLoginError("")
    try {
      const user = await register({ habboNick, password })
      // Migra dados anônimos (inventário local) para a conta recém-criada
      await migrateAnonDataOnRegister().catch(() => { })
      const enriched = await enrichWithHabboProfile(user)
      storeEnrichedUser(enriched)
      setLoggedUser(enriched)
      scheduleProactiveRefresh()
      setLoginModalOpen(false)
      return enriched
    } catch (err) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setLoginError("Não foi possível conectar ao servidor. Verifique sua conexão.")
      } else {
        setLoginError(err.message || "Erro ao criar conta.")
      }
      return null
    } finally {
      setLoginLoading(false)
    }
  }

  const handleContinueAnonymous = () => {
    setLoggedUser(null)
    clearSession()
    setLoginError("")
    setLoginModalOpen(false)
  }

  const handleLogout = async (onAfterLogout) => {
    await logout()
    setLoggedUser(null)
    cancelProactiveRefresh()
    onAfterLogout?.()
    // Não reabre o modal — usuário fica anônimo naturalmente
  }

  return {
    loggedUser,
    setLoggedUser,
    loginModalOpen,
    setLoginModalOpen,
    authMode,
    setAuthMode,
    loginLoading,
    loginError,
    setLoginError,
    handleLogin,
    handleRegister,
    handleContinueAnonymous,
    handleLogout,
    isLoggedIn: !!loggedUser,
  }
}