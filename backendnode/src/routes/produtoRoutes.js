const router = require("express").Router()
const produtoController = require("../controllers/produtoController")

// Debug middleware
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  next()
})

// Rota para cadastro de produto
router.post("/", produtoController.cadastrar)

// Rota para listar produtos por restaurante
router.get("/restaurante/:restauranteId", produtoController.listarPorRestaurante)

// Rota para listar produtos disponíveis
router.get("/restaurante/:restauranteId/disponiveis", produtoController.listarDisponiveis)

// Rota para buscar por categoria
router.get("/restaurante/:restauranteId/categoria/:categoria", produtoController.buscarPorCategoria)

// Rota para buscar por ID
router.get("/:id", produtoController.buscarPorId)

// Rota para atualizar produto
router.put("/:id", produtoController.atualizar)

// Rota para deletar produto
router.delete("/:id", produtoController.deletar)

// Rota para alterar disponibilidade
router.patch("/:id/disponibilidade", produtoController.alterarDisponibilidade)

console.log("Rotas de produto carregadas:")
console.log("POST /api/produtos")
console.log("GET /api/produtos/restaurante/:restauranteId")
console.log("GET /api/produtos/restaurante/:restauranteId/disponiveis")
console.log("GET /api/produtos/restaurante/:restauranteId/categoria/:categoria")
console.log("GET /api/produtos/:id")
console.log("PUT /api/produtos/:id")
console.log("DELETE /api/produtos/:id")
console.log("PATCH /api/produtos/:id/disponibilidade")

module.exports = router


