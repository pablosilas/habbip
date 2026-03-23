import {
  fetchOfficialMarketBatchSafe,
  mergeOfficialMarketData,
} from "./habboApi"

const HABBIP_API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

async function searchByFurnidata(query, hotel) {
  const res = await fetch(
    `${HABBIP_API_BASE}/furnidata/search?q=${encodeURIComponent(query)}&hotel=${hotel}`
  )
  if (!res.ok) return []
  return res.json()
}

export async function searchMarketItems({ query, hotel = "br" }) {
  // Remove o parâmetro days — API oficial não suporta
  const furniItems = await searchByFurnidata(query, hotel)
  if (furniItems.length === 0) return []

  const batchItems = furniItems.map(i => ({
    classname: i.classname,
    furniType: i.furniType,
  }))

  let officialBatch = null
  try {
    officialBatch = await fetchOfficialMarketBatchSafe(batchItems, hotel)
  } catch { /* empty */ }

  const legacyItems = furniItems.map(i => ({
    ClassName: i.classname,
    FurniName: i.furniName,
    FurniType: i.furniType,
    Revision: i.revision,
    hotel_domain: hotel,
  }))

  const merged = officialBatch
    ? mergeOfficialMarketData(legacyItems, officialBatch)
    : legacyItems

  return merged.filter(item => {
    const history = item?.marketData?.history
    const averagePrice = item?.marketData?.averagePrice
    if (Array.isArray(history) && history.length > 0) {
      if (history.some(e => (e?.[0] ?? 0) > 0)) return true
    }
    return averagePrice && averagePrice > 0
  })
}