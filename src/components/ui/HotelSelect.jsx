import React from "react"
import flagBr from "../../assets/flagbr.png"
import flagCom from "../../assets/flagcom.png"
import flagDe from "../../assets/flagde.png"
import flagEs from "../../assets/flages.png"
import flagFi from "../../assets/flagfi.png"
import flagFr from "../../assets/flagfr.png"
import flagIt from "../../assets/flagit.png"
import flagNl from "../../assets/flagnl.png"
import flagTr from "../../assets/flagtr.png"

const HOTELS = [
  { value: "br", label: "BR", flag: flagBr },
  { value: "com", label: "COM", flag: flagCom },
  { value: "de", label: "DE", flag: flagDe },
  { value: "es", label: "ES", flag: flagEs },
  { value: "fi", label: "FI", flag: flagFi },
  { value: "fr", label: "FR", flag: flagFr },
  { value: "it", label: "IT", flag: flagIt },
  { value: "nl", label: "NL", flag: flagNl },
  { value: "tr", label: "TR", flag: flagTr },
]

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export default function HotelSelect({ value, onChange, disabled }) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef(null)
  const selected = HOTELS.find(h => h.value === value) ?? HOTELS[0]

  React.useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  return (
    <div ref={ref} className="relative shrink-0">
      {/* Botao principal */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(v => !v)}
        className={`
          h-10 min-w-[70px] flex items-center justify-center gap-2
          border-2 border-sky-200 bg-white
          px-3 rounded-lg
          text-[12px] font-bold text-sky-700
          outline-none cursor-pointer
          hover:border-sky-400 hover:bg-sky-50
          focus:border-sky-400 focus:shadow-[0_0_0_3px_rgba(79,195,247,0.15)]
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <img src={selected.flag} alt={selected.label} className="w-5 h-4 object-cover rounded-sm" />
        <span>{selected.label}</span>
        <ChevronDownIcon />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 min-w-[120px] bg-white border-2 border-sky-200 rounded-lg shadow-lg overflow-hidden">
          {HOTELS.map(hotel => (
            <button
              key={hotel.value}
              type="button"
              onClick={() => { onChange(hotel.value); setOpen(false) }}
              className={`
                w-full flex items-center gap-3 px-3 py-2
                text-[12px] font-semibold cursor-pointer transition-all
                ${hotel.value === value
                  ? "bg-sky-100 text-sky-700"
                  : "text-sky-600 hover:bg-sky-50"
                }
              `}
            >
              <img src={hotel.flag} alt={hotel.label} className="w-5 h-4 object-cover rounded-sm" />
              <span>{hotel.label}</span>
              {hotel.value === value && (
                <svg className="ml-auto w-4 h-4 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
