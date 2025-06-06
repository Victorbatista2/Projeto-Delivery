const router = require("express").Router()
const pedidoController = require("../controllers/pedidoController")

// Debug middleware
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  next()
})

// Rota para listar pedidos pendentes de um restaurante
router.get("/restaurante/:restauranteId/pendentes", pedidoController.listarPendentesRestaurante)

// Rota para aceitar pedido
router.put("/:pedidoId/aceitar", pedidoController.aceitarPedido)

// Rota para recusar pedido
router.put("/:pedidoId/recusar", pedidoController.recusarPedido)

// Rota para criar novo pedido
router.post("/", pedidoController.criarPedido)

// Rota para buscar pedido por ID (acompanhamento)
router.get("/:pedidoId", pedidoController.buscarPorId)

console.log("Rotas de pedidos carregadas:")
console.log("GET /api/pedidos/restaurante/:restauranteId/pendentes")
console.log("GET /api/pedidos/:pedidoId")
console.log("PUT /api/pedidos/:pedidoId/aceitar")
console.log("PUT /api/pedidos/:pedidoId/recusar")
console.log("POST /api/pedidos")

module.exports = router

