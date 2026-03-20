import React from "react"

export default function ProfileListCard({
  image,
  title,
  subtitle,
  href,
  imageClassName = "w-12 h-12",
}) {
  const content = (
    <div className="flex items-start gap-3 border border-[#8a8a8a] bg-[rgba(255,255,255,0.06)] px-3 py-2 rounded-[8px]">
      <div className={`shrink-0 flex items-center justify-center ${imageClassName}`}>
        {image}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-white text-[12px] font-bold break-words">
          {title || "-"}
        </div>
        <div className="text-[#d7d7d7] text-[11px] break-words">
          {subtitle || "-"}
        </div>
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="block">
        {content}
      </a>
    )
  }

  return content
}