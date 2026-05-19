import {
  fetchOfficialMarketBatchSafe,
  mergeOfficialMarketData,
} from "./habboApi"
import { fetchWithQueue } from "../utils/requestQueue"

const HABBIP_API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

async function searchByFurnidata(query, hotel) {
  const url = `${HABBIP_API_BASE}/furnidata/search?q=${encodeURIComponent(query)}&hotel=${hotel}`
  try {
    const res = await fetchWithQueue(url)
    if (!res.ok) {
      console.error(`Busca de furnidata falhou: ${res.status}`)
      return []
    }
    return res.json()
  } catch (error) {
    console.error("Erro ao buscar furnidata:", error)
    return []
  }
}

export async function searchMarketItems({ query, hotel = "br" }) {
  const furniItems = await searchByFurnidata(query, hotel)

  if (furniItems?.tooMany) {
    const err = new Error("Sua busca retornou mais de 400 resultados. Tente um nome mais específico.")
    err.tooMany = true
    throw err
  }

  if (furniItems.length === 0) return []

  // Separa itens que já sabemos que não têm dados de mercado (posters)
  const noMarketItems = furniItems.filter(i => i.noMarketData)
  const marketItems = furniItems.filter(i => !i.noMarketData)

  const legacyNoMarket = noMarketItems.map(i => ({
    ClassName: i.classname,
    FurniName: i.furniName,
    FurniDesc: i.furniDesc ?? null,
    FurniType: i.furniType,
    Revision: i.revision,
    Tradeable: i.tradeable ?? true,
    NoMarketData: true,
    hotel_domain: hotel,
  }))

  if (marketItems.length === 0) return legacyNoMarket

  const batchItems = marketItems.map(i => ({
    classname: i.classname,
    furniType: i.furniType,
  }))

  let officialBatch = null
  try {
    officialBatch = await fetchOfficialMarketBatchSafe(batchItems, hotel)
  } catch { /* empty */ }

  const legacyItems = marketItems.map(i => ({
    ClassName: i.classname,
    FurniName: i.furniName,
    FurniDesc: i.furniDesc ?? null,
    FurniType: i.furniType,
    Revision: i.revision,
    Tradeable: i.tradeable ?? true,
    NoMarketData: false,
    hotel_domain: hotel,
  }))

  const merged = officialBatch
    ? mergeOfficialMarketData(legacyItems, officialBatch)
    : legacyItems

  const withMarketData = merged.filter(item => item?.marketData !== undefined)

  // Posters vêm no final, separados dos itens com preço
  return [...withMarketData, ...legacyNoMarket]
}