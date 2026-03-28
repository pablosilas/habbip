import React from "react"
import { createPortal } from "react-dom"
import ConsoleCard from "../ui/ConsoleCard"
import FurnitureImage from "../ui/FurnitureImage"
import CreditConverterBlock from "../ui/CreditConverterBlock"
import coinIcon from "../../assets/coin.png"
import flagBr from "../../assets/flagbr.png"
import flagCom from "../../assets/flagcom.png"
import flagDe from "../../assets/flagde.png"
import flagEs from "../../assets/flages.png"
import flagFi from "../../assets/flagfi.png"
import flagFr from "../../assets/flagfr.png"
import flagIt from "../../assets/flagit.png"
import flagNl from "../../assets/flagnl.png"
import flagTr from "../../assets/flagtr.png"

// ── helpers ───────────────────────────────────────────────────────────────────

function getHotelFlag(hotel) {
  const map = { br: flagBr, com: flagCom, de: flagDe, es: flagEs, fi: flagFi, fr: flagFr, it: flagIt, nl: flagNl, tr: flagTr }
  return map[hotel] ?? null
}

function formatDateLabel(ts) {
  if (!ts) return "-"
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(ts * 1000))
}

function formatDateShort(ts) {
  if (!ts) return "-"
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(ts * 1000))
}

// ✅ DEPOIS
function formatLastUpdated(lastUpdated) {
  if (!lastUpdated) return "-"
  const [datePart, timePart] = lastUpdated.split(" at ")
  if (!datePart) return "-"
  const [y, m, d] = datePart.split("-")
  if (!y || !m || !d) return "-"
  const dateStr = `${d}/${m}/${y}`
  if (!timePart) return dateStr
  const [hh, mm] = timePart.split(":")
  return `${dateStr} às ${hh}:${mm}`
}

function timeAgo(lastUpdated) {
  if (!lastUpdated) return null
  const [datePart, timePart] = lastUpdated.split(" at ")
  if (!datePart) return null
  const [y, m, d] = datePart.split("-")
  const dateStr = timePart ? `${y}-${m}-${d}T${timePart}` : `${y}-${m}-${d}T00:00:00`
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
  return `há ${Math.floor(diffD / 30)} meses`
}

function getTimeAgoColor(lastUpdated) {
  if (!lastUpdated) return "text-[#888]"
  const [datePart] = lastUpdated.split(" at ")
  if (!datePart) return "text-[#888]"
  const [y, m, d] = datePart.split("-")
  const date = new Date(`${y}-${m}-${d}`)
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

function getTrendInfo(hasActiveOffers, currentPrice, averagePrice) {
  if (!hasActiveOffers) return null
  if (currentPrice == null || averagePrice == null || averagePrice <= 0) {
    return { label: "Sem tendência", icon: "•", colorClass: "text-[#cfcfcf]" }
  }
  if (currentPrice > averagePrice) return { label: "Subindo", icon: "▲", colorClass: "text-[#FF8A8A]" }
  if (currentPrice < averagePrice) return { label: "Caindo", icon: "▼", colorClass: "text-[#7CFC8A]" }
  return { label: "Estável", icon: "•", colorClass: "text-[#f1d97a]" }
}

// ── HistoryTimeline ───────────────────────────────────────────────────────────

function HistoryTimeline({ history = [] }) {
  const [expanded, setExpanded] = React.useState(false)
  const entries = history.filter((e) => (e?.[1] ?? 0) > 0 && e?.[4]).sort((a, b) => b[4] - a[4])
  if (entries.length === 0) return null

  const maxSold = Math.max(...entries.map((e) => e[1] ?? 0))
  const LIMIT = 4
  const visible = expanded ? entries : entries.slice(0, LIMIT)
  const hasMore = entries.length > LIMIT
  const latestTs = entries[0]?.[4]

  return (
    <div className="mb-3">
      <div
        className={`flex items-center justify-between mb-[6px] ${hasMore ? "cursor-pointer group" : ""}`}
        onClick={hasMore ? () => setExpanded((v) => !v) : undefined}
      >
        <span className="text-[9px] font-bold text-[#aaa] uppercase tracking-wider group-hover:text-[#ccc]">Vendas por dia</span>
        {hasMore && (
          <span className="text-[9px] text-[#aaa] group-hover:text-[#ccc]">
            {expanded ? "▲ recolher" : `▼ ver todos (${entries.length})`}
          </span>
        )}
      </div>
      <div className="space-y-[3px]">
        {visible.map((entry, i) => {
          const price = entry[0] ?? 0
          const sold = entry[1] ?? 0
          const openOffers = entry[3]
          const ts = entry[4]
          const barPct = maxSold > 0 ? (sold / maxSold) * 100 : 0
          const isLatest = ts === latestTs
          return (
            <div key={ts ?? i} className={`flex items-center gap-2 px-2 py-[3px] rounded ${isLatest ? "bg-[rgba(255,255,255,0.08)]" : "bg-[rgba(255,255,255,0.03)]"}`}>
              <span className={`text-[10px] shrink-0 w-[30px] text-right tabular-nums ${isLatest ? "text-[#e0e0e0] font-bold" : "text-[#888]"}`}>
                {formatDateShort(ts)}
              </span>
              <div className="flex-1 h-[6px] rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden min-w-0">
                <div className="h-full rounded-full transition-all" style={{ width: `${barPct}%`, backgroundColor: isLatest ? "#ffd64d" : "rgba(255,214,77,0.45)" }} />
              </div>
              <span className={`text-[10px] shrink-0 w-[32px] tabular-nums ${isLatest ? "text-[#ffd64d] font-bold" : "text-[#b0b0b0]"}`}>{sold} un.</span>
              <div className="flex items-center gap-[3px] shrink-0">
                <img src={coinIcon} alt="coin" className="w-4 h-4" />
                <span className={`text-[10px] tabular-nums ${isLatest ? "text-[#f1f1f1] font-bold" : "text-[#c0c0c0]"}`}>{price}</span>
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

// ── PriceSparkline ────────────────────────────────────────────────────────────

function PriceSparkline({ history = [] }) {
  const [tooltip, setTooltip] = React.useState(null)

  const currentYear = new Date().getFullYear()
  const points = history
    .filter((e) => e?.[0] > 0 && e?.[4] && new Date(e[4] * 1000).getFullYear() === currentYear)
    .sort((a, b) => a[4] - b[4])

  if (points.length < 2) return null

  const W = 280, H = 90, PAD_X = 4, PAD_Y = 8
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

  const first = prices[0], last = prices[prices.length - 1]
  const lineColor = last > first ? "#7CFC8A" : last < first ? "#FF8A8A" : "#f1d97a"
  const areaColor = last > first ? "rgba(124,252,138,0.08)" : last < first ? "rgba(255,138,138,0.08)" : "rgba(241,217,122,0.08)"

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-bold text-[#aaa] uppercase tracking-wider">Histórico de preços</span>
        <span className="text-[9px] text-[#666]">{currentYear}</span>
      </div>
      <div className="relative w-full" style={{ height: H }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.15" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#areaGrad)" />
          <path d={linePath} fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {coords.map((c, i) => (
            <g key={i}>
              <circle cx={c.x} cy={c.y} r={i === coords.length - 1 ? 3.5 : 2} fill={lineColor} stroke="#1a1a1a" strokeWidth="1" />
              <circle cx={c.x} cy={c.y} r="8" fill="transparent" className="cursor-crosshair"
                onMouseEnter={() => setTooltip({ x: c.x, y: c.y, price: c.price, date: c.date })}
                onMouseLeave={() => setTooltip(null)}
              />
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
                <img src={coinIcon} alt="coin" className="w-4 h-4" />
                <span className="font-bold">{tooltip.price}</span>
                <span className="text-[#888]">•</span>
                <span className="text-[#bbb]">{tooltip.date}</span>
              </div>
            </div>
          )
        })()}
      </div>
      <div className="flex justify-between mt-[2px]">
        <span className="text-[9px] text-[#aaa]">mín {Math.min(...prices)}</span>
        <span className="text-[9px] text-[#aaa]">máx {Math.max(...prices)}</span>
      </div>
    </div>
  )
}

// ── FairDetailModal ───────────────────────────────────────────────────────────

export default function FairDetailModal({ open, item, onClose, creditRate, onSetCreditRate }) {
  // Fecha com Escape
  React.useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === "Escape") onClose?.() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open || !item) return null

  const history = item?.marketData?.history || []
  const latestEntry = getLatestHistoryEntry(history)

  const rawPrice = item?.marketData?.currentPrice ?? latestEntry?.[0] ?? null
  const avg = item?.marketData?.averagePrice
  const averagePrice = avg && avg > 0 ? avg : null
  const openOffers = item?.marketData?.currentOpenOffers ?? latestEntry?.[3] ?? 0

  const hasActiveOffers = openOffers > 0 && rawPrice != null && rawPrice > 0
  const priceNow = hasActiveOffers ? rawPrice : null

  const trendInfo = getTrendInfo(hasActiveOffers, priceNow, averagePrice)
  const flag = getHotelFlag(item.hotel_domain)
  const lastUpdated = item.marketData?.lastUpdated ?? null
  const formattedDate = formatLastUpdated(lastUpdated)
  const timeAgoLabel = timeAgo(lastUpdated)
  const timeAgoColor = getTimeAgoColor(lastUpdated)

  const modal = (
    <div
      className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.55)] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[600px]">
        <ConsoleCard
          title={item.FurniName || "Detalhes"}
          onClose={onClose}
          expand
          className="w-full max-w-[600px] h-[90vh] flex flex-col"
          innerClassName="flex flex-col overflow-hidden"
        >
          {/* Header interno: imagem + nome + classname */}
          <div className="flex items-center gap-3 mb-3 shrink-0">
            <FurnitureImage classname={item.ClassName} furniName={item.FurniName} size="medium" angle="2_0" />
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-[13px] leading-tight truncate">{item.FurniName || "—"}</div>
              <div className="text-[#888] text-[10px] truncate font-mono">{item.ClassName}</div>
              {/* Metadados: hotel + data + tempo */}
              <div className="flex items-center gap-1 text-[#666] text-[9px] mt-[2px]">
                {flag && <img src={flag} alt={item.hotel_domain} className="w-3 h-3" />}
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

          {/* Scroll area */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3">

            {/* Métricas */}
            <div className="grid grid-cols-3 gap-2">
              <div className="border border-[#ffffff22] rounded-[6px] px-2 py-2 bg-[rgba(255,255,255,0.04)]">
                <div className="text-[9px] text-[#888] uppercase tracking-wider mb-1">Preço atual</div>
                {priceNow != null ? (
                  <div className="flex items-center gap-1 flex-wrap">
                    <img src={coinIcon} alt="coin" className="object-contain image-rendering-pixel w-4 h-4" />
                    <span className="text-[13px] text-[#ffd64d] font-bold tabular-nums">{priceNow.toLocaleString("pt-BR")}</span>
                    {trendInfo && <span className={`text-[10px] font-bold ${trendInfo.colorClass}`}>{trendInfo.icon}</span>}
                  </div>
                ) : (
                  <span className="text-[10px] text-[#666] italic">Sem oferta</span>
                )}
              </div>

              <div className="border border-[#ffffff22] rounded-[6px] px-2 py-2 bg-[rgba(255,255,255,0.04)]">
                <div className="text-[9px] text-[#888] uppercase tracking-wider mb-1">Média</div>
                {averagePrice != null ? (
                  <div className="flex items-center gap-1">
                    <img src={coinIcon} alt="coin" className="object-contain image-rendering-pixel w-4 h-4" />
                    <span className="text-[13px] text-[#f1f1f1] font-bold tabular-nums">{averagePrice.toLocaleString("pt-BR")}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-[#666] italic">—</span>
                )}
              </div>

              <div className="border border-[#ffffff22] rounded-[6px] px-2 py-2 bg-[rgba(255,255,255,0.04)]">
                <div className="text-[9px] text-[#888] uppercase tracking-wider mb-1">Ofertas</div>
                <span className="text-[13px] text-[#f1f1f1] font-bold tabular-nums">{openOffers}</span>
              </div>
            </div>

            {/* Tendência */}
            {trendInfo && (
              <div className="text-[10px]">
                <span className={`font-bold ${trendInfo.colorClass}`}>{trendInfo.icon} {trendInfo.label}</span>
              </div>
            )}

            {/* Conversor para real */}
            {priceNow != null && creditRate != null && onSetCreditRate && (
              <CreditConverterBlock
                rateCredits={creditRate.credits}
                rateReais={creditRate.reais}
                onSetRate={onSetCreditRate}
                credits={priceNow}
                compact
              />
            )}

            <div className="border-t border-dashed border-[#ffffff22]" />

            {/* Vendas por dia */}
            <HistoryTimeline history={history} />

            {/* Gráfico */}
            <PriceSparkline history={history} />

            {history.length === 0 && (
              <div className="text-[#888] text-[11px] text-center py-2">Sem histórico disponível.</div>
            )}
          </div>
        </ConsoleCard>
      </div>
    </div>
  )

  return typeof document !== "undefined" ? createPortal(modal, document.body) : null
}