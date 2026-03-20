import React from "react"

export default function InfoModal({ open, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.55)] flex items-center justify-center p-4">
      <div className="console-card w-full max-w-[420px] rounded-[23px] border-[1px] border-[#1D190D] bg-[#ffca00] shadow-[0_18px_40px_rgba(0,0,0,0.35)] overflow-hidden">

        {/* Header */}
        <div className="h-8 bg-[#ffca00] relative flex items-center justify-center px-3 overflow-hidden">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-[35%] h-[18px] bg-[radial-gradient(#C7970F_1px,transparent_1px)] bg-[size:4px_4px] opacity-70" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-[35%] h-[18px] bg-[radial-gradient(#C7970F_1px,transparent_1px)] bg-[size:4px_4px] opacity-70" />
          <div className="text-[12px] font-bold text-[#7c4e00] tracking-wide z-10">
            Sobre o Habbolatorio
          </div>
          <div className="absolute right-4 flex gap-1 z-10">
            <button
              type="button"
              onClick={onClose}
              className="w-4 h-4 rounded-[2px] border border-[#9a6500] bg-[#ffca00] text-[#7c4e00] text-[10px] flex items-center justify-center cursor-pointer"
            >
              X
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-3 pb-3 bg-[#ffca00]">
          <div
            className="rounded-[14px] border-[2px] border-[#1D190D] bg-[repeating-linear-gradient(180deg,#535353_0px,#535353_2px,#4b4b4b_2px,#4b4b4b_4px)] p-3"
            style={{ boxShadow: "inset 0 4px 6px rgba(0,0,0,0.4), inset 0 -4px 6px rgba(0,0,0,0.4), inset 4px 0 6px rgba(0,0,0,0.4), inset -4px 0 6px rgba(0,0,0,0.4)" }}
          >
            <div className="rounded-[10px] border border-[#8a8a8a] bg-[rgba(0,0,0,0.08)] p-4 space-y-4">

              <div>
                <div className="text-[#fff2c1] font-bold text-[12px] mb-1">O que é?</div>
                <div className="text-[#ededed] text-[12px] leading-5">
                  O Habbolatorio é uma ferramenta para consultar dados da Feira Livre e perfis de usuários do Habbo Hotel.
                </div>
              </div>

              <div>
                <div className="text-[#fff2c1] font-bold text-[12px] mb-1">Desenvolvido por</div>
                <div className="text-[#ededed] text-[12px] leading-5">
                  Groovin (Pablo Silas)
                </div>
              </div>

              <div>
                <div className="text-[#fff2c1] font-bold text-[12px] mb-1">Contato</div>
                <div className="text-[#ededed] text-[12px] leading-5">
                  pablosilas14@gmail.com
                </div>
              </div>

              <div>
                <div className="text-[#fff2c1] font-bold text-[12px] mb-1">Versão</div>
                <div className="text-[#ededed] text-[12px]">1.0.0</div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full h-9 rounded-[6px] border border-[#9a6500] bg-[#ffca00] text-[#7c4e00] text-[12px] font-bold cursor-pointer hover:brightness-110"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}