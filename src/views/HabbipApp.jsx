import React from "react"
import feiraIcon from "../assets/feira.png"
import usuarioIcon from "../assets/usuario.png"
import bgPattern from "../assets/bg.png"
import bg2 from "../assets/bg_2.png"
import bg3 from "../assets/bg_3.png"

import HeaderCard from "../components/layout/HeaderCard"
import FairTab from "../components/tabs/fair/FairTab"
import UserTab from "../components/tabs/UserTab"
import ConsoleTab from "../components/layout/ConsoleTab"
import ConsoleCard from "../components/ui/ConsoleCard"
import ToastMessage from "../components/layout/ToastMessage"

import LoginModal from "../components/modals/LoginModal"
import ProfileModal from "../components/modals/ProfileModal"
import InfoModal from "../components/modals/InfoModal"
import CloseJokeModal from "../components/modals/CloseJokeModal"

import { useFairSearch } from "../hooks/useFairSearch"
import { useUserSearch } from "../hooks/useUserSearch"
import { useAuth } from "../hooks/useAuth"
import { useCloseJoke } from "../hooks/useCloseJoke"

export default function HabbipApp() {
  const [activeTab, setActiveTab] = React.useState("feira")
  const [profileModalOpen, setProfileModalOpen] = React.useState(false)
  const [infoModalOpen, setInfoModalOpen] = React.useState(false)

  const [fairExpanded, setFairExpanded] = React.useState(true)
  const [userExpanded, setUserExpanded] = React.useState(true)

  const BG_OPTIONS = [bgPattern, bg2, bg3]
  const [bgIndex, setBgIndex] = React.useState(() => {
    const saved = localStorage.getItem("habbip:bg")
    const n = Number(saved)
    return Number.isFinite(n) && n >= 0 && n < 3 ? n : 0
  })

  function handleBgChange(index) {
    setBgIndex(index)
    localStorage.setItem("habbip:bg", String(index))
  }

  const fair = useFairSearch()
  const user = useUserSearch()
  const closeJoke = useCloseJoke()
  const auth = useAuth(user.buildFullUserProfile)

  const processedResultsCount =
    activeTab === "feira" ? fair.results.length : user.searchedUser ? 1 : 0

  const cardStyle = React.useMemo(() => ({
    transform: closeJoke.upsideDown ? "rotate(180deg)" : "rotate(0deg)",
    transition: "transform 0.5s ease-in-out",
  }), [closeJoke.upsideDown])

  React.useEffect(() => {
    if (fair.results.length > 0) setFairExpanded(false)
  }, [fair.results])

  React.useEffect(() => {
    if (user.searchedUser) setUserExpanded(false)
  }, [user.searchedUser])

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
        className="h-screen overflow-hidden flex items-center justify-center p-2"
        style={{
          backgroundColor: "#dfe5e8",
          backgroundImage: `url(${BG_OPTIONS[bgIndex]})`,
          backgroundRepeat: "repeat",
        }}
      >
        <style>{`body { font-family: Verdana, Arial, sans-serif; }`}</style>

        <div className="relative w-full h-full flex items-center justify-center">
          {/* Seletor de fundo */}
          <div className="absolute top-3 right-3 flex gap-[6px] z-10">
            {BG_OPTIONS.map((bg, i) => (
              <button
                key={i}
                type="button"
                title={`Fundo ${i + 1}`}
                onClick={() => handleBgChange(i)}
                className="w-6 h-6 rounded-sm border-2 overflow-hidden cursor-pointer transition-transform hover:scale-110"
                style={{
                  backgroundImage: `url(${bg})`,
                  backgroundSize: "cover",
                  borderColor: bgIndex === i ? "#ffca00" : "#555",
                  boxShadow: bgIndex === i ? "0 0 0 1px #ffca00" : "none",
                }}
              />
            ))}
          </div>
          <ConsoleCard
            title="Habbo Console"
            expand
            style={cardStyle}
            className="w-full max-w-[720px] h-full max-h-[96vh] flex flex-col"
            innerClassName="flex flex-col overflow-hidden"
            headerRight={
              <span
                onClick={closeJoke.handleCloseClick}
                className="w-4 h-4 rounded-[2px] border border-[#9a6500] bg-[#ffca00] text-[#7c4e00] text-[10px] flex items-center justify-center cursor-pointer"
              >
                X
              </span>
            }
            footer={
              <div className="px-20 pt-5 pb-0">
                <div className="rounded-t-[4px] h-[75px] flex overflow-hidden">
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
                </div>
                <button
                  type="button"
                  onClick={() => setInfoModalOpen(true)}
                  className="absolute bottom-4 right-6 w-6 h-6 rounded-full border border-[#9a6500] bg-[#ffca00] text-[#7c4e00] text-[11px] font-bold flex items-center justify-center cursor-pointer hover:brightness-110 z-10"
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
                />
              ) : (
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