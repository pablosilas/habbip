import React from "react"
import ConsoleCard from "../ui/ConsoleCard"
import Button from "../ui/Button"
import { fetchUserByName, getHabboAvatarHeadUrl } from "../../services/habboApi"
import messageSound from "../../assets/message.mp3"

function playSound() {
  try { new Audio(messageSound).play() } catch { }
}

function useHabboNickValidation(habboNick) {
  const [status, setStatus] = React.useState("idle")
  const [habboUser, setHabboUser] = React.useState(null)
  const timerRef = React.useRef(null)

  React.useEffect(() => {
    const nick = habboNick.trim()
    if (!nick) { setStatus("idle"); setHabboUser(null); return }

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setStatus("checking"); setHabboUser(null)
      try {
        const user = await fetchUserByName(nick)
        if (user?.uniqueId) { setHabboUser(user); setStatus("found") }
        else setStatus("not_found")
      } catch { setStatus("not_found") }
    }, 600)

    return () => clearTimeout(timerRef.current)
  }, [habboNick])

  return { status, habboUser }
}

function AvatarPreview({ nick, status, habboUser }) {
  const [imgError, setImgError] = React.useState(false)
  React.useEffect(() => setImgError(false), [nick])

  if (status === "idle") return null

  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-[13px] transition-all
      ${status === "found" 
        ? "border-green-300 bg-green-50"
        : status === "not_found" 
          ? "border-red-300 bg-red-50"
          : "border-sky-200 bg-sky-50"
      }
    `}>
      {status === "found" && nick && !imgError ? (
        <img
          src={getHabboAvatarHeadUrl({ name: nick, hotel: "br", size: "s" })}
          alt={nick}
          className="w-10 h-10 object-contain pixel-render shrink-0 rounded-lg bg-white p-1"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-10 h-10 flex items-center justify-center text-[18px] shrink-0 bg-white rounded-lg">
          {status === "checking" ? (
            <svg className="animate-spin w-5 h-5 text-sky-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : status === "found" ? (
            <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        {status === "checking" && <span className="text-sky-600">Verificando nick no Habbo...</span>}
        {status === "found" && (
          <div>
            <span className="text-green-700 font-bold">{habboUser?.name || nick}</span>
            <span className="text-green-600"> encontrado</span>
            {habboUser?.motto && <div className="text-green-600/70 text-[11px] truncate mt-0.5">{habboUser.motto}</div>}
          </div>
        )}
        {status === "not_found" && <span className="text-red-600">Nick nao encontrado no Habbo Hotel</span>}
      </div>
    </div>
  )
}

// ── EyeIcon ───────────────────────────────────────────────────────────────────
function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

// ── PinInput ─────────────────────────────────────────────────────────────────
function PinInput({ value, onChange, disabled, maxLength = 6, placeholder = "PIN" }) {
  const inputRef = React.useRef(null)
  const [reveal, setReveal] = React.useState(false)

  function handleChange(e) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, maxLength)
    onChange(raw)
  }

  return (
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
        aria-label={placeholder}
      />
      <div className="flex items-center gap-2">
        <div
          className="flex gap-1.5 flex-1 cursor-pointer"
          onClick={() => inputRef.current?.focus()}
        >
          {Array.from({ length: maxLength }).map((_, i) => {
            const char = value[i]
            const isCurrent = i === value.length && value.length < maxLength
            return (
              <div
                key={i}
                className={`
                  flex-1 h-11 flex items-center justify-center
                  border-2 text-[16px] font-bold rounded-lg transition-all
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
            shrink-0 w-11 h-11 flex items-center justify-center
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
      <div className="mt-2 text-center text-[11px] text-sky-500 font-medium">
        {value.length}/{maxLength} digitos {value.length === 6 && (
          <svg className="inline w-3 h-3 text-green-500 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </div>
    </div>
  )
}

// ── Aviso de seguranca ────────────────────────────────────────────────────────
function SecurityNotice() {
  return (
    <div className="border-2 border-amber-200 rounded-xl p-4 bg-amber-50">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-200 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <div className="text-[12px] text-amber-800 leading-relaxed">
          <span className="font-bold">O Habbip nao tem relacao com o Habbo Hotel.</span>
          {" "}Seu nick e usado apenas para identificacao. O PIN que voce cria aqui e{" "}
          <span className="font-bold">exclusivo do Habbip</span> — nunca use
          o mesmo PIN/senha do jogo.
        </div>
      </div>
    </div>
  )
}

// ── LoginForm ─────────────────────────────────────────────────────────────────
function LoginForm({ onLogin, onSwitch, loading, error }) {
  const [habboNick, setHabboNick] = React.useState("")
  const [pin, setPin] = React.useState("")

  function handleSubmit(e) {
    e.preventDefault()
    if (!habboNick.trim() || pin.length < 6 || loading) return
    playSound()
    onLogin({ habboNick: habboNick.trim(), password: pin })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <SecurityNotice />

      <div>
        <label className="text-sky-800 text-[13px] font-bold mb-2 block">Nick do Habbo</label>
        <input
          value={habboNick}
          onChange={(e) => setHabboNick(e.target.value)}
          placeholder="Seu nick no Habbo Hotel"
          autoComplete="username"
          className="w-full h-11 border-2 border-sky-200 bg-white px-4 text-[13px] text-sky-900 rounded-lg outline-none placeholder:text-sky-300 focus:border-sky-400 focus:shadow-[0_0_0_3px_rgba(79,195,247,0.15)] transition-all"
        />
      </div>

      <div>
        <label className="text-sky-800 text-[13px] font-bold mb-2 block">PIN do Habbip</label>
        <PinInput
          value={pin}
          onChange={setPin}
          disabled={loading}
          placeholder="PIN do Habbip"
        />
      </div>

      {error && (
        <div className="text-red-600 text-[13px] bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      <Button type="submit" disabled={!habboNick.trim() || pin.length < 6 || loading} className="w-full">
        {loading ? "Entrando..." : "Entrar"}
      </Button>

      <div className="text-center text-[12px] text-sky-600">
        Nao tem conta?{" "}
        <button type="button" onClick={onSwitch} className="text-sky-500 font-bold hover:underline cursor-pointer">
          Criar conta
        </button>
      </div>
    </form>
  )
}

// ── RegisterForm ──────────────────────────────────────────────────────────────
function RegisterForm({ onRegister, onSwitch, loading, error }) {
  const [habboNick, setHabboNick] = React.useState("")
  const [pin, setPin] = React.useState("")
  const [pinConfirm, setPinConfirm] = React.useState("")
  const [localError, setLocalError] = React.useState("")

  const { status, habboUser } = useHabboNickValidation(habboNick)

  const nickValid = status === "found"
  const pinValid = pin.length === 6
  const pinsMatch = pin === pinConfirm && pinConfirm.length === 6
  const canSubmit = nickValid && pinValid && pinsMatch && !loading

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    if (!pinsMatch) { setLocalError("Os PINs nao coincidem."); return }
    setLocalError("")
    playSound()
    onRegister({ habboNick: habboNick.trim(), password: pin })
  }

  const displayError = localError || error

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <SecurityNotice />

      <div>
        <label className="text-sky-800 text-[13px] font-bold mb-2 block">Nick do Habbo</label>
        <input
          value={habboNick}
          onChange={(e) => setHabboNick(e.target.value)}
          placeholder="Seu nick no Habbo Hotel"
          autoComplete="username"
          className="w-full h-11 border-2 border-sky-200 bg-white px-4 text-[13px] text-sky-900 rounded-lg outline-none placeholder:text-sky-300 focus:border-sky-400 focus:shadow-[0_0_0_3px_rgba(79,195,247,0.15)] transition-all mb-2"
        />
        <AvatarPreview nick={habboNick.trim()} status={status} habboUser={habboUser} />
      </div>

      <div>
        <label className="text-sky-800 text-[13px] font-bold mb-2 block">Criar PIN</label>
        <PinInput
          value={pin}
          onChange={setPin}
          disabled={loading}
          placeholder="Novo PIN"
        />
      </div>

      <div>
        <label className="text-sky-800 text-[13px] font-bold mb-2 block">Confirmar PIN</label>
        <PinInput
          value={pinConfirm}
          onChange={setPinConfirm}
          disabled={loading}
          placeholder="Confirmar PIN"
        />
        {pinConfirm.length === 6 && (
          <div className={`mt-2 text-center text-[12px] font-bold ${pinsMatch ? "text-green-600" : "text-red-500"}`}>
            {pinsMatch ? "PINs coincidem" : "PINs nao coincidem"}
          </div>
        )}
      </div>

      {displayError && (
        <div className="text-red-600 text-[13px] bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {displayError}
        </div>
      )}

      <Button type="submit" disabled={!canSubmit} className="w-full">
        {loading ? "Criando conta..." : "Criar conta"}
      </Button>

      <div className="text-center text-[12px] text-sky-600">
        Ja tem conta?{" "}
        <button type="button" onClick={onSwitch} className="text-sky-500 font-bold hover:underline cursor-pointer">
          Fazer login
        </button>
      </div>
    </form>
  )
}

// ── LoginModal ────────────────────────────────────────────────────────────────
export default function LoginModal({
  open, mode = "login", onSetMode, loading, error,
  onLogin, onRegister, onClose,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <ConsoleCard
        title={mode === "register" ? "Criar conta" : "Entrar"}
        onClose={onClose}
        className="w-full max-w-[460px]"
      >
        {mode === "login" ? (
          <LoginForm
            onLogin={onLogin}
            onSwitch={() => onSetMode("register")}
            loading={loading}
            error={error}
          />
        ) : (
          <RegisterForm
            onRegister={onRegister}
            onSwitch={() => onSetMode("login")}
            loading={loading}
            error={error}
          />
        )}
        {mode === "login" && (
          <div className="mt-4 border-2 border-sky-100 rounded-xl p-3 bg-sky-50/50">
            <div className="text-[11px] text-sky-600 leading-relaxed">
              <span className="font-bold text-sky-700">Vantagens da conta:</span>{" "}
              inventario e monitoramento de precos sincronizados em qualquer dispositivo.
            </div>
          </div>
        )}
      </ConsoleCard>
    </div>
  )
}
