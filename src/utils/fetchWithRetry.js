/**
 * Fetch com retry automático e backoff exponencial
 * Em caso de 429 (Too Many Requests), tenta novamente com delay crescente
 * 
 * @param {string} url - URL a fazer fetch
 * @param {object} options - Opções do fetch
 * @param {number} maxRetries - Máximo de tentativas (padrão: 3)
 * @param {number} initialDelay - Delay inicial em ms (padrão: 1000)
 * @returns {Promise<Response>} Response do fetch
 */
export async function fetchWithRetry(url, options = {}, maxRetries = 3, initialDelay = 1000) {
  let lastError = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)

      // Se for sucesso ou erro que não é 429, retorna
      if (response.status !== 429) {
        return response
      }

      // É 429, tenta de novo se não for a última tentativa
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt)
        console.warn(
          `[Rate Limited] Tentativa ${attempt + 1}/${maxRetries}. ` +
          `Aguardando ${delay}ms antes de tentar novamente...`
        )
        await new Promise(r => setTimeout(r, delay))
        continue
      }

      // Última tentativa com 429, retorna a erro
      return response
    } catch (error) {
      lastError = error

      // Erro de rede — tenta de novo se não for a última tentativa
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

      // Última tentativa com erro, relança
      throw error
    }
  }

  // Nunca deve chegar aqui
  if (lastError) throw lastError
}

/**
 * Wrapper para fetch com retry que já lida com JSON parsing
 * 
 * @param {string} url - URL a fazer fetch
 * @param {object} options - Opções do fetch
 * @returns {Promise<any>} Dados parseados como JSON
 */
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
