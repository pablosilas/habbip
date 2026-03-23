import React from "react"
import FairResultCard from "../fair/FairResultCard"
import Button from "../../ui/Button"
import SearchInput from "../../ui/SearchInput"
import SearchHistoryDropdown from "../../ui/SearchHistoryDropdown"
import { useMobiHistory } from "../../../hooks/useSearchHistory"

export default function FairTab({
  mobiQuery,
  setMobiQuery,
  fairHotel,
  setFairHotel,
  onSearch,
  loading,
  error,
  results,
  expanded,
  setExpanded,
  creditRate,
  onSetCreditRate,
  onAddToInventory,
  isInInventory,
  isWatching = false,
  onToggleWatchlist,
  serverData,
  markDirty,
  isLoggedIn,
  onTriggerFly
}) {
  const [showDropdown, setShowDropdown] = React.useState(false)
  const [sortBy, setSortBy] = React.useState("price")
  const [filterQuery, setFilterQuery] = React.useState("")
  const inputRef = React.useRef(null)

  const {
    history,
    favorites,
    addToHistory,
    removeFromHistory,
    clearHistory,
    toggleFavorite,
    isFavorite,
  } = useMobiHistory(serverData, markDirty, isLoggedIn)

  const lastSearchedTermRef = React.useRef(null)

  // Limpa o filtro quando uma nova busca é feita
  React.useEffect(() => {
    setFilterQuery("")
  }, [results])

  React.useEffect(() => {
    if (results.length > 0 && lastSearchedTermRef.current) {
      const firstClassname = results[0]?.ClassName || null
      addToHistory({ term: lastSearchedTermRef.current, classname: firstClassname })
      lastSearchedTermRef.current = null
    }
  }, [addToHistory, results])

  function handleSearch() {
    inputRef.current?.blur()
    if (mobiQuery.trim()) lastSearchedTermRef.current = mobiQuery.trim()
    onSearch()
    setShowDropdown(false)
  }

  function handleSelectFromDropdown(term) {
    setMobiQuery(term)
    setShowDropdown(false)
    lastSearchedTermRef.current = term
    onSearch(term)
  }

  const hasDropdownItems = history.length > 0 || favorites.length > 0

  const sortedResults = [...results].sort((a, b) => {
    const aH = a.marketData?.history; const bH = b.marketData?.history
    const aL = Array.isArray(aH) && aH.length ? aH[aH.length - 1] : null
    const bL = Array.isArray(bH) && bH.length ? bH[bH.length - 1] : null
    const aP = Array.isArray(aH) && aH.length > 1 ? aH[aH.length - 2] : null
    const bP = Array.isArray(bH) && bH.length > 1 ? bH[bH.length - 2] : null
    if (sortBy === "price") return (bL?.[0] ?? 0) - (aL?.[0] ?? 0)
    if (sortBy === "trend") return ((bL?.[0] ?? 0) - (bP?.[0] ?? bL?.[0] ?? 0)) - ((aL?.[0] ?? 0) - (aP?.[0] ?? aL?.[0] ?? 0))
    if (sortBy === "offers") return (b.marketData?.currentOpenOffers ?? bL?.[3] ?? 0) - (a.marketData?.currentOpenOffers ?? aL?.[3] ?? 0)
    return 0
  })

  const filteredResults = filterQuery.trim()
    ? sortedResults.filter((item) =>
      item.FurniName?.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.ClassName?.toLowerCase().includes(filterQuery.toLowerCase())
    )
    : sortedResults

  return (
    <div>
      <div
        className="flex items-center justify-between mb-2 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0 flex-1 mr-2">
          <div className="text-[#f4f4f4] font-bold text-[13px]">Feira Livre</div>
          <div className="text-[#d2d2d2] text-[11px] leading-4">
            Pesquise mobis, acompanhe preços, tendências e quantidade de ofertas.
          </div>
        </div>
        <span className="text-[#d2d2d2] text-[11px]">{expanded ? "▲ recolher" : "▼ expandir"}</span>
      </div>

      {expanded && (
        <form onSubmit={(e) => { e.preventDefault(); handleSearch() }}>
          <div className="flex gap-2 mb-2">
            <div className="flex-1">
              <SearchInput
                inputRef={inputRef}
                value={mobiQuery}
                onChange={(e) => setMobiQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Escape") setShowDropdown(false) }}
                onFocus={() => { if (hasDropdownItems) setShowDropdown(true) }}
                onBlur={() => setShowDropdown(false)}
                placeholder="Digite o nome do mobi"
                inputMode="search"
                enterKeyHint="search"
              >
                <SearchHistoryDropdown
                  show={showDropdown}
                  history={history}
                  favorites={favorites}
                  onSelect={handleSelectFromDropdown}
                  onRemove={removeFromHistory}
                  onToggleFav={toggleFavorite}
                  isFavorite={isFavorite}
                  onClear={clearHistory}
                  showFurniImage
                />
              </SearchInput>
            </div>

            <select
              value={fairHotel}
              onChange={(e) => setFairHotel(e.target.value)}
              className="h-9 border border-[#c3c3c3] bg-[rgba(255,255,255,0.12)] px-2 text-[12px] text-white outline-none w-16"
            >
              {["br", "com", "de", "es", "fi", "fr", "it", "nl", "tr"].map(h => (
                <option key={h} value={h} className="text-black">{h.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Consultando..." : "Consultar feira"}
            </Button>
            <Button variant="secondary" type="button" onClick={() => setMobiQuery("")}>
              Limpar
            </Button>
          </div>
        </form>
      )}

      {error && <div className="text-[#ffd0d0] text-[12px] mb-3">{error}</div>}

      {results.length > 1 && (
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[10px] text-[#aaa] uppercase tracking-wider shrink-0">Ordenar</span>
          <div className="flex gap-1 flex-wrap flex-1">
            {[{ value: "price", label: "Preço" }, { value: "trend", label: "Tendência" }, { value: "offers", label: "Ofertas" }].map(({ value, label }) => (
              <button key={value} type="button" onClick={() => setSortBy(value)}
                className={`px-2 py-[2px] text-[10px] font-bold border cursor-pointer transition-colors ${sortBy === value ? "border-[#ffd64d] bg-[rgba(255,214,77,0.15)] text-[#ffd64d]" : "border-[#555] text-[#888] hover:border-[#888] hover:text-[#ccc]"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="w-full">
            <SearchInput
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={`Filtrar nos ${results.length} resultados...`}
              className="[&_input]:h-8 [&_input]:text-[11px] [&_input]:placeholder:text-[#666] [&_input]:border-[#555] [&_input]:bg-[rgba(255,255,255,0.06)]"
            />
          </div>
        </div>
      )}

      <div className="space-y-2 pr-1">
        {filteredResults.map((item, index) => {
          const favKey = item.ClassName || item.FurniName || String(index)
          return (
            <FairResultCard
              key={`${favKey}-${index}`}
              item={item}
              onTriggerFly={onTriggerFly}
              isFavorite={isFavorite(favKey)}
              onToggleFavorite={() => toggleFavorite(favKey)}
              creditRate={creditRate}
              onSetCreditRate={onSetCreditRate}
              onAddToInventory={onAddToInventory}
              isInInventory={isInInventory(item.ClassName)}
              isWatching={isWatching ? isWatching(item.ClassName) : false}
              onToggleWatchlist={onToggleWatchlist}
              isLoggedIn={isLoggedIn}
            />
          )
        })}
        {!loading && !filteredResults.length && filterQuery.trim() && (
          <div className="text-[#888] text-[12px]">
            Nenhum mobi encontrado para "{filterQuery}".
          </div>
        )}
        {!loading && !results.length && !error && (
          <div className="text-[#e0e0e0] text-[12px]">Nenhum mobi encontrado.</div>
        )}
      </div>
    </div>
  )
}