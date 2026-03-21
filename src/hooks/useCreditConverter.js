import { useState, useCallback, useEffect } from "react"

// Padrão: 100 créditos = R$ 1,00
const DEFAULT_CREDITS = 1000
const DEFAULT_REAIS = 200

function resolveKey(loggedUserName) {
  if (!loggedUserName?.trim()) return "habbodesk:anonymous:creditrate"
  return `habbodesk:${loggedUserName.trim().toLowerCase().replace(/\s+/g, "_")}:creditrate`
}

function loadConfig(loggedUserName) {
  try {
    const raw = localStorage.getItem(resolveKey(loggedUserName))
    if (!raw) return { credits: DEFAULT_CREDITS, reais: DEFAULT_REAIS }
    const parsed = JSON.parse(raw)
    const credits = Number(parsed.credits)
    const reais = Number(parsed.reais)
    if (credits > 0 && reais > 0) return { credits, reais }
    return { credits: DEFAULT_CREDITS, reais: DEFAULT_REAIS }
  } catch {
    return { credits: DEFAULT_CREDITS, reais: DEFAULT_REAIS }
  }
}

function saveConfig(loggedUserName, credits, reais) {
  try {
    localStorage.setItem(resolveKey(loggedUserName), JSON.stringify({ credits, reais }))
  } catch { /* empty */ }
}

/**
 * useCreditConverter
 *
 * Gerencia a taxa de conversão créditos ↔ reais salva por usuário.
 * A taxa é definida como uma proporção: "X créditos = R$ Y,00"
 * Ambos os lados são configuráveis pelo usuário.
 *
 * Expõe:
 *   rateCredits   {number}   Lado esquerdo da proporção (créditos)
 *   rateReais     {number}   Lado direito da proporção (reais)
 *   setRate       {fn}       Atualiza e persiste a taxa ({ credits, reais })
 *   toReal        {fn}       Converte N créditos → string formatada em reais
 *   toCredits     {fn}       Converte N reais → créditos
 */
export function useCreditConverter(loggedUserName) {
  const [config, setConfig] = useState(() => loadConfig(loggedUserName))

  useEffect(() => {
    setConfig(loadConfig(loggedUserName))
  }, [loggedUserName])

  const setRate = useCallback(({ credits, reais }) => {
    const c = Number(credits)
    const r = Number(reais)
    if (!Number.isFinite(c) || c <= 0) return
    if (!Number.isFinite(r) || r <= 0) return
    setConfig({ credits: c, reais: r })
    saveConfig(loggedUserName, c, r)
  }, [loggedUserName])

  const toReal = useCallback((credits) => {
    if (!credits || config.credits <= 0) return null
    const value = (credits / config.credits) * config.reais
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }, [config])

  const toCredits = useCallback((reais) => {
    if (!reais || config.reais <= 0) return null
    return Math.round((reais / config.reais) * config.credits)
  }, [config])

  return {
    rateCredits: config.credits,
    rateReais: config.reais,
    setRate,
    toReal,
    toCredits,
  }
}