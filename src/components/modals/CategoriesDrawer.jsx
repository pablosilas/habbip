import React from "react"
import { createPortal } from "react-dom"
import { getCatalogIconUrl } from "../../constants/habboCatalogIcons"

function CategoryRow({
  cat,
  isPinned,
  pinnedCount,
  maxPinned,
  isActive,
  onActivate,
  onPin,
  onUnpin,
  onEdit,
  onDelete,
  onShow,   // para built-ins ocultos
  isHidden, // built-in que foi excluído
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-[8px] border-b border-[#3a3a3a] transition-colors ${isActive ? "bg-[rgba(255,214,77,0.08)]" : "hover:bg-[rgba(255,255,255,0.04)]"}`}
    >
      {/* Ícone / emoji */}
      <div className="shrink-0 w-6 flex items-center justify-center">
        {cat.icon ? (
          <img src={cat.icon} alt={cat.label} className="w-[18px] h-[18px] object-contain" />
        ) : cat.habboIconId != null ? (
          <img
            src={getCatalogIconUrl(cat.habboIconId)}
            alt={cat.label}
            className="w-[18px] h-[18px] object-contain"
            loading="lazy"
          />
        ) : (
          <span className="text-[15px] leading-none">{cat.emoji}</span>
        )}
      </div>

      {/* Nome + badge pinned */}
      <button
        type="button"
        onClick={onActivate}
        className="flex-1 min-w-0 text-left cursor-pointer"
      >
        <div className={`text-[11px] font-bold truncate ${isActive ? "text-[#ffd64d]" : "text-[#d0d0d0]"}`}>
          {cat.label}
        </div>
        {cat.isCustom && cat.mobis?.length > 0 && (
          <div className="text-[9px] text-[#666] leading-none mt-[2px]">
            {cat.mobis.length} mobi{cat.mobis.length > 1 ? "s" : ""}
          </div>
        )}
      </button>

      {/* Ações */}
      <div className="flex items-center gap-[6px] shrink-0">
        {/* Pin / Unpin */}
        {!isHidden && (
          <button
            type="button"
            onClick={isPinned ? onUnpin : onPin}
            disabled={!isPinned && pinnedCount >= maxPinned}
            title={isPinned ? "Desafixar" : pinnedCount >= maxPinned ? `Limite de ${maxPinned} fixadas` : "Fixar"}
            className={`w-[22px] h-[22px] flex items-center justify-center rounded-[3px] border transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${isPinned
              ? "border-[#ffd64d] bg-[rgba(255,214,77,0.15)] text-[#ffd64d] hover:bg-[rgba(255,214,77,0.25)]"
              : "border-[#555] text-[#666] hover:border-[#888] hover:text-[#aaa]"
              }`}
          >
            <span className="text-[11px] leading-none">{isPinned ? "📌" : "📍"}</span>
          </button>
        )}

        {/* Editar — só custom */}
        {cat.isCustom && (
          <button
            type="button"
            onClick={onEdit}
            title="Editar"
            className="w-[22px] h-[22px] flex items-center justify-center rounded-[3px] border border-[#555] text-[#666] hover:border-[#5599cc] hover:text-[#5599cc] transition-colors cursor-pointer"
          >
            <span className="text-[10px] leading-none">✎</span>
          </button>
        )}

        {/* Excluir / ocultar */}
        {isHidden ? (
          <button
            type="button"
            onClick={onShow}
            title="Restaurar"
            className="w-[22px] h-[22px] flex items-center justify-center rounded-[3px] border border-[#555] text-[#666] hover:border-[#4caf50] hover:text-[#4caf50] transition-colors cursor-pointer"
          >
            <span className="text-[10px] leading-none">↩</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onDelete}
            title={cat.isCustom ? "Excluir" : "Ocultar"}
            className="w-[22px] h-[22px] flex items-center justify-center rounded-[3px] border border-[#555] text-[#666] hover:border-[#cc3333] hover:text-[#cc3333] transition-colors cursor-pointer"
          >
            <span className="text-[10px] leading-none">×</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default function CategoriesDrawer({
  open,
  onClose,
  builtinCategories,   // FAIR_CATEGORIES
  customCategories,
  hiddenBuiltins,
  pinnedIds,
  maxPinned,
  activeCategory,
  onActivate,
  onPin,
  onUnpin,
  onEdit,
  onDeleteCustom,
  onHideBuiltin,
  onShowBuiltin,
}) {
  const pinnedCount = pinnedIds.length

  // Separar built-ins visíveis vs ocultos
  const visibleBuiltins = builtinCategories.filter((c) => !hiddenBuiltins.includes(c.id))
  const hiddenBuiltinList = builtinCategories.filter((c) => hiddenBuiltins.includes(c.id))

  const hasHidden = hiddenBuiltinList.length > 0

  if (!open) return null

  const drawer = (
    <div className="fixed inset-0 z-[300] flex">
      {/* Overlay */}
      <div
        className="flex-1 bg-[rgba(0,0,0,0.5)]"
        onClick={onClose}
      />

      {/* Painel */}
      <div
        className="w-[260px] h-full flex flex-col"
        style={{
          background: "#3d3d3d",
          borderLeft: "2px solid #7A7A7A",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div className="relative h-[32px] px-3 flex items-center shrink-0 bg-[#7A7A7A]">
          <span className="text-[11px] font-bold text-white">Categorias</span>
          <div className="ml-2 text-[9px] text-[#ddd]">
            {customCategories.length} custom · {pinnedCount}/{maxPinned} fixadas
          </div>
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

        {/* Lista */}
        <div className="flex-1 min-h-0 overflow-y-auto">

          {/* Built-ins */}
          {visibleBuiltins.length > 0 && (
            <>
              <div className="px-3 pt-3 pb-1 text-[9px] font-bold text-[#666] uppercase tracking-wider">
                Padrão
              </div>
              {visibleBuiltins.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  cat={cat}
                  isPinned={pinnedIds.includes(cat.id)}
                  pinnedCount={pinnedCount}
                  maxPinned={maxPinned}
                  isActive={activeCategory === cat.id}
                  onActivate={() => { onActivate(cat); onClose() }}
                  onPin={() => onPin(cat.id)}
                  onUnpin={() => onUnpin(cat.id)}
                  onDelete={() => onHideBuiltin(cat.id)}
                />
              ))}
            </>
          )}

          {/* Custom */}
          {customCategories.length > 0 && (
            <>
              <div className="px-3 pt-3 pb-1 text-[9px] font-bold text-[#666] uppercase tracking-wider">
                Minhas Categorias
              </div>
              {customCategories.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  cat={cat}
                  isPinned={pinnedIds.includes(cat.id)}
                  pinnedCount={pinnedCount}
                  maxPinned={maxPinned}
                  isActive={activeCategory === cat.id}
                  onActivate={() => { onActivate(cat); onClose() }}
                  onPin={() => onPin(cat.id)}
                  onUnpin={() => onUnpin(cat.id)}
                  onEdit={() => onEdit(cat)}
                  onDelete={() => onDeleteCustom(cat.id)}
                />
              ))}
            </>
          )}

          {/* Built-ins ocultos */}
          {hasHidden && (
            <>
              <div className="px-3 pt-3 pb-1 text-[9px] font-bold text-[#555] uppercase tracking-wider">
                Ocultas
              </div>
              {hiddenBuiltinList.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  cat={cat}
                  isPinned={false}
                  pinnedCount={pinnedCount}
                  maxPinned={maxPinned}
                  isActive={false}
                  onActivate={() => { }}
                  onPin={() => { }}
                  onUnpin={() => { }}
                  onShow={() => onShowBuiltin(cat.id)}
                  isHidden
                />
              ))}
            </>
          )}

          {customCategories.length === 0 && visibleBuiltins.length === 0 && (
            <div className="px-3 py-6 text-[11px] text-[#555] text-center">
              Nenhuma categoria disponível.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-3 py-2 border-t border-[#2a2a2a] bg-[#2e2e2e]">
          <div className="text-[9px] text-[#555] leading-[14px]">
            📌 Fixe até {maxPinned} categorias para acesso rápido. Arraste os chips para reordenar.
          </div>
        </div>
      </div>
    </div>
  )

  return typeof document !== "undefined" ? createPortal(drawer, document.body) : null
}