import ConsoleCard from "../ui/ConsoleCard";

export default function InfoModal({ open, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.55)] flex items-center justify-center p-4">
      <ConsoleCard title="Sobre o Habbip" onClose={onClose} className="w-full max-w-[420px]">
        <>
          <div>
            <div className="text-[#fff2c1] font-bold text-[12px] mb-1">O que é?</div>
            <div className="text-[#ededed] text-[12px] leading-5">
              O Habbip é uma ferramenta para consultar dados da Feira Livre e perfis de usuários do Habbo Hotel.
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
        </>
      </ConsoleCard >
    </div >
  )
}