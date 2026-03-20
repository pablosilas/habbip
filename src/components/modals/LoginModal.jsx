import React from "react"
import ConsoleCard from "../ui/ConsoleCard"
import Button from "../ui/Button"

export default function LoginModal({
  open,
  loading,
  error,
  onLogin,
  onContinueAnonymous,
  onClose,
}) {
  const [nick, setNick] = React.useState("")
  const [doNotAskAgain, setDoNotAskAgain] = React.useState(false)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.55)] flex items-center justify-center p-4">
      <ConsoleCard title="Entrar" onClose={onClose} className="w-full max-w-[420px]">
        <div className="text-white text-[13px] font-bold mb-2">
          Seu nick Habbo:
        </div>
        <input
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && nick.trim() && !loading) {
              onLogin(nick.trim())
            }
          }}
          placeholder="Digite seu nick"
          className="w-full h-9 border border-[#8a8a8a] bg-[rgba(255,255,255,0.10)] px-3 text-[12px] text-white outline-none placeholder:text-[#b0b0b0] mb-3"
        />

        {error ? (
          <div className="text-[#ffd6d6] text-[12px] mb-3">{error}</div>
        ) : null}

        <div className="flex flex-col gap-2 mb-3">
          <Button onClick={() => onLogin(nick.trim())} disabled={!nick.trim() || loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <Button variant="secondary" onClick={() => onContinueAnonymous({ doNotAskAgain })} disabled={loading}>
            Entrar como anônimo
          </Button>
        </div>
        <label className="flex items-center gap-2 text-[12px] text-[#ededed] cursor-pointer">
          <input
            type="checkbox"
            checked={doNotAskAgain}
            onChange={(e) => setDoNotAskAgain(e.target.checked)}
          />
          Não perguntar novamente
        </label>
      </ConsoleCard >
    </div >
  )
}