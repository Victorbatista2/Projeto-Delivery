require("dotenv").config();
const express = require("express");
const router = express.Router();
const db = require("../models/usuarioModel.js");

// Test endpoint
router.get("/teste", (req, res) => {
    res.json({ message: "Funcionando" });
});

// Get all users
router.get("/usuario", async (req, res) => {
    try {
        const usuarios = await db.selectUsers();
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get specific user
router.get("/usuario/:id", async (req, res) => {
    try {
        const usuario = await db.selectUser(req.params.id);
        if (usuario) {
            res.json(usuario);
        } else {
            res.status(404).json({ message: "Usuário não encontrado" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Register new user
router.post("/api/register", async (req, res) => {
    try {
        const { nome, sobrenome, email, senha } = req.body;
        
        if (!nome || !sobrenome || !email || !senha) {
            return res.status(400).json({ message: "Todos os campos são obrigatórios" });
        }

        const usuario = { nome, sobrenome, email, senha, ativo: true };
        const novoUsuario = await db.insertUsuarios(usuario);

        res.status(201).json({ 
            message: "Usuário registrado com sucesso",
            usuario: novoUsuario
        });
    } catch (err) {
        console.error("Erro no cadastro:", err);
        res.status(500).json({ message: "Erro ao registrar usuário", error: err.message });
    }
});

// Login
router.post("/api/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ message: "Email e senha são obrigatórios" });
        }

        const usuarios = await db.selectUsers();
        const usuario = usuarios.find(u => u.email === email && u.senha === senha);

        if (usuario) {
            res.json({
                message: "Login bem-sucedido",
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email
                }
            });
        } else {
            res.status(401).json({ message: "Credenciais inválidas" });
        }
    } catch (err) {
        res.status(500).json({ message: "Erro no login", error: err.message });
    }
});

module.exports = router;
