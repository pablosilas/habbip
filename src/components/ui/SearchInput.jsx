/**
 * SearchInput
 *
 * Input de busca reutilizável com ícone search.png à esquerda.
 * Compatível com o sistema visual do Habbip (bordas, cores, placeholder).
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
 *   children     {node}      Slot para conteúdo sobreposto (ex: dropdown)
 */

import searchIcon from "../../assets/search.png"

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
      {/* Ícone de busca */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none z-10">
        <img
          src={searchIcon}
          alt="buscar"
          className="w-full h-full object-contain image-rendering-pixel opacity-60"
        />
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
        className="w-full h-9 border border-[#c3c3c3] bg-[rgba(255,255,255,0.12)] pl-7 pr-2 text-[12px] text-white outline-none placeholder:text-[#d2d2d2]"
      />

      {/* Slot para dropdown ou outros elementos sobrepostos */}
      {children}
    </div>
  )
}