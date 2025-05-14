const express = require("express")
const router = express.Router()
const restauranteController = require("../controllers/restauranteController")

// Rota para cadastro de restaurante
router.post("/cadastro", restauranteController.cadastrarRestaurante)

// Rota para login de restaurante
router.post("/login", restauranteController.loginRestaurante)

// Rota para listar todos os restaurantes
router.get("/", restauranteController.listarRestaurantes)

// Rota para buscar restaurante por ID
router.get("/:id", restauranteController.buscarRestaurantePorId)

// Rota para atualizar restaurante
router.put("/:id", restauranteController.atualizarRestaurante)

// Rota para alterar status do restaurante
router.patch("/:id/status", restauranteController.alterarStatusRestaurante)

module.exports = router
