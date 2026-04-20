import React from "react"
import ProfileContent from "../profile/ProfileContent"
import Button from "../ui/Button"
import SearchInput from "../ui/SearchInput"
import SearchHistoryDropdown from "../ui/SearchHistoryDropdown"
import { useUserHistory } from "../../hooks/useSearchHistory"

// Chevron icon
function ChevronIcon({ expanded }) {
  return (
    <svg 
      className={`w-4 h-4 text-sky-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

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
        className="flex items-center justify-between mb-3 p-3 bg-white rounded-xl border border-sky-100 cursor-pointer hover:border-sky-200 transition-all"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0 flex-1 mr-2">
          <div className="text-sky-800 font-bold text-[14px]">Buscar Usuario</div>
          <div className="text-sky-500 text-[12px] leading-relaxed">
            Encontre usuarios, veja perfis e salve seus favoritos.
          </div>
        </div>
        <ChevronIcon expanded={expanded} />
      </div>

      {expanded && (
        <form onSubmit={(e) => { e.preventDefault(); handleSearch() }}>
          <div className="mb-3">
            <SearchInput
              inputRef={inputRef}
              value={nickQuery}
              onChange={(e) => setNickQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") setShowDropdown(false) }}
              onFocus={() => { if (hasDropdownItems) setShowDropdown(true) }}
              onBlur={() => setShowDropdown(false)}
              placeholder="Digite o nick do usuario"
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

          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Buscando..." : "Buscar usuario"}
            </Button>
            <Button variant="secondary" type="button" onClick={() => setNickQuery("")}>
              Limpar
            </Button>
          </div>
        </form>
      )}

      {error && (
        <div className="text-red-500 text-[12px] bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
          {error}
        </div>
      )}

      <div className="flex-1 min-h-0">
        {loadingData ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <svg className="animate-spin w-10 h-10 text-sky-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <div className="text-sky-500 text-[13px]">Sincronizando dados...</div>
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
            <div className="text-sky-500 text-[13px] text-center py-4">
              Nenhum usuario carregado.
            </div>
          )
        )}
      </div>
    </div>
  )
}
