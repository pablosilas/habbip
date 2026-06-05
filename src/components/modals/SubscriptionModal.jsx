import React from "react"
import ConsoleCard from "../ui/ConsoleCard"
import Button from "../ui/Button"
import { createPixPayment, fetchSubscriptionStatus } from "../../services/authService"

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function SubscriptionModal({ open, onActivated, onLogout }) {
  const [step, setStep] = React.useState("info") // info | pix | waiting | done
  const [pixData, setPixData] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [copied, setCopied] = React.useState(false)
  const pollRef = React.useRef(null)

  React.useEffect(() => {
    return () => clearInterval(pollRef.current)
  }, [])

  async function handleGeneratePix() {
    setLoading(true)
    setError("")
    try {
      const data = await createPixPayment()
      setPixData(data)
      setStep("pix")
      startPolling()
    } catch (err) {
      setError(err.message || "Erro ao gerar PIX.")
    } finally {
      setLoading(false)
    }
  }

  function startPolling() {
    clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const result = await fetchSubscriptionStatus()
        if (result.status === 'active') {
          clearInterval(pollRef.current)
          setStep("done")
          setTimeout(() => onActivated?.(), 1500)
        }
      } catch { }
    }, 5000)
  }

  async function handleCopy() {
    if (!pixData?.qrCode) return
    try {
      await navigator.clipboard.writeText(pixData.qrCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] bg-[rgba(0,0,0,0.75)] flex items-center justify-center p-4">
      <ConsoleCard
        title="Assinatura Habbip"
        className="w-full max-w-[420px]"
      >
        {step === "info" && (
          <div className="flex flex-col gap-4">
            <div className="border border-[#ffd64d44] rounded-[6px] p-4 bg-[rgba(255,214,77,0.05)] text-center">
              <div className="text-[28px] font-bold text-[#ffd64d]">R$ 15</div>
              <div className="text-[12px] text-[#aaa]">por mês · acesso completo</div>
            </div>

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

            <div className="flex flex-col gap-2 text-[11px] text-[#888] border-t border-[#333] pt-3">
              <p>Pagamento via PIX. Acesso liberado automaticamente após confirmação.</p>
              <p>A assinatura é renovada manualmente a cada 30 dias.</p>
            </div>

            {error && <div className="text-[#ffd6d6] text-[12px]">{error}</div>}

            <Button onClick={handleGeneratePix} disabled={loading}>
              {loading ? "Gerando PIX..." : "Pagar com PIX"}
            </Button>

            <button
              type="button"
              onClick={onLogout}
              className="text-[11px] text-[#666] hover:text-[#999] cursor-pointer text-center transition-colors"
            >
              Sair da conta
            </button>
          </div>
        )}

        {step === "pix" && pixData && (
          <div className="flex flex-col gap-4">
            <div className="text-center text-[12px] text-[#ccc]">
              Escaneie o QR code ou copie o código PIX abaixo.
              <br />
              <span className="text-[#ffd64d] font-bold">Valor: R$ 15,00</span>
            </div>

            {pixData.qrCodeBase64 && (
              <div className="flex justify-center">
                <img
                  src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                  alt="QR Code PIX"
                  className="w-48 h-48 rounded-[8px] border-2 border-[#ffd64d] bg-white p-1"
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <div className="text-[11px] text-[#888]">Código PIX (copia e cola):</div>
              <div className="flex gap-2">
                <div className="flex-1 bg-[rgba(255,255,255,0.06)] border border-[#555] rounded-[4px] px-2 py-2 text-[10px] text-[#ccc] font-mono break-all select-all">
                  {pixData.qrCode}
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={[
                    "shrink-0 w-9 flex items-center justify-center border rounded-[4px] transition-colors cursor-pointer",
                    copied
                      ? "border-[#7CFC8A] text-[#7CFC8A] bg-[rgba(124,252,138,0.1)]"
                      : "border-[#555] text-[#888] hover:border-[#ffd64d] hover:text-[#ffd64d]",
                  ].join(" ")}
                  title="Copiar código PIX"
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#888]">
              <div className="w-2 h-2 rounded-full bg-[#ffd64d] animate-pulse shrink-0" />
              Aguardando confirmação do pagamento...
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="text-[11px] text-[#666] hover:text-[#999] cursor-pointer text-center transition-colors"
            >
              Sair da conta
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="text-[48px]">🎉</div>
            <div className="text-center">
              <div className="text-[16px] font-bold text-[#7CFC8A]">Pagamento confirmado!</div>
              <div className="text-[12px] text-[#aaa] mt-1">Sua assinatura está ativa. Abrindo o Habbip...</div>
            </div>
          </div>
        )}
      </ConsoleCard>
    </div>
  )
}
