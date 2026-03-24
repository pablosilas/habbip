import React from "react"
import { searchMarketItems } from "../services/marketSearch"
import { debounce } from "../utils/debounce"

export function useFairSearch() {
  const [mobiQuery, setMobiQuery] = React.useState("")
  const [hotel, setHotel] = React.useState("br")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [results, setResults] = React.useState([])

  // ── Ref de parâmetros ────────────────────────────────────────────────────
  //
  // Problema original: handleSearch dependia de [mobiQuery, hotel] no
  // useCallback, então recriava a função a cada tecla digitada. Isso fazia
  // o useEffect recriar e cancelar o debounce prematuramente — uma busca
  // podia ser cancelada logo antes de disparar porque o usuário ainda estava
  // digitando e o debounce foi reiniciado.
  //
  // Solução: mobiQuery e hotel ficam numa ref sempre atualizada. A função de
  // busca (stableSearch) não tem dependências instáveis, então o debounce é
  // criado uma única vez e permanece estável durante toda a vida do componente.
  const searchParamsRef = React.useRef({ mobiQuery, hotel })
  const debouncedSearchRef = React.useRef(null)

  // Mantém a ref sincronizada com o estado mais recente
  React.useEffect(() => {
    searchParamsRef.current = { mobiQuery, hotel }
  }, [mobiQuery, hotel])

  // Limpa resultados e erros ao apagar a query
  React.useEffect(() => {
    if (!mobiQuery.trim()) {
      setResults([])
      setError("")
    }
  }, [mobiQuery])

  // ── Função de busca estável ──────────────────────────────────────────────
  //
  // Lê mobiQuery e hotel da ref em vez do closure, garantindo que sempre usa
  // os valores mais recentes sem precisar ser recriada quando eles mudam.
  // O argumento `term` permite disparar a busca com um valor externo (ex:
  // clique no dropdown do histórico) sem depender do estado do input.
  const stableSearch = React.useCallback(async (term) => {
    const { mobiQuery: currentQuery, hotel: currentHotel } = searchParamsRef.current
    const query = (term ?? currentQuery).trim()

    if (!query) {
      setError("Digite um nome para pesquisar o mobi.")
      setResults([])
      return
    }

    setLoading(true)
    setError("")
    setResults([])

    try {
      const items = await searchMarketItems({ query, hotel: currentHotel })

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
  }, []) // sem dependências — lê tudo via ref

  // ── Debounce criado uma única vez ────────────────────────────────────────
  //
  // Como stableSearch nunca muda, o debounce também nunca é recriado.
  // Isso garante que o timer de 500ms não é reiniciado desnecessariamente.
  React.useEffect(() => {
    debouncedSearchRef.current = debounce(stableSearch, 500)
    return () => debouncedSearchRef.current?.cancel()
  }, [stableSearch])

  // handleSearch é o que os componentes chamam — estável e seguro de passar
  // como prop sem causar re-renders em filhos memoizados.
  const handleSearch = React.useCallback((term) => {
    debouncedSearchRef.current?.(term)
  }, [])

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