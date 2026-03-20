import {
  getHabboAvatarHeadUrl,
  getHabboBadgeUrl,
} from "../../services/habboApi"
import noUser from "../../assets/no_user.png"

export default function HeaderCard({ activeTab, userData, onOpenProfile, onOpenLogin }) {
  const isLogged = !!userData?.name
  const avatarUrl = isLogged
    ? getHabboAvatarHeadUrl({ name: userData.name, hotel: "br", size: "l" })
    : null

  const selectedBadge = userData?.selectedBadges?.[0]

  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-20 h-21 rounded-md flex items-center justify-center shrink-0 overflow-hidden">
        <img
          src={avatarUrl || noUser}
          alt={userData?.name || "Usuário"}
          className="max-w-full max-h-full object-contain image-rendering-pixel"
          onError={(e) => {
            e.currentTarget.src = noUser
          }}
        />
      </div>

      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <div className="text-white font-bold text-[15px] leading-none mb-1">
              {isLogged
                ? userData.name
                : activeTab === "feira"
                  ? "Feira Livre"
                  : "Buscar Usuário"}
            </div>

            {selectedBadge?.code ? (
              <img
                src={getHabboBadgeUrl(selectedBadge.code)}
                alt={selectedBadge.name || "Badge"}
                className="w-5 h-5 image-rendering-pixel"
                title={selectedBadge.name || "Badge"}
              />
            ) : null}
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

        <div className="border border-[#b9b9b9] bg-[rgba(255,255,255,0.08)] px-2 py-1 text-[12px] text-[#ededed] leading-5">
          {isLogged
            ? userData.motto || "Sem motto."
            : activeTab === "feira"
              ? "Pesquise mobis e veja os dados da feira."
              : "Pesquise um usuário do Habbo."}
        </div>
      </div>
    </div>
  )
}