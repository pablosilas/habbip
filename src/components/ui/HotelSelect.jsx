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
      {/* Botão principal */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(v => !v)}
        className="h-9 w-[58px] flex items-center justify-center gap-[5px] border border-[#c3c3c3] bg-[rgba(255,255,255,0.12)] px-2 text-[11px] font-bold text-white outline-none cursor-pointer hover:bg-[rgba(255,255,255,0.18)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <img src={selected.flag} alt={selected.label} className="w-4 h-4 image-rendering-pixel" />
        <span>{selected.label}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-[2px] z-50 border border-[#555] bg-[#2a2a2a] shadow-xl min-w-[90px]">
          {HOTELS.map(hotel => (
            <button
              key={hotel.value}
              type="button"
              onClick={() => { onChange(hotel.value); setOpen(false) }}
              className={[
                "w-full flex items-center gap-2 px-3 py-[6px] text-[11px] font-bold cursor-pointer transition-colors",
                hotel.value === value
                  ? "bg-[rgba(255,214,77,0.15)] text-[#ffd64d]"
                  : "text-[#ccc] hover:bg-[rgba(255,255,255,0.08)] hover:text-white",
              ].join(" ")}
            >
              <img src={hotel.flag} alt={hotel.label} className="w-4 h-4 image-rendering-pixel" />
              <span>{hotel.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}