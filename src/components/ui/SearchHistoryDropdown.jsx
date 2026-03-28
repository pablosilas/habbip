import React from "react"
import { getHabboAvatarHeadUrl } from "../../services/habboApi"
import { getEntryTerm } from "../../hooks/useSearchHistory"
import starOn from "../../assets/star.png"
import starOff from "../../assets/star_off.png"
import FurniThumb from "./FurniThumb"

export default function SearchHistoryDropdown({
  show,
  history = [],
  favorites = [],
  onSelect,
  onRemove,
  onToggleFav,
  isFavorite,
  onClear,
  showAvatar = false,
  hotel = "br",
  showFurniImage = false,
}) {
  if (!show) return null

  const recentItems = history.filter((h) => !isFavorite(getEntryTerm(h)))
  const hasFavorites = favorites.length > 0
  const hasRecent = recentItems.length > 0

  if (!hasFavorites && !hasRecent) return null

  return (
    <div
      className="absolute left-0 right-0 top-full z-50 mt-[2px] border border-[#c3c3c3] bg-[#2a2a2a] shadow-[0_6px_20px_rgba(0,0,0,0.5)] overflow-hidden"
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-2 py-[5px] bg-[#1e1e1e] border-b border-[#444]">
        <span className="text-[10px] font-bold text-[#aaa] uppercase tracking-wider">
          Buscas recentes
        </span>
        {history.length > 0 && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClear}
            className="text-[10px] text-[#888] hover:text-[#ffd64d] cursor-pointer"
          >
            limpar histórico
          </button>
        )}
      </div>

      {/* Favoritos */}
      {hasFavorites && (
        <>
          <div className="px-2 pt-[5px] pb-[2px] flex items-center gap-1">
            <img src={starOn} alt="favoritos" className="w-3 h-3 " />
            <span className="text-[9px] font-bold text-[#ffd64d] uppercase tracking-wider">
              Favoritos
            </span>
          </div>
          {favorites.map((entry) => (
            <DropdownItem
              key={`fav-${getEntryTerm(entry)}`}
              entry={entry}
              isFav={true}
              onSelect={onSelect}
              onToggleFav={onToggleFav}
              showAvatar={showAvatar}
              hotel={hotel}
              showFurniImage={showFurniImage}
            />
          ))}
        </>
      )}

      {/* Histórico recente */}
      {hasRecent && (
        <>
          {hasFavorites && (
            <div className="border-t border-[#444] mt-1 px-2 pt-[5px] pb-[2px]">
              <span className="text-[9px] font-bold text-[#aaa] uppercase tracking-wider">
                Recentes
              </span>
            </div>
          )}
          {recentItems.map((entry) => (
            <DropdownItem
              key={`hist-${getEntryTerm(entry)}`}
              entry={entry}
              isFav={false}
              onSelect={onSelect}
              onRemove={onRemove}
              onToggleFav={onToggleFav}
              showAvatar={showAvatar}
              hotel={hotel}
              showFurniImage={showFurniImage}
              // passa history para fallback de itens antigos sem classname no objeto
              history={history}
            />
          ))}
        </>
      )}
    </div>
  )
}

function AvatarThumb({ nick, hotel, isFav }) {
  const [hasError, setHasError] = React.useState(false)
  const url = getHabboAvatarHeadUrl({ name: nick, hotel, size: "s" })

  return (
    <div className="shrink-0 w-5 h-5 flex items-center justify-center overflow-hidden relative">
      {!hasError ? (
        <img
          src={url}
          alt={nick}
          className="w-full h-full object-contain "
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="text-[11px] text-[#666]">👤</span>
      )}
    </div>
  )
}

function DropdownItem({
  entry,
  isFav,
  onSelect,
  onRemove,
  onToggleFav,
  showAvatar = false,
  hotel = "br",
  showFurniImage = false,
  history = [],
}) {
  const term = getEntryTerm(entry) || (typeof entry === "string" ? entry : "")

  // Favoritos já carregam o objeto completo com classname.
  // Para itens do histórico, lê do objeto ou faz fallback na lista (compatibilidade).
  const classname = typeof entry === "object"
    ? entry?.classname ?? null
    : history?.find((h) => getEntryTerm(h) === term)?.classname ?? null

  return (
    <div
      className="group flex items-center gap-1 px-2 py-[6px] hover:bg-[rgba(255,214,77,0.12)] cursor-pointer"
      onClick={() => onSelect(term)}
    >
      {/* Thumbnail */}
      {showAvatar ? (
        <AvatarThumb nick={term} hotel={hotel} isFav={isFav} />
      ) : showFurniImage && classname ? (
        <FurniThumb classname={classname} isFav={isFav} showStar angle="2_0" />
      ) : (
        <div className="shrink-0 w-[14px] h-[14px] flex items-center justify-center">
          {isFav
            ? <img src={starOn} alt="favorito" className="w-[14px] h-[14px] " />
            : <span className="text-[11px] text-[#888] group-hover:text-[#d2d2d2]">◷</span>
          }
        </div>
      )}

      {/* Termo */}
      <span className="flex-1 text-[12px] text-[#e0e0e0] truncate">
        {term}
      </span>

      {/* Ações */}
      <div className="flex items-center gap-[6px] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
        <button
          type="button"
          title={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          onClick={(e) => {
            e.stopPropagation()
            // Passa o entry completo para que o hook preserve o classname
            onToggleFav(entry)
          }}
          className="cursor-pointer hover:scale-110 transition-transform"
        >
          <img
            src={isFav ? starOn : starOff}
            alt={isFav ? "remover favorito" : "adicionar favorito"}
            className={isFav ? "w-[14px] h-[14px] " : "w-[11px] h-[11px]  opacity-50"}
          />
        </button>

        {onRemove && !isFav && (
          <button
            type="button"
            title="Remover do histórico"
            onClick={(e) => { e.stopPropagation(); onRemove(term) }}
            className="text-[11px] text-[#888] hover:text-[#ff8a8a] cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}