/**
 * Cria uma versão debounced de uma função
 * A função só é executada após `delay` ms sem novas chamadas
 * 
 * @param {Function} func - Função a ser debounced
 * @param {number} delay - Delay em ms (padrão: 500)
 * @returns {Function} Função debounced com método .cancel()
 */
export function debounce(func, delay = 500) {
  let timeoutId = null

  const debounced = (...args) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }

  debounced.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = null
  }

  return debounced
}

/**
 * Hook React para usar debounce com cleanup
 * 
 * @param {Function} callback - Função a ser debounced
 * @param {number} delay - Delay em ms (padrão: 500)
 * @param {Array} deps - Dependências React
 * @returns {Function} Função debounced
 */
import { useRef, useEffect } from 'react'

export function useDebouncedCallback(callback, delay = 500, deps = []) {
  const debounced = useRef(null)

  useEffect(() => {
    debounced.current = debounce(callback, delay)
    return () => debounced.current?.cancel()
  }, [callback, delay, ...deps])

  return debounced.current
}
