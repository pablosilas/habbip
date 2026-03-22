import React from "react"
import ConsoleCard from "../ui/ConsoleCard"
import Button from "../ui/Button"
import { fetchUserByName, getHabboAvatarHeadUrl } from "../../services/habboApi"
import messageSound from "../../assets/message.mp3"

function playSound() {
  try { new Audio(messageSound).play() } catch { }
}

// ── Validação do nick no Habbo ───────────────────────────────────────────────
function useHabboNickValidation(habboNick) {
  const [status, setStatus] = React.useState("idle") // idle | checking | found | not_found
  const [habboUser, setHabboUser] = React.useState(null)
  const timerRef = React.useRef(null)

  React.useEffect(() => {
    const nick = habboNick.trim()

    // Reseta se campo vazio
    if (!nick) {
      setStatus("idle")
      setHabboUser(null)
      return
    }

    // Debounce de 600ms após parar de digitar
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setStatus("checking")
      setHabboUser(null)
      try {
        const user = await fetchUserByName(nick)
        if (user?.uniqueId) {
          setHabboUser(user)
          setStatus("found")
        } else {
          setStatus("not_found")
        }
      } catch {
        setStatus("not_found")
      }
    }, 600)

    return () => clearTimeout(timerRef.current)
  }, [habboNick])

  return { status, habboUser }
}

// ── Preview do avatar ────────────────────────────────────────────────────────
function AvatarPreview({ nick, status, habboUser }) {
  const [imgError, setImgError] = React.useState(false)

  React.useEffect(() => setImgError(false), [nick])

  if (status === "idle") return null

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-[6px] border text-[12px] transition-all ${status === "found"
      ? "border-[#7CFC8A] bg-[rgba(124,252,138,0.08)]"
      : status === "not_found"
        ? "border-[#FF8A8A] bg-[rgba(255,138,138,0.08)]"
        : "border-[#555] bg-[rgba(255,255,255,0.04)]"
      }`}>
      {/* Avatar */}
      {status === "found" && nick && !imgError ? (
        <img
          src={getHabboAvatarHeadUrl({ name: nick, hotel: "br", size: "s" })}
          alt={nick}
          className="w-8 h-8 object-contain image-rendering-pixel shrink-0"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-8 h-8 flex items-center justify-center text-[16px] shrink-0">
          {status === "checking" ? "⏳" : status === "found" ? "👤" : "❌"}
        </div>
      )}

      {/* Texto */}
      <div className="flex-1 min-w-0">
        {status === "checking" && (
          <span className="text-[#aaa]">Verificando nick no Habbo...</span>
        )}
        {status === "found" && (
          <div>
            <span className="text-[#7CFC8A] font-bold">{habboUser?.name || nick}</span>
            <span className="text-[#7CFC8A]"> encontrado ✓</span>
            {habboUser?.motto && (
              <div className="text-[#aaa] text-[10px] truncate">{habboUser.motto}</div>
            )}
          </div>
        )}
        {status === "not_found" && (
          <span className="text-[#FF8A8A]">Nick não encontrado no Habbo Hotel</span>
        )}
      </div>
    </div>
  )
}

// ── Formulário de Login ──────────────────────────────────────────────────────
function LoginForm({ onLogin, onSwitch, loading, error }) {
  const [habboNick, setHabboNick] = React.useState("")
  const [password, setPassword] = React.useState("")

  function handleSubmit(e) {
    e.preventDefault()
    if (!habboNick.trim() || !password || loading) return
    playSound()
    onLogin({ habboNick: habboNick.trim(), password })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <div className="text-white text-[13px] font-bold mb-1">Nick do Habbo</div>
        <input
          value={habboNick}
          onChange={(e) => setHabboNick(e.target.value)}
          placeholder="Seu nick no Habbo Hotel"
          autoComplete="username"
          className="w-full h-9 border border-[#8a8a8a] bg-[rgba(255,255,255,0.10)] px-3 text-[12px] text-white outline-none placeholder:text-[#b0b0b0]"
        />
      </div>
      <div>
        <div className="text-white text-[13px] font-bold mb-1">Senha</div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Sua senha"
          autoComplete="current-password"
          className="w-full h-9 border border-[#8a8a8a] bg-[rgba(255,255,255,0.10)] px-3 text-[12px] text-white outline-none placeholder:text-[#b0b0b0]"
        />
      </div>

      {error && <div className="text-[#ffd6d6] text-[12px]">{error}</div>}

      <Button type="submit" disabled={!habboNick.trim() || !password || loading}>
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

// ── Formulário de Cadastro ───────────────────────────────────────────────────
function RegisterForm({ onRegister, onSwitch, loading, error }) {
  const [habboNick, setHabboNick] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [localError, setLocalError] = React.useState("")

  const { status, habboUser } = useHabboNickValidation(habboNick)

  const nickValid = status === "found"
  const canSubmit = nickValid && password.length >= 6 && password === confirmPassword && !loading

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    if (password.length < 6) { setLocalError("Senha deve ter pelo menos 6 caracteres."); return }
    if (password !== confirmPassword) { setLocalError("As senhas não coincidem."); return }
    setLocalError("")
    playSound()
    onRegister({ habboNick: habboNick.trim(), password })
  }

  const displayError = localError || error

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Nick */}
      <div>
        <div className="text-white text-[13px] font-bold mb-1">Nick do Habbo</div>
        <input
          value={habboNick}
          onChange={(e) => setHabboNick(e.target.value)}
          placeholder="Seu nick no Habbo Hotel"
          autoComplete="username"
          className="w-full h-9 border border-[#8a8a8a] bg-[rgba(255,255,255,0.10)] px-3 text-[12px] text-white outline-none placeholder:text-[#b0b0b0] mb-2"
        />
        {/* Preview de validação */}
        <AvatarPreview nick={habboNick.trim()} status={status} habboUser={habboUser} />
      </div>

      {/* Senha */}
      <div>
        <div className="text-white text-[13px] font-bold mb-1">Senha</div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          className="w-full h-9 border border-[#8a8a8a] bg-[rgba(255,255,255,0.10)] px-3 text-[12px] text-white outline-none placeholder:text-[#b0b0b0]"
        />
        <div className="flex items-start gap-1 mt-1">
          <span className="text-[10px] text-[#aaa] leading-4">
            Use uma senha diferente do Habbo Hotel.
          </span>
        </div>
      </div>

      {/* Confirmar senha */}
      <div>
        <div className="text-white text-[13px] font-bold mb-1">Confirmar senha</div>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repita a senha"
          autoComplete="new-password"
          className="w-full h-9 border border-[#8a8a8a] bg-[rgba(255,255,255,0.10)] px-3 text-[12px] text-white outline-none placeholder:text-[#b0b0b0]"
        />
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

// ── Modal principal ──────────────────────────────────────────────────────────
export default function LoginModal({
  open,
  mode = "login",
  onSetMode,
  loading,
  error,
  onLogin,
  onRegister,
  onContinueAnonymous,
  onClose,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.55)] flex items-center justify-center p-4">
      <ConsoleCard
        title={mode === "register" ? "Criar conta" : "Entrar"}
        onClose={onClose}
        className="w-full max-w-[420px]"
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

        <div className="flex items-center gap-2 my-3">
          <div className="flex-1 border-t border-[#ffffff22]" />
          <span className="text-[10px] text-[#888]">ou</span>
          <div className="flex-1 border-t border-[#ffffff22]" />
        </div>

        <Button
          variant="secondary"
          onClick={() => { playSound(); onContinueAnonymous({}) }}
          disabled={loading}
        >
          Continuar sem conta
        </Button>

        <div className="mt-3 border border-[#ffffff22] rounded-[6px] p-2 bg-[rgba(255,255,255,0.03)]">
          <div className="text-[10px] text-[#aaa] leading-4">
            <span className="text-[#ffd64d] font-bold">Crie sua conta:</span> Controle seus mobis, acompanhe preços em tempo real e organize tudo no seu inventário.
          </div>
        </div>
      </ConsoleCard>
    </div>
  )
}