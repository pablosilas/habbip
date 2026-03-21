import React from "react"
import coinIcon from "../../assets/coin.png"

export default function CreditConverterBlock({ rateCredits, rateReais, onSetRate, credits, compact = false, minimal = false }) {
  const [editing, setEditing] = React.useState(false)
  const [inputCredits, setInputCredits] = React.useState(String(rateCredits))
  const [inputReais, setInputReais] = React.useState(String(rateReais))
  const creditsRef = React.useRef(null)
  const containerRef = React.useRef(null)

  React.useEffect(() => {
    setInputCredits(String(rateCredits))
    setInputReais(String(rateReais))
  }, [rateCredits, rateReais])

  React.useEffect(() => {
    if (editing) creditsRef.current?.select()
  }, [editing])

  function commit() {
    const c = Number(String(inputCredits).replace(",", "."))
    const r = Number(String(inputReais).replace(",", "."))
    if (c > 0 && r > 0) onSetRate({ credits: c, reais: r })
    else {
      setInputCredits(String(rateCredits))
      setInputReais(String(rateReais))
    }
    setEditing(false)
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") commit()
    if (e.key === "Escape") {
      setInputCredits(String(rateCredits))
      setInputReais(String(rateReais))
      setEditing(false)
    }
  }

  // Fecha apenas se o foco saiu do container inteiro
  function handleContainerBlur() {
    setTimeout(() => {
      if (containerRef.current && !containerRef.current.contains(document.activeElement)) {
        commit()
      }
    }, 0)
  }

  const realValue = credits && rateCredits > 0
    ? ((credits / rateCredits) * rateReais).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : null

  const rateLabel = `${rateCredits}c = R$ ${String(rateReais).replace(".", ",")}`

  const editingInputs = (small = false) => (
    <div
      ref={containerRef}
      className="flex items-center gap-1"
      onBlur={handleContainerBlur}
    >
      <input
        ref={creditsRef}
        value={inputCredits}
        onChange={(e) => setInputCredits(e.target.value)}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        className={`text-center text-white bg-[rgba(255,255,255,0.12)] border border-[#ffd64d] outline-none px-1 ${small ? "w-12 text-[10px] h-5" : "w-16 text-[11px] h-6"}`}
        placeholder="cr"
      />
      <span className={`text-[#aaa] ${small ? "text-[9px]" : "text-[11px] text-[#aaa]"}`}>c = R$</span>
      <input
        value={inputReais}
        onChange={(e) => setInputReais(e.target.value)}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        className={`text-center text-white bg-[rgba(255,255,255,0.12)] border border-[#ffd64d] outline-none px-1 ${small ? "w-10 text-[10px] h-5" : "w-14 text-[11px] h-6"}`}
        placeholder="R$"
      />
    </div>
  )

  // ── Modo compacto (Feira Livre) ──────────────────────────────────────────
  if (compact) {
    if (!realValue) return null
    return (
      <div className="flex items-center justify-between text-[11px] text-[#aaa]">
        <span className="flex items-center gap-1">
          <img src={coinIcon} alt="coin" className="w-3 h-3" />
          <span>{credits?.toLocaleString("pt-BR")}</span>
          <span className="text-[#555]">≈</span>
          <span className="text-[#7CFC8A] font-bold">{realValue}</span>
        </span>

        {editing ? editingInputs(true) : (
          <button
            type="button"
            title="Clique para ajustar a taxa"
            onClick={() => setEditing(true)}
            className="text-[9px] text-[#aaa] hover:text-[#ccc] cursor-pointer transition-colors"
          >
            {rateLabel}
          </button>
        )}
      </div>
    )
  }

  // No modo minimal: só valor em real + rateLabel, sem ícone de moeda
  if (minimal) {
    if (!realValue) return null
    return (
      <div className="flex items-center justify-between text-[11px] text-[#aaa] gap-2">
        <span className="text-[#7CFC8A] font-bold">{realValue}</span>

        {editing ? editingInputs(true) : (
          <button
            type="button"
            title="Clique para ajustar a taxa"
            onClick={() => setEditing(true)}
            className="text-[9px] text-[#aaa] hover:text-[#ccc] cursor-pointer transition-colors"
          >
            {rateLabel}
          </button>
        )}
      </div>
    )
  }

  // ── Modo completo (Inventário) ───────────────────────────────────────────
  return (
    <div className="border border-[#8a8a8a] bg-[rgba(255,255,255,0.04)] rounded-md px-2 py-[6px] flex items-center justify-between gap-2">
      <span className="text-[10px] text-[#aaa] shrink-0">
        <span className="font-bold">Valor estimado: </span>   {realValue ? <span className="text-[#7CFC8A] font-bold">{realValue}</span> : "—"}
      </span>
      {editing ? editingInputs(true) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-[9px] text-[#ffd64d] border border-[#555] hover:border-[#ffd64d] px-2 h-5 cursor-pointer transition-colors"
          title="Clique para editar a taxa"
        >
          <span className="text-[#aaa]">Taxa: </span> {rateLabel}
        </button>
      )}
    </div>
  )
}