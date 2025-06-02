const restauranteModel = require("../models/restauranteModel")
const { getPoolStatus } = require("../config/db")

const restauranteController = {
  // Cadastrar restaurante
  cadastrar: async (req, res) => {
    try {
      console.log("Dados recebidos para cadastro:", req.body)
      console.log("Status do pool antes do cadastro:", getPoolStatus())

      const resultado = await restauranteModel.cadastrar(req.body)

      console.log("Status do pool após cadastro:", getPoolStatus())
      res.status(201).json({
        success: true,
        message: "Restaurante cadastrado com sucesso!",
        data: resultado,
      })
    } catch (error) {
      console.error("Erro ao cadastrar restaurante:", error)
      console.log("Status do pool após erro:", getPoolStatus())
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
      console.log("Status do pool antes do login:", getPoolStatus())

      const { email, senha } = req.body
      const resultado = await restauranteModel.autenticar(email, senha)

      if (!resultado) {
        return res.status(401).json({
          success: false,
          message: "Credenciais inválidas",
        })
      }

      console.log("Status do pool após login:", getPoolStatus())
      res.json({
        success: true,
        message: "Login realizado com sucesso!",
        data: resultado,
      })
    } catch (error) {
      console.error("Erro no login:", error)
      console.log("Status do pool após erro no login:", getPoolStatus())
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
      console.log("Buscando todos os restaurantes ativos...")
      console.log("Status do pool antes da listagem:", getPoolStatus())

      const restaurantes = await restauranteModel.listarAtivos()
      console.log(`Encontrados ${restaurantes.length} restaurantes`)

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

      console.log("Status do pool após listagem:", getPoolStatus())
      res.json(restaurantesFormatados)
    } catch (error) {
      console.error("Erro ao listar restaurantes:", error)
      console.log("Status do pool após erro na listagem:", getPoolStatus())
      res.status(500).json({
        success: false,
        message: "Erro ao buscar restaurantes",
        error: error.message,
      })
    }
  },

  // Buscar por categoria
  buscarPorCategoria: async (req, res) => {
    try {
      const { categoria } = req.params
      console.log(`Buscando restaurantes da categoria: ${categoria}`)
      console.log("Status do pool antes da busca por categoria:", getPoolStatus())

      const restaurantes = await restauranteModel.buscarPorCategoria(categoria)
      console.log(`Encontrados ${restaurantes.length} restaurantes na categoria ${categoria}`)

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

      console.log("Status do pool após busca por categoria:", getPoolStatus())
      res.json(restaurantesFormatados)
    } catch (error) {
      console.error("Erro ao buscar por categoria:", error)
      console.log("Status do pool após erro na busca por categoria:", getPoolStatus())
      res.status(500).json({
        success: false,
        message: "Erro ao buscar restaurantes por categoria",
        error: error.message,
      })
    }
  },

  // Buscar por ID
  buscarPorId: async (req, res) => {
    try {
      const { id } = req.params
      console.log("Status do pool antes da busca por ID:", getPoolStatus())

      const restaurante = await restauranteModel.buscarPorId(id)

      if (!restaurante) {
        return res.status(404).json({
          success: false,
          message: "Restaurante não encontrado",
        })
      }

      console.log("Status do pool após busca por ID:", getPoolStatus())
      res.json({
        success: true,
        data: restaurante,
      })
    } catch (error) {
      console.error("Erro ao buscar restaurante:", error)
      console.log("Status do pool após erro na busca por ID:", getPoolStatus())
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
      console.log("Status do pool antes da atualização:", getPoolStatus())

      await restauranteModel.atualizar(id, req.body)

      console.log("Status do pool após atualização:", getPoolStatus())
      res.json({
        success: true,
        message: "Restaurante atualizado com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao atualizar restaurante:", error)
      console.log("Status do pool após erro na atualização:", getPoolStatus())
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
      console.log("Status do pool antes da deleção:", getPoolStatus())

      await restauranteModel.alterarStatus(id, false)

      console.log("Status do pool após deleção:", getPoolStatus())
      res.json({
        success: true,
        message: "Restaurante desativado com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao desativar restaurante:", error)
      console.log("Status do pool após erro na deleção:", getPoolStatus())
      res.status(500).json({
        success: false,
        message: "Erro ao desativar restaurante",
        error: error.message,
      })
    }
  },
}

module.exports = restauranteController
