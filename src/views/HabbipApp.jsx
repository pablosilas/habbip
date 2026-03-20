import React from "react";
import feiraIcon from "../assets/feira.png";
import usuarioIcon from "../assets/usuario.png";
import bgPattern from "../assets/bg.png";

import HeaderCard from "../components/layout/HeaderCard";
import FairTab from "../components/tabs/fair/FairTab";
import UserTab from "../components/tabs/UserTab";
import ConsoleTab from "../components/layout/ConsoleTab";
import LoginModal from "../components/modals/LoginModal";
import ProfileModal from "../components/modals/ProfileModal";

import {
  fetchMarketHistory,
  fetchUserByName,
  fetchUserProfileById,
} from "../services/habboApi";
import InfoModal from "../components/modals/InfoModal";
import CloseJokeModal from "../components/modals/CloseJokeModal";
import ToastMessage from "../components/layout/ToastMessage";
import ConsoleCard from "../components/ui/ConsoleCard";

const STORAGE_KEYS = {
  loggedUser: "habbip_logged_user",
  anonymousSkipLogin: "habbip_anonymous_skip_login",
};

export default function HabbipApp() {
  const [activeTab, setActiveTab] = React.useState("feira");

  const [mobiQuery, setMobiQuery] = React.useState("");
  const [fairHotel, setFairHotel] = React.useState("br");
  const [fairDays, setFairDays] = React.useState("all");
  const [fairLoading, setFairLoading] = React.useState(false);
  const [fairError, setFairError] = React.useState("");
  const [fairResults, setFairResults] = React.useState([]);

  const [nickQuery, setNickQuery] = React.useState("");
  const [userLoading, setUserLoading] = React.useState(false);
  const [userError, setUserError] = React.useState("");
  const [searchedUser, setSearchedUser] = React.useState(null);

  const [loggedUser, setLoggedUser] = React.useState(null);
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);
  const [profileModalOpen, setProfileModalOpen] = React.useState(false);
  const [infoModalOpen, setInfoModalOpen] = React.useState(false);
  const [loginLoading, setLoginLoading] = React.useState(false);
  const [loginError, setLoginError] = React.useState("");

  const [closeAttempt, setCloseAttempt] = React.useState(0)
  const [closeModalOpen, setCloseModalOpen] = React.useState(false)
  const [upsideDown, setUpsideDown] = React.useState(false)
  const [showToast, setShowToast] = React.useState(false)

  React.useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.loggedUser);
    const anonymousSkipLogin = localStorage.getItem(
      STORAGE_KEYS.anonymousSkipLogin,
    );

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setLoggedUser(parsedUser);
      } catch {
        localStorage.removeItem(STORAGE_KEYS.loggedUser);
        setLoginModalOpen(true);
      }
      return;
    }

    if (anonymousSkipLogin === "true") {
      setLoginModalOpen(false);
      return;
    }

    setLoginModalOpen(true);
  }, []);

  React.useEffect(() => {
    if (!mobiQuery.trim()) {
      setFairResults([]);
      setFairError("");
    }
  }, [mobiQuery]);

  React.useEffect(() => {
    if (!nickQuery.trim()) {
      setSearchedUser(null);
      setUserError("");
    }
  }, [nickQuery]);

  const handleSearchFair = async () => {
    if (!mobiQuery.trim()) {
      setFairError("Digite um nome para pesquisar o mobi.");
      setFairResults([]);
      return;
    }

    setFairLoading(true);
    setFairError("");
    setFairResults([]);

    try {
      const data = await fetchMarketHistory({
        name: mobiQuery,
        hotel: fairHotel,
        days: fairDays,
      });

      const filtered = (Array.isArray(data) ? data : []).filter((item) => {
        const history = item?.marketData?.history;
        const averagePrice = item?.marketData?.averagePrice;

        if (!Array.isArray(history) || history.length === 0) return false;

        const hasValidHistory = history.some((entry) => entry?.[0] > 0);
        const hasAverage = averagePrice && averagePrice > 0;

        return hasValidHistory || hasAverage;
      });

      setFairResults(filtered);
    } catch (error) {
      setFairError(error.message || "Erro ao consultar a feira.");
    } finally {
      setFairLoading(false);
    }
  };

  const buildFullUserProfile = async (nick) => {
    const basicUser = await fetchUserByName(nick);

    if (!basicUser?.uniqueId) {
      throw new Error("Usuário não encontrado.");
    }

    try {
      const profileData = await fetchUserProfileById(basicUser.uniqueId);

      return {
        ...basicUser,
        ...profileData,
      };
    } catch {
      return basicUser;
    }
  };

  const handleSearchUser = async () => {
    if (!nickQuery.trim()) {
      setUserError("Digite o nick do usuário.");
      setSearchedUser(null);
      return;
    }

    setUserLoading(true);
    setUserError("");
    setSearchedUser(null);

    try {
      const fullUser = await buildFullUserProfile(nickQuery.trim());
      setSearchedUser(fullUser);
    } catch (error) {
      setUserError(error.message || "Erro ao buscar usuário.");
    } finally {
      setUserLoading(false);
    }
  };

  const handleLoginWithNick = async (nick) => {
    setLoginLoading(true);
    setLoginError("");

    try {
      const fullUser = await buildFullUserProfile(nick);

      setLoggedUser(fullUser);
      localStorage.setItem(STORAGE_KEYS.loggedUser, JSON.stringify(fullUser));
      localStorage.removeItem(STORAGE_KEYS.anonymousSkipLogin);
      setLoginModalOpen(false);
    } catch (error) {
      setLoginError(error.message || "Não foi possível entrar com esse nick.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleContinueAnonymous = ({ doNotAskAgain }) => {
    setLoggedUser(null);

    if (doNotAskAgain) {
      localStorage.setItem(STORAGE_KEYS.anonymousSkipLogin, "true");
    } else {
      localStorage.removeItem(STORAGE_KEYS.anonymousSkipLogin);
    }

    localStorage.removeItem(STORAGE_KEYS.loggedUser);
    setLoginError("");
    setLoginModalOpen(false);
  };

  const handleLogout = () => {
    setLoggedUser(null);
    localStorage.removeItem(STORAGE_KEYS.loggedUser);
    localStorage.removeItem(STORAGE_KEYS.anonymousSkipLogin);
    setProfileModalOpen(false);
    setLoginModalOpen(true);
  };

  const processedResultsCount =
    activeTab === "feira" ? fairResults.length : searchedUser ? 1 : 0;

  const handleCloseClick = () => {
    setCloseAttempt((v) => v + 1)
    setCloseModalOpen(true)
  }

  const handleConfirmClose = () => {
    setCloseModalOpen(false)
    setUpsideDown(true)
    setTimeout(() => {
      setUpsideDown(false)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 4000)
    }, 1000)
  }
  return (
    <>
      <LoginModal
        open={loginModalOpen}
        loading={loginLoading}
        error={loginError}
        onLogin={handleLoginWithNick}
        onContinueAnonymous={handleContinueAnonymous}
        onClose={() => handleContinueAnonymous({ doNotAskAgain: false })}
      />
      <ProfileModal
        open={profileModalOpen}
        user={loggedUser}
        onClose={() => setProfileModalOpen(false)}
        onLogout={handleLogout}
      />
      <InfoModal
        open={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
      />
      <CloseJokeModal
        open={closeModalOpen}
        attempt={closeAttempt}
        onClose={() => setCloseModalOpen(false)}
        onConfirm={handleConfirmClose}
      />

      <div
        className="h-screen overflow-hidden flex items-center justify-center p-2"
        style={{
          backgroundColor: "#dfe5e8",
          backgroundImage: `url(${bgPattern})`,
          backgroundRepeat: "repeat",
        }}
      >
        <style>{`body { font-family: Verdana, Arial, sans-serif; }`}</style>

        <div className="relative w-full h-full flex items-center justify-center">
          <ConsoleCard
            title="Habbip"
            expand
            style={{
              transform: upsideDown ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.5s ease-in-out",
            }}
            className="w-full max-w-[720px] h-full max-h-[96vh] flex flex-col"
            innerClassName="flex flex-col overflow-hidden"
            headerRight={
              <span
                onClick={handleCloseClick}
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
            {showToast && <ToastMessage count={closeAttempt} />}

            <HeaderCard
              activeTab={activeTab}
              userData={loggedUser}
              onOpenProfile={() => setProfileModalOpen(true)}
              onOpenLogin={() => setLoginModalOpen(true)}
            />

            <div className="border-t border-dashed border-[#d7d7d7] opacity-80 my-2 shrink-0" />

            <div className="flex-1 min-h-0 pt-3 overflow-y-auto pr-1">
              {activeTab === "feira" ? (
                <FairTab
                  mobiQuery={mobiQuery}
                  setMobiQuery={setMobiQuery}
                  fairHotel={fairHotel}
                  setFairHotel={setFairHotel}
                  fairDays={fairDays}
                  setFairDays={setFairDays}
                  onSearch={handleSearchFair}
                  loading={fairLoading}
                  error={fairError}
                  results={fairResults}
                />
              ) : (
                <UserTab
                  nickQuery={nickQuery}
                  setNickQuery={setNickQuery}
                  onSearch={handleSearchUser}
                  loading={userLoading}
                  error={userError}
                  userData={searchedUser}
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
  );
}
