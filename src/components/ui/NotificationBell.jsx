import React from "react";
import { createPortal } from "react-dom";
import coinIcon from "../../assets/coin.png";
import closeIcon from "../../assets/close.png";
import alertIcon from "../../assets/alert.png";
import watchIcon from "../../assets/watch.png";
import configIcon from "../../assets/config.png";
import FurniThumb from "./FurniThumb";
import AlertConfigModal from "../modals/AlertConfigModal";

function timeAgo(ms) {
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60000);
  const h = Math.floor(min / 60);
  const d = Math.floor(h / 24);

  if (min < 1) return "agora";
  if (min < 60) return `${min}min`;
  if (h < 24) return `${h}h`;
  return `${d}d`;
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[22px] min-w-fit px-2 rounded-[4px] text-[10px] font-bold leading-none flex items-center justify-center gap-[4px] whitespace-nowrap cursor-pointer transition-all hover:brightness-110 active:translate-y-[1px]"
      style={{
        background: active ? "#bdbdbd" : "#7A7A7A",
        color: active ? "#2d2d2d" : "#ececec",
        borderTop: "1.5px solid #000",
        borderLeft: "1.5px solid #000",
        borderRight: "1.5px solid #000",
        borderBottom: "2.5px solid #000",
        boxShadow: "inset 0 0 0 1px #8c8c8c",
      }}
    >
      {children}
    </button>
  );
}

function TopIconButton({ onClick, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex items-center justify-center cursor-pointer transition-all hover:brightness-110 active:translate-y-[1px]"
      style={{
        width: 18,
        height: 18,
        borderRadius: 4,
        background: "#7A7A7A",
        borderTop: "1.5px solid #000",
        borderLeft: "1.5px solid #000",
        borderRight: "1.5px solid #000",
        borderBottom: "2.5px solid #000",
        boxShadow: "inset 0 0 0 1px #8c8c8c",
      }}
      aria-label={title}
    >
      {children}
    </button>
  );
}

function CloseButton({ onClick, title }) {
  return (
    <img
      src={closeIcon}
      alt={title}
      title={title}
      onClick={onClick}
      className="shrink-0 w-4 h-4 object-contain cursor-pointer transition-all hover:brightness-110 active:translate-y-[1px]"
    />
  );
}

function NotifItem({ notif, onRemove, onOpenInFair, setOpen }) {
  const isUp = notif.direction === "up";

  return (
    <div
      className={[
        "flex items-start gap-2 px-3 py-[10px] border-b border-[#3f3f3f]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        !notif.read ? "bg-[rgba(255,255,255,0.04)]" : "bg-transparent",
        "hover:bg-[rgba(255,255,255,0.06)] transition-colors",
      ].join(" ")}
    >
      <div className="shrink-0 mt-[2px]">
        <FurniThumb classname={notif.className} size="md" angle="2_0" />
      </div>

      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => {
          onOpenInFair?.(notif.className);
          setOpen(false);
        }}
      >
        <div className="text-[11px] font-bold text-white truncate">
          {notif.furniName}
        </div>

        <div className="flex items-center gap-1 mt-[5px] flex-wrap">
          <span
            className={`text-[12px] font-bold ${
              isUp ? "text-[#7CFC8A]" : "text-[#FF8A8A]"
            }`}
          >
            {isUp ? "▲" : "▼"} {isUp ? "+" : ""}
            {notif.pct}%
          </span>

          <div className="flex items-center gap-[2px]">
            <img src={coinIcon} alt="" className="w-3 h-3" />
            <span className="text-[10px] text-[#d7d7d7]">{notif.oldPrice}</span>
          </div>

          <span className="text-[10px] text-[#bdbdbd]">→</span>

          <div className="flex items-center gap-[2px]">
            <img src={coinIcon} alt="" className="w-3 h-3" />
            <span
              className={`text-[11px] font-bold ${
                isUp ? "text-[#7CFC8A]" : "text-[#FF8A8A]"
              }`}
            >
              {notif.newPrice}
            </span>
          </div>
        </div>

        <div className="text-[9px] text-[#d0d0d0] mt-[8px]">
          {timeAgo(notif.createdAt) === "agora"
            ? "agora"
            : `${timeAgo(notif.createdAt)} atrás`}
        </div>
      </div>

      <div className="flex items-center self-stretch">
        <CloseButton
          onClick={() => onRemove(notif.id)}
          title="Excluir alerta"
        />
      </div>
    </div>
  );
}

function NotifsList({
  notifications,
  onRemove,
  onOpenInFair,
  setOpen,
  expanded,
  setExpanded,
}) {
  if (notifications.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-[11px] text-[#f1f1f1]">
        Nenhum alerta ainda.
        <br />
        <span className="text-[10px] text-[#d0d0d0]">
          Monitore um mobi para receber alertas de preço.
        </span>
      </div>
    );
  }

  const LIMIT = 3;
  const notificationsToShow = expanded
    ? notifications
    : notifications.slice(0, LIMIT);
  const hasMore = notifications.length > LIMIT;

  return (
    <div>
      {notificationsToShow.map((n) => (
        <NotifItem
          key={n.id}
          notif={n}
          onRemove={onRemove}
          onOpenInFair={onOpenInFair}
          setOpen={setOpen}
        />
      ))}
      {hasMore && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full px-3 py-[10px] text-[11px] font-bold text-[#f1f1f1] hover:bg-[rgba(255,255,255,0.04)] transition-colors text-center border-t border-[#3f3f3f]"
        >
          ver mais ({notifications.length - LIMIT})
        </button>
      )}
      {expanded && hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="w-full px-3 py-[10px] text-[11px] font-bold text-[#888] hover:bg-[rgba(255,255,255,0.04)] transition-colors text-center border-t border-[#3f3f3f]"
        >
          ver menos
        </button>
      )}
    </div>
  );
}

function WatchlistItem({
  item,
  onRemove,
  onOpenInFair,
  setOpen,
  onUpdateConfig,
}) {
  const [configModalOpen, setConfigModalOpen] = React.useState(false);
  const history = item?.marketData?.history || [];
  const currentPrice =
    item?.marketData?.currentPrice ??
    (history.length > 0 ? history[history.length - 1]?.[0] : null) ??
    item?.marketData?.averagePrice ??
    item.basePrice ??
    "-";

  const diff =
    typeof currentPrice === "number" && item.basePrice
      ? currentPrice - item.basePrice
      : null;

  function handleSaveConfig(newConfig) {
    onUpdateConfig?.(item.ClassName, newConfig);
    setConfigModalOpen(false);
  }

  return (
    <div className="flex items-center gap-2 px-3 py-[8px] border-b border-[#3f3f3f] hover:bg-[rgba(255,255,255,0.06)] transition-colors">
      <div className="shrink-0">
        <FurniThumb classname={item.ClassName} size="md" angle="2_0" />
      </div>
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => {
          onOpenInFair?.(item.ClassName);
          setOpen(false);
        }}
      >
        <div className="text-[11px] font-bold text-white truncate">
          {item.FurniName}
        </div>

        <div className="flex items-center gap-1 mt-[4px]">
          <img src={coinIcon} alt="" className="w-3 h-3" />
          <span className="text-[11px] text-[#ffe07a] font-bold">
            {typeof currentPrice === "number"
              ? currentPrice.toLocaleString("pt-BR")
              : currentPrice}
          </span>

          {diff !== null && diff !== 0 && (
            <span
              className={`text-[9px] font-bold ${
                diff > 0 ? "text-[#7CFC8A]" : "text-[#FF8A8A]"
              }`}
            >
              {diff > 0 ? "+" : ""}
              {diff}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 self-stretch">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setConfigModalOpen(true);
          }}
          title="Configurar alertas"
          className="flex items-center justify-center cursor-pointer hover:brightness-110 active:translate-y-[1px] transition-all"
          style={{
            width: 18,
            height: 18,
            fontSize: "10px",
          }}
        >
          <img
            src={configIcon}
            alt="Configurar"
            className="w-[14px] h-[14px] object-contain"
          />
        </button>
        <CloseButton
          onClick={() => onRemove(item.ClassName)}
          title="Parar de monitorar"
        />
      </div>

      {typeof document !== "undefined" && (
        <AlertConfigModal
          open={configModalOpen}
          item={item}
          config={item.alertConfig || { alertMode: "any", targetPrice: null }}
          onSave={handleSaveConfig}
          onClose={() => setConfigModalOpen(false)}
        />
      )}
    </div>
  );
}

function WatchlistList({
  watchlist,
  onRemove,
  onOpenInFair,
  setOpen,
  onUpdateConfig,
  expanded,
  setExpanded,
}) {
  if (watchlist.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-[11px] text-[#f1f1f1]">
        Nenhum mobi monitorado.
        <br />
        <span className="text-[10px] text-[#d0d0d0]">
          Clique no ícone 👁 em um resultado para monitorar.
        </span>
      </div>
    );
  }

  const LIMIT = 4;
  const reversedWatchlist = [...watchlist];
  const watchlistToShow = expanded
    ? reversedWatchlist
    : reversedWatchlist.slice(0, LIMIT);
  const hasMore = watchlist.length > LIMIT;

  return (
    <div>
      {watchlistToShow.map((item) => (
        <WatchlistItem
          key={item.ClassName}
          item={item}
          onRemove={onRemove}
          onOpenInFair={onOpenInFair}
          setOpen={setOpen}
          onUpdateConfig={onUpdateConfig}
        />
      ))}
      {hasMore && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full px-3 py-[10px] text-[11px] font-bold text-[#f1f1f1] hover:bg-[rgba(255,255,255,0.04)] transition-colors text-center border-t border-[#3f3f3f]"
        >
          ver mais ({watchlist.length - LIMIT})
        </button>
      )}
      {expanded && hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="w-full px-3 py-[10px] text-[11px] font-bold text-[#888] hover:bg-[rgba(255,255,255,0.04)] transition-colors text-center border-t border-[#3f3f3f]"
        >
          ver menos
        </button>
      )}
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <span className="text-[12px] leading-none text-white translate-y-[0px]">
      ↻
    </span>
  );
}

function CloseIcon() {
  return (
    <span
      className="block w-0 h-0 translate-y-[1px]"
      style={{
        borderLeft: "4px solid transparent",
        borderRight: "4px solid transparent",
        borderTop: "6px solid #ffffff",
      }}
    />
  );
}

export default function NotificationBell({
  bellRef,
  notifications = [],
  unreadCount = 0,
  watchlist = [],
  isPolling = false,
  onMarkAllRead,
  onClearNotifications,
  onRemoveNotification,
  onRemoveFromWatchlist,
  onPollNow,
  onOpenInFair,
  onUpdateConfig,
  onClearWatchlist,
}) {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState("notifs");
  const [dropdownPos, setDropdownPos] = React.useState({ top: 0, right: 0 });
  const [expandedNotifs, setExpandedNotifs] = React.useState(false);
  const [expandedWatchlist, setExpandedWatchlist] = React.useState(false);
  const internalRef = React.useRef(null);
  const panelRef = React.useRef(null);

  const btnRef = bellRef || internalRef;

  function handleToggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 640;
      const PANEL_WIDTH = isMobile
        ? Math.min(280, window.innerWidth - 16)
        : 360;
      const MARGIN = 8;

      let right = window.innerWidth - rect.right;

      const leftEdge = rect.right - PANEL_WIDTH;
      if (leftEdge < MARGIN) {
        right = window.innerWidth - PANEL_WIDTH - MARGIN;
      }

      if (right < MARGIN) right = MARGIN;

      setDropdownPos({
        top: rect.bottom + 6,
        right,
        width: PANEL_WIDTH,
      });
    }

    if (!open && unreadCount > 0) onMarkAllRead?.();
    setOpen((v) => !v);
  }

  React.useEffect(() => {
    if (!open) return;

    function handleClickOutside(e) {
      if (
        !btnRef.current?.contains(e.target) &&
        !panelRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, btnRef]);

  // Reset expanded states when switching tabs
  React.useEffect(() => {
    if (tab === "notifs") {
      setExpandedWatchlist(false);
    } else {
      setExpandedNotifs(false);
    }
  }, [tab]);

  const currentCount =
    tab === "notifs" ? notifications.length : watchlist.length;

  const panel = open ? (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        top: dropdownPos.top,
        right: dropdownPos.right,
        zIndex: 99999,
        width: dropdownPos.width ?? 360,
      }}
      className={[
        "relative overflow-hidden rounded-[14px]",
        "border-[2px] border-[#7A7A7A]",
        "outline outline-[1px] outline-[#000000]",
        "bg-[#4D4D4D]",
        "shadow-[inset_1px_1px_0_#cfcfcf,inset_-1px_-1px_0_#2f2f2f,0_8px_18px_rgba(0,0,0,0.45)]",
      ].join(" ")}
    >
      {/* Header */}
      <div
        className={[
          "relative h-[32px] px-3 pr-[46px] flex items-center",
          "bg-[#7A7A7A]",
        ].join(" ")}
      >
        <div className="flex items-center gap-1 min-w-0">
          {/* Aba Alertas */}
          <TabBtn active={tab === "notifs"} onClick={() => setTab("notifs")}>
            <img
              src={alertIcon}
              alt=""
              className="w-[10px] h-[10px] object-contain"
            />
            Alertas ({notifications.length > 9 ? "9+" : notifications.length})
          </TabBtn>

          {/* Aba Monitorando */}
          <TabBtn
            active={tab === "watchlist"}
            onClick={() => setTab("watchlist")}
          >
            <img
              src={watchIcon}
              alt=""
              className="w-[10px] h-[10px] object-contain"
            />
            Monitorando ({watchlist.length > 9 ? "9+" : watchlist.length})
          </TabBtn>
        </div>

        {/* Top-right buttons */}
        <div className="absolute right-[4px] top-0 bottom-0 flex items-center gap-[3px]">
          {isPolling && (
            <span className="text-[9px] text-[#ffe07a] animate-pulse">
              verificando...
            </span>
          )}
          <TopIconButton onClick={onPollNow} title="Verificar agora">
            <RefreshIcon />
          </TopIconButton>

          <TopIconButton onClick={() => setOpen(false)} title="Fechar">
            <CloseIcon />
          </TopIconButton>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-[4px] bg-[#565656] border-b border-[#424242] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="text-[8px] font-bold text-[#f1f1f1] uppercase">
          {currentCount} {tab === "notifs" ? "alertas" : "monitorados"}
        </div>

        <div className="flex items-center gap-2">
          {tab === "notifs" && notifications.length > 0 && (
            <button
              type="button"
              onClick={onClearNotifications}
              className="text-[8px] font-bold text-[#e7e7e7] hover:text-[#ffffff] cursor-pointer transition-colors"
            >
              limpar tudo
            </button>
          )}
          {tab === "watchlist" &&
            watchlist.length > 0 && ( // <-- bloco novo
              <button
                type="button"
                onClick={onClearWatchlist}
                className="text-[8px] font-bold text-[#e7e7e7] hover:text-[#ffffff] cursor-pointer transition-colors"
              >
                limpar tudo
              </button>
            )}
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto bg-[#4D4D4D] shadow-[inset_1px_1px_0_#6e6e6e,inset_-1px_-1px_0_#3b3b3b]">
        {tab === "notifs" ? (
          <NotifsList
            notifications={notifications}
            onRemove={onRemoveNotification}
            onOpenInFair={onOpenInFair}
            setOpen={setOpen}
            expanded={expandedNotifs}
            setExpanded={setExpandedNotifs}
          />
        ) : (
          <WatchlistList
            watchlist={watchlist}
            onRemove={onRemoveFromWatchlist}
            onOpenInFair={onOpenInFair}
            setOpen={setOpen}
            onUpdateConfig={onUpdateConfig}
            expanded={expandedWatchlist}
            setExpanded={setExpandedWatchlist}
          />
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        title="Monitoração de preços"
        onClick={handleToggle}
        className="relative w-4 h-4 rounded-[2px] border border-[#9a6500] bg-[#ffca00] text-[#7c4e00] flex items-center justify-center cursor-pointer hover:brightness-110 transition-all"
        aria-label="Notificações"
      >
        <BellIcon />

        {unreadCount > 0 && (
          <span className="absolute -top-[5px] -right-[5px] min-w-[13px] h-[13px] rounded-full bg-[#ff4444] border border-[#1a1a1a] text-white text-[8px] font-bold flex items-center justify-center px-[2px] leading-none pointer-events-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {typeof document !== "undefined"
        ? createPortal(panel, document.body)
        : null}
    </>
  );
}
