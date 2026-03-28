import React from "react"
import { createPortal } from "react-dom"
import { getFurnitureIconUrl, getFurnitureImageUrl } from "../../../services/habboApi"
import FurnitureImage from "../../ui/FurnitureImage"
import coinSmIcon from "../../../assets/coin_sm.png"
import coinIcon from "../../../assets/coin.png"
import mediaIcon from "../../../assets/media.png"
import ofertasIcon from "../../../assets/ofertas.png"
import watchIcon from "../../../assets/watch.png"
import plusIcon from "../../../assets/plus.png"
import starIcon from "../../../assets/star.png"
import toolIcon from "../../../assets/tool.png"
import configIcon from "../../../assets/config.png"
import boxIcon from "../../../assets/box.png"

// ── helpers ───────────────────────────────────────────────────────────────────

function getLatestHistoryEntry(history = []) {
  if (!Array.isArray(history) || history.length === 0) return null
  return history[history.length - 1]
}

function getTrendInfo(hasActiveOffers, currentPrice, averagePrice) {
  if (!hasActiveOffers) return null
  if (currentPrice == null || averagePrice == null || averagePrice <= 0)
    return { icon: "•", colorClass: "text-[#888]" }
  if (currentPrice > averagePrice) return { icon: "▲", colorClass: "text-[#FF8A8A]" }
  if (currentPrice < averagePrice) return { icon: "▼", colorClass: "text-[#7CFC8A]" }
  return { icon: "•", colorClass: "text-[#f1d97a]" }
}

// ── FurniIcon — ícone pequeno via getFurnitureIconUrl ─────────────────────────

// ✅ VERSÃO FINAL — wrapper com ref sempre presente
function FurniIcon({ classname, hotel = "br" }) {
  const [url, setUrl] = React.useState(undefined) // undefined = não iniciou
  const [error, setError] = React.useState(false)
  const ref = React.useRef(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el || !classname) { setError(true); return }

    const scrollRoot = el.closest('[data-scroll="main"]') ?? null
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        getFurnitureIconUrl(classname, hotel)
          .then((u) => setUrl(u || null))
          .catch(() => setError(true))
      },
      { root: scrollRoot, rootMargin: "50px", threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [classname, hotel])

  return (
    <div ref={ref} className="w-[18px] h-[18px] flex items-center justify-center shrink-0">
      {error || url === null ? (
        <img src={boxIcon} alt="mobi" className="w-full h-full object-contain image-rendering-pixel opacity-40" />
      ) : url ? (
        <img src={url} alt={classname} className="w-full h-full object-contain image-rendering-pixel" onError={() => setError(true)} />
      ) : null}
    </div>
  )
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function Tooltip({ text, children }) {
  const [visible, setVisible] = React.useState(false)
  const [pos, setPos] = React.useState({ x: 0, y: 0 })
  const ref = React.useRef(null)

  const tooltip = visible ? createPortal(
    <div style={{ position: "fixed", left: pos.x, top: pos.y, transform: "translate(-50%, -100%)", zIndex: 99999, pointerEvents: "none" }}
      className="px-2 py-[3px] rounded bg-[#111] border border-[#444] text-[9px] text-[#e0e0e0] whitespace-nowrap shadow-lg"
    >{text}</div>,
    document.body
  ) : null

  return (
    <span ref={ref}
      onMouseEnter={() => {
        const r = ref.current?.getBoundingClientRect()
        if (r) setPos({ x: r.left + r.width / 2, y: r.top - 6 })
        setVisible(true)
      }}
      onMouseLeave={() => setVisible(false)}
    >
      {children}{tooltip}
    </span>
  )
}

// ── FakeToggle ────────────────────────────────────────────────────────────────

function FakeToggle({ checked }) {
  return (
    <div
      className="relative shrink-0 flex items-center"
      style={{
        width: 28, height: 14, borderRadius: 3,
        background: checked ? "#3a9e3a" : "#6b6b6b",
        borderTop: "1.5px solid #4a4a4a",
        borderLeft: "1.5px solid #4a4a4a",
        borderRight: "1.5px solid #8a8a8a",
        borderBottom: "1.5px solid #8a8a8a",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.35)",
        pointerEvents: "none",
      }}
    >
      <span style={{
        position: "absolute",
        left: checked ? 16 : 2,
        width: 10, height: 10, borderRadius: 2,
        background: "#e0e0e0",
        borderTop: "1.5px solid #fff",
        borderLeft: "1.5px solid #fff",
        borderRight: "1.5px solid #888",
        borderBottom: "1.5px solid #888",
        transition: "left 0.12s ease",
      }} />
    </div>
  )
}

// ── ActionsMenu ───────────────────────────────────────────────────────────────

function ActionsMenu({ item, isFavorite, isWatching, isInInventory, onToggleFavorite, onToggleWatchlist, onAddToInventory, onTriggerFly, isLoggedIn, onConfigureAlert }) {
  const [open, setOpen] = React.useState(false)
  const [pos, setPos] = React.useState({ top: 0, left: 0 })
  const btnRef = React.useRef(null)
  const menuRef = React.useRef(null)

  function handleToggle(e) {
    e.stopPropagation()
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const menuWidth = 220
      const spaceRight = window.innerWidth - rect.right
      const left = spaceRight >= menuWidth ? rect.right + 4 : rect.left - menuWidth - 4
      setPos({ top: rect.bottom + 4, left })
    }
    setOpen((v) => !v)
  }

  React.useEffect(() => {
    if (!open) return
    function handleOutside(e) {
      if (!btnRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [open])

  function action(fn) { return (e) => { e?.stopPropagation(); fn?.(); setOpen(false) } }

  const menu = open ? (
    <div ref={menuRef} style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 99999, width: 220 }}
      className="relative overflow-hidden rounded-[14px] border-[2px] border-[#7A7A7A] outline outline-[1px] outline-[#000] bg-[#4D4D4D] shadow-[inset_1px_1px_0_#cfcfcf,inset_-1px_-1px_0_#2f2f2f,0_8px_18px_rgba(0,0,0,0.45)]"
    >
      <div className="relative h-[28px] px-3 flex items-center bg-[#7A7A7A]">
        <span className="text-[10px] font-bold text-white truncate">{item.FurniName || "Ações"}</span>
        <div className="absolute right-[4px] top-0 bottom-0 flex items-center">
          <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(false) }} className="flex items-center justify-center cursor-pointer"
            style={{ width: 18, height: 18, borderRadius: 4, background: "#7A7A7A", borderTop: "1.5px solid #000", borderLeft: "1.5px solid #000", borderRight: "1.5px solid #000", borderBottom: "2.5px solid #000", boxShadow: "inset 0 0 0 1px #8c8c8c" }}
          >
            <span className="block w-0 h-0 translate-y-[1px]" style={{ borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "6px solid #fff" }} />
          </button>
        </div>
      </div>
      <div className="bg-[#4D4D4D] shadow-[inset_1px_1px_0_#6e6e6e,inset_-1px_-1px_0_#3b3b3b]">
        {/* Monitorar — não fecha o menu ao clicar */}
        <button type="button"
          onClick={(e) => {
            e.stopPropagation()
            if (!isLoggedIn) { setOpen(false); onToggleWatchlist?.({ __requireLogin: true }); return }
            if (!isWatching) {
              const imgUrl = getFurnitureImageUrl(item.ClassName)
              if (onTriggerFly && btnRef.current && imgUrl) { const rect = btnRef.current.getBoundingClientRect(); onTriggerFly(rect, imgUrl) }
            }
            onToggleWatchlist?.({ ...item, basePrice: item?.marketData?.currentPrice ?? item?.basePrice })
          }}
          className={`w-full flex items-center gap-[10px] px-3 py-[9px] text-left border-b border-[#3f3f3f] transition-colors cursor-pointer ${isLoggedIn ? "hover:bg-[rgba(255,255,255,0.06)]" : "hover:bg-[rgba(255,214,77,0.06)]"}`}
        >
          <img src={watchIcon} alt="Monitorar" className={`w-[14px] h-[14px] object-contain image-rendering-pixel ${isWatching ? "brightness-100" : "opacity-50"}`} />
          <span className="flex-1 text-[11px] text-[#d0d0d0]">{isWatching ? "Parar de monitorar" : "Monitorar preço"}</span>
          {!isLoggedIn ? <span className="text-[9px] text-[#ffd64d] opacity-80">conta necessária</span> : (
            <div className="flex items-center gap-[6px]">
              {isWatching && (
                <div role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); onConfigureAlert?.(item) }}
                  className="flex items-center justify-center cursor-pointer hover:brightness-125" style={{ width: 14, height: 14 }}>
                  <img src={configIcon} alt="Configurar" className="w-[12px] h-[12px] object-contain" />
                </div>
              )}
              <FakeToggle checked={isWatching} />
            </div>
          )}
        </button>
        <button type="button" onClick={action(onToggleFavorite)}
          className="w-full flex items-center gap-[10px] px-3 py-[9px] text-left border-b border-[#3f3f3f] hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer">
          <img src={starIcon} alt="Favoritar" className={`w-[14px] h-[14px] object-contain image-rendering-pixel ${isFavorite ? "brightness-100" : "opacity-50"}`} />
          <span className="flex-1 text-[11px] text-[#d0d0d0]">{isFavorite ? "Remover dos favoritos" : "Favoritar"}</span>
          <FakeToggle checked={isFavorite} />
        </button>
        <button type="button" onClick={action(() => onAddToInventory?.(item))}
          className="w-full flex items-center gap-[10px] px-3 py-[9px] text-left hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer">
          <img src={plusIcon} alt="Inventário" className={`w-[14px] h-[14px] object-contain image-rendering-pixel ${isInInventory ? "brightness-100" : "opacity-50"}`} />
          <span className="flex-1 text-[11px] text-[#d0d0d0]">{isInInventory ? "Remover do inventário" : "Adicionar ao inventário"}</span>
          <FakeToggle checked={isInInventory} />
        </button>
      </div>
    </div>
  ) : null

  return (
    <>
      <button ref={btnRef} type="button" title="Ações" onClick={handleToggle}
        className={`w-[20px] h-[20px] shrink-0 flex items-center justify-center rounded-[3px] border transition-all cursor-pointer ${open ? "border-[#ffd64d] bg-[rgba(255,214,77,0.15)]" : "border-[#555] bg-[rgba(255,255,255,0.06)] hover:border-[#ffd64d] hover:bg-[rgba(255,214,77,0.10)]"}`}
      >
        <img src={toolIcon} alt="Ações" className="w-[11px] h-[11px] object-contain image-rendering-pixel" />
      </button>
      {typeof document !== "undefined" ? createPortal(menu, document.body) : null}
    </>
  )
}

// ── FairGridCard ──────────────────────────────────────────────────────────────

export default function FairGridCard({
  item,
  isFavorite = false,
  onToggleFavorite,
  onAddToInventory,
  isInInventory = false,
  isWatching = false,
  onToggleWatchlist,
  onTriggerFly,
  isLoggedIn = false,
  onConfigureAlert,
  onClick,
}) {
  const history = item?.marketData?.history || []
  const latestEntry = getLatestHistoryEntry(history)

  const rawPrice = item?.marketData?.currentPrice ?? latestEntry?.[0] ?? null
  const avg = item?.marketData?.averagePrice
  const averagePrice = avg && avg > 0 ? avg : null
  const openOffers = item?.marketData?.currentOpenOffers ?? latestEntry?.[3] ?? null

  const hasActiveOffers = (openOffers ?? 0) > 0 && rawPrice != null && rawPrice > 0
  const priceNow = hasActiveOffers ? rawPrice : null
  const trendInfo = getTrendInfo(hasActiveOffers, priceNow, averagePrice)

  return (
    <div
      className="relative flex flex-col rounded-[6px] overflow-hidden cursor-pointer border border-[#4a4a4a] hover:border-[#ffd64d66] transition-all"
      style={{ background: "#3a3a3a" }}
      onClick={onClick}
    >
      {/* Badges de estado — topo direito */}
      {(isWatching || isInInventory || isFavorite) && (
        <div className="absolute top-[10px] right-[10px] flex flex-col gap-[3px] z-10">
          {isWatching && (
            <div className="w-[13px] h-[13px] flex items-center justify-center rounded-[2px] bg-[rgba(255,214,77,0.2)] border border-[#ffd64d55]" title="Monitorando">
              <img src={watchIcon} alt="" className="w-[9px] h-[9px] object-contain" />
            </div>
          )}
          {isInInventory && (
            <div className="w-[13px] h-[13px] flex items-center justify-center rounded-[2px] bg-[rgba(124,252,138,0.15)] border border-[#7CFC8A44]" title="No inventário">
              <img src={plusIcon} alt="" className="w-[9px] h-[9px] object-contain" />
            </div>
          )}
          {isFavorite && (
            <div className="w-[13px] h-[13px] flex items-center justify-center rounded-[2px] bg-[rgba(255,214,77,0.15)] border border-[#ffd64d44]" title="Favorito">
              <img src={starIcon} alt="" className="w-[9px] h-[9px] object-contain" />
            </div>
          )}
        </div>
      )}

      {/* ── Corpo: métricas esquerda + imagem direita ── */}
      <div className="flex items-stretch px-[10px] pt-[10px] pb-[8px]">

        {/* Métricas — coluna esquerda */}
        <div className="flex flex-col justify-center gap-[6px] flex-1 min-w-0">

          <Tooltip text="Preço atual">
            <div className="flex items-center gap-[5px]">
              <img src={coinSmIcon} alt="Preço" className="w-[16px] h-[16px] shrink-0 object-contain image-rendering-pixel" />
              <div className="flex items-center gap-[3px] min-w-0">
                {priceNow != null ? (
                  <>
                    <span className="text-[12px] text-[#ffd64d] font-bold tabular-nums leading-none">{priceNow.toLocaleString("pt-BR")}</span>
                    {trendInfo && <span className={`text-[9px] font-bold ${trendInfo.colorClass}`}>{trendInfo.icon}</span>}
                    <img src={coinIcon} alt="coin" className="w-[15px] h-[15px] object-contain image-rendering-pixel opacity-80 shrink-0" />
                  </>
                ) : (
                  <span className="text-[9px] text-[#777] italic leading-none">sem preço</span>
                )}
              </div>
            </div>
          </Tooltip>

          <Tooltip text="Média">
            <div className="flex items-center gap-[5px]">
              <img src={mediaIcon} alt="Média" className="w-[16px] h-[16px] shrink-0 object-contain image-rendering-pixel" />
              {averagePrice != null ? (
                <>
                  <span className="text-[12px] text-[#aaa] tabular-nums leading-none">{averagePrice.toLocaleString("pt-BR")}</span>
                  <img src={coinIcon} alt="coin" className="w-[15px] h-[15px] object-contain image-rendering-pixel opacity-60 shrink-0" />
                </>
              ) : (
                <span className="text-[9px] text-[#777] italic leading-none">sem média</span>
              )}
            </div>
          </Tooltip>

          <Tooltip text="Ofertas">
            <div className="flex items-center gap-[5px]">
              <img src={ofertasIcon} alt="Ofertas" className="w-[16px] h-[16px] shrink-0 object-contain image-rendering-pixel" />
              {openOffers != null && openOffers > 0 ? (
                <span className="text-[12px] text-[#aaa] tabular-nums leading-none">{openOffers}</span>
              ) : (
                <span className="text-[9px] text-[#777] italic leading-none">sem ofertas</span>
              )}
            </div>
          </Tooltip>

        </div>

        {/* Imagem — coluna direita */}
        <div className="w-[64px] h-[64px] shrink-0 flex items-center justify-center pr-5">
          <FurnitureImage classname={item.ClassName} furniName={item.FurniName} size="medium" angle="4_0" />
        </div>
      </div>

      {/* ── Rodapé escuro: ícone + nome + classname + ⚙ ── */}
      <div
        className="flex items-center gap-[8px] px-[8px] py-[7px]"
        style={{ background: "#2e2e2e", borderTop: "1px solid #444" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ícone do mobi */}
        <div className="shrink-0" onClick={onClick}>
          <FurniIcon classname={item.ClassName} />
        </div>

        {/* Nome + classname */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
          <Tooltip text={item.FurniName || "—"}>
            <div className="text-white text-[10px] font-bold leading-tight truncate">
              {item.FurniName || "—"}
            </div>
          </Tooltip>
          <Tooltip text={item.ClassName || "—"}>
            <div className="text-[#777] text-[9px] leading-tight truncate font-mono mt-[1px]">
              {item.ClassName || "—"}
            </div>
          </Tooltip>
        </div>

        {/* ⚙ Ações */}
        <div className="shrink-0">
          <ActionsMenu
            item={item}
            isFavorite={isFavorite}
            isWatching={isWatching}
            isInInventory={isInInventory}
            onToggleFavorite={onToggleFavorite}
            onToggleWatchlist={onToggleWatchlist}
            onAddToInventory={onAddToInventory}
            onTriggerFly={onTriggerFly}
            isLoggedIn={isLoggedIn}
            onConfigureAlert={onConfigureAlert}
          />
        </div>
      </div>
    </div>
  )
}