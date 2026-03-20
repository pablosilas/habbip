import ProfileContent from "../profile/ProfileContent"
import Button from "../ui/Button"
import ConsoleCard from "../ui/ConsoleCard"

export default function ProfileModal({ open, user, onClose, onLogout }) {
  if (!open || !user) return null

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.55)] flex items-center justify-center p-4">
      <ConsoleCard
        title="Meu Perfil"
        onClose={onClose}
        expand
        className="w-full max-w-[760px] h-[90vh] flex flex-col"
        innerClassName="flex flex-col"
      >
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          <ProfileContent user={user} hotel="br" />
        </div>

        <div className="pt-4 flex gap-2 shrink-0">
          <Button onClick={onClose}>
            Fechar
          </Button>

          <Button variant="danger" onClick={onLogout} className="flex items-center justify-center gap-2">
            Sair
          </Button>
        </div>
      </ConsoleCard>
    </div>
  )
}