const router = require("express").Router()
const authController = require("../controllers/authController")

// Rota para login com Google
router.post("/auth/google", authController.googleLogin)

// Rota para login com Facebook
router.post("/auth/facebook", authController.facebookLogin)

module.exports = router



