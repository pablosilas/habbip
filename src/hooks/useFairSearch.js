import React from "react"
import { searchMarketItems } from "../services/marketSearch"
import { debounce } from "../utils/debounce"

export function useFairSearch() {
  const [mobiQuery, setMobiQuery] = React.useState("")
  const [hotel, setHotel] = React.useState("br")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [results, setResults] = React.useState([])

  // Cria a versão debounced do handleSearch (500ms delay)
  const debouncedSearchRef = React.useRef(null)

  React.useEffect(() => {
    if (!mobiQuery.trim()) {
      setResults([])
      setError("")
    }
  }, [mobiQuery])

  const handleSearch = React.useCallback(async (term) => {
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
      const items = await searchMarketItems({ query, hotel })

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
  }, [mobiQuery, hotel])

  // Cria debounce com cleanup
  React.useEffect(() => {
    debouncedSearchRef.current = debounce(handleSearch, 500)
    return () => debouncedSearchRef.current?.cancel()
  }, [handleSearch])

  const debouncedSearch = React.useCallback(
    (term) => debouncedSearchRef.current?.(term),
    []
  )

  return {
    mobiQuery,
    setMobiQuery,
    hotel,
    setHotel,
    loading,
    error,
    setError,
    results,
    setResults,
    handleSearch: debouncedSearch,
  }
}