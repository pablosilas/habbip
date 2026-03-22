import { useState, useCallback, useEffect, useRef } from "react"

const DEFAULT_CREDITS = 1000
const DEFAULT_REAIS = 200

function loadAnonConfig() {
  try {
    const raw = localStorage.getItem("habbip:anon:creditrate")
    if (!raw) return { credits: DEFAULT_CREDITS, reais: DEFAULT_REAIS }
    const parsed = JSON.parse(raw)
    const credits = Number(parsed.credits)
    const reais = Number(parsed.reais)
    return credits > 0 && reais > 0
      ? { credits, reais }
      : { credits: DEFAULT_CREDITS, reais: DEFAULT_REAIS }
  } catch {
    return { credits: DEFAULT_CREDITS, reais: DEFAULT_REAIS }
  }
}

export function useCreditConverter(serverData, markDirty, isLoggedIn) {
  const [config, setConfig] = useState(loadAnonConfig)
  const hydrated = useRef(false)

  // Guarda os settings completos do servidor para poder fazer merge ao salvar.
  //
  // Problema original: ao chamar markDirty("settings", { creditRate: {...} }),
  // o objeto enviado continha apenas creditRate — se serverData.settings tivesse
  // outras chaves (ex: theme, notifications), elas seriam silenciosamente
  // descartadas dependendo de como o backend trata o PUT /user/data.
  //
  // Solução: manter uma ref com os settings completos do servidor e sempre
  // fazer spread deles antes de incluir o creditRate atualizado.
  const serverSettingsRef = useRef({})

  // Hidrata do servidor e armazena os settings completos na ref
  useEffect(() => {
    if (!serverData || !isLoggedIn) return
    const s = serverData.settings

    // Salva os settings completos para uso no merge ao salvar
    if (s && typeof s === "object") {
      serverSettingsRef.current = s
    }

    if (s?.creditRate?.credits > 0 && s?.creditRate?.reais > 0) {
      setConfig({ credits: s.creditRate.credits, reais: s.creditRate.reais })
    }

    hydrated.current = true
  }, [serverData, isLoggedIn])

  const setRate = useCallback(({ credits, reais }) => {
    const c = Number(credits)
    const r = Number(reais)
    if (!Number.isFinite(c) || c <= 0 || !Number.isFinite(r) || r <= 0) return

    setConfig({ credits: c, reais: r })

    if (isLoggedIn) {
      // Merge com os settings existentes do servidor para não perder outras chaves
      const mergedSettings = {
        ...serverSettingsRef.current,
        creditRate: { credits: c, reais: r },
      }
      markDirty?.("settings", mergedSettings)
      // Mantém a ref atualizada para o próximo save
      serverSettingsRef.current = mergedSettings
    } else {
      try {
        localStorage.setItem("habbip:anon:creditrate", JSON.stringify({ credits: c, reais: r }))
      } catch { }
    }
  }, [isLoggedIn, markDirty])

  const toReal = useCallback((credits) => {
    if (!credits || config.credits <= 0) return null
    return ((credits / config.credits) * config.reais)
      .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }, [config])

  const toCredits = useCallback((reais) => {
    if (!reais || config.reais <= 0) return null
    return Math.round((reais / config.reais) * config.credits)
  }, [config])

  return { rateCredits: config.credits, rateReais: config.reais, setRate, toReal, toCredits }
}