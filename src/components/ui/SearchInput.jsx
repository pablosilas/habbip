/**
 * SearchInput (V2)
 *
 * Input de busca reutilizável com icone de busca integrado.
 * Design moderno azul ciano com bordas arredondadas.
 *
 * Props:
 *   value        {string}    Valor controlado
 *   onChange     {function}  Handler de mudança
 *   onKeyDown    {function}  Handler de teclado (opcional)
 *   onFocus      {function}  Handler de foco (opcional)
 *   onBlur       {function}  Handler de blur (opcional)
 *   placeholder  {string}    Placeholder do input
 *   inputRef     {ref}       Ref externa para o <input> (opcional)
 *   inputMode    {string}    inputMode HTML (ex: "search")
 *   enterKeyHint {string}    enterKeyHint HTML (ex: "search")
 *   className    {string}    Classes extras para o wrapper externo
 *   children     {node}      Slot para conteudo sobreposto (ex: dropdown)
 */

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  )
}

export default function SearchInput({
  value,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  placeholder = "Buscar...",
  inputRef,
  inputMode,
  enterKeyHint,
  className = "",
  children,
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Icone de busca */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400 pointer-events-none z-10">
        <SearchIcon />
      </div>

      <input
        ref={inputRef}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        inputMode={inputMode}
        enterKeyHint={enterKeyHint}
        className="
          w-full h-10 
          border-2 border-sky-200 
          bg-white 
          pl-10 pr-3 
          text-[13px] text-sky-900 
          rounded-lg
          outline-none 
          placeholder:text-sky-300
          focus:border-sky-400 focus:shadow-[0_0_0_3px_rgba(79,195,247,0.15)]
          transition-all duration-200
        "
      />

      {/* Slot para dropdown ou outros elementos sobrepostos */}
      {children}
    </div>
  )
}
