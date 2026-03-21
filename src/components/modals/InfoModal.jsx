import Button from "../ui/Button";
import ConsoleCard from "../ui/ConsoleCard";

export default function InfoModal({ open, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.55)] flex items-center justify-center p-4">
      <ConsoleCard title="Sobre o Habbo Desk" onClose={onClose} className="w-full max-w-[420px]">
        <>
          <div>
            <div className="text-[#fff2c1] font-bold text-[12px] mb-1">O que é?</div>
            <div className="text-[#ededed] text-[12px] leading-5">
              O Habbo Desk é uma ferramenta para consultar dados da Feira Livre e perfis de usuários do Habbo Hotel.
            </div>
          </div>

          <div>
            <div className="text-[#fff2c1] font-bold text-[12px] mb-1">Desenvolvido por</div>
            <div className="text-[#ededed] text-[12px] leading-5">
              Groovin
            </div>
          </div>

          <div>
            <div className="text-[#fff2c1] font-bold text-[12px] mb-1">Versão</div>
            <div className="text-[#ededed] text-[12px]">1.0.0</div>
          </div>
          <Button onClick={onClose} >
            Fechar
          </Button>
        </>
      </ConsoleCard >
    </div >
  )
}