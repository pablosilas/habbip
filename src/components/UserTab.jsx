import React from "react"
import ProfileContent from "./ProfileContent"

export default function UserTab({
  nickQuery,
  setNickQuery,
  onSearch,
  loading,
  error,
  userData,
}) {
  const hasResult = !!userData
  const [expanded, setExpanded] = React.useState(true)

  React.useEffect(() => {
    if (hasResult) setExpanded(false)
  }, [hasResult])

  return (
    <div className="h-full flex flex-col">
      <div
        className="flex items-center justify-between mb-2 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="text-[#f4f4f4] font-bold text-[13px]">
          Buscar usuário
        </div>
        <span className="text-[#d2d2d2] text-[11px]">
          {expanded ? "▲ recolher" : "▼ expandir"}
        </span>
      </div>

      {expanded && (
        <>
          <input
            value={nickQuery}
            onChange={(e) => setNickQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearch()
            }}
            placeholder="Digite o nick do usuário"
            className="w-full h-9 border border-[#c3c3c3] bg-[rgba(255,255,255,0.12)] px-2 text-[12px] text-white outline-none placeholder:text-[#d2d2d2] mb-2"
          />

          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={onSearch}
              disabled={loading}
              className="w-full h-9 border border-[#b98d14] bg-[linear-gradient(180deg,#ffd64d_0%,#e6b21b_100%)] text-[#6f4700] font-bold text-[12px] disabled:opacity-70 cursor-pointer"
            >
              {loading ? "Buscando..." : "Buscar usuário"}
            </button>

            <button
              onClick={() => setNickQuery("")}
              type="button"
              className="w-full h-9 border border-[#6d6d6d] bg-[linear-gradient(180deg,#5a5a63_0%,#44454e_100%)] text-white font-bold text-[12px] cursor-pointer"
            >
              Limpar
            </button>
          </div>
        </>
      )}

      {error ? (
        <div className="text-[#ffd0d0] text-[12px] mb-3">{error}</div>
      ) : null}

      <div className="flex-1 min-h-0">
        {userData ? (
          <ProfileContent user={userData} hotel="br" />
        ) : (
          !loading && !error && (
            <div className="text-[#e0e0e0] text-[12px]">
              Nenhum usuário carregado.
            </div>
          )
        )}
      </div>
    </div>
  )
}