import React from "react"
import ConsoleCard from "../ui/ConsoleCard"

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

export default function SubscriptionModal({ open, onLogout }) {
  const [copied, setCopied] = React.useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText("contato@habbip.org")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] bg-[rgba(0,0,0,0.75)] flex items-center justify-center p-4">
      <ConsoleCard
        title="Acesso ao Habbip"
        className="w-full max-w-[420px]"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 text-[12px] text-[#ccc]">
            <div className="flex items-center gap-2">
              <span className="text-[#7CFC8A]">✓</span> Monitoramento de preços em tempo real
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#7CFC8A]">✓</span> Alertas de variação de preço
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#7CFC8A]">✓</span> Inventário sincronizado em todos os dispositivos
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#7CFC8A]">✓</span> Histórico de preços
            </div>
          </div>

          <div className="border border-[#ffd64d44] rounded-[6px] p-4 bg-[rgba(255,214,77,0.05)] flex flex-col gap-3">
            <div className="text-[12px] text-[#ccc] leading-5">
              Para solicitar acesso, envie um e-mail com seu <span className="text-white font-bold">contato ou nick no Habbo</span> para:
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[rgba(255,255,255,0.06)] border border-[#555] rounded-[4px] px-3 py-2 text-[13px] text-[#ffd64d] font-mono select-all">
                contato@habbip.org
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className={[
                  "shrink-0 px-3 h-9 text-[11px] border rounded-[4px] transition-colors cursor-pointer flex items-center gap-1",
                  copied
                    ? "border-[#7CFC8A] text-[#7CFC8A] bg-[rgba(124,252,138,0.1)]"
                    : "border-[#555] text-[#888] hover:border-[#ffd64d] hover:text-[#ffd64d]",
                ].join(" ")}
              >
                <MailIcon />
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <div className="text-[11px] text-[#888]">
              Entraremos em contato assim que o acesso for liberado.
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="text-[11px] text-[#666] hover:text-[#999] cursor-pointer text-center transition-colors"
          >
            Sair da conta
          </button>
        </div>
      </ConsoleCard>
    </div>
  )
}