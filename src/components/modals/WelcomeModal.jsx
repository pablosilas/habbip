import ConsoleCard from "../ui/ConsoleCard"
import Button from "../ui/Button"

const STORAGE_KEY = "habbip:welcome-seen"

function IconFair() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
    </svg>
  )
}

function IconBell() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z" />
    </svg>
  )
}

function IconTarget() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm0 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
    </svg>
  )
}

function IconBox() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2l-2.218-.887zm3.564 1.426L5.596 5 8 5.961 14.154 3.5l-2.404-.961zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z" />
    </svg>
  )
}

function IconShield() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z" />
    </svg>
  )
}

function IconCloud() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z" />
    </svg>
  )
}

function Feature({ icon, title, desc }) {
  const Icon = icon
  return (
    <div className="flex items-start gap-[6px]">
      <span className="shrink-0 mt-[1px] text-[#fff2c1]">
        <Icon />
      </span>
      <div>
        <div className="text-[#fff2c1] font-bold text-[10px] leading-[1.4]">{title}</div>
        <div className="text-[#c8c8c8] text-[10px] leading-[1.4]">{desc}</div>
      </div>
    </div>
  )
}

export default function WelcomeModal({ open, onClose, onDismiss }) {
  if (!open) return null

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, "1")
    onDismiss()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[rgba(0,0,0,0.65)] flex items-center justify-center p-4">
      <ConsoleCard title="Bem-vindo ao Habbip!" onClose={onClose} className="w-full max-w-[460px]">
        <div className="flex flex-col gap-[10px]">

          <p className="text-[#ededed] text-[10px] leading-[1.5] m-0">
            Ferramenta gratuita para jogadores do <span className="text-[#fff2c1] font-bold">Habbo Hotel</span>. Veja o que você pode fazer:
          </p>

          {/* Funcionalidades — grid 2 colunas */}
          <div className="grid grid-cols-2 gap-[8px]">
            <Feature icon={IconFair} title="Feira Livre" desc="Pesquise preços de mobis em tempo real entre hotéis." />
            <Feature icon={IconBell} title="Monitorar Preço" desc="Receba notificações quando o preço mudar na feira." />
            <Feature icon={IconTarget} title="Alertas personalizados" desc="Defina um preço-alvo e seja notificado ao atingi-lo." />
            <Feature icon={IconUser} title="Buscar Usuário" desc="Consulte perfis públicos de qualquer jogador." />
            <Feature icon={IconBox} title="Inventário" desc="Gerencie seus mobis com cálculo de valor em créditos e reais." />
          </div>

          {/* Segurança — linha divisória + 2 itens compactos */}
          <div className="border-t border-[#ffffff18] pt-[8px] flex flex-col gap-[6px]">
            <div className="text-[#fff2c1] font-bold text-[10px]">Segurança</div>
            <div className="flex gap-4">
              <Feature icon={IconShield} title="Conta própria no Habbip" desc="Separada da sua conta Habbo — nunca pedimos sua senha do jogo." />
              <Feature icon={IconCloud} title="Dados na nuvem" desc="Inventário e watchlist sincronizados em qualquer dispositivo." />
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-[6px] pt-[2px]">
            <Button onClick={handleDismiss} className="w-full">
              Entendi — não mostrar mais
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="text-[#bfbfbf] text-[10px] text-center hover:text-white transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>

        </div>
      </ConsoleCard>
    </div>
  )
}
