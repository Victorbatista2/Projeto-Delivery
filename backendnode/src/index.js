const express = require("express")
const cors = require("cors")
const restauranteRoutes = require("./routes/restauranteRoutes")
const produtoRoutes = require("./routes/produtoRoutes")
const authRoutes = require("./routes/authRoutes")
const pagamentoRoutes = require("./routes/pagamentoRoutes")
const enderecoRoutes = require("./routes/enderecoRoutes")
const loginRoutes = require("./routes/routes_login")

const app = express()
const PORT = process.env.PORT || 3001

// Middlewares
app.use(cors())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))

// Log de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// Rotas
app.use("/api/restaurantes", restauranteRoutes)
app.use("/api/produtos", produtoRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/pagamentos", pagamentoRoutes)
app.use("/api/enderecos", enderecoRoutes)
app.use("/api", loginRoutes)

// Rota de teste
app.get("/", (req, res) => {
  res.json({ message: "API do iFood Clone funcionando!" })
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
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
  })
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
  console.log(`API disponível em: http://localhost:${PORT}`)
})

module.exports = app
