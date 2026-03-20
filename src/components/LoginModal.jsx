import React from "react"

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
      <div className="console-card w-full max-w-[420px] rounded-[23px] border-[1px] border-[#1D190D] bg-[#ffca00] shadow-[0_18px_40px_rgba(0,0,0,0.35)] overflow-hidden">

        {/* Header */}
        <div className="h-8 bg-[#ffca00] relative flex items-center justify-center px-3 overflow-hidden">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-[35%] h-[18px] bg-[radial-gradient(#C7970F_1px,transparent_1px)] bg-[size:4px_4px] opacity-70" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-[35%] h-[18px] bg-[radial-gradient(#C7970F_1px,transparent_1px)] bg-[size:4px_4px] opacity-70" />
          <div className="text-[12px] font-bold text-[#7c4e00] tracking-wide z-10">
            Entrar
          </div>
          <div className="absolute right-4 flex gap-1 z-10">
            <button
              type="button"
              onClick={onClose}
              className="w-4 h-4 rounded-[2px] border border-[#9a6500] bg-[#ffca00] text-[#7c4e00] text-[10px] flex items-center justify-center cursor-pointer"
              aria-label="Fechar"
            >
              X
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-3 pb-3 bg-[#ffca00]">
          <div className="rounded-[14px] border-[2px] border-[#1D190D] bg-[repeating-linear-gradient(180deg,#535353_0px,#535353_2px,#4b4b4b_2px,#4b4b4b_4px)] p-3"
            style={{ boxShadow: "inset 0 4px 6px rgba(0,0,0,0.4), inset 0 -4px 6px rgba(0,0,0,0.4), inset 4px 0 6px rgba(0,0,0,0.4), inset -4px 0 6px rgba(0,0,0,0.4)" }}
          >
            <div className="rounded-[10px] border border-[#8a8a8a] bg-[rgba(0,0,0,0.08)] p-3">
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
                <button
                  type="button"
                  onClick={() => onLogin(nick.trim())}
                  disabled={!nick.trim() || loading}
                  className="h-9 border border-[#b98d14] bg-[linear-gradient(180deg,#ffd64d_0%,#e6b21b_100%)] text-[#6f4700] font-bold text-[12px] disabled:opacity-70 cursor-pointer"
                >
                  {loading ? "Entrando..." : "Entrar"}
                </button>

                <button
                  type="button"
                  onClick={() => onContinueAnonymous({ doNotAskAgain })}
                  disabled={loading}
                  className="h-9 border border-[#6d6d6d] bg-[linear-gradient(180deg,#5a5a63_0%,#44454e_100%)] text-white font-bold text-[12px] cursor-pointer"
                >
                  Entrar como anônimo
                </button>
              </div>

              <label className="flex items-center gap-2 text-[12px] text-[#ededed] cursor-pointer">
                <input
                  type="checkbox"
                  checked={doNotAskAgain}
                  onChange={(e) => setDoNotAskAgain(e.target.checked)}
                />
                Não perguntar novamente
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}