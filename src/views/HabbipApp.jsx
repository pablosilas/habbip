import React, { useCallback, useEffect, useRef } from "react"
import feiraIcon from "../assets/feira.png"
import usuarioIcon from "../assets/usuario.png"
import inventarioIcon from "../assets/inventario.png"

import HeaderCard from "../components/layout/HeaderCard"
import FairTab from "../components/tabs/fair/FairTab"
import UserTab from "../components/tabs/UserTab"
import InventoryTab from "../components/tabs/inventory/InventoryTab"
import ConsoleTab from "../components/layout/ConsoleTab"
import ConsoleCard from "../components/ui/ConsoleCard"
import NotificationBell from "../components/ui/NotificationBell"
import LocalDataBanner from "../components/ui/LocalDataBanner"

import LoginModal from "../components/modals/LoginModal"
import ProfileModal from "../components/modals/ProfileModal"
import InfoModal from "../components/modals/InfoModal"
import LogoutConfirmModal from "../components/modals/LogoutConfirmModal"

import { useFairSearch } from "../hooks/useFairSearch"
import { useUserSearch } from "../hooks/useUserSearch"
import { useAuth } from "../hooks/useAuth"
import { useInventory } from "../hooks/useInventory"
import { useCreditConverter } from "../hooks/useCreditConverter"
import { useWatchlist } from "../hooks/useWatchlist"
import { useMonitor } from "../hooks/useMonitor"
import { useServerSync } from "../hooks/useServerSync"
import { useSSE } from "../hooks/useSSE"

// Cloud SVG component for decoration
function CloudSVG({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 100 40" className={className} style={style} fill="white" opacity="0.6">
      <ellipse cx="30" cy="25" rx="20" ry="12" />
      <ellipse cx="50" cy="20" rx="25" ry="15" />
      <ellipse cx="75" cy="25" rx="18" ry="10" />
      <ellipse cx="60" cy="28" rx="15" ry="8" />
    </svg>
  )
}

// Info icon SVG
function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  )
}

// Settings icon SVG
function SettingsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

// Logout icon SVG
function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

// Arrow up icon
function ArrowUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 15l-6-6-6 6" />
    </svg>
  )
}

export default function HabboDeskApp() {
  const [activeTab, setActiveTab] = React.useState("feira")
  const [profileModalOpen, setProfileModalOpen] = React.useState(false)
  const [infoModalOpen, setInfoModalOpen] = React.useState(false)
  const [fairExpanded, setFairExpanded] = React.useState(true)
  const [userExpanded, setUserExpanded] = React.useState(true)
  const [inventoryExpanded, setInventoryExpanded] = React.useState(true)
  const [confirmingLogout, setConfirmingLogout] = React.useState(false)
  const [showScrollTop, setShowScrollTop] = React.useState(false)

  const mainScrollRef = React.useRef(null)

  // ── Auth ──────────────────────────────────────────────────────────────────
  const auth = useAuth()
  const isLoggedIn = auth.isLoggedIn

  // ── Sincronização com servidor ────────────────────────────────────────────
  const { serverData, loadingData, syncError, markDirty, updateLocalData } =
    useServerSync(isLoggedIn)

  // ── Hooks de dados ────────────────────────────────────────────────────────
  const inventory = useInventory(serverData, markDirty, isLoggedIn)
  const converter = useCreditConverter(serverData, markDirty, isLoggedIn)

  // ── Watchlist ─────────────────────────────────────────────────────────────
  const {
    watchlist: watchlistItems,
    isWatching,
    removeFromWatchlist,
    toggleWatchlist,
    updateWatchlistConfig,
    clearWatchlist,
    handlePriceChanged: watchlistHandlePriceChanged,
  } = useWatchlist(isLoggedIn)

  // ── Monitor (notificações) ────────────────────────────────────────────────
  const {
    notifications,
    unreadCount,
    addNotification,
    markAllRead,
    clearNotifications,
    removeNotification,
    removeNotificationsByClassName
  } = useMonitor({ serverData, markDirty, isLoggedIn })

  // ── Busca ─────────────────────────────────────────────────────────────────
  const fair = useFairSearch()
  const user = useUserSearch()

  // ── Refs estáveis para o SSE ──────────────────────────────────────────────
  const watchlistRef = useRef(watchlistItems)
  useEffect(() => { watchlistRef.current = watchlistItems }, [watchlistItems])

  const addNotificationRef = useRef(addNotification)
  useEffect(() => { addNotificationRef.current = addNotification }, [addNotification])

  // ── Handler SSE ───────────────────────────────────────────────────────────
  const handlePriceChanged = useCallback((event) => {
    if (!event?.className) return

    const normalizedClassName = event.className.toLowerCase()
    const currentSub = watchlistRef.current.find(
      (i) => i.ClassName?.toLowerCase() === normalizedClassName
    )

    watchlistHandlePriceChanged(event)

    if (!currentSub) return
    if (event.oldPrice == null) return

    const cfg = currentSub.alertConfig ?? { alertMode: "any" }
    let shouldNotify = cfg.alertMode === "any"

    if (cfg.alertMode === "price" && cfg.targetPrice != null) {
      const margin = Number(cfg.priceMargin ?? 0)
      const targetPrice = Number(cfg.targetPrice)
      const newPrice = Number(event.newPrice)

      if (!Number.isNaN(targetPrice) && !Number.isNaN(newPrice)) {
        shouldNotify = newPrice >= targetPrice - margin && newPrice <= targetPrice + margin
      } else {
        shouldNotify = false
      }
    }

    if (!shouldNotify) return

    addNotificationRef.current?.({
      id: `${event.className}-${Date.now()}`,
      className: event.className,
      furniName: event.furniName,
      oldPrice: event.oldPrice,
      newPrice: event.newPrice,
      diff: event.diff,
      pct: event.pct,
      direction: event.direction,
      hotel: event.hotel,
      read: false,
      createdAt: Date.now(),
    })
  }, [watchlistHandlePriceChanged])

  useSSE({
    isLoggedIn,
    onPriceChanged: handlePriceChanged,
  })

  const handleStopMonitoring = useCallback(
    async (className) => {
      removeNotificationsByClassName(className)
      await removeFromWatchlist(className)
    },
    [removeNotificationsByClassName, removeFromWatchlist]
  )

  // ── Logout — sem reabrir modal ────────────────────────────────────────────
  function doLogout() {
    auth.handleLogout(() => {
      setProfileModalOpen(false)
      setConfirmingLogout(false)
      fair.setMobiQuery("")
      fair.setResults([])
      fair.setError(null)
      user.setNickQuery("")
      user.setSearchedUser(null)
      user.setError(null)
      setFairExpanded(true)
      setUserExpanded(true)
      setActiveTab("feira")
    })
  }

  // ── Abre modal de login ────────────────────────────────────────────────────
  function openLogin(mode = "login") {
    auth.setAuthMode(mode)
    auth.setLoginModalOpen(true)
  }

  React.useEffect(() => {
    setFairExpanded(fair.results.length === 0)
  }, [activeTab, fair.results])

  React.useEffect(() => {
    if (user.searchedUser) setUserExpanded(false)
  }, [user.searchedUser])

  React.useEffect(() => {
    if (inventory.searchResults.length > 0) setInventoryExpanded(false)
  }, [inventory.searchResults])

  React.useEffect(() => {
    function setVh() {
      if (window.innerWidth < 768) {
        document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`)
      } else {
        document.documentElement.style.removeProperty("--vh")
      }
    }
    setVh()
    window.addEventListener("resize", setVh)
    return () => window.removeEventListener("resize", setVh)
  }, [])

  function handleOpenInFair(className) {
    fair.setMobiQuery(className)
    setActiveTab("feira")
    setFairExpanded(true)
    fair.refreshResults(className)
  }


  const processedResultsCount =
    activeTab === "feira" ? fair.results.length
      : activeTab === "usuario" ? (user.searchedUser ? 1 : 0)
        : inventory.totalUnits

  const cardStyle = {
    height: "calc(var(--vh, 1dvh) * 96)",
    maxHeight: "calc(var(--vh, 1dvh) * 96)",
  }

  return (
    <>
      <LoginModal
        open={auth.loginModalOpen}
        mode={auth.authMode}
        onSetMode={auth.setAuthMode}
        loading={auth.loginLoading}
        error={auth.loginError}
        onLogin={auth.handleLogin}
        onRegister={auth.handleRegister}
        onClose={() => auth.setLoginModalOpen(false)}
      />
      <ProfileModal
        open={profileModalOpen}
        user={auth.loggedUser}
        onClose={() => setProfileModalOpen(false)}
        onUserUpdated={(updatedUser) => auth.setLoggedUser(updatedUser)}
        onLogout={doLogout}
      />
      <InfoModal open={infoModalOpen} onClose={() => setInfoModalOpen(false)} />
      <LogoutConfirmModal
        open={confirmingLogout}
        onConfirm={doLogout}
        onCancel={() => setConfirmingLogout(false)}
      />

      {/* Main container with sky gradient background */}
      <div
        className="min-h-screen overflow-hidden flex items-center justify-center p-2 sm:p-4"
        style={{
          height: "calc(var(--vh, 1vh) * 100)",
          background: "linear-gradient(180deg, #87CEEB 0%, #B2EBF2 40%, #E0F7FA 100%)",
        }}
      >
        {/* Decorative clouds */}
        <CloudSVG className="absolute top-[5%] left-[5%] w-32 opacity-50 cloud-float" />
        <CloudSVG className="absolute top-[15%] right-[10%] w-40 opacity-40" style={{ animationDelay: '-5s' }} />
        <CloudSVG className="absolute top-[8%] left-[40%] w-24 opacity-30" style={{ animationDelay: '-10s' }} />
        <CloudSVG className="absolute bottom-[20%] left-[15%] w-28 opacity-25 hidden md:block" style={{ animationDelay: '-15s' }} />
        <CloudSVG className="absolute bottom-[30%] right-[5%] w-36 opacity-35 hidden md:block" style={{ animationDelay: '-8s' }} />

        <style>{`body { font-family: system-ui, -apple-system, sans-serif; }`}</style>

        <div className="relative w-full h-full flex items-center justify-center">
          <ConsoleCard
            title="Habbip"
            expand
            style={cardStyle}
            className="w-full max-w-[760px] h-full max-h-[96dvh] flex flex-col"
            innerClassName="flex flex-col overflow-hidden p-0"
            headerRight={
              <div className="flex items-center gap-2">
                {syncError && (
                  <span title={syncError} className="text-[10px] text-red-200 bg-red-500/20 px-2 py-1 rounded cursor-help">
                    Sync error
                  </span>
                )}
                {loadingData && (
                  <span className="text-[10px] text-sky-100 animate-pulse">
                    Carregando...
                  </span>
                )}
                {isLoggedIn && (
                  <NotificationBell
                    notifications={notifications}
                    unreadCount={unreadCount}
                    watchlist={watchlistItems}
                    isPolling={false}
                    onMarkAllRead={markAllRead}
                    onClearNotifications={clearNotifications}
                    onRemoveNotification={removeNotification}
                    onRemoveFromWatchlist={handleStopMonitoring}
                    onPollNow={() => { }}
                    onOpenInFair={handleOpenInFair}
                    onUpdateConfig={updateWatchlistConfig}
                    onClearWatchlist={clearWatchlist}
                  />
                )}
                <button
                  type="button"
                  onClick={() => setInfoModalOpen(true)}
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-all"
                  title="Informacoes"
                >
                  <InfoIcon />
                </button>
                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={() => setConfirmingLogout(true)}
                    className="w-8 h-8 rounded-lg bg-red-400/30 hover:bg-red-400/50 text-white flex items-center justify-center cursor-pointer transition-all"
                    title="Sair"
                  >
                    <LogoutIcon />
                  </button>
                )}
              </div>
            }
            footer={
              <div className="pt-0">
                <div className="flex overflow-hidden">
                  <ConsoleTab
                    label="Feira Livre"
                    icon={<img src={feiraIcon} className="w-5 h-5 pixel-render" alt="Feira" />}
                    active={activeTab === "feira"}
                    onClick={() => setActiveTab("feira")}
                  />
                  <ConsoleTab
                    label="Buscar Usuario"
                    icon={<img src={usuarioIcon} className="w-5 h-5 pixel-render" alt="Usuario" />}
                    active={activeTab === "usuario"}
                    onClick={() => setActiveTab("usuario")}
                  />
                  <ConsoleTab
                    label="Meu Inventario"
                    icon={<img src={inventarioIcon} className="w-6 h-5 pixel-render" alt="Inventario" />}
                    active={activeTab === "inventario"}
                    onClick={() => setActiveTab("inventario")}
                  />
                </div>
              </div>
            }
          >
            <div className="flex flex-col h-full">
              <HeaderCard
                activeTab={activeTab}
                userData={auth.loggedUser}
                onOpenProfile={() => setProfileModalOpen(true)}
                onOpenLogin={() => openLogin("login")}
              />

              <div className="border-t border-sky-200/50 my-3 shrink-0" />

              <div
                ref={mainScrollRef}
                data-scroll="main"
                className="flex-1 min-h-0 overflow-y-auto pr-1"
                onScroll={(e) => setShowScrollTop(e.currentTarget.scrollTop > 300)}
              >
                {/* Banner de dados locais — aparece só para anônimos com inventário */}
                {!isLoggedIn && inventory.hasAnonData && (
                  <LocalDataBanner
                    hasLocalData={inventory.hasAnonData}
                    onLogin={() => openLogin("register")}
                  />
                )}

                <div className={activeTab === "feira" ? "" : "hidden"}>
                  <FairTab
                    mobiQuery={fair.mobiQuery}
                    setMobiQuery={fair.setMobiQuery}
                    fairHotel={fair.hotel}
                    setFairHotel={fair.setHotel}
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
                    isWatching={isLoggedIn ? isWatching : () => false}
                    onToggleWatchlist={(item) => {
                      if (item?.__requireLogin) {
                        openLogin("login")
                        return
                      }
                      if (!isLoggedIn) { openLogin("login"); return }
                      if (isWatching(item.ClassName)) {
                        handleStopMonitoring(item.ClassName)
                      } else {
                        const freshItem = fair.results.find((r) => r.ClassName === item.ClassName) ?? item
                        toggleWatchlist(freshItem)
                      }
                    }}
                    serverData={serverData}
                    markDirty={markDirty}
                    isLoggedIn={isLoggedIn}
                    updateLocalData={updateLocalData}
                    isStale={fair.isStale}
                    onRefresh={() => fair.refreshResults()}
                    onCategoryResults={(items) => {
                      fair.setResults(items)
                      fair.setIsStale(false)
                      setFairExpanded(false)
                    }}
                    onCategoryReset={() => {
                      fair.setResults([])
                      fair.setError("")
                    }}
                  />
                </div>

                <div className={activeTab === "usuario" ? "" : "hidden"}>
                  <UserTab
                    nickQuery={user.nickQuery}
                    setNickQuery={user.setNickQuery}
                    onSearch={user.handleSearch}
                    loading={user.loading}
                    error={user.error}
                    userData={user.searchedUser}
                    expanded={userExpanded}
                    setExpanded={setUserExpanded}
                    serverData={serverData}
                    markDirty={markDirty}
                    isLoggedIn={isLoggedIn}
                    updateLocalData={updateLocalData}
                    loadingData={loadingData}
                  />
                </div>

                <div className={activeTab === "inventario" ? "" : "hidden"}>
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
                    expanded={inventoryExpanded}
                    setExpanded={setInventoryExpanded}
                    serverData={serverData}
                    markDirty={markDirty}
                    isLoggedIn={isLoggedIn}
                    updateLocalData={updateLocalData}
                    loadingData={loadingData}
                    isAnonymous={!isLoggedIn}
                    onLoginToSync={() => openLogin("register")}
                  />
                </div>
              </div>

              <div className="border-t border-sky-200/50 my-3 shrink-0" />
              
              {/* Status bar */}
              <div className="shrink-0 flex items-center justify-between text-[12px] text-sky-700 bg-sky-50/50 -mx-4 -mb-4 px-4 py-2 rounded-b-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  <span>{processedResultsCount} resultados</span>
                </div>
                {showScrollTop && (
                  <button
                    type="button"
                    onClick={() => mainScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
                    title="Voltar ao topo"
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-sky-100 hover:bg-sky-200 text-sky-600 cursor-pointer transition-all"
                  >
                    <ArrowUpIcon />
                    <span className="text-[11px] hidden sm:inline">Topo</span>
                  </button>
                )}
              </div>
            </div>
          </ConsoleCard>
        </div>
      </div>
    </>
  )
}
