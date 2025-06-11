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

// Rota para cancelar pedido
router.put("/:pedidoId/cancelar", pedidoController.cancelarPedido)

// Rota para marcar como saiu para entrega
router.put("/:pedidoId/saiu-entrega", pedidoController.saiuParaEntrega)

// Rota para finalizar pedido (confirmar entrega)
router.put("/:pedidoId/finalizar", pedidoController.finalizarPedido)

// Rota para criar novo pedido
router.post("/", pedidoController.criarPedido)

// Rota para buscar pedido por ID (acompanhamento)
router.get("/:pedidoId", pedidoController.buscarPorId)

console.log("Rotas de pedidos carregadas:")
console.log("GET /api/pedidos/restaurante/:restauranteId/pendentes")
console.log("GET /api/pedidos/:pedidoId")
console.log("PUT /api/pedidos/:pedidoId/aceitar")
console.log("PUT /api/pedidos/:pedidoId/recusar")
console.log("PUT /api/pedidos/:pedidoId/cancelar")
console.log("PUT /api/pedidos/:pedidoId/saiu-entrega")
console.log("PUT /api/pedidos/:pedidoId/finalizar")
console.log("POST /api/pedidos")

module.exports = router



