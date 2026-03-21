import Button from "../ui/Button";
import ConsoleCard from "../ui/ConsoleCard";
import { getHabboAvatarHeadUrl, getHabboProfileUrl } from "../../services/habboApi";

export default function InfoModal({ open, onClose }) {
  if (!open) return null

  const avatarUrl = getHabboAvatarHeadUrl({ name: "Groovin", hotel: "br", size: "s" })
  const profileUrl = getHabboProfileUrl({ name: "Groovin", hotel: "br" })

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.55)] flex items-center justify-center p-4">
      <ConsoleCard title="Sobre o Habbip" onClose={onClose} className="w-full max-w-[420px]">
        <>
          <div>
            <div className="text-[#fff2c1] font-bold text-[12px] mb-1">O que é?</div>
            <div className="text-[#ededed] text-[12px] leading-5">
              O Habbip é uma ferramenta feita para jogadores do Habbo Hotel. Consulte preços e tendências da Feira Livre, pesquise perfis de usuários e gerencie seu inventário de mobis com cálculo de valor em tempo real.
            </div>
          </div>

          <div>
            <div className="text-[#fff2c1] font-bold text-[12px] mb-1">Desenvolvido por</div>
            <a
              href={profileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 w-fit hover:opacity-80 transition-opacity"
            >
              <img
                src={avatarUrl}
                alt="Groovin"
                className="w-8 h-8 image-rendering-pixel"
                onError={(e) => { e.currentTarget.style.display = "none" }}
              />
              <span className="text-[#fff2c1] font-bold text-[12px] underline underline-offset-2">
                Groovin
              </span>
            </a>
          </div>

          <div className="mb-2">
            <div className="text-[#fff2c1] font-bold text-[12px] mb-1">Versão</div>
            <div className="text-[#ededed] text-[12px]">1.0.0</div>
          </div>

          {/* Sugestões */}
          <div className="border border-[#ffffff22] rounded-[8px] p-3 bg-[rgba(255,255,255,0.04)]">
            <div className="text-[#fff2c1] font-bold text-[12px] mb-1">Caixa de Sugestões</div>
            <div className="text-[#ededed] text-[12px] leading-5 mb-3">
              Tem uma ideia, encontrou um bug ou quer ver algo novo? Deixe seu feedback — todo retorno é lido e considerado.
            </div>
            <Button
              variant="secondary"
              onClick={() => window.open("https://forms.gle/kUy1Fz85QY7kPWsLA", "_blank")}
            >
              Enviar sugestão
            </Button>
          </div>

          {/* Direitos */}
          <div className="border-t border-[#ffffff22] pt-2 mt-2">
            <div className="text-[#bfbfbf] text-[10px] leading-4 text-center">
              © 2026 Habbip<br />
              Todos os direitos reservados.<br />
              Este site não é afiliado, patrocinado, apoiado ou aprovado pela Sulake Oy ou suas afiliadas.
            </div>
          </div>

          <Button onClick={onClose}>
            Fechar
          </Button>
        </>
      </ConsoleCard>
    </div >
  )
}