/**
 * Button
 *
 * Componente reutilizável de botão com variantes visuais do Habbip.
 *
 * Props:
 *   variant   {"primary" | "secondary" | "danger"}   Estilo visual do botão (padrão: "primary")
 *   onClick   {function}                  Handler de clique
 *   disabled  {boolean}                   Desabilita o botão
 *   type      {"button" | "submit"}       Tipo HTML do botão (padrão: "button")
 *   className {string}                    Classes extras para o botão
 *   children  {node}                      Conteúdo/label do botão
 *
 * Exemplos de uso:
 *
 *   <Button onClick={handleSearch} disabled={loading}>
 *     {loading ? "Buscando..." : "Buscar usuário"}
 *   </Button>
 *
 *   <Button variant="secondary" onClick={() => setQuery("")}>
 *     Limpar
 *   </Button>
 *
 *   <Button variant="danger" onClick={onLogout}>
 *     Sair
 *   </Button>
 */
export default function Button({
  variant = "primary",
  onClick,
  disabled = false,
  type = "button",
  className = "",
  children,
}) {
  const base = "w-full h-9 font-bold text-[12px] cursor-pointer disabled:opacity-70 transition duration-150"

  const variants = {
    primary: "border border-[#b98d14] bg-[linear-gradient(180deg,#ffd64d_0%,#e6b21b_100%)] text-[#6f4700] hover:brightness-110",
    secondary: "border border-[#6d6d6d] bg-[linear-gradient(180deg,#5a5a63_0%,#44454e_100%)] text-white hover:brightness-105",
    danger: "border border-[#8b1a1a] bg-[linear-gradient(180deg,#d94444_0%,#b02020_100%)] text-white hover:brightness-110",
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}