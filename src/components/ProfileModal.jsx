import React from "react"
import ProfileContent from "./ProfileContent"
import exitIcon from "../assets/exit.png"

export default function ProfileModal({ open, user, onClose, onLogout }) {
  if (!open || !user) return null

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.55)] flex items-center justify-center p-4">
      <div className="console-card w-full max-w-[760px] h-[90vh] rounded-[23px] border-[1px] border-[#1D190D] bg-[#ffca00] shadow-[0_18px_40px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-8 shrink-0 bg-[#ffca00] relative flex items-center justify-center px-3 overflow-hidden">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-[35%] h-[18px] bg-[radial-gradient(#C7970F_1px,transparent_1px)] bg-[size:4px_4px] opacity-70" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-[35%] h-[18px] bg-[radial-gradient(#C7970F_1px,transparent_1px)] bg-[size:4px_4px] opacity-70" />
          <div className="text-[12px] font-bold text-[#7c4e00] tracking-wide z-10">
            Perfil do usuário
          </div>
          <div className="absolute right-4 flex gap-1 z-10">
            <button
              type="button"
              onClick={onClose}
              className="w-4 h-4 rounded-[2px] border border-[#9a6500] bg-[#ffca00] text-[#7c4e00] text-[10px] flex items-center justify-center cursor-pointer"
              aria-label="Fechar"
            >
              X
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 px-3 pb-3 bg-[#ffca00]">
          <div
            className="h-full rounded-[14px] border-[2px] border-[#1D190D] bg-[repeating-linear-gradient(180deg,#535353_0px,#535353_2px,#4b4b4b_2px,#4b4b4b_4px)] p-3"
            style={{ boxShadow: "inset 0 4px 6px rgba(0,0,0,0.4), inset 0 -4px 6px rgba(0,0,0,0.4), inset 4px 0 6px rgba(0,0,0,0.4), inset -4px 0 6px rgba(0,0,0,0.4)" }}
          >
            <div className="h-full rounded-[10px] border border-[#8a8a8a] bg-[rgba(0,0,0,0.08)] p-3 flex flex-col">

              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                <ProfileContent user={user} hotel="br" />
              </div>

              <div className="pt-4 flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-9 border border-[#b98d14] bg-[linear-gradient(180deg,#ffd64d_0%,#e6b21b_100%)] text-[#6f4700] font-bold text-[12px] disabled:opacity-70 cursor-pointer"
                >
                  Fechar
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="flex-1 h-9 border-[#6d6d6d] bg-[linear-gradient(180deg,#5a5a63_0%,#44454e_100%)] text-white text-[12px] font-bold cursor-pointer hover:brightness-110 flex items-center justify-center gap-2"
                >
                  <img src={exitIcon} alt="Sair" className="w-5 h-5 image-rendering-pixel" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}