const express = require("express")
const router = express.Router()
const metodoPagamentoController = require("../controllers/metodoPagamentoController")

// Criar novo método de pagamento
router.post("/", metodoPagamentoController.criarMetodoPagamento)

// Listar métodos de pagamento de um usuário
router.get("/usuario/:usuario_id", metodoPagamentoController.listarMetodosPagamento)

// Atualizar método de pagamento (ex: definir como padrão)
router.put("/:id", metodoPagamentoController.atualizarMetodoPagamento)

// Remover método de pagamento (soft delete)
router.delete("/:id", metodoPagamentoController.removerMetodoPagamento)

module.exports = router


