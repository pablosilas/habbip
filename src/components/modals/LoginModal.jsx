import React from "react"
import Button from "../ui/Button"
import messageSound from "../../assets/message.mp3"

function playSound() {
  try { new Audio(messageSound).play() } catch { }
}

function HabbipLogo() {
  return (
    <svg width="160" height="48" viewBox="0 0 160 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ícone de casa estilo pixel */}
      <rect x="2" y="18" width="36" height="28" fill="#ffd64d" rx="2"/>
      <polygon points="20,2 0,20 40,20" fill="#ffb800"/>
      <rect x="14" y="28" width="12" height="18" fill="#7c4e00" rx="1"/>
      <rect x="6" y="22" width="8" height="8" fill="#fff9e6" rx="1"/>
      <rect x="26" y="22" width="8" height="8" fill="#fff9e6" rx="1"/>
      {/* Texto HABBIP */}
      <text x="50" y="34" fontFamily="Verdana, Arial, sans-serif" fontWeight="bold" fontSize="26" fill="#ffd64d" letterSpacing="1">HABBIP</text>
    </svg>
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

function PasswordInput({ value, onChange, disabled }) {
  const [reveal, setReveal] = React.useState(false)
  return (
    <div className="flex gap-[4px]">
      <input
        type={reveal ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Senha"
        autoComplete="current-password"
        className="flex-1 h-10 border border-[#8a8a8a] bg-[rgba(255,255,255,0.08)] px-3 text-[13px] text-white outline-none placeholder:text-[#777] rounded-[4px]"
      />
      <button
        type="button"
        onClick={() => setReveal(v => !v)}
        className={[
          "w-10 h-10 flex items-center justify-center border rounded-[4px] transition-colors cursor-pointer shrink-0",
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
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        background: "radial-gradient(ellipse at 60% 40%, #2a1a00 0%, #1a1200 40%, #0d0d0d 100%)",
      }}
    >
      {/* Padrão de fundo decorativo */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "repeating-linear-gradient(0deg, #ffd64d 0px, #ffd64d 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #ffd64d 0px, #ffd64d 1px, transparent 1px, transparent 40px)",
      }} />

      <div className="relative w-full max-w-[400px] flex flex-col items-center gap-6">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <HabbipLogo />
          <div className="text-[11px] text-[#888] tracking-widest uppercase">Ferramenta para o Habbo Hotel</div>
        </div>

        {/* Card de login */}
        <div className="w-full rounded-[10px] border border-[#3a2a00] bg-[rgba(0,0,0,0.55)] backdrop-blur-sm p-6 flex flex-col gap-4"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,214,77,0.08)" }}
        >
          <div className="text-center">
            <div className="text-[15px] font-bold text-white mb-1">Acesso exclusivo</div>
            <div className="text-[11px] text-[#888] leading-5">
              Este site é de uso restrito.<br />
              Faça login com suas credenciais para continuar.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <div className="text-[11px] text-[#aaa] font-bold mb-1 uppercase tracking-wide">Email</div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                className="w-full h-10 border border-[#8a8a8a] bg-[rgba(255,255,255,0.08)] px-3 text-[13px] text-white outline-none placeholder:text-[#777] rounded-[4px] focus:border-[#ffd64d] transition-colors"
              />
            </div>

            <div>
              <div className="text-[11px] text-[#aaa] font-bold mb-1 uppercase tracking-wide">Senha</div>
              <PasswordInput value={password} onChange={setPassword} disabled={loading} />
            </div>

            {error && (
              <div className="text-[#ff8a8a] text-[12px] bg-[rgba(255,100,100,0.08)] border border-[#ff8a8a44] rounded-[4px] px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!email.trim() || password.length < 8 || loading}
              className="w-full h-10 rounded-[4px] font-bold text-[13px] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(180deg, #ffd64d 0%, #ffb800 100%)",
                color: "#7c4e00",
                border: "1px solid #a06800",
                boxShadow: "0 2px 0 #7c4e00",
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        {/* Aviso de acesso */}
        <div className="w-full rounded-[8px] border border-[#ffd64d22] bg-[rgba(255,214,77,0.04)] px-4 py-3 flex flex-col gap-1 text-center">
          <div className="text-[11px] text-[#888]">Não tem acesso?</div>
          <div className="text-[11px] text-[#ccc] leading-5">
            Entre em contato enviando seu e-mail ou nick no Habbo para:
          </div>
          <a
            href="mailto:contato@habbip.org"
            className="text-[13px] font-bold text-[#ffd64d] hover:underline mt-1"
          >
            contato@habbip.org
          </a>
        </div>

        <div className="text-[10px] text-[#444]">© Habbip — Todos os direitos reservados</div>
      </div>
    </div>
  )
}
