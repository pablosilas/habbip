import { useCallback, useRef, useState } from "react"
import { createPortal } from "react-dom"

export function useFlyToNotification() {
  const bellRef = useRef(null)
  const [animations, setAnimations] = useState([])

  const triggerFly = useCallback((sourceRect, imageUrl) => {
    if (!bellRef.current || !imageUrl) return

    const bellRect = bellRef.current.getBoundingClientRect()
    const id = Date.now() + Math.random()

    setAnimations((prev) => [...prev, {
      id,
      imageUrl,
      startX: sourceRect.left + sourceRect.width / 2,
      startY: sourceRect.top + sourceRect.height / 2,
      endX: bellRect.left + bellRect.width / 2,
      endY: bellRect.top + bellRect.height / 2,
    }])

    setTimeout(() => {
      setAnimations((prev) => prev.filter((a) => a.id !== id))
      // Chacoalha o sino
      bellRef.current?.classList.add("bell-shake")
      setTimeout(() => bellRef.current?.classList.remove("bell-shake"), 500)
    }, 650)
  }, [])

  function FlyPortal() {
    if (animations.length === 0) return null
    return createPortal(
      <>
        <style>{`
          @keyframes fly-to-bell {
            0%   { transform: translate(0, 0) scale(1); opacity: 1; }
            80%  { transform: translate(var(--dx), var(--dy)) scale(0.35); opacity: 1; }
            100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
          }
          @keyframes bell-shake {
            0%,100% { transform: rotate(0deg) scale(1); }
            20%     { transform: rotate(-25deg) scale(1.2); }
            40%     { transform: rotate(20deg) scale(1.1); }
            60%     { transform: rotate(-12deg) scale(1.05); }
            80%     { transform: rotate(6deg) scale(1); }
          }
          .bell-shake { animation: bell-shake 0.5s ease-in-out !important; }
        `}</style>
        {animations.map((anim) => (
          <div
            key={anim.id}
            style={{
              position: "fixed",
              left: anim.startX - 18,
              top: anim.startY - 18,
              width: 36,
              height: 36,
              pointerEvents: "none",
              zIndex: 999999,
              "--dx": `${anim.endX - anim.startX}px`,
              "--dy": `${anim.endY - anim.startY}px`,
              animation: "fly-to-bell 0.65s cubic-bezier(0.4, 0, 0.2, 1) forwards",
            }}
          >
            <img
              src={anim.imageUrl}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                imageRendering: "pixelated",
                filter: "drop-shadow(0 2px 8px rgba(255,214,77,0.6))",
              }}
            />
          </div>
        ))}
      </>,
      document.body
    )
  }

  return { bellRef, triggerFly, FlyPortal }
}