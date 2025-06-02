const enderecoModel = require("../models/enderecoModel")

const enderecoController = {
  // Listar endereços do usuário
  listarEnderecos: async (req, res) => {
    try {
      const { usuarioId } = req.params
      const enderecos = await enderecoModel.buscarEnderecosPorUsuario(usuarioId)

      // Formatar dados para o frontend
      const enderecosFormatados = enderecos.map((endereco) => ({
        id: endereco.id,
        label: endereco.rotulo,
        street: endereco.rua,
        number: endereco.numero,
        complement: endereco.complemento,
        neighborhood: endereco.bairro,
        city: endereco.cidade,
        state: endereco.estado,
        zipCode: endereco.cep,
        isDefault: endereco.padrao,
      }))

      res.json(enderecosFormatados)
    } catch (error) {
      console.error("Erro ao listar endereços:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao buscar endereços",
        error: error.message,
      })
    }
  },

  // Buscar endereço específico
  buscarEndereco: async (req, res) => {
    try {
      const { usuarioId, enderecoId } = req.params
      const endereco = await enderecoModel.buscarEnderecoPorId(enderecoId, usuarioId)

      if (!endereco) {
        return res.status(404).json({
          success: false,
          message: "Endereço não encontrado",
        })
      }

      const enderecoFormatado = {
        id: endereco.id,
        label: endereco.rotulo,
        street: endereco.rua,
        number: endereco.numero,
        complement: endereco.complemento,
        neighborhood: endereco.bairro,
        city: endereco.cidade,
        state: endereco.estado,
        zipCode: endereco.cep,
        isDefault: endereco.padrao,
      }

      res.json(enderecoFormatado)
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
  criarEndereco: async (req, res) => {
    try {
      const { usuarioId } = req.params
      const enderecoData = {
        usuario_id: Number.parseInt(usuarioId),
        rotulo: req.body.label,
        cep: req.body.zipCode,
        rua: req.body.street,
        numero: req.body.number,
        complemento: req.body.complement,
        bairro: req.body.neighborhood,
        cidade: req.body.city,
        estado: req.body.state,
        padrao: req.body.isDefault,
      }

      const novoEndereco = await enderecoModel.criarEndereco(enderecoData)

      const enderecoFormatado = {
        id: novoEndereco.id,
        label: novoEndereco.rotulo,
        street: novoEndereco.rua,
        number: novoEndereco.numero,
        complement: novoEndereco.complemento,
        neighborhood: novoEndereco.bairro,
        city: novoEndereco.cidade,
        state: novoEndereco.estado,
        zipCode: novoEndereco.cep,
        isDefault: novoEndereco.padrao,
      }

      res.status(201).json(enderecoFormatado)
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
  atualizarEndereco: async (req, res) => {
    try {
      const { usuarioId, enderecoId } = req.params
      const enderecoData = {
        rotulo: req.body.label,
        cep: req.body.zipCode,
        rua: req.body.street,
        numero: req.body.number,
        complemento: req.body.complement,
        bairro: req.body.neighborhood,
        cidade: req.body.city,
        estado: req.body.state,
        padrao: req.body.isDefault,
      }

      const enderecoAtualizado = await enderecoModel.atualizarEndereco(enderecoId, usuarioId, enderecoData)

      if (!enderecoAtualizado) {
        return res.status(404).json({
          success: false,
          message: "Endereço não encontrado",
        })
      }

      const enderecoFormatado = {
        id: enderecoAtualizado.id,
        label: enderecoAtualizado.rotulo,
        street: enderecoAtualizado.rua,
        number: enderecoAtualizado.numero,
        complement: enderecoAtualizado.complemento,
        neighborhood: enderecoAtualizado.bairro,
        city: enderecoAtualizado.cidade,
        state: enderecoAtualizado.estado,
        zipCode: enderecoAtualizado.cep,
        isDefault: enderecoAtualizado.padrao,
      }

      res.json(enderecoFormatado)
    } catch (error) {
      console.error("Erro ao atualizar endereço:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao atualizar endereço",
        error: error.message,
      })
    }
  },

  // Excluir endereço
  excluirEndereco: async (req, res) => {
    try {
      const { usuarioId, enderecoId } = req.params
      await enderecoModel.excluirEndereco(enderecoId, usuarioId)

      res.json({
        success: true,
        message: "Endereço excluído com sucesso",
      })
    } catch (error) {
      console.error("Erro ao excluir endereço:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao excluir endereço",
        error: error.message,
      })
    }
  },

  // Definir endereço como padrão
  definirPadrao: async (req, res) => {
    try {
      const { usuarioId, enderecoId } = req.params
      const enderecoPadrao = await enderecoModel.definirEnderecoPadrao(enderecoId, usuarioId)

      if (!enderecoPadrao) {
        return res.status(404).json({
          success: false,
          message: "Endereço não encontrado",
        })
      }

      const enderecoFormatado = {
        id: enderecoPadrao.id,
        label: enderecoPadrao.rotulo,
        street: enderecoPadrao.rua,
        number: enderecoPadrao.numero,
        complement: enderecoPadrao.complemento,
        neighborhood: enderecoPadrao.bairro,
        city: enderecoPadrao.cidade,
        state: enderecoPadrao.estado,
        zipCode: enderecoPadrao.cep,
        isDefault: enderecoPadrao.padrao,
      }

      res.json(enderecoFormatado)
    } catch (error) {
      console.error("Erro ao definir endereço padrão:", error)
      res.status(500).json({
        success: false,
        message: "Erro ao definir endereço padrão",
        error: error.message,
      })
    }
  },
}

module.exports = enderecoController


