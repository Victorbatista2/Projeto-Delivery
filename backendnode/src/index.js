const express = require("express")
const cors = require("cors")
const authRoutes = require("./routes/authRoutes")
const restauranteRoutes = require("./routes/restauranteRoutes")
const produtoRoutes = require("./routes/produtoRoutes")
const pagamentoRoutes = require("./routes/pagamentoRoutes")
const enderecoRoutes = require("./routes/enderecoRoutes")

const app = express()
const PORT = process.env.PORT || 3001

// Middlewares
app.use(cors())
app.use(express.json())

// Debug middleware para todas as requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  console.log("Body:", req.body)
  console.log("Params:", req.params)
  next()
})

// Rotas
app.use("/api", authRoutes)
app.use("/api/restaurantes", restauranteRoutes)
app.use("/api/produtos", produtoRoutes)
app.use("/api/pagamento", pagamentoRoutes)
app.use("/api/usuarios", enderecoRoutes)

// Rota de teste
app.get("/", (req, res) => {
  res.json({ message: "API funcionando!" })
})

// Middleware de erro
app.use((err, req, res, next) => {
  console.error("Erro:", err)
  res.status(500).json({
    success: false,
    message: "Erro interno do servidor",
    error: err.message,
  })
})

// Middleware para rotas não encontradas
app.use("*", (req, res) => {
  console.log(`Rota não encontrada: ${req.method} ${req.originalUrl}`)
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
  })
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
  console.log("Rotas disponíveis:")
  console.log("- POST /api/login")
  console.log("- POST /api/register")
  console.log("- GET /api/restaurantes")
  console.log("- GET /api/produtos")
  console.log("- POST /api/pagamento")
  console.log("- GET /api/usuarios/:usuarioId/enderecos")
  console.log("- POST /api/usuarios/:usuarioId/enderecos")
  console.log("- PUT /api/usuarios/:usuarioId/enderecos/:enderecoId")
  console.log("- DELETE /api/usuarios/:usuarioId/enderecos/:enderecoId")
  console.log("- PATCH /api/usuarios/:usuarioId/enderecos/:enderecoId/padrao")
})


