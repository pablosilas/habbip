import {
  getHabboAvatarHeadUrl,
  getHabboBadgeUrl,
} from "../../services/habboApi"
import noUser from "../../assets/no_user.png"

export default function HeaderCard({ activeTab, userData, onOpenProfile, onOpenLogin }) {
  const isLogged = !!userData?.name
  const avatarUrl = isLogged
    ? getHabboAvatarHeadUrl({ name: userData.name, hotel: "br", size: "m" })
    : null

  const selectedBadge = userData?.selectedBadges?.[0]

  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-14 h-14 rounded-sm flex items-center justify-center shrink-0 overflow-hidden">
        <img
          src={avatarUrl || noUser}
          alt={userData?.name || "Usuário"}
          className="max-w-full max-h-full object-contain image-rendering-pixel"
          onError={(e) => { e.currentTarget.src = noUser }}
        />
      </div>

      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-white font-bold text-[12px] leading-none truncate">
            {isLogged
              ? userData.name
              : activeTab === "feira"
                ? "Feira Livre"
                : activeTab === "usuario"
                  ? "Buscar Usuário"
                  : "Inventário"}
          </div>
          <div className="text-[10px] text-[#bbb] leading-none mt-[3px] truncate">
            {isLogged
              ? userData.motto || "Sem motto."
              : activeTab === "feira"
                ? "Pesquise mobis e veja os dados da feira."
                : activeTab === "usuario"
                  ? "Pesquise um usuário do Habbo."
                  : "Gerencie seu inventário de mobis."}
          </div>
        </div>

        {isLogged ? (
          <button
            type="button"
            onClick={onOpenProfile}
            className="shrink-0 border border-[#c7a84b] bg-[rgba(255,255,255,0.08)] px-2 py-[2px] text-[10px] font-bold text-[#fff2c1] cursor-pointer hover:brightness-110"
          >
            Ver perfil
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenLogin}
            className="shrink-0 border border-[#c7a84b] bg-[rgba(255,255,255,0.08)] px-2 py-[2px] text-[10px] font-bold text-[#fff2c1] cursor-pointer hover:brightness-110"
          >
            Entrar
          </button>
        )}
      </div>
    </div>
  )
}