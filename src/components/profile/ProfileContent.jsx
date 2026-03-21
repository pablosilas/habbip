import React from "react"
import roomPlaceholder from "../../assets/room.png"
import onlineIcon from "../../assets/online.png"
import offlineIcon from "../../assets/offline.png"
import starOn from "../../assets/star_on.png"
import starOff from "../../assets/star_off.png"
import boxIcon from "../../assets/box.png"

import {
  formatHabboDate,
  getHabboAvatarUrl,
  getHabboBadgeUrl,
  getHabboGroupBadgeUrl,
  getHabboProfileUrl,
  getHabboRoomUrl,
} from "../../services/habboApi"
import ProfileListCard from "./ProfileListCard"

function SectionTitle({ children, count }) {
  return (
    <div className="flex items-center justify-between mt-4 mb-2">
      <div className="text-[12px] font-bold text-[#fff2c1]">{children}</div>
      <div className="text-[11px] text-[#d7d7d7]">{count}</div>
    </div>
  )
}

function ImageWithFallback({ src, alt, className, fallback }) {
  const [status, setStatus] = React.useState("loading") // "loading" | "ok" | "error"

  // Reseta o status quando o src muda
  React.useEffect(() => { setStatus(src ? "loading" : "error") }, [src])

  if (!src || status === "error") {
    return fallback || (
      <img
        src={boxIcon}
        alt="sem imagem"
        className={`${className} object-contain image-rendering-pixel opacity-60`}
      />
    )
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* box.png pulsando enquanto carrega */}
      {status === "loading" && (
        <img
          src={boxIcon}
          alt="carregando"
          className={`${className} object-contain image-rendering-pixel opacity-40 animate-pulse absolute`}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${status === "ok" ? "opacity-100" : "opacity-0"} transition-opacity duration-200`}
        onLoad={() => setStatus("ok")}
        onError={() => setStatus("error")}
      />
    </div>
  )
}

function ScrollSectionCard({ children, emptyText, className = "" }) {
  const hasChildren = React.Children.count(children) > 0
  return (
    <div className={`border border-[#8a8a8a] bg-[rgba(255,255,255,0.06)] rounded-[10px] p-2 ${className}`}>
      <div className="max-h-[210px] overflow-y-auto pr-1 space-y-2">
        {hasChildren ? children : (
          <div className="text-[12px] text-[#d7d7d7]">{emptyText}</div>
        )}
      </div>
    </div>
  )
}

/**
 * ProfileContent
 *
 * Props adicionadas:
 *   isFavorite        {boolean}    Se o usuário está nos favoritos
 *   onToggleFavorite  {function}   Callback para adicionar/remover dos favoritos
 */
export default function ProfileContent({ user, hotel = "br", isFavorite = false, onToggleFavorite }) {
  if (!user) return null

  const avatarUrl = getHabboAvatarUrl({ name: user.name, hotel, size: "b" })

  const selectedBadges = Array.isArray(user.selectedBadges) ? user.selectedBadges : []
  const badges = Array.isArray(user.badges) ? user.badges : []
  const friends = Array.isArray(user.friends) ? user.friends : []
  const groups = Array.isArray(user.groups) ? user.groups : []
  const rooms = Array.isArray(user.rooms) ? user.rooms : []

  return (
    <div className="text-white">
      <div className="flex items-start gap-4">
        <div className="w-24 h-24 rounded-[10px] flex items-center justify-center overflow-hidden shrink-0">
          <ImageWithFallback
            src={avatarUrl}
            alt={user.name}
            className="max-w-full max-h-full object-contain image-rendering-pixel"
            fallback={<span className="text-3xl">👤</span>}
          />
        </div>

        <div className="flex-1 min-w-0 space-y-2 text-[12px]">
          {/* Nome + botão favorito */}
          <div className="flex items-center gap-2">
            <span className="font-bold">{user.name || "-"}</span>
            {onToggleFavorite && (
              <button
                type="button"
                title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                onClick={onToggleFavorite}
                className="cursor-pointer transition-transform hover:scale-125"
              >
                <img
                  src={isFavorite ? starOn : starOff}
                  alt={isFavorite ? "remover favorito" : "adicionar favorito"}
                  className={isFavorite ? "w-4 h-4 image-rendering-pixel" : "w-3 h-3 image-rendering-pixel opacity-50"}
                />
              </button>
            )}
          </div>

          <div>
            <span className="font-bold">Criado em:</span> {formatHabboDate(user.memberSince)}
          </div>

          <div>
            <span className="font-bold">Último login:</span> {formatHabboDate(user.lastAccessTime)}
          </div>

          <div>{user.motto || "-"}</div>

          <div className="flex items-center gap-2">
            <img
              src={user.online ? onlineIcon : offlineIcon}
              alt={user.online ? "Online" : "Offline"}
              className="image-rendering-pixel"
            />
          </div>

          {selectedBadges.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedBadges.map((badge) => (
                <div key={badge.code} title={badge.name ? `${badge.name} - ${badge.code}` : badge.code}>
                  <ImageWithFallback
                    src={getHabboBadgeUrl(badge.code)}
                    alt={badge.name || badge.code}
                    className="w-8 h-8 image-rendering-pixel shrink-0"
                    fallback={
                      <div className="w-8 h-8 border border-[#8a8a8a] bg-[rgba(255,255,255,0.05)] shrink-0 rounded-[4px]" />
                    }
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <SectionTitle count={badges.length}>Emblemas</SectionTitle>
      <ScrollSectionCard emptyText="Nenhum emblema disponível.">
        {badges.map((badge) => (
          <div
            key={badge.code}
            className="flex items-center gap-3 border border-[#8a8a8a] bg-[rgba(255,255,255,0.04)] px-3 py-2 rounded-[8px]"
          >
            <ImageWithFallback
              src={getHabboBadgeUrl(badge.code)}
              alt={badge.name || badge.code}
              className="w-10 h-10 image-rendering-pixel shrink-0"
              fallback={
                <div className="w-10 h-10 border border-[#8a8a8a] bg-[rgba(255,255,255,0.05)] shrink-0" />
              }
            />
            <div className="min-w-0">
              <div className="text-[12px] font-bold break-words">{badge.name || badge.code}</div>
              <div className="text-[11px] text-[#d7d7d7] break-words">{badge.description || "-"}</div>
            </div>
          </div>
        ))}
      </ScrollSectionCard>

      <SectionTitle count={friends.length}>Amigos</SectionTitle>
      <ScrollSectionCard emptyText="Nenhum amigo disponível.">
        {friends.map((friend) => (
          <ProfileListCard
            key={friend.uniqueId || friend.name}
            image={
              <ImageWithFallback
                src={getHabboAvatarUrl({ name: friend.name, hotel, size: "s", direction: 2, headDirection: 2 })}
                alt={friend.name}
                className="w-12 h-12 object-contain image-rendering-pixel"
                fallback={<span className="text-xl">👤</span>}
              />
            }
            title={friend.name}
            subtitle={friend.motto}
            href={getHabboProfileUrl({ name: friend.name, hotel })}
          />
        ))}
      </ScrollSectionCard>

      <SectionTitle count={groups.length}>Grupos</SectionTitle>
      <ScrollSectionCard emptyText="Nenhum grupo disponível.">
        {groups.map((group) => (
          <ProfileListCard
            key={group.id || group.badgeCode}
            image={
              <ImageWithFallback
                src={getHabboGroupBadgeUrl({ badgeCode: group.badgeCode, hotel })}
                alt={group.name}
                className="w-12 h-12 object-contain image-rendering-pixel"
                fallback={<span className="text-[10px] text-[#cfcfcf]">grupo</span>}
              />
            }
            title={group.name}
            subtitle={group.description}
            href={getHabboRoomUrl({ roomId: group.roomId, hotel })}
          />
        ))}
      </ScrollSectionCard>

      <SectionTitle count={rooms.length}>Quartos</SectionTitle>
      <ScrollSectionCard emptyText="Nenhum quarto disponível.">
        {rooms.map((room) => (
          <ProfileListCard
            key={room.uniqueId}
            image={
              <ImageWithFallback
                src={roomPlaceholder}
                alt={room.name}
                className="w-12 h-12 object-contain image-rendering-pixel"
                fallback={<span className="text-[10px] text-[#cfcfcf]">quarto</span>}
              />
            }
            title={room.name}
            subtitle={room.description}
            href={getHabboRoomUrl({ roomId: room.uniqueId, hotel })}
          />
        ))}
      </ScrollSectionCard>
    </div>
  )
}