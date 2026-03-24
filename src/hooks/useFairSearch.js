import React from "react"
import { searchMarketItems } from "../services/marketSearch"
import { debounce } from "../utils/debounce"

export function useFairSearch() {
  const [mobiQuery, setMobiQuery] = React.useState("")
  const [hotel, setHotel] = React.useState("br")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [results, setResults] = React.useState([])

  // ── Todas as refs juntas no topo ──────────────────────────────────────────
  const searchParamsRef = React.useRef({ mobiQuery, hotel })
  const debouncedSearchRef = React.useRef(null)
  const hasResultsRef = React.useRef(false)
  const lastSearchRef = React.useRef(Date.now())

  React.useEffect(() => {
    searchParamsRef.current = { mobiQuery, hotel }
  }, [mobiQuery, hotel])

  React.useEffect(() => {
    hasResultsRef.current = results.length > 0
  }, [results.length])

  React.useEffect(() => {
    if (!mobiQuery.trim()) {
      setResults([])
      setError("")
    }
  }, [mobiQuery])

  const stableSearch = React.useCallback(async (term) => {
    const { mobiQuery: currentQuery, hotel: currentHotel } = searchParamsRef.current
    const query = (term ?? currentQuery).trim()

    if (!query) {
      setError("Digite um nome para pesquisar o mobi.")
      setResults([])
      return
    }

    lastSearchRef.current = Date.now()
    setLoading(true)
    setError("")

    try {
      const items = await searchMarketItems({ query, hotel: currentHotel })

      if (items.length === 0) {
        setError("Nenhum mobi encontrado.")
        setResults([])
        return
      }

      setResults((prev) => {
        if (prev.length === 0) return items

        let changed = false
        const merged = prev.map((old) => {
          const fresh = items.find((i) => i.ClassName === old.ClassName)
          if (!fresh) return old

          const oldPrice = old?.marketData?.currentPrice
          const newPrice = fresh?.marketData?.currentPrice
          const oldAvg = old?.marketData?.averagePrice
          const newAvg = fresh?.marketData?.averagePrice
          const oldOffers = old?.marketData?.currentOpenOffers
          const newOffers = fresh?.marketData?.currentOpenOffers

          if (oldPrice !== newPrice || oldAvg !== newAvg || oldOffers !== newOffers) {
            changed = true
            return { ...fresh, _updatedAt: Date.now() }
          }

          return old
        })

        const hasNew = items.some((i) => !prev.find((p) => p.ClassName === i.ClassName))
        if (hasNew) {
          changed = true
          return items.map((fresh) => {
            const old = prev.find((p) => p.ClassName === fresh.ClassName)
            return old ? { ...fresh, _updatedAt: old._updatedAt } : fresh
          })
        }

        return changed ? merged : prev
      })
    } catch (err) {
      setError(err.message || "Erro ao consultar a feira.")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    debouncedSearchRef.current = debounce(stableSearch, 500)
    return () => debouncedSearchRef.current?.cancel()
  }, [stableSearch])

  const handleSearch = React.useCallback((term) => {
    debouncedSearchRef.current?.(term)
  }, [])

  React.useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastSearch = Date.now() - lastSearchRef.current
      if (
        hasResultsRef.current &&
        document.visibilityState === "visible" &&
        timeSinceLastSearch > 20000
      ) {
        stableSearch()
      }
    }, 20000)
    return () => clearInterval(interval)
  }, [stableSearch])

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
    handleSearch,
  }
}