const jwt = require("jsonwebtoken")
const usuarioModel = require("../models/usuarioModel")

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: "Token de acesso requerido" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "seu_jwt_secret_muito_seguro")
    const user = await usuarioModel.selectUser(decoded.id)

    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" })
    }

    req.user = user
    next()
  } catch (error) {
    console.error("Erro na autenticação:", error)
    return res.status(403).json({ message: "Token inválido" })
  }
}

module.exports = { authenticateToken }
