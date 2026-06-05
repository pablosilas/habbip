import React from "react"
import {
  register,
  login,
  logout,
  getStoredUser,
  clearSession,
  scheduleProactiveRefresh,
  cancelProactiveRefresh,
  fetchSubscriptionStatus,
} from "../services/authService"
import {
  fetchUserByName,
  fetchUserProfileById,
  fetchUserBadgesById,
  fetchUserGroupsById,
  fetchUserRoomsById,
} from "../services/habboApi"
import { migrateAnonDataOnRegister } from "../services/migrateLocalStorage"

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
  } catch { }
}

export function useAuth() {
  const [loggedUser, setLoggedUser] = React.useState(() => getStoredUser())
  const [loginModalOpen, setLoginModalOpen] = React.useState(false)
  const [authMode, setAuthMode] = React.useState("login")
  const [loginLoading, setLoginLoading] = React.useState(false)
  const [loginError, setLoginError] = React.useState("")

  const [subscriptionStatus, setSubscriptionStatus] = React.useState(null)
  const [subscriptionModalOpen, setSubscriptionModalOpen] = React.useState(false)

  React.useEffect(() => {
    const stored = getStoredUser()
    if (stored) scheduleProactiveRefresh()
    return () => cancelProactiveRefresh()
  }, [])

  React.useEffect(() => {
    function handleExpired() {
      setLoggedUser(null)
      setSubscriptionStatus(null)
      cancelProactiveRefresh()
      setLoginError("Sua sessão expirou. Faça login novamente.")
      setLoginModalOpen(true)
    }
    window.addEventListener("habbip:session-expired", handleExpired)
    return () => window.removeEventListener("habbip:session-expired", handleExpired)
  }, [])

  React.useEffect(() => {
    const stored = getStoredUser()
    if (stored?.habboNick && !stored?.habboProfile) {
      enrichWithHabboProfile(stored).then((enriched) => {
        setLoggedUser(enriched)
        storeEnrichedUser(enriched)
      })
    }
  }, [])

  async function checkSubscription() {
    try {
      const result = await fetchSubscriptionStatus()
      setSubscriptionStatus(result)
      if (result.status !== 'active') {
        setSubscriptionModalOpen(true)
      }
      return result
    } catch {
      return null
    }
  }

  const handleLogin = async ({ email, password }) => {
    setLoginLoading(true)
    setLoginError("")
    try {
      const user = await login({ email, password })
      const enriched = await enrichWithHabboProfile(user)
      storeEnrichedUser(enriched)
      setLoggedUser(enriched)
      scheduleProactiveRefresh()
      setLoginModalOpen(false)
      await checkSubscription()
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

  const handleRegister = async ({ email, habboNick, password }) => {
    setLoginLoading(true)
    setLoginError("")
    try {
      const user = await register({ email, habboNick, password })
      await migrateAnonDataOnRegister().catch(() => { })
      const enriched = await enrichWithHabboProfile(user)
      storeEnrichedUser(enriched)
      setLoggedUser(enriched)
      scheduleProactiveRefresh()
      setLoginModalOpen(false)
      setSubscriptionStatus({ status: 'none', expiresAt: null })
      setSubscriptionModalOpen(true)
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
    setSubscriptionStatus(null)
    setSubscriptionModalOpen(false)
    cancelProactiveRefresh()
    onAfterLogout?.()
  }

  const handleSubscriptionActivated = () => {
    setSubscriptionStatus({ status: 'active' })
    setSubscriptionModalOpen(false)
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
    subscriptionStatus,
    subscriptionModalOpen,
    setSubscriptionModalOpen,
    hasActiveSubscription: subscriptionStatus?.status === 'active',
    handleSubscriptionActivated,
    checkSubscription,
  }
}
