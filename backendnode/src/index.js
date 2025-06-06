require("dotenv").config()
const express = require("express")
const cors = require("cors")
const { closePool } = require("./config/db")

const app = express()
const PORT = process.env.PORT || 3001

// Middlewares
app.use(cors())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))

// Log de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  console.log("Body:", req.body)
  console.log("Params:", req.params)
  next()
})

// Importar rotas
const restauranteRoutes = require("./routes/restauranteRoutes")
const produtoRoutes = require("./routes/produtoRoutes")
const authRoutes = require("./routes/authRoutes")
const pagamentoRoutes = require("./routes/pagamentoRoutes")
const enderecoRoutes = require("./routes/enderecoRoutes")
const loginRoutes = require("./routes/routes_login")

// Usar rotas
app.use("/api/restaurantes", restauranteRoutes)
app.use("/api/produtos", produtoRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/pagamentos", pagamentoRoutes)
app.use("/api/usuarios", enderecoRoutes) // Mudança aqui: agora as rotas de endereço começam com /api/usuarios
app.use("/api", loginRoutes)

// Rota de teste
app.get("/", (req, res) => {
  res.json({ message: "API do iFood Clone funcionando!" })
})

// Middleware para rotas não encontradas
app.use("*", (req, res) => {
  console.log(`Rota não encontrada: ${req.method} ${req.originalUrl}`)
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
  })
})

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error("Erro:", err)
  res.status(500).json({
    success: false,
    message: "Erro interno do servidor",
    error: err.message,
  })
})

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
  console.log(`API disponível em: http://localhost:${PORT}`)
  console.log("Rotas registradas:")
  console.log("- /api/auth/login (POST)")
  console.log("- /api/auth/google (POST)")
  console.log("- /api/auth/verify (GET)")
  console.log("- /api/usuarios/:usuarioId/enderecos (GET, POST)")
  console.log("- /api/usuarios/:usuarioId/enderecos/:enderecoId (GET, PUT, DELETE)")
})

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM recebido, fechando servidor...")
  server.close(async () => {
    console.log("Servidor HTTP fechado.")
    await closePool()
    process.exit(0)
  })
})

process.on("SIGINT", async () => {
  console.log("SIGINT recebido, fechando servidor...")
  server.close(async () => {
    console.log("Servidor HTTP fechado.")
    await closePool()
    process.exit(0)
  })
})

module.exports = app
