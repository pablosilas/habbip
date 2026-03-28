import React from "react"
import Button from "../ui/Button"
import ConsoleCard from "../ui/ConsoleCard"
import ProfileContent from "../profile/ProfileContent"
import { updatePassword } from "../../services/authService"
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
          {value.length}/{maxLength} dígitos {value.length >= 4 ? "✓" : ""}
        </div>
      </div>
    </div>
  )
}

function ChangePinSection({ user, onUserUpdated }) {
  const [open, setOpen] = React.useState(false)
  const [currentPin, setCurrentPin] = React.useState("")
  const [newPin, setNewPin] = React.useState("")
  const [confirmPin, setConfirmPin] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState(false)

  function reset() {
    setCurrentPin(""); setNewPin(""); setConfirmPin("")
    setError(""); setSuccess(false)
  }

  async function handleSave() {
    if (newPin.length < 4) { setError("Novo PIN deve ter pelo menos 4 dígitos."); return }
    if (newPin !== confirmPin) { setError("Os PINs não coincidem."); return }
    setLoading(true); setError("")
    try {
      const updatedUser = await updatePassword({ currentPassword: currentPin, newPassword: newPin })
      if (updatedUser && onUserUpdated) {
        onUserUpdated({ ...user, ...updatedUser })
      }
      setSuccess(true)
      setTimeout(() => { setOpen(false); reset() }, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-[#ffffff22] rounded-[8px] p-3 bg-[rgba(255,255,255,0.04)]">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[#fff2c1] font-bold text-[12px]">PIN do Habbip</div>
        <button
          type="button"
          onClick={() => { setOpen((v) => !v); reset() }}
          className="text-[10px] text-[#aaa] hover:text-[#ffd64d] cursor-pointer transition-colors"
        >
          {open ? "cancelar" : "alterar PIN"}
        </button>
      </div>

      {!open && (
        <div className="flex gap-[4px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-5 h-5 flex items-center justify-center border border-[#444] bg-[rgba(255,255,255,0.04)] text-[#555] text-[14px]">•</div>
          ))}
        </div>
      )}

      {open && (
        <div className="flex flex-col gap-3">
          <PinInput
            value={currentPin}
            onChange={setCurrentPin}
            disabled={loading}
            label="PIN atual"
          />
          <PinInput
            value={newPin}
            onChange={setNewPin}
            disabled={loading}
            label="Novo PIN"
          />
          <PinInput
            value={confirmPin}
            onChange={setConfirmPin}
            disabled={loading}
            label="Confirmar novo PIN"
          />
          {confirmPin.length >= 4 && (
            <div className={`text-center text-[10px] font-bold ${newPin === confirmPin ? "text-[#7CFC8A]" : "text-[#FF8A8A]"}`}>
              {newPin === confirmPin ? "PINs coincidem ✓" : "PINs não coincidem"}
            </div>
          )}
          {error && <div className="text-[#ffd6d6] text-[11px]">{error}</div>}
          {success && <div className="text-[#7CFC8A] text-[11px]">PIN alterado com sucesso!</div>}
          <Button
            onClick={handleSave}
            disabled={currentPin.length < 4 || newPin.length < 4 || confirmPin.length < 4 || loading}
          >
            {loading ? "Salvando..." : "Alterar PIN"}
          </Button>
        </div>
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
              <div className="border border-[#ffffff22] rounded-[8px] p-3 bg-[rgba(255,255,255,0.04)]">
                <div className="text-[#fff2c1] font-bold text-[12px] mb-2">Nick do Habbo</div>
                <div className="flex items-center gap-3">
                  <AvatarHead nick={user.habboNick} />
                  <div>
                    <div className="text-white text-[13px] font-bold">{user.habboNick}</div>
                    <div className="text-[#888] text-[10px] mt-[2px]">Seu login no Habbip</div>
                  </div>
                </div>
              </div>

              <ChangePinSection user={user} onUserUpdated={onUserUpdated} />

              {/* Aviso de segurança */}
              <div className="border border-[#ffd64d33] rounded-[8px] p-3 bg-[rgba(255,214,77,0.04)]">
                <div className="flex items-start gap-2">
                  <span className="text-[12px] shrink-0">🔒</span>
                  <div className="text-[10px] text-[#c8c8c8] leading-[15px]">
                    O Habbip <span className="text-white font-bold">não tem relação</span> com o Habbo Hotel.
                    Seu PIN é exclusivo deste site — nunca é o mesmo da sua conta no jogo.
                  </div>
                </div>
              </div>

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