import React from "react"
import { fetchMarketHistory } from "../services/habboApi"

export function useFairSearch() {
  const [mobiQuery, setMobiQuery] = React.useState("")
  const [hotel, setHotel] = React.useState("br")
  const [days, setDays] = React.useState("all")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [results, setResults] = React.useState([])

  React.useEffect(() => {
    if (!mobiQuery.trim()) {
      setResults([])
      setError("")
    }
  }, [mobiQuery])

  const isClassname = (query) => query.trim().includes("_")

  const handleSearch = async (term) => {
    // Se vier um term externo (ex: clique no dropdown), usa ele.
    // Caso contrário, lê do state normalmente.
    const query = term ?? mobiQuery

    if (!query.trim()) {
      setError("Digite um nome para pesquisar o mobi.")
      setResults([])
      return
    }

    setLoading(true)
    setError("")
    setResults([])

    try {
      const searchParam = isClassname(query)
        ? { classname: query, hotel, days }
        : { name: query, hotel, days }

      const data = await fetchMarketHistory(searchParam)

      const filtered = (Array.isArray(data) ? data : []).filter((item) => {
        const history = item?.marketData?.history
        const averagePrice = item?.marketData?.averagePrice

        if (!Array.isArray(history) || history.length === 0) return false

        const hasValidHistory = history.some((entry) => entry?.[0] > 0)
        const hasAverage = averagePrice && averagePrice > 0

        return hasValidHistory || hasAverage
      })

      setResults(filtered)
    } catch (err) {
      setError(err.message || "Erro ao consultar a feira.")
    } finally {
      setLoading(false)
    }
  }

  return {
    mobiQuery,
    setMobiQuery,
    hotel,
    setHotel,
    days,
    setDays,
    loading,
    error,
    results,
    handleSearch,
  }
}