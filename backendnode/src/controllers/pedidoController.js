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

  // Listar todos os pedidos de um usuário
  listarPedidosUsuario: async (req, res) => {
    try {
      const { usuarioId } = req.params
      console.log(`Buscando pedidos do usuário ${usuarioId}`)

      const pedidos = await pedidoModel.listarPorUsuario(usuarioId)

      res.json({
        success: true,
        data: pedidos,
      })
    } catch (error) {
      console.error("Erro ao listar pedidos do usuário:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao buscar pedidos do usuário",
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

  // Cancelar pedido
  cancelarPedido: async (req, res) => {
    try {
      const { pedidoId } = req.params
      const { restauranteId } = req.body

      console.log(`Cancelando pedido ${pedidoId} do restaurante ${restauranteId}`)

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

      await pedidoModel.atualizarStatus(pedidoId, "Cancelado")

      res.json({
        success: true,
        message: "Pedido cancelado com sucesso",
      })
    } catch (error) {
      console.error("Erro ao cancelar pedido:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao cancelar pedido",
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

  // Marcar pedido como saiu para entrega
  saiuParaEntrega: async (req, res) => {
    try {
      const { pedidoId } = req.params
      const { restauranteId } = req.body

      console.log(`Marcando pedido ${pedidoId} como saiu para entrega`)

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

      await pedidoModel.atualizarStatus(pedidoId, "Saiu para Entrega")

      res.json({
        success: true,
        message: "Pedido marcado como saiu para entrega",
      })
    } catch (error) {
      console.error("Erro ao marcar pedido como saiu para entrega:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao marcar pedido",
        error: error.message,
      })
    }
  },

  // Finalizar pedido (confirmar entrega)
  finalizarPedido: async (req, res) => {
    try {
      const { pedidoId } = req.params
      const { codigo_confirmacao } = req.body

      console.log(`Finalizando pedido ${pedidoId} com código ${codigo_confirmacao}`)

      // Verificar se o pedido existe
      const pedido = await pedidoModel.buscarPorId(pedidoId)
      if (!pedido) {
        return res.status(404).json({
          success: false,
          message: "Pedido não encontrado",
        })
      }

      // Verificar se o código de confirmação está correto
      if (pedido.codigo_entrega !== codigo_confirmacao) {
        return res.status(400).json({
          success: false,
          message: "Código de confirmação incorreto",
        })
      }

      await pedidoModel.atualizarStatus(pedidoId, "Entregue")

      res.json({
        success: true,
        message: "Pedido finalizado com sucesso",
      })
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao finalizar pedido",
        error: error.message,
      })
    }
  },

  // Listar pedidos aceitos de um restaurante
  listarAceitosRestaurante: async (req, res) => {
    try {
      const { restauranteId } = req.params
      console.log(`Buscando pedidos aceitos para restaurante ${restauranteId}`)

      const pedidos = await pedidoModel.listarAceitosRestaurante(restauranteId)

      res.json({
        success: true,
        data: pedidos,
      })
    } catch (error) {
      console.error("Erro ao listar pedidos aceitos:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao buscar pedidos aceitos",
        error: error.message,
      })
    }
  },

  // Listar pedidos finalizados de um restaurante
  listarFinalizadosRestaurante: async (req, res) => {
    try {
      const { restauranteId } = req.params
      console.log(`Buscando pedidos finalizados para restaurante ${restauranteId}`)

      const pedidos = await pedidoModel.listarFinalizadosRestaurante(restauranteId)

      res.json({
        success: true,
        data: pedidos,
      })
    } catch (error) {
      console.error("Erro ao listar pedidos finalizados:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao buscar pedidos finalizados",
        error: error.message,
      })
    }
  },
}

module.exports = pedidoController



