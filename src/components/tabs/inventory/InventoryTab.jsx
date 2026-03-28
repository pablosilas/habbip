import React from "react"
import InventoryItemCard from "../inventory/InventoryItemCard"
import Button from "../../ui/Button"
import SearchInput from "../../ui/SearchInput"
import coinIcon from "../../../assets/coin.png"
import CreditConverterBlock from "../../ui/CreditConverterBlock"
import SearchHistoryDropdown from "../../ui/SearchHistoryDropdown"
import { useInventoryHistory } from "../../../hooks/useSearchHistory"
import FurnitureImage from "../../ui/FurnitureImage"
import loadingGif from "../../../assets/loading.gif"

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
      className="w-full flex items-center gap-3 border border-[#8a8a8a] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,214,77,0.10)] hover:border-[#ffd64d] rounded-md px-3 py-2 text-left transition-colors cursor-pointer"
    >
      <FurnitureImage classname={item.ClassName} furniName={item.FurniName} size="thumb" angle="2_0" />
      <div className="flex-1 min-w-0">
        <div className="text-white text-[12px] font-bold truncate">{item.FurniName || "-"}</div>
        <div className="text-[#888] text-[10px] truncate">{item.ClassName || "-"}</div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <img src={coinIcon} alt="coin" className="w-3 h-3" />
        <span className="text-[12px] text-[#ffd64d] font-bold">{price}</span>
      </div>
    </button>
  )
}

// Banner de sincronização para anônimos com itens no inventário
function AnonSyncBanner({ onLoginToSync }) {
  const [dismissed, setDismissed] = React.useState(false)
  if (dismissed) return null

  return (
    <div className="flex items-start gap-2 px-3 py-2 mb-2 border border-[#ffd64d44] bg-[rgba(255,214,77,0.07)] rounded-[6px]">
      <span className="text-[11px] shrink-0 mt-[1px]">☁️</span>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-[#e0c060] font-bold leading-tight">
          Dados só neste dispositivo
        </div>
        <div className="text-[10px] text-[#bbb] leading-[14px] mt-[1px]">
          <button
            type="button"
            onClick={onLoginToSync}
            className="text-[#ffd64d] font-bold hover:underline cursor-pointer"
          >
            Crie uma conta grátis
          </button>{" "}
          para sincronizar em qualquer lugar e nunca perder seus dados.
        </div>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-[#666] hover:text-[#aaa] text-[11px] cursor-pointer shrink-0"
        title="Fechar"
      >
        ✕
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

      {/* Cabeçalho expansível */}
      <div
        className="flex items-center justify-between mb-2 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0 flex-1 mr-2">
          <div className="text-[#f4f4f4] font-bold text-[13px]">Meu Inventário</div>
          <div className="text-[#d2d2d2] text-[11px] leading-4">
            Monte seu inventário e calcule o valor total baseado na feira livre.
          </div>
        </div>
        <span className="text-[#d2d2d2] text-[11px]">
          {expanded ? "▲ recolher" : "▼ expandir"}
        </span>
      </div>

      {expanded && (
        <form onSubmit={(e) => { e.preventDefault(); handleSearch() }}>
          <div className="flex gap-2 mb-2">
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

            <select
              value={hotel}
              onChange={(e) => setHotel(e.target.value)}
              className="h-9 w-16 border border-[#c3c3c3] bg-[rgba(255,255,255,0.12)] px-2 text-[12px] text-white outline-none"
            >
              {["br", "com", "de", "es", "fi", "fr", "it", "nl", "tr"].map(h => (
                <option key={h} value={h} className="text-black">{h.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <Button type="submit" disabled={!query.trim() || loading}>
              {loading ? "Buscando..." : "Buscar"}
            </Button>
            <Button variant="secondary" type="button" onClick={() => setQuery("")}>
              Limpar
            </Button>
          </div>
        </form>
      )}

      {error && <div className="text-[#ffd0d0] text-[12px] mb-2">{error}</div>}

      {/* Seleção de resultado */}
      {hasResults && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#fff2c1]">
              {filteredSearchResults.length} mobis encontrados — clique para adicionar
            </span>
            <button
              type="button"
              onClick={onCancelSearch}
              className="text-[10px] text-[#888] hover:text-[#ff8a8a] cursor-pointer transition-colors"
            >
              cancelar
            </button>
          </div>

          {searchResults.length > 1 && (
            <div className="mb-2">
              <SearchInput
                value={searchResultsFilter}
                onChange={(e) => setSearchResultsFilter(e.target.value)}
                placeholder={`Filtrar nos ${searchResults.length} resultados...`}
                className="[&_input]:h-8 [&_input]:text-[11px] [&_input]:placeholder:text-[#666] [&_input]:border-[#555] [&_input]:bg-[rgba(255,255,255,0.06)] [&_input]:rounded-sm"
              />
            </div>
          )}

          <div className="space-y-[6px] max-h-[200px] overflow-y-auto pr-1">
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
          <div className="border-t border-dashed border-[#d7d7d7] opacity-40 mt-3" />
        </div>
      )}

      {/* Filtro do inventário */}
      {items.length > 2 && (
        <div className="mb-2">
          <SearchInput
            value={inventoryFilter}
            onChange={(e) => setInventoryFilter(e.target.value)}
            placeholder="Filtrar no inventário..."
            className="[&_input]:h-8 [&_input]:text-[11px] [&_input]:placeholder:text-[#666] [&_input]:border-[#555] [&_input]:bg-[rgba(255,255,255,0.06)] [&_input]:rounded-sm"
          />
        </div>
      )}

      {/* Lista do inventário */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2">
        {loadingData ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <img src={loadingGif} alt="Carregando" className="w-12 h-12" />
              <div className="text-[#d2d2d2] text-[12px]">Sincronizando dados...</div>
            </div>
          </div>
        ) : items.length === 0 ? (
          !loading && !hasResults && (
            <div className="text-[#e0e0e0] text-[12px]">
              Nenhum mobi no inventário. Adicione acima.
            </div>
          )
        ) : filteredItems.length === 0 ? (
          <div className="text-[#888] text-[12px]">
            Nenhum mobi encontrado para "{inventoryFilter}".
          </div>
        ) : (
          filteredItems.map((item) => (
            <InventoryItemCard
              key={item.ClassName}
              item={item}
              onUpdateQty={onUpdateQty}
              onSetQty={onSetQty}
              onRemove={onRemove}
            />
          ))
        )}
      </div>

      {/* Rodapé com totais */}
      {items.length > 0 && (
        <>
          <div className="border-t border-dashed border-[#d7d7d7] opacity-40 my-2 shrink-0" />
          <div className="shrink-0 space-y-2">

            {/* Banner de sincronização para anônimos */}
            {isAnonymous && onLoginToSync && (
              <AnonSyncBanner onLoginToSync={onLoginToSync} />
            )}

            <div className="flex items-center justify-between text-[11px] text-[#d2d2d2]">
              <span>{totalItems} {totalItems === 1 ? "tipo" : "tipos"} · {totalUnits} {totalUnits === 1 ? "unidade" : "unidades"}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFooterExpanded((v) => !v)}
                  className="text-[10px] text-[#888] hover:text-[#ffd64d] cursor-pointer transition-colors"
                >
                  {footerExpanded ? "▲ minimizar" : "▼ expandir"}
                </button>
                <button
                  type="button"
                  onClick={onClear}
                  className="text-[10px] text-[#666] hover:text-[#ff8a8a] cursor-pointer transition-colors"
                >
                  limpar tudo
                </button>
              </div>
            </div>

            {footerExpanded ? (
              <>
                <div className="border border-[#8a8a8a] bg-[rgba(255,255,255,0.04)] rounded-md px-3 py-2 flex items-center justify-between">
                  <span className="text-[12px] text-[#d2d2d2] font-bold">Total do inventário</span>
                  <div className="flex items-center gap-[5px]">
                    <img src={coinIcon} alt="coin" className="w-4 h-4" />
                    <span className="text-[16px] font-bold text-[#ffd64d]">
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
              <div className="flex items-center justify-between border border-[#8a8a8a] bg-[rgba(255,255,255,0.04)] rounded-md px-3 py-[6px]">
                <div className="flex items-center gap-[5px]">
                  <img src={coinIcon} alt="coin" className="w-3 h-3" />
                  <span className="text-[13px] font-bold text-[#ffd64d]">
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