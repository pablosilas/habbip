import React from "react"
import ProfileContent from "../profile/ProfileContent"
import Button from "../ui/Button"
import SearchHistoryDropdown from "../ui/SearchHistoryDropdown"
import { useUserHistory } from "../../hooks/useSearchHistory"

export default function UserTab({
  nickQuery,
  setNickQuery,
  onSearch,
  loading,
  error,
  userData,
  loggedUserName,
}) {
  const hasResult = !!userData
  const [expanded, setExpanded] = React.useState(true)
  const [showDropdown, setShowDropdown] = React.useState(false)

  const {
    history,
    favorites,
    addToHistory,
    removeFromHistory,
    clearHistory,
    toggleFavorite,
    isFavorite,
  } = useUserHistory(loggedUserName)

  React.useEffect(() => {
    if (hasResult) setExpanded(false)
  }, [hasResult])

  function handleSearch() {
    if (nickQuery.trim()) addToHistory(nickQuery.trim())
    onSearch()
    setShowDropdown(false)
  }

  function handleSelectFromDropdown(term) {
    setNickQuery(term)
    setShowDropdown(false)
    addToHistory(term)
    onSearch(term)
  }

  const hasDropdownItems = history.length > 0 || favorites.length > 0

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
          {/* Input com dropdown de histórico */}
          <div className="relative mb-2">
            <input
              value={nickQuery}
              onChange={(e) => setNickQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch()
                if (e.key === "Escape") setShowDropdown(false)
              }}
              onFocus={() => { if (hasDropdownItems) setShowDropdown(true) }}
              onBlur={() => setShowDropdown(false)}
              placeholder="Digite o nick do usuário"
              className="w-full h-9 border border-[#c3c3c3] bg-[rgba(255,255,255,0.12)] px-2 text-[12px] text-white outline-none placeholder:text-[#d2d2d2]"
            />

            <SearchHistoryDropdown
              show={showDropdown}
              history={history}
              favorites={favorites}
              onSelect={handleSelectFromDropdown}
              onRemove={removeFromHistory}
              onToggleFav={toggleFavorite}
              isFavorite={isFavorite}
              onClear={clearHistory}
              showAvatar
              hotel="br"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? "Buscando..." : "Buscar usuário"}
            </Button>

            <Button variant="secondary" onClick={() => setNickQuery("")}>
              Limpar
            </Button>
          </div>
        </>
      )}

      {error ? (
        <div className="text-[#ffd0d0] text-[12px] mb-3">{error}</div>
      ) : null}

      <div className="flex-1 min-h-0">
        {userData ? (
          <ProfileContent
            user={userData}
            hotel="br"
            isFavorite={isFavorite(userData.name)}
            onToggleFavorite={() => toggleFavorite(userData.name)}
          />
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