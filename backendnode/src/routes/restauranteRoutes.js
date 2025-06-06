const router = require("express").Router()
const restauranteController = require("../controllers/restauranteController")

// Debug middleware
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  next()
})

// Rota para cadastro de restaurante
router.post("/cadastro", restauranteController.cadastrar)

// Rota para login de restaurante
router.post("/login", restauranteController.login)

// Rota para listar todos os restaurantes ativos (DEVE SER ANTES DA ROTA COM PARÂMETRO)
router.get("/", restauranteController.listarTodos)

// Rota para buscar por categoria
router.get("/categoria/:categoria", restauranteController.buscarPorCategoria)

// Rota para buscar por ID
router.get("/:id", restauranteController.buscarPorId)

// Rota para atualizar restaurante
router.put("/:id", restauranteController.atualizar)

// Rota para deletar/desativar restaurante
router.delete("/:id", restauranteController.deletar)

console.log("Rotas de restaurante carregadas:")
console.log("POST /api/restaurantes/cadastro")
console.log("POST /api/restaurantes/login")
console.log("GET /api/restaurantes")
console.log("GET /api/restaurantes/categoria/:categoria")
console.log("GET /api/restaurantes/:id")
console.log("PUT /api/restaurantes/:id")
console.log("DELETE /api/restaurantes/:id")

module.exports = router
