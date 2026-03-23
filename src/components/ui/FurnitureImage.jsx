import React from "react"
import boxIcon from "../../assets/box.png"
import loadingIcon from "../../assets/loading.gif"
import { getFurnitureImageUrl } from "../../services/habboApi"

export default function FurnitureImage({ classname, furniName, size = "small", className = "" }) {
  const [status, setStatus] = React.useState("loading")
  const [imageUrl, setImageUrl] = React.useState("")

  const sizeClass = {
    small: "w-[44px] h-[44px]",
    medium: "w-[64px] h-[64px]",
    large: "w-[88px] h-[88px]",
    thumb: "w-10 h-10",
  }[size] ?? "w-[44px] h-[44px]"

  React.useEffect(() => {
    if (!classname) { setStatus("error"); return }
    setStatus("loading")
    setImageUrl("")
    getFurnitureImageUrl(classname).then(url => {
      if (!url) setStatus("error")
      else setImageUrl(url)
    })
  }, [classname])

  return (
    <div className={`${sizeClass} shrink-0 flex items-center justify-center overflow-hidden ${className}`}>
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