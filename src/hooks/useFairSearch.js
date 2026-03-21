import React from "react"
import {
  fetchMarketHistory,
  fetchOfficialMarketBatch,
  mergeOfficialMarketData,
} from "../services/habboApi"

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
      // ── Etapa 1: busca na API legada para descobrir classnames e FurniType ──
      const searchParam = isClassname(query)
        ? { classname: query, hotel, days }
        : { name: query, hotel, days }

      const legacyData = await fetchMarketHistory(searchParam)

      const legacyItems = (Array.isArray(legacyData) ? legacyData : []).filter((item) => {
        // Mantém apenas itens que tenham ao menos ClassName para a próxima etapa
        return !!item?.ClassName?.trim()
      })

      if (legacyItems.length === 0) {
        setResults([])
        return
      }

      // ── Etapa 2: monta o batch com classnames + FurniType e consulta a API oficial ──
      const batchItems = legacyItems.map((item) => ({
        classname: item.ClassName,
        // FurniType vindo da API legada: "wallItem" ou "roomItem"
        furniType: item.FurniType === "wallItem" ? "wallItem" : "roomItem",
      }))

      let officialBatch = null
      try {
        officialBatch = await fetchOfficialMarketBatch(batchItems, hotel)
      } catch {
        // Se a API oficial falhar, continua com os dados legados
      }

      // ── Etapa 3: mescla os dados oficiais nos itens legados ──
      const merged = officialBatch
        ? mergeOfficialMarketData(legacyItems, officialBatch)
        : legacyItems

      // ── Etapa 4: filtra itens sem dados úteis de mercado ──
      const filtered = merged.filter((item) => {
        const history = item?.marketData?.history
        const averagePrice = item?.marketData?.averagePrice

        if (Array.isArray(history) && history.length > 0) {
          const hasValidHistory = history.some((entry) => (entry?.[0] ?? 0) > 0)
          if (hasValidHistory) return true
        }

        return averagePrice && averagePrice > 0
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
    setResults,
    handleSearch,
  }
}