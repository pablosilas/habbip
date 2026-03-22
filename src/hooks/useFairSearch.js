import React from "react"
import { searchMarketItems } from "../services/marketSearch"

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

  const handleSearch = async (term) => {
    const query = (term ?? mobiQuery).trim()

    if (!query) {
      setError("Digite um nome para pesquisar o mobi.")
      setResults([])
      return
    }

    setLoading(true)
    setError("")
    setResults([])

    try {
      const items = await searchMarketItems({ query, hotel, days })

      if (items.length === 0) {
        setError("Nenhum mobi encontrado.")
        return
      }

      setResults(items)
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
    setError,
    results,
    setResults,
    handleSearch,
  }
}