import React from "react"

// ── Configuração ──────────────────────────────────────────────────────────────
// A chave secreta para acessar o preview. Defina em .env:
//   VITE_PREVIEW_KEY=suachavesecreta
// Acesse via: https://habbip.com/?preview=suachavesecreta
const PREVIEW_KEY = import.meta.env.VITE_PREVIEW_KEY || "habbip_preview_2025"
const STORAGE_KEY = "habbip:preview_unlocked"

// ── Pixel decorativo ──────────────────────────────────────────────────────────
const PIXEL_ROWS = [
  "##..##..##..##",
  ".##..##..##..#",
  "##..##..##..##",
  ".##..##..##..#",
]

function PixelGrid() {
  return (
    <div className="flex flex-col gap-[3px] opacity-20 select-none mb-6">
      {PIXEL_ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-[3px]">
          {row.split("").map((cell, ci) => (
            <div
              key={ci}
              className="w-[6px] h-[6px]"
              style={{ background: cell === "#" ? "#ffca00" : "transparent" }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Spinner animado ───────────────────────────────────────────────────────────
function PixelSpinner() {
  const [frame, setFrame] = React.useState(0)
  const frames = ["◆", "◇", "◆", "◇"]

  React.useEffect(() => {
    const t = setInterval(() => setFrame((f) => (f + 1) % frames.length), 400)
    return () => clearInterval(t)
  }, [])

  return <span className="text-[#ffca00] text-[18px]">{frames[frame]}</span>
}

// ── MaintenancePage ───────────────────────────────────────────────────────────
export default function MaintenancePage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: "#1a1a1a",
        backgroundImage: "radial-gradient(#2a2a2a 1px, transparent 1px)",
        backgroundSize: "16px 16px",
        fontFamily: "Verdana, Arial, sans-serif",
      }}
    >
      <div className="flex flex-col items-center text-center max-w-[380px]">
        <PixelGrid />

        {/* Card no estilo Habbip */}
        <div
          className="w-full rounded-[20px] border-[2px] border-[#1D190D] overflow-hidden"
          style={{
            background: "#ffca00",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 1px 1px 0 rgba(255,255,255,0.8)",
          }}
        >
          {/* Header */}
          <div
            className="h-9 flex items-center justify-center relative overflow-hidden"
            style={{ background: "#ffca00", boxShadow: "inset -3px 0 0 rgba(0,0,0,0.15)" }}
          >
            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-[35%] h-[18px] opacity-60"
              style={{ background: "radial-gradient(#C7970F 1px, transparent 1px)", backgroundSize: "4px 4px" }} />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-[35%] h-[18px] opacity-60"
              style={{ background: "radial-gradient(#C7970F 1px, transparent 1px)", backgroundSize: "4px 4px" }} />
            <span className="text-[12px] font-bold text-[#7c4e00] tracking-wide z-10">Habbip</span>
          </div>

          {/* Bezel */}
          <div className="px-3 pb-3">
            <div
              className="mt-1 rounded-[14px] border-[2px] border-[#1D190D] p-5"
              style={{
                background: "repeating-linear-gradient(180deg, #535353 0px, #535353 2px, #4b4b4b 2px, #4b4b4b 4px)",
                boxShadow: "inset 0 8px 0 rgba(0,0,0,0.3), inset 0 -5px 0 rgba(0,0,0,0.3)",
              }}
            >
              <div
                className="rounded-[10px] border border-[#8a8a8a] p-5 flex flex-col items-center gap-4"
                style={{ background: "rgba(0,0,0,0.08)" }}
              >
                <PixelSpinner />

                <div>
                  <div className="text-white text-[15px] font-bold mb-1">
                    Em manutenção
                  </div>
                  <div className="text-[#ccc] text-[11px] leading-[18px]">
                    Estamos aplicando melhorias.<br />
                    Voltamos em breve!
                  </div>
                </div>

                <div className="w-full border-t border-dashed border-[#ffffff22]" />

                <div className="text-[#888] text-[10px] leading-[16px]">
                  Acompanhe novidades no nosso Discord ou volte mais tarde.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-[#444] text-[9px]">
          habbip.vercel.app © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  )
}

// ── Hook para verificar acesso ao preview ─────────────────────────────────────
export function useMaintenanceGate() {
  const [allowed, setAllowed] = React.useState(() => {
    // Checa se já está desbloqueado nesta sessão
    try {
      return sessionStorage.getItem(STORAGE_KEY) === "true"
    } catch { return false }
  })

  React.useEffect(() => {
    if (allowed) return

    // Checa query param ?preview=<chave>
    const params = new URLSearchParams(window.location.search)
    const key = params.get("preview")

    if (key && key === PREVIEW_KEY) {
      try { sessionStorage.setItem(STORAGE_KEY, "true") } catch { }
      // Remove o param da URL sem recarregar a página
      params.delete("preview")
      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname
      window.history.replaceState({}, "", newUrl)
      setAllowed(true)
    }
  }, [allowed])

  return allowed
}