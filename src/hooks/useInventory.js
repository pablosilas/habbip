import { useState, useCallback, useEffect, useRef } from "react"
import {
  fetchMarketHistory,
  fetchOfficialMarketBatch,
  mergeOfficialMarketData,
} from "../services/habboApi"

const isClassname = (query) => query.trim().includes("_")

export function useInventory(serverData, markDirty, isLoggedIn) {
  const [items, setItems] = useState([])
  const [query, setQuery] = useState("")
  const [hotel, setHotel] = useState("br")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [searchKey, setSearchKey] = useState(0)
  const hydrated = useRef(false)

  // Hidrata o estado a partir dos dados do servidor
  useEffect(() => {
    if (!serverData || !isLoggedIn) return
    if (Array.isArray(serverData.inventory)) {
      setItems(serverData.inventory)
      hydrated.current = true
    }
  }, [serverData, isLoggedIn])

  // Sincroniza com o servidor sempre que items mudar (após hidratar)
  useEffect(() => {
    if (!isLoggedIn || !hydrated.current) return
    markDirty?.("inventory", items)
  }, [items, isLoggedIn, markDirty])

  useEffect(() => {
    setSearchResults([])
    setError("")
  }, [query])

  const handleSearch = useCallback(async (term) => {
    const q = (term ?? query).trim()
    if (!q) { setError("Digite o nome ou classname do mobi."); return }

    setLoading(true)
    setError("")
    setSearchResults([])
    setSearchKey((v) => v + 1)

    try {
      const searchParam = isClassname(q)
        ? { classname: q, hotel, days: "all" }
        : { name: q, hotel, days: "all" }

      const legacyData = await fetchMarketHistory(searchParam)
      const legacyItems = (Array.isArray(legacyData) ? legacyData : []).filter(
        (item) => !!item?.ClassName?.trim()
      )

      if (legacyItems.length === 0) { setError("Nenhum mobi encontrado."); return }

      const batchItems = legacyItems.map((item) => ({
        classname: item.ClassName,
        furniType: item.FurniType === "wallItem" ? "wallItem" : "roomItem",
      }))

      let officialBatch = null
      try { officialBatch = await fetchOfficialMarketBatch(batchItems, hotel) } catch { }

      const merged = officialBatch ? mergeOfficialMarketData(legacyItems, officialBatch) : legacyItems

      const filtered = merged.filter((item) => {
        const history = item?.marketData?.history
        const averagePrice = item?.marketData?.averagePrice
        if (Array.isArray(history) && history.length > 0) {
          if (history.some((entry) => (entry?.[0] ?? 0) > 0)) return true
        }
        return averagePrice && averagePrice > 0
      })

      if (filtered.length === 0) { setError("Nenhum mobi com dados de preço encontrado."); return }

      if (filtered.length === 1) { addToInventory(filtered[0]); setQuery("") }
      else setSearchResults(filtered)
    } catch (err) {
      setError(err.message || "Erro ao buscar mobi.")
    } finally {
      setLoading(false)
    }
  }, [query, hotel])

  const addToInventory = useCallback((found) => {
    setItems((prev) => {
      const existing = prev.findIndex((i) => i.ClassName === found.ClassName)
      if (existing !== -1) {
        const updated = [...prev]
        updated[existing] = { ...updated[existing], qty: updated[existing].qty + 1 }
        return updated
      }
      return [...prev, { ...found, qty: 1 }]
    })
    setSearchResults([])
    setQuery("")
  }, [])

  const cancelSearch = useCallback(() => { setSearchResults([]); setError("") }, [])
  const updateQty = useCallback((className, delta) => {
    setItems((prev) => prev.map((item) =>
      item.ClassName === className ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ))
  }, [])
  const setQty = useCallback((className, value) => {
    const n = parseInt(value, 10)
    if (isNaN(n) || n < 1) return
    setItems((prev) => prev.map((item) =>
      item.ClassName === className ? { ...item, qty: n } : item
    ))
  }, [])
  const removeItem = useCallback((className) => {
    setItems((prev) => prev.filter((item) => item.ClassName !== className))
  }, [])
  const clearInventory = useCallback(() => setItems([]), [])

  const totalItems = items.length
  const totalUnits = items.reduce((acc, i) => acc + i.qty, 0)
  const totalValue = items.reduce((acc, i) => {
    const history = i?.marketData?.history || []
    const price = i?.marketData?.currentPrice
      ?? (history.length > 0 ? history[history.length - 1]?.[0] : null)
      ?? i?.marketData?.averagePrice ?? 0
    return acc + price * i.qty
  }, 0)

  return {
    items, query, setQuery, hotel, setHotel, loading, error, setError,
    searchResults, handleSearch, addToInventory, cancelSearch,
    updateQty, setQty, removeItem, clearInventory,
    totalItems, totalUnits, totalValue, searchKey,
  }
}