import React from "react"
import InventoryItemCard from "../inventory/InventoryItemCard"
import Button from "../../ui/Button"
import SearchInput from "../../ui/SearchInput"
import coinIcon from "../../../assets/coin.png"
import CreditConverterBlock from "../../ui/CreditConverterBlock"
import SearchHistoryDropdown from "../../ui/SearchHistoryDropdown"
import { useInventoryHistory } from "../../../hooks/useSearchHistory"
import FurnitureImage from "../../ui/FurnitureImage"
import HotelSelect from "../../ui/HotelSelect"

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

// Search result option card
function SearchResultOption({ item, onSelect }) {
  const history = item?.marketData?.history || []
  const price =
    item?.marketData?.currentPrice ??
    (history.length > 0 ? history[history.length - 1]?.[0] : null) ??
    item?.marketData?.averagePrice ?? "-"

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="flex flex-col items-center gap-2 border-2 border-sky-100 bg-white hover:bg-sky-50 hover:border-sky-300 rounded-xl p-3 text-center transition-all cursor-pointer w-full"
    >
      <div className="flex items-center justify-center w-12 h-12 shrink-0">
        <FurnitureImage classname={item.ClassName} furniName={item.FurniName} size="thumb" angle="2_0" />
      </div>
      <div className="w-full min-w-0">
        <div className="text-sky-800 text-[11px] font-bold truncate leading-tight">{item.FurniName || "-"}</div>
        <div className="flex items-center justify-center gap-1 mt-1">
          <img src={coinIcon} alt="coin" className="w-3 h-3" />
          <span className="text-[12px] text-amber-600 font-bold">{price}</span>
        </div>
      </div>
    </button>
  )
}

// Banner de sincronizacao para anonimos
function AnonSyncBanner({ onLoginToSync }) {
  const [dismissed, setDismissed] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setDismissed(true), 30000)
    return () => clearTimeout(timer)
  }, [])

  if (dismissed) return null

  return (
    <div className="flex items-start gap-3 px-4 py-3 mb-3 border-2 border-amber-200 bg-amber-50 rounded-xl">
      <div className="w-8 h-8 rounded-lg bg-amber-200 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-amber-800 font-bold leading-tight">
          Dados so neste dispositivo
        </div>
        <div className="text-[11px] text-amber-700 leading-relaxed mt-1">
          <button
            type="button"
            onClick={onLoginToSync}
            className="text-amber-600 font-bold hover:underline cursor-pointer"
          >
            Crie uma conta gratis
          </button>{" "}
          para sincronizar em qualquer lugar.
        </div>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-amber-400 hover:text-amber-600 cursor-pointer shrink-0"
        title="Fechar"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default function InventoryTab({
  items,
  query,
  setQuery,
  hotel,
  setHotel,
  loading,
  error,
  searchResults,
  searchKey,
  onSearch,
  onAddItem,
  onCancelSearch,
  onUpdateQty,
  onSetQty,
  onRemove,
  onClear,
  totalItems,
  totalUnits,
  totalValue,
  creditRate,
  onSetCreditRate,
  serverData,
  markDirty,
  isLoggedIn,
  updateLocalData,
  expanded,
  setExpanded,
  loadingData,
  isAnonymous = false,
  onLoginToSync,
}) {
  const inputRef = React.useRef(null)
  const [footerExpanded, setFooterExpanded] = React.useState(false)
  const [inventoryFilter, setInventoryFilter] = React.useState("")
  const [searchResultsFilter, setSearchResultsFilter] = React.useState("")
  const [showDropdown, setShowDropdown] = React.useState(false)

  const {
    history,
    favorites,
    addToHistory,
    removeFromHistory,
    clearHistory,
    toggleFavorite,
    isFavorite,
  } = useInventoryHistory(serverData, markDirty, isLoggedIn, updateLocalData)

  const lastSearchedTermRef = React.useRef(null)

  React.useEffect(() => {
    if (searchResults.length > 0 && lastSearchedTermRef.current) {
      const firstClassname = searchResults[0]?.ClassName || null
      addToHistory({ term: lastSearchedTermRef.current, classname: firstClassname })
      lastSearchedTermRef.current = null
    }
  }, [addToHistory, searchResults, searchKey])

  React.useEffect(() => {
    setSearchResultsFilter("")
  }, [searchResults])

  const hasResults = searchResults.length > 0
  const hasDropdownItems = history.length > 0 || favorites.length > 0

  const filteredSearchResults = searchResultsFilter.trim()
    ? searchResults.filter((item) =>
      item.FurniName?.toLowerCase().includes(searchResultsFilter.toLowerCase()) ||
      item.ClassName?.toLowerCase().includes(searchResultsFilter.toLowerCase())
    )
    : searchResults

  function handleSearch() {
    inputRef.current?.blur()
    if (query.trim()) lastSearchedTermRef.current = query.trim()
    onSearch()
    setShowDropdown(false)
  }

  function handleSelectFromDropdown(term) {
    setQuery(term)
    setShowDropdown(false)
    lastSearchedTermRef.current = term
    onSearch(term)
  }

  React.useEffect(() => {
    if (items.length > 0) setExpanded(false)
  }, [items.length])

  const filteredItems = inventoryFilter.trim()
    ? items.filter((item) =>
      item.FurniName?.toLowerCase().includes(inventoryFilter.toLowerCase()) ||
      item.ClassName?.toLowerCase().includes(inventoryFilter.toLowerCase())
    )
    : items

  return (
    <div className="h-full flex flex-col">

      {/* Cabecalho expansivel */}
      <div
        className="flex items-center justify-between mb-3 p-3 bg-white rounded-xl border border-sky-100 cursor-pointer hover:border-sky-200 transition-all"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0 flex-1 mr-2">
          <div className="text-sky-800 font-bold text-[14px]">Meu Inventario</div>
          <div className="text-sky-500 text-[12px] leading-relaxed">
            Monte seu inventario e calcule o valor total baseado na feira livre.
          </div>
        </div>
        <ChevronIcon expanded={expanded} />
      </div>

      {expanded && (
        <form onSubmit={(e) => { e.preventDefault(); handleSearch() }}>
          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <SearchInput
                inputRef={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    if (hasResults) onCancelSearch()
                    setShowDropdown(false)
                  }
                }}
                onFocus={() => { if (hasDropdownItems) setShowDropdown(true) }}
                onBlur={() => setShowDropdown(false)}
                placeholder="Nome ou classname do mobi"
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

            <HotelSelect value={hotel} onChange={setHotel} />
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button type="submit" disabled={!query.trim() || loading}>
              {loading ? "Buscando..." : "Buscar"}
            </Button>
            <Button variant="secondary" type="button" onClick={() => setQuery("")}>
              Limpar
            </Button>
          </div>
        </form>
      )}

      {error && (
        <div className="text-red-500 text-[12px] bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
          {error}
        </div>
      )}

      {/* Selecao de resultado */}
      {hasResults && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-sky-700">
              {filteredSearchResults.length} mobis encontrados — clique para adicionar
            </span>
            <button
              type="button"
              onClick={onCancelSearch}
              className="text-[11px] text-sky-400 hover:text-red-500 font-medium cursor-pointer transition-colors"
            >
              cancelar
            </button>
          </div>

          {searchResults.length > 1 && (
            <div className="mb-3">
              <SearchInput
                value={searchResultsFilter}
                onChange={(e) => setSearchResultsFilter(e.target.value)}
                placeholder={`Filtrar nos ${searchResults.length} resultados...`}
                className="[&_input]:h-9 [&_input]:text-[12px]"
              />
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 max-h-[220px] overflow-y-auto pr-1">
            {[...filteredSearchResults]
              .sort((a, b) => {
                const getPrice = (item) => {
                  const h = item?.marketData?.history || []
                  return item?.marketData?.currentPrice ?? (h.length > 0 ? h[h.length - 1]?.[0] : null) ?? item?.marketData?.averagePrice ?? 0
                }
                return getPrice(b) - getPrice(a)
              })
              .map((item) => (
                <SearchResultOption key={item.ClassName} item={item} onSelect={onAddItem} />
              ))}
          </div>
          <div className="border-t border-sky-100 mt-4" />
        </div>
      )}

      {/* Filtro do inventario */}
      {items.length > 2 && (
        <div className="mb-3">
          <SearchInput
            value={inventoryFilter}
            onChange={(e) => setInventoryFilter(e.target.value)}
            placeholder="Filtrar no inventario..."
            className="[&_input]:h-9 [&_input]:text-[12px]"
          />
        </div>
      )}

      {/* Lista do inventario */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {loadingData ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <svg className="animate-spin w-10 h-10 text-sky-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <div className="text-sky-500 text-[13px]">Sincronizando dados...</div>
            </div>
          </div>
        ) : items.length === 0 ? (
          !loading && !hasResults && (
            <div className="text-sky-500 text-[13px] text-center py-4">
              Nenhum mobi no inventario. Adicione acima.
            </div>
          )
        ) : filteredItems.length === 0 ? (
          <div className="text-sky-500 text-[13px] text-center py-4">
            Nenhum mobi encontrado para "{inventoryFilter}".
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {filteredItems.map((item) => (
              <InventoryItemCard
                key={item.ClassName}
                item={item}
                onUpdateQty={onUpdateQty}
                onSetQty={onSetQty}
                onRemove={onRemove}
              />
            ))}
            {!inventoryFilter.trim() && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                title="Adicionar mobi"
                className="flex flex-col items-center justify-center border-2 border-dashed border-sky-200 bg-sky-50/50 hover:border-sky-400 hover:bg-sky-100/50 rounded-xl p-3 gap-2 cursor-pointer transition-all min-h-[100px]"
              >
                <span className="text-sky-300 text-2xl leading-none">+</span>
                <span className="text-sky-400 text-[10px] font-medium">adicionar</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Rodape com totais */}
      {items.length > 0 && (
        <>
          <div className="border-t border-sky-100 my-3 shrink-0" />
          <div className="shrink-0 space-y-3">

            {/* Banner de sincronizacao para anonimos */}
            {isAnonymous && onLoginToSync && (
              <AnonSyncBanner onLoginToSync={onLoginToSync} />
            )}

            <div className="flex items-center justify-between text-[12px] text-sky-600">
              <span>{totalItems} {totalItems === 1 ? "tipo" : "tipos"} - {totalUnits} {totalUnits === 1 ? "unidade" : "unidades"}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFooterExpanded((v) => !v)}
                  className="text-[11px] text-sky-400 hover:text-sky-600 font-medium cursor-pointer transition-colors"
                >
                  {footerExpanded ? "minimizar" : "expandir"}
                </button>
                <button
                  type="button"
                  onClick={onClear}
                  className="text-[11px] text-sky-400 hover:text-red-500 font-medium cursor-pointer transition-colors"
                >
                  limpar tudo
                </button>
              </div>
            </div>

            {footerExpanded ? (
              <>
                <div className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-[13px] text-amber-800 font-bold">Total do inventario</span>
                  <div className="flex items-center gap-2">
                    <img src={coinIcon} alt="coin" className="w-5 h-5" />
                    <span className="text-[18px] font-bold text-amber-600">
                      {totalValue.toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>
                <CreditConverterBlock
                  rateCredits={creditRate?.credits}
                  rateReais={creditRate?.reais}
                  onSetRate={onSetCreditRate}
                  credits={totalValue}
                />
              </>
            ) : (
              <div className="flex items-center justify-between border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl px-4 py-2">
                <div className="flex items-center gap-2">
                  <img src={coinIcon} alt="coin" className="w-4 h-4" />
                  <span className="text-[14px] font-bold text-amber-600">
                    {totalValue.toLocaleString("pt-BR")}
                  </span>
                </div>
                <CreditConverterBlock
                  rateCredits={creditRate?.credits}
                  rateReais={creditRate?.reais}
                  onSetRate={onSetCreditRate}
                  credits={totalValue}
                  minimal
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
