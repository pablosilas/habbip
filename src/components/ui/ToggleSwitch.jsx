/**
 * ToggleSwitch
 *
 * Switch estilo retro/pixel com trilho e alavanca.
 * Verde quando ativo, cinza quando inativo.
 *
 * Props:
 *   checked   {boolean}   Estado atual do switch
 *   onChange  {function}  Chamado ao clicar (sem argumentos — pai controla o estado)
 *   disabled  {boolean}   Desabilita interação
 *   size      {"sm"|"md"} Tamanho (padrão: "sm")
 */
export default function ToggleSwitch({ checked, onChange, disabled = false, size = "sm" }) {
  const sm = size === "sm"

  // Dimensões
  const trackW = sm ? 28 : 36
  const trackH = sm ? 14 : 18
  const thumbSz = sm ? 10 : 14
  const travel = trackW - thumbSz - (sm ? 4 : 4)   // px que a alavanca percorre

  const trackBg = checked ? "#3a9e3a" : "#6b6b6b"
  const trackLight = checked ? "#5fca5f" : "#8a8a8a"
  const trackDark = checked ? "#257325" : "#4a4a4a"

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={disabled ? undefined : onChange}
      className={`relative shrink-0 flex items-center cursor-pointer transition-all active:scale-95 ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      style={{
        width: trackW,
        height: trackH,
        borderRadius: 3,
        background: trackBg,
        /* borda escura embaixo/direita, clara em cima/esquerda */
        borderTop: `1.5px solid ${trackDark}`,
        borderLeft: `1.5px solid ${trackDark}`,
        borderRight: `1.5px solid ${trackLight}`,
        borderBottom: `1.5px solid ${trackLight}`,
        boxShadow: `inset 0 2px 4px rgba(0,0,0,0.35)`,
        transition: "background 0.15s",
        padding: 0,
      }}
    >
      {/* Alavanca */}
      <span
        style={{
          position: "absolute",
          left: checked ? travel : 2,
          width: thumbSz,
          height: thumbSz,
          borderRadius: 2,
          background: "#e0e0e0",
          borderTop: "1.5px solid #ffffff",
          borderLeft: "1.5px solid #ffffff",
          borderRight: "1.5px solid #888",
          borderBottom: "1.5px solid #888",
          boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
          transition: "left 0.12s ease",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: sm ? 1.5 : 2,
        }}
      >
        {/* Ranhuras horizontais na alavanca */}
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: "block",
              width: sm ? 4 : 6,
              height: 1,
              background: "#aaa",
              borderBottom: "0.5px solid #fff",
              borderRadius: 0,
            }}
          />
        ))}
      </span>
    </button>
  )
}