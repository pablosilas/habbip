export default function ConsoleTab({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`
        relative
        flex-1
        h-full
        flex
        flex-col
        items-center
        justify-start
        px-1
        pt-[8px]
        pb-[10px]
        border-l-[2px] border-t-[2px]
        last:border-r-[2px]
        ${active ? "border-[#7B4001]" : "border-[#8B5500]"}
        cursor-pointer
        transition-all
        duration-150
        overflow-hidden
       ${active
          ? "bg-[#BD8F1C] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
          : "bg-[#E2B402]"
        }
      `}
    >
      <span className="flex items-center justify-center leading-none mb-[4px]">
        {icon}
      </span>

      <span className="text-[9px] font-bold uppercase text-[#5a3500] leading-none mb-[4px]">
        {label}
      </span>

      <div className="flex flex-col gap-[2px] mt-auto">
        <div className={`w-35 h-[3px] ${active ? "bg-[#C9981D]" : "bg-[#F1BF26]"} ${active ? "border-b-[2px] border-[#AB7A02]" : "border-b-[2px] border-[#C49104]"} `} />
        <div className={`w-35 h-[3px] ${active ? "bg-[#C9981D]" : "bg-[#F1BF26]"} ${active ? "border-b-[2px] border-[#AB7A02]" : "border-b-[2px] border-[#C49104]"} `} />
        <div className={`w-35 h-[3px] ${active ? "bg-[#C9981D]" : "bg-[#F1BF26]"} ${active ? "border-b-[2px] border-[#AB7A02]" : "border-b-[2px] border-[#C49104]"} `} />
      </div>

      {active ? (
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#8B6500] shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]" />
      ) : null}
    </button>
  )
}