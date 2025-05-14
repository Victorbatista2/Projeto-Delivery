const restauranteModel = require("../models/restauranteModel")

// Cadastrar novo restaurante
exports.cadastrarRestaurante = async (req, res) => {
  try {
    const dadosRestaurante = req.body

    // Verificar se o CNPJ já está cadastrado
    const cnpjExistente = await restauranteModel.buscarPorCnpj(dadosRestaurante.cnpj)
    if (cnpjExistente) {
      return res.status(400).json({ message: "CNPJ já cadastrado no sistema" })
    }

    // Verificar se o e-mail já está cadastrado
    const emailExistente = await restauranteModel.buscarPorEmail(dadosRestaurante.email)
    if (emailExistente) {
      return res.status(400).json({ message: "E-mail já cadastrado no sistema" })
    }

    // Cadastrar o restaurante
    const novoRestaurante = await restauranteModel.cadastrar(dadosRestaurante)

    res.status(201).json({
      message: "Restaurante cadastrado com sucesso",
      restaurante: {
        id: novoRestaurante.id,
        nome: novoRestaurante.nomeRestaurante,
        email: novoRestaurante.email,
      },
    })
  } catch (error) {
    console.error("Erro ao cadastrar restaurante:", error)
    res.status(500).json({ message: "Erro ao cadastrar restaurante", error: error.message })
  }
}

// Listar todos os restaurantes
exports.listarRestaurantes = async (req, res) => {
  try {
    const restaurantes = await restauranteModel.listarTodos()
    res.json(restaurantes)
  } catch (error) {
    console.error("Erro ao listar restaurantes:", error)
    res.status(500).json({ message: "Erro ao listar restaurantes", error: error.message })
  }
}

// Buscar restaurante por ID
exports.buscarRestaurantePorId = async (req, res) => {
  try {
    const { id } = req.params
    const restaurante = await restauranteModel.buscarPorId(id)

    if (!restaurante) {
      return res.status(404).json({ message: "Restaurante não encontrado" })
    }

    res.json(restaurante)
  } catch (error) {
    console.error("Erro ao buscar restaurante:", error)
    res.status(500).json({ message: "Erro ao buscar restaurante", error: error.message })
  }
}

// Atualizar restaurante
exports.atualizarRestaurante = async (req, res) => {
  try {
    const { id } = req.params
    const dadosRestaurante = req.body

    // Verificar se o restaurante existe
    const restauranteExistente = await restauranteModel.buscarPorId(id)
    if (!restauranteExistente) {
      return res.status(404).json({ message: "Restaurante não encontrado" })
    }

    // Atualizar o restaurante
    await restauranteModel.atualizar(id, dadosRestaurante)

    res.json({ message: "Restaurante atualizado com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar restaurante:", error)
    res.status(500).json({ message: "Erro ao atualizar restaurante", error: error.message })
  }
}

// Alterar status do restaurante (ativar/desativar)
exports.alterarStatusRestaurante = async (req, res) => {
  try {
    const { id } = req.params
    const { ativo } = req.body

    // Verificar se o restaurante existe
    const restauranteExistente = await restauranteModel.buscarPorId(id)
    if (!restauranteExistente) {
      return res.status(404).json({ message: "Restaurante não encontrado" })
    }

    // Atualizar o status do restaurante
    await restauranteModel.alterarStatus(id, ativo)

    const statusMsg = ativo ? "ativado" : "desativado"
    res.json({ message: `Restaurante ${statusMsg} com sucesso` })
  } catch (error) {
    console.error("Erro ao alterar status do restaurante:", error)
    res.status(500).json({ message: "Erro ao alterar status do restaurante", error: error.message })
  }
}

// Login do restaurante
exports.loginRestaurante = async (req, res) => {
  try {
    const { email, senha } = req.body

    if (!email || !senha) {
      return res.status(400).json({ message: "E-mail e senha são obrigatórios" })
    }

    const restaurante = await restauranteModel.autenticar(email, senha)

    if (!restaurante) {
      return res.status(401).json({ message: "Credenciais inválidas" })
    }

    if (!restaurante.ativo) {
      return res.status(403).json({ message: "Restaurante inativo. Entre em contato com o suporte." })
    }

    res.json({
      message: "Login bem-sucedido",
      restaurante: {
        id: restaurante.id,
        nome: restaurante.nomeRestaurante,
        email: restaurante.email,
      },
    })
  } catch (error) {
    console.error("Erro no login do restaurante:", error)
    res.status(500).json({ message: "Erro no login", error: error.message })
  }
}
