import React from "react"
import boxIcon from "../../assets/box.png"
import loadingIcon from "../../assets/loading.gif"
import { getFurnitureIconUrl } from "../../services/habboApi"

export default function FurniThumb({ classname, size = "sm", isFav = false, showStar = false }) {
  const [url, setUrl] = React.useState("")
  const [status, setStatus] = React.useState("idle") // idle | loading | ok | error
  const containerRef = React.useRef(null)

  const sizeClass = size === "md" ? "w-5 h-5" : "w-5 h-5"

  React.useEffect(() => {
    const el = containerRef.current
    if (!el || !classname) {
      setStatus("error")
      return
    }

    setStatus("idle")
    setUrl("")

    const scrollRoot = el.closest('[data-scroll="main"]') ?? null

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()

        setStatus("loading")

        getFurnitureIconUrl(classname).then(resolved => {
          if (!resolved) { setStatus("error"); return }
          setUrl(resolved)
        })
      },
      {
        root: scrollRoot,
        rootMargin: "50px",
        threshold: 0,
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [classname])

  return (
    <div ref={containerRef} className={`shrink-0 ${sizeClass} flex items-center justify-center overflow-hidden relative`}>
      {status === "idle" && <div className="w-full h-full" />}

      {status === "loading" && (
        <img src={loadingIcon} alt="carregando"
          className="w-full h-full object-contain image-rendering-pixel opacity-60 animate-pulse"
        />
      )}

      {status === "error" && (
        <img src={boxIcon} alt="sem imagem"
          className="w-full h-full object-contain opacity-50 image-rendering-pixel"
        />
      )}

      {url && (
        <img
          src={url}
          alt={classname}
          className={`w-full h-full object-contain image-rendering-pixel ${status === "ok" ? "block" : "hidden"}`}
          onLoad={() => setStatus("ok")}
          onError={() => setStatus("error")}
        />
      )}
    </div>
  )
}