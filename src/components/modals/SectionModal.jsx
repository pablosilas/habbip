import React from "react"
import ConsoleCard from "../ui/ConsoleCard"
import SearchInput from "../ui/SearchInput"

/**
 * SectionModal
 *
 * Modal genérico para exibir uma lista completa de uma seção do perfil
 * (Emblemas, Amigos, Grupos, Quartos) com input de busca/filtro.
 *
 * Props:
 *   open        {boolean}     Controla visibilidade
 *   onClose     {function}    Fecha o modal
 *   title       {string}      Título do modal (ex: "Emblemas")
 *   items       {Array}       Lista completa dos itens
 *   renderItem  {function}    (item, index) => JSX — como renderizar cada item
 *   filterFn    {function}    (item, query) => boolean — lógica de filtro
 *   emptyText   {string}      Texto quando não há itens
 */
export default function SectionModal({ open, onClose, title, items = [], renderItem, filterFn, emptyText = "Nenhum item encontrado." }) {
  const [query, setQuery] = React.useState("")
  const inputRef = React.useRef(null)

  // Foca o input ao abrir e limpa a busca ao fechar
  React.useEffect(() => {
    if (open) {
      setQuery("")
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  if (!open) return null

  const filtered = query.trim()
    ? items.filter((item) => filterFn(item, query.trim().toLowerCase()))
    : items

  return (
    <div
      className="fixed inset-0 z-[60] bg-[rgba(0,0,0,0.65)] flex items-center justify-center p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <ConsoleCard
        title={`${title} (${items.length})`}
        onClose={onClose}
        expand
        className="w-full max-w-[520px] h-[80vh] flex flex-col"
        innerClassName="flex flex-col overflow-hidden"
      >
        {/* Input de busca */}
        <div className="mb-3 shrink-0">
          <SearchInput
            inputRef={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Buscar em ${title.toLowerCase()}...`}
          />
        </div>

        {/* Contador de resultados quando filtrando */}
        {query.trim() && (
          <div className="text-[10px] text-[#888] mb-2 shrink-0">
            {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"} para "{query}"
          </div>
        )}

        {/* Lista */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-[12px] text-[#888] py-4 text-center">
              {query.trim() ? `Nenhum resultado para "${query}".` : emptyText}
            </div>
          ) : (
            filtered.map((item, index) => (
              <React.Fragment key={index}>
                {renderItem(item, index)}
              </React.Fragment>
            ))
          )}
        </div>
      </ConsoleCard>
    </div>
  )
}