import React from "react"

const STORAGE_KEYS = {
  loggedUser: "habbodesk_logged_user",
  anonymousSkipLogin: "habbodesk_anonymous_skip_login",
}

export function useAuth(buildFullUserProfile) {
  const [loggedUser, setLoggedUser] = React.useState(null)
  const [loginModalOpen, setLoginModalOpen] = React.useState(false)
  const [loginLoading, setLoginLoading] = React.useState(false)
  const [loginError, setLoginError] = React.useState("")

  React.useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.loggedUser)
    const anonymousSkipLogin = localStorage.getItem(STORAGE_KEYS.anonymousSkipLogin)

    if (savedUser) {
      try {
        setLoggedUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem(STORAGE_KEYS.loggedUser)
        setLoginModalOpen(true)
      }
      return
    }

    if (anonymousSkipLogin === "true") {
      setLoginModalOpen(false)
      return
    }

    setLoginModalOpen(true)
  }, [])

  const handleLoginWithNick = async (nick) => {
    setLoginLoading(true)
    setLoginError("")

    try {
      const fullUser = await buildFullUserProfile(nick)
      setLoggedUser(fullUser)
      localStorage.setItem(STORAGE_KEYS.loggedUser, JSON.stringify(fullUser))
      localStorage.removeItem(STORAGE_KEYS.anonymousSkipLogin)
      setLoginModalOpen(false)
    } catch (err) {
      setLoginError(err.message || "Não foi possível entrar com esse nick.")
    } finally {
      setLoginLoading(false)
    }
  }

  const handleContinueAnonymous = ({ doNotAskAgain }) => {
    setLoggedUser(null)
    localStorage.removeItem(STORAGE_KEYS.loggedUser)

    if (doNotAskAgain) {
      localStorage.setItem(STORAGE_KEYS.anonymousSkipLogin, "true")
    } else {
      localStorage.removeItem(STORAGE_KEYS.anonymousSkipLogin)
    }

    setLoginError("")
    setLoginModalOpen(false)
  }

  const handleLogout = (onAfterLogout) => {
    setLoggedUser(null)
    localStorage.removeItem(STORAGE_KEYS.loggedUser)
    localStorage.removeItem(STORAGE_KEYS.anonymousSkipLogin)
    onAfterLogout?.()
    setLoginModalOpen(true)
  }

  return {
    loggedUser,
    loginModalOpen,
    setLoginModalOpen,
    loginLoading,
    loginError,
    handleLoginWithNick,
    handleContinueAnonymous,
    handleLogout,
  }
}