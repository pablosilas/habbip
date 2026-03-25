import React from "react"
import boxIcon from "../../assets/box.png"
import loadingIcon from "../../assets/loading.gif"
import { getFurnitureImageUrl } from "../../services/habboApi"

export default function FurnitureImage({ classname, furniName, size = "small", angle = null, className = "" }) {
  const [status, setStatus] = React.useState("idle")
  const [imageUrl, setImageUrl] = React.useState("")
  const containerRef = React.useRef(null)

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

    const scrollRoot = el.closest('[data-scroll="main"]') ?? null

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()

        setStatus("loading")
        setImageUrl("")

        getFurnitureImageUrl(classname).then(url => {
          if (!url) { setStatus("error"); return }

          if (angle && url.includes("habcat.net") && url.includes("/0_0.")) {
            setImageUrl(url.replace("/0_0.", `/${angle}.`))
          } else {
            setImageUrl(url)
          }
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
  }, [classname, angle])

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
          onError={() => setStatus("error")}
        />
      )}
    </div>
  )
}