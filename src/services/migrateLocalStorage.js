/**
 * migrateLocalStorage
 *
 * Roda uma única vez após o primeiro login/cadastro de um usuário.
 *
 * 1. Migra dados do sistema antigo (habbodesk:*) para o servidor
 * 2. Migra dados anônimos da sessão atual (habbip:anon:*) para o servidor,
 *    permitindo que quem usou o app sem conta não perca seus dados ao criar conta.
 */

import { syncAllData } from "./authService"

const MIGRATED_FLAG = "habbip:migrated_v1"
const ANON_INVENTORY_KEY = "habbip:anon:inventory"

function readLegacy(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function legacyUserKey(username) {
  return username.trim().toLowerCase().replace(/\s+/g, "_")
}

/**
 * Migra dados anônimos (habbip:anon:*) para o servidor logo após criar conta.
 * Deve ser chamado imediatamente após o cadastro bem-sucedido.
 */
export async function migrateAnonDataOnRegister() {
  try {
    const anonInventory = readLegacy(ANON_INVENTORY_KEY, [])
    const anonCreditRate = readLegacy("habbip:anon:creditrate", null)

    const hasData = anonInventory.length > 0 || anonCreditRate != null

    if (!hasData) return

    const payload = {}

    if (anonInventory.length > 0) {
      payload.inventory = anonInventory
    }

    if (anonCreditRate?.credits > 0 && anonCreditRate?.reais > 0) {
      payload.settings = { creditRate: anonCreditRate }
    }

    // Migra histórico anônimo também
    const anonMobiHistory = readLegacy("habbip:anon:history:mobi_history", null)
    const anonUserHistory = readLegacy("habbip:anon:history:user_history", null)
    const anonInvHistory = readLegacy("habbip:anon:history:inv_history", null)

    if (anonMobiHistory) payload.mobi_history = anonMobiHistory
    if (anonUserHistory) payload.user_history = anonUserHistory
    if (anonInvHistory) payload.inv_history = anonInvHistory

    await syncAllData(payload)

    // Limpa dados anônimos após migração bem-sucedida
    localStorage.removeItem(ANON_INVENTORY_KEY)
    localStorage.removeItem("habbip:anon:creditrate")

    console.log("[Habbip] Dados anônimos migrados para a conta com sucesso.")
  } catch (err) {
    console.warn("[Habbip] Falha ao migrar dados anônimos:", err.message)
    // Não limpa — vai tentar de novo depois
  }
}

/**
 * Migração do sistema legado (habbodesk:*) — mantida para compatibilidade.
 */
export async function migrateLocalStorage(username) {
  const flag = `${MIGRATED_FLAG}:${username.toLowerCase()}`
  if (localStorage.getItem(flag) === "true") return

  const uk = legacyUserKey(username)

  const legacyInventory = readLegacy(`habbodesk:${uk}:inventory`, [])
  const legacyWatchlist = readLegacy(`habbodesk:${uk}:watchlist`, [])

  const legacySettings = {}
  const legacyCreditRate = readLegacy(`habbodesk:${uk}:creditrate`, null)
  if (legacyCreditRate?.credits > 0 && legacyCreditRate?.reais > 0) {
    legacySettings.creditRate = legacyCreditRate
  }

  const legacyMobiHistory = {
    history: readLegacy(`habbodesk:${uk}:history:mobi`, []),
    favorites: readLegacy(`habbodesk:${uk}:favorites:mobi`, []),
  }
  const legacyUserHistory = {
    history: readLegacy(`habbodesk:${uk}:history:user`, []),
    favorites: readLegacy(`habbodesk:${uk}:favorites:user`, []),
  }
  const legacyInvHistory = {
    history: readLegacy(`habbodesk:${uk}:history:inventory`, []),
    favorites: readLegacy(`habbodesk:${uk}:favorites:inventory`, []),
  }
  const legacyNotifications = readLegacy(`habbodesk:${uk}:notifications`, [])

  const hasLegacyData =
    legacyInventory.length > 0 ||
    legacyWatchlist.length > 0 ||
    legacyMobiHistory.history.length > 0 ||
    legacyUserHistory.history.length > 0 ||
    legacyInvHistory.history.length > 0 ||
    legacyNotifications.length > 0 ||
    Object.keys(legacySettings).length > 0

  if (!hasLegacyData) {
    localStorage.setItem(flag, "true")
    return
  }

  try {
    await syncAllData({
      inventory: legacyInventory,
      watchlist: legacyWatchlist,
      settings: legacySettings,
      mobi_history: legacyMobiHistory,
      user_history: legacyUserHistory,
      inv_history: legacyInvHistory,
      notifications: legacyNotifications,
    })

    const keysToRemove = [
      `habbodesk:${uk}:inventory`,
      `habbodesk:${uk}:watchlist`,
      `habbodesk:${uk}:creditrate`,
      `habbodesk:${uk}:history:mobi`,
      `habbodesk:${uk}:favorites:mobi`,
      `habbodesk:${uk}:history:user`,
      `habbodesk:${uk}:favorites:user`,
      `habbodesk:${uk}:history:inventory`,
      `habbodesk:${uk}:favorites:inventory`,
      `habbodesk:${uk}:notifications`,
      "habbodesk_logged_user",
      "habbodesk_anonymous_skip_login",
    ]
    keysToRemove.forEach((k) => localStorage.removeItem(k))

    localStorage.setItem(flag, "true")
    console.log("[Habbip] Migração do localStorage concluída.")
  } catch (err) {
    console.warn("[Habbip] Falha na migração do localStorage:", err.message)
  }
}