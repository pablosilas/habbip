/**
 * ConsoleCard (V2 - SectionCard)
 *
 * Componente reutilizável que encapsula o padrão visual do card V2 estilo fansite Habbo.
 * Design moderno azul ciano com toques retro.
 *
 * Props:
 *   title          {string}    Texto do header central
 *   onClose        {function}  Se fornecido, renderiza o botão "X" no header
 *   headerRight    {node}      Slot para elementos extras à direita do header
 *   expand         {boolean}   Ativa modo altura total (flex-col com altura fixa)
 *   style          {object}    Estilos inline para o wrapper externo
 *   className      {string}    Classes extras para o wrapper externo
 *   bodyClassName  {string}    Classes extras para o div do body
 *   innerClassName {string}    Classes extras para a área interna (conteúdo)
 *   footer         {node}      Slot para conteúdo abaixo do corpo
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
  const rightSlot =
    headerRight ??
    (onClose ? (
      <button
        type="button"
        onClick={onClose}
        className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-all"
        aria-label="Fechar"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M2 2l8 8M10 2l-8 8" />
        </svg>
      </button>
    ) : null);

  return (
    <div
      className={`
        rounded-2xl bg-white border border-sky-100
        shadow-[0_4px_24px_rgba(0,0,0,0.08)]
        overflow-hidden
        ${expand || footer ? "flex flex-col" : ""}
        ${className}
      `}
      style={style}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="h-12 shrink-0 bg-gradient-to-r from-sky-400 to-cyan-400 relative flex items-center justify-between px-4">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-0 top-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,white_1px,transparent_1px)] bg-[size:20px_20px]" />
        </div>

        {/* Logo/Title */}
        {title && (
          <div className="flex items-center gap-2 z-10">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-white font-bold text-[15px] tracking-wide">
              {title}
            </span>
          </div>
        )}

        {/* Right slot */}
        {rightSlot && (
          <div className="flex items-center gap-2 z-10">{rightSlot}</div>
        )}
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div
        className={`
          bg-gradient-to-b from-sky-50 to-white
          ${expand ? "flex-1 min-h-0 overflow-hidden" : ""}
          ${bodyClassName}
        `}
      >
        {/* Inner content area */}
        <div
          className={`
            p-4
            ${expand ? "h-full min-h-0 overflow-y-auto" : ""}
            ${innerClassName}
          `}
        >
          {children}
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      {footer && (
        <div className="shrink-0 bg-white border-t border-sky-100">
          {footer}
        </div>
      )}
    </div>
  );
}
