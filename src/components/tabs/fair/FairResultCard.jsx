import React from "react"
import { getFurnitureImageUrl } from "../../../services/habboApi"
import coinIcon from "../../../assets/coin.png"
import boxIcon from "../../../assets/box.png"
import flagBr from "../../../assets/flagbr.png"
import flagCom from "../../../assets/flagcom.png"
import flagDe from "../../../assets/flagde.png"
import flagEs from "../../../assets/flages.png"
import flagFi from "../../../assets/flagfi.png"
import flagFr from "../../../assets/flagfr.png"
import flagIt from "../../../assets/flagit.png"
import flagNl from "../../../assets/flagnl.png"
import flagTr from "../../../assets/flagtr.png"
import watchIcon from "../../../assets/watch.png"
import plusIcon from "../../../assets/plus.png"
import starIcon from "../../../assets/star.png"
import CreditConverterBlock from "../../ui/CreditConverterBlock"
import { createPortal } from "react-dom"
import toolIcon from "../../../assets/tool.png"

function formatDateLabel(timestampInSeconds) {
  if (!timestampInSeconds) return "-"
  const date = new Date(timestampInSeconds * 1000)
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date)
}

function formatDateShort(timestampInSeconds) {
  if (!timestampInSeconds) return "-"
  const date = new Date(timestampInSeconds * 1000)
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(date)
}

function formatLastUpdatedDate(lastUpdated) {
  if (!lastUpdated) return "-"
  const [datePart] = lastUpdated.split(" at ")
  if (!datePart) return "-"
  const [year, month, day] = datePart.split("-")
  if (!year || !month || !day) return "-"
  return `${day}/${month}/${year}`
}

function timeAgo(lastUpdated) {
  if (!lastUpdated) return null
  const [datePart, timePart] = lastUpdated.split(" at ")
  if (!datePart) return null
  const [year, month, day] = datePart.split("-")
  if (!year || !month || !day) return null
  const dateStr = timePart
    ? `${year}-${month}-${day}T${timePart}`
    : `${year}-${month}-${day}T00:00:00`
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return null
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMin / 60)
  const diffD = Math.floor(diffH / 24)
  if (diffMin < 60) return "agora pouco"
  if (diffH < 24) return `há ${diffH}h`
  if (diffD === 1) return "há 1 dia"
  if (diffD < 30) return `há ${diffD} dias`
  const diffM = Math.floor(diffD / 30)
  if (diffM === 1) return "há 1 mês"
  return `há ${diffM} meses`
}

function getTimeAgoColor(lastUpdated) {
  if (!lastUpdated) return "text-[#888]"
  const [datePart] = lastUpdated.split(" at ")
  if (!datePart) return "text-[#888]"
  const [year, month, day] = datePart.split("-")
  const date = new Date(`${year}-${month}-${day}`)
  if (isNaN(date.getTime())) return "text-[#888]"
  const diffD = Math.floor((Date.now() - date.getTime()) / 86400000)
  if (diffD <= 1) return "text-[#7CFC8A]"
  if (diffD <= 7) return "text-[#f1d97a]"
  return "text-[#FF8A8A]"
}

function getLatestHistoryEntry(history = []) {
  if (!Array.isArray(history) || history.length === 0) return null
  return history[history.length - 1]
}

function getPreviousHistoryEntry(history = []) {
  if (!Array.isArray(history) || history.length < 2) return null
  return history[history.length - 2]
}

function getTrendInfo(history = []) {
  const latest = getLatestHistoryEntry(history)
  const previous = getPreviousHistoryEntry(history)
  const latestPrice = latest?.[0]
  const previousPrice = previous?.[0]
  if (latestPrice == null || previousPrice == null) {
    return { label: "Sem tendência", icon: "•", colorClass: "text-[#cfcfcf]" }
  }
  if (latestPrice > previousPrice) return { label: "Subindo", icon: "▲", colorClass: "text-[#7CFC8A]" }
  if (latestPrice < previousPrice) return { label: "Caindo", icon: "▼", colorClass: "text-[#FF8A8A]" }
  return { label: "Estável", icon: "•", colorClass: "text-[#f1d97a]" }
}

function getHotelFlag(hotel) {
  const map = { br: flagBr, com: flagCom, de: flagDe, es: flagEs, fi: flagFi, fr: flagFr, it: flagIt, nl: flagNl, tr: flagTr }
  return map[hotel] ?? null
}

function MetricBlock({ label, value, showCoin = false, coinIcon, children }) {
  return (
    <div>
      <div className="text-[11px] font-bold text-white">{label}</div>
      <div className="text-[13px] text-[#f1f1f1] flex items-center gap-1 flex-wrap">
        {showCoin && coinIcon && <img src={coinIcon} alt="coin" className="w-4 h-4" />}
        <span>{value ?? "-"}</span>
        {children}
      </div>
    </div>
  )
}

function HistoryTimeline({ history = [] }) {
  const [expanded, setExpanded] = React.useState(false)
  const entries = history
    .filter((e) => (e?.[1] ?? 0) > 0 && e?.[4])
    .sort((a, b) => b[4] - a[4])
  if (entries.length === 0) return null
  const maxSold = Math.max(...entries.map((e) => e[1] ?? 0))
  const COLLAPSED_LIMIT = 4
  const visible = expanded ? entries : entries.slice(0, COLLAPSED_LIMIT)
  const hasMore = entries.length > COLLAPSED_LIMIT
  const latestTimestamp = entries[0]?.[4]

  return (
    <div className="mb-3">
      <div
        className={`flex items-center justify-between mb-[6px] ${hasMore ? "cursor-pointer group" : ""}`}
        onClick={hasMore ? () => setExpanded((v) => !v) : undefined}
      >
        <span className="text-[9px] font-bold text-[#aaa] uppercase tracking-wider group-hover:text-[#ccc] transition-colors">
          Vendas por dia
        </span>
        {hasMore && (
          <span className="text-[9px] text-[#aaa] group-hover:text-[#ccc] transition-colors">
            {expanded ? "▲ recolher" : `▼ ver todos (${entries.length})`}
          </span>
        )}
      </div>
      <div className="space-y-[3px]">
        {visible.map((entry, i) => {
          const price = entry[0] ?? 0
          const sold = entry[1] ?? 0
          const openOffers = entry[3]
          const timestamp = entry[4]
          const barPct = maxSold > 0 ? (sold / maxSold) * 100 : 0
          const isLatest = timestamp === latestTimestamp
          return (
            <div
              key={timestamp ?? i}
              className={`flex items-center gap-2 px-2 py-[3px] rounded transition-colors ${isLatest ? "bg-[rgba(255,255,255,0.08)]" : "bg-[rgba(255,255,255,0.03)]"}`}
            >
              <span className={`text-[10px] shrink-0 w-[30px] text-right tabular-nums ${isLatest ? "text-[#e0e0e0] font-bold" : "text-[#888]"}`}>
                {formatDateShort(timestamp)}
              </span>
              <div className="flex-1 h-[6px] rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden min-w-0">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${barPct}%`, backgroundColor: isLatest ? "#ffd64d" : "rgba(255,214,77,0.45)" }}
                />
              </div>
              <span className={`text-[10px] shrink-0 w-[32px] tabular-nums ${isLatest ? "text-[#ffd64d] font-bold" : "text-[#b0b0b0]"}`}>
                {sold} un.
              </span>
              <div className="flex items-center gap-[3px] shrink-0">
                <img src={coinIcon} alt="coin" className="w-3 h-3" />
                <span className={`text-[10px] tabular-nums ${isLatest ? "text-[#f1f1f1] font-bold" : "text-[#c0c0c0]"}`}>
                  {price}
                </span>
              </div>
              {openOffers != null && openOffers > 0 && (
                <span className="text-[9px] text-[#666] shrink-0">{openOffers} of.</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FurnitureImage({ classname, furniName, size = "small" }) {
  const [status, setStatus] = React.useState("loading")
  const imageUrl = React.useMemo(() => getFurnitureImageUrl(classname), [classname])
  const sizeClass = size === "large" ? "w-[88px] h-[88px]" : "w-[44px] h-[44px]"

  React.useEffect(() => {
    if (!imageUrl) { setStatus("error"); return }
    setStatus("loading")
    const img = new Image()
    img.onload = () => setStatus("ok")
    img.onerror = () => setStatus("error")
    img.src = imageUrl
    if (img.complete) setStatus("ok")
  }, [imageUrl])

  return (
    <div className={`${sizeClass} shrink-0 flex items-center justify-center overflow-hidden`}>
      {status !== "ok" && (
        <img
          src={boxIcon}
          alt="carregando"
          className={`max-w-full max-h-full object-contain image-rendering-pixel ${status === "loading" ? "opacity-40 animate-pulse" : "opacity-60"}`}
        />
      )}
      {status === "ok" && (
        <img src={imageUrl} alt={furniName || "Mobi"} className="max-w-full max-h-full object-contain image-rendering-pixel" />
      )}
    </div>
  )
}

function PriceSparkline({ history = [] }) {
  const [tooltip, setTooltip] = React.useState(null)
  const [expanded, setExpanded] = React.useState(true)

  const currentYear = new Date().getFullYear()
  const points = history
    .filter((e) => {
      if (!e?.[0] || e[0] <= 0 || !e?.[4]) return false
      return new Date(e[4] * 1000).getFullYear() === currentYear
    })
    .sort((a, b) => a[4] - b[4])

  if (points.length < 2) return null

  const W = 260, H = 90, PAD_X = 4, PAD_Y = 8
  const prices = points.map((e) => e[0])
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice || 1

  const coords = points.map((entry, i) => ({
    x: PAD_X + (i / (points.length - 1)) * (W - PAD_X * 2),
    y: PAD_Y + (1 - (entry[0] - minPrice) / priceRange) * (H - PAD_Y * 2),
    price: entry[0],
    date: formatDateLabel(entry[4]),
  }))

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ")
  const areaPath = linePath + ` L ${coords[coords.length - 1].x.toFixed(1)} ${H} L ${coords[0].x.toFixed(1)} ${H} Z`

  const firstPrice = prices[0]
  const lastPrice = prices[prices.length - 1]
  const lineColor = lastPrice > firstPrice ? "#7CFC8A" : lastPrice < firstPrice ? "#FF8A8A" : "#f1d97a"
  const areaColor = lastPrice > firstPrice ? "rgba(124,252,138,0.08)" : lastPrice < firstPrice ? "rgba(255,138,138,0.08)" : "rgba(241,217,122,0.08)"

  return (
    <div className="mt-2 mb-3">
      <div
        className="flex items-center justify-between mb-1 cursor-pointer group"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-[9px] font-bold text-[#aaa] uppercase tracking-wider group-hover:text-[#ccc] transition-colors">
          Histórico de preços
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-[#aaa] group-hover:text-[#ccc] transition-colors">
            {points.length} registros • {coords[0].date} → {coords[coords.length - 1].date}
          </span>
          <span className="text-[9px] text-[#aaa] group-hover:text-[#ccc] transition-colors">
            {expanded ? "▲ recolher" : "▼ expandir"}
          </span>
        </div>
      </div>
      {expanded && (
        <>
          <div className="relative w-full">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full"
              style={{ height: "90px", overflow: "visible" }}
              onMouseLeave={() => setTooltip(null)}
            >
              {[0.25, 0.5, 0.75].map((t) => (
                <line key={t} x1={PAD_X} y1={(PAD_Y + t * (H - PAD_Y * 2)).toFixed(1)} x2={W - PAD_X} y2={(PAD_Y + t * (H - PAD_Y * 2)).toFixed(1)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              ))}
              <path d={areaPath} fill={areaColor} />
              <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {coords.map((c, i) => (
                <g key={i}>
                  <circle cx={c.x} cy={c.y} r={tooltip?.price === c.price && tooltip?.date === c.date ? 5 : 3.5} fill={lineColor} stroke="#1a1a1a" strokeWidth="1" />
                  <circle cx={c.x} cy={c.y} r="8" fill="transparent" className="cursor-crosshair" onMouseEnter={() => setTooltip({ x: c.x, y: c.y, price: c.price, date: c.date })} />
                </g>
              ))}
            </svg>
            {tooltip && (() => {
              const pct = tooltip.x / W
              const anchor = pct < 0.2 ? "left" : pct > 0.8 ? "right" : "center"
              const style = {
                bottom: `${((H - tooltip.y) / H) * 100 + 14}%`,
                ...(anchor === "left" && { left: `${pct * 100}%`, transform: "translateX(0)" }),
                ...(anchor === "right" && { left: `${pct * 100}%`, transform: "translateX(-100%)" }),
                ...(anchor === "center" && { left: `${pct * 100}%`, transform: "translateX(-50%)" }),
              }
              return (
                <div className="absolute z-20 pointer-events-none px-2 py-[3px] rounded border border-[#555] bg-[#1e1e1e] text-[10px] text-white whitespace-nowrap shadow-lg" style={style}>
                  <div className="flex items-center gap-1">
                    <img src={coinIcon} alt="coin" className="w-3 h-3" />
                    <span className="font-bold">{tooltip.price}</span>
                    <span className="text-[#888]">•</span>
                    <span className="text-[#bbb]">{tooltip.date}</span>
                  </div>
                </div>
              )
            })()}
          </div>
          <div className="flex justify-between mt-[2px]">
            <span className="text-[9px] text-[#aaa]">mín {minPrice}</span>
            <span className="text-[9px] text-[#aaa]">máx {maxPrice}</span>
          </div>
        </>
      )}
    </div>
  )
}

// ─── ActionsMenu ──────────────────────────────────────────────────────────────

function ActionsMenu({ item, isFavorite, isWatching, isInInventory, onToggleFavorite, onToggleWatchlist, onAddToInventory, onTriggerFly, isLoggedIn }) {
  const [open, setOpen] = React.useState(false)
  const [pos, setPos] = React.useState({ top: 0, left: 0 })
  const btnRef = React.useRef(null)
  const menuRef = React.useRef(null)

  function handleToggle(e) {
    e.stopPropagation()
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      // Tenta abrir à direita; se ultrapassar a tela, abre à esquerda
      const menuWidth = 250
      const spaceRight = window.innerWidth - rect.right
      const left = spaceRight >= menuWidth
        ? rect.right - menuWidth
        : rect.left - menuWidth + rect.width
      setPos({ top: rect.bottom + 4, left: Math.max(8, left) })
    }
    setOpen((v) => !v)
  }

  React.useEffect(() => {
    if (!open) return
    function handleOutside(e) {
      if (!btnRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [open])

  function action(fn) {
    return (e) => {
      e.stopPropagation()
      fn?.()
      setOpen(false)
    }
  }

  const menu = open ? (
    <div
      ref={menuRef}
      style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 99999, width: 250 }}
      className={[
        "relative overflow-hidden rounded-[14px]",
        "border-[2px] border-[#7A7A7A]",
        "outline outline-[1px] outline-[#000000]",
        "bg-[#4D4D4D]",
        "shadow-[inset_1px_1px_0_#cfcfcf,inset_-1px_-1px_0_#2f2f2f,0_8px_18px_rgba(0,0,0,0.45)]",
      ].join(" ")}
    >
      {/* Header */}
      <div className="relative h-[28px] px-3 flex items-center bg-[#7A7A7A]">
        <span className="text-[10px] font-bold text-white">Ações</span>
        <div className="absolute right-[4px] top-0 bottom-0 flex items-center">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(false) }}
            title="Fechar"
            className="flex items-center justify-center cursor-pointer hover:brightness-110 active:translate-y-[1px]"
            style={{
              width: 18, height: 18, borderRadius: 4,
              background: "#7A7A7A",
              borderTop: "1.5px solid #000",
              borderLeft: "1.5px solid #000",
              borderRight: "1.5px solid #000",
              borderBottom: "2.5px solid #000",
              boxShadow: "inset 0 0 0 1px #8c8c8c",
            }}
          >
            <span
              className="block w-0 h-0 translate-y-[1px]"
              style={{
                borderLeft: "4px solid transparent",
                borderRight: "4px solid transparent",
                borderTop: "6px solid #ffffff",
              }}
            />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="bg-[#4D4D4D] shadow-[inset_1px_1px_0_#6e6e6e,inset_-1px_-1px_0_#3b3b3b]">
        {/* Monitorar */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            if (!isLoggedIn) return
            if (!isWatching) {
              const imgUrl = getFurnitureImageUrl(item.ClassName)
              if (onTriggerFly && btnRef.current && imgUrl) {
                const rect = btnRef.current.getBoundingClientRect()
                onTriggerFly(rect, imgUrl)
              }
            }
            onToggleWatchlist?.(item)
            setOpen(false)
          }}
          disabled={!isLoggedIn}
          className={`w-full flex items-center gap-[10px] px-3 py-[9px] text-left border-b border-[#3f3f3f] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${isLoggedIn
            ? "hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer"
            : "opacity-40 cursor-not-allowed"
            }`}
        >
          <img
            src={watchIcon}
            alt="Monitorar"
            className={`w-[16px] h-[16px] object-contain image-rendering-pixel ${isWatching ? "brightness-100" : "opacity-50"}`}
          />
          <span className="flex-1 text-[11px] text-[#d0d0d0]">
            {isWatching ? "Parar de monitorar" : "Monitorar preço"}
          </span>
          {!isLoggedIn && <span className="text-[9px] text-[#888]">Login necessário</span>}
          {isLoggedIn && isWatching && (
            <span className="text-[9px] font-bold px-[6px] py-[2px] rounded-full bg-[rgba(255,214,77,0.12)] text-[#ffd64d]">
              ativo
            </span>
          )}
        </button>

        {/* Favoritar */}
        <button
          type="button"
          onClick={action(onToggleFavorite)}
          className="w-full flex items-center gap-[10px] px-3 py-[9px] text-left border-b border-[#3f3f3f] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer"
        >
          <img
            src={starIcon}
            alt="Monitorar"
            className={`w-[16px] h-[16px] object-contain image-rendering-pixel ${isFavorite ? "brightness-100" : "opacity-50"}`}
          />
          <span className="flex-1 text-[11px] text-[#d0d0d0]">
            {isFavorite ? "Remover dos favoritos" : "Favoritar"}
          </span>
          {isFavorite && (
            <span className="text-[9px] font-bold px-[6px] py-[2px] rounded-full bg-[rgba(255,214,77,0.12)] text-[#ffd64d]">
              favoritado
            </span>
          )}
        </button>

        {/* Inventário */}
        <button
          type="button"
          onClick={isLoggedIn ? action(() => onAddToInventory?.(item)) : undefined}
          disabled={!isLoggedIn}
          className={`w-full flex items-center gap-[10px] px-3 py-[9px] text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${isLoggedIn
            ? "hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer"
            : "opacity-40 cursor-not-allowed"
            }`}
        >
          <img
            src={plusIcon}
            alt="Monitorar"
            className={`w-[16px] h-[16px] object-contain image-rendering-pixel ${isInInventory ? "brightness-100" : "opacity-50"}`}
          />
          <span className="flex-1 text-[11px] text-[#d0d0d0]">
            {isInInventory ? "Remover do inventário" : "Adicionar ao inventário"}
          </span>
          {!isLoggedIn && <span className="text-[9px] text-[#888]">Login necessário</span>}
          {isLoggedIn && isInInventory && (
            <span className="text-[9px] font-bold px-[6px] py-[2px] rounded-full bg-[rgba(124,252,138,0.12)] text-[#7CFC8A]">
              no inv.
            </span>
          )}
        </button>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        title="Ações"
        onClick={handleToggle}
        className={`w-[22px] h-[22px] shrink-0 flex items-center justify-center rounded-[4px] border transition-all cursor-pointer ${open
          ? "border-[#ffd64d] bg-[rgba(255,214,77,0.12)]"
          : "border-[#555] bg-[rgba(255,255,255,0.05)] hover:border-[#ffd64d] hover:bg-[rgba(255,214,77,0.08)]"
          }`}
      >
        <img
          src={toolIcon}
          alt="Ações"
          className="w-[14px] h-[14px] object-contain image-rendering-pixel"
        />
      </button>
      {typeof document !== "undefined" ? createPortal(menu, document.body) : null}
    </>
  )
}

// ─── FairResultCard ───────────────────────────────────────────────────────────

export default function FairResultCard({
  item,
  isFavorite = false,
  onToggleFavorite,
  creditRate,
  onSetCreditRate,
  onAddToInventory,
  isInInventory = false,
  isWatching = false,
  onToggleWatchlist,
  onTriggerFly,
  isLoggedIn = false
}) {
  const history = item?.marketData?.history || []
  const latestEntry = getLatestHistoryEntry(history)

  const priceNow = item?.marketData?.currentPrice ?? latestEntry?.[0] ?? item?.marketData?.averagePrice ?? "-"
  const averagePrice = item?.marketData?.averagePrice ?? "-"
  const openOffers = item?.marketData?.currentOpenOffers ?? latestEntry?.[3] ?? "-"

  const trendInfo = getTrendInfo(history)
  const timeAgoLabel = timeAgo(item?.marketData?.lastUpdated)
  const timeAgoColor = getTimeAgoColor(item?.marketData?.lastUpdated)
  const flag = getHotelFlag(item.hotel_domain)
  const formattedDate = formatLastUpdatedDate(item?.marketData?.lastUpdated)

  return (
    <div className="border border-[#8a8a8a] rounded-md px-3 py-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      {/* ── Cabeçalho ── */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-bold text-white break-words">
                {item.FurniName || "-"}
              </div>
              <div className="text-[11px] text-[#b7b7b7] break-all">
                {item.ClassName || "-"}
              </div>
            </div>

            <FurnitureImage classname={item.ClassName} furniName={item.FurniName} size="small" />
            {/* Menu de ações — substitui os 3 botões anteriores */}
            <ActionsMenu
              onTriggerFly={onTriggerFly}
              item={item}
              isFavorite={isFavorite}
              isWatching={isWatching}
              isInInventory={isInInventory}
              onToggleFavorite={onToggleFavorite}
              onToggleWatchlist={onToggleWatchlist}
              onAddToInventory={onAddToInventory}
              isLoggedIn={isLoggedIn}
            />
          </div>
        </div>

      </div>

      {/* ── Métricas ── */}
      <div className="grid grid-cols-3 gap-3 mb-2">
        <MetricBlock label="Preço atual" value={priceNow} showCoin coinIcon={coinIcon}>
          <span className={`text-[11px] font-bold ${trendInfo.colorClass}`}>
            {trendInfo.icon} {trendInfo.label}
          </span>
        </MetricBlock>
        <MetricBlock label="Média" value={averagePrice} showCoin coinIcon={coinIcon} />
        <MetricBlock label="Ofertas" value={openOffers} />
      </div>

      {/* ── Conversor de créditos ── */}
      {creditRate != null && onSetCreditRate && (
        <div className="mb-3">
          <CreditConverterBlock
            rateCredits={creditRate.credits}
            rateReais={creditRate.reais}
            onSetRate={onSetCreditRate}
            credits={typeof priceNow === "number" ? priceNow : null}
            compact
          />
        </div>
      )}

      {/* ── Linha do tempo de vendas ── */}
      <HistoryTimeline history={history} />

      {/* ── Gráfico de histórico de preços ── */}
      <PriceSparkline history={history} />

      {/* ── Rodapé ── */}
      <div className="flex items-end justify-between gap-3">
        <FurnitureImage classname={item.ClassName} furniName={item.FurniName} size="large" />
        <div className="flex-1 text-right">
          <div className="flex items-center justify-end flex-wrap gap-1 text-[11px] text-[#d6d6d6]">
            {flag && <img src={flag} alt={item.hotel_domain} className="w-4 h-4" />}
            <span>{item.hotel_domain?.toUpperCase()}</span>
            <span>•</span>
            <span>{formattedDate}</span>
            {timeAgoLabel && (
              <>
                <span>•</span>
                <span className={`font-bold ${timeAgoColor}`}>{timeAgoLabel}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}