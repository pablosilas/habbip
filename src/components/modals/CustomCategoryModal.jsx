import React from "react"
import { createPortal } from "react-dom"
import { searchMarketItems } from "../../services/marketSearch"
import { getFurnitureIconUrl } from "../../services/habboApi"
import SearchInput from "../ui/SearchInput"
import { CATALOG_ICONS, getCatalogIconUrl } from "../../constants/habboCatalogIcons"

const EMOJI_SUGGESTIONS = [
  "⭐", "🏆", "💎", "🎯", "🔥", "💰", "🎮", "🏠", "🌟", "🎁",
  "🛋️", "🪑", "🛏️", "🪴", "🖼️", "🎨", "🧸", "🪆", "🎪", "🎠",
  "🌈", "🦋", "🐾", "🌸", "🍀", "⚡", "🌊", "🍭", "🎶", "🎸",
]

const ICON_PAGE_SIZE = 40

function getRandomEmoji() {
  return EMOJI_SUGGESTIONS[Math.floor(Math.random() * EMOJI_SUGGESTIONS.length)]
}

function MiniMobiIcon({ classname, hotel = "br" }) {
  const [url, setUrl] = React.useState(null)
  const [err, setErr] = React.useState(false)

  React.useEffect(() => {
    if (!classname) return
    let cancelled = false
    setUrl(null)
    setErr(false)
    getFurnitureIconUrl(classname, hotel).then((resolved) => {
      if (cancelled) return
      if (resolved) setUrl(resolved)
      else setErr(true)
    }).catch(() => { if (!cancelled) setErr(true) })
    return () => { cancelled = true }
  }, [classname, hotel])

  if (err || !url) {
    return (
      <div className="w-6 h-6 rounded bg-[#3a3a3a] flex items-center justify-center">
        <span className="text-[8px] text-[#777]">?</span>
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={classname}
      className="w-6 h-6 object-contain"
      onError={() => setErr(true)}
    />
  )
}

export default function CustomCategoryModal({ open, onClose, onSave, hotel = "br", initialData = null }) {
  const isEdit = !!initialData

  const [name, setName] = React.useState("")
  const [iconType, setIconType] = React.useState("habbo")
  const [habboIconId, setHabboIconId] = React.useState(22)
  const [emoji, setEmoji] = React.useState("⭐")
  const [customEmoji, setCustomEmoji] = React.useState("")
  const [showIconPicker, setShowIconPicker] = React.useState(false)
  const [iconSearch, setIconSearch] = React.useState("")
  const [iconPage, setIconPage] = React.useState(0)

  const [searchQuery, setSearchQuery] = React.useState("")
  const [searchResults, setSearchResults] = React.useState([])
  const [searching, setSearching] = React.useState(false)
  const [searchError, setSearchError] = React.useState("")

  const [selectedMobis, setSelectedMobis] = React.useState([])
  const [saving, setSaving] = React.useState(false)

  const inputRef = React.useRef(null)
  const iconPickerRef = React.useRef(null)
  const iconBtnRef = React.useRef(null)

  // Fecha picker ao clicar fora
  React.useEffect(() => {
    if (!showIconPicker) return
    function handle(e) {
      if (
        iconPickerRef.current && !iconPickerRef.current.contains(e.target) &&
        iconBtnRef.current && !iconBtnRef.current.contains(e.target)
      ) {
        setShowIconPicker(false)
      }
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [showIconPicker])

  // Reset página ao mudar busca
  React.useEffect(() => { setIconPage(0) }, [iconSearch])

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.label || "")
        if (initialData.habboIconId != null) {
          setIconType("habbo")
          setHabboIconId(initialData.habboIconId)
        } else {
          setIconType("emoji")
          setEmoji(initialData.emoji || "⭐")
        }
        setCustomEmoji("")
        setSelectedMobis(initialData.mobis || [])
      } else {
        setName("")
        setIconType("emoji")
        setEmoji(getRandomEmoji())
        setHabboIconId(22)
        setCustomEmoji("")
        setSelectedMobis([])
      }
      setShowIconPicker(false)
      setIconSearch("")
      setIconPage(0)
      setSearchQuery("")
      setSearchResults([])
      setSearchError("")
    }
  }, [open, initialData])

  async function handleSearch() {
    if (!searchQuery.trim()) return
    setSearching(true)
    setSearchError("")
    setSearchResults([])
    try {
      const items = await searchMarketItems({ query: searchQuery.trim(), hotel })
      setSearchResults(items.slice(0, 30))
      if (items.length === 0) setSearchError("Nenhum mobi encontrado.")
    } catch (err) {
      setSearchError(err.message || "Erro ao buscar.")
    } finally {
      setSearching(false)
    }
  }

  function toggleMobi(item) {
    setSelectedMobis((prev) => {
      const exists = prev.some((m) => m.ClassName === item.ClassName)
      if (exists) return prev.filter((m) => m.ClassName !== item.ClassName)
      return [...prev, { ClassName: item.ClassName, FurniName: item.FurniName }]
    })
  }

  function isSelected(item) {
    return selectedMobis.some((m) => m.ClassName === item.ClassName)
  }

  function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    const category = {
      id: initialData?.id || `custom_${Date.now()}`,
      label: name.trim(),
      isCustom: true,
      habboIconId: iconType === "habbo" ? habboIconId : null,
      emoji: iconType === "emoji" ? (customEmoji.trim() || emoji) : null,
      exactClassNames: selectedMobis.map((m) => m.ClassName),
      searchTerms: [...new Set(selectedMobis.map((m) => m.ClassName.split("*")[0]))],
      mobis: selectedMobis,
    }
    onSave(category)
    setSaving(false)
    onClose()
  }

  const filteredIcons = React.useMemo(() =>
    iconSearch.trim()
      ? CATALOG_ICONS.filter((ic) => ic.label.toLowerCase().includes(iconSearch.toLowerCase()))
      : CATALOG_ICONS,
    [iconSearch]
  )
  const totalPages = Math.ceil(filteredIcons.length / ICON_PAGE_SIZE)
  const pageIcons = filteredIcons.slice(iconPage * ICON_PAGE_SIZE, (iconPage + 1) * ICON_PAGE_SIZE)

  if (!open) return null

  const currentIconSrc = iconType === "habbo" ? getCatalogIconUrl(habboIconId) : null
  const currentEmoji = iconType === "emoji" ? (customEmoji.trim() || emoji) : null

  const modal = (
    <div
      className="fixed inset-0 z-[200] bg-[rgba(0,0,0,0.65)] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          border: "2px solid #7A7A7A",
          outline: "1px solid #000",
          background: "#4D4D4D",
          boxShadow: "inset 1px 1px 0 #cfcfcf, inset -1px -1px 0 #2f2f2f, 0 8px 24px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div className="relative h-[32px] px-3 flex items-center shrink-0 bg-[#7A7A7A]">
          <span className="text-[11px] font-bold text-white">
            {isEdit ? `Editar — ${initialData.label}` : "Nova Categoria"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer"
            style={{
              width: 20, height: 20, borderRadius: 4, background: "#7A7A7A",
              borderTop: "1.5px solid #000", borderLeft: "1.5px solid #000",
              borderRight: "1.5px solid #000", borderBottom: "2.5px solid #000",
              boxShadow: "inset 0 0 0 1px #8c8c8c",
            }}
          >
            <span className="text-white text-[10px] font-bold leading-none">✕</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-[#4D4D4D] shadow-[inset_1px_1px_0_#6e6e6e,inset_-1px_-1px_0_#3b3b3b]">

          {/* Nome + Ícone */}
          <div className="flex gap-3 items-start">
            {/* Botão do ícone */}
            <div className="shrink-0">
              <div className="text-[9px] font-bold text-[#ccc] uppercase tracking-wider block mb-1">Ícone</div>
              <button
                ref={iconBtnRef}
                type="button"
                onClick={() => setShowIconPicker((v) => !v)}
                className={`w-[48px] h-[42px] flex flex-col items-center justify-center border hover:bg-[rgba(255,255,255,0.14)] cursor-pointer transition-colors gap-[2px] ${showIconPicker ? "border-[#ffd64d] bg-[rgba(255,214,77,0.1)]" : "border-[#888] bg-[rgba(255,255,255,0.08)]"}`}
                title="Escolher ícone"
              >
                {currentIconSrc ? (
                  <img src={currentIconSrc} alt="" className="w-[28px] h-[28px] object-contain" loading="lazy" />
                ) : (
                  <span className="text-[22px] leading-none">{currentEmoji}</span>
                )}
              </button>
            </div>

            {/* Nome */}
            <div className="flex-1">
              <label className="text-[9px] font-bold text-[#ccc] uppercase tracking-wider block mb-1">
                Nome da categoria
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 24))}
                placeholder="Ex: Raros, Favoritos, Sala..."
                maxLength={24}
                className="w-full h-[42px] border border-[#c3c3c3] bg-[rgba(255,255,255,0.12)] px-3 text-[13px] text-white outline-none placeholder:text-[#999]"
              />
              <div className="text-[9px] text-[#999] text-right mt-[2px]">{name.length}/24</div>
            </div>
          </div>

          {/* Icon Picker inline */}
          {showIconPicker && (
            <div
              ref={iconPickerRef}
              className="border border-[#555] bg-[#333] p-2 space-y-1.5"
            >
              {/* Busca + contagem */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  placeholder="Buscar ícone..."
                  className="flex-1 h-6 border border-[#555] bg-[rgba(255,255,255,0.08)] px-2 text-[10px] text-white outline-none placeholder:text-[#777]"
                />
                <span className="text-[9px] text-[#777] shrink-0">{filteredIcons.length} ícones</span>
              </div>

              {/* Grid — altura fixa para prev/next ficarem sempre no mesmo lugar */}
              <div className="grid grid-cols-10 gap-0.5 h-40 content-start overflow-hidden">
                {pageIcons.map((ic) => (
                  <button
                    key={ic.id}
                    type="button"
                    onClick={() => {
                      setHabboIconId(ic.id)
                      setIconType("habbo")
                      setShowIconPicker(false)
                    }}
                    title={ic.label}
                    className={`w-full aspect-square flex items-center justify-center rounded-sm transition-colors cursor-pointer ${habboIconId === ic.id && iconType === "habbo"
                      ? "bg-[rgba(255,214,77,0.2)] ring-1 ring-[#ffd64d]"
                      : "hover:bg-[rgba(255,255,255,0.1)]"
                      }`}
                  >
                    <img
                      src={getCatalogIconUrl(ic.id)}
                      alt={ic.label}
                      className="w-[20px] h-[20px] object-contain"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.opacity = "0.2" }}
                    />
                  </button>
                ))}
                {pageIcons.length === 0 && (
                  <div className="col-span-10 py-3 text-center text-[10px] text-[#777]">
                    Nenhum ícone encontrado.
                  </div>
                )}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-1 border-t border-[#444]">
                  <button
                    type="button"
                    onClick={() => setIconPage((p) => Math.max(0, p - 1))}
                    disabled={iconPage === 0}
                    className="px-2 h-6 text-[9px] font-bold border border-[#666] text-[#ccc] hover:border-[#aaa] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    ← Ant.
                  </button>
                  <span className="text-[9px] text-[#aaa]">{iconPage + 1} / {totalPages}</span>
                  <button
                    type="button"
                    onClick={() => setIconPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={iconPage >= totalPages - 1}
                    className="px-2 h-6 text-[9px] font-bold border border-[#666] text-[#ccc] hover:border-[#aaa] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    Próx. →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Buscar mobis */}
          <div>
            <div className="text-[10px] font-bold text-[#fff2c1] uppercase tracking-wider mb-2">
              {isEdit ? "Mobis na Categoria" : "Adicionar Mobis"}
            </div>
            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <SearchInput
                  inputRef={inputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch() }}
                  placeholder="Buscar mobi para adicionar..."
                  inputMode="search"
                  enterKeyHint="search"
                  className="[&_input]:h-8 [&_input]:text-[11px]"
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={!searchQuery.trim() || searching}
                className="shrink-0 px-4 h-8 border border-[#c7a84b] bg-[rgba(255,202,0,0.12)] text-[#fff2c1] text-[10px] font-bold cursor-pointer hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {searching ? "..." : "Buscar"}
              </button>
            </div>

            {searchError && (
              <div className="text-[#ffd0d0] text-[10px] mb-2">{searchError}</div>
            )}

            {searchResults.length > 0 && (
              <div className="max-h-[200px] overflow-y-auto border border-[#555] bg-[rgba(0,0,0,0.2)] mb-2">
                <div className="grid grid-cols-2 gap-px bg-[#444]">
                  {searchResults.map((item) => {
                    const sel = isSelected(item)
                    return (
                      <button
                        key={item.ClassName}
                        type="button"
                        onClick={() => toggleMobi(item)}
                        className={`flex items-center gap-2 px-2 py-[5px] text-left cursor-pointer transition-colors ${sel ? "bg-[rgba(255,214,77,0.12)] hover:bg-[rgba(255,214,77,0.18)]" : "bg-[#2e2e2e] hover:bg-[rgba(255,255,255,0.07)]"}`}
                      >
                        <MiniMobiIcon classname={item.ClassName} hotel={hotel} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-white font-bold truncate leading-tight">{item.FurniName || item.ClassName}</div>
                          <div className="text-[8px] text-[#999] font-mono truncate">{item.ClassName}</div>
                        </div>
                        <div className={`shrink-0 w-4 h-4 flex items-center justify-center text-[10px] font-bold ${sel ? "text-[#ffd64d]" : "text-[#888]"}`}>
                          {sel ? "✓" : "+"}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Mobis selecionados */}
          {selectedMobis.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-bold text-[#fff2c1] uppercase tracking-wider">
                  Selecionados ({selectedMobis.length})
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMobis([])}
                  className="text-[9px] text-[#aaa] hover:text-[#ff8a8a] cursor-pointer"
                >
                  limpar tudo
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedMobis.map((m) => (
                  <div
                    key={m.ClassName}
                    className="flex items-center gap-1 px-2 py-[4px] bg-[rgba(255,214,77,0.1)] border border-[#ffd64d44] text-[9px] text-[#fff2c1]"
                  >
                    <MiniMobiIcon classname={m.ClassName} hotel={hotel} />
                    <span className="max-w-[90px] truncate">{m.FurniName || m.ClassName}</span>
                    <button
                      type="button"
                      onClick={() => toggleMobi(m)}
                      className="text-[#aaa] hover:text-[#ff8a8a] cursor-pointer ml-1 leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex gap-2 px-4 py-3 border-t border-[#555] bg-[#3a3a3a]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-9 border border-[#888] bg-[rgba(255,255,255,0.06)] text-[#ddd] text-[11px] cursor-pointer hover:brightness-110"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="flex-1 h-9 border border-[#c7a84b] bg-[rgba(255,202,0,0.15)] text-[#fff2c1] text-[12px] font-bold cursor-pointer hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Salvando..." : isEdit ? "Salvar Alterações" : "Criar Categoria"}
          </button>
        </div>
      </div>
    </div>
  )

  return typeof document !== "undefined" ? createPortal(modal, document.body) : null
}
