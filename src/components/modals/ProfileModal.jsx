import React from "react"
import Button from "../ui/Button"
import ConsoleCard from "../ui/ConsoleCard"
import ProfileContent from "../profile/ProfileContent"
import { updateAccountInfo } from "../../services/authService"
import { getHabboAvatarHeadUrl } from "../../services/habboApi"
import LogoutConfirmModal from "./LogoutConfirmModal"

function AvatarHead({ nick }) {
  const [error, setError] = React.useState(false)
  const url = getHabboAvatarHeadUrl({ name: nick, hotel: "br", size: "m" })

  return (
    <div className="w-10 h-10 shrink-0 flex items-center justify-center overflow-hidden">
      {!error ? (
        <img
          src={url}
          alt={nick}
          className="w-full h-full object-contain "
          onError={() => setError(true)}
        />
      ) : (
        <span className="text-[18px]">👤</span>
      )}
    </div>
  )
}

// ── EyeIcon ───────────────────────────────────────────────────────────────────
function EyeIcon({ open }) {
  return open ? (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

// ── PinInput inline ────────────────────────────────────────────────────────
function PinInput({ value, onChange, disabled, maxLength = 6, label }) {
  const inputRef = React.useRef(null)
  const [reveal, setReveal] = React.useState(false)

  function handleChange(e) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, maxLength)
    onChange(raw)
  }

  return (
    <div>
      {label && <div className="text-white text-[12px] font-bold mb-2">{label}</div>}
      <div className="relative">
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          autoComplete="one-time-code"
          className="absolute opacity-0 w-0 h-0"
        />
        <div className="flex items-center gap-[4px]">
          <div
            className="flex gap-[3px] flex-1 cursor-pointer"
            onClick={() => inputRef.current?.focus()}
          >
            {Array.from({ length: maxLength }).map((_, i) => {
              const char = value[i]
              const isCurrent = i === value.length && value.length < maxLength
              return (
                <div
                  key={i}
                  className={[
                    "flex-1 h-7 flex items-center justify-center border text-[12px] font-bold text-white transition-all rounded-[2px]",
                    char
                      ? "border-[#ffd64d] bg-[rgba(255,214,77,0.12)]"
                      : isCurrent
                        ? "border-[#ffd64d] bg-[rgba(255,255,255,0.06)] animate-pulse"
                        : "border-[#555] bg-[rgba(255,255,255,0.04)]",
                  ].join(" ")}
                >
                  {char ? (reveal ? char : "•") : ""}
                </div>
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className={[
              "shrink-0 w-6 h-7 flex items-center justify-center border rounded-[2px] transition-colors cursor-pointer",
              reveal
                ? "border-[#ffd64d] text-[#ffd64d] bg-[rgba(255,214,77,0.12)]"
                : "border-[#555] text-[#666] bg-[rgba(255,255,255,0.04)] hover:text-[#aaa] hover:border-[#888]",
            ].join(" ")}
            title={reveal ? "Ocultar PIN" : "Mostrar PIN"}
            tabIndex={-1}
          >
            <EyeIcon open={reveal} />
          </button>
        </div>
        <div className="mt-1 text-center text-[9px] text-[#888]">
          {value.length}/{maxLength} dígitos {value.length === 6 ? "✓" : ""}
        </div>
      </div>
    </div>
  )
}

function AccountEditSection({ user, onUserUpdated }) {
  const [editTarget, setEditTarget] = React.useState(null) // "email" | "senha" | null
  const [email, setEmail] = React.useState(user?.email || "")
  const [newPw, setNewPw] = React.useState("")
  const [confirmPw, setConfirmPw] = React.useState("")
  const [currentPw, setCurrentPw] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [msg, setMsg] = React.useState(null)

  function reset() {
    setEmail(user?.email || ""); setNewPw(""); setConfirmPw(""); setCurrentPw(""); setMsg(null)
  }

  function openEdit(target) {
    reset()
    setEditTarget(t => t === target ? null : target)
  }

  async function handleSave(e) {
    e.preventDefault()
    setMsg(null)
    if (editTarget === "senha" && newPw !== confirmPw) {
      setMsg({ ok: false, text: "As senhas não coincidem." }); return
    }
    setLoading(true)
    try {
      const payload = { currentPassword: currentPw }
      if (editTarget === "email") payload.email = email
      if (editTarget === "senha") payload.newPassword = newPw
      const data = await updateAccountInfo(payload)
      if (data.user) onUserUpdated?.({ ...user, ...data.user })
      setMsg({ ok: true, text: editTarget === "email" ? "Email atualizado!" : "Senha alterada!" })
      setCurrentPw(""); setNewPw(""); setConfirmPw("")
      setTimeout(() => { setEditTarget(null); setMsg(null) }, 1800)
    } catch (err) {
      setMsg({ ok: false, text: err.message || "Erro ao salvar." })
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full h-8 border border-[#8a8a8a] bg-[rgba(255,255,255,0.08)] px-2 text-[11px] text-white outline-none placeholder:text-[#666] rounded-[3px] disabled:opacity-50"

  return (
    <div className="border border-[#ffffff22] rounded-[8px] p-3 bg-[rgba(255,255,255,0.04)]">
      <div className="text-[#fff2c1] font-bold text-[12px] mb-2">Credenciais de acesso</div>

      <div className="flex items-center justify-between mb-1">
        <div className="text-[11px] text-[#aaa]">{user?.email}</div>
        <button type="button" onClick={() => openEdit("email")}
          className="text-[10px] text-[#aaa] hover:text-[#ffd64d] cursor-pointer transition-colors">
          {editTarget === "email" ? "cancelar" : "alterar email"}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-[11px] text-[#555]">••••••••</div>
        <button type="button" onClick={() => openEdit("senha")}
          className="text-[10px] text-[#aaa] hover:text-[#ffd64d] cursor-pointer transition-colors">
          {editTarget === "senha" ? "cancelar" : "alterar senha"}
        </button>
      </div>

      {editTarget && (
        <form onSubmit={handleSave} className="mt-3 flex flex-col gap-2">
          {editTarget === "email" && (
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Novo email" disabled={loading} className={inputCls} />
          )}
          {editTarget === "senha" && (
            <>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                placeholder="Nova senha (mín. 8 caracteres)" disabled={loading} className={inputCls} />
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                placeholder="Confirmar nova senha" disabled={loading} className={inputCls} />
            </>
          )}
          <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
            placeholder="Senha atual (confirmação)" disabled={loading} className={inputCls} />
          {msg && <div className={`text-[11px] ${msg.ok ? "text-[#7CFC8A]" : "text-[#FF8A8A]"}`}>{msg.text}</div>}
          <Button type="submit"
            disabled={loading || !currentPw || (editTarget === "email" && !email) || (editTarget === "senha" && (newPw.length < 8 || !confirmPw))}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      )}
    </div>
  )
}

const TABS = [
  { key: "perfil", label: "Perfil Habbo" },
  { key: "conta", label: "Minha conta" },
]

export default function ProfileModal({ open, user, onClose, onUserUpdated, onLogout }) {
  const [activeTab, setActiveTab] = React.useState("perfil")
  const [confirmingLogout, setConfirmingLogout] = React.useState(false)

  if (!open || !user) return null

  const habboProfile = user.habboProfile

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.55)] flex items-center justify-center p-4">
      <ConsoleCard
        title="Minha conta"
        onClose={() => { setActiveTab("perfil"); onClose(); }}
        expand
        className="w-full max-w-[600px] h-[90vh] flex flex-col"
        innerClassName="flex flex-col overflow-hidden"
      >
        <div className="flex gap-1 mb-3 shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-[4px] text-[11px] font-bold border transition-colors cursor-pointer ${activeTab === tab.key
                ? "border-[#ffd64d] bg-[rgba(255,214,77,0.15)] text-[#ffd64d]"
                : "border-[#555] text-[#888] hover:border-[#888] hover:text-[#ccc]"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {activeTab === "perfil" && (
            habboProfile ? (
              <ProfileContent user={habboProfile} hotel="br" />
            ) : (
              <div className="text-[#888] text-[12px] py-4 text-center">
                Carregando perfil do Habbo...
              </div>
            )
          )}

          {activeTab === "conta" && (
            <div className="space-y-3">
              {user?.habboNick && (
                <div className="border border-[#ffffff22] rounded-[8px] p-3 bg-[rgba(255,255,255,0.04)]">
                  <div className="text-[#fff2c1] font-bold text-[12px] mb-2">Nick do Habbo</div>
                  <div className="flex items-center gap-3">
                    <AvatarHead nick={user.habboNick} />
                    <div>
                      <div className="text-white text-[13px] font-bold">{user.habboNick}</div>
                    </div>
                  </div>
                </div>
              )}

              <AccountEditSection user={user} onUserUpdated={onUserUpdated} />

              <div className="border-t border-[#ffffff22] pt-2">
                <div className="text-[#888] text-[10px] leading-4 text-center">
                  Seus dados estão sincronizados e acessíveis em qualquer dispositivo.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 shrink-0">
          <div className="flex gap-2">
            <Button onClick={() => { setActiveTab("perfil"); onClose(); }}>Fechar</Button>
            <Button variant="danger" onClick={() => setConfirmingLogout(true)}>Sair da conta</Button>
          </div>
        </div>

        <LogoutConfirmModal
          open={confirmingLogout}
          onConfirm={onLogout}
          onCancel={() => setConfirmingLogout(false)}
        />
      </ConsoleCard>
    </div>
  )
}