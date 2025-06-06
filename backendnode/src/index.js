require("dotenv").config()
const express = require("express")
const cors = require("cors")

const { closePool } = require("./config/db")

// Importação única das rotas
const authRoutes = require("./routes/authRoutes")
const loginRoutes = require("./routes/routes_login")
const restauranteRoutes = require("./routes/restauranteRoutes")
const produtoRoutes = require("./routes/produtoRoutes")
const pagamentoRoutes = require("./routes/pagamentoRoutes")
const enderecoRoutes = require("./routes/enderecoRoutes")
const metodoPagamentoRoutes = require("./routes/metodoPagamentoRoutes")
const pedidoRoutes = require("./routes/pedidoRoutes")

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

// Uso das rotas
app.use("/api/auth", authRoutes)
app.use("/api/login", loginRoutes)
app.use("/api/restaurantes", restauranteRoutes)
app.use("/api/produtos", produtoRoutes)
app.use("/api/pagamento", pagamentoRoutes)
app.use("/api/usuarios", enderecoRoutes) // Endereços associados a usuários
app.use("/api/metodos-pagamento", metodoPagamentoRoutes)
app.use("/api/pedidos", pedidoRoutes)

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

// Início do servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
  console.log(`API disponível em: http://localhost:${PORT}`)
  console.log("Rotas registradas:")
  console.log("- POST /api/login")
  console.log("- POST /api/auth/register")
  console.log("- GET /api/restaurantes")
  console.log("- GET /api/produtos")
  console.log("- POST /api/pagamento")
  console.log("- GET /api/usuarios/:usuarioId/enderecos")
  console.log("- POST /api/usuarios/:usuarioId/enderecos")
  console.log("- PUT /api/usuarios/:usuarioId/enderecos/:enderecoId")
  console.log("- DELETE /api/usuarios/:usuarioId/enderecos/:enderecoId")
  console.log("- PATCH /api/usuarios/:usuarioId/enderecos/:enderecoId/padrao")
  console.log("- POST /api/metodos-pagamento")
  console.log("- GET /api/metodos-pagamento/usuario/:usuarioId")
  console.log("- PUT /api/metodos-pagamento/:id")
  console.log("- DELETE /api/metodos-pagamento/:id")
  console.log("- GET /api/pedidos/restaurante/:restauranteId")
  console.log("- PUT /api/pedidos/:pedidoId/aceitar")
  console.log("- PUT /api/pedidos/:pedidoId/recusar")
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