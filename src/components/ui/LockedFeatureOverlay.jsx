import Button from "./Button"

export default function LockedFeatureOverlay({ onLogin, featureName = "esta funcionalidade" }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center gap-4 py-8">
      <div className="text-4xl">🔒</div>
      <div>
        <div className="text-white font-bold text-[14px] mb-1">
          Login necessário
        </div>
        <div className="text-[#d2d2d2] text-[12px] leading-5 max-w-[260px]">
          Faça login ou crie uma conta para acessar {featureName}.
          Seus dados ficam sincronizados em qualquer dispositivo.
        </div>
      </div>
      <div className="w-full max-w-[220px]">
        <Button onClick={onLogin}>
          Entrar / Criar conta
        </Button>
      </div>
    </div>
  )
}