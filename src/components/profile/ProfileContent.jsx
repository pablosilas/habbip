import React from "react"
import roomPlaceholder from "../../assets/room.png"
import onlineIcon from "../../assets/online.png"
import offlineIcon from "../../assets/offline.png"
import starOn from "../../assets/star.png"
import starOff from "../../assets/star_off.png"
import boxIcon from "../../assets/box.png"
import likeIcon from "../../assets/like.png"

import {
  formatHabboDate,
  getHabboAvatarUrl,
  getHabboBadgeUrl,
  getHabboGroupBadgeUrl,
  getHabboProfileUrl,
  getHabboRoomUrl,
} from "../../services/habboApi"
import ProfileListCard from "./ProfileListCard"
import SectionModal from "../modals/SectionModal"

const PREVIEW_COUNT = 3

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionTitle({ children, count, onVerMais }) {
  return (
    <div className="flex items-center justify-between mt-4 mb-2">
      <div className="text-[12px] font-bold text-[#fff2c1]">{children}</div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#d7d7d7]">{count}</span>
        {count > PREVIEW_COUNT && (
          <button
            type="button"
            onClick={onVerMais}
            className="text-[10px] text-[#ffd64d] hover:underline cursor-pointer transition-colors"
          >
            Ver mais
          </button>
        )}
      </div>
    </div>
  )
}

function ImageWithFallback({ src, alt, className, fallback }) {
  const [status, setStatus] = React.useState("loading")

  React.useEffect(() => { setStatus(src ? "loading" : "error") }, [src])

  if (!src || status === "error") {
    return fallback || (
      <img
        src={boxIcon}
        alt="sem imagem"
        className={`${className} object-contain  opacity-60`}
      />
    )
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      {status === "loading" && (
        <img
          src={boxIcon}
          alt="carregando"
          className={`${className} object-contain  opacity-40 animate-pulse absolute`}
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

// ── Renderizadores de item (reutilizados no preview e no modal) ───────────────

function BadgeItem({ badge, hotel }) {
  return (
    <div className="flex items-center gap-3 border border-[#8a8a8a] bg-[rgba(255,255,255,0.04)] px-3 py-2 rounded-[8px]">
      <ImageWithFallback
        src={getHabboBadgeUrl(badge.code)}
        alt={badge.name || badge.code}
        className="w-10 h-10  shrink-0"
        fallback={<div className="w-10 h-10 border border-[#8a8a8a] bg-[rgba(255,255,255,0.05)] shrink-0" />}
      />
      <div className="min-w-0">
        <div className="text-[12px] font-bold break-words">{badge.name || badge.code}</div>
        <div className="text-[11px] text-[#d7d7d7] break-words">{badge.description || "-"}</div>
      </div>
    </div>
  )
}

function FriendItem({ friend, hotel }) {
  return (
    <ProfileListCard
      image={
        <ImageWithFallback
          src={getHabboAvatarUrl({ name: friend.name, hotel, size: "s", direction: 2, headDirection: 2 })}
          alt={friend.name}
          className="w-12 h-12 object-contain "
          fallback={<span className="text-xl">👤</span>}
        />
      }
      title={friend.name}
      subtitle={friend.motto}
      href={getHabboProfileUrl({ name: friend.name, hotel })}
    />
  )
}

function GroupItem({ group, hotel }) {
  return (
    <ProfileListCard
      image={
        <ImageWithFallback
          src={getHabboGroupBadgeUrl({ badgeCode: group.badgeCode, hotel })}
          alt={group.name}
          className="w-12 h-12 object-contain "
          fallback={<span className="text-[10px] text-[#cfcfcf]">grupo</span>}
        />
      }
      title={group.name}
      subtitle={group.description}
      href={getHabboRoomUrl({ roomId: group.roomId, hotel })}
    />
  )
}

function RoomItem({ room, hotel }) {
  const roomImageSrc = room.thumbnailUrl || roomPlaceholder

  return (
    <ProfileListCard
      image={
        <div className="w-12 h-12 rounded-[6px] bg-[#3a3a3a] overflow-hidden flex items-center justify-center shrink-0">
          <ImageWithFallback
            src={roomImageSrc}
            alt={room.name}
            className="w-12 h-12 object-cover"
            fallback={
              <img
                src={roomPlaceholder}
                alt={room.name}
                className="w-8 h-8 object-contain  opacity-60"
              />
            }
          />
        </div>
      }
      title={room.name}
      subtitle={
        <span className="flex flex-col gap-[2px]">
          <span className="truncate">{room.description || "-"}</span>
          {room.rating != null && (
            <span
              className="flex items-center gap-[4px] text-[10px] text-[#d7d7d7]"
              title={`${room.rating} curtida${room.rating !== 1 ? "s" : ""}`}
            >
              <img
                src={likeIcon}
                alt="curtidas"
                className="w-[11px] h-[11px] object-contain "
              />
              {room.rating}
            </span>
          )}
        </span>
      }
      href={getHabboRoomUrl({ roomId: room.uniqueId, hotel })}
    />
  )
}

// ── Funções de filtro para cada seção ─────────────────────────────────────────

const filters = {
  badges: (badge, q) =>
    badge.code?.toLowerCase().includes(q) ||
    badge.name?.toLowerCase().includes(q) ||
    badge.description?.toLowerCase().includes(q),
  friends: (friend, q) =>
    friend.name?.toLowerCase().includes(q) ||
    friend.motto?.toLowerCase().includes(q),
  groups: (group, q) =>
    group.name?.toLowerCase().includes(q) ||
    group.description?.toLowerCase().includes(q),
  rooms: (room, q) =>
    room.name?.toLowerCase().includes(q) ||
    room.description?.toLowerCase().includes(q),
}

// ── ProfileContent ─────────────────────────────────────────────────────────────

export default function ProfileContent({ user, hotel = "br", isFavorite = false, onToggleFavorite }) {
  const [modal, setModal] = React.useState(null) // "badges" | "friends" | "groups" | "rooms" | null

  if (!user) return null

  const avatarUrl = getHabboAvatarUrl({ name: user.name, hotel, size: "b" })
  const selectedBadges = Array.isArray(user.selectedBadges) ? user.selectedBadges : []
  const badges = Array.isArray(user.badges) ? user.badges : []
  const friends = Array.isArray(user.friends) ? user.friends : []
  const groups = Array.isArray(user.groups) ? user.groups : []
  const rooms = Array.isArray(user.rooms) ? user.rooms : []

  return (
    <div className="text-white">

      {/* ── Modais de seção ── */}
      {modal === "badges" && (
        <SectionModal
          open={modal === "badges"}
          onClose={() => setModal(null)}
          title="Emblemas"
          items={badges}
          renderItem={(badge) => <BadgeItem badge={badge} hotel={hotel} />}
          filterFn={filters.badges}
          emptyText="Nenhum emblema disponível."
        />
      )}
      {modal === "friends" && (
        <SectionModal
          open={modal === "friends"}
          onClose={() => setModal(null)}
          title="Amigos"
          items={friends}
          renderItem={(friend) => <FriendItem friend={friend} hotel={hotel} />}
          filterFn={filters.friends}
          emptyText="Nenhum amigo disponível."
        />
      )}
      {modal === "groups" && (
        <SectionModal
          open={modal === "groups"}
          onClose={() => setModal(null)}
          title="Grupos"
          items={groups}
          renderItem={(group) => <GroupItem group={group} hotel={hotel} />}
          filterFn={filters.groups}
          emptyText="Nenhum grupo disponível."
        />
      )}
      {modal === "rooms" && (
        <SectionModal
          open={modal === "rooms"}
          onClose={() => setModal(null)}
          title="Quartos"
          items={rooms}
          renderItem={(room) => <RoomItem room={room} hotel={hotel} />}
          filterFn={filters.rooms}
          emptyText="Nenhum quarto disponível."
        />
      )}

      {/* ── Cabeçalho do perfil ── */}
      <div className="flex items-start gap-4 ">
        {/* Avatar aumentado: de w-24 h-24 para w-32 h-32 */}
        <div className="  rounded-[10px] flex items-center justify-center overflow-hidden shrink-0 px-5 pt-5 pb-9">
          <ImageWithFallback
            src={avatarUrl}
            alt={user.name}
            className="max-w-full max-h-full object-contain "
            fallback={<span className="text-4xl">👤</span>}
          />
        </div>

        <div className="flex-1 min-w-0 space-y-2 text-[12px]">
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
                  className={isFavorite ? "w-4 h-4 " : "w-3 h-3  opacity-50"}
                />
              </button>
            )}
          </div>

          <div><span className="font-bold">Criado em:</span> {formatHabboDate(user.memberSince)}</div>
          <div><span className="font-bold">Último login:</span> {formatHabboDate(user.lastAccessTime)}</div>
          <div>{user.motto || "-"}</div>

          <div className="flex items-center gap-2">
            <img
              src={user.online ? onlineIcon : offlineIcon}
              alt={user.online ? "Online" : "Offline"}
              className=""
            />
          </div>

          {selectedBadges.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedBadges.map((badge) => (
                <div key={badge.code} title={badge.name ? `${badge.name}: ${badge.description}` : badge.code}>
                  <ImageWithFallback
                    src={getHabboBadgeUrl(badge.code)}
                    alt={badge.name || badge.code}
                    className="w-8 h-8 "
                    fallback={<div className="w-8 h-8 border border-[#8a8a8a] bg-[rgba(255,255,255,0.05)]" />}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Emblemas ── */}
      <SectionTitle count={badges.length} onVerMais={() => setModal("badges")}>
        Emblemas
      </SectionTitle>
      <div className="space-y-2">
        {badges.length === 0
          ? <div className="text-[12px] text-[#d7d7d7]">Nenhum emblema disponível.</div>
          : badges.slice(0, PREVIEW_COUNT).map((badge) => (
            <BadgeItem key={badge.code} badge={badge} hotel={hotel} />
          ))
        }
        {badges.length > PREVIEW_COUNT && (
          <PreviewMore count={badges.length - PREVIEW_COUNT} onClick={() => setModal("badges")} />
        )}
      </div>

      {/* ── Amigos ── */}
      <SectionTitle count={friends.length} onVerMais={() => setModal("friends")}>
        Amigos
      </SectionTitle>
      <div className="space-y-2">
        {friends.length === 0
          ? <div className="text-[12px] text-[#d7d7d7]">Nenhum amigo disponível.</div>
          : friends.slice(0, PREVIEW_COUNT).map((friend) => (
            <FriendItem key={friend.name} friend={friend} hotel={hotel} />
          ))
        }
        {friends.length > PREVIEW_COUNT && (
          <PreviewMore count={friends.length - PREVIEW_COUNT} onClick={() => setModal("friends")} />
        )}
      </div>

      {/* ── Grupos ── */}
      <SectionTitle count={groups.length} onVerMais={() => setModal("groups")}>
        Grupos
      </SectionTitle>
      <div className="space-y-2">
        {groups.length === 0
          ? <div className="text-[12px] text-[#d7d7d7]">Nenhum grupo disponível.</div>
          : groups.slice(0, PREVIEW_COUNT).map((group) => (
            <GroupItem key={group.id || group.badgeCode} group={group} hotel={hotel} />
          ))
        }
        {groups.length > PREVIEW_COUNT && (
          <PreviewMore count={groups.length - PREVIEW_COUNT} onClick={() => setModal("groups")} />
        )}
      </div>

      {/* ── Quartos ── */}
      <SectionTitle count={rooms.length} onVerMais={() => setModal("rooms")}>
        Quartos
      </SectionTitle>
      <div className="space-y-2">
        {rooms.length === 0
          ? <div className="text-[12px] text-[#d7d7d7]">Nenhum quarto disponível.</div>
          : rooms.slice(0, PREVIEW_COUNT).map((room) => (
            <RoomItem key={room.uniqueId} room={room} hotel={hotel} />
          ))
        }
        {rooms.length > PREVIEW_COUNT && (
          <PreviewMore count={rooms.length - PREVIEW_COUNT} onClick={() => setModal("rooms")} />
        )}
      </div>

    </div>
  )
}

// Rodapé de preview — mostra quantos itens estão ocultos e abre o modal
function PreviewMore({ count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-2 text-[11px] text-[#ffd64d] border border-dashed border-[#555] hover:border-[#ffd64d] hover:bg-[rgba(255,214,77,0.06)] transition-colors cursor-pointer rounded-[6px]"
    >
      + {count} {count === 1 ? "item oculto" : "itens ocultos"} — Ver todos
    </button>
  )
}