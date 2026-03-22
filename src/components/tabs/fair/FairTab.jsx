import React from "react"
import FairResultCard from "../fair/FairResultCard"
import Button from "../../ui/Button"
import SearchHistoryDropdown from "../../ui/SearchHistoryDropdown"
import { useMobiHistory } from "../../../hooks/useSearchHistory"

export default function FairTab({
  mobiQuery,
  setMobiQuery,
  fairHotel,
  setFairHotel,
  fairDays,
  setFairDays,
  onSearch,
  loading,
  error,
  results,
  loggedUserName,
  expanded,
  setExpanded,
  creditRate,
  onSetCreditRate,
  onAddToInventory,
  isInInventory
}) {
  const [showDropdown, setShowDropdown] = React.useState(false)
  const [sortBy, setSortBy] = React.useState("price")
  const inputRef = React.useRef(null)

  const {
    history,
    favorites,
    addToHistory,
    removeFromHistory,
    clearHistory,
    toggleFavorite,
    isFavorite,
  } = useMobiHistory(loggedUserName)

  const lastSearchedTermRef = React.useRef(null)

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

  return (
    <div>
      <div
        className="flex items-center justify-between mb-2 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0 flex-1 mr-2">
          <div className="text-[#f4f4f4] font-bold text-[13px]">
            Feira Livre
          </div>
          <div className="text-[#d2d2d2] text-[11px] leading-4"
            title="Pesquise mobis, acompanhe preços, tendências e quantidade de ofertas."
          >
            Pesquise mobis, acompanhe preços, tendências e quantidade de ofertas.
          </div>
        </div>
        <span className="text-[#d2d2d2] text-[11px]">
          {expanded ? "▲ recolher" : "▼ expandir"}
        </span>
      </div>

      {expanded && (
        <form onSubmit={(e) => { e.preventDefault(); handleSearch() }}>
          {/* Input com dropdown de histórico */}
          <div className="relative mb-2">
            <input
              ref={inputRef}
              value={mobiQuery}
              onChange={(e) => setMobiQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") setShowDropdown(false) }}
              onFocus={() => { if (hasDropdownItems) setShowDropdown(true) }}
              onBlur={() => setShowDropdown(false)}
              placeholder="Digite o nome do mobi"
              className="w-full h-9 border border-[#c3c3c3] bg-[rgba(255,255,255,0.12)] px-2 text-[12px] text-white outline-none placeholder:text-[#d2d2d2]"
              inputMode="search"
              enterKeyHint="search"
            />

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
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <select
              value={fairHotel}
              onChange={(e) => setFairHotel(e.target.value)}
              className="w-full h-9 border border-[#c3c3c3] bg-[rgba(255,255,255,0.12)] px-2 text-[12px] text-white outline-none"
            >
              <option value="br" className="text-black">BR</option>
              <option value="com" className="text-black">COM</option>
              <option value="de" className="text-black">DE</option>
              <option value="es" className="text-black">ES</option>
              <option value="fi" className="text-black">FI</option>
              <option value="fr" className="text-black">FR</option>
              <option value="it" className="text-black">IT</option>
              <option value="nl" className="text-black">NL</option>
              <option value="tr" className="text-black">TR</option>
            </select>

            <select
              value={fairDays}
              onChange={(e) => setFairDays(e.target.value)}
              className="w-full h-9 border border-[#c3c3c3] bg-[rgba(255,255,255,0.12)] px-2 text-[12px] text-white outline-none"
            >
              <option value="all" className="text-black">Todos</option>
              <option value="7" className="text-black">7 dias</option>
              <option value="30" className="text-black">30 dias</option>
              <option value="90" className="text-black">90 dias</option>
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

      {error ? (
        <div className="text-[#ffd0d0] text-[12px] mb-3">{error}</div>
      ) : null}

      {results.length > 1 && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] text-[#aaa] uppercase tracking-wider shrink-0">Ordenar</span>
          <div className="flex gap-1 flex-wrap">
            {[
              { value: "price", label: "Preço" },
              { value: "trend", label: "Tendência" },
              { value: "offers", label: "Ofertas" }
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSortBy(value)}
                className={`px-2 py-[2px] text-[10px] font-bold border cursor-pointer transition-colors ${sortBy === value
                  ? "border-[#ffd64d] bg-[rgba(255,214,77,0.15)] text-[#ffd64d]"
                  : "border-[#555] text-[#888] hover:border-[#888] hover:text-[#ccc]"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2 pr-1">
        {[...results]
          .sort((a, b) => {
            const aHist = a.marketData?.history
            const bHist = b.marketData?.history
            const aLast = Array.isArray(aHist) && aHist.length ? aHist[aHist.length - 1] : null
            const bLast = Array.isArray(bHist) && bHist.length ? bHist[bHist.length - 1] : null
            const aPrev = Array.isArray(aHist) && aHist.length > 1 ? aHist[aHist.length - 2] : null
            const bPrev = Array.isArray(bHist) && bHist.length > 1 ? bHist[bHist.length - 2] : null

            if (sortBy === "price") return (bLast?.[0] ?? 0) - (aLast?.[0] ?? 0)
            if (sortBy === "trend") {
              const aDiff = (aLast?.[0] ?? 0) - (aPrev?.[0] ?? aLast?.[0] ?? 0)
              const bDiff = (bLast?.[0] ?? 0) - (bPrev?.[0] ?? bLast?.[0] ?? 0)
              return bDiff - aDiff
            }
            if (sortBy === "offers") return (b.marketData?.currentOpenOffers ?? bLast?.[3] ?? 0) - (a.marketData?.currentOpenOffers ?? aLast?.[3] ?? 0)
            return 0
          })
          .map((item, index) => {
            const favKey = item.ClassName || item.FurniName || String(index)
            return (
              <FairResultCard
                key={`${favKey}-${index}`}
                item={item}
                isFavorite={isFavorite(favKey)}
                onToggleFavorite={() => toggleFavorite(favKey)}
                creditRate={creditRate}
                onSetCreditRate={onSetCreditRate}
                onAddToInventory={onAddToInventory}
                isInInventory={isInInventory(item.ClassName)}
              />
            )
          })}

        {!loading && !results.length && !error && (
          <div className="text-[#e0e0e0] text-[12px]">
            Nenhum mobi encontrado.
          </div>
        )}
      </div>
    </div>
  )
}