import React from "react"
import { getHabboAvatarHeadUrl } from "../../services/habboApi"
import { getEntryTerm } from "../../hooks/useSearchHistory"
import starOn from "../../assets/star.png"
import starOff from "../../assets/star_off.png"
import FurniThumb from "./FurniThumb"

/**
 * SearchHistoryDropdown
 *
 * Dropdown retrô que aparece abaixo do input de busca mostrando:
 * - Favoritos (⭐) no topo
 * - Histórico recente abaixo
 *
 * Props:
 *   show          {boolean}    Controla visibilidade
 *   history       {string[]}   Lista do histórico recente
 *   favorites     {string[]}   Lista de favoritos
 *   onSelect      {function}   Chamado ao clicar num item (term: string)
 *   onRemove      {function}   Remove item do histórico (term: string)
 *   onToggleFav   {function}   Toggle favorito (term: string)
 *   isFavorite    {function}   Retorna true se term é favorito
 *   onClear       {function}   Limpa todo o histórico
 */
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

  // Itens do histórico que NÃO são favoritos (favoritos aparecem na seção própria)
  const recentItems = history.filter((h) => !isFavorite(getEntryTerm(h)))
  const hasFavorites = favorites.length > 0
  const hasRecent = recentItems.length > 0

  if (!hasFavorites && !hasRecent) return null

  return (
    <div
      className="absolute left-0 right-0 top-full z-50 mt-[2px] border border-[#c3c3c3] bg-[#2a2a2a] shadow-[0_6px_20px_rgba(0,0,0,0.5)] overflow-hidden"
      // Impede que o onBlur do input feche antes do clique ser registrado
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
            <img src={starOn} alt="favoritos" className="w-3 h-3 image-rendering-pixel" />
            <span className="text-[9px] font-bold text-[#ffd64d] uppercase tracking-wider">
              Favoritos
            </span>
          </div>
          {favorites.map((term) => (
            <DropdownItem
              key={`fav-${getEntryTerm(term)}`}
              entry={term}
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
          {recentItems.map((term) => (
            <DropdownItem
              key={`hist-${getEntryTerm(term)}`}
              entry={term}
              isFav={false}
              onSelect={onSelect}
              onRemove={onRemove}
              onToggleFav={onToggleFav}
              showAvatar={showAvatar}
              hotel={hotel}
              showFurniImage={showFurniImage}
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
    <div className="shrink-0 w-7 h-7 flex items-center justify-center overflow-hidden relative">
      {!hasError ? (
        <img
          src={url}
          alt={nick}
          className="w-full h-full object-contain image-rendering-pixel"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="text-[11px] text-[#666]">👤</span>
      )}
      {/* Estrela sobreposta se for favorito */}
      {isFav && (
        <img
          src={starOn}
          alt="favorito"
          className="absolute bottom-0 right-0 w-[8px] h-[8px] image-rendering-pixel"
        />
      )}
    </div>
  )
}

function DropdownItem({ entry, isFav, onSelect, onRemove, onToggleFav, showAvatar = false, hotel = "br", showFurniImage = false }) {
  const term = getEntryTerm(entry) || (typeof entry === "string" ? entry : "")
  const classname = typeof entry === "object" ? entry?.classname : null
  return (
    <div
      className="group flex items-center gap-1 px-2 py-[6px] hover:bg-[rgba(255,214,77,0.12)] cursor-pointer"
      onClick={() => onSelect(term)}
    >
      {/* Avatar, imagem do mobi, ou ícone de clock/star */}
      {showAvatar ? (
        <AvatarThumb nick={term} hotel={hotel} isFav={isFav} />
      ) : showFurniImage && classname ? (
        <FurniThumb classname={classname} isFav={isFav} showStar angle="2_0" />
      ) : (
        <div className="shrink-0 w-[14px] h-[14px] flex items-center justify-center">
          {isFav
            ? <img src={starOn} alt="favorito" className="w-[14px] h-[14px] image-rendering-pixel" />
            : <span className="text-[11px] text-[#888] group-hover:text-[#d2d2d2]">◷</span>
          }
        </div>
      )}

      {/* Termo */}
      <span className="flex-1 text-[12px] text-[#e0e0e0] truncate">
        {term}
      </span>

      {/* Ações */}
      <div className="flex items-center gap-[6px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {/* Toggle favorito */}
        <button
          type="button"
          title={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          onClick={(e) => { e.stopPropagation(); onToggleFav(term) }}
          className="cursor-pointer hover:scale-110 transition-transform"
        >
          <img
            src={isFav ? starOn : starOff}
            alt={isFav ? "remover favorito" : "adicionar favorito"}
            className={isFav ? "w-[14px] h-[14px] image-rendering-pixel" : "w-[11px] h-[11px] image-rendering-pixel opacity-50"}
          />
        </button>

        {/* Remover do histórico (só itens não-favoritos) */}
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