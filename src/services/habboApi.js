const HABBO_PUBLIC_API_BASE = "https://www.habbo.com.br/api/public"
const HABBIP_API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

import { fetchWithRetry } from "../utils/fetchWithRetry"
import { fetchWithQueue } from "../utils/requestQueue"

async function handleResponse(response, defaultMessage) {
  if (!response.ok) throw new Error(defaultMessage)
  return response.json()
}

async function fetchOfficialMarketBatch(items, hotel = "br") {
  const roomItems = []
  const wallItems = []
  for (const { classname, furniType } of items) {
    if (!classname?.trim()) continue
    const entry = { item: classname.trim() }
    if (furniType === "wallItem") wallItems.push(entry)
    else roomItems.push(entry)
  }
  const body = { roomItems, wallItems }
  const baseUrl = getHotelBaseUrl(hotel)
  const response = await fetchWithQueue(`${baseUrl}/api/public/marketplace/stats/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return handleResponse(response, "Erro ao consultar estatísticas oficiais.")
}

function chunk(arr, size) {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size))
  return chunks
}

export async function fetchOfficialMarketBatchSafe(items, hotel = "br") {
  const roomItems = items.filter(i => i.furniType !== "wallItem")
  const wallItems = items.filter(i => i.furniType === "wallItem")
  const roomChunks = chunk(roomItems, 25)
  const wallChunks = chunk(wallItems, 25)
  const totalChunks = Math.max(roomChunks.length, wallChunks.length, 1)
  const results = await Promise.all(
    Array.from({ length: totalChunks }, (_, i) =>
      fetchOfficialMarketBatch(
        [...(roomChunks[i] ?? []), ...(wallChunks[i] ?? [])],
        hotel
      ).catch(() => null)
    )
  )
  return results.reduce((acc, batch) => {
    if (!batch) return acc
    return {
      roomItemData: [...(acc.roomItemData ?? []), ...(batch.roomItemData ?? [])],
      wallItemData: [...(acc.wallItemData ?? []), ...(batch.wallItemData ?? [])],
    }
  }, { roomItemData: [], wallItemData: [] })
}

function normalizeOfficialHistoryEntry(entry, statsDate) {
  const dayOffset = Number(entry.dayOffset ?? 0)
  const price = Number(entry.averagePrice ?? 0)
  const sold = Number(entry.totalSoldItems ?? 0)
  const creditSum = Number(entry.totalCreditSum ?? 0)
  const openOffers = Number(entry.totalOpenOffers ?? 0)
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

function normalizeOfficialItem(officialItem, statsDate) {
  const history = (officialItem.history ?? [])
    .map((entry) => normalizeOfficialHistoryEntry(entry, statsDate))
    .filter(([price]) => price > 0)
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

export function mergeOfficialMarketData(legacyItems, officialBatch) {
  const officialMap = new Map()
  const statsDate =
    officialBatch.roomItemData?.[0]?.statsDate ??
    officialBatch.wallItemData?.[0]?.statsDate ??
    null
  for (const entry of officialBatch.roomItemData ?? []) {
    if (entry.item) officialMap.set(entry.item.toLowerCase(), { data: entry, statsDate: entry.statsDate ?? statsDate })
  }
  for (const entry of officialBatch.wallItemData ?? []) {
    if (entry.item) officialMap.set(entry.item.toLowerCase(), { data: entry, statsDate: entry.statsDate ?? statsDate })
  }
  return legacyItems.map((item) => {
    const key = item.ClassName?.toLowerCase()
    const official = key ? officialMap.get(key) : null
    if (!official) return item
    return { ...item, marketData: normalizeOfficialItem(official.data, official.statsDate) }
  })
}

let imageUrlActiveRequests = 0
const IMAGE_URL_MAX_CONCURRENT = 5
const imageUrlQueue = []

function processImageUrlQueue() {
  while (imageUrlQueue.length > 0 && imageUrlActiveRequests < IMAGE_URL_MAX_CONCURRENT) {
    const { resolve, fn } = imageUrlQueue.shift()
    imageUrlActiveRequests++
    fn().then(resolve).catch(() => resolve("")).finally(() => {
      imageUrlActiveRequests--
      processImageUrlQueue()
    })
  }
}

function queueImageUrlRequest(fn) {
  return new Promise((resolve) => {
    imageUrlQueue.push({ resolve, fn })
    processImageUrlQueue()
  })
}

// ── Imagens de furniture ──────────────────────────────────────────────────────
const imageMemoryCache = new Map()
const imagePendingMap = new Map()

export async function getFurnitureImageUrl(classname, hotel = "br") {
  if (!classname) return ""

  const base = classname
  const key = `${base}:${hotel}`

  if (imageMemoryCache.has(key)) return imageMemoryCache.get(key)

  if (!imagePendingMap.has(key)) {
    const promise = queueImageUrlRequest(() =>
      fetchWithQueue(`${HABBIP_API_BASE}/furnidata/image-url?classname=${encodeURIComponent(base)}&hotel=${hotel}`)
        .then(r => r.ok ? r.json() : null)
        .then(async data => {
          let url = data?.url || ""

          // Fallback para /image-icon se /image-url não encontrou nada
          if (!url) {
            try {
              const iconRes = await fetchWithQueue(
                `${HABBIP_API_BASE}/furnidata/image-icon?classname=${encodeURIComponent(base)}&hotel=${hotel}`
              )
              if (iconRes.ok) {
                const iconData = await iconRes.json()
                url = iconData?.url || ""
              }
            } catch { /* empty */ }
          }

          imageMemoryCache.set(key, url)
          imagePendingMap.delete(key)
          return url
        })
        .catch(() => { imagePendingMap.delete(key); return "" })
    )
    imagePendingMap.set(key, promise)
  }

  return imagePendingMap.get(key)
}

export async function getFurnitureIconUrl(classname, hotel = "br") {
  if (!classname) return ""

  const base = classname
  const key = `icon:${base}:${hotel}`

  if (imageMemoryCache.has(key)) return imageMemoryCache.get(key)

  if (!imagePendingMap.has(key)) {
    const promise = fetchWithQueue(
      `${HABBIP_API_BASE}/furnidata/image-icon?classname=${encodeURIComponent(base)}&hotel=${hotel}`
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const url = data?.url || ""
        imageMemoryCache.set(key, url)
        imagePendingMap.delete(key)
        return url
      })
      .catch(() => {
        imagePendingMap.delete(key)
        return ""
      })

    imagePendingMap.set(key, promise)
  }

  return imagePendingMap.get(key)
}

// ── Usuários ──────────────────────────────────────────────────────────────────

export async function fetchUserByName(nick) {
  const response = await fetchWithRetry(`${HABBO_PUBLIC_API_BASE}/users?name=${encodeURIComponent(nick.trim())}`)
  return handleResponse(response, "Erro ao buscar usuário.")
}

export async function fetchUserProfileById(userId) {
  const response = await fetchWithRetry(`${HABBO_PUBLIC_API_BASE}/users/${userId}/profile`)
  return handleResponse(response, "Erro ao buscar perfil do usuário.")
}

export async function fetchUserGroupsById(userId) {
  const response = await fetchWithRetry(`${HABBO_PUBLIC_API_BASE}/users/${userId}/groups`)
  return handleResponse(response, "Erro ao buscar grupos do usuário.")
}

export async function fetchUserBadgesById(userId) {
  const response = await fetchWithRetry(`${HABBO_PUBLIC_API_BASE}/users/${userId}/badges`)
  return handleResponse(response, "Erro ao buscar badges do usuário.")
}

export async function fetchUserRoomsById(userId) {
  const response = await fetchWithRetry(`${HABBO_PUBLIC_API_BASE}/users/${userId}/rooms`)
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

export function getHabboAvatarHeadUrl({ name, hotel = "br", size = "m", direction = 3, headDirection = 3, gesture = "sml" }) {
  if (!name) return ""
  return `${getHotelBaseUrl(hotel)}/habbo-imaging/avatarimage?user=${encodeURIComponent(name)}&direction=${direction}&head_direction=${headDirection}&gesture=${gesture}&size=${size}&headonly=1`
}

export function getHabboAvatarUrl({ name, hotel = "br", size = "b", direction = 2, headDirection = 2, action = "std", gesture = "std" }) {
  if (!name) return ""
  return `${getHotelBaseUrl(hotel)}/habbo-imaging/avatarimage?user=${encodeURIComponent(name)}&action=${action}&direction=${direction}&head_direction=${headDirection}&gesture=${gesture}&size=${size}`
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
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date)
}