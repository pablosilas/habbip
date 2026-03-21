import React from "react"
import InventoryItemCard from "../inventory/InventoryItemCard"
import Button from "../../ui/Button"
import coinIcon from "../../../assets/coin.png"
import boxIcon from "../../../assets/box.png"
import CreditConverterBlock from "../../ui/CreditConverterBlock"
import SearchHistoryDropdown from "../../ui/SearchHistoryDropdown"
import { getFurnitureImageUrl } from "../../../services/habboApi"
import { useInventoryHistory } from "../../../hooks/useSearchHistory"

function SearchResultOption({ item, onSelect }) {
  const [imgStatus, setImgStatus] = React.useState("loading")
  const imageUrl = getFurnitureImageUrl(item.ClassName)
  const history = item?.marketData?.history || []
  const price =
    item?.marketData?.currentPrice ??
    (history.length > 0 ? history[history.length - 1]?.[0] : null) ??
    item?.marketData?.averagePrice ??
    "-"

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="w-full flex items-center gap-3 border border-[#8a8a8a] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,214,77,0.10)] hover:border-[#ffd64d] rounded-md px-3 py-2 text-left transition-colors cursor-pointer"
    >
      <div className="w-9 h-9 shrink-0 flex items-center justify-center overflow-hidden">
        {(imgStatus === "loading" || imgStatus === "error" || !imageUrl) && (
          <img
            src={boxIcon}
            alt=""
            className={`w-full h-full object-contain image-rendering-pixel ${imgStatus === "loading" ? "opacity-40 animate-pulse" : "opacity-60"}`}
          />
        )}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={item.FurniName}
            className={`w-full h-full object-contain image-rendering-pixel ${imgStatus === "ok" ? "block" : "hidden"}`}
            onLoad={() => setImgStatus("ok")}
            onError={() => setImgStatus("error")}
          />
        )}
      </div>
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
  loggedUserName,
}) {
  const [expanded, setExpanded] = React.useState(true)
  const [footerExpanded, setFooterExpanded] = React.useState(false)
  const [inventoryFilter, setInventoryFilter] = React.useState("")
  const [showDropdown, setShowDropdown] = React.useState(false)

  const {
    history,
    favorites,
    addToHistory,
    removeFromHistory,
    clearHistory,
    toggleFavorite,
    isFavorite,
  } = useInventoryHistory(loggedUserName)

  const lastSearchedTermRef = React.useRef(null)

  // Quando searchResults chega, registra no histórico com classname do primeiro resultado
  React.useEffect(() => {
    if (searchResults.length > 0 && lastSearchedTermRef.current) {
      const firstClassname = searchResults[0]?.ClassName || null
      addToHistory({ term: lastSearchedTermRef.current, classname: firstClassname })
      lastSearchedTermRef.current = null
    }
  }, [addToHistory, searchResults, searchKey])

  const hasResults = searchResults.length > 0
  const hasDropdownItems = history.length > 0 || favorites.length > 0

  function handleSearch() {
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

  function handleKeyDown(e) {
    if (e.key === "Enter" && query.trim() && !loading) handleSearch()
    if (e.key === "Escape") {
      if (hasResults) onCancelSearch()
      setShowDropdown(false)
    }
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

      {/* ── Cabeçalho expansível ── */}
      <div
        className="flex items-center justify-between mb-2 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0 flex-1 mr-2">
          <div className="text-[#f4f4f4] font-bold text-[13px]">Somar Inventário</div>
          <div
            className="text-[#d2d2d2] text-[11px] truncate"
            title="Monte seu inventário e calcule o valor total baseado na feira livre."
          >
            Monte seu inventário e calcule o valor total baseado na feira livre.
          </div>
        </div>
        <span className="text-[#d2d2d2] text-[11px] shrink-0">
          {expanded ? "▲ recolher" : "▼ expandir"}
        </span>
      </div>

      {expanded && (
        <>
          {/* Input com dropdown de histórico */}
          <div className="relative mb-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => { if (hasDropdownItems) setShowDropdown(true) }}
              onBlur={() => setShowDropdown(false)}
              placeholder="Nome ou classname do mobi"
              className="w-full h-9 border border-[#c3c3c3] bg-[rgba(255,255,255,0.12)] px-2 text-[12px] text-white outline-none placeholder:text-[#d2d2d2]"
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
              value={hotel}
              onChange={(e) => setHotel(e.target.value)}
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

            <Button onClick={handleSearch} disabled={!query.trim() || loading}>
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </>
      )}

      {error && (
        <div className="text-[#ffd0d0] text-[12px] mb-2">{error}</div>
      )}

      {/* ── Seleção de resultado ── */}
      {hasResults && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#fff2c1]">
              {searchResults.length} mobis encontrados — clique para adicionar
            </span>
            <button
              type="button"
              onClick={onCancelSearch}
              className="text-[10px] text-[#888] hover:text-[#ff8a8a] cursor-pointer transition-colors"
            >
              cancelar
            </button>
          </div>
          <div className="space-y-[6px] max-h-[200px] overflow-y-auto pr-1">
            {[...searchResults]
              .sort((a, b) => {
                const getPrice = (item) => {
                  const h = item?.marketData?.history || []
                  return (
                    item?.marketData?.currentPrice ??
                    (h.length > 0 ? h[h.length - 1]?.[0] : null) ??
                    item?.marketData?.averagePrice ??
                    0
                  )
                }
                return getPrice(b) - getPrice(a)
              })
              .map((item) => (
                <SearchResultOption
                  key={item.ClassName}
                  item={item}
                  onSelect={onAddItem}
                />
              ))}
          </div>
          <div className="border-t border-dashed border-[#d7d7d7] opacity-40 mt-3" />
        </div>
      )}

      {/* ── Filtro do inventário ── */}
      {items.length > 2 && (
        <div className="mb-2">
          <input
            value={inventoryFilter}
            onChange={(e) => setInventoryFilter(e.target.value)}
            placeholder="Filtrar no inventário..."
            className="w-full h-8 border border-[#555] bg-[rgba(255,255,255,0.06)] px-2 text-[11px] text-white outline-none placeholder:text-[#666] rounded-sm"
          />
        </div>
      )}

      {/* ── Lista do inventário ── */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2">
        {items.length === 0 ? (
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

      {/* ── Rodapé com totais ── */}
      {items.length > 0 && (
        <>
          <div className="border-t border-dashed border-[#d7d7d7] opacity-40 my-2 shrink-0" />
          <div className="shrink-0 space-y-2">

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