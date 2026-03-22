import React from "react"
import Button from "../ui/Button"
import ConsoleCard from "../ui/ConsoleCard"
import ProfileContent from "../profile/ProfileContent"
import { updatePassword } from "../../services/authService"
import LogoutConfirmModal from "./LogoutConfirmModal"

function ChangePasswordSection() {
  const [open, setOpen] = React.useState(false)
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState(false)

  function reset() {
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
    setError(""); setSuccess(false)
  }

  async function handleSave() {
    if (newPassword.length < 6) { setError("Nova senha deve ter pelo menos 6 caracteres."); return }
    if (newPassword !== confirmPassword) { setError("As senhas não coincidem."); return }
    setLoading(true); setError("")
    try {
      await updatePassword({ currentPassword, newPassword })
      setSuccess(true)
      setTimeout(() => { setOpen(false); reset() }, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-[#ffffff22] rounded-[8px] p-3 bg-[rgba(255,255,255,0.04)]">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[#fff2c1] font-bold text-[12px]">Senha</div>
        <button
          type="button"
          onClick={() => { setOpen((v) => !v); reset() }}
          className="text-[10px] text-[#aaa] hover:text-[#ffd64d] cursor-pointer transition-colors"
        >
          {open ? "cancelar" : "alterar senha"}
        </button>
      </div>

      {!open && <div className="text-[12px] text-[#888]">••••••••</div>}

      {open && (
        <div className="flex flex-col gap-2">
          <input
            type="password" value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Senha atual" autoComplete="current-password"
            className="w-full h-8 border border-[#8a8a8a] bg-[rgba(255,255,255,0.10)] px-3 text-[12px] text-white outline-none placeholder:text-[#b0b0b0]"
          />
          <input
            type="password" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nova senha (mín. 6 chars)" autoComplete="new-password"
            className="w-full h-8 border border-[#8a8a8a] bg-[rgba(255,255,255,0.10)] px-3 text-[12px] text-white outline-none placeholder:text-[#b0b0b0]"
          />
          <input
            type="password" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmar nova senha" autoComplete="new-password"
            className="w-full h-8 border border-[#8a8a8a] bg-[rgba(255,255,255,0.10)] px-3 text-[12px] text-white outline-none placeholder:text-[#b0b0b0]"
          />
          {error && <div className="text-[#ffd6d6] text-[11px]">{error}</div>}
          {success && <div className="text-[#7CFC8A] text-[11px]">Senha alterada com sucesso!</div>}
          <Button
            onClick={handleSave}
            disabled={!currentPassword || !newPassword || !confirmPassword || loading}
          >
            {loading ? "Salvando..." : "Alterar senha"}
          </Button>
        </div>
      )}
    </div>
  )
}

// ── Abas do modal ─────────────────────────────────────────────────────────────
const TABS = [
  { key: "perfil", label: "Perfil Habbo" },
  { key: "conta", label: "Minha conta" },
]

export default function ProfileModal({ open, user, onClose, onLogout }) {
  const [activeTab, setActiveTab] = React.useState("perfil")
  const [confirmingLogout, setConfirmingLogout] = React.useState(false)

  if (!open || !user) return null

  const habboProfile = user.habboProfile

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.55)] flex items-center justify-center p-4">
      <ConsoleCard
        title="Minha conta"
        onClose={onClose}
        expand
        className="w-full max-w-[600px] h-[90vh] flex flex-col"
        innerClassName="flex flex-col overflow-hidden"
      >
        {/* Abas */}
        <div className="flex gap-1 mb-3 shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-[4px] text-[11px] font-bold border transition-colors cursor-pointer ${activeTab === tab.key
                ? "border-[#ffd64d] bg-[rgba(255,214,77,0.15)] text-[#ffd64d]"
                : "border-[#555] text-[#888] hover:border-[#888] hover:text-[#ccc]"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo da aba */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">

          {/* Aba: Perfil Habbo — reutiliza exatamente o ProfileContent do UserTab */}
          {activeTab === "perfil" && (
            habboProfile ? (
              <ProfileContent
                user={habboProfile}
                hotel="br"
              />
            ) : (
              <div className="text-[#888] text-[12px] py-4 text-center">
                Carregando perfil do Habbo...
              </div>
            )
          )}

          {/* Aba: Minha conta — senha */}
          {activeTab === "conta" && (
            <div className="space-y-3">
              <div className="border border-[#ffffff22] rounded-[8px] p-3 bg-[rgba(255,255,255,0.04)]">
                <div className="text-[#fff2c1] font-bold text-[12px] mb-1">Nick do Habbo</div>
                <div className="text-white text-[13px] font-bold">{user.habboNick}</div>
                <div className="text-[#888] text-[10px] mt-1">Seu login no Habbip</div>
              </div>

              <ChangePasswordSection />

              <div className="border-t border-[#ffffff22] pt-2">
                <div className="text-[#888] text-[10px] leading-4 text-center">
                  Seus dados estão sincronizados e acessíveis em qualquer dispositivo.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 shrink-0">
          <div className="flex gap-2">
            <Button onClick={onClose}>Fechar</Button>
            <Button variant="danger" onClick={() => setConfirmingLogout(true)}>Sair da conta</Button>
          </div>
        </div>

        <LogoutConfirmModal
          open={confirmingLogout}
          onConfirm={onLogout}
          onCancel={() => setConfirmingLogout(false)}
        />
      </ConsoleCard>
    </div>
  )
}