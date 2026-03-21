import Button from "../ui/Button"

const MESSAGES = [
  {
    title: "Oi?? Tá tentando me fechar??",
    body: "Achei que éramos amigos... Mas tudo bem, ainda da tempo de desistir.",
    confirm: "Desculpa, vou ficar!",
    cancel: "Vou fechar sim.",
  },
  {
    title: "De novo não...",
    body: "Tá bem, girei a tela só pra te avisar. Da próxima pode ser pior.",
    confirm: "Ok, entendi o recado.",
    cancel: "Qual seria o pior?",
  },
  {
    title: "Você foi avisado.",
    body: "Três vezes. TRÊS. E você continua tentando. Isso é sabotagem!",
    confirm: "Juro que paro.",
    cancel: "Não vou parar.",
  },
  {
    title: "Tá bom, respeito.",
    body: "Mas saiba que o Habbip vai sentir sua falta.",
    confirm: "Meu coração amoleceu, vou ficar.",
    cancel: "Até logo, amigo.",
  },
  {
    title: "Tá tonto já??",
    body: "A tela já girou tanto que até eu tô zonzo. Você não tá tonto não?",
    confirm: "Tô sim, vou descansar aqui então.",
    cancel: "Não tô, vou girar mais!",
  },
]

export default function CloseJokeModal({ open, attempt, onClose, onConfirm }) {
  if (!open) return null

  const index = Math.min(attempt - 1, MESSAGES.length - 1)
  const message = MESSAGES[index]

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.55)] flex items-center justify-center p-4">
      <div className="console-card w-full max-w-[380px] rounded-[23px] border-[1px] border-[#1D190D] bg-[#ffca00] shadow-[0_18px_40px_rgba(0,0,0,0.35)] overflow-hidden">

        {/* Header */}
        <div className="h-8 bg-[#ffca00] relative flex items-center justify-center px-3 overflow-hidden">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-[35%] h-[18px] bg-[radial-gradient(#C7970F_1px,transparent_1px)] bg-[size:4px_4px] opacity-70" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-[35%] h-[18px] bg-[radial-gradient(#C7970F_1px,transparent_1px)] bg-[size:4px_4px] opacity-70" />
          <div className="text-[12px] font-bold text-[#7c4e00] tracking-wide z-10">
            {message.title}
          </div>
        </div>

        {/* Body */}
        <div className="px-3 pb-3 bg-[#ffca00]">
          <div
            className="rounded-[14px] border-[2px] border-[#1D190D] bg-[repeating-linear-gradient(180deg,#535353_0px,#535353_2px,#4b4b4b_2px,#4b4b4b_4px)] p-3"
            style={{ boxShadow: "inset 0 4px 6px rgba(0,0,0,0.4), inset 0 -4px 6px rgba(0,0,0,0.4), inset 4px 0 6px rgba(0,0,0,0.4), inset -4px 0 6px rgba(0,0,0,0.4)" }}
          >
            <div className="rounded-[10px] border border-[#8a8a8a] bg-[rgba(0,0,0,0.08)] p-4">
              <div className="text-white text-[12px] leading-5 mb-4 text-center">
                {message.body}
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={onClose}>
                  {message.confirm}
                </Button>

                <Button variant="secondary" onClick={onConfirm}>
                  {message.cancel}
                </Button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}