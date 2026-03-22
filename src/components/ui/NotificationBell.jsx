import React from "react"
import { createPortal } from "react-dom"
import { getFurnitureImageUrl } from "../../services/habboApi"
import coinIcon from "../../assets/coin.png"
import boxIcon from "../../assets/box.png"

function timeAgo(ms) {
  const diff = Date.now() - ms
  const min = Math.floor(diff / 60000)
  const h = Math.floor(min / 60)
  const d = Math.floor(h / 24)
  if (min < 1) return "agora"
  if (min < 60) return `${min}min`
  if (h < 24) return `${h}h`
  return `${d}d`
}

function FurniThumb({ classname }) {
  const [err, setErr] = React.useState(false)
  const url = getFurnitureImageUrl(classname)
  if (err || !url)
    return <img src={boxIcon} alt="" className="w-6 h-6 object-contain opacity-50 image-rendering-pixel" />
  return (
    <img
      src={url}
      alt={classname}
      className="w-6 h-6 object-contain image-rendering-pixel"
      onError={() => setErr(true)}
    />
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-[3px] text-[10px] font-bold rounded transition-colors cursor-pointer ${active ? "bg-[#ffd64d] text-[#5a3500]" : "text-[#888] hover:text-[#ccc]"
        }`}
    >
      {children}
    </button>
  )
}

function NotifItem({ notif, onRemove }) {
  const isUp = notif.direction === "up"
  return (
    <div
      className={`flex items-start gap-2 px-3 py-[8px] border-b border-[#222] ${!notif.read ? "bg-[rgba(255,214,77,0.04)]" : ""
        } hover:bg-[rgba(255,255,255,0.03)] transition-colors`}
    >
      <div className="shrink-0 mt-[2px]">
        <FurniThumb classname={notif.className} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold text-white truncate">{notif.furniName}</div>
        <div className="flex items-center gap-1 mt-[2px] flex-wrap">
          <span className={`text-[12px] font-bold ${isUp ? "text-[#7CFC8A]" : "text-[#FF8A8A]"}`}>
            {isUp ? "▲" : "▼"} {isUp ? "+" : ""}
            {notif.pct}%
          </span>
          <div className="flex items-center gap-[2px]">
            <img src={coinIcon} alt="" className="w-3 h-3" />
            <span className="text-[10px] text-[#888]">{notif.oldPrice}</span>
          </div>
          <span className="text-[10px] text-[#555]">→</span>
          <div className="flex items-center gap-[2px]">
            <img src={coinIcon} alt="" className="w-3 h-3" />
            <span className={`text-[11px] font-bold ${isUp ? "text-[#7CFC8A]" : "text-[#FF8A8A]"}`}>
              {notif.newPrice}
            </span>
          </div>
        </div>
        <div className="text-[9px] text-[#555] mt-[2px]">{timeAgo(notif.createdAt) === "agora" ? "agora" : `${timeAgo(notif.createdAt)} atrás`}</div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(notif.id)}
        className="shrink-0 text-[10px] text-[#444] hover:text-[#ff8a8a] cursor-pointer transition-colors mt-[2px]"
      >
        ✕
      </button>
    </div>
  )
}

function NotifsList({ notifications, onRemove, onClear }) {
  if (notifications.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-[11px] text-[#555]">
        Nenhum alerta ainda.<br />
        <span className="text-[10px] text-[#444]">
          Monitore um mobi para receber alertas de preço.
        </span>
      </div>
    )
  }
  return (
    <div>
      <div className="flex items-center justify-between px-3 py-[5px] border-b border-[#2a2a2a]">
        <span className="text-[9px] text-[#555] uppercase tracking-wider">
          {notifications.length} alertas
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-[9px] text-[#555] hover:text-[#ff8a8a] cursor-pointer transition-colors"
        >
          limpar tudo
        </button>
      </div>
      {notifications.map((n) => (
        <NotifItem key={n.id} notif={n} onRemove={onRemove} />
      ))}
    </div>
  )
}

function WatchlistItem({ item, onRemove }) {
  const history = item?.marketData?.history || []
  const currentPrice =
    item?.marketData?.currentPrice ??
    (history.length > 0 ? history[history.length - 1]?.[0] : null) ??
    item?.marketData?.averagePrice ??
    item.basePrice ??
    "-"
  const diff =
    typeof currentPrice === "number" && item.basePrice
      ? currentPrice - item.basePrice
      : null

  return (
    <div className="flex items-center gap-2 px-3 py-[7px] border-b border-[#222] hover:bg-[rgba(255,255,255,0.03)] transition-colors">
      <div className="shrink-0">
        <FurniThumb classname={item.ClassName} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold text-white truncate">{item.FurniName}</div>
        <div className="flex items-center gap-1">
          <img src={coinIcon} alt="" className="w-3 h-3" />
          <span className="text-[11px] text-[#ffd64d] font-bold">
            {typeof currentPrice === "number"
              ? currentPrice.toLocaleString("pt-BR")
              : currentPrice}
          </span>
          {diff !== null && diff !== 0 && (
            <span className={`text-[9px] font-bold ${diff > 0 ? "text-[#7CFC8A]" : "text-[#FF8A8A]"}`}>
              {diff > 0 ? "+" : ""}
              {diff}
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.ClassName)}
        title="Parar de monitorar"
        className="shrink-0 text-[10px] text-[#444] hover:text-[#ff8a8a] cursor-pointer transition-colors"
      >
        ✕
      </button>
    </div>
  )
}

function WatchlistList({ watchlist, onRemove }) {
  if (watchlist.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-[11px] text-[#555]">
        Nenhum mobi monitorado.<br />
        <span className="text-[10px] text-[#444]">
          Clique no ícone 👁 em um resultado para monitorar.
        </span>
      </div>
    )
  }
  return (
    <div>
      {watchlist.map((item) => (
        <WatchlistItem key={item.ClassName} item={item} onRemove={onRemove} />
      ))}
    </div>
  )
}

function BellIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z" />
    </svg>
  )
}

/**
 * NotificationBell
 *
 * Ícone de sino no headerRight com badge de não lidos.
 * Painel flutuante com duas abas:
 *   - Alertas: histórico de variações de preço detectadas
 *   - Monitorando: lista de mobis em observação
 */
export default function NotificationBell({
  notifications = [],
  unreadCount = 0,
  watchlist = [],
  isPolling = false,
  onMarkAllRead,
  onClearNotifications,
  onRemoveNotification,
  onRemoveFromWatchlist,
  onPollNow,
}) {
  const [open, setOpen] = React.useState(false)
  const [tab, setTab] = React.useState("notifs")
  const [dropdownPos, setDropdownPos] = React.useState({ top: 0, right: 0 })
  const btnRef = React.useRef(null)
  const panelRef = React.useRef(null)

  function handleToggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setDropdownPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right })
    }
    if (!open && unreadCount > 0) onMarkAllRead?.()
    setOpen((v) => !v)
  }

  React.useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (!btnRef.current?.contains(e.target) && !panelRef.current?.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const panel = open ? (
    <div
      ref={panelRef}
      style={{ position: "fixed", top: dropdownPos.top, right: dropdownPos.right, zIndex: 99999, width: 300 }}
      className="rounded-[10px] border border-[#3a3a3a] bg-[#1a1a1a] shadow-[0_12px_40px_rgba(0,0,0,0.7)] overflow-hidden"
    >
      <div className="flex items-center justify-between px-3 py-2 bg-[#222] border-b border-[#333]">
        <div className="flex gap-1">
          <TabBtn active={tab === "notifs"} onClick={() => setTab("notifs")}>
            Alertas{unreadCount > 0 && <span className="ml-1 text-[#ffd64d]">({unreadCount})</span>}
          </TabBtn>
          <TabBtn active={tab === "watchlist"} onClick={() => setTab("watchlist")}>
            Monitorando ({watchlist.length})
          </TabBtn>
        </div>
        <div className="flex items-center gap-2">
          {isPolling && (
            <span className="text-[9px] text-[#ffd64d] animate-pulse">verificando...</span>
          )}
          <button
            type="button"
            onClick={onPollNow}
            title="Verificar agora"
            className="text-[11px] text-[#666] hover:text-[#ffd64d] cursor-pointer transition-colors"
          >
            ↻
          </button>
        </div>
      </div>

      <div className="max-h-[340px] overflow-y-auto">
        {tab === "notifs" ? (
          <NotifsList notifications={notifications} onRemove={onRemoveNotification} onClear={onClearNotifications} />
        ) : (
          <WatchlistList watchlist={watchlist} onRemove={onRemoveFromWatchlist} />
        )}
      </div>
    </div>
  ) : null

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
      {typeof document !== "undefined" ? createPortal(panel, document.body) : null}
    </>
  )
}