require("dotenv").config()
const express = require("express")
const router = express.Router()
const db = require("../models/usuarioModel.js")
const bcrypt = require("bcrypt")

// Test endpoint
router.get("/teste", (req, res) => {
  res.json({ message: "Funcionando" })
})

// Get all users
router.get("/usuario", async (req, res) => {
  try {
    const usuarios = await db.selectUsers()
    res.json(usuarios)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get specific user
router.get("/usuario/:id", async (req, res) => {
  try {
    const usuario = await db.selectUser(req.params.id)
    if (usuario) {
      res.json(usuario)
    } else {
      res.status(404).json({ message: "Usuário não encontrado" })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Register new user
router.post("/api/register", async (req, res) => {
  try {
    const { nome, telefone, email, senha } = req.body

    if (!nome || !telefone || !email || !senha) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios" })
    }

    // Verificar se o usuário já existe
    const usuarioExistente = await db.findByEmail(email)
    if (usuarioExistente) {
      return res.status(400).json({ message: "Usuário já existe com este email" })
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10)

    // Cadastro regular sem OAuth
    const usuario = {
      nome,
      telefone,
      email,
      senha: senhaHash,
      ativo: true,
      authProvider: "local",
    }

    const novoUsuario = await db.insertUsuarios(usuario)

    res.status(201).json({
      message: "Usuário registrado com sucesso",
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        telefone: novoUsuario.telefone,
        email: novoUsuario.email,
      },
    })
  } catch (err) {
    console.error("Erro no cadastro:", err)
    res.status(500).json({ message: "Erro ao registrar usuário", error: err.message })
  }
})

// Login
router.post("/api/login", async (req, res) => {
  try {
    const { email, senha } = req.body

    console.log("Tentativa de login para:", email)

    if (!email || !senha) {
      return res.status(400).json({ message: "Email e senha são obrigatórios" })
    }

    // Buscar usuário por email
    const usuario = await db.findByEmail(email)

    if (!usuario) {
      console.log("Usuário não encontrado:", email)
      return res.status(401).json({ message: "Credenciais inválidas" })
    }

    console.log("Usuário encontrado:", usuario.email)

    // Verificar se a senha está correta
    let senhaCorreta = false

    if (usuario.senha) {
      // Se a senha está hasheada, usar bcrypt
      if (usuario.senha.startsWith("$2b$") || usuario.senha.startsWith("$2a$")) {
        senhaCorreta = await bcrypt.compare(senha, usuario.senha)
      } else {
        // Se a senha não está hasheada (dados antigos), comparar diretamente
        senhaCorreta = senha === usuario.senha

        // Se a senha está correta mas não hasheada, vamos hashear e atualizar
        if (senhaCorreta) {
          const senhaHash = await bcrypt.hash(senha, 10)
          await db.updateUsuarios(usuario.id, {
            nome: usuario.nome,
            telefone: usuario.telefone,
            email: usuario.email,
            senha: senhaHash,
            ativo: usuario.ativo,
          })
        }
      }
    }

    if (!senhaCorreta) {
      console.log("Senha incorreta para:", email)
      return res.status(401).json({ message: "Credenciais inválidas" })
    }

    console.log("Login bem-sucedido para:", email)

    res.json({
      message: "Login bem-sucedido",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        telefone: usuario.telefone,
        email: usuario.email,
      },
    })
  } catch (err) {
    console.error("Erro no login:", err)
    res.status(500).json({ message: "Erro no login", error: err.message })
  }
})

module.exports = router
