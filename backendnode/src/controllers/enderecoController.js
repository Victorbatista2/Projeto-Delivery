const enderecoModel = require("../models/enderecoModel")

const enderecoController = {
  // Listar endereços do usuário
  listar: async (req, res) => {
    try {
      const { usuarioId } = req.params

      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          message: "ID do usuário é obrigatório",
        })
      }

      const enderecos = await enderecoModel.buscarEnderecosPorUsuario(usuarioId)

      res.json({
        success: true,
        data: enderecos,
      })
    } catch (error) {
      console.error("Erro ao listar endereços:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao buscar endereços",
        error: error.message,
      })
    }
  },

  // Buscar endereço por ID
  buscarPorId: async (req, res) => {
    try {
      const { id, usuarioId } = req.params

      if (!id || !usuarioId) {
        return res.status(400).json({
          success: false,
          message: "ID do endereço e ID do usuário são obrigatórios",
        })
      }

      const endereco = await enderecoModel.buscarEnderecoPorId(id, usuarioId)

      if (!endereco) {
        return res.status(404).json({
          success: false,
          message: "Endereço não encontrado",
        })
      }

      res.json({
        success: true,
        data: endereco,
      })
    } catch (error) {
      console.error("Erro ao buscar endereço:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao buscar endereço",
        error: error.message,
      })
    }
  },

  // Criar novo endereço
  criar: async (req, res) => {
    try {
      const { usuarioId } = req.params
      const enderecoData = req.body

      console.log("Criando endereço para usuário:", usuarioId)
      console.log("Dados do endereço:", enderecoData)

      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          message: "ID do usuário é obrigatório",
        })
      }

      // Validar campos obrigatórios
      const camposObrigatorios = ["rua", "numero", "bairro", "cidade", "estado", "cep"]
      const camposFaltando = camposObrigatorios.filter((campo) => !enderecoData[campo])

      if (camposFaltando.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Campos obrigatórios faltando: ${camposFaltando.join(", ")}`,
        })
      }

      const novoEndereco = {
        usuarioId: Number.parseInt(usuarioId),
        rotulo: enderecoData.rotulo || "Endereço",
        rua: enderecoData.rua,
        numero: enderecoData.numero,
        complemento: enderecoData.complemento,
        bairro: enderecoData.bairro,
        cidade: enderecoData.cidade,
        estado: enderecoData.estado,
        cep: enderecoData.cep.replace(/\D/g, ""), // Remove caracteres não numéricos
        padrao: enderecoData.padrao || false,
      }

      const enderecoCriado = await enderecoModel.inserirEndereco(novoEndereco)

      res.status(201).json({
        success: true,
        message: "Endereço criado com sucesso",
        data: enderecoCriado,
      })
    } catch (error) {
      console.error("Erro ao criar endereço:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao criar endereço",
        error: error.message,
      })
    }
  },

  // Atualizar endereço
  atualizar: async (req, res) => {
    try {
      const { id, usuarioId } = req.params
      const enderecoData = req.body

      if (!id || !usuarioId) {
        return res.status(400).json({
          success: false,
          message: "ID do endereço e ID do usuário são obrigatórios",
        })
      }

      const enderecoAtualizado = await enderecoModel.atualizarEndereco(id, enderecoData, usuarioId)

      if (!enderecoAtualizado) {
        return res.status(404).json({
          success: false,
          message: "Endereço não encontrado",
        })
      }

      res.json({
        success: true,
        message: "Endereço atualizado com sucesso",
        data: enderecoAtualizado,
      })
    } catch (error) {
      console.error("Erro ao atualizar endereço:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao atualizar endereço",
        error: error.message,
      })
    }
  },

  // Definir endereço como padrão
  definirPadrao: async (req, res) => {
    try {
      const { id, usuarioId } = req.params

      if (!id || !usuarioId) {
        return res.status(400).json({
          success: false,
          message: "ID do endereço e ID do usuário são obrigatórios",
        })
      }

      const enderecoPadrao = await enderecoModel.definirEnderecoPadrao(id, usuarioId)

      if (!enderecoPadrao) {
        return res.status(404).json({
          success: false,
          message: "Endereço não encontrado",
        })
      }

      res.json({
        success: true,
        message: "Endereço definido como padrão",
        data: enderecoPadrao,
      })
    } catch (error) {
      console.error("Erro ao definir endereço padrão:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao definir endereço padrão",
        error: error.message,
      })
    }
  },

  // Deletar endereço
  deletar: async (req, res) => {
    try {
      const { id, usuarioId } = req.params

      if (!id || !usuarioId) {
        return res.status(400).json({
          success: false,
          message: "ID do endereço e ID do usuário são obrigatórios",
        })
      }

      await enderecoModel.deletarEndereco(id, usuarioId)

      res.json({
        success: true,
        message: "Endereço deletado com sucesso",
      })
    } catch (error) {
      console.error("Erro ao deletar endereço:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao deletar endereço",
        error: error.message,
      })
    }
  },

  // Buscar endereço padrão
  buscarPadrao: async (req, res) => {
    try {
      const { usuarioId } = req.params

      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          message: "ID do usuário é obrigatório",
        })
      }

      const enderecoPadrao = await enderecoModel.buscarEnderecoPadrao(usuarioId)

      res.json({
        success: true,
        data: enderecoPadrao || null,
      })
    } catch (error) {
      console.error("Erro ao buscar endereço padrão:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao buscar endereço padrão",
        error: error.message,
      })
    }
  },
}

module.exports = enderecoController



