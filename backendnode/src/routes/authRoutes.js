const router = require("express").Router()
const authController = require("../controllers/authController")

// Rota para login com Google
router.post("/google", authController.googleLogin)

// Rota para login local (email/senha)
router.post("/login", authController.loginLocal)

// Rota para verificar token JWT
router.get("/verify", authController.verifyToken)

module.exports = router
