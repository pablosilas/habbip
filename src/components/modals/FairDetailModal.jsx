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
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip as RTooltip, ReferenceLine,
} from "recharts"

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
  if (currentPrice == null || averagePrice == null || averagePrice <= 0)
    return { label: "Sem tendência", icon: "•", colorClass: "text-[#cfcfcf]" }
  if (currentPrice > averagePrice) return { label: "Subindo", icon: "▲", colorClass: "text-[#FF8A8A]" }
  if (currentPrice < averagePrice) return { label: "Caindo", icon: "▼", colorClass: "text-[#7CFC8A]" }
  return { label: "Estável", icon: "•", colorClass: "text-[#f1d97a]" }
}

function getPriceSignalData(currentPrice, averagePrice) {
  if (!currentPrice || currentPrice <= 0 || !averagePrice || averagePrice <= 0) return null
  const ratio = currentPrice / averagePrice
  if (ratio <= 0.90) return {
    label: "BARATO", color: "#7CFC8A", bg: "rgba(124,252,138,0.12)", border: "rgba(124,252,138,0.35)",
  }
  if (ratio >= 1.10) return {
    label: "CARO", color: "#FF8A8A", bg: "rgba(255,138,138,0.12)", border: "rgba(255,138,138,0.35)",
  }
  return {
    label: "JUSTO", color: "#f1d97a", bg: "rgba(241,217,122,0.12)", border: "rgba(241,217,122,0.35)",
  }
}

function getLiquidityInfo(daysWithSales) {
  const pct = daysWithSales / 30
  if (pct >= 0.67) return { label: "ATIVO", color: "#7CFC8A", borderColor: "rgba(124,252,138,0.25)", desc: "Vende quase diariamente." }
  if (pct >= 0.33) return { label: "REGULAR", color: "#f1d97a", borderColor: "rgba(241,217,122,0.25)", desc: "Vende com regularidade." }
  if (daysWithSales > 0) return { label: "BAIXO", color: "#aaa", borderColor: "rgba(255,255,255,0.15)", desc: "Baixa frequência de vendas." }
  return { label: "PARADO", color: "#666", borderColor: "rgba(255,255,255,0.1)", desc: "Sem vendas nos últimos 30 dias." }
}

function trendColor(t) {
  if (t == null) return "#888"
  return t > 0 ? "#FF8A8A" : t < 0 ? "#7CFC8A" : "#f1d97a"
}

// ── SectionHeader ─────────────────────────────────────────────────────────────

function SectionHeader({ label, right }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-[2px] h-2.5 bg-[#ffd64d] rounded-full shrink-0" />
      <span className="text-[9px] font-bold text-[#ffd64d] uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)]" />
      {right && <span className="text-[8px] text-[#aaa]">{right}</span>}
    </div>
  )
}

// ── HistoryBars ───────────────────────────────────────────────────────────────

function HistoryBars({ history = [] }) {
  const entries = React.useMemo(() =>
    [...history]
      .filter(e => e[0] > 0 && e[4])
      .sort((a, b) => b[4] - a[4]),
    [history]
  )

  if (entries.length === 0) return null

  return (
    <div className="flex flex-col h-full min-h-0">
      <SectionHeader label="Histórico diário" right={`${entries.length}d`} />
      <div className="flex-1 min-h-0 overflow-y-auto space-y-0.5">
        {entries.map((entry, i) => {
          const price = entry[0]
          const sold = entry[1] ?? 0
          const ts = entry[4]

          return (
            <div
              key={ts ?? i}
              className="flex items-center gap-2 px-1.25 py-1 rounded-xs hover:bg-[rgba(255,255,255,0.05)]"
            >
              <span className="text-[9px] text-[#888] tabular-nums shrink-0 font-mono leading-none w-17.5">{formatDateLabel(ts)}</span>

              <div className="flex items-center gap-0.5 shrink-0">
                <img src={coinIcon} alt="" className="w-2.25 h-2.25" />
                <span className="text-[10px] text-[#ffd64d] font-bold tabular-nums leading-none">{price.toLocaleString("pt-BR")}</span>
              </div>

              <span
                className="text-[9px] tabular-nums text-right flex-1 font-bold leading-none"
                style={{ color: sold > 0 ? "#7CFC8A" : "#555" }}
              >
                {sold > 0 ? `${sold}x` : "—"}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── PriceChart ────────────────────────────────────────────────────────────────

const PERIODS = [
  { id: "7d", label: "7d", days: 7 },
  { id: "30d", label: "30d", days: 30 },
  { id: "90d", label: "90d", days: 90 },
  { id: "1a", label: "1a", days: 365 },
  { id: "all", label: "Tudo", days: null },
]

function formatPriceCompact(n) {
  if (n == null) return ""
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="px-2 py-1 rounded border border-[#555] bg-[#1e1e1e] text-[10px] text-white shadow-lg">
      <div className="flex items-center gap-1 mb-[2px]">
        <img src={coinIcon} alt="coin" className="w-3 h-3" />
        <span className="font-bold tabular-nums">{data.price.toLocaleString("pt-BR")}</span>
      </div>
      {data.sold > 0 && <div className="text-[#7CFC8A] text-[9px]">{data.sold} vendidos</div>}
      <div className="text-[#bbb] text-[9px]">{data.dateLabel}</div>
    </div>
  )
}

function PriceChart({ history = [], averagePrice = null }) {
  const [periodId, setPeriodId] = React.useState("30d")

  const nowSeconds = React.useMemo(
    () => Math.floor(Date.now() / 1000),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history]
  )

  const allPoints = React.useMemo(() => {
    return history
      .filter((e) => e?.[0] > 0 && e?.[4])
      .map((e) => ({
        ts: e[4],
        price: e[0],
        sold: e[1] ?? 0,
        dateLabel: formatDateLabel(e[4]),
        dateShort: formatDateShort(e[4]),
      }))
      .sort((a, b) => a.ts - b.ts)
  }, [history])

  const filtered = React.useMemo(() => {
    const period = PERIODS.find((p) => p.id === periodId)
    if (!period?.days) return allPoints
    const cutoff = nowSeconds - period.days * 86400
    return allPoints.filter((p) => p.ts >= cutoff)
  }, [allPoints, periodId, nowSeconds])

  const availablePeriods = React.useMemo(() => {
    return PERIODS.map((p) => {
      if (!p.days) return { ...p, available: allPoints.length >= 2 }
      const cutoff = nowSeconds - p.days * 86400
      const count = allPoints.filter((pt) => pt.ts >= cutoff).length
      return { ...p, available: count >= 2 }
    })
  }, [allPoints, nowSeconds])

  if (allPoints.length < 2) return null

  if (filtered.length < 2) {
    return (
      <div className="mb-3">
        <ChartHeader periodId={periodId} setPeriodId={setPeriodId} periods={availablePeriods} />
        <div className="h-[140px] flex items-center justify-center text-[#aaa] text-[10px] italic border border-dashed border-[#3a3a3a] rounded">
          Sem dados suficientes para este período
        </div>
      </div>
    )
  }

  const first = filtered[0].price
  const last = filtered[filtered.length - 1].price
  const lineColor = last > first ? "#7CFC8A" : last < first ? "#FF8A8A" : "#f1d97a"
  const maxSold = Math.max(...filtered.map(p => p.sold))
  const showSold = maxSold > 0

  return (
    <div className="mb-3">
      <ChartHeader periodId={periodId} setPeriodId={setPeriodId} periods={availablePeriods} />

      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center gap-1">
          <div className="w-[14px] h-0 border-t-[2px] border-dashed border-[#ffd64d]" />
          <span className="text-[8px] text-[#888] ml-1">Preço (c)</span>
        </div>
        {showSold && (
          <div className="flex items-center gap-1">
            <div className="w-[12px] h-[8px] rounded-xs bg-[rgba(124,252,138,0.3)] border border-[rgba(124,252,138,0.5)]" />
            <span className="text-[8px] text-[#888]">Vendidos</span>
          </div>
        )}
      </div>

      <div className="w-full h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filtered} margin={{ top: 8, right: showSold ? 28 : 10, bottom: 4, left: -8 }}>
            <defs>
              <linearGradient id="priceAreaDtl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.15} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="soldAreaDtl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7CFC8A" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#7CFC8A" stopOpacity={0.04} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#333" strokeDasharray="2 4" vertical={false} />

            <XAxis
              dataKey="dateShort"
              tick={{ fill: "#888", fontSize: 9 }}
              tickLine={false}
              axisLine={{ stroke: "#444" }}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis
              yAxisId="price"
              tick={{ fill: "#888", fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatPriceCompact}
              width={40}
              domain={["auto", "auto"]}
            />
            {showSold && (
              <YAxis
                yAxisId="sold"
                orientation="right"
                tick={{ fill: "#7CFC8A66", fontSize: 8 }}
                tickLine={false}
                axisLine={false}
                width={22}
                allowDecimals={false}
                domain={[0, maxSold * 3]}
              />
            )}

            <RTooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "#ffd64d", strokeWidth: 1, strokeDasharray: "3 3" }}
            />

            {averagePrice != null && (
              <ReferenceLine
                yAxisId="price"
                y={averagePrice}
                stroke="#999"
                strokeDasharray="4 4"
                strokeOpacity={0.6}
                label={{
                  value: `média ${formatPriceCompact(averagePrice)}`,
                  position: "insideTopRight",
                  fill: "#999",
                  fontSize: 9,
                }}
              />
            )}

            {showSold && (
              <Area
                yAxisId="sold"
                type="monotone"
                dataKey="sold"
                stroke="#7CFC8A"
                strokeWidth={1}
                fill="url(#soldAreaDtl)"
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
            )}

            <Area
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke="none"
              fill="url(#priceAreaDtl)"
              isAnimationActive={false}
            />
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke="#ffd64d"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={{ r: 2, fill: "#ffd64d", stroke: "#1a1a1a", strokeWidth: 1 }}
              activeDot={{ r: 4, fill: "#ffd64d", stroke: "#1a1a1a", strokeWidth: 1.5 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between mt-[2px] px-1">
        <span className="text-[9px] text-[#aaa]">mín {Math.min(...filtered.map(p => p.price)).toLocaleString("pt-BR")}</span>
        <span className="text-[9px] text-[#aaa]">máx {Math.max(...filtered.map(p => p.price)).toLocaleString("pt-BR")}</span>
      </div>
    </div>
  )
}

function ChartHeader({ periodId, setPeriodId, periods }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-[2px] h-2.5 bg-[#ffd64d] rounded-full shrink-0" />
      <span className="text-[9px] font-bold text-[#ffd64d] uppercase tracking-widest">Histórico de preço</span>
      <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)]" />
      <div className="flex gap-[3px]">
        {periods.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => p.available && setPeriodId(p.id)}
            disabled={!p.available}
            className={[
              "px-1.25 py-[1px] text-[8px] font-bold border rounded-xs transition-colors cursor-pointer",
              "disabled:opacity-25 disabled:cursor-not-allowed",
              periodId === p.id
                ? "border-[#ffd64d] bg-[rgba(255,214,77,0.15)] text-[#ffd64d]"
                : "border-[#4a4a4a] text-[#aaa] hover:border-[#777] hover:text-[#aaa]",
            ].join(" ")}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── FairDetailModal ───────────────────────────────────────────────────────────

export default function FairDetailModal({ open, item, onClose, creditRate }) {
  const [now, setNow] = React.useState(() => Math.floor(Date.now() / 1000))
  React.useEffect(() => { setNow(Math.floor(Date.now() / 1000)) }, [open, item])

  React.useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === "Escape") onClose?.() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open || !item) return null

  // ── Data ────────────────────────────────────────────────────────────────────
  const history = item?.marketData?.history || []
  const cutoff7 = now - 7 * 86400
  const cutoff30 = now - 30 * 86400
  const cutoff90 = now - 90 * 86400

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
  const timeAgoLabel = timeAgo(lastUpdated)
  const timeAgoColor = getTimeAgoColor(lastUpdated)

  function toBRL(coins) {
    if (!creditRate?.credits || !creditRate?.reais || !coins) return null
    return coins * creditRate.reais / creditRate.credits
  }
  function fmtBRL(coins) {
    const v = toBRL(coins)
    if (v == null) return null
    return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // 7-day variation
  const entry7dAgo = [...history]
    .filter(e => e[4] <= cutoff7 && e[0] > 0)
    .sort((a, b) => b[4] - a[4])[0]
  const variation7d = priceNow && entry7dAgo?.[0] > 0
    ? ((priceNow - entry7dAgo[0]) / entry7dAgo[0]) * 100
    : null

  // 30-day stats
  const history30 = history.filter(e => e[4] >= cutoff30 && e[0] > 0)
  const daysWithSales30 = history30.filter(e => (e[1] ?? 0) > 0).length
  const totalSold30 = history30.reduce((s, e) => s + (e[1] ?? 0), 0)
  const avgDailyVolume = +(totalSold30 / 30).toFixed(1)

  // Trends
  const entry30dAgo = [...history].filter(e => e[4] <= cutoff30 && e[0] > 0).sort((a, b) => b[4] - a[4])[0]
  const entry90dAgo = [...history].filter(e => e[4] <= cutoff90 && e[0] > 0).sort((a, b) => b[4] - a[4])[0]
  const trend30 = priceNow && entry30dAgo?.[0] > 0
    ? ((priceNow - entry30dAgo[0]) / entry30dAgo[0]) * 100
    : null
  const trend90 = priceNow && entry90dAgo?.[0] > 0
    ? ((priceNow - entry90dAgo[0]) / entry90dAgo[0]) * 100
    : null

  // Historical min/max
  const allPricesArr = history.filter(e => e[0] > 0).map(e => e[0])
  const histMin = allPricesArr.length ? Math.min(...allPricesArr) : null
  const histMax = allPricesArr.length ? Math.max(...allPricesArr) : null

  // Signals
  const marketSignal = getPriceSignalData(priceNow, averagePrice)
  const liquidityInfo = getLiquidityInfo(daysWithSales30)

  // Fair zone bounds
  const fairLow = averagePrice ? Math.round(averagePrice * 0.88) : null
  const fairHigh = averagePrice ? Math.round(averagePrice * 1.08) : null

  function barPct(val) {
    if (!histMin || !histMax || histMin === histMax || val == null) return 0
    return Math.min(100, Math.max(0, (val - histMin) / (histMax - histMin) * 100))
  }

  const activeTrend = trend30 ?? trend90
  const activeTrendLabel = trend30 != null ? "30d" : trend90 != null ? "90d" : null

  const modal = (
    <div
      className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.55)] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[640px]">
        <ConsoleCard
          title={item.FurniName || "Detalhes"}
          onClose={onClose}
          expand
          className="w-full max-w-[640px] h-[90vh] flex flex-col"
          innerClassName="flex flex-col overflow-hidden"
        >
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3">

            {/* ── Item header ── */}
            <div className="flex items-center gap-3 pb-3 border-b border-[rgba(255,255,255,0.07)]">
              <div className="shrink-0 rounded-md bg-[rgba(0,0,0,0.3)] border border-[#3a3a3a] hover:border-[#ffd64d66] transition-colors p-2">
                <FurnitureImage classname={item.ClassName} furniName={item.FurniName} size="large" angle="2_0" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[#ffd64d] font-bold text-[14px] leading-tight truncate">{item.FurniName || "—"}</div>
                {item.FurniDesc && (
                  <div className="text-[#aaa] text-[9px] italic mt-[2px] truncate font-mono">"{item.FurniDesc}"</div>
                )}
                <div className="flex items-center gap-1 mt-[4px]">
                  {flag && <img src={flag} alt={item.hotel_domain} className="w-3 h-3 shrink-0" />}
                  <span className="text-[9px] text-[#aaa] font-bold uppercase tracking-wide">{item.hotel_domain}</span>
                  {timeAgoLabel && (
                    <>
                      <span className="text-[#333]">·</span>
                      <span className={`text-[9px] ${timeAgoColor}`}>{timeAgoLabel}</span>
                    </>
                  )}
                  {openOffers > 0 && (
                    <>
                      <span className="text-[#333]">·</span>
                      <span className="text-[9px] text-[#aaa]">{openOffers} oferta{openOffers !== 1 ? "s" : ""}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ── Price block + History ── */}
            <div className="flex gap-3 items-stretch">

              {/* Price block */}
              <div
                className="flex-1 min-w-0 rounded-md border border-[#3a3a3a] hover:border-[#ffd64d66] transition-colors p-3"
                style={{ background: "rgb(58,58,58)" }}
              >
                <div className="flex items-start justify-between gap-3">

                  {/* Left: current price */}
                  <div>
                    <SectionHeader label="Preço atual" />
                    {priceNow != null ? (
                      <>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            {trendInfo && (
                              <span className={`text-[11px] font-bold leading-none ${trendInfo.colorClass}`}>{trendInfo.icon}</span>
                            )}
                            <img src={coinIcon} alt="" className="w-[15px] h-[15px]" />
                            <span className="text-[26px] text-[#ffd64d] font-bold tabular-nums leading-none">
                              {priceNow.toLocaleString("pt-BR")}
                            </span>
                          </div>

                          {marketSignal && (
                            <span
                              className="text-[8px] font-bold px-[6px] py-0.5 rounded-xs tracking-wider leading-none"
                              style={{ color: marketSignal.color, background: marketSignal.bg, border: `1px solid ${marketSignal.border}` }}
                            >
                              {marketSignal.label}
                            </span>
                          )}

                          {variation7d != null && (
                            <span className={[
                              "text-[8px] font-bold px-[4px] py-[1px] rounded-xs border tabular-nums leading-none",
                              variation7d >= 0
                                ? "text-[#FF8A8A] bg-[rgba(255,138,138,0.08)] border-[rgba(255,138,138,0.25)]"
                                : "text-[#7CFC8A] bg-[rgba(124,252,138,0.08)] border-[rgba(124,252,138,0.25)]",
                            ].join(" ")}>
                              {variation7d >= 0 ? "+" : ""}{variation7d.toFixed(1)}% 7d
                            </span>
                          )}
                        </div>

                        {fmtBRL(priceNow) && (
                          <div className="text-[10px] text-[#aaa] mt-[3px] font-mono">{fmtBRL(priceNow)}</div>
                        )}
                      </>
                    ) : (
                      <span className="text-[12px] text-[#aaa] italic">sem oferta ativa</span>
                    )}
                  </div>

                  {/* Right: média Habbo */}
                  {averagePrice != null && (
                    <div className="text-right shrink-0">
                      <div className="text-[8px] text-[#aaa] uppercase tracking-widest mb-1">Média Habbo</div>
                      <div className="flex items-baseline gap-0.5 justify-end">
                        <span className="text-[16px] text-[#888] font-bold tabular-nums leading-none">{averagePrice.toLocaleString("pt-BR")}</span>
                        <span className="text-[10px] text-[#aaa]">c</span>
                      </div>
                      {priceNow != null && (
                        <div
                          className="text-[9px] mt-[2px] tabular-nums font-mono"
                          style={{ color: trendColor((priceNow / averagePrice - 1) * 100) }}
                        >
                          {(priceNow / averagePrice - 1) >= 0 ? "+" : ""}
                          {((priceNow / averagePrice - 1) * 100).toFixed(1)}% vs média
                        </div>
                      )}
                      {fmtBRL(averagePrice) && (
                        <div className="text-[8px] text-[#aaa] font-mono">{fmtBRL(averagePrice)}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Range bar */}
                {histMin != null && histMax != null && histMin < histMax && (
                  <div className="mt-4">

                    {/* Floating price pin above bar */}
                    {priceNow != null && (
                      <div className="relative h-5.5">
                        <div
                          className="absolute -translate-x-1/2 flex flex-col items-center pointer-events-none"
                          style={{ left: `${barPct(priceNow)}%` }}
                        >
                          <span
                            className="text-[8px] font-bold tabular-nums px-1.25 py-0.5 rounded-xs leading-none whitespace-nowrap"
                            style={{
                              color: marketSignal?.color ?? "#ffd64d",
                              background: marketSignal?.bg ?? "rgba(255,214,77,0.12)",
                              border: `1px solid ${marketSignal?.border ?? "rgba(255,214,77,0.3)"}`,
                            }}
                          >
                            {priceNow.toLocaleString("pt-BR")}c
                          </span>
                          <div style={{
                            width: 0, height: 0,
                            borderLeft: "4px solid transparent",
                            borderRight: "4px solid transparent",
                            borderTop: `5px solid ${marketSignal?.color ?? "#ffd64d"}`,
                            opacity: 0.55,
                          }} />
                        </div>
                      </div>
                    )}

                    {/* Track */}
                    <div
                      className="relative h-5 rounded-md overflow-hidden mb-2"
                      style={{ background: "#1a1a1a", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}
                    >
                      {/* Subtle heatmap gradient */}
                      <div className="absolute inset-0" style={{
                        background: "linear-gradient(90deg, rgba(255,100,80,0.07) 0%, rgba(255,255,255,0.02) 50%, rgba(80,220,100,0.07) 100%)",
                      }} />

                      {/* Fair zone fill */}
                      {fairLow != null && fairHigh != null && (
                        <div
                          className="absolute top-0 bottom-0"
                          style={{
                            left: `${barPct(fairLow)}%`,
                            width: `${Math.max(0, barPct(fairHigh) - barPct(fairLow))}%`,
                            background: "rgba(124,252,138,0.2)",
                            borderLeft: "1px solid rgba(124,252,138,0.55)",
                            borderRight: "1px solid rgba(124,252,138,0.55)",
                          }}
                        />
                      )}

                      {/* Price needle */}
                      {priceNow != null && (
                        <div
                          className="absolute top-0 bottom-0 w-1"
                          style={{
                            left: `${barPct(priceNow)}%`,
                            transform: "translateX(-1px)",
                            background: marketSignal?.color ?? "#ffd64d",
                            boxShadow: `0 0 6px ${marketSignal?.color ?? "#ffd64d"}88`,
                          }}
                        />
                      )}
                    </div>

                    {/* Labels row */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[8px] text-[#777] font-mono leading-none">mín</div>
                        <div className="text-[9px] text-[#bbb] font-bold tabular-nums font-mono mt-px">
                          {histMin.toLocaleString("pt-BR")}c
                        </div>
                      </div>
                      {fairLow != null && fairHigh != null && (
                        <div className="flex flex-col items-center">
                          <div className="text-[7px] uppercase tracking-widest leading-none" style={{ color: "#5a9e5a" }}>zona justa</div>
                          <div className="text-[9px] font-bold font-mono mt-px" style={{ color: "#72c472" }}>
                            {fairLow.toLocaleString("pt-BR")}–{fairHigh.toLocaleString("pt-BR")}c
                          </div>
                        </div>
                      )}
                      <div className="text-right">
                        <div className="text-[8px] text-[#777] font-mono leading-none">máx</div>
                        <div className="text-[9px] text-[#bbb] font-bold tabular-nums font-mono mt-px">
                          {histMax.toLocaleString("pt-BR")}c
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* History panel */}
              {history.length > 0 && (
                <div
                  className="w-[195px] shrink-0 rounded-md border border-[#333] hover:border-[#ffd64d66] transition-colors p-2 max-h-[320px] flex flex-col"
                  style={{ background: "rgb(58,58,58)" }}
                >
                  <HistoryBars history={history} />
                </div>
              )}

            </div>{/* end flex price+history */}

            {/* ── 3-col stats ── */}
            <div className="grid grid-cols-3 gap-2">

              {/* Liquidez */}
              <div className="rounded-md border border-[#333] hover:border-[#ffd64d66] transition-colors p-2" style={{ background: "rgb(58,58,58)" }}>
                <SectionHeader label="Liquidez" />
                <div className="flex items-baseline gap-1 mb-1">
                  <span
                    className="text-[18px] font-bold tabular-nums leading-none"
                    style={{ color: liquidityInfo.color }}
                  >
                    {daysWithSales30}
                  </span>
                  <span className="text-[8px] text-[#aaa]">/ 30d</span>
                </div>
                <span
                  className="text-[8px] font-bold px-[4px] py-[1px] rounded-xs leading-none"
                  style={{
                    color: liquidityInfo.color,
                    background: `${liquidityInfo.color}18`,
                    border: `1px solid ${liquidityInfo.borderColor}`,
                  }}
                >
                  {liquidityInfo.label}
                </span>
                <div className="text-[9px] text-[#888] mt-2 leading-tight">{liquidityInfo.desc}</div>
              </div>

              {/* Volume */}
              <div className="rounded-md border border-[#333] hover:border-[#ffd64d66] transition-colors p-2" style={{ background: "rgb(58,58,58)" }}>
                <SectionHeader label="Volume / dia" />
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-[18px] font-bold text-[#e0e0e0] tabular-nums leading-none">{avgDailyVolume}</span>
                  <span className="text-[8px] text-[#aaa]">unid.</span>
                </div>
                <div className="text-[8px] text-[#aaa]">{totalSold30} vendas em 30 dias</div>
                <div className="text-[9px] text-[#888] mt-2 leading-tight">
                  {avgDailyVolume >= 3
                    ? "Alto volume de negociação."
                    : avgDailyVolume >= 1
                      ? "Volume moderado de negociação."
                      : avgDailyVolume > 0
                        ? "Baixo volume de negociação."
                        : "Sem negociações recentes."}
                </div>
              </div>

              {/* Tendência */}
              <div className="rounded-md border border-[#333] hover:border-[#ffd64d66] transition-colors p-2" style={{ background: "rgb(58,58,58)" }}>
                <SectionHeader label="Tendência" />
                {activeTrend != null ? (
                  <>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span
                        className="text-[18px] font-bold tabular-nums leading-none"
                        style={{ color: trendColor(activeTrend) }}
                      >
                        {activeTrend >= 0 ? "+" : ""}{activeTrend.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-[8px] text-[#aaa]">{activeTrendLabel}</div>
                    <div className="text-[9px] text-[#888] mt-2 leading-tight">
                      {activeTrend >= 10
                        ? "Preço em forte alta."
                        : activeTrend > 0
                          ? "Preço subindo levemente."
                          : activeTrend === 0
                            ? "Preço estável."
                            : activeTrend > -10
                              ? "Preço caindo levemente."
                              : "Preço em forte queda."}
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-[13px] text-[#aaa] italic">—</span>
                    <div className="text-[9px] text-[#888] mt-2 leading-tight">Dados insuficientes.</div>
                  </>
                )}
              </div>
            </div>


            <div className="border-t border-[rgba(255,255,255,0.06)]" />

            {/* ── Chart ── */}
            <PriceChart history={history} averagePrice={averagePrice} />

            {history.length === 0 && (
              <div className="text-[#aaa] text-[11px] text-center py-2 italic">Sem histórico disponível.</div>
            )}

          </div>
        </ConsoleCard>
      </div>
    </div>
  )

  return typeof document !== "undefined" ? createPortal(modal, document.body) : null
}
