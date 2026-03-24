/**
 * Fila de requisições para limitar concorrência
 * Garante que apenas N requisições rodem simultaneamente
 */
export class RequestQueue {
  constructor(concurrency = 1) {
    this.concurrency = concurrency
    this.running = 0
    this.queue = []
  }

  /**
   * Executa uma função, respeitando o limite de concorrência
   * @param {Function} task - Função async a executar
   * @returns {Promise} Resultado da função
   */
  async run(task) {
    while (this.running >= this.concurrency) {
      await new Promise(resolve => this.queue.push(resolve))
    }

    this.running++

    try {
      return await task()
    } finally {
      this.running--
      const resolve = this.queue.shift()
      if (resolve) resolve()
    }
  }

  /**
   * Número de tarefas aguardando execução
   */
  get pending() {
    return this.queue.length
  }
}

/**
 * Instância global para limitar concorrência de requisições HTTP
 * Padrão: 2 requisições simultâneas
 */
export const httpQueue = new RequestQueue(2)

/**
 * Executa um fetch com limite de concorrência
 * @param {string} url - URL a fazer fetch
 * @param {object} options - Opções do fetch
 * @returns {Promise<Response>}
 */
export async function fetchWithQueue(url, options = {}) {
  return httpQueue.run(() => fetch(url, options))
}
