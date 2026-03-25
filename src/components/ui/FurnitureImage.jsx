import React from "react"
import boxIcon from "../../assets/box.png"
import loadingIcon from "../../assets/loading.gif"
import { getFurnitureImageUrl } from "../../services/habboApi"

function buildAngleFallbacks(angle) {
  if (angle === "4_0") return ["4_0", "2_0", "0_0"]
  if (angle === "2_0") return ["2_0", "4_0", "0_0"]
  return ["0_0"]
}

function applyAngle(url, angle) {
  if (!url.includes("habcat.net")) return url
  return url.replace(/\/\d_\d\./, `/${angle}.`)
}

export default function FurnitureImage({ classname, furniName, size = "small", angle = null, className = "" }) {
  const [status, setStatus] = React.useState("idle")
  const [imageUrl, setImageUrl] = React.useState("")
  const [angleIndex, setAngleIndex] = React.useState(0)
  const containerRef = React.useRef(null)
  const angleFallbacks = React.useMemo(() => buildAngleFallbacks(angle), [angle])

  const sizeClass = {
    small: "w-[44px] h-[44px]",
    medium: "w-[64px] h-[64px]",
    large: "w-[88px] h-[88px]",
    thumb: "w-10 h-10",
  }[size] ?? "w-[44px] h-[44px]"

  React.useEffect(() => {
    const el = containerRef.current
    if (!el || !classname) {
      setStatus("error")
      return
    }

    setStatus("idle")
    setImageUrl("")
    setAngleIndex(0)

    const scrollRoot = el.closest('[data-scroll="main"]') ?? null

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()

        setStatus("loading")
        setImageUrl("")
        setAngleIndex(0)

        getFurnitureImageUrl(classname).then(url => {
          if (!url) { setStatus("error"); return }
          const firstAngle = angleFallbacks[0]
          setImageUrl(applyAngle(url, firstAngle))
        })
      },
      {
        root: scrollRoot,
        rootMargin: "300px",
        threshold: 0,
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [classname, angle, angleFallbacks])

  function handleImageError() {
    const nextIndex = angleIndex + 1
    if (nextIndex < angleFallbacks.length) {
      // Tenta próximo ângulo
      setAngleIndex(nextIndex)
      setImageUrl(prev => applyAngle(prev, angleFallbacks[nextIndex]))
    } else {
      setStatus("error")
    }
  }

  return (
    <div ref={containerRef} className={`${sizeClass} shrink-0 flex items-center justify-center overflow-hidden ${className}`}>
      {status === "idle" && <div className="w-full h-full" />}
      {status === "loading" && (
        <img src={loadingIcon} alt="carregando"
          className="max-w-full max-h-full object-contain image-rendering-pixel opacity-60 animate-pulse"
        />
      )}
      {status === "error" && (
        <img src={boxIcon} alt="sem imagem"
          className="max-w-full max-h-full object-contain image-rendering-pixel opacity-60"
        />
      )}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={furniName || classname || "Mobi"}
          className={`max-w-full max-h-full object-contain image-rendering-pixel ${status === "ok" ? "block" : "hidden"}`}
          onLoad={() => setStatus("ok")}
          onError={handleImageError}
        />
      )}
    </div>
  )
}