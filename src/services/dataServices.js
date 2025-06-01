// Service para gerenciar dados com cache e retry automático
class DataService {
  constructor() {
    this.cache = new Map()
    this.pendingRequests = new Map()
    this.retryAttempts = 3
    this.retryDelay = 1000
  }

  // Função para fazer requisições com cache e retry automático
  async fetchWithCache(url, cacheKey, maxAge = 5 * 60 * 1000) {
    // 5 minutos de cache
    // Verificar se existe no cache e ainda é válido
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < maxAge) {
      console.log(`Dados do cache para ${cacheKey}:`, cached.data)
      return cached.data
    }

    // Verificar se já existe uma requisição pendente para evitar duplicatas
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`Aguardando requisição pendente para ${cacheKey}`)
      return await this.pendingRequests.get(cacheKey)
    }

    // Criar nova requisição com retry automático
    const requestPromise = this.makeRequestWithRetry(url, cacheKey)
    this.pendingRequests.set(cacheKey, requestPromise)

    try {
      const data = await requestPromise

      // Salvar no cache
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      })

      console.log(`Dados salvos no cache para ${cacheKey}:`, data)
      return data
    } finally {
      // Remover da lista de requisições pendentes
      this.pendingRequests.delete(cacheKey)
    }
  }

  // Fazer requisição com retry automático
  async makeRequestWithRetry(url, cacheKey) {
    let lastError = null

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`Tentativa ${attempt}/${this.retryAttempts} para ${cacheKey}`)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 segundos timeout

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
          },
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log(`Sucesso na tentativa ${attempt} para ${cacheKey}`)
        return data
      } catch (error) {
        lastError = error
        console.warn(`Tentativa ${attempt} falhou para ${cacheKey}:`, error.message)

        // Se não é a última tentativa, aguardar antes de tentar novamente
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt) // Delay progressivo
        }
      }
    }

    // Se chegou aqui, todas as tentativas falharam
    console.error(`Todas as tentativas falharam para ${cacheKey}:`, lastError)
    throw lastError
  }

  // Função para aguardar um tempo
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Buscar todos os restaurantes
  async getRestaurants() {
    try {
      const data = await this.fetchWithCache("http://localhost:3001/api/restaurantes", "restaurants")

      // Garantir que sempre retorna um array
      if (!Array.isArray(data)) {
        console.warn("Dados de restaurantes não são um array:", data)
        return []
      }

      return data
    } catch (error) {
      console.error("Erro ao buscar restaurantes:", error)
      return [] // Retornar array vazio em caso de erro
    }
  }

  // Buscar restaurantes por categoria
  async getRestaurantsByCategory(category) {
    try {
      const data = await this.fetchWithCache(
        `http://localhost:3001/api/restaurantes/categoria/${encodeURIComponent(category)}`,
        `restaurants_category_${category}`,
      )

      // Garantir que sempre retorna um array
      if (!Array.isArray(data)) {
        console.warn(`Dados de restaurantes da categoria ${category} não são um array:`, data)
        return []
      }

      return data
    } catch (error) {
      console.error(`Erro ao buscar restaurantes da categoria ${category}:`, error)
      return [] // Retornar array vazio em caso de erro
    }
  }

  // Buscar produtos
  async getProducts() {
    try {
      const data = await this.fetchWithCache("http://localhost:3001/api/products", "products")

      // Garantir que sempre retorna um array
      if (!Array.isArray(data)) {
        console.warn("Dados de produtos não são um array:", data)
        return []
      }

      return data
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
      return [] // Retornar array vazio em caso de erro
    }
  }

  // Limpar cache específico
  clearCache(cacheKey) {
    this.cache.delete(cacheKey)
  }

  // Limpar todo o cache
  clearAllCache() {
    this.cache.clear()
  }

  // Pré-carregar dados importantes
  async preloadData() {
    console.log("Pré-carregando dados...")
    try {
      // Carregar restaurantes e produtos em paralelo
      await Promise.allSettled([this.getRestaurants(), this.getProducts()])
      console.log("Pré-carregamento concluído")
    } catch (error) {
      console.error("Erro no pré-carregamento:", error)
    }
  }
}

// Criar instância singleton
const dataService = new DataService()

export default dataService

