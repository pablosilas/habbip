const HABBO_PUBLIC_API_BASE = "https://www.habbo.com.br/api/public"
const HABBO_MARKET_API_BASE = "https://habboapi.site"

async function handleResponse(response, defaultMessage) {
  if (!response.ok) {
    throw new Error(defaultMessage)
  }

  return response.json()
}

export async function fetchMarketHistory({
  name,
  classname,
  hotel = "br",
  days = "all",
}) {
  if (!name?.trim() && !classname?.trim()) {
    throw new Error("Informe um nome ou classname.")
  }

  const params = new URLSearchParams()
  if (name?.trim()) params.set("name", name.trim())
  if (classname?.trim()) params.set("classname", classname.trim())
  params.set("hotel", hotel)
  params.set("days", days)

  const response = await fetch(
    `${HABBO_MARKET_API_BASE}/api/market/history?${params.toString()}`
  )

  return handleResponse(response, "Erro ao consultar a feira.")
}

/**
 * Busca estatísticas oficiais em lote da API pública do Habbo.
 * Recebe um array de itens { classname, furniType: "roomItem" | "wallItem" }
 * e retorna o JSON bruto da API.
 */
export async function fetchOfficialMarketBatch(items, hotel = "br") {
  const roomItems = []
  const wallItems = []

  for (const { classname, furniType } of items) {
    if (!classname?.trim()) continue
    const entry = { item: classname.trim() }
    if (furniType === "wallItem") {
      wallItems.push(entry)
    } else {
      roomItems.push(entry)
    }
  }

  const body = { roomItems, wallItems }
  const baseUrl = getHotelBaseUrl(hotel)

  const response = await fetch(
    `${baseUrl}/api/public/marketplace/stats/batch`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  )

  return handleResponse(response, "Erro ao consultar estatísticas oficiais.")
}

/**
 * Converte uma entrada de histórico da API oficial do Habbo para o formato
 * de array legado esperado pelos componentes:
 *   [averagePrice, totalSoldItems, totalCreditSum, totalOpenOffers, timestampInSeconds]
 *
 * O timestamp é calculado a partir de statsDate (YYYY-MM-DD) somado ao dayOffset.
 */
function normalizeOfficialHistoryEntry(entry, statsDate) {
  const dayOffset = Number(entry.dayOffset ?? 0)
  const price = Number(entry.averagePrice ?? 0)
  const sold = Number(entry.totalSoldItems ?? 0)
  const creditSum = Number(entry.totalCreditSum ?? 0)
  const openOffers = Number(entry.totalOpenOffers ?? 0)

  // Calcula o timestamp em segundos para a data referente ao dayOffset
  let timestamp = null
  if (statsDate) {
    const base = new Date(`${statsDate}T00:00:00`)
    if (!isNaN(base.getTime())) {
      base.setDate(base.getDate() + dayOffset)
      timestamp = Math.floor(base.getTime() / 1000)
    }
  }

  return [price, sold, creditSum, openOffers, timestamp]
}

/**
 * Converte um item retornado pela API oficial (roomItemData / wallItemData)
 * para o formato de marketData esperado pelos componentes React.
 */
function normalizeOfficialItem(officialItem, statsDate) {
  const history = (officialItem.history ?? [])
    .map((entry) => normalizeOfficialHistoryEntry(entry, statsDate))
    .filter(([price]) => price > 0)

  // Usa a data atual para lastUpdated — a statsDate da API pode ser futura
  const now = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  const lastUpdated = `${todayStr} at ${timeStr}`

  return {
    averagePrice: officialItem.averagePrice ?? 0,
    currentPrice: officialItem.currentPrice ?? 0,
    totalOpenOffers: officialItem.totalOpenOffers ?? 0,
    currentOpenOffers: officialItem.currentOpenOffers ?? 0,
    soldItemCount: officialItem.soldItemCount ?? 0,
    creditSum: officialItem.creditSum ?? 0,
    history,
    lastUpdated,
  }
}

/**
 * Mescla os dados da API oficial do Habbo nos itens vindos da HABBO_MARKET_API_BASE.
 * Substitui item.marketData pelos dados oficiais quando disponíveis.
 *
 * @param {Array}  legacyItems   - Array de itens da API legada (com FurniName, ClassName, FurniType, etc.)
 * @param {Object} officialBatch - Resposta bruta de fetchOfficialMarketBatch
 * @returns {Array} itens mesclados
 */
export function mergeOfficialMarketData(legacyItems, officialBatch) {
  // Indexa os dados oficiais por classname (case-insensitive)
  const officialMap = new Map()

  const statsDate =
    officialBatch.roomItemData?.[0]?.statsDate ??
    officialBatch.wallItemData?.[0]?.statsDate ??
    null

  for (const entry of officialBatch.roomItemData ?? []) {
    if (entry.item) {
      officialMap.set(entry.item.toLowerCase(), {
        data: entry,
        statsDate: entry.statsDate ?? statsDate,
      })
    }
  }
  for (const entry of officialBatch.wallItemData ?? []) {
    if (entry.item) {
      officialMap.set(entry.item.toLowerCase(), {
        data: entry,
        statsDate: entry.statsDate ?? statsDate,
      })
    }
  }

  return legacyItems.map((item) => {
    const key = item.ClassName?.toLowerCase()
    const official = key ? officialMap.get(key) : null

    if (!official) return item

    return {
      ...item,
      marketData: normalizeOfficialItem(official.data, official.statsDate),
    }
  })
}

export function getFurnitureImageUrl(classname) {
  if (!classname) return ""
  return `${HABBO_MARKET_API_BASE}/api/image/${encodeURIComponent(classname)}`
}

export async function fetchUserByName(nick) {
  const response = await fetch(
    `${HABBO_PUBLIC_API_BASE}/users?name=${encodeURIComponent(nick.trim())}`
  )

  return handleResponse(response, "Erro ao buscar usuário.")
}

export async function fetchUserProfileById(userId) {
  const response = await fetch(`${HABBO_PUBLIC_API_BASE}/users/${userId}/profile`)
  return handleResponse(response, "Erro ao buscar perfil do usuário.")
}

export async function fetchUserGroupsById(userId) {
  const response = await fetch(`${HABBO_PUBLIC_API_BASE}/users/${userId}/groups`)
  return handleResponse(response, "Erro ao buscar grupos do usuário.")
}

export async function fetchUserBadgesById(userId) {
  const response = await fetch(`${HABBO_PUBLIC_API_BASE}/users/${userId}/badges`)
  return handleResponse(response, "Erro ao buscar badges do usuário.")
}

export async function fetchUserRoomsById(userId) {
  const response = await fetch(`${HABBO_PUBLIC_API_BASE}/users/${userId}/rooms`)
  return handleResponse(response, "Erro ao buscar quartos do usuário.")
}

export function getHotelBaseUrl(hotel = "br") {
  const normalizedHotel = String(hotel).toLowerCase()

  const hotelMap = {
    br: "https://www.habbo.com.br",
    com: "https://www.habbo.com",
    de: "https://www.habbo.de",
    es: "https://www.habbo.es",
    fi: "https://www.habbo.fi",
    fr: "https://www.habbo.fr",
    it: "https://www.habbo.it",
    nl: "https://www.habbo.nl",
    tr: "https://www.habbo.com.tr",
  }

  return hotelMap[normalizedHotel] || "https://www.habbo.com.br"
}

export function getHabboAvatarHeadUrl({
  name,
  hotel = "br",
  size = "m",
  direction = 3,
  headDirection = 3,
  gesture = "sml",
}) {
  if (!name) return ""

  return `${getHotelBaseUrl(hotel)}/habbo-imaging/avatarimage?user=${encodeURIComponent(
    name
  )}&direction=${direction}&head_direction=${headDirection}&gesture=${gesture}&size=${size}&headonly=1`
}

export function getHabboAvatarUrl({
  name,
  hotel = "br",
  size = "b",
  direction = 2,
  headDirection = 2,
  action = "std",
  gesture = "std",
}) {
  if (!name) return ""

  return `${getHotelBaseUrl(hotel)}/habbo-imaging/avatarimage?user=${encodeURIComponent(
    name
  )}&action=${action}&direction=${direction}&head_direction=${headDirection}&gesture=${gesture}&size=${size}`
}

export function getHabboBadgeUrl(code) {
  if (!code) return ""
  return `https://images.habbo.com/c_images/album1584/${code}.png`
}

export function getHabboGroupBadgeUrl({ badgeCode, hotel = "br" }) {
  if (!badgeCode) return ""
  return `${getHotelBaseUrl(hotel)}/habbo-imaging/badge/${encodeURIComponent(badgeCode)}.png`
}

export function getHabboProfileUrl({ name, hotel = "br" }) {
  if (!name) return "#"
  return `${getHotelBaseUrl(hotel)}/profile/${encodeURIComponent(name)}`
}

export function getHabboRoomUrl({ roomId, hotel = "br" }) {
  if (!roomId) return "#"
  return `${getHotelBaseUrl(hotel)}/hotel?room=${roomId}`
}

export function formatHabboDate(dateString) {
  if (!dateString) return "-"

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) return "-"

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date)
}