const pedidoModel = require("../models/pedidoModel")

// Serviço para limpar pedidos expirados automaticamente
class PedidoCleanupService {
  constructor() {
    this.intervalId = null
  }

  // Iniciar o serviço de limpeza automática
  iniciar() {
    console.log("Iniciando serviço de limpeza de pedidos expirados...")

    // Executar limpeza a cada 1 minuto
    this.intervalId = setInterval(async () => {
      try {
        const pedidosLimpos = await pedidoModel.limparPedidosExpirados()
        if (pedidosLimpos > 0) {
          console.log(`${pedidosLimpos} pedidos expirados foram marcados como "Não Aceito"`)
        }
      } catch (error) {
        console.error("Erro na limpeza automática de pedidos:", error)
      }
    }, 60000) // 1 minuto
  }

  // Parar o serviço
  parar() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log("Serviço de limpeza de pedidos parado")
    }
  }
}

module.exports = new PedidoCleanupService()
