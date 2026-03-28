import { getHabboAvatarHeadUrl } from "../../services/habboApi"
import noUser from "../../assets/no_user.png"

export default function HeaderCard({ activeTab, userData, onOpenProfile, onOpenLogin }) {
  const isLogged = !!userData

  // habboProfile vem do fetchUserByName — tem name, motto, online, selectedBadges, etc.
  const habboProfile = userData?.habboProfile
  const habboNick = userData?.habboNick

  const displayName = habboProfile?.name || habboNick || ""
  const motto = habboProfile?.motto || ""

  const avatarUrl = habboNick
    ? getHabboAvatarHeadUrl({ name: habboNick, hotel: "br", size: "m" })
    : null

  const tabDescriptions = {
    feira:      { title: "Feira Livre",     sub: "Pesquise mobis e veja os dados da feira." },
    usuario:    { title: "Buscar Usuário",  sub: "Pesquise um usuário do Habbo." },
    inventario: { title: "Inventário",      sub: "Gerencie seu inventário de mobis." },
  }
  const tabInfo = tabDescriptions[activeTab] ?? tabDescriptions.feira

  return (
    <div className="flex items-center gap-2 mb-2">
      {/* Avatar */}
      <div className="w-14 h-14 rounded-sm flex items-center justify-center shrink-0 overflow-hidden">
        <img
          src={avatarUrl || noUser}
          alt={displayName || "Usuário"}
          className="max-w-full max-h-full object-contain image-rendering-pixel"
          onError={(e) => { e.currentTarget.src = noUser }}
        />
      </div>

      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <div className="min-w-0">
          {isLogged ? (
            <>
              <div className="text-white font-bold text-[12px] leading-none truncate">
                {displayName}
              </div>
              <div className="text-[10px] text-[#bbb] leading-none mt-[3px] truncate">
                {motto || "Sem motto."}
              </div>
            </>
          ) : (
            <>
              <div className="text-white font-bold text-[12px] leading-none truncate">
                {tabInfo.title}
              </div>
              <div className="text-[10px] text-[#bbb] leading-none mt-[3px] truncate">
                {tabInfo.sub}
              </div>
            </>
          )}
        </div>

        {isLogged ? (
          <button
            type="button"
            onClick={onOpenProfile}
            className="shrink-0 border border-[#c7a84b] bg-[rgba(255,255,255,0.08)] px-2 py-[2px] text-[10px] font-bold text-[#fff2c1] cursor-pointer hover:brightness-110"
          >
            Minha conta
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenLogin}
            className="shrink-0 border border-[#c7a84b] bg-[rgba(255,255,255,0.08)] px-2 py-[2px] text-[10px] font-bold text-[#fff2c1] cursor-pointer hover:brightness-110"
          >
            Entrar no Habbip
          </button>
        )}
      </div>
    </div>
  )
}