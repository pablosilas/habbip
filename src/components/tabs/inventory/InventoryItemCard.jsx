import React from "react"
import coinIcon from "../../../assets/coin.png"
import FurnitureImage from "../../ui/FurnitureImage"


function getTrend(history = []) {
  if (!Array.isArray(history) || history.length < 2) return null
  const last = history[history.length - 1]?.[0]
  const prev = history[history.length - 2]?.[0]
  if (last == null || prev == null) return null
  if (last > prev) return { icon: "▲", colorClass: "text-[#7CFC8A]" }
  if (last < prev) return { icon: "▼", colorClass: "text-[#FF8A8A]" }
  return { icon: "•", colorClass: "text-[#f1d97a]" }
}

export default function InventoryItemCard({ item, onUpdateQty, onSetQty, onRemove }) {
  const [editingQty, setEditingQty] = React.useState(false)
  const [qtyInput, setQtyInput] = React.useState(String(item.qty))
  const inputRef = React.useRef(null)

  React.useEffect(() => {
    if (editingQty) inputRef.current?.select()
  }, [editingQty])

  const history = item?.marketData?.history || []
  const price =
    item?.marketData?.currentPrice ??
    (history.length > 0 ? history[history.length - 1]?.[0] : null) ??
    item?.marketData?.averagePrice ??
    0
  const subtotal = price * item.qty
  const trend = getTrend(history)

  function commitQty() {
    onSetQty(item.ClassName, qtyInput)
    setEditingQty(false)
  }

  return (
    <div className="flex items-center gap-2 border border-[#8a8a8a] bg-[rgba(255,255,255,0.04)] rounded-md px-2 py-2">
      {/* Imagem */}
      <FurnitureImage classname={item.ClassName} furniName={item.FurniName} size="thumb" angle="2_0" />

      {/* Nome + classname */}
      <div className="flex-1 min-w-0">
        <div className="text-white text-[12px] font-bold truncate">{item.FurniName || "-"}</div>
        <div className="text-[#888] text-[10px] truncate">{item.ClassName || "-"}</div>
        {/* Preço unitário + tendência */}
        <div className="flex items-center gap-1 mt-[2px]">
          <img src={coinIcon} alt="coin" className="w-3 h-3" />
          <span className="text-[11px] text-[#f1f1f1]">{price}</span>
          {trend && (
            <span className={`text-[10px] font-bold ${trend.colorClass}`}>{trend.icon}</span>
          )}
          <span className="text-[#666] text-[10px]">cada</span>
        </div>
      </div>

      {/* Controle de quantidade */}
      <div className="flex items-center gap-[3px] shrink-0">
        <button
          type="button"
          onClick={() => { onUpdateQty(item.ClassName, -1); setQtyInput(String(Math.max(1, item.qty - 1))) }}
          className="w-5 h-5 flex items-center justify-center border border-[#6d6d6d] bg-[rgba(255,255,255,0.08)] text-white text-[12px] font-bold cursor-pointer hover:brightness-125"
        >
          −
        </button>

        {editingQty ? (
          <input
            ref={inputRef}
            value={qtyInput}
            onChange={(e) => setQtyInput(e.target.value)}
            onBlur={commitQty}
            onKeyDown={(e) => { if (e.key === "Enter") commitQty(); if (e.key === "Escape") setEditingQty(false) }}
            className="w-8 h-5 text-center text-[11px] text-white bg-[rgba(255,255,255,0.12)] border border-[#ffd64d] outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => { setQtyInput(String(item.qty)); setEditingQty(true) }}
            className="w-8 h-5 text-center text-[11px] text-white border border-[#6d6d6d] bg-[rgba(255,255,255,0.08)] cursor-pointer hover:border-[#ffd64d]"
            title="Clique para editar"
          >
            {item.qty}
          </button>
        )}

        <button
          type="button"
          onClick={() => { onUpdateQty(item.ClassName, 1); setQtyInput(String(item.qty + 1)) }}
          className="w-5 h-5 flex items-center justify-center border border-[#6d6d6d] bg-[rgba(255,255,255,0.08)] text-white text-[12px] font-bold cursor-pointer hover:brightness-125"
        >
          +
        </button>
      </div>

      {/* Subtotal */}
      <div className="shrink-0 text-right min-w-[48px]">
        <div className="flex items-center justify-end gap-[3px]">
          <img src={coinIcon} alt="coin" className="w-3 h-3" />
          <span className="text-[12px] font-bold text-[#ffd64d]">{subtotal.toLocaleString("pt-BR")}</span>
        </div>
        <div className="text-[9px] text-[#666]">subtotal</div>
      </div>

      {/* Remover */}
      <button
        type="button"
        onClick={() => onRemove(item.ClassName)}
        className="shrink-0 w-5 h-5 flex items-center justify-center text-white hover:text-[#ff8a8a] cursor-pointer text-[12px] transition-colors"
        title="Remover"
      >
        X
      </button>
    </div>
  )
}