/**
 * migrateLocalStorage
 *
 * Roda uma única vez após o primeiro login de um usuário que vinha
 * usando o app com localStorage (versão antiga sem backend).
 *
 * Lê as chaves antigas, faz o merge com os dados do servidor e
 * remove as chaves antigas para não acumular lixo.
 *
 * Como usar — chame após o login bem-sucedido e serverData carregado:
 *
 *   import { migrateLocalStorage } from "../services/migrateLocalStorage"
 *   await migrateLocalStorage(username, serverData, syncAllData)
 */

import { syncAllData } from "./authService"

const MIGRATED_FLAG = "habbip:migrated_v1"

/**
 * Lê uma chave do localStorage legado e retorna o valor parseado ou fallback.
 */
function readLegacy(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

/**
 * Converte o nome de usuário para a chave legada usada pelo sistema antigo.
 */
function legacyUserKey(username) {
  return username.trim().toLowerCase().replace(/\s+/g, "_")
}

export async function migrateLocalStorage(username) {
  // Só migra uma vez por sessão/usuário
  const flag = `${MIGRATED_FLAG}:${username.toLowerCase()}`
  if (localStorage.getItem(flag) === "true") return

  const uk = legacyUserKey(username)

  // ── Lê dados legados ────────────────────────────────────────────────────
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

  // Se não tem nada legado, só marca como migrado
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
    // Envia dados legados para o servidor (não sobrescreve dados do servidor
    // que já existam — o servidor vai receber e usar como base inicial)
    await syncAllData({
      inventory: legacyInventory,
      watchlist: legacyWatchlist,
      settings: legacySettings,
      mobi_history: legacyMobiHistory,
      user_history: legacyUserHistory,
      inv_history: legacyInvHistory,
      notifications: legacyNotifications,
    })

    // ── Remove chaves legadas ──────────────────────────────────────────────
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
      // Chaves do sistema antigo de auth
      "habbodesk_logged_user",
      "habbodesk_anonymous_skip_login",
    ]
    keysToRemove.forEach((k) => localStorage.removeItem(k))

    localStorage.setItem(flag, "true")
    console.log("[Habbip] Migração do localStorage concluída.")
  } catch (err) {
    console.warn("[Habbip] Falha na migração do localStorage:", err.message)
    // Não marca como migrado — vai tentar de novo no próximo login
  }
}