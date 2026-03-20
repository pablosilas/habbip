/**
 * ConsoleCard
 *
 * Componente reutilizável que encapsula o padrão visual do card amarelo
 * usado em HabbipApp, InfoModal, LoginModal, ProfileModal e ToastMessage.
 *
 * Props:
 *   title          {string}    Texto do header central
 *   onClose        {function}  Se fornecido, renderiza o botão "X" no header
 *   headerRight    {node}      Slot para elementos extras à direita do header
 *                              (sobrescreve o botão X padrão se fornecido)
 *   expand         {boolean}   Ativa modo altura total (flex-col com altura fixa).
 *                              Necessário quando o card tem h-[X] definido no className,
 *                              ex: ProfileModal (h-[90vh]) e HabbipApp (h-full).
 *                              Faz o body crescer com flex-1 min-h-0 overflow-hidden,
 *                              o bezel com h-full min-h-0 overflow-hidden, e o inner com h-full.
 *   style          {object}    Estilos inline para o wrapper externo (ex: transform para rotate)
 *   className      {string}    Classes extras para o wrapper externo
 *   bodyClassName  {string}    Classes extras para o div do body (entre header e bezel)
 *   innerClassName {string}    Classes extras para a área interna (conteúdo)
 *   footer         {node}      Slot para conteúdo abaixo do bezel (ex: tabs de navegação)
 *   children       {node}      Conteúdo principal do card
 */
export default function ConsoleCard({
  title,
  onClose,
  headerRight,
  expand = false,
  style,
  className = "",
  bodyClassName = "",
  innerClassName = "",
  footer,
  children,
}) {
  // O slot direito do header: prioriza `headerRight`, depois botão X, depois nada
  const rightSlot = headerRight ?? (
    onClose ? (
      <button
        type="button"
        onClick={onClose}
        className="w-4 h-4 rounded-[2px] border border-[#9a6500] bg-[#ffca00] text-[#7c4e00] text-[10px] flex items-center justify-center cursor-pointer"
        aria-label="Fechar"
      >
        X
      </button>
    ) : null
  )

  return (
    <div
      className={`console-card rounded-[23px] border-[1px] border-[#1D190D] bg-[#ffca00] shadow-[0_18px_40px_rgba(0,0,0,0.25)] overflow-hidden ${expand || footer ? "flex flex-col" : ""} ${className}`}
      style={style}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="h-8 shrink-0 bg-[#ffca00] relative flex items-center justify-center px-3 overflow-hidden">
        {/* Pontinhos esquerda */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-[35%] h-[18px] bg-[radial-gradient(#C7970F_1px,transparent_1px)] bg-[size:4px_4px] opacity-70" />
        {/* Pontinhos direita */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-[35%] h-[18px] bg-[radial-gradient(#C7970F_1px,transparent_1px)] bg-[size:4px_4px] opacity-70" />

        {/* Título central */}
        {title && (
          <div className="text-[12px] font-bold text-[#7c4e00] tracking-wide z-10 select-none">
            {title}
          </div>
        )}

        {/* Slot direito */}
        {rightSlot && (
          <div className="absolute right-4 flex gap-1 z-10">
            {rightSlot}
          </div>
        )}
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      {/*
        expand=false (padrão): altura automática. Modais simples.
        expand=true:           flex-1 min-h-0 overflow-hidden no body,
                               h-full min-h-0 overflow-hidden no bezel,
                               h-full min-h-0 no inner.
      */}
      <div className={`px-3 pb-3 bg-[#ffca00] ${expand ? "flex-1 min-h-0 overflow-hidden" : ""} ${bodyClassName}`}>
        {/* Bezel escuro estilo CRT */}
        <div
          className={`rounded-[14px] border-[2px] border-[#1D190D] bg-[repeating-linear-gradient(180deg,#535353_0px,#535353_2px,#4b4b4b_2px,#4b4b4b_4px)] p-3 ${expand ? "h-full min-h-0 overflow-hidden" : ""}`}
          style={{
            boxShadow:
              "inset 0 4px 6px rgba(0,0,0,0.4), inset 0 -4px 6px rgba(0,0,0,0.4), inset 4px 0 6px rgba(0,0,0,0.4), inset -4px 0 6px rgba(0,0,0,0.4)",
          }}
        >
          {/* Área interna semitransparente */}
          <div
            className={`rounded-[10px] border border-[#8a8a8a] bg-[rgba(0,0,0,0.08)] p-3 ${expand ? "h-full min-h-0" : ""} ${innerClassName}`}
          >
            {children}
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      {/*
        shrink-0 garante que o footer nunca é comprimido pelo body quando
        expand=true. Deve ser filho direto do flex-col do card (className do wrapper).
      */}
      {footer && (
        <div className="shrink-0 bg-[#ffca00]">
          {footer}
        </div>
      )}
    </div>
  )
}