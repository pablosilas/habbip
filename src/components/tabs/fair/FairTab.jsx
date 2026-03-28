import React from "react"
import FairGridCard from "../fair/FairGridCard"
import FairDetailModal from "../../modals/FairDetailModal"
import Button from "../../ui/Button"
import SearchInput from "../../ui/SearchInput"
import SearchHistoryDropdown from "../../ui/SearchHistoryDropdown"
import AlertConfigModal from "../../modals/AlertConfigModal"
import { useMobiHistory } from "../../../hooks/useSearchHistory"
import { searchMarketItems } from "../../../services/marketSearch"
import traxIcon from "../../../assets/trax.png"
import plasticIcon from "../../../assets/plastic.png"
import HotelSelect from "../../ui/HotelSelect"

// ── Categorias ────────────────────────────────────────────────────────────────
const FAIR_CATEGORIES = [
  {
    id: "cartuchos",
    label: "Cartuchos",
    icon: traxIcon,
    searchTerms: ["sound_set"],
  },
  {
    id: "plasticos",
    label: "Plásticos",
    icon: plasticIcon,
    searchTerms: ["chair_plasto", "table_plasto", "plasty"],
    subcategories: [
      { id: "plasticos_todos", label: "Todos", searchTerms: ["chair_plasto", "table_plasto", "plasty"] },
      { id: "plasticos_cadeira", label: "Cadeira", searchTerms: ["chair_plasto"] },
      { id: "plasticos_pufe", label: "Pufe", searchTerms: ["plasty"] },
      { id: "plasticos_mesinha", label: "Mesinha", searchTerms: ["table_plasto_square"] },
      { id: "plasticos_redonda", label: "Mesa redonda", searchTerms: ["table_plasto_round"] },
      { id: "plasticos_4pernas", label: "Mesa 4 pernas", searchTerms: ["table_plasto_4leg"] },
      { id: "plasticos_quadrada", label: "Mesa quadrada", searchTerms: ["table_plasto_bigsquare"] },
    ],
  },
]

export default function FairTab({
  mobiQuery, setMobiQuery,
  fairHotel, setFairHotel,
  onSearch, loading, error, results,
  expanded, setExpanded,
  creditRate, onSetCreditRate,
  onAddToInventory, isInInventory,
  isWatching, onToggleWatchlist,
  serverData, markDirty, isLoggedIn, updateLocalData,
  onTriggerFly, isStale, onRefresh,
  onCategoryResults, onCategoryReset,
}) {
  const [showDropdown, setShowDropdown] = React.useState(false)
  const [sortBy, setSortBy] = React.useState("priceValue")
  const [filterQuery, setFilterQuery] = React.useState("")
  const [alertConfigOpen, setAlertConfigOpen] = React.useState(false)
  const [selectedItemForConfig, setSelectedItemForConfig] = React.useState(null)
  const [isStuck, setIsStuck] = React.useState(false)
  const [activeCategory, setActiveCategory] = React.useState(null)
  const [activeSubcategory, setActiveSubcategory] = React.useState(null)
  const [categoryLoading, setCategoryLoading] = React.useState(false)
  // Modal de detalhes
  const [detailItem, setDetailItem] = React.useState(null)

  const wrapperRef = React.useRef(null)
  const inputRef = React.useRef(null)
  const sentinelRef = React.useRef(null)

  const { history, favorites, addToHistory, removeFromHistory, clearHistory, toggleFavorite, isFavorite } =
    useMobiHistory(serverData, markDirty, isLoggedIn, updateLocalData)

  const lastSearchedTermRef = React.useRef(null)

  React.useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(([entry]) => setIsStuck(!entry.isIntersecting), { threshold: 1 })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [results])

  React.useEffect(() => { setFilterQuery("") }, [results])

  React.useEffect(() => {
    if (results.length > 0 && lastSearchedTermRef.current) {
      addToHistory({ term: lastSearchedTermRef.current, classname: results[0]?.ClassName || null })
      lastSearchedTermRef.current = null
    }
  }, [addToHistory, results])

  React.useEffect(() => {
    setActiveCategory(null)
    setActiveSubcategory(null)
    onCategoryReset?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fairHotel])

  async function fetchByTerms(searchTerms) {
    setCategoryLoading(true)
    try {
      const searches = await Promise.all(searchTerms.map((term) => searchMarketItems({ query: term, hotel: fairHotel })))
      const seen = new Set()
      const merged = []
      for (const list of searches) {
        for (const item of list) {
          if (seen.has(item.ClassName)) continue
          seen.add(item.ClassName)
          merged.push(item)
        }
      }
      onCategoryResults?.(merged)
    } catch (err) {
      console.error("[Categoria]", err?.message || err)
      setActiveCategory(null)
      setActiveSubcategory(null)
    } finally {
      setCategoryLoading(false)
    }
  }

  function handleSearch() {
    inputRef.current?.blur()
    setActiveCategory(null)
    setActiveSubcategory(null)
    if (mobiQuery.trim()) lastSearchedTermRef.current = mobiQuery.trim()
    onSearch()
    setShowDropdown(false)
  }

  function handleSelectFromDropdown(term) {
    setMobiQuery(term)
    setShowDropdown(false)
    setActiveCategory(null)
    setActiveSubcategory(null)
    lastSearchedTermRef.current = term
    onSearch(term)
  }

  async function handleCategoryClick(cat) {
    if (activeCategory === cat.id) {
      setActiveCategory(null); setActiveSubcategory(null); setMobiQuery(""); onCategoryReset?.(); return
    }
    setActiveCategory(cat.id); setMobiQuery(""); setFilterQuery("")
    if (cat.subcategories) {
      const todos = cat.subcategories.find(s => s.id.endsWith("_todos"))
      setActiveSubcategory(todos?.id ?? null)
      await fetchByTerms(todos?.searchTerms ?? cat.searchTerms)
    } else {
      setActiveSubcategory(null)
      await fetchByTerms(cat.searchTerms)
    }
  }

  async function handleSubcategoryClick(sub) {
    if (activeSubcategory === sub.id) {
      const cat = FAIR_CATEGORIES.find(c => c.id === activeCategory)
      const todos = cat?.subcategories?.find(s => s.id.endsWith("_todos"))
      setActiveSubcategory(todos?.id ?? null); setFilterQuery("")
      if (todos) await fetchByTerms(todos.searchTerms)
      return
    }
    setActiveSubcategory(sub.id); setFilterQuery("")
    await fetchByTerms(sub.searchTerms)
  }

  async function handleRefresh() {
    if (activeCategory) {
      const cat = FAIR_CATEGORIES.find(c => c.id === activeCategory)
      if (cat) {
        const sub = cat.subcategories?.find(s => s.id === activeSubcategory)
        await fetchByTerms(sub ? sub.searchTerms : cat.searchTerms)
        return
      }
    }
    onRefresh?.()
  }

  const activeCategoryObj = FAIR_CATEGORIES.find(c => c.id === activeCategory)
  const subcategories = activeCategoryObj?.subcategories ?? null
  const hasDropdownItems = history.length > 0 || favorites.length > 0
  const isLoadingAny = loading || categoryLoading

  // ── Ordenação ─────────────────────────────────────────────────────────────
  const sortedResults = [...results].sort((a, b) => {
    const aH = a.marketData?.history
    const bH = b.marketData?.history
    const aL = Array.isArray(aH) && aH.length ? aH[aH.length - 1] : null
    const bL = Array.isArray(bH) && bH.length ? bH[bH.length - 1] : null
    const aP = Array.isArray(aH) && aH.length > 1 ? aH[aH.length - 2] : null
    const bP = Array.isArray(bH) && bH.length > 1 ? bH[bH.length - 2] : null

    if (sortBy === "priceValue") {
      const aPrice = a.marketData?.currentPrice ?? a.marketData?.averagePrice ?? 0
      const bPrice = b.marketData?.currentPrice ?? b.marketData?.averagePrice ?? 0
      return bPrice - aPrice
    }
    if (sortBy === "trend") {
      return ((bL?.[0] ?? 0) - (bP?.[0] ?? bL?.[0] ?? 0)) - ((aL?.[0] ?? 0) - (aP?.[0] ?? aL?.[0] ?? 0))
    }
    if (sortBy === "offers") {
      return (b.marketData?.currentOpenOffers ?? bL?.[3] ?? 0) - (a.marketData?.currentOpenOffers ?? aL?.[3] ?? 0)
    }
    if (sortBy === "averagePrice") {
      return (b.marketData?.averagePrice ?? 0) - (a.marketData?.averagePrice ?? 0)
    }
    return 0
  })

  const filteredResults = filterQuery.trim()
    ? sortedResults.filter((item) =>
      item.FurniName?.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.ClassName?.toLowerCase().includes(filterQuery.toLowerCase())
    )
    : sortedResults

  return (
    <div ref={wrapperRef}>
      {/* ── Modal de detalhe ── */}
      <FairDetailModal
        open={!!detailItem}
        item={detailItem}
        onClose={() => setDetailItem(null)}
        creditRate={creditRate}
        onSetCreditRate={onSetCreditRate}
      />

      {/* ── Alert config ── */}
      <AlertConfigModal
        open={alertConfigOpen}
        item={selectedItemForConfig}
        config={selectedItemForConfig ? { alertMode: "any" } : null}
        onSave={(config) => {
          if (selectedItemForConfig) onToggleWatchlist?.({ ...selectedItemForConfig, alertConfig: config })
          setAlertConfigOpen(false)
        }}
        onClose={() => setAlertConfigOpen(false)}
      />

      {/* ── Cabeçalho ── */}
      <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => setExpanded((v) => !v)}>
        <div className="min-w-0 flex-1 mr-2">
          <div className="text-[#f4f4f4] font-bold text-[13px]">Feira Livre</div>
          <div className="text-[#d2d2d2] text-[11px] leading-4">Pesquise mobis, acompanhe preços, tendências e quantidade de ofertas.</div>
        </div>
        <span className="text-[#d2d2d2] text-[11px]">{expanded ? "▲ recolher" : "▼ expandir"}</span>
      </div>



      {expanded && (
        <>
          {/* ── Chips de categoria ── */}
          <div className="flex flex-wrap gap-[6px] mb-2">
            {FAIR_CATEGORIES.map((cat) => (
              <button key={cat.id} type="button" onClick={() => handleCategoryClick(cat)} disabled={isLoadingAny}
                className={[
                  "flex items-center gap-1 px-2 py-[4px] text-[11px] font-bold border transition-colors cursor-pointer",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  activeCategory === cat.id
                    ? "border-[#ffd64d] bg-[rgba(255,214,77,0.15)] text-[#ffd64d]"
                    : "border-[#555] text-[#888] hover:border-[#888] hover:text-[#ccc]",
                ].join(" ")}
              >
                {cat.icon && <img src={cat.icon} alt={cat.label} className="w-[14px] h-[14px] object-contain " />}
                {cat.label}
              </button>
            ))}
          </div>

          {/* ── Subcategorias ── */}
          {subcategories && (
            <div className="flex flex-wrap gap-[4px] mb-2">
              {subcategories.map((sub) => (
                <button key={sub.id} type="button" onClick={() => handleSubcategoryClick(sub)} disabled={isLoadingAny}
                  className={[
                    "px-2 py-[3px] text-[10px] border transition-colors cursor-pointer disabled:opacity-50",
                    activeSubcategory === sub.id
                      ? "border-[#ffd64d] bg-[rgba(255,214,77,0.12)] text-[#ffd64d]"
                      : "border-[#444] text-[#999] hover:border-[#777] hover:text-[#ddd]",
                  ].join(" ")}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}
          {!subcategories && <div className="mb-1" />}
          {/* ── Formulário de busca ── */}
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
              <HotelSelect value={fairHotel} onChange={setFairHotel} disabled={isLoadingAny} />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Button type="submit" disabled={isLoadingAny}>
                {loading ? "Consultando..." : "Consultar feira"}
              </Button>
              <Button variant="secondary" type="button"
                onClick={() => {
                  setMobiQuery(""); setActiveCategory(null); setActiveSubcategory(null); onCategoryReset?.()
                }}
              >
                Limpar
              </Button>
            </div>
          </form>
        </>
      )}

      {error && <div className="text-[#ffd0d0] text-[12px] mb-2">{error}</div>}

      {/* ── Resultados ── */}
      {results.length > 0 && (
        <>
          {/* Sticky: filtro + sort + stale */}
          <div ref={sentinelRef} className="h-px" />
          <div className={`sticky top-[-12px] z-20 -mx-1 px-1 mb-2 transition-all duration-200 ${isStuck ? "py-2 bg-[rgba(40,40,40,0.65)] backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.4)]" : "py-0 bg-transparent"}`}>
            <div className="flex gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <SearchInput
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder={`Filtrar nos ${results.length} resultados...`}
                  className="[&_input]:h-8 [&_input]:text-[11px] [&_input]:placeholder:text-[#666] [&_input]:border-[#555] [&_input]:bg-[rgba(255,255,255,0.06)]"
                />
              </div>
              {/* Ordenação */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-8 shrink-0 border border-[#555] bg-[rgba(255,255,255,0.08)] px-2 text-[10px] text-[#ccc] outline-none"
              >
                <option value="priceValue" className="text-black">Preço ↓</option>
                <option value="averagePrice" className="text-black">Média ↓</option>
                <option value="trend" className="text-black">Tendência</option>
                <option value="offers" className="text-black">Ofertas</option>
              </select>
            </div>
            {isStale && (
              <button type="button" onClick={handleRefresh}
                className="w-full flex items-center justify-center gap-2 px-3 py-[5px] border border-dashed border-[#ffd64d] bg-[rgba(255,214,77,0.06)] text-[#ffd64d] text-[11px] font-bold cursor-pointer hover:bg-[rgba(255,214,77,0.12)] transition-colors"
              >
                <span>↻</span> Dados podem estar desatualizados — clique para atualizar
              </button>
            )}
          </div>

          {/* ── Grid 4 col desktop / 2 col mobile ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pr-1">
            {filteredResults.map((item, index) => {
              const favEntry = {
                term: item.FurniName || item.ClassName || String(index),  // ← nome legível para exibir e buscar
                classname: item.ClassName  // ← classname só para carregar a imagem
              }
              return (
                <FairGridCard
                  key={`${item.ClassName || item.FurniName}-${index}`}
                  item={item}
                  isFavorite={isFavorite(favEntry.term)}
                  onToggleFavorite={() => toggleFavorite(favEntry)}
                  onAddToInventory={onAddToInventory}
                  isInInventory={isInInventory ? isInInventory(item.ClassName) : false}
                  isWatching={isWatching ? isWatching(item.ClassName) : false}
                  onToggleWatchlist={onToggleWatchlist}
                  onTriggerFly={onTriggerFly}
                  isLoggedIn={isLoggedIn}
                  creditRate={creditRate}
                  onConfigureAlert={(item) => {
                    setSelectedItemForConfig(item)
                    setAlertConfigOpen(true)
                  }}
                  onClick={() => setDetailItem(item)}
                />
              )
            })}
          </div>

          {!isLoadingAny && !filteredResults.length && filterQuery.trim() && (
            <div className="text-[#888] text-[12px] mt-2">Nenhum mobi encontrado para "{filterQuery}".</div>
          )}
        </>
      )}

      {isLoadingAny && (
        <div className="text-[#d2d2d2] text-[12px] mt-2 animate-pulse">Carregando...</div>
      )}

      {!isLoadingAny && !results.length && !error && (
        <div className="text-[#e0e0e0] text-[12px]">Nenhum mobi encontrado.</div>
      )}
    </div>
  )
}