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
import starOn from "../../../assets/star_on.png"
import starOff from "../../../assets/star_off.png"

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
  if (latestPrice > previousPrice) {
    return { label: "Subindo", icon: "▲", colorClass: "text-[#7CFC8A]" }
  }
  if (latestPrice < previousPrice) {
    return { label: "Caindo", icon: "▼", colorClass: "text-[#FF8A8A]" }
  }
  return { label: "Estável", icon: "•", colorClass: "text-[#f1d97a]" }
}

function getHotelFlag(hotel) {
  if (hotel === "br") return flagBr
  if (hotel === "com") return flagCom
  if (hotel === "de") return flagDe
  if (hotel === "es") return flagEs
  if (hotel === "fi") return flagFi
  if (hotel === "fr") return flagFr
  if (hotel === "it") return flagIt
  if (hotel === "nl") return flagNl
  if (hotel === "tr") return flagTr
  return null
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

/**
 * HistoryTimeline
 *
 * Exibe todos os registros do histórico em uma linha do tempo compacta,
 * do mais antigo ao mais recente. Cada linha mostra:
 *   • data (dd/mm)
 *   • barra proporcional à quantidade vendida
 *   • quantidade vendida (un.)
 *   • preço médio com ícone de moeda
 *   • ofertas abertas (se disponível)
 */
function HistoryTimeline({ history = [] }) {
  const [expanded, setExpanded] = React.useState(false)

  // Filtra entradas com pelo menos 1 item vendido e com timestamp válido,
  // ordena do mais recente ao mais antigo
  const entries = history
    .filter((e) => (e?.[1] ?? 0) > 0 && e?.[4])
    .sort((a, b) => b[4] - a[4])

  if (entries.length === 0) return null

  const maxSold = Math.max(...entries.map((e) => e[1] ?? 0))

  // Mostra apenas os 4 mais recentes quando recolhido (já estão no início do array)
  const COLLAPSED_LIMIT = 4
  const visible = expanded ? entries : entries.slice(0, COLLAPSED_LIMIT)
  const hasMore = entries.length > COLLAPSED_LIMIT

  // O mais recente é sempre o primeiro do array completo
  const latestTimestamp = entries[0]?.[4]

  return (
    <div className="mb-3">
      {/* Cabeçalho */}
      <div
        className={`flex items-center justify-between mb-[6px] ${hasMore ? "cursor-pointer group" : ""}`}
        onClick={hasMore ? () => setExpanded((v) => !v) : undefined}
      >
        <span className="text-[9px] font-bold text-[#aaa] uppercase tracking-wider group-hover:text-[#ccc] transition-colors">
          Vendas por dia
        </span>
        {hasMore && (
          <span className="text-[9px] text-[#aaa] group-hover:text-[#ccc] transition-colors">
            {expanded ? `▲ recolher` : `▼ ver todos (${entries.length})`}
          </span>
        )}
      </div>

      {/* Linhas */}
      <div className="space-y-[3px]">
        {visible.map((entry, i) => {
          const price = entry[0] ?? 0
          const sold = entry[1] ?? 0
          const openOffers = entry[3]
          const timestamp = entry[4]
          const barPct = maxSold > 0 ? (sold / maxSold) * 100 : 0

          // Destaca a entrada mais recente — sempre o maior timestamp, independente de expandido
          const isLatest = timestamp === latestTimestamp

          return (
            <div
              key={timestamp ?? i}
              className={`flex items-center gap-2 px-2 py-[3px] rounded transition-colors ${isLatest
                ? "bg-[rgba(255,255,255,0.08)]"
                : "bg-[rgba(255,255,255,0.03)]"
                }`}
            >
              {/* Data */}
              <span
                className={`text-[10px] shrink-0 w-[30px] text-right tabular-nums ${isLatest ? "text-[#e0e0e0] font-bold" : "text-[#888]"
                  }`}
              >
                {formatDateShort(timestamp)}
              </span>

              {/* Barra de quantidade */}
              <div className="flex-1 h-[6px] rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden min-w-0">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${barPct}%`,
                    backgroundColor: isLatest ? "#ffd64d" : "rgba(255,214,77,0.45)",
                  }}
                />
              </div>

              {/* Vendas */}
              <span
                className={`text-[10px] shrink-0 w-[32px] tabular-nums ${isLatest ? "text-[#ffd64d] font-bold" : "text-[#b0b0b0]"
                  }`}
              >
                {sold} un.
              </span>

              {/* Preço médio */}
              <div className="flex items-center gap-[3px] shrink-0">
                <img src={coinIcon} alt="coin" className="w-3 h-3" />
                <span
                  className={`text-[10px] tabular-nums ${isLatest ? "text-[#f1f1f1] font-bold" : "text-[#c0c0c0]"
                    }`}
                >
                  {price}
                </span>
              </div>

              {/* Ofertas abertas (opcional) */}
              {openOffers != null && openOffers > 0 && (
                <span className="text-[9px] text-[#666] shrink-0">
                  {openOffers} of.
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FurnitureImage({ classname, furniName, size = "small" }) {
  const [status, setStatus] = React.useState("loading") // "loading" | "ok" | "error"
  const imageUrl = getFurnitureImageUrl(classname)
  const sizeClass = size === "large" ? "w-[88px] h-[88px]" : "w-[44px] h-[44px]"

  // Reseta o status quando o classname muda
  React.useEffect(() => { setStatus("loading") }, [classname])

  return (
    <div className={`${sizeClass} shrink-0 flex items-center justify-center overflow-hidden`}>
      {/* box.png aparece enquanto carrega e também como fallback de erro */}
      {(status === "loading" || status === "error" || !imageUrl) && (
        <img
          src={boxIcon}
          alt="carregando"
          className={`max-w-full max-h-full object-contain image-rendering-pixel ${status === "loading" ? "opacity-40 animate-pulse" : "opacity-60"}`}
        />
      )}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={furniName || "Mobi"}
          className={`max-w-full max-h-full object-contain image-rendering-pixel ${status === "ok" ? "block" : "hidden"}`}
          onLoad={() => setStatus("ok")}
          onError={() => setStatus("error")}
        />
      )}
    </div>
  )
}

/**
 * PriceSparkline
 *
 * Gráfico SVG de linha mostrando evolução do preço ao longo do histórico.
 * Tooltip aparece ao passar o mouse sobre cada ponto com preço + data.
 */
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

  const W = 260
  const H = 90
  const PAD_X = 4
  const PAD_Y = 8

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

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ")

  const areaPath =
    linePath +
    ` L ${coords[coords.length - 1].x.toFixed(1)} ${H} L ${coords[0].x.toFixed(1)} ${H} Z`

  const firstPrice = prices[0]
  const lastPrice = prices[prices.length - 1]

  const lineColor =
    lastPrice > firstPrice ? "#7CFC8A" :
      lastPrice < firstPrice ? "#FF8A8A" :
        "#f1d97a"

  const areaColor =
    lastPrice > firstPrice ? "rgba(124,252,138,0.08)" :
      lastPrice < firstPrice ? "rgba(255,138,138,0.08)" :
        "rgba(241,217,122,0.08)"

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
                <line
                  key={t}
                  x1={PAD_X}
                  y1={(PAD_Y + t * (H - PAD_Y * 2)).toFixed(1)}
                  x2={W - PAD_X}
                  y2={(PAD_Y + t * (H - PAD_Y * 2)).toFixed(1)}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
              ))}

              <path d={areaPath} fill={areaColor} />

              <path
                d={linePath}
                fill="none"
                stroke={lineColor}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {coords.map((c, i) => (
                <g key={i}>
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={tooltip?.price === c.price && tooltip?.date === c.date ? 5 : 3.5}
                    fill={lineColor}
                    stroke="#1a1a1a"
                    strokeWidth="1"
                  />
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r="8"
                    fill="transparent"
                    className="cursor-crosshair"
                    onMouseEnter={() => setTooltip({ x: c.x, y: c.y, price: c.price, date: c.date })}
                  />
                </g>
              ))}
            </svg>

            {tooltip && (() => {
              const pct = tooltip.x / W
              const anchor =
                pct < 0.2 ? "left" :
                  pct > 0.8 ? "right" :
                    "center"

              const style = {
                bottom: `${((H - tooltip.y) / H) * 100 + 14}%`,
                ...(anchor === "left" && { left: `${pct * 100}%`, transform: "translateX(0)" }),
                ...(anchor === "right" && { left: `${pct * 100}%`, transform: "translateX(-100%)" }),
                ...(anchor === "center" && { left: `${pct * 100}%`, transform: "translateX(-50%)" }),
              }

              return (
                <div
                  className="absolute z-20 pointer-events-none px-2 py-[3px] rounded border border-[#555] bg-[#1e1e1e] text-[10px] text-white whitespace-nowrap shadow-lg"
                  style={style}
                >
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

/**
 * FairResultCard
 *
 * Props:
 *   isFavorite        {boolean}    Se o mobi está nos favoritos
 *   onToggleFavorite  {function}   Callback para adicionar/remover dos favoritos
 */
export default function FairResultCard({ item, isFavorite = false, onToggleFavorite }) {
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

            {onToggleFavorite && (
              <button
                type="button"
                title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                onClick={onToggleFavorite}
                className="shrink-0 cursor-pointer transition-transform hover:scale-125"
              >
                <img
                  src={isFavorite ? starOn : starOff}
                  alt={isFavorite ? "remover favorito" : "adicionar favorito"}
                  className={isFavorite ? "w-5 h-5 image-rendering-pixel" : "w-4 h-4 image-rendering-pixel opacity-50"}
                />
              </button>
            )}
          </div>
        </div>

        <FurnitureImage classname={item.ClassName} furniName={item.FurniName} size="small" />
      </div>

      {/* ── Métricas ── */}
      <div className="grid grid-cols-2 xs:grid-cols-3 gap-3 mb-3">
        <MetricBlock label="Preço atual" value={priceNow} showCoin coinIcon={coinIcon}>
          <span className={`text-[11px] font-bold ${trendInfo.colorClass}`}>
            {trendInfo.icon} {trendInfo.label}
          </span>
        </MetricBlock>
        <MetricBlock label="Média" value={averagePrice} showCoin coinIcon={coinIcon} />
        <MetricBlock label="Ofertas" value={openOffers} />
      </div>

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