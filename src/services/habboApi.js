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