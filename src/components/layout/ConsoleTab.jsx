export default function ConsoleTab({ label, icon, active, onClick, locked = false }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`
        effect-button relative flex-1 h-full flex flex-col items-center justify-start
        px-1 pt-[8px] pb-[10px] border-l-[2px] border-t-[2px] last:border-r-[2px]
        ${active ? "border-[#7B4001] effect-button--active" : "border-[#8B5500]"}
        cursor-pointer transition-all duration-150 overflow-hidden
        ${active
          ? "bg-[#BD8F1C] shadow-[inset_0_4px_8px_rgba(0,0,0,0.35),inset_0_2px_3px_rgba(0,0,0,0.25)]"
          : "bg-[#E2B402]"}
      `}
    >
      <span className="flex items-center justify-center leading-none mb-[4px] relative">
        {icon}
        {locked && (
          <span className="absolute -top-[3px] -right-[6px] text-[8px] leading-none">🔒</span>
        )}
      </span>

      <span className="text-[9px] font-bold uppercase text-[#5a3500] leading-none mb-[4px]">
        {label}
      </span>

      <div className="flex flex-col gap-[2px] mt-auto w-full px-[6px]">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`w-full h-[3px] ${active ? "bg-[#C9981D] border-b-[2px] border-[#AB7A02]" : "bg-[#F1BF26] border-b-[2px] border-[#C49104]"}`} />
        ))}
      </div>

      {active && (
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#8B6500] shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]" />
      )}
    </button>
  )
}