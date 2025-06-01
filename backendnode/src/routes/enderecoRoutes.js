const router = require("express").Router()
const enderecoController = require("../controllers/enderecoController")

// Debug middleware
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  next()
})

// Rotas para endereços
router.get("/usuario/:usuarioId", enderecoController.listar)
router.get("/usuario/:usuarioId/padrao", enderecoController.buscarPadrao)
router.get("/:id/usuario/:usuarioId", enderecoController.buscarPorId)
router.post("/usuario/:usuarioId", enderecoController.criar)
router.put("/:id/usuario/:usuarioId", enderecoController.atualizar)
router.patch("/:id/usuario/:usuarioId/padrao", enderecoController.definirPadrao)
router.delete("/:id/usuario/:usuarioId", enderecoController.deletar)

console.log("Rotas de endereço carregadas:")
console.log("GET /api/enderecos/usuario/:usuarioId")
console.log("GET /api/enderecos/usuario/:usuarioId/padrao")
console.log("GET /api/enderecos/:id/usuario/:usuarioId")
console.log("POST /api/enderecos/usuario/:usuarioId")
console.log("PUT /api/enderecos/:id/usuario/:usuarioId")
console.log("PATCH /api/enderecos/:id/usuario/:usuarioId/padrao")
console.log("DELETE /api/enderecos/:id/usuario/:usuarioId")

module.exports = router
