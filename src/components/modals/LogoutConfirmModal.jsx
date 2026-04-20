import Button from "../ui/Button"

export default function LogoutConfirmModal({ open, onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[360px] bg-white rounded-2xl shadow-xl border border-sky-100 overflow-hidden">
        {/* Header */}
        <div className="h-12 bg-gradient-to-r from-red-400 to-red-500 flex items-center justify-center">
          <span className="text-white font-bold text-[14px]">Sair da conta</span>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
          </div>
          
          <div className="text-sky-800 text-[14px] leading-relaxed text-center mb-6">
            Tem certeza que deseja sair?
          </div>
          
          <div className="flex flex-col gap-2">
            <Button variant="danger" onClick={onConfirm} className="w-full">
              Confirmar saida
            </Button>
            <Button variant="secondary" onClick={onCancel} className="w-full">
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
