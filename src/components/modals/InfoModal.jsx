import Button from "../ui/Button";
import ConsoleCard from "../ui/ConsoleCard";
import { getHabboAvatarHeadUrl, getHabboProfileUrl } from "../../services/habboApi";

export default function InfoModal({ open, onClose }) {
  if (!open) return null

  const avatarUrl = getHabboAvatarHeadUrl({ name: "Groovin", hotel: "br", size: "s" })
  const profileUrl = getHabboProfileUrl({ name: "Groovin", hotel: "br" })

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <ConsoleCard title="Sobre o Habbip" onClose={onClose} className="w-full max-w-[560px]">
        <div className="space-y-4">
          {/* What is it */}
          <div className="border-2 border-sky-100 rounded-xl p-4 bg-white">
            <div className="text-sky-800 font-bold text-[13px] mb-2">O que e?</div>
            <div className="text-sky-700 text-[13px] leading-relaxed">
              O Habbip e uma ferramenta feita para jogadores do Habbo Hotel. Consulte precos e tendencias da Feira Livre, pesquise perfis de usuarios e gerencie seu inventario de mobis com calculo de valor em tempo real.
            </div>
          </div>

          {/* Developer */}
          <div className="border-2 border-sky-100 rounded-xl p-4 bg-white">
            <div className="text-sky-800 font-bold text-[13px] mb-3">Desenvolvido por</div>
            <a
              href={profileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 w-fit hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-lg bg-sky-50 border-2 border-sky-200 flex items-center justify-center overflow-hidden">
                <img
                  src={avatarUrl}
                  alt="Groovin"
                  className="w-full h-full object-contain pixel-render"
                  onError={(e) => { e.currentTarget.style.display = "none" }}
                />
              </div>
              <span className="text-sky-600 font-bold text-[14px] hover:text-sky-700">
                Groovin
              </span>
            </a>
          </div>

          {/* Version */}
          <div className="flex items-center justify-between px-4 py-3 bg-sky-50 rounded-xl">
            <span className="text-sky-700 font-semibold text-[13px]">Versao</span>
            <span className="text-sky-500 text-[13px]">2.0.0</span>
          </div>

          {/* Suggestions */}
          <div className="border-2 border-cyan-200 rounded-xl p-4 bg-gradient-to-br from-cyan-50 to-sky-50">
            <div className="text-cyan-800 font-bold text-[13px] mb-2">Caixa de Sugestoes</div>
            <div className="text-cyan-700 text-[13px] leading-relaxed mb-4">
              Tem uma ideia, encontrou um bug ou quer ver algo novo? Deixe seu feedback — todo retorno e lido e considerado.
            </div>
            <Button
              variant="secondary"
              onClick={() => window.open("https://forms.gle/kUy1Fz85QY7kPWsLA", "_blank")}
              className="w-full"
            >
              Enviar sugestao
            </Button>
          </div>

          {/* Rights */}
          <div className="border-t border-sky-100 pt-4">
            <div className="text-sky-400 text-[10px] leading-relaxed text-center">
              2026 Habbip - Todos os direitos reservados.<br />
              Este site nao e afiliado, patrocinado, apoiado ou aprovado pela Sulake Oy ou suas afiliadas.
            </div>
          </div>

          <Button onClick={onClose} className="w-full">
            Fechar
          </Button>
        </div>
      </ConsoleCard>
    </div>
  )
}
