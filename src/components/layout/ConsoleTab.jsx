/**
 * ConsoleTab (V2 - NavTab)
 *
 * Tab de navegação estilo V2 - design moderno com toques retro.
 * Usado na navegação principal do Habbip.
 */
export default function ConsoleTab({ label, icon, active, onClick, locked = false }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`
        relative flex-1 h-full flex flex-col items-center justify-center
        px-2 py-3 cursor-pointer transition-all duration-200
        ${active
          ? "bg-white text-sky-600 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"
          : "bg-gradient-to-b from-sky-400 to-sky-500 text-white/90 hover:text-white hover:from-sky-500 hover:to-sky-600"
        }
      `}
    >
      {/* Active indicator */}
      {active && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-cyan-400 rounded-b-full" />
      )}

      {/* Icon container */}
      <span className={`
        flex items-center justify-center w-8 h-8 mb-1 rounded-lg transition-all
        ${active 
          ? "bg-sky-50" 
          : "bg-white/20"
        }
      `}>
        <span className={`flex items-center justify-center ${active ? "" : "brightness-0 invert"}`}>
          {icon}
        </span>
        {locked && (
          <span className="absolute -top-1 -right-1 text-[10px] bg-amber-400 text-amber-900 w-4 h-4 rounded-full flex items-center justify-center">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4z"/>
            </svg>
          </span>
        )}
      </span>

      {/* Label */}
      <span className={`
        text-[10px] font-bold uppercase tracking-wider leading-tight text-center
        ${active ? "text-sky-700" : "text-white/90"}
      `}>
        {label}
      </span>

      {/* Bottom bar for inactive tabs */}
      {!active && (
        <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-white/20 rounded-full" />
      )}
    </button>
  )
}
