const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

const STORAGE = {
  accessToken: "habbip:access_token",
  refreshToken: "habbip:refresh_token",
  user: "habbip:user",
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE.user)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function getAccessToken() {
  return localStorage.getItem(STORAGE.accessToken)
}

function storeSession({ accessToken, refreshToken, user }) {
  localStorage.setItem(STORAGE.accessToken, accessToken)
  localStorage.setItem(STORAGE.refreshToken, refreshToken)
  localStorage.setItem(STORAGE.user, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(STORAGE.accessToken)
  localStorage.removeItem(STORAGE.refreshToken)
  localStorage.removeItem(STORAGE.user)
}

let refreshPromise = null

async function doRefresh() {
  const refreshToken = localStorage.getItem(STORAGE.refreshToken)
  if (!refreshToken) throw new Error("Sem refresh token.")

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) {
    clearSession()
    throw new Error("Sessão expirada. Faça login novamente.")
  }

  const data = await res.json()
  storeSession(data)
  return data.accessToken
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => { refreshPromise = null })
  }
  return refreshPromise
}

export async function apiFetch(path, options = {}) {
  const token = getAccessToken()

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (res.status === 401) {
    const body = await res.json().catch(() => ({}))
    if (body.code === "TOKEN_EXPIRED") {
      try {
        const newToken = await refreshAccessToken()
        res = await fetch(`${API_BASE}${path}`, {
          ...options,
          headers: { ...headers, Authorization: `Bearer ${newToken}` },
        })
      } catch {
        clearSession()
        window.dispatchEvent(new CustomEvent("habbip:session-expired"))
        throw new Error("Sessão expirada.")
      }
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erro desconhecido." }))
    throw new Error(err.error || "Erro na requisição.")
  }

  return res.json()
}

// ── Auth ────────────────────────────────────────────────────────────────────

export async function register({ habboNick, password }) {
  const data = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ habboNick, password }),
  })
  storeSession(data)
  return data.user
}

export async function login({ habboNick, password }) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ habboNick, password }),
  })
  storeSession(data)
  return data.user
}

export async function logout() {
  const refreshToken = localStorage.getItem(STORAGE.refreshToken)
  try {
    await apiFetch("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    })
  } catch { }
  clearSession()
}

export async function updatePassword({ currentPassword, newPassword }) {
  return apiFetch("/auth/me", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

// ── Dados do usuário ─────────────────────────────────────────────────────────

export async function fetchUserData() {
  return apiFetch("/user/data")
}

export async function syncField(field, value) {
  return apiFetch(`/user/data/${field}`, {
    method: "PUT",
    body: JSON.stringify({ value }),
  })
}

export async function syncAllData(data) {
  return apiFetch("/user/data", {
    method: "PUT",
    body: JSON.stringify(data),
  })
}