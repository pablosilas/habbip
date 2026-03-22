import React from "react"
import { createPortal } from "react-dom"
import feiraIcon from "../assets/feira.png"
import usuarioIcon from "../assets/usuario.png"
import inventarioIcon from "../assets/inventario.png"
import bgPattern from "../assets/bg.png"
import bg2 from "../assets/bg_2.png"
import bg3 from "../assets/bg_3.png"

import HeaderCard from "../components/layout/HeaderCard"
import FairTab from "../components/tabs/fair/FairTab"
import UserTab from "../components/tabs/UserTab"
import InventoryTab from "../components/tabs/inventory/InventoryTab"
import ConsoleTab from "../components/layout/ConsoleTab"
import ConsoleCard from "../components/ui/ConsoleCard"
import ToastMessage from "../components/layout/ToastMessage"
import NotificationBell from "../components/ui/NotificationBell"

import LoginModal from "../components/modals/LoginModal"
import ProfileModal from "../components/modals/ProfileModal"
import InfoModal from "../components/modals/InfoModal"
import CloseJokeModal from "../components/modals/CloseJokeModal"

import { useFairSearch } from "../hooks/useFairSearch"
import { useUserSearch } from "../hooks/useUserSearch"
import { useAuth } from "../hooks/useAuth"
import { useCloseJoke } from "../hooks/useCloseJoke"
import { useInventory } from "../hooks/useInventory"
import { useCreditConverter } from "../hooks/useCreditConverter"

import { useWatchlist } from "../hooks/useWatchlist"
import { useMonitor } from "../hooks/useMonitor"

const BG_OPTIONS = [bg3, bg2, bgPattern]

function resolveBgKey(loggedUserName) {
  if (!loggedUserName?.trim()) return "habbodesk:anonymous:bg"
  return `habbodesk:${loggedUserName.trim().toLowerCase().replace(/\s+/g, "_")}:bg`
}

function loadBgIndex(loggedUserName) {
  try {
    const saved = localStorage.getItem(resolveBgKey(loggedUserName))
    const n = Number(saved)
    return Number.isFinite(n) && n >= 0 && n < BG_OPTIONS.length ? n : 0
  } catch {
    return 0
  }
}

function GearIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 5.754a2.246 2.246 0 1 1 0 4.492 2.246 2.246 0 0 1 0-4.492z" />
    </svg>
  )
}

/**
 * BgSelector
 *
 * Usa position:fixed calculado via getBoundingClientRect para escapar
 * do overflow:hidden do header do ConsoleCard.
 */
function BgSelector({ bgIndex, onBgChange, bgs }) {
  const [open, setOpen] = React.useState(false)
  const [dropdownPos, setDropdownPos] = React.useState({ top: 0, left: 0 })
  const btnRef = React.useRef(null)
  const dropdownRef = React.useRef(null)

  function handleToggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()

      setDropdownPos({
        top: rect.bottom + 6,
        left: rect.right - 110, // ajusta para alinhar melhor à direita do botão
      })
    }

    setOpen((v) => !v)
  }

  React.useEffect(() => {
    if (!open) return

    function handleClickOutside(e) {
      const clickedButton = btnRef.current?.contains(e.target)
      const clickedDropdown = dropdownRef.current?.contains(e.target)

      if (!clickedButton && !clickedDropdown) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const dropdown = open ? (
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: dropdownPos.top,
        left: dropdownPos.left,
        zIndex: 99999,
      }}
      className="bg-[#2a2306] border border-[#7B4001] rounded-[6px] shadow-[0_6px_20px_rgba(0,0,0,0.6)] p-2 flex flex-col gap-[6px]"
    >
      <div className="text-[9px] font-bold text-[#c9982a] uppercase tracking-wider text-center whitespace-nowrap">
        Fundo
      </div>

      <div className="flex gap-[6px] justify-center">
        {bgs.map((bg, i) => (
          <button
            key={i}
            type="button"
            title={`Fundo ${i + 1}`}
            onClick={() => {
              onBgChange(i)
              setOpen(false)
            }}
            className="w-6 h-6 rounded-sm border-2 overflow-hidden cursor-pointer transition-transform hover:scale-110 shrink-0"
            style={{
              backgroundImage: `url(${bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderColor: bgIndex === i ? "#ffca00" : "#555",
              boxShadow: bgIndex === i ? "0 0 0 1px #ffca00" : "none",
            }}
          />
        ))}
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        title="Escolher fundo"
        onClick={handleToggle}
        className="w-4 h-4 rounded-[2px] border border-[#9a6500] bg-[#ffca00] text-[#7c4e00] flex items-center justify-center cursor-pointer hover:brightness-110 transition-all"
        aria-label="Escolher fundo"
      >
        <GearIcon />
      </button>

      {typeof document !== "undefined" ? createPortal(dropdown, document.body) : null}
    </>
  )
}

export default function HabboDeskApp() {
  const [activeTab, setActiveTab] = React.useState("feira")
  const [profileModalOpen, setProfileModalOpen] = React.useState(false)
  const [infoModalOpen, setInfoModalOpen] = React.useState(false)

  const [fairExpanded, setFairExpanded] = React.useState(true)
  const [userExpanded, setUserExpanded] = React.useState(true)

  const [bgIndex, setBgIndex] = React.useState(() => loadBgIndex(null))

  const fair = useFairSearch()
  const user = useUserSearch()
  const closeJoke = useCloseJoke()
  const auth = useAuth(user.buildFullUserProfile)
  const inventory = useInventory(auth.loggedUser?.name)
  const converter = useCreditConverter(auth.loggedUser?.name)
  const watchlist = useWatchlist(auth.loggedUser?.name)
  const monitor = useMonitor({
    watchlist: watchlist.watchlist,
    updateWatchlistItem: watchlist.updateWatchlistItem,
    loggedUserName: auth.loggedUser?.name,
  })

  // Quando o usuário logado mudar (login/logout), carrega a preferência de bg dele
  React.useEffect(() => {
    setBgIndex(loadBgIndex(auth.loggedUser?.name ?? null))
  }, [auth.loggedUser?.name])

  function handleBgChange(index) {
    setBgIndex(index)
    try {
      localStorage.setItem(resolveBgKey(auth.loggedUser?.name ?? null), String(index))
    } catch { /* empty */ }
  }

  const processedResultsCount =
    activeTab === "feira"
      ? fair.results.length
      : activeTab === "usuario"
        ? user.searchedUser ? 1 : 0
        : inventory.totalUnits

  const cardStyle = React.useMemo(() => ({
    transform: closeJoke.upsideDown ? "rotate(180deg)" : "rotate(0deg)",
    transition: "transform 0.5s ease-in-out",
    height: "calc(var(--vh, 1dvh) * 96)",
    maxHeight: "calc(var(--vh, 1dvh) * 96)",
  }), [closeJoke.upsideDown])

  React.useEffect(() => {
    if (fair.results.length > 0) setFairExpanded(false)
  }, [fair.results])

  React.useEffect(() => {
    if (user.searchedUser) setUserExpanded(false)
  }, [user.searchedUser])

  React.useEffect(() => {
    function setVh() {
      const isMobile = window.innerWidth < 768
      if (isMobile) {
        const vh = window.innerHeight * 0.01
        document.documentElement.style.setProperty("--vh", `${vh}px`)
      } else {
        document.documentElement.style.removeProperty("--vh")
      }
    }
    setVh()
    window.addEventListener("resize", setVh)
    return () => window.removeEventListener("resize", setVh)
  }, [])

  return (
    <>
      <LoginModal
        open={auth.loginModalOpen}
        loading={auth.loginLoading}
        error={auth.loginError}
        onLogin={auth.handleLoginWithNick}
        onContinueAnonymous={auth.handleContinueAnonymous}
        onClose={() => auth.handleContinueAnonymous({ doNotAskAgain: false })}
      />
      <ProfileModal
        open={profileModalOpen}
        user={auth.loggedUser}
        onClose={() => setProfileModalOpen(false)}
        onLogout={() => auth.handleLogout(() => {
          setProfileModalOpen(false)
          fair.setMobiQuery("")
          fair.setResults([])
          fair.setError(null)
          user.setNickQuery("")
          user.setSearchedUser(null)
          user.setError(null)
          setFairExpanded(true)
          setUserExpanded(true)
        })}
      />
      <InfoModal
        open={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
      />
      <CloseJokeModal
        open={closeJoke.modalOpen}
        attempt={closeJoke.attempt}
        onClose={() => closeJoke.setModalOpen(false)}
        onConfirm={closeJoke.handleConfirmClose}
      />

      <div
        className="h-screen overflow-hidden flex items-center justify-center py-0 px-2 sm:p-2"
        style={{
          height: "calc(var(--vh, 1vh) * 100)",
          backgroundColor: "#dfe5e8",
          backgroundImage: `url(${BG_OPTIONS[bgIndex]})`,
          backgroundRepeat: "repeat",
        }}
      >
        <style>{`body { font-family: Verdana, Arial, sans-serif; }`}</style>

        <div className="relative w-full h-full flex items-center justify-center">
          <ConsoleCard
            title="Habbip"
            expand
            style={cardStyle}
            className="w-full max-w-[720px] h-full max-h-[96dvh] flex flex-col"
            innerClassName="flex flex-col overflow-hidden"
            headerRight={
              <div className="flex items-center gap-[6px]">
                <NotificationBell
                  notifications={monitor.notifications}
                  unreadCount={monitor.unreadCount}
                  watchlist={watchlist.watchlist}
                  isPolling={monitor.isPolling}
                  onMarkAllRead={monitor.markAllRead}
                  onClearNotifications={monitor.clearNotifications}
                  onRemoveNotification={monitor.removeNotification}
                  onRemoveFromWatchlist={watchlist.removeFromWatchlist}
                  onPollNow={monitor.pollNow}
                />
                <BgSelector
                  bgIndex={bgIndex}
                  onBgChange={handleBgChange}
                  bgs={BG_OPTIONS}
                />
                <span
                  onClick={closeJoke.handleCloseClick}
                  className="w-4 h-4 rounded-[2px] border border-[#9a6500] bg-[#ffca00] text-[#7c4e00] text-[10px] flex items-center justify-center cursor-pointer hover:brightness-110 transition-all"
                >
                  X
                </span>
              </div>
            }
            footer={
              <div className="px-15 sm:px-20 pt-5 pb-0">
                <div className="rounded-t-[4px] h-[80px] flex overflow-hidden">
                  <ConsoleTab
                    label="Feira Livre"
                    icon={
                      <img
                        src={feiraIcon}
                        className="w-6 h-6 image-rendering-pixel icon-dark"
                        alt="Feira"
                      />
                    }
                    active={activeTab === "feira"}
                    onClick={() => setActiveTab("feira")}
                  />
                  <ConsoleTab
                    label="Buscar Usuário"
                    icon={
                      <img
                        src={usuarioIcon}
                        className="w-6 h-6 image-rendering-pixel icon-dark"
                        alt="Usuário"
                      />
                    }
                    active={activeTab === "usuario"}
                    onClick={() => setActiveTab("usuario")}
                  />
                  <ConsoleTab
                    label="Meu Inventário"
                    icon={
                      <img
                        src={inventarioIcon}
                        className="w-7 h-6 image-rendering-pixel icon-dark"
                        alt="Meu Inventário"
                      />
                    }
                    active={activeTab === "inventario"}
                    onClick={() => setActiveTab("inventario")}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setInfoModalOpen(true)}
                  className="absolute bottom-4 right-6 w-6 h-6 rounded-full border border-[#9a6500] bg-[#ffca00] text-[#7c4e00] text-[11px] font-bold flex items-center justify-center cursor-pointer hover:brightness-105 transform transition duration-150 hover:scale-105 z-10"
                  style={{ boxShadow: "1px 1px 0 rgba(0,0,0,0.3)" }}
                >
                  ?
                </button>
              </div>
            }
          >
            {closeJoke.showToast && <ToastMessage count={closeJoke.attempt} />}

            <HeaderCard
              activeTab={activeTab}
              userData={auth.loggedUser}
              onOpenProfile={() => setProfileModalOpen(true)}
              onOpenLogin={() => auth.setLoginModalOpen(true)}
            />

            <div className="border-t border-dashed border-[#d7d7d7] opacity-80 my-2 shrink-0" />

            <div className="flex-1 min-h-0 pt-3 overflow-y-auto pr-1">
              {activeTab === "feira" ? (
                <FairTab
                  mobiQuery={fair.mobiQuery}
                  setMobiQuery={fair.setMobiQuery}
                  fairHotel={fair.hotel}
                  setFairHotel={fair.setHotel}
                  fairDays={fair.days}
                  setFairDays={fair.setDays}
                  onSearch={fair.handleSearch}
                  loading={fair.loading}
                  error={fair.error}
                  results={fair.results}
                  expanded={fairExpanded}
                  setExpanded={setFairExpanded}
                  creditRate={{ credits: converter.rateCredits, reais: converter.rateReais }}
                  onSetCreditRate={converter.setRate}
                  onAddToInventory={(item) => {
                    if (inventory.items.some(i => i.ClassName === item.ClassName)) {
                      inventory.removeItem(item.ClassName)
                    } else {
                      inventory.addToInventory(item)
                    }
                  }}
                  isInInventory={(className) => inventory.items.some(i => i.ClassName === className)}
                  isWatching={watchlist.isWatching}
                  onToggleWatchlist={watchlist.toggleWatchlist}
                />
              ) : activeTab === "usuario" ? (
                <UserTab
                  nickQuery={user.nickQuery}
                  setNickQuery={user.setNickQuery}
                  onSearch={user.handleSearch}
                  loading={user.loading}
                  error={user.error}
                  userData={user.searchedUser}
                  expanded={userExpanded}
                  setExpanded={setUserExpanded}
                  loggedUserName={auth.loggedUser?.name}
                />
              ) : (
                <InventoryTab
                  items={inventory.items}
                  query={inventory.query}
                  setQuery={inventory.setQuery}
                  hotel={inventory.hotel}
                  setHotel={inventory.setHotel}
                  loading={inventory.loading}
                  error={inventory.error}
                  searchResults={inventory.searchResults}
                  onSearch={inventory.handleSearch}
                  onAddItem={inventory.addToInventory}
                  onCancelSearch={inventory.cancelSearch}
                  onUpdateQty={inventory.updateQty}
                  onSetQty={inventory.setQty}
                  onRemove={inventory.removeItem}
                  onClear={inventory.clearInventory}
                  totalItems={inventory.totalItems}
                  totalUnits={inventory.totalUnits}
                  totalValue={inventory.totalValue}
                  creditRate={{ credits: converter.rateCredits, reais: converter.rateReais }}
                  onSetCreditRate={converter.setRate}
                  searchKey={inventory.searchKey}
                  loggedUserName={auth.loggedUser?.name}
                />
              )}
            </div>

            <div className="border-t border-dashed border-[#d7d7d7] opacity-80 my-3 shrink-0" />

            <div className="shrink-0 space-y-1 text-[12px] text-white leading-5">
              <div>{processedResultsCount} resultados processados</div>
            </div>
          </ConsoleCard>
        </div>
      </div>
    </>
  )
}