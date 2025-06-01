const restauranteModel = require("../models/restauranteModel")

const restauranteController = {
  // Cadastrar restaurante
  cadastrar: async (req, res) => {
    try {
      console.log("Dados recebidos para cadastro:", req.body)
      const resultado = await restauranteModel.cadastrar(req.body)
      res.status(201).json({
        success: true,
        message: "Restaurante cadastrado com sucesso!",
        data: resultado,
      })
    } catch (error) {
      console.error("Erro ao cadastrar restaurante:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao cadastrar restaurante",
        error: error.message,
      })
    }
  },

  // Login do restaurante
  login: async (req, res) => {
    try {
      const { email, senha } = req.body
      const resultado = await restauranteModel.autenticar(email, senha)
      if (!resultado) {
        return res.status(401).json({
          success: false,
          message: "Credenciais inválidas",
        })
      }
      res.json({
        success: true,
        message: "Login realizado com sucesso!",
        data: resultado,
      })
    } catch (error) {
      console.error("Erro no login:", error)
      res.status(401).json({
        success: false,
        message: "Credenciais inválidas",
        error: error.message,
      })
    }
  },

  // Listar todos os restaurantes ativos
  listarTodos: async (req, res) => {
    try {
      console.log("=== INICIANDO BUSCA DE RESTAURANTES ===")
      console.log("Timestamp:", new Date().toISOString())

      const restaurantes = await restauranteModel.listarAtivos()
      console.log(`Restaurantes encontrados no banco: ${restaurantes.length}`)

      if (restaurantes.length > 0) {
        console.log("Primeiro restaurante:", restaurantes[0])
      }

      // Formatar dados para o frontend
      const restaurantesFormatados = restaurantes.map((restaurante) => ({
        id: restaurante.id,
        name: restaurante.nome_restaurante,
        category: restaurante.categoria || "Restaurante",
        rating: "4.5",
        distance: "2.5 km",
        deliveryTime: "30-45 min",
        deliveryFee: "Grátis",
        image: "/placeholder.svg?height=150&width=250",
        featured: false,
        coupon: null,
      }))

      console.log(`Enviando ${restaurantesFormatados.length} restaurantes formatados`)
      console.log("=== FIM DA BUSCA DE RESTAURANTES ===")

      res.json(restaurantesFormatados)
    } catch (error) {
      console.error("=== ERRO AO LISTAR RESTAURANTES ===")
      console.error("Erro completo:", error)
      console.error("Stack trace:", error.stack)

      res.status(500).json({
        success: false,
        message: "Erro ao buscar restaurantes",
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    }
  },

  // Buscar por categoria
  buscarPorCategoria: async (req, res) => {
    try {
      const { categoria } = req.params
      console.log(`=== BUSCANDO CATEGORIA: ${categoria} ===`)
      console.log("Timestamp:", new Date().toISOString())

      const restaurantes = await restauranteModel.buscarPorCategoria(categoria)
      console.log(`Restaurantes encontrados para categoria ${categoria}: ${restaurantes.length}`)

      // Formatar dados para o frontend
      const restaurantesFormatados = restaurantes.map((restaurante) => ({
        id: restaurante.id,
        name: restaurante.nome_restaurante,
        category: restaurante.categoria || "Restaurante",
        rating: "4.5",
        distance: "2.5 km",
        deliveryTime: "30-45 min",
        deliveryFee: "Grátis",
        image: "/placeholder.svg?height=150&width=250",
        featured: false,
        coupon: null,
      }))

      console.log(`Enviando ${restaurantesFormatados.length} restaurantes da categoria ${categoria}`)
      console.log("=== FIM DA BUSCA POR CATEGORIA ===")

      res.json(restaurantesFormatados)
    } catch (error) {
      console.error(`=== ERRO AO BUSCAR CATEGORIA ${req.params.categoria} ===`)
      console.error("Erro completo:", error)
      console.error("Stack trace:", error.stack)

      res.status(500).json({
        success: false,
        message: "Erro ao buscar restaurantes por categoria",
        error: error.message,
        categoria: req.params.categoria,
        timestamp: new Date().toISOString(),
      })
    }
  },

  // Buscar por ID
  buscarPorId: async (req, res) => {
    try {
      const { id } = req.params
      const restaurante = await restauranteModel.buscarPorId(id)
      if (!restaurante) {
        return res.status(404).json({
          success: false,
          message: "Restaurante não encontrado",
        })
      }
      res.json({
        success: true,
        data: restaurante,
      })
    } catch (error) {
      console.error("Erro ao buscar restaurante:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao buscar restaurante",
        error: error.message,
      })
    }
  },

  // Atualizar restaurante
  atualizar: async (req, res) => {
    try {
      const { id } = req.params
      await restauranteModel.atualizar(id, req.body)
      res.json({
        success: true,
        message: "Restaurante atualizado com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao atualizar restaurante:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao atualizar restaurante",
        error: error.message,
      })
    }
  },

  // Deletar restaurante
  deletar: async (req, res) => {
    try {
      const { id } = req.params
      await restauranteModel.alterarStatus(id, false)
      res.json({
        success: true,
        message: "Restaurante desativado com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao desativar restaurante:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao desativar restaurante",
        error: error.message,
      })
    }
  },
}

module.exports = restauranteController
