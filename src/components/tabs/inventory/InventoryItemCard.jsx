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

  React.useEffect(() => {
    if (!editingQty) setQtyInput(String(item.qty))
  }, [item.qty, editingQty])

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
    <div className="relative flex flex-col items-center border border-[#8a8a8a] bg-[rgba(255,255,255,0.04)] rounded-md p-2 gap-[4px]">

      {/* Botão remover */}
      <button
        type="button"
        onClick={() => onRemove(item.ClassName)}
        className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[#666] hover:text-[#ff8a8a] cursor-pointer text-[9px] transition-colors leading-none"
        title="Remover"
      >
        ✕
      </button>

      {/* Imagem */}
      <div className="flex items-center justify-center w-[40px] h-[40px]">
        <FurnitureImage classname={item.ClassName} furniName={item.FurniName} size="thumb" angle="2_0" />
      </div>

      {/* Nome */}
      <div className="w-full text-center text-white text-[9px] font-bold truncate leading-tight px-1">
        {item.FurniName || "-"}
      </div>

      {/* Preço unitário + trend */}
      <div className="flex items-center justify-center gap-[3px]">
        <img src={coinIcon} alt="coin" className="w-[9px] h-[9px]" />
        <span className="text-[10px] text-[#f1f1f1]">{price}</span>
        {trend && (
          <span className={`text-[9px] font-bold ${trend.colorClass}`}>{trend.icon}</span>
        )}
      </div>

      {/* Controles de quantidade */}
      <div className="flex items-center gap-[2px]">
        <button
          type="button"
          onClick={() => onUpdateQty(item.ClassName, -1)}
          className="w-4 h-4 flex items-center justify-center border border-[#6d6d6d] bg-[rgba(255,255,255,0.08)] text-white text-[11px] font-bold cursor-pointer hover:brightness-125"
        >
          −
        </button>

        {editingQty ? (
          <input
            ref={inputRef}
            value={qtyInput}
            onChange={(e) => setQtyInput(e.target.value)}
            onBlur={commitQty}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitQty()
              if (e.key === "Escape") setEditingQty(false)
            }}
            className="w-7 h-4 text-center text-[10px] text-white bg-[rgba(255,255,255,0.12)] border border-[#ffd64d] outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => { setQtyInput(String(item.qty)); setEditingQty(true) }}
            className="w-7 h-4 text-center text-[10px] text-white border border-[#6d6d6d] bg-[rgba(255,255,255,0.08)] cursor-pointer hover:border-[#ffd64d]"
            title="Clique para editar"
          >
            {item.qty}
          </button>
        )}

        <button
          type="button"
          onClick={() => onUpdateQty(item.ClassName, 1)}
          className="w-4 h-4 flex items-center justify-center border border-[#6d6d6d] bg-[rgba(255,255,255,0.08)] text-white text-[11px] font-bold cursor-pointer hover:brightness-125"
        >
          +
        </button>
      </div>

      {/* Subtotal */}
      <div className="flex items-center justify-center gap-[3px]">
        <img src={coinIcon} alt="coin" className="w-[9px] h-[9px]" />
        <span className="text-[10px] font-bold text-[#ffd64d]">{subtotal.toLocaleString("pt-BR")}</span>
      </div>
    </div>
  )
}