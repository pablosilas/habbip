import React from "react"
import { getFurnitureImageUrl } from "../../../services/habboApi"
import coinIcon from "../../../assets/coin.png"
import flagBr from "../../../assets/flagbr.png"
import flagCom from "../../../assets/flagcom.png"

function formatDateLabel(timestampInSeconds) {
  if (!timestampInSeconds) return "-"

  const date = new Date(timestampInSeconds * 1000)

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date)
}

function formatLastUpdatedDate(lastUpdated) {
  if (!lastUpdated) return "-"

  const [datePart] = lastUpdated.split(" at ")
  if (!datePart) return "-"

  const [year, month, day] = datePart.split("-")
  if (!year || !month || !day) return "-"

  return `${day}/${month}/${year.slice(2)}`
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
    return {
      label: "Sem tendência",
      icon: "•",
      colorClass: "text-[#cfcfcf]",
    }
  }

  if (latestPrice > previousPrice) {
    return {
      label: "Subindo",
      icon: "▲",
      colorClass: "text-[#7CFC8A]",
    }
  }

  if (latestPrice < previousPrice) {
    return {
      label: "Caindo",
      icon: "▼",
      colorClass: "text-[#FF8A8A]",
    }
  }

  return {
    label: "Estável",
    icon: "•",
    colorClass: "text-[#f1d97a]",
  }
}

function findHistoryByDaysWithTolerance(history = [], targetDaysAgo, toleranceInDays = 0) {
  if (!Array.isArray(history) || history.length === 0) return null

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const targetDate = new Date(now)
  targetDate.setDate(targetDate.getDate() - targetDaysAgo)

  let closest = null
  let closestDiff = Infinity

  for (const entry of history) {
    const timestamp = entry?.[4]
    if (!timestamp) continue

    const entryDate = new Date(timestamp * 1000)
    entryDate.setHours(0, 0, 0, 0)

    const diffInDays = Math.abs(
      (entryDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffInDays <= toleranceInDays && diffInDays < closestDiff) {
      closest = entry
      closestDiff = diffInDays
    }
  }

  return closest
}

function getHotelFlag(hotel) {
  if (hotel === "br") return flagBr
  if (hotel === "com") return flagCom
  return null
}

function MetricBlock({ label, value, showCoin = false, coinIcon, children }) {
  return (
    <div>
      <div className="text-[11px] font-bold text-white">{label}</div>

      <div className="text-[13px] text-[#f1f1f1] flex items-center gap-1 flex-wrap">
        {showCoin && coinIcon && (
          <img src={coinIcon} alt="coin" className="w-4 h-4" />
        )}
        <span>{value ?? "-"}</span>
        {children}
      </div>
    </div>
  )
}

function HistoryInfo({ title, entry, coinIcon }) {
  const soldItems = entry?.[1] ?? 0
  const averagePrice = entry?.[0] ?? "-"
  const timestamp = entry?.[4]

  return (
    <div className="bg-[rgba(255,255,255,0.06)] px-2 py-1 rounded">
      <div className="text-[11px] font-bold text-white">{title}</div>

      <div className="text-[11px] text-[#e6e6e6] flex items-center gap-1 flex-wrap">
        {soldItems} un. por
        <img src={coinIcon} alt="coin" className="w-3 h-3" />
        {averagePrice}
        {timestamp && (
          <span className="text-[#bdbdbd] ml-1">
            • {formatDateLabel(timestamp)}
          </span>
        )}
      </div>
    </div>
  )
}

function FurnitureImage({ classname, furniName, size = "small" }) {
  const [hasError, setHasError] = React.useState(false)
  const imageUrl = getFurnitureImageUrl(classname)

  const sizeClass =
    size === "large"
      ? "w-[88px] h-[88px]"
      : "w-[44px] h-[44px]"

  return (
    <div className={`${sizeClass} shrink-0 flex items-center justify-center overflow-hidden`}>
      {!hasError && imageUrl ? (
        <img
          src={imageUrl}
          alt={furniName || "Mobi"}
          className="max-w-full max-h-full object-contain image-rendering-pixel"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="text-[10px] text-[#bdbdbd] text-center leading-tight">
          sem imagem
        </div>
      )}
    </div>
  )
}

export default function FairResultCard({ item }) {
  const history = item?.marketData?.history || []
  const latestEntry = getLatestHistoryEntry(history)

  const priceNow = latestEntry?.[0] ?? item?.marketData?.averagePrice ?? "-"
  const averagePrice = item?.marketData?.averagePrice ?? "-"
  const openOffers = latestEntry?.[3] ?? "-"
  const soldToday = findHistoryByDaysWithTolerance(history, 0, 0)
  const sold2Days = findHistoryByDaysWithTolerance(history, 2, 1)
  const sold20Days = findHistoryByDaysWithTolerance(history, 20, 2)
  const sold30Days = findHistoryByDaysWithTolerance(history, 30, 3)

  const trendInfo = getTrendInfo(history)
  const flag = getHotelFlag(item.hotel_domain)
  const formattedDate = formatLastUpdatedDate(item?.marketData?.lastUpdated)

  const historyCards = [
    { title: "Itens vendidos hoje", entry: soldToday },
    { title: "Vendidos há 2 dias", entry: sold2Days },
    { title: "Vendidos há 20 dias", entry: sold20Days },
    { title: "Vendidos há um mês", entry: sold30Days },
  ].filter(({ entry }) => entry && (entry[1] ?? 0) > 0)

  return (
    <div className="border border-[#8a8a8a] rounded-md px-3 py-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="text-[15px] font-bold text-white break-words">
            {item.FurniName || "-"}
          </div>
          <div className="text-[11px] text-[#b7b7b7] break-all">
            {item.ClassName || "-"}
          </div>
        </div>

        <FurnitureImage
          classname={item.ClassName}
          furniName={item.FurniName}
          size="small"
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-3">
        <MetricBlock
          label="Preço atual"
          value={priceNow}
          showCoin
          coinIcon={coinIcon}
        >
          <span className={`text-[11px] font-bold ${trendInfo.colorClass}`}>
            {trendInfo.icon} {trendInfo.label}
          </span>
        </MetricBlock>

        <MetricBlock
          label="Média"
          value={averagePrice}
          showCoin
          coinIcon={coinIcon}
        />

        <MetricBlock label="Ofertas" value={openOffers} />
      </div>

      {historyCards.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {historyCards.map((historyItem) => (
            <HistoryInfo
              key={historyItem.title}
              title={historyItem.title}
              entry={historyItem.entry}
              coinIcon={coinIcon}
            />
          ))}
        </div>
      ) : null}

      <div className="flex items-end justify-between gap-3">
        <FurnitureImage
          classname={item.ClassName}
          furniName={item.FurniName}
          size="large"
        />

        <div className="flex-1 text-right">
          <div className="flex items-center justify-end gap-1 text-[11px] text-[#d6d6d6]">
            {flag && <img src={flag} alt={item.hotel_domain} className="w-4 h-4" />}
            <span>{item.hotel_domain?.toUpperCase()}</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  )
}