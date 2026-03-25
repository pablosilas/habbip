import {
  fetchOfficialMarketBatchSafe,
  mergeOfficialMarketData,
} from "./habboApi"
import { fetchWithRetry } from "../utils/fetchWithRetry"
import { fetchWithQueue } from "../utils/requestQueue"

const HABBIP_API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

/**
 * Busca mobis no Furnidata com retry automático
 * Usa fila de requisições para limitar concorrência
 */
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
  // Remove o parâmetro days — API oficial não suporta
  const furniItems = await searchByFurnidata(query, hotel)

  // Backend sinalizou resultados demais
  if (furniItems?.tooMany) {
    const err = new Error("Sua busca retornou mais de 400 resultados. Tente um nome mais específico.")
    err.tooMany = true
    throw err
  }

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
    const currentPrice = item?.marketData?.currentPrice

    // Mostra item se tiver histórico com preços
    if (Array.isArray(history) && history.length > 0) {
      if (history.some(e => (e?.[0] ?? 0) > 0)) return true
    }

    // Mostra item se tiver média > 0
    if (averagePrice && averagePrice > 0) return true

    // Mostra item se tiver preço em circulação > 0
    if (currentPrice && currentPrice > 0) return true

    return false
  })
}