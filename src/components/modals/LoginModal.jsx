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
    <div className={`flex items-center gap-2 px-3 py-2 rounded-[6px] border text-[12px] transition-all ${status === "found" ? "border-[#7CFC8A] bg-[rgba(124,252,138,0.08)]"
      : status === "not_found" ? "border-[#FF8A8A] bg-[rgba(255,138,138,0.08)]"
        : "border-[#555] bg-[rgba(255,255,255,0.04)]"
      }`}>
      {status === "found" && nick && !imgError ? (
        <img
          src={getHabboAvatarHeadUrl({ name: nick, hotel: "br", size: "s" })}
          alt={nick}
          className="w-8 h-8 object-contain shrink-0"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-8 h-8 flex items-center justify-center text-[16px] shrink-0">
          {status === "checking" ? "⏳" : status === "found" ? "👤" : "❌"}
        </div>
      )}
      <div className="flex-1 min-w-0">
        {status === "checking" && <span className="text-[#aaa]">Verificando nick no Habbo...</span>}
        {status === "found" && (
          <div>
            <span className="text-[#7CFC8A] font-bold">{habboUser?.name || nick}</span>
            <span className="text-[#7CFC8A]"> encontrado ✓</span>
            {habboUser?.motto && <div className="text-[#aaa] text-[10px] truncate">{habboUser.motto}</div>}
          </div>
        )}
        {status === "not_found" && <span className="text-[#FF8A8A]">Nick não encontrado no Habbo Hotel</span>}
      </div>
    </div>
  )
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function PasswordInput({ value, onChange, disabled, placeholder = "Senha", autoComplete }) {
  const [reveal, setReveal] = React.useState(false)
  return (
    <div className="flex gap-[4px]">
      <input
        type={reveal ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="flex-1 h-9 border border-[#8a8a8a] bg-[rgba(255,255,255,0.10)] px-3 text-[12px] text-white outline-none placeholder:text-[#b0b0b0]"
      />
      <button
        type="button"
        onClick={() => setReveal(v => !v)}
        className={[
          "w-9 h-9 flex items-center justify-center border rounded-[2px] transition-colors cursor-pointer shrink-0",
          reveal
            ? "border-[#ffd64d] text-[#ffd64d] bg-[rgba(255,214,77,0.12)]"
            : "border-[#555] text-[#666] bg-[rgba(255,255,255,0.04)] hover:text-[#aaa] hover:border-[#888]",
        ].join(" ")}
        tabIndex={-1}
      >
        <EyeIcon open={reveal} />
      </button>
    </div>
  )
}

function SecurityNotice() {
  return (
    <div className="border border-[#ffd64d44] rounded-[6px] p-3 bg-[rgba(255,214,77,0.05)]">
      <div className="flex items-start gap-2">
        <span className="text-[14px] shrink-0 mt-[1px]">🔒</span>
        <div className="text-[10px] text-[#c8c8c8] leading-[16px]">
          <span className="text-[#ffd64d] font-bold">O Habbip não tem relação com o Habbo Hotel.</span>
          {" "}Seu email e senha são exclusivos do Habbip — nunca use a mesma senha do jogo.
        </div>
      </div>
    </div>
  )
}

function LoginForm({ onLogin, onSwitch, loading, error }) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password || loading) return
    playSound()
    onLogin({ email: email.trim(), password })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <SecurityNotice />

      <div>
        <div className="text-white text-[13px] font-bold mb-1">Email</div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          autoComplete="email"
          className="w-full h-9 border border-[#8a8a8a] bg-[rgba(255,255,255,0.10)] px-3 text-[12px] text-white outline-none placeholder:text-[#b0b0b0]"
        />
      </div>

      <div>
        <div className="text-white text-[13px] font-bold mb-1">Senha</div>
        <PasswordInput
          value={password}
          onChange={setPassword}
          disabled={loading}
          placeholder="Sua senha"
          autoComplete="current-password"
        />
      </div>

      {error && <div className="text-[#ffd6d6] text-[12px]">{error}</div>}

      <Button type="submit" disabled={!email.trim() || password.length < 8 || loading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>

      <div className="text-center text-[11px] text-[#bbb]">
        Não tem conta?{" "}
        <button type="button" onClick={onSwitch} className="text-[#ffd64d] hover:underline cursor-pointer">
          Criar conta
        </button>
      </div>
    </form>
  )
}

function RegisterForm({ onRegister, onSwitch, loading, error }) {
  const [email, setEmail] = React.useState("")
  const [habboNick, setHabboNick] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [passwordConfirm, setPasswordConfirm] = React.useState("")
  const [localError, setLocalError] = React.useState("")

  const { status, habboUser } = useHabboNickValidation(habboNick)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const passwordValid = password.length >= 8
  const passwordsMatch = password === passwordConfirm && passwordConfirm.length >= 8
  const canSubmit = emailValid && passwordValid && passwordsMatch && !loading

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    if (!passwordsMatch) { setLocalError("As senhas não coincidem."); return }
    setLocalError("")
    playSound()
    onRegister({ email: email.trim(), habboNick: habboNick.trim() || undefined, password })
  }

  const displayError = localError || error

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <SecurityNotice />

      <div>
        <div className="text-white text-[13px] font-bold mb-[2px]">Email</div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          autoComplete="email"
          className="w-full h-9 border border-[#8a8a8a] bg-[rgba(255,255,255,0.10)] px-3 text-[12px] text-white outline-none placeholder:text-[#b0b0b0]"
        />
        {email.length > 3 && (
          <div className={`mt-1 text-[10px] font-bold ${emailValid ? "text-[#7CFC8A]" : "text-[#FF8A8A]"}`}>
            {emailValid ? "Email válido ✓" : "Email inválido"}
          </div>
        )}
      </div>

      <div>
        <div className="text-white text-[13px] font-bold mb-[2px]">
          Nick do Habbo <span className="text-[#888] font-normal">(opcional)</span>
        </div>
        <input
          value={habboNick}
          onChange={(e) => setHabboNick(e.target.value)}
          placeholder="Seu nick no Habbo Hotel"
          autoComplete="off"
          className="w-full h-9 border border-[#8a8a8a] bg-[rgba(255,255,255,0.10)] px-3 text-[12px] text-white outline-none placeholder:text-[#b0b0b0] mb-1"
        />
        <AvatarPreview nick={habboNick.trim()} status={status} habboUser={habboUser} />
      </div>

      <div>
        <div className="text-white text-[13px] font-bold mb-[2px]">Senha</div>
        <PasswordInput
          value={password}
          onChange={setPassword}
          disabled={loading}
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
        />
        {password.length > 0 && (
          <div className={`mt-1 text-[10px] font-bold ${passwordValid ? "text-[#7CFC8A]" : "text-[#FF8A8A]"}`}>
            {passwordValid ? "Senha válida ✓" : `${8 - password.length} caracteres restantes`}
          </div>
        )}
      </div>

      <div>
        <div className="text-white text-[13px] font-bold mb-[2px]">Confirmar senha</div>
        <PasswordInput
          value={passwordConfirm}
          onChange={setPasswordConfirm}
          disabled={loading}
          placeholder="Repita a senha"
          autoComplete="new-password"
        />
        {passwordConfirm.length > 0 && (
          <div className={`mt-1 text-[10px] font-bold ${passwordsMatch ? "text-[#7CFC8A]" : "text-[#FF8A8A]"}`}>
            {passwordsMatch ? "Senhas coincidem ✓" : "Senhas não coincidem"}
          </div>
        )}
      </div>

      {displayError && <div className="text-[#ffd6d6] text-[12px]">{displayError}</div>}

      <Button type="submit" disabled={!canSubmit}>
        {loading ? "Criando conta..." : "Criar conta"}
      </Button>

      <div className="text-center text-[11px] text-[#bbb]">
        Já tem conta?{" "}
        <button type="button" onClick={onSwitch} className="text-[#ffd64d] hover:underline cursor-pointer">
          Fazer login
        </button>
      </div>
    </form>
  )
}

export default function LoginModal({
  open, mode = "login", onSetMode, loading, error,
  onLogin, onRegister, onClose,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.55)] flex items-center justify-center p-4">
      <ConsoleCard
        title={mode === "register" ? "Criar conta" : "Entrar"}
        onClose={onClose}
        className="w-full max-w-[450px]"
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
          <div className="mt-1 border border-[#ffffff22] rounded-[6px] p-2 bg-[rgba(255,255,255,0.03)]">
            <div className="text-[10px] text-[#aaa] leading-4">
              <span className="text-[#ffd64d] font-bold">Vantagens da conta:</span>{" "}
              inventário e monitoramento de preços sincronizados em qualquer dispositivo.
            </div>
          </div>
        )}
      </ConsoleCard>
    </div>
  )
}
