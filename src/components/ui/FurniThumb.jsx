import React from "react"
import boxIcon from "../../assets/box.png"
import loadingIcon from "../../assets/loading.gif"
import starOn from "../../assets/star.png"
import { getFurnitureImageUrl } from "../../services/habboApi"

export default function FurniThumb({ classname, size = "sm", isFav = false, showStar = false }) {
  const [url, setUrl] = React.useState("")
  const [status, setStatus] = React.useState("loading")

  const sizeClass = size === "md" ? "w-6 h-6" : "w-7 h-7"

  React.useEffect(() => {
    if (!classname) { setStatus("error"); return }
    setStatus("loading")
    setUrl("")
    getFurnitureImageUrl(classname).then(resolved => {
      if (!resolved) setStatus("error")
      else setUrl(resolved)
    })
  }, [classname])

  return (
    <div className={`shrink-0 ${sizeClass} flex items-center justify-center overflow-hidden relative`}>
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
      {showStar && isFav && (
        <img src={starOn} alt="favorito"
          className="absolute bottom-0 right-0 w-[8px] h-[8px] image-rendering-pixel"
        />
      )}
    </div>
  )
}