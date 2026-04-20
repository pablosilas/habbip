import React from "react"
import { createPortal } from "react-dom"
import { getFurnitureIconUrl, getFurnitureImageUrl } from "../../../services/habboApi"
import FurnitureImage from "../../ui/FurnitureImage"
import coinIcon from "../../../assets/coin.png"
import watchIcon from "../../../assets/watch.png"
import plusIcon from "../../../assets/plus.png"
import starIcon from "../../../assets/star.png"
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
    return { icon: "-", colorClass: "text-sky-400" }
  if (currentPrice > averagePrice) return { icon: "up", colorClass: "text-red-500" }
  if (currentPrice < averagePrice) return { icon: "down", colorClass: "text-green-500" }
  return { icon: "-", colorClass: "text-amber-500" }
}

// ── useIsMobile ───────────────────────────────────────────────────────────────

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth < 640)
  React.useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener("resize", fn)
    return () => window.removeEventListener("resize", fn)
  }, [])
  return isMobile
}

// ── FurniIcon — icone pequeno via getFurnitureIconUrl ─────────────────────────

function FurniIcon({ classname, hotel = "br" }) {
  const [url, setUrl] = React.useState(undefined)
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
    <div ref={ref} className="w-5 h-5 flex items-center justify-center shrink-0">
      {error || url === null ? (
        <img src={boxIcon} alt="mobi" className="w-full h-full object-contain opacity-40" />
      ) : url ? (
        <img src={url} alt={classname} className="w-full h-full object-contain pixel-render" onError={() => setError(true)} />
      ) : null}
    </div>
  )
}

// ── Tooltip ────────────────────────────────────────────────────────────────

function Tooltip({ text, children, disabled = false }) {
  const [visible, setVisible] = React.useState(false)
  const [pos, setPos] = React.useState({ x: 0, y: 0 })
  const ref = React.useRef(null)

  const tooltip = (!disabled && visible) ? createPortal(
    <div style={{ position: "fixed", left: pos.x, top: pos.y, transform: "translate(-50%, -100%)", zIndex: 99999, pointerEvents: "none" }}
      className="px-2 py-1 rounded-lg bg-sky-800 border border-sky-600 text-[10px] text-white whitespace-nowrap shadow-lg"
    >{text}</div>,
    document.body
  ) : null

  if (disabled) return <>{children}</>

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

// ── Toggle visual ─────────────────────────────────────────────────────────────

function FakeToggle({ checked }) {
  return (
    <div
      className={`
        relative shrink-0 w-8 h-5 rounded-full transition-all
        ${checked 
          ? "bg-gradient-to-r from-green-400 to-green-500" 
          : "bg-sky-200"
        }
      `}
    >
      <span className={`
        absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all
        ${checked ? "left-3.5" : "left-0.5"}
      `} />
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
      const menuWidth = 240
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

  function action(fn) { return (e) => { e?.stopPropagation(); fn?.() } }

  const menu = open ? (
    <div ref={menuRef} style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 99999, width: 240 }}
      className="bg-white rounded-xl border-2 border-sky-100 shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="h-10 px-4 flex items-center justify-between bg-gradient-to-r from-sky-400 to-cyan-400">
        <span className="text-[12px] font-bold text-white truncate">{item.FurniName || "Acoes"}</span>
        <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(false) }} 
          className="w-6 h-6 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition-all">
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Options */}
      <div className="p-2 space-y-1">
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
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sky-50 transition-colors cursor-pointer"
        >
          <img src={watchIcon} alt="Monitorar" className={`w-4 h-4 object-contain ${isWatching ? "" : "opacity-40"}`} />
          <span className="flex-1 text-[12px] text-sky-800 text-left">{isWatching ? "Parar de monitorar" : "Monitorar preco"}</span>
          {!isLoggedIn ? (
            <span className="text-[10px] text-amber-600 font-medium">login</span>
          ) : (
            <div className="flex items-center gap-2">
              {isWatching && (
                <button onClick={(e) => { e.stopPropagation(); onConfigureAlert?.(item) }}
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-sky-100 cursor-pointer">
                  <img src={configIcon} alt="Configurar" className="w-3 h-3 object-contain" />
                </button>
              )}
              <FakeToggle checked={isWatching} />
            </div>
          )}
        </button>

        <button type="button" onClick={action(onToggleFavorite)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sky-50 transition-colors cursor-pointer">
          <img src={starIcon} alt="Favoritar" className={`w-4 h-4 object-contain ${isFavorite ? "" : "opacity-40"}`} />
          <span className="flex-1 text-[12px] text-sky-800 text-left">{isFavorite ? "Remover favorito" : "Favoritar"}</span>
          <FakeToggle checked={isFavorite} />
        </button>

        <button type="button" onClick={action(() => onAddToInventory?.(item))}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sky-50 transition-colors cursor-pointer">
          <img src={plusIcon} alt="Inventario" className={`w-4 h-4 object-contain ${isInInventory ? "" : "opacity-40"}`} />
          <span className="flex-1 text-[12px] text-sky-800 text-left">{isInInventory ? "Remover inventario" : "Add inventario"}</span>
          <FakeToggle checked={isInInventory} />
        </button>
      </div>
    </div>
  ) : null

  return (
    <>
      <button ref={btnRef} type="button" title="Acoes" onClick={handleToggle}
        className={`
          w-7 h-7 shrink-0 flex items-center justify-center rounded-lg border-2 transition-all cursor-pointer
          ${open 
            ? "border-sky-400 bg-sky-100" 
            : "border-sky-200 bg-white hover:border-sky-400 hover:bg-sky-50"
          }
        `}
      >
        <svg className="w-3.5 h-3.5 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>
      {typeof document !== "undefined" ? createPortal(menu, document.body) : null}
    </>
  )
}

// ── Trend Icon ────────────────────────────────────────────────────────────────

function TrendIcon({ direction, colorClass }) {
  if (direction === "up") {
    return (
      <svg className={`w-3 h-3 ${colorClass}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 14l5-5 5 5H7z" />
      </svg>
    )
  }
  if (direction === "down") {
    return (
      <svg className={`w-3 h-3 ${colorClass}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 10l5 5 5-5H7z" />
      </svg>
    )
  }
  return <span className={`text-[10px] ${colorClass}`}>-</span>
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
  const isMobile = useIsMobile()

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
      className="relative flex flex-col rounded-xl overflow-hidden cursor-pointer bg-white border-2 border-sky-100 hover:border-sky-300 hover:shadow-lg transition-all"
      onClick={onClick}
    >
      {/* Badges de estado — topo direito */}
      {(isWatching || isInInventory || isFavorite) && (
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
          {isWatching && (
            <div className="w-5 h-5 flex items-center justify-center rounded-lg bg-amber-100 border border-amber-300" title="Monitorando">
              <img src={watchIcon} alt="" className="w-3 h-3 object-contain" />
            </div>
          )}
          {isInInventory && (
            <div className="w-5 h-5 flex items-center justify-center rounded-lg bg-green-100 border border-green-300" title="No inventario">
              <img src={plusIcon} alt="" className="w-3 h-3 object-contain" />
            </div>
          )}
          {isFavorite && (
            <div className="w-5 h-5 flex items-center justify-center rounded-lg bg-yellow-100 border border-yellow-300" title="Favorito">
              <img src={starIcon} alt="" className="w-3 h-3 object-contain" />
            </div>
          )}
        </div>
      )}

      {/* ── Corpo: metricas esquerda + imagem direita ── */}
      <div className="flex items-stretch p-3">

        {/* Metricas — coluna esquerda */}
        <div className="flex flex-col justify-center gap-2 flex-1 min-w-0">

          {/* Preco atual */}
          <Tooltip text="Preco atual" disabled={isMobile}>
            <div className="flex items-center gap-2">
              <img src={coinIcon} alt="Preco" className="w-4 h-4 shrink-0 object-contain" />
              <div className="flex items-center gap-1 min-w-0">
                {priceNow != null ? (
                  <>
                    <span className="text-[14px] text-amber-600 font-bold tabular-nums leading-none">
                      {priceNow.toLocaleString("pt-BR")}
                    </span>
                    {trendInfo && <TrendIcon direction={trendInfo.icon} colorClass={trendInfo.colorClass} />}
                  </>
                ) : (
                  <span className="text-[11px] text-sky-400 italic leading-none">sem preco</span>
                )}
              </div>
            </div>
          </Tooltip>

          {/* Media */}
          <Tooltip text="Media" disabled={isMobile}>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18M7 16l4-4 4 4 6-6" />
              </svg>
              {averagePrice != null ? (
                <span className="text-[12px] text-sky-600 tabular-nums leading-none">
                  {averagePrice.toLocaleString("pt-BR")}
                </span>
              ) : (
                <span className="text-[11px] text-sky-400 italic leading-none">sem media</span>
              )}
            </div>
          </Tooltip>

          {/* Ofertas */}
          <Tooltip text="Ofertas" disabled={isMobile}>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              {openOffers != null && openOffers > 0 ? (
                <span className="text-[12px] text-sky-600 tabular-nums leading-none">{openOffers}</span>
              ) : (
                <span className="text-[11px] text-sky-400 italic leading-none">sem ofertas</span>
              )}
            </div>
          </Tooltip>

        </div>

        {/* Imagem — coluna direita */}
        <div className="shrink-0 w-16 h-16 flex items-center justify-center">
          <FurnitureImage classname={item.ClassName} furniName={item.FurniName} size="medium" angle="4_0" />
        </div>
      </div>

      {/* ── Rodape: icone + nome + classname + acoes ── */}
      <div
        className="flex items-center gap-2 px-3 py-2 bg-sky-50 border-t border-sky-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icone do mobi */}
        <div className="shrink-0" onClick={onClick}>
          <FurniIcon classname={item.ClassName} />
        </div>

        {/* Nome + classname */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
          <Tooltip text={item.FurniName || "-"} disabled={isMobile}>
            <div className="text-sky-800 text-[11px] font-bold leading-tight truncate">
              {item.FurniName || "-"}
            </div>
          </Tooltip>
          <Tooltip text={item.ClassName || "-"} disabled={isMobile}>
            <div className="text-sky-400 text-[10px] leading-tight truncate font-mono">
              {item.ClassName || "-"}
            </div>
          </Tooltip>
        </div>

        {/* Acoes */}
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
