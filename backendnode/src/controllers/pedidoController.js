const pedidoModel = require("../models/pedidoModel")

const pedidoController = {
  // Buscar pedido por ID (para acompanhamento)
  buscarPorId: async (req, res) => {
    try {
      const { pedidoId } = req.params
      console.log(`Buscando pedido ${pedidoId}`)

      const pedido = await pedidoModel.buscarComDetalhes(pedidoId)

      if (!pedido) {
        return res.status(404).json({
          success: false,
          message: "Pedido não encontrado",
        })
      }

      res.json({
        success: true,
        data: pedido,
      })
    } catch (error) {
      console.error("Erro ao buscar pedido:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao buscar pedido",
        error: error.message,
      })
    }
  },

  // Listar pedidos pendentes de um restaurante
  listarPendentesRestaurante: async (req, res) => {
    try {
      const { restauranteId } = req.params
      console.log(`Buscando pedidos pendentes para restaurante ${restauranteId}`)

      const pedidos = await pedidoModel.listarPendentesRestaurante(restauranteId)

      res.json({
        success: true,
        data: pedidos,
      })
    } catch (error) {
      console.error("Erro ao listar pedidos pendentes:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao buscar pedidos pendentes",
        error: error.message,
      })
    }
  },

  // Aceitar pedido
  aceitarPedido: async (req, res) => {
    try {
      const { pedidoId } = req.params
      const { restauranteId } = req.body

      console.log(`Aceitando pedido ${pedidoId} do restaurante ${restauranteId}`)

      // Verificar se o pedido ainda está dentro do prazo (5 minutos)
      const pedido = await pedidoModel.buscarPorId(pedidoId)
      if (!pedido) {
        return res.status(404).json({
          success: false,
          message: "Pedido não encontrado",
        })
      }

      const agora = new Date()
      const dataPedido = new Date(pedido.data_pedido)
      const diffMinutos = (agora - dataPedido) / (1000 * 60)

      if (diffMinutos > 5) {
        return res.status(400).json({
          success: false,
          message: "Tempo limite para aceitar o pedido expirou",
        })
      }

      // Verificar se o pedido pertence ao restaurante
      if (pedido.id_restaurante !== Number.parseInt(restauranteId)) {
        return res.status(403).json({
          success: false,
          message: "Pedido não pertence a este restaurante",
        })
      }

      await pedidoModel.atualizarStatus(pedidoId, "Confirmado")

      res.json({
        success: true,
        message: "Pedido aceito com sucesso",
      })
    } catch (error) {
      console.error("Erro ao aceitar pedido:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao aceitar pedido",
        error: error.message,
      })
    }
  },

  // Recusar pedido
  recusarPedido: async (req, res) => {
    try {
      const { pedidoId } = req.params
      const { restauranteId } = req.body

      console.log(`Recusando pedido ${pedidoId} do restaurante ${restauranteId}`)

      // Verificar se o pedido existe e pertence ao restaurante
      const pedido = await pedidoModel.buscarPorId(pedidoId)
      if (!pedido) {
        return res.status(404).json({
          success: false,
          message: "Pedido não encontrado",
        })
      }

      if (pedido.id_restaurante !== Number.parseInt(restauranteId)) {
        return res.status(403).json({
          success: false,
          message: "Pedido não pertence a este restaurante",
        })
      }

      await pedidoModel.atualizarStatus(pedidoId, "Recusado")

      res.json({
        success: true,
        message: "Pedido recusado",
      })
    } catch (error) {
      console.error("Erro ao recusar pedido:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao recusar pedido",
        error: error.message,
      })
    }
  },

  // Criar novo pedido
  criarPedido: async (req, res) => {
    try {
      const pedidoData = req.body
      console.log("Criando novo pedido:", pedidoData)

      const novoPedido = await pedidoModel.criar(pedidoData)

      res.status(201).json({
        success: true,
        message: "Pedido criado com sucesso",
        data: novoPedido,
      })
    } catch (error) {
      console.error("Erro ao criar pedido:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao criar pedido",
        error: error.message,
      })
    }
  },
}

module.exports = pedidoController

