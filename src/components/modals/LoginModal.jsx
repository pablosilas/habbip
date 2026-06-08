import React from "react"
import ConsoleCard from "../ui/ConsoleCard"
import Button from "../ui/Button"
import messageSound from "../../assets/message.mp3"

function playSound() {
  try { new Audio(messageSound).play() } catch { }
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

function PasswordInput({ value, onChange, disabled }) {
  const [reveal, setReveal] = React.useState(false)
  return (
    <div className="flex gap-[4px]">
      <input
        type={reveal ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Sua senha"
        autoComplete="current-password"
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

export default function LoginModal({ open, loading, error, onLogin }) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || password.length < 8 || loading) return
    playSound()
    onLogin({ email: email.trim(), password })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.55)] flex items-center justify-center p-4">
      <ConsoleCard title="Habbip" className="w-full max-w-[420px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          <div className="border border-[#ffd64d44] rounded-[6px] p-3 bg-[rgba(255,214,77,0.05)] text-center">
            <div className="text-[12px] text-[#ffd64d] font-bold mb-1">Acesso exclusivo</div>
            <div className="text-[11px] text-[#aaa] leading-[16px]">
              Este site é de uso restrito. Faça login com suas credenciais para continuar.
            </div>
          </div>

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
            <PasswordInput value={password} onChange={setPassword} disabled={loading} />
          </div>

          {error && <div className="text-[#ffd6d6] text-[12px]">{error}</div>}

          <Button type="submit" disabled={!email.trim() || password.length < 8 || loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <div className="border-t border-[#333] pt-3 text-center flex flex-col gap-1">
            <div className="text-[11px] text-[#888]">Não tem acesso?</div>
            <div className="text-[11px] text-[#aaa]">
              Entre em contato com seu e-mail ou nick no Habbo:
            </div>
            <a
              href="mailto:contato@habbip.org"
              className="text-[12px] font-bold text-[#ffd64d] hover:underline"
            >
              contato@habbip.org
            </a>
          </div>

        </form>
      </ConsoleCard>
    </div>
  )
}
