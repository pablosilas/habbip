import React from "react"

/**
 * LocalDataBanner
 *
 * Aviso discreto para usuários anônimos que têm dados salvos localmente
 * (inventário ou watchlist no localStorage).
 *
 * Aparece só quando o usuário não está logado e tem dados salvos.
 * Tem um botão para criar conta e salvar definitivamente.
 */
export default function LocalDataBanner({ hasLocalData, onLogin }) {
  const [dismissed, setDismissed] = React.useState(false)

  if (!hasLocalData || dismissed) return null

  return (
    <div className="flex items-start gap-2 px-3 py-2 mb-2 border border-[#ffd64d44] bg-[rgba(255,214,77,0.07)] rounded-[6px]">
      <span className="text-[12px] shrink-0 mt-[1px]">⚠️</span>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-[#e0c060] font-bold leading-tight">
          Dados salvos só neste dispositivo
        </div>
        <div className="text-[10px] text-[#bbb] leading-[14px] mt-[2px]">
          Seu inventário pode se perder se limpar o navegador.{" "}
          <button
            type="button"
            onClick={onLogin}
            className="text-[#ffd64d] font-bold hover:underline cursor-pointer"
          >
            Crie uma conta
          </button>{" "}
          para sincronizar em qualquer lugar.
        </div>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-[#666] hover:text-[#aaa] text-[12px] cursor-pointer shrink-0 mt-[1px]"
        title="Fechar"
      >
        ✕
      </button>
    </div>
  )
}