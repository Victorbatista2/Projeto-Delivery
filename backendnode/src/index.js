const express = require("express")
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  console.log("Body:", req.body)
  console.log("Params:", req.params)
  console.log("Query:", req.query)
  next()
})

// Rota de teste
app.get("/", (req, res) => {
  res.json({ message: "Servidor funcionando!", timestamp: new Date().toISOString() })
})

// Rotas
const authRoutes = require("./routes/authRoutes")
const restauranteRoutes = require("./routes/restauranteRoutes")
const enderecoRoutes = require("./routes/enderecoRoutes")
const loginRoutes = require("./routes/routes_login")

app.use("/api/auth", authRoutes)
app.use("/api/restaurantes", restauranteRoutes)
app.use("/api/enderecos", enderecoRoutes)
app.use("/", loginRoutes)

// Middleware de erro
app.use((err, req, res, next) => {
  console.error("Erro:", err)
  res.status(500).json({
    success: false,
    message: "Erro interno do servidor",
    error: err.message,
  })
})

// Rota 404
app.use("*", (req, res) => {
  console.log(`Rota não encontrada: ${req.method} ${req.originalUrl}`)
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
    method: req.method,
    url: req.originalUrl,
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
  console.log(`Acesse: http://localhost:${PORT}`)
  console.log("Rotas disponíveis:")
  console.log("- GET / (teste)")
  console.log("- /api/auth/* (autenticação OAuth)")
  console.log("- /api/restaurantes/* (restaurantes)")
  console.log("- /api/enderecos/* (endereços)")
  console.log("- /api/login (login de usuário)")
  console.log("- /api/register (registro de usuário)")
  console.log("- /usuario/* (usuários)")
})

module.exports = app




