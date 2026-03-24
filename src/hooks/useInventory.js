import { useState, useCallback, useEffect, useRef } from "react"
import { searchMarketItems } from "../services/marketSearch"

export function useInventory(serverData, markDirty, isLoggedIn) {
  const [items, setItems] = useState([])
  const [query, setQuery] = useState("")
  const [hotel, setHotel] = useState("br")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [searchKey, setSearchKey] = useState(0)
  const hydrated = useRef(false)

  // ── Ref de parâmetros ────────────────────────────────────────────────────
  //
  // Problema original: handleSearch tinha [query, hotel] no useCallback,
  // recriando a função a cada tecla digitada. Componentes filhos que recebiam
  // handleSearch como prop sofriam re-renders desnecessários a cada caractere
  // digitado, mesmo que a busca ainda não tivesse sido disparada.
  //
  // Solução: query e hotel ficam numa ref sempre sincronizada. handleSearch
  // não tem dependências instáveis e tem identidade estável durante todo o
  // ciclo de vida do componente.
  const searchParamsRef = useRef({ query, hotel })

  // Mantém a ref sincronizada com o estado mais recente
  useEffect(() => {
    searchParamsRef.current = { query, hotel }
  }, [query, hotel])

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

  // ── addToInventory declarado antes de handleSearch ────────────────────────
  //
  // handleSearch chama addToInventory diretamente quando há resultado único,
  // então precisa estar disponível via ref para evitar dependência circular.
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

  // Ref para addToInventory — permite que handleSearch a chame sem dependência
  const addToInventoryRef = useRef(addToInventory)
  useEffect(() => { addToInventoryRef.current = addToInventory }, [addToInventory])

  // ── handleSearch estável ─────────────────────────────────────────────────
  //
  // Lê query e hotel da ref, não do closure. O argumento `term` permite
  // disparar a busca com um valor externo (ex: clique no dropdown do histórico)
  // sem depender do estado do input.
  const handleSearch = useCallback(async (term) => {
    const { query: currentQuery, hotel: currentHotel } = searchParamsRef.current
    const q = (term ?? currentQuery).trim()

    if (!q) { setError("Digite o nome ou classname do mobi."); return }

    setLoading(true)
    setError("")
    setSearchResults([])
    setSearchKey((v) => v + 1)

    try {
      const filtered = await searchMarketItems({ query: q, hotel: currentHotel })

      if (filtered.length === 0) { setError("Nenhum mobi encontrado."); return }

      if (filtered.length === 1) {
        addToInventoryRef.current(filtered[0])
        setQuery("")
      } else {
        setSearchResults(filtered)
      }
    } catch (err) {
      setError(err.message || "Erro ao buscar mobi.")
    } finally {
      setLoading(false)
    }
  }, []) // sem dependências — lê tudo via ref

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