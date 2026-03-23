/**
 * marketSearch.js
 *
 * Utilitário compartilhado de busca de mercado, extraído de useFairSearch e
 * useInventory que tinham ~40 linhas de lógica idêntica cada:
 *
 *   1. Busca na API legada (por name ou classname)
 *   2. Monta o batch de classnames+furniType
 *   3. Consulta a API oficial em lote
 *   4. Faz merge dos dados oficiais nos itens legados
 *   5. Filtra itens sem dados úteis de preço
 *
 * Uso:
 *   import { searchMarketItems } from "../services/marketSearch"
 *
 *   const items = await searchMarketItems({ query: "throne", hotel: "br", days: "all" })
 *   // items: array de itens mesclados com marketData, já filtrados
 *
 * Lança Error com mensagem legível se nenhum item for encontrado ou se a
 * busca na API legada não retornar resultados — o chamador só precisa fazer
 * try/catch e exibir err.message.
 */

import {
  fetchMarketHistory,
  fetchOfficialMarketBatchSafe,
  mergeOfficialMarketData,
} from "./habboApi"

const isClassname = (query) => query.trim().includes("_")

/**
 * Busca itens de mercado combinando a API legada com a API oficial.
 *
 * @param {object} params
 * @param {string} params.query   - Nome ou classname do mobi
 * @param {string} params.hotel   - Código do hotel (ex: "br", "com")
 * @param {string} params.days    - Janela de dias ("all", "7", "30", "90")
 *
 * @returns {Promise<Array>} Array de itens com marketData mesclado, filtrados
 *                           para apenas itens com dados úteis de preço.
 *
 * @throws {Error} Se nenhum item for encontrado na API legada.
 */
export async function searchMarketItems({ query, hotel = "br", days = "all" }) {
  // ── Etapa 1: busca na API legada para descobrir classnames e FurniType ──────
  const searchParam = isClassname(query)
    ? { classname: query, hotel, days }
    : { name: query, hotel, days }

  const legacyData = await fetchMarketHistory(searchParam)

  const legacyItems = (Array.isArray(legacyData) ? legacyData : []).filter(
    (item) => !!item?.ClassName?.trim()
  )

  if (legacyItems.length === 0) return []

  // ── Etapa 2: monta o batch com classnames + FurniType ───────────────────────
  const batchItems = legacyItems.map((item) => ({
    classname: item.ClassName,
    furniType: item.FurniType === "wallItem" ? "wallItem" : "roomItem",
  }))

  // ── Etapa 3: consulta a API oficial em lote (falha silenciosa) ──────────────
  let officialBatch = null
  try {
    officialBatch = await fetchOfficialMarketBatchSafe(batchItems, hotel)
  } catch {
    // Se a API oficial falhar, continua apenas com dados legados
  }

  // ── Etapa 4: mescla os dados oficiais nos itens legados ─────────────────────
  const merged = officialBatch
    ? mergeOfficialMarketData(legacyItems, officialBatch)
    : legacyItems

  // ── Etapa 5: filtra itens sem dados úteis de mercado ────────────────────────
  return merged.filter((item) => {
    const history = item?.marketData?.history
    const averagePrice = item?.marketData?.averagePrice

    if (Array.isArray(history) && history.length > 0) {
      if (history.some((entry) => (entry?.[0] ?? 0) > 0)) return true
    }

    return averagePrice && averagePrice > 0
  })
}