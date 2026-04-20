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
    <div className="w-12 h-12 shrink-0 flex items-center justify-center overflow-hidden rounded-xl bg-white border-2 border-sky-200">
      {!error ? (
        <img
          src={url}
          alt={nick}
          className="w-full h-full object-contain pixel-render"
          onError={() => setError(true)}
        />
      ) : (
        <span className="text-[20px]">
          <svg className="w-6 h-6 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </span>
      )}
    </div>
  )
}

// ── EyeIcon ───────────────────────────────────────────────────────────────────
function EyeIcon({ open }) {
  return open ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      {label && <label className="text-sky-800 text-[12px] font-bold mb-2 block">{label}</label>}
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
        <div className="flex items-center gap-1.5">
          <div
            className="flex gap-1 flex-1 cursor-pointer"
            onClick={() => inputRef.current?.focus()}
          >
            {Array.from({ length: maxLength }).map((_, i) => {
              const char = value[i]
              const isCurrent = i === value.length && value.length < maxLength
              return (
                <div
                  key={i}
                  className={`
                    flex-1 h-9 flex items-center justify-center
                    border-2 text-[14px] font-bold rounded-lg transition-all
                    ${char
                      ? "border-sky-400 bg-sky-50 text-sky-800"
                      : isCurrent
                        ? "border-sky-400 bg-white animate-pulse"
                        : "border-sky-200 bg-white text-sky-300"
                    }
                  `}
                >
                  {char ? (reveal ? char : "●") : ""}
                </div>
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className={`
              shrink-0 w-9 h-9 flex items-center justify-center
              border-2 rounded-lg transition-all cursor-pointer
              ${reveal
                ? "border-sky-400 text-sky-600 bg-sky-50"
                : "border-sky-200 text-sky-300 bg-white hover:text-sky-500 hover:border-sky-300"
              }
            `}
            title={reveal ? "Ocultar PIN" : "Mostrar PIN"}
            tabIndex={-1}
          >
            <EyeIcon open={reveal} />
          </button>
        </div>
        <div className="mt-1.5 text-center text-[10px] text-sky-500 font-medium">
          {value.length}/{maxLength} digitos {value.length === 6 && (
            <svg className="inline w-3 h-3 text-green-500 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
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
    if (newPin.length < 6) { setError("Novo PIN deve ter 6 digitos."); return }
    if (newPin !== confirmPin) { setError("Os PINs nao coincidem."); return }
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
    <div className="border-2 border-sky-100 rounded-xl p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sky-800 font-bold text-[13px]">PIN do Habbip</div>
        <button
          type="button"
          onClick={() => { setOpen((v) => !v); reset() }}
          className="text-[11px] text-sky-400 hover:text-sky-600 font-semibold cursor-pointer transition-colors"
        >
          {open ? "cancelar" : "alterar PIN"}
        </button>
      </div>

      {!open && (
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-7 h-7 flex items-center justify-center border-2 border-sky-100 bg-sky-50 text-sky-300 text-[16px] rounded-lg">●</div>
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
          {confirmPin.length === 6 && (
            <div className={`text-center text-[11px] font-bold ${newPin === confirmPin ? "text-green-600" : "text-red-500"}`}>
              {newPin === confirmPin ? "PINs coincidem" : "PINs nao coincidem"}
            </div>
          )}
          {error && <div className="text-red-500 text-[12px] bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
          {success && <div className="text-green-600 text-[12px] bg-green-50 border border-green-200 rounded-lg px-3 py-2">PIN alterado com sucesso!</div>}
          <Button
            onClick={handleSave}
            disabled={currentPin.length < 6 || newPin.length < 6 || confirmPin.length < 6 || loading}
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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <ConsoleCard
        title="Minha conta"
        onClose={() => { setActiveTab("perfil"); onClose(); }}
        expand
        className="w-full max-w-[620px] h-[90vh] flex flex-col"
        innerClassName="flex flex-col overflow-hidden p-0"
      >
        <div className="flex flex-col h-full p-4">
          {/* Tabs */}
          <div className="flex gap-2 mb-4 shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`
                  px-4 py-2 text-[12px] font-bold rounded-lg transition-all cursor-pointer
                  ${activeTab === tab.key
                    ? "bg-gradient-to-r from-sky-400 to-cyan-400 text-white shadow-sm"
                    : "bg-sky-50 text-sky-600 hover:bg-sky-100"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            {activeTab === "perfil" && (
              habboProfile ? (
                <ProfileContent user={habboProfile} hotel="br" />
              ) : (
                <div className="text-sky-500 text-[13px] py-8 text-center">
                  Carregando perfil do Habbo...
                </div>
              )
            )}

            {activeTab === "conta" && (
              <div className="space-y-4">
                {/* Nick info */}
                <div className="border-2 border-sky-100 rounded-xl p-4 bg-white">
                  <div className="text-sky-800 font-bold text-[13px] mb-3">Nick do Habbo</div>
                  <div className="flex items-center gap-4">
                    <AvatarHead nick={user.habboNick} />
                    <div>
                      <div className="text-sky-900 text-[15px] font-bold">{user.habboNick}</div>
                      <div className="text-sky-500 text-[11px] mt-1">Seu login no Habbip</div>
                    </div>
                  </div>
                </div>

                <ChangePinSection user={user} onUserUpdated={onUserUpdated} />

                {/* Security notice */}
                <div className="border-2 border-amber-200 rounded-xl p-4 bg-amber-50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-200 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                    </div>
                    <div className="text-[11px] text-amber-800 leading-relaxed">
                      O Habbip <span className="font-bold">nao tem relacao</span> com o Habbo Hotel.
                      Seu PIN e exclusivo deste site — nunca e o mesmo da sua conta no jogo.
                    </div>
                  </div>
                </div>

                {/* Sync info */}
                <div className="border-t border-sky-100 pt-3">
                  <div className="text-sky-500 text-[11px] leading-relaxed text-center">
                    Seus dados estao sincronizados e acessiveis em qualquer dispositivo.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="pt-4 shrink-0 flex gap-2">
            <Button onClick={() => { setActiveTab("perfil"); onClose(); }} className="flex-1">
              Fechar
            </Button>
            <Button variant="danger" onClick={() => setConfirmingLogout(true)} className="flex-1">
              Sair da conta
            </Button>
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
