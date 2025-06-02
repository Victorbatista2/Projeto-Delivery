const produtoModel = require("../models/produtoModel")

const produtoController = {
  // Cadastrar produto
  cadastrar: async (req, res) => {
    try {
      console.log("Dados recebidos para cadastro de produto:", req.body)
      const resultado = await produtoModel.cadastrar(req.body)
      res.status(201).json({
        success: true,
        message: "Produto cadastrado com sucesso!",
        data: resultado,
      })
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao cadastrar produto",
        error: error.message,
      })
    }
  },

  // Listar produtos por restaurante
  listarPorRestaurante: async (req, res) => {
    try {
      const { restauranteId } = req.params
      console.log(`Buscando produtos do restaurante: ${restauranteId}`)
      const produtos = await produtoModel.listarPorRestaurante(restauranteId)
      console.log(`Encontrados ${produtos.length} produtos`)

      res.json({
        success: true,
        data: produtos,
      })
    } catch (error) {
      console.error("Erro ao listar produtos:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao buscar produtos",
        error: error.message,
      })
    }
  },

  // Listar produtos disponíveis
  listarDisponiveis: async (req, res) => {
    try {
      const { restauranteId } = req.params
      const produtos = await produtoModel.listarDisponiveis(restauranteId)

      res.json({
        success: true,
        data: produtos,
      })
    } catch (error) {
      console.error("Erro ao listar produtos disponíveis:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao buscar produtos disponíveis",
        error: error.message,
      })
    }
  },

  // Buscar produto por ID
  buscarPorId: async (req, res) => {
    try {
      const { id } = req.params
      const produto = await produtoModel.buscarPorId(id)
      if (!produto) {
        return res.status(404).json({
          success: false,
          message: "Produto não encontrado",
        })
      }
      res.json({
        success: true,
        data: produto,
      })
    } catch (error) {
      console.error("Erro ao buscar produto:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao buscar produto",
        error: error.message,
      })
    }
  },

  // Atualizar produto
  atualizar: async (req, res) => {
    try {
      const { id } = req.params
      await produtoModel.atualizar(id, req.body)
      res.json({
        success: true,
        message: "Produto atualizado com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao atualizar produto:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao atualizar produto",
        error: error.message,
      })
    }
  },

  // Deletar produto
  deletar: async (req, res) => {
    try {
      const { id } = req.params
      const { restauranteId } = req.body
      await produtoModel.deletar(id, restauranteId)
      res.json({
        success: true,
        message: "Produto deletado com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao deletar produto:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao deletar produto",
        error: error.message,
      })
    }
  },

  // Alterar disponibilidade
  alterarDisponibilidade: async (req, res) => {
    try {
      const { id } = req.params
      const { disponivel, restauranteId } = req.body
      await produtoModel.alterarDisponibilidade(id, disponivel, restauranteId)
      res.json({
        success: true,
        message: "Disponibilidade alterada com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao alterar disponibilidade:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao alterar disponibilidade",
        error: error.message,
      })
    }
  },

  // Buscar por categoria
  buscarPorCategoria: async (req, res) => {
    try {
      const { categoria, restauranteId } = req.params
      const produtos = await produtoModel.buscarPorCategoria(categoria, restauranteId)
      res.json({
        success: true,
        data: produtos,
      })
    } catch (error) {
      console.error("Erro ao buscar por categoria:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao buscar produtos por categoria",
        error: error.message,
      })
    }
  },
}

module.exports = produtoController
