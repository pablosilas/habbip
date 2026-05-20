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

function MiniMobiIcon({ classname }) {
  const [url, setUrl] = React.useState(null)
  const [err, setErr] = React.useState(false)

  React.useEffect(() => {
    if (!classname) return
    setUrl(getFurnitureIconUrl(classname, "br"))
    setErr(false)
  }, [classname])

  if (err || !url) {
    return (
      <div className="w-6 h-6 rounded bg-[#3a3a3a] flex items-center justify-center">
        <span className="text-[8px] text-[#666]">?</span>
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
  const [iconType, setIconType] = React.useState("habbo")  // "habbo" | "emoji"
  const [habboIconId, setHabboIconId] = React.useState(22) // animais como padrão
  const [emoji, setEmoji] = React.useState("⭐")
  const [customEmoji, setCustomEmoji] = React.useState("")
  const [showIconPicker, setShowIconPicker] = React.useState(false)
  const [iconSearch, setIconSearch] = React.useState("")

  const [searchQuery, setSearchQuery] = React.useState("")
  const [searchResults, setSearchResults] = React.useState([])
  const [searching, setSearching] = React.useState(false)
  const [searchError, setSearchError] = React.useState("")

  const [selectedMobis, setSelectedMobis] = React.useState([])
  const [saving, setSaving] = React.useState(false)
  const inputRef = React.useRef(null)

  // Preenche com dados iniciais ao abrir (modo edição)
  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.label || "")
        // suporte a categorias que têm habboIconId ou emoji
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
        setIconType("habbo")
        setHabboIconId(22)
        setEmoji("⭐")
        setCustomEmoji("")
        setSelectedMobis([])
      }
      setShowIconPicker(false)
      setIconSearch("")
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
      // ícone — uma das duas formas
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

  if (!open) return null

  const modal = (
    <div
      className="fixed inset-0 z-[200] bg-[rgba(0,0,0,0.65)] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] max-h-[90vh] flex flex-col"
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
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 bg-[#4D4D4D] shadow-[inset_1px_1px_0_#6e6e6e,inset_-1px_-1px_0_#3b3b3b]">

          {/* Nome + Emoji */}
          <div className="flex gap-2 items-start">
            {/* Botão do ícone selecionado */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowIconPicker((v) => !v)}
                className="w-[40px] h-[36px] flex items-center justify-center border border-[#555] bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.14)] cursor-pointer transition-colors"
                title="Escolher ícone"
              >
                {iconType === "habbo" ? (
                  <img
                    src={getCatalogIconUrl(habboIconId)}
                    alt=""
                    className="w-[26px] h-[26px] object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-[20px] leading-none">{customEmoji.trim() || emoji}</span>
                )}
              </button>

              {showIconPicker && (
                <div
                  className="absolute top-[42px] left-0 z-10 bg-[#3a3a3a] border border-[#555] shadow-xl"
                  style={{ width: 280 }}
                >
                  {/* Tabs */}
                  <div className="flex border-b border-[#555]">
                    <button
                      type="button"
                      onClick={() => setIconType("habbo")}
                      className={`flex-1 py-[6px] text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${iconType === "habbo"
                        ? "bg-[rgba(255,214,77,0.12)] text-[#ffd64d] border-b-2 border-[#ffd64d]"
                        : "text-[#888] hover:text-[#ccc]"
                        }`}
                    >
                      Habbo
                    </button>
                    <button
                      type="button"
                      onClick={() => setIconType("emoji")}
                      className={`flex-1 py-[6px] text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${iconType === "emoji"
                        ? "bg-[rgba(255,214,77,0.12)] text-[#ffd64d] border-b-2 border-[#ffd64d]"
                        : "text-[#888] hover:text-[#ccc]"
                        }`}
                    >
                      Emoji
                    </button>
                  </div>

                  {/* Conteúdo das tabs */}
                  <div className="p-2">
                    {iconType === "habbo" ? (
                      <>
                        <input
                          type="text"
                          value={iconSearch}
                          onChange={(e) => setIconSearch(e.target.value)}
                          placeholder="Buscar ícone..."
                          className="w-full h-7 border border-[#555] bg-[rgba(255,255,255,0.08)] px-2 text-[11px] text-white outline-none placeholder:text-[#666] mb-2"
                        />
                        <div className="grid grid-cols-7 gap-[3px] max-h-[200px] overflow-y-auto pr-1">
                          {CATALOG_ICONS
                            .filter((ic) =>
                              !iconSearch.trim() ||
                              ic.label.toLowerCase().includes(iconSearch.toLowerCase())
                            )
                            .map((ic) => (
                              <button
                                key={ic.id}
                                type="button"
                                onClick={() => {
                                  setHabboIconId(ic.id)
                                  setShowIconPicker(false)
                                }}
                                title={ic.label}
                                className={`w-[32px] h-[32px] flex items-center justify-center rounded transition-colors cursor-pointer ${habboIconId === ic.id
                                  ? "bg-[rgba(255,214,77,0.2)] ring-1 ring-[#ffd64d]"
                                  : "hover:bg-[rgba(255,255,255,0.08)]"
                                  }`}
                              >
                                <img
                                  src={getCatalogIconUrl(ic.id)}
                                  alt={ic.label}
                                  className="w-[24px] h-[24px] object-contain"
                                  loading="lazy"
                                  onError={(e) => { e.currentTarget.style.opacity = "0.2" }}
                                />
                              </button>
                            ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-8 gap-1 mb-2 max-h-[160px] overflow-y-auto pr-1">
                          {EMOJI_SUGGESTIONS.map((e) => (
                            <button
                              key={e}
                              type="button"
                              onClick={() => {
                                setEmoji(e)
                                setCustomEmoji("")
                                setShowIconPicker(false)
                              }}
                              className={`w-[24px] h-[24px] flex items-center justify-center text-[15px] rounded hover:bg-[rgba(255,255,255,0.12)] cursor-pointer transition-colors ${emoji === e && !customEmoji
                                ? "bg-[rgba(255,214,77,0.2)] ring-1 ring-[#ffd64d]"
                                : ""
                                }`}
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                        <div className="border-t border-[#555] pt-2">
                          <div className="text-[9px] text-[#888] mb-1">Ou digite um emoji:</div>
                          <input
                            type="text"
                            value={customEmoji}
                            onChange={(e) => setCustomEmoji(e.target.value.slice(0, 2))}
                            placeholder="🎯"
                            className="w-full h-7 border border-[#555] bg-[rgba(255,255,255,0.08)] px-2 text-[14px] text-white outline-none placeholder:text-[#666]"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Nome */}
            <div className="flex-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 24))}
                placeholder="Nome da categoria..."
                maxLength={24}
                className="w-full h-[36px] border border-[#c3c3c3] bg-[rgba(255,255,255,0.12)] px-3 text-[12px] text-white outline-none placeholder:text-[#aaa]"
              />
              <div className="text-[9px] text-[#666] text-right mt-[2px]">{name.length}/24</div>
            </div>
          </div>

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
                className="shrink-0 px-3 h-8 border border-[#c7a84b] bg-[rgba(255,202,0,0.12)] text-[#fff2c1] text-[10px] font-bold cursor-pointer hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {searching ? "..." : "Buscar"}
              </button>
            </div>

            {searchError && (
              <div className="text-[#ffd0d0] text-[10px] mb-2">{searchError}</div>
            )}

            {searchResults.length > 0 && (
              <div className="max-h-[140px] overflow-y-auto border border-[#444] bg-[rgba(0,0,0,0.2)] mb-2 pr-1">
                {searchResults.map((item) => {
                  const sel = isSelected(item)
                  return (
                    <button
                      key={item.ClassName}
                      type="button"
                      onClick={() => toggleMobi(item)}
                      className={`w-full flex items-center gap-2 px-2 py-[5px] text-left border-b border-[#3a3a3a] last:border-b-0 cursor-pointer transition-colors ${sel ? "bg-[rgba(255,214,77,0.12)] hover:bg-[rgba(255,214,77,0.18)]" : "hover:bg-[rgba(255,255,255,0.06)]"}`}
                    >
                      <MiniMobiIcon classname={item.ClassName} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-white font-bold truncate leading-tight">{item.FurniName || item.ClassName}</div>
                        <div className="text-[8px] text-[#666] font-mono truncate">{item.ClassName}</div>
                      </div>
                      <div className={`shrink-0 w-4 h-4 flex items-center justify-center text-[10px] font-bold ${sel ? "text-[#ffd64d]" : "text-[#555]"}`}>
                        {sel ? "✓" : "+"}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Mobis selecionados */}
          {selectedMobis.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px] font-bold text-[#fff2c1] uppercase tracking-wider">
                  Selecionados ({selectedMobis.length})
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMobis([])}
                  className="text-[9px] text-[#888] hover:text-[#ff8a8a] cursor-pointer"
                >
                  limpar tudo
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedMobis.map((m) => (
                  <div
                    key={m.ClassName}
                    className="flex items-center gap-1 px-2 py-[3px] bg-[rgba(255,214,77,0.1)] border border-[#ffd64d44] text-[9px] text-[#fff2c1]"
                  >
                    <MiniMobiIcon classname={m.ClassName} />
                    <span className="max-w-[80px] truncate">{m.FurniName || m.ClassName}</span>
                    <button
                      type="button"
                      onClick={() => toggleMobi(m)}
                      className="text-[#888] hover:text-[#ff8a8a] cursor-pointer ml-1 leading-none"
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
        <div className="shrink-0 flex gap-2 px-3 py-2 border-t border-[#3a3a3a] bg-[#3a3a3a]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-8 border border-[#555] bg-[rgba(255,255,255,0.06)] text-[#ccc] text-[11px] cursor-pointer hover:brightness-110"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="flex-1 h-8 border border-[#c7a84b] bg-[rgba(255,202,0,0.15)] text-[#fff2c1] text-[11px] font-bold cursor-pointer hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Salvando..." : isEdit ? "Salvar Alterações" : "Criar Categoria"}
          </button>
        </div>
      </div>
    </div>
  )

  return typeof document !== "undefined" ? createPortal(modal, document.body) : null
}