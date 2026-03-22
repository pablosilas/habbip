import React from "react"

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
      <circle cx="8" cy="8" r="2.5" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486z" />
      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" />
      <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238z" />
      <path d="M2 2l12 12" />
    </svg>
  )
}

/**
 * PasswordInput
 *
 * Input de senha com botão para alternar visibilidade.
 *
 * Props: todas as props nativas de <input> são suportadas via ...rest.
 * As mais comuns:
 *   value        {string}    Valor controlado
 *   onChange     {function}  Handler de mudança
 *   placeholder  {string}    Placeholder
 *   autoComplete {string}    "current-password" | "new-password"
 *   disabled     {boolean}
 *   className    {string}    Classes extras para o wrapper externo
 */
const PasswordInput = React.forwardRef(function PasswordInput(
  { className = "", ...rest },
  ref
) {
  const [visible, setVisible] = React.useState(false)

  return (
    <div className={`relative ${className}`}>
      <input
        ref={ref}
        {...rest}
        type={visible ? "text" : "password"}
        className="w-full h-9 border border-[#8a8a8a] bg-[rgba(255,255,255,0.10)] pl-3 pr-9 text-[12px] text-white outline-none placeholder:text-[#b0b0b0] disabled:opacity-50"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        disabled={rest.disabled}
        title={visible ? "Ocultar senha" : "Mostrar senha"}
        className="absolute right-0 top-0 h-full w-9 flex items-center justify-center text-[#888] hover:text-[#ffd64d] transition-colors cursor-pointer disabled:pointer-events-none"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  )
})

export default PasswordInput