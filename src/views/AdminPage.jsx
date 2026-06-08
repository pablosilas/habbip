import React from "react"
import ConsoleCard from "../components/ui/ConsoleCard"
import Button from "../components/ui/Button"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

function useAdminKey() {
  const [key, setKey] = React.useState(() => sessionStorage.getItem("habbip:admin-key") || "")
  const [unlocked, setUnlocked] = React.useState(false)
  const [error, setError] = React.useState("")
  const [checking, setChecking] = React.useState(false)

  async function tryUnlock(inputKey) {
    setChecking(true)
    setError("")
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { "x-admin-key": inputKey },
      })
      if (res.ok) {
        sessionStorage.setItem("habbip:admin-key", inputKey)
        setKey(inputKey)
        setUnlocked(true)
      } else {
        setError("Chave incorreta.")
      }
    } catch {
      setError("Não foi possível conectar ao servidor.")
    } finally {
      setChecking(false)
    }
  }

  return { key, unlocked, error, checking, tryUnlock }
}

function KeyGate({ onUnlock, error, checking }) {
  const [input, setInput] = React.useState("")
  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.55)] flex items-center justify-center p-4">
      <ConsoleCard title="Admin — Habbip" className="w-full max-w-[360px]">
        <form onSubmit={e => { e.preventDefault(); onUnlock(input) }} className="flex flex-col gap-3">
          <div className="text-[12px] text-[#aaa] text-center">Digite a chave de administrador para continuar.</div>
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Chave admin"
            className="w-full h-9 border border-[#8a8a8a] bg-[rgba(255,255,255,0.10)] px-3 text-[12px] text-white outline-none placeholder:text-[#b0b0b0]"
          />
          {error && <div className="text-[#ffd6d6] text-[12px]">{error}</div>}
          <Button type="submit" disabled={!input || checking}>
            {checking ? "Verificando..." : "Entrar"}
          </Button>
        </form>
      </ConsoleCard>
    </div>
  )
}

function UserRow({ user, adminKey, onRefresh }) {
  const [loading, setLoading] = React.useState(false)

  const isActive = user.subscription_status === "active" && user.expires_at && new Date(user.expires_at) > new Date()

  async function grant() {
    setLoading(true)
    await fetch(`${API_BASE}/admin/users/${user.id}/grant`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ days: 30 }),
    })
    setLoading(false)
    onRefresh()
  }

  async function revoke() {
    setLoading(true)
    await fetch(`${API_BASE}/admin/users/${user.id}/revoke`, {
      method: "DELETE",
      headers: { "x-admin-key": adminKey },
    })
    setLoading(false)
    onRefresh()
  }

  return (
    <div className="flex items-center gap-2 py-2 border-b border-[#333] text-[11px]">
      <div className="flex-1 min-w-0">
        <div className="text-white font-bold truncate">{user.email}</div>
        {user.habbo_nick && <div className="text-[#888]">{user.habbo_nick}</div>}
        <div className={`text-[10px] mt-[2px] ${isActive ? "text-[#7CFC8A]" : "text-[#FF8A8A]"}`}>
          {isActive ? `Ativo até ${new Date(user.expires_at).toLocaleDateString("pt-BR")}` : "Sem acesso"}
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        {isActive ? (
          <button onClick={revoke} disabled={loading}
            className="px-2 py-1 text-[10px] border border-[#FF8A8A44] text-[#FF8A8A] rounded-[3px] hover:bg-[rgba(255,138,138,0.1)] cursor-pointer disabled:opacity-40">
            Revogar
          </button>
        ) : (
          <button onClick={grant} disabled={loading}
            className="px-2 py-1 text-[10px] border border-[#7CFC8A44] text-[#7CFC8A] rounded-[3px] hover:bg-[rgba(124,252,138,0.1)] cursor-pointer disabled:opacity-40">
            +30 dias
          </button>
        )}
      </div>
    </div>
  )
}

function CreateUserForm({ adminKey, onRefresh }) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [nick, setNick] = React.useState("")
  const [grantAccess, setGrantAccess] = React.useState(true)
  const [loading, setLoading] = React.useState(false)
  const [msg, setMsg] = React.useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ email, password, habboNick: nick || undefined, grantAccess }),
      })
      const data = await res.json()
      if (res.ok) {
        setMsg({ ok: true, text: `Usuário criado! ID: ${data.user.id}` })
        setEmail(""); setPassword(""); setNick("")
        onRefresh()
      } else {
        setMsg({ ok: false, text: data.error })
      }
    } catch {
      setMsg({ ok: false, text: "Erro ao conectar." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="text-[12px] font-bold text-white">Criar novo usuário</div>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email"
        className="w-full h-8 border border-[#8a8a8a] bg-[rgba(255,255,255,0.08)] px-2 text-[11px] text-white outline-none placeholder:text-[#666] rounded-[3px]" />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha (mín. 8 caracteres)" type="text"
        className="w-full h-8 border border-[#8a8a8a] bg-[rgba(255,255,255,0.08)] px-2 text-[11px] text-white outline-none placeholder:text-[#666] rounded-[3px]" />
      <input value={nick} onChange={e => setNick(e.target.value)} placeholder="Nick Habbo (opcional)"
        className="w-full h-8 border border-[#8a8a8a] bg-[rgba(255,255,255,0.08)] px-2 text-[11px] text-white outline-none placeholder:text-[#666] rounded-[3px]" />
      <label className="flex items-center gap-2 text-[11px] text-[#ccc] cursor-pointer">
        <input type="checkbox" checked={grantAccess} onChange={e => setGrantAccess(e.target.checked)} />
        Liberar acesso imediatamente (30 dias)
      </label>
      {msg && <div className={`text-[11px] ${msg.ok ? "text-[#7CFC8A]" : "text-[#FF8A8A]"}`}>{msg.text}</div>}
      <Button type="submit" disabled={!email || password.length < 8 || loading}>
        {loading ? "Criando..." : "Criar usuário"}
      </Button>
    </form>
  )
}

export default function AdminPage() {
  const { key, unlocked, error, checking, tryUnlock } = useAdminKey()
  const [users, setUsers] = React.useState([])
  const [loadingUsers, setLoadingUsers] = React.useState(false)

  async function fetchUsers(adminKey) {
    setLoadingUsers(true)
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { "x-admin-key": adminKey },
      })
      if (res.ok) setUsers(await res.json())
    } finally {
      setLoadingUsers(false)
    }
  }

  React.useEffect(() => {
    if (unlocked) fetchUsers(key)
  }, [unlocked])

  // Tenta auto-unlock se já tem chave salva na sessão
  React.useEffect(() => {
    const saved = sessionStorage.getItem("habbip:admin-key")
    if (saved) tryUnlock(saved)
  }, [])

  if (!unlocked) {
    return <KeyGate onUnlock={tryUnlock} error={error} checking={checking} />
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-start justify-center p-4 pt-8">
      <div className="w-full max-w-[560px] flex flex-col gap-4">
        <ConsoleCard title="Admin — Habbip">
          <CreateUserForm adminKey={key} onRefresh={() => fetchUsers(key)} />
        </ConsoleCard>

        <ConsoleCard title={`Usuários (${users.length})`}>
          {loadingUsers ? (
            <div className="text-[11px] text-[#888] text-center py-2">Carregando...</div>
          ) : users.length === 0 ? (
            <div className="text-[11px] text-[#888] text-center py-2">Nenhum usuário cadastrado.</div>
          ) : (
            <div className="flex flex-col">
              {users.map(u => (
                <UserRow key={u.id} user={u} adminKey={key} onRefresh={() => fetchUsers(key)} />
              ))}
            </div>
          )}
        </ConsoleCard>
      </div>
    </div>
  )
}
