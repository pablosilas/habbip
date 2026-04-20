/**
 * Button (V2)
 *
 * Componente reutilizável de botão com variantes visuais do Habbip V2.
 * Design moderno azul ciano com variantes.
 *
 * Props:
 *   variant   {"primary" | "secondary" | "danger"}   Estilo visual do botão (padrão: "primary")
 *   size      {"sm" | "md" | "lg"}                   Tamanho do botão (padrão: "md")
 *   onClick   {function}                              Handler de clique
 *   disabled  {boolean}                               Desabilita o botão
 *   type      {"button" | "submit"}                   Tipo HTML do botão (padrão: "button")
 *   className {string}                                Classes extras para o botão
 *   children  {node}                                  Conteúdo/label do botão
 */
export default function Button({
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  type = "button",
  className = "",
  children,
}) {
  const base = `
    font-semibold cursor-pointer transition-all duration-200
    inline-flex items-center justify-center gap-2
    disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
    rounded-lg
  `

  const sizes = {
    sm: "h-8 px-3 text-[11px]",
    md: "h-10 px-4 text-[13px]",
    lg: "h-12 px-6 text-[14px]",
  }

  const variants = {
    primary: `
      bg-gradient-to-r from-sky-400 to-cyan-500
      text-white border-none
      shadow-[0_2px_8px_rgba(79,195,247,0.3)]
      hover:from-sky-500 hover:to-cyan-600
      hover:shadow-[0_4px_12px_rgba(79,195,247,0.4)]
      hover:-translate-y-0.5
      active:translate-y-0
    `,
    secondary: `
      bg-white text-sky-500
      border-2 border-sky-400
      hover:bg-sky-50 hover:border-sky-500 hover:text-sky-600
    `,
    danger: `
      bg-gradient-to-r from-red-400 to-red-500
      text-white border-none
      shadow-[0_2px_8px_rgba(244,67,54,0.3)]
      hover:from-red-500 hover:to-red-600
      hover:shadow-[0_4px_12px_rgba(244,67,54,0.4)]
      hover:-translate-y-0.5
    `,
    ghost: `
      bg-transparent text-sky-500
      border-none
      hover:bg-sky-50
    `,
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
