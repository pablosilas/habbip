export async function fetchWithRetry(url, options = {}, maxRetries = 3, initialDelay = 1000) {
  let lastError = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)

      if (response.status !== 429) {
        return response
      }

      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt)
        console.warn(
          `[Rate Limited] Tentativa ${attempt + 1}/${maxRetries}. ` +
          `Aguardando ${delay}ms antes de tentar novamente...`
        )
        await new Promise(r => setTimeout(r, delay))
        continue
      }

      // Última tentativa com 429 — extrai mensagem do servidor e lança erro
      let message = "Muitas requisições. Tente novamente em alguns minutos."
      try {
        const data = await response.json()
        if (data?.error) message = data.error
      } catch { /* empty */ }
      throw new Error(message)

    } catch (error) {
      lastError = error

      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt)
        console.warn(
          `[Erro Temporário] Tentativa ${attempt + 1}/${maxRetries}. ` +
          `Aguardando ${delay}ms antes de tentar novamente...`,
          error.message
        )
        await new Promise(r => setTimeout(r, delay))
        continue
      }

      throw error
    }
  }

  if (lastError) throw lastError
}

export async function fetchJsonWithRetry(url, options = {}) {
  const response = await fetchWithRetry(url, { ...options, headers: { 'Content-Type': 'application/json' } })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `HTTP ${response.status}: ${response.statusText}. ${errorText || ''}`
    )
  }

  return response.json()
}