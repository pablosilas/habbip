import React from "react"
import FairResultCard from "../fair/FairResultCard"
import Button from "../../ui/Button"

export default function FairTab({
  mobiQuery,
  setMobiQuery,
  fairHotel,
  setFairHotel,
  fairDays,
  setFairDays,
  onSearch,
  loading,
  error,
  results,
}) {
  const hasResults = results.length > 0
  const [expanded, setExpanded] = React.useState(true)

  React.useEffect(() => {
    if (hasResults) setExpanded(false)
  }, [hasResults])

  return (
    <div>
      <div
        className="flex items-center justify-between mb-2 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="text-[#f4f4f4] font-bold text-[13px]">
          Buscar mobi
        </div>
        <span className="text-[#d2d2d2] text-[11px]">
          {expanded ? "▲ recolher" : "▼ expandir"}
        </span>
      </div>

      {expanded && (
        <>
          <input
            value={mobiQuery}
            onChange={(e) => setMobiQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearch()
            }}
            placeholder="Digite o nome do mobi"
            className="w-full h-9 border border-[#c3c3c3] bg-[rgba(255,255,255,0.12)] px-2 text-[12px] text-white outline-none placeholder:text-[#d2d2d2] mb-2"
          />

          <div className="grid grid-cols-2 gap-2 mb-3">
            <select
              value={fairHotel}
              onChange={(e) => setFairHotel(e.target.value)}
              className="w-full h-9 border border-[#c3c3c3] bg-[rgba(255,255,255,0.12)] px-2 text-[12px] text-white outline-none"
            >
              <option value="br" className="text-black">BR</option>
              <option value="com" className="text-black">COM</option>
              <option value="de" className="text-black">DE</option>
              <option value="es" className="text-black">ES</option>
              <option value="fi" className="text-black">FI</option>
              <option value="fr" className="text-black">FR</option>
              <option value="it" className="text-black">IT</option>
              <option value="nl" className="text-black">NL</option>
              <option value="tr" className="text-black">TR</option>
            </select>

            <select
              value={fairDays}
              onChange={(e) => setFairDays(e.target.value)}
              className="w-full h-9 border border-[#c3c3c3] bg-[rgba(255,255,255,0.12)] px-2 text-[12px] text-white outline-none"
            >
              <option value="all" className="text-black">Todos</option>
              <option value="7" className="text-black">7 dias</option>
              <option value="30" className="text-black">30 dias</option>
              <option value="90" className="text-black">90 dias</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Button onClick={onSearch} disabled={loading}>
              {loading ? "Consultando..." : "Consultar feira"}
            </Button>

            <Button variant="secondary" onClick={() => setMobiQuery("")}>
              Limpar
            </Button>
          </div>
        </>
      )}

      {error ? (
        <div className="text-[#ffd0d0] text-[12px] mb-3">{error}</div>
      ) : null}

      <div className="space-y-2 pr-1">
        {[...results]
          .sort((a, b) => {
            const aHistory = a.marketData?.history
            const bHistory = b.marketData?.history
            const aLast = Array.isArray(aHistory) && aHistory.length ? aHistory[aHistory.length - 1][0] ?? 0 : 0
            const bLast = Array.isArray(bHistory) && bHistory.length ? bHistory[bHistory.length - 1][0] ?? 0 : 0
            return bLast - aLast
          })
          .map((item, index) => (
            <FairResultCard
              key={`${item.ClassName || item.FurniName || index}-${index}`}
              item={item}
            />
          ))}

        {!loading && !results.length && !error && (
          <div className="text-[#e0e0e0] text-[12px]">
            Nenhum mobi encontrado.
          </div>
        )}
      </div>
    </div>
  )
}