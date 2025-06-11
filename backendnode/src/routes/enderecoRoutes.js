const router = require("express").Router()
const enderecoController = require("../controllers/enderecoController")

// Debug middleware
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  next()
})

// Rotas para endereços
router.get("/:usuarioId/enderecos", enderecoController.listarEnderecos)
router.get("/:usuarioId/enderecos/:enderecoId", enderecoController.buscarEndereco)
router.post("/:usuarioId/enderecos", enderecoController.criarEndereco)
router.put("/:usuarioId/enderecos/:enderecoId", enderecoController.atualizarEndereco)
router.delete("/:usuarioId/enderecos/:enderecoId", enderecoController.excluirEndereco)
router.patch("/:usuarioId/enderecos/:enderecoId/padrao", enderecoController.definirPadrao)



console.log("Rotas de endereço carregadas:")
console.log("GET /api/usuarios/:usuarioId/enderecos")
console.log("GET /api/usuarios/:usuarioId/enderecos/:enderecoId")
console.log("POST /api/usuarios/:usuarioId/enderecos")
console.log("PUT /api/usuarios/:usuarioId/enderecos/:enderecoId")
console.log("DELETE /api/usuarios/:usuarioId/enderecos/:enderecoId")
console.log("PATCH /api/usuarios/:usuarioId/enderecos/:enderecoId/padrao")

module.exports = router



