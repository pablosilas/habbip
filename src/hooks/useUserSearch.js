import React from "react"
import { fetchUserByName, fetchUserProfileById } from "../services/habboApi"

async function buildFullUserProfile(nick) {
  const basicUser = await fetchUserByName(nick)

  if (!basicUser?.uniqueId) {
    throw new Error("Usuário não encontrado.")
  }

  try {
    const profileData = await fetchUserProfileById(basicUser.uniqueId)
    return { ...basicUser, ...profileData }
  } catch {
    return basicUser
  }
}

export function useUserSearch() {
  const [nickQuery, setNickQuery] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [searchedUser, setSearchedUser] = React.useState(null)

  React.useEffect(() => {
    if (!nickQuery.trim()) {
      setSearchedUser(null)
      setError("")
    }
  }, [nickQuery])

  const handleSearch = async (term) => {
    // Se vier um term externo (ex: clique no dropdown), usa ele.
    // Caso contrário, lê do state normalmente.
    const query = term ?? nickQuery

    if (!query.trim()) {
      setError("Digite o nick do usuário.")
      setSearchedUser(null)
      return
    }

    setLoading(true)
    setError("")
    setSearchedUser(null)

    try {
      const fullUser = await buildFullUserProfile(query.trim())
      setSearchedUser(fullUser)
    } catch (err) {
      setError(err.message || "Erro ao buscar usuário.")
    } finally {
      setLoading(false)
    }
  }

  return {
    nickQuery,
    setNickQuery,
    loading,
    error,
    searchedUser,
    handleSearch,
    buildFullUserProfile,
  }
}