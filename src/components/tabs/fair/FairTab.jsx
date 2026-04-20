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
import modeIcon from "../../../assets/mode.png"
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
    label: "Plasticos",
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
  {
    id: "mode",
    label: "Mode",
    icon: modeIcon,
    searchTerms: [
      "divider_poly3", "bardeskcorner_polyfon", "bardesk_polyfon",
    ],
    subcategories: [
      {
        id: "mode_todos",
        label: "Todos",
        searchTerms: ["divider_poly3", "bardeskcorner_polyfon", "bardesk_polyfon"],
      },
      {
        id: "mode_aquamarine",
        label: "Aquamarine",
        searchTerms: ["divider_poly3", "bardeskcorner_polyfon", "bardesk_polyfon"],
        exactClassNames: ["divider_poly3", "bardeskcorner_polyfon", "bardesk_polyfon"]
      },
      {
        id: "mode_preto",
        label: "Preto",
        searchTerms: ["divider_poly3*2", "bardeskcorner_polyfon*2", "bardesk_polyfon*2"],
      },
      {
        id: "mode_branco",
        label: "Branco",
        searchTerms: ["divider_poly3*3", "bardeskcorner_polyfon*3", "bardesk_polyfon*3"],
      },
      {
        id: "mode_bege",
        label: "Bege",
        searchTerms: ["divider_poly3*4", "bardeskcorner_polyfon*4", "bardesk_polyfon*4"],
      },
      {
        id: "mode_rosa",
        label: "Rosa",
        searchTerms: ["divider_poly3*5", "bardeskcorner_polyfon*5", "bardesk_polyfon*5"],
      },
      {
        id: "mode_azul",
        label: "Azul",
        searchTerms: ["divider_poly3*6", "bardeskcorner_polyfon*6", "bardesk_polyfon*6"],
      },
      {
        id: "mode_verde",
        label: "Verde",
        searchTerms: ["divider_poly3*7", "bardeskcorner_polyfon*7", "bardesk_polyfon*7"],
      },
      {
        id: "mode_amarelo",
        label: "Amarelo",
        searchTerms: ["divider_poly3*8", "bardeskcorner_polyfon*8", "bardesk_polyfon*8"],
      },
      {
        id: "mode_vermelho",
        label: "Vermelho",
        searchTerms: ["divider_poly3*9", "bardeskcorner_polyfon*9", "bardesk_polyfon*9"],
      },
    ],
  },
]

// Chevron icon
function ChevronIcon({ expanded }) {
  return (
    <svg 
      className={`w-4 h-4 text-sky-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

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
  }, [fairHotel])

  async function fetchByTerms(searchTerms, exactClassNames = null) {
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
      const filtered = exactClassNames
        ? merged.filter(item => exactClassNames.includes(item.ClassName))
        : merged
      onCategoryResults?.(filtered)
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
      await fetchByTerms(todos?.searchTerms ?? cat.searchTerms, todos?.exactClassNames ?? cat.exactClassNames ?? null)
    } else {
      setActiveSubcategory(null)
      await fetchByTerms(cat.searchTerms, cat.exactClassNames ?? null)
    }
  }

  async function handleSubcategoryClick(sub) {
    if (activeSubcategory === sub.id) {
      const cat = FAIR_CATEGORIES.find(c => c.id === activeCategory)
      const todos = cat?.subcategories?.find(s => s.id.endsWith("_todos"))
      setActiveSubcategory(todos?.id ?? null); setFilterQuery("")
      if (todos) await fetchByTerms(todos.searchTerms, todos.exactClassNames ?? null)
      return
    }
    setActiveSubcategory(sub.id); setFilterQuery("")
    await fetchByTerms(sub.searchTerms, sub.exactClassNames ?? null)
  }


  async function handleRefresh() {
    if (activeCategory) {
      const cat = FAIR_CATEGORIES.find(c => c.id === activeCategory)
      if (cat) {
        const sub = cat.subcategories?.find(s => s.id === activeSubcategory)
        await fetchByTerms(
          sub ? sub.searchTerms : cat.searchTerms,
          sub ? (sub.exactClassNames ?? null) : (cat.exactClassNames ?? null)
        )
        return
      }
    }
    onRefresh?.()
  }

  const activeCategoryObj = FAIR_CATEGORIES.find(c => c.id === activeCategory)
  const subcategories = activeCategoryObj?.subcategories ?? null
  const hasDropdownItems = history.length > 0 || favorites.length > 0
  const isLoadingAny = loading || categoryLoading

  // ── Ordenacao ─────────────────────────────────────────────────────────────
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

      {/* ── Cabecalho ── */}
      <div 
        className="flex items-center justify-between mb-3 p-3 bg-white rounded-xl border border-sky-100 cursor-pointer hover:border-sky-200 transition-all" 
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0 flex-1 mr-2">
          <div className="text-sky-800 font-bold text-[14px]">Feira Livre</div>
          <div className="text-sky-500 text-[12px] leading-relaxed">Pesquise mobis, acompanhe precos, tendencias e ofertas.</div>
        </div>
        <ChevronIcon expanded={expanded} />
      </div>

      {expanded && (
        <>
          {/* ── Chips de categoria ── */}
          <div className="flex flex-wrap gap-2 mb-3">
            {FAIR_CATEGORIES.map((cat) => (
              <button key={cat.id} type="button" onClick={() => handleCategoryClick(cat)} disabled={isLoadingAny}
                className={`
                  flex items-center gap-2 px-3 py-2 text-[12px] font-semibold
                  rounded-full border-2 transition-all cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${activeCategory === cat.id
                    ? "border-sky-400 bg-gradient-to-r from-sky-400 to-cyan-400 text-white shadow-sm"
                    : "border-sky-200 bg-white text-sky-600 hover:border-sky-400 hover:bg-sky-50"
                  }
                `}
              >
                {cat.icon && <img src={cat.icon} alt={cat.label} className="w-4 h-4 object-contain pixel-render" />}
                {cat.label}
              </button>
            ))}
          </div>

          {/* ── Subcategorias ── */}
          {subcategories && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {subcategories.map((sub) => (
                <button key={sub.id} type="button" onClick={() => handleSubcategoryClick(sub)} disabled={isLoadingAny}
                  className={`
                    px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all cursor-pointer
                    disabled:opacity-50
                    ${activeSubcategory === sub.id
                      ? "bg-sky-100 text-sky-700 border border-sky-300"
                      : "bg-sky-50 text-sky-500 border border-transparent hover:border-sky-200 hover:bg-sky-100"
                    }
                  `}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}

          {/* ── Formulario de busca ── */}
          <form onSubmit={(e) => { e.preventDefault(); handleSearch() }}>
            <div className="flex gap-2 mb-3">
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
            <div className="grid grid-cols-2 gap-2 mb-4">
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

      {error && (
        <div className="text-red-500 text-[12px] bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
          {error}
        </div>
      )}

      {/* ── Resultados ── */}
      {results.length > 0 && (
        <>
          {/* Sticky: filtro + sort + stale */}
          <div ref={sentinelRef} className="h-px" />
          <div className={`
            sticky top-[-12px] z-20 -mx-1 px-1 mb-3 transition-all duration-200 rounded-xl
            ${isStuck 
              ? "py-3 bg-white/90 backdrop-blur-sm shadow-lg border border-sky-100" 
              : "py-0 bg-transparent"
            }
          `}>
            <div className="flex gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <SearchInput
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder={`Filtrar nos ${results.length} resultados...`}
                  className="[&_input]:h-9 [&_input]:text-[12px]"
                />
              </div>
              {/* Ordenacao */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 shrink-0 border-2 border-sky-200 bg-white px-3 text-[11px] text-sky-700 font-semibold rounded-lg outline-none cursor-pointer hover:border-sky-400 transition-all"
              >
                <option value="priceValue">Preco</option>
                <option value="averagePrice">Media</option>
                <option value="trend">Tendencia</option>
                <option value="offers">Ofertas</option>
              </select>
            </div>
            {isStale && (
              <button type="button" onClick={handleRefresh}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 text-amber-700 cursor-pointer hover:bg-amber-100 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                </svg>
                <span className="hidden sm:inline text-[12px] font-semibold">Dados podem estar desatualizados — clique para atualizar</span>
                <span className="sm:hidden text-[11px] font-semibold">Atualizar dados</span>
              </button>
            )}
          </div>

          {/* ── Grid ── */}
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredResults.map((item, index) => {
              const favEntry = {
                term: item.FurniName || item.ClassName || String(index),
                classname: item.ClassName
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
            <div className="text-sky-500 text-[13px] mt-3 text-center">
              Nenhum mobi encontrado para "{filterQuery}".
            </div>
          )}
        </>
      )}

      {isLoadingAny && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <svg className="animate-spin w-5 h-5 text-sky-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sky-600 text-[13px]">Carregando...</span>
          </div>
        </div>
      )}

      {!isLoadingAny && !results.length && !error && (
        <div className="text-sky-500 text-[13px] text-center py-4">
          Nenhum mobi encontrado.
        </div>
      )}
    </div>
  )
}
