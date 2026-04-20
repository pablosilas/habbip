import { getHabboAvatarHeadUrl } from "../../services/habboApi"
import noUser from "../../assets/no_user.png"

export default function HeaderCard({ activeTab, userData, onOpenProfile, onOpenLogin }) {
  const isLogged = !!userData

  const habboProfile = userData?.habboProfile
  const habboNick = userData?.habboNick

  const displayName = habboProfile?.name || habboNick || ""
  const motto = habboProfile?.motto || ""

  const avatarUrl = habboNick
    ? getHabboAvatarHeadUrl({ name: habboNick, hotel: "br", size: "m" })
    : null

  const tabDescriptions = {
    feira:      { title: "Feira Livre",     sub: "Pesquise mobis e veja os dados da feira.", icon: "shopping" },
    usuario:    { title: "Buscar Usuario",  sub: "Pesquise um usuario do Habbo.", icon: "user" },
    inventario: { title: "Inventario",      sub: "Gerencie seu inventario de mobis.", icon: "box" },
  }
  const tabInfo = tabDescriptions[activeTab] ?? tabDescriptions.feira

  return (
    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-sky-50 to-white rounded-xl border border-sky-100">
      {/* Avatar */}
      <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-white border-2 border-sky-200 shadow-sm">
        <img
          src={avatarUrl || noUser}
          alt={displayName || "Usuario"}
          className="max-w-full max-h-full object-contain pixel-render"
          onError={(e) => { e.currentTarget.src = noUser }}
        />
      </div>

      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <div className="min-w-0">
          {isLogged ? (
            <>
              <div className="text-sky-900 font-bold text-[14px] leading-tight truncate">
                {displayName}
              </div>
              <div className="text-[11px] text-sky-600/70 leading-tight mt-1 truncate">
                {motto || "Sem motto."}
              </div>
            </>
          ) : (
            <>
              <div className="text-sky-900 font-bold text-[14px] leading-tight truncate">
                {tabInfo.title}
              </div>
              <div className="text-[11px] text-sky-600/70 leading-tight mt-1 truncate">
                {tabInfo.sub}
              </div>
            </>
          )}
        </div>

        {isLogged ? (
          <button
            type="button"
            onClick={onOpenProfile}
            className="shrink-0 px-4 py-2 rounded-lg bg-gradient-to-r from-sky-400 to-cyan-400 text-white text-[11px] font-bold cursor-pointer hover:from-sky-500 hover:to-cyan-500 transition-all shadow-sm"
          >
            Minha conta
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenLogin}
            className="shrink-0 px-4 py-2 rounded-lg bg-gradient-to-r from-sky-400 to-cyan-400 text-white text-[11px] font-bold cursor-pointer hover:from-sky-500 hover:to-cyan-500 transition-all shadow-sm"
          >
            Entrar
          </button>
        )}
      </div>
    </div>
  )
}
