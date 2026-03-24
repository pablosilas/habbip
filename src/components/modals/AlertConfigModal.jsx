import React, { useState, useEffect, useTransition } from "react"
import Button from "../ui/Button"
import FurnitureImage from "../ui/FurnitureImage"
import coinIcon from "../../assets/coin.png"

export default function AlertConfigModal({ open, item, config, onSave, onClose }) {
  const [alertMode, setAlertMode] = useState("any")
  const [targetPrice, setTargetPrice] = useState("")
  const [, startTransition] = useTransition()

  // Calcula o preço atual baseado na estrutura do item
  const currentPrice = item?.basePrice ??
    item?.marketData?.currentPrice ??
    (item?.marketData?.history?.length > 0
      ? item.marketData.history[item.marketData.history.length - 1]?.[0]
      : null) ??
    item?.marketData?.averagePrice ??
    "-"

  useEffect(() => {
    if (open && config) {
      startTransition(() => {
        setAlertMode(config.alertMode || "any")
        setTargetPrice(config.targetPrice ? String(config.targetPrice) : "")
      })
    }
  }, [open, config])

  function handleSave() {
    const newConfig = {
      alertMode,
      targetPrice: alertMode === "price" && targetPrice ? parseInt(targetPrice, 10) : null,
    }
    onSave?.(newConfig)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className={[
          "relative w-full max-w-[360px] overflow-hidden rounded-[14px]",
          "border-[2px] border-[#7A7A7A]",
          "outline outline-[1px] outline-[#000000]",
          "bg-[#4D4D4D]",
          "shadow-[inset_1px_1px_0_#cfcfcf,inset_-1px_-1px_0_#2f2f2f,0_8px_18px_rgba(0,0,0,0.45)]",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-[28px] px-3 flex items-center bg-[#7A7A7A]">
          <span className="text-[10px] font-bold text-white">Configurar Alertas</span>
          <div className="absolute right-[4px] top-0 bottom-0 flex items-center">
            <button
              type="button"
              onClick={onClose}
              title="Fechar"
              className="flex items-center justify-center cursor-pointer hover:brightness-110 active:translate-y-[1px]"
              style={{
                width: 18, height: 18, borderRadius: 4,
                background: "#7A7A7A",
                borderTop: "1.5px solid #000",
                borderLeft: "1.5px solid #000",
                borderRight: "1.5px solid #000",
                borderBottom: "2.5px solid #000",
                boxShadow: "inset 0 0 0 1px #8c8c8c",
              }}
            >
              <span className="block w-0 h-0 translate-y-[1px]" style={{ borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "6px solid #ffffff" }} />
            </button>
          </div>
        </div>
        {/* Body */}
        <div className="px-4 py-3 bg-[#4D4D4D] shadow-[inset_1px_1px_0_#6e6e6e,inset_-1px_-1px_0_#3b3b3b]">
          {/* Item Name and Image */}
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold text-white uppercase tracking-wider mb-[8px]">
                Mobi
              </div>
              <div className="text-[12px] text-[#d0d0d0]">{item?.FurniName}</div>
            </div>
            <div className="shrink-0 mt-[4px]">
              <FurnitureImage classname={item?.ClassName} furniName={item?.FurniName} size="large" angle="4_0" />
            </div>
          </div>

          {/* Alert Mode Selection */}
          <div className="mb-4">
            <div className="text-[10px] font-bold text-white uppercase tracking-wider mb-[8px]">
              Tipo de Alerta
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="alertMode"
                  value="any"
                  checked={alertMode === "any"}
                  onChange={(e) => setAlertMode(e.target.value)}
                  className="cursor-pointer"
                />
                <span className="text-[11px] text-[#d0d0d0]">
                  Qualquer alteração de preço
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="alertMode"
                  value="price"
                  checked={alertMode === "price"}
                  onChange={(e) => setAlertMode(e.target.value)}
                  className="cursor-pointer"
                />
                <span className="text-[11px] text-[#d0d0d0]">
                  Quando alcançar um preço específico
                </span>
              </label>
            </div>
          </div>

          {/* Target Price Input */}
          {alertMode === "price" && (
            <div className="mb-4">
              <label htmlFor="targetPrice" className="text-[10px] font-bold text-white uppercase tracking-wider mb-[8px] block">
                Preço Alvo (moedas)
              </label>
              <input
                id="targetPrice"
                type="number"
                min="1"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="Digite o preço desejado..."
                className="w-full h-8 border border-[#555] bg-[rgba(255,255,255,0.06)] px-2 text-[12px] text-white placeholder:text-[#666] outline-none focus:border-[#7A7A7A]"
              />
              <div className="text-[9px] text-[#888] mt-[4px]">
                Você receberá um alerta quando o preço atingir este valor ou menor.
              </div>
            </div>
          )}

          {/* Current Price Info */}
          <div className="mb-4 p-2 bg-[rgba(255,255,255,0.04)] rounded border border-[#3f3f3f]">
            <div className="text-[9px] text-[#888] uppercase tracking-wider mb-[4px]">
              Preço Atual
            </div>
            <div className="text-[13px] font-bold text-[#ffe07a] flex items-center gap-1">
              <img src={coinIcon} alt="coin" className="w-4 h-4 object-contain" />
              {currentPrice}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={alertMode === "price" && !targetPrice}
            >
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
