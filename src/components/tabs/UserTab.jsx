import React from "react"
import ProfileContent from "../profile/ProfileContent"
import Button from "../ui/Button"
import SearchInput from "../ui/SearchInput"
import SearchHistoryDropdown from "../ui/SearchHistoryDropdown"
import { useUserHistory } from "../../hooks/useSearchHistory"
import loadingGif from "../../assets/loading.gif"

export default function UserTab({
  nickQuery,
  setNickQuery,
  onSearch,
  loading,
  error,
  userData,
  expanded,
  setExpanded,
  serverData,
  markDirty,
  isLoggedIn,
  updateLocalData,
  loadingData
}) {
  const inputRef = React.useRef(null)
  const [showDropdown, setShowDropdown] = React.useState(false)

  const {
    history,
    favorites,
    addToHistory,
    removeFromHistory,
    clearHistory,
    toggleFavorite,
    isFavorite,
  } = useUserHistory(serverData, markDirty, isLoggedIn, updateLocalData)

  function handleSearch() {
    inputRef.current?.blur()
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
        <div className="min-w-0 flex-1 mr-2">
          <div className="text-[#f4f4f4] font-bold text-[13px]">Buscar Usuário</div>
          <div className="text-[#d2d2d2] text-[11px] leading-4">
            Encontre usuários, veja perfis e salve seus favoritos.
          </div>
        </div>
        <span className="text-[#d2d2d2] text-[11px]">
          {expanded ? "▲ recolher" : "▼ expandir"}
        </span>
      </div>

      {expanded && (
        <form onSubmit={(e) => { e.preventDefault(); handleSearch() }}>
          <div className="mb-2">
            <SearchInput
              inputRef={inputRef}
              value={nickQuery}
              onChange={(e) => setNickQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") setShowDropdown(false) }}
              onFocus={() => { if (hasDropdownItems) setShowDropdown(true) }}
              onBlur={() => setShowDropdown(false)}
              placeholder="Digite o nick do usuário"
              inputMode="search"
              enterKeyHint="search"
            >
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
            </SearchInput>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Buscando..." : "Buscar usuário"}
            </Button>
            <Button variant="secondary" type="button" onClick={() => setNickQuery("")}>
              Limpar
            </Button>
          </div>
        </form>
      )}

      {error && <div className="text-[#ffd0d0] text-[12px] mb-3">{error}</div>}

      <div className="flex-1 min-h-0">
        {loadingData ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <img src={loadingGif} alt="Carregando" className="w-12 h-12" />
              <div className="text-[#d2d2d2] text-[12px]">Sincronizando dados...</div>
            </div>
          </div>
        ) : userData ? (
          <ProfileContent
            user={userData}
            hotel="br"
            isFavorite={isFavorite(userData.name)}
            onToggleFavorite={() => toggleFavorite(userData.name)}
          />
        ) : (
          !loading && !error && (
            <div className="text-[#e0e0e0] text-[12px]">Nenhum usuário carregado.</div>
          )
        )}
      </div>
    </div>
  )
}