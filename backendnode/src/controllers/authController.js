const { OAuth2Client } = require("google-auth-library")
const jwt = require("jsonwebtoken")
const usuarioModel = require("../models/usuarioModel")

// Configuração do Google OAuth
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// Função para gerar JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      nome: user.nome,
    },
    process.env.JWT_SECRET || "seu_jwt_secret_muito_seguro",
    { expiresIn: "24h" },
  )
}

// Login com Google
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ message: "Token do Google é obrigatório" })
    }

    // Verificar o token com o Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const { email, name, picture, sub: googleId } = payload

    // Separar nome
    const nameParts = name.split(" ")
    const firstName = nameParts[0]

    // Verificar se o usuário já existe
    let user = await usuarioModel.findByEmail(email)

    if (!user) {
      // Criar novo usuário
      const newUser = {
        nome: firstName,
        telefone: "", // Campo vazio para usuários OAuth
        email: email,
        senha: null, // Usuários OAuth não têm senha
        ativo: true,
        googleId: googleId,
        profilePicture: picture,
        authProvider: "google",
      }

      user = await usuarioModel.insertUsuarios(newUser)
    } else {
      // Atualizar dados do Google se necessário
      if (!user.google_id) {
        await usuarioModel.updateGoogleId(user.id, googleId)
      }
    }

    // Gerar JWT token
    const jwtToken = generateToken(user)

    res.json({
      message: "Login com Google bem-sucedido",
      token: jwtToken,
      usuario: {
        id: user.id,
        nome: user.nome,
        telefone: user.telefone,
        email: user.email,
        profilePicture: user.profile_picture || picture,
      },
    })
  } catch (error) {
    console.error("Erro no login com Google:", error)
    res.status(401).json({ message: "Token do Google inválido" })
  }
}

// Login local (email/senha)
exports.loginLocal = async (req, res) => {
  try {
    console.log("Login local chamado:", req.body)
    const { email, senha } = req.body

    if (!email || !senha) {
      return res.status(400).json({ message: "Email e senha são obrigatórios" })
    }

    // Autenticar usuário
    const user = await usuarioModel.autenticarUsuario(email, senha)

    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas" })
    }

    // Gerar JWT token
    const jwtToken = generateToken(user)

    res.json({
      message: "Login realizado com sucesso",
      token: jwtToken,
      usuario: {
        id: user.id,
        nome: user.nome,
        telefone: user.telefone,
        email: user.email,
        profilePicture: user.profile_picture,
      },
    })
  } catch (error) {
    console.error("Erro no login local:", error)
    res.status(500).json({ message: "Erro interno do servidor" })
  }
}

// Verificar token JWT
exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "Token não fornecido" })
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET || "seu_jwt_secret_muito_seguro")
    const user = await usuarioModel.selectUser(decoded.id)

    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" })
    }

    res.json({
      valid: true,
      usuario: {
        id: user.id,
        nome: user.nome,
        telefone: user.telefone,
        email: user.email,
        profilePicture: user.profile_picture,
      },
    })
  } catch (error) {
    console.error("Erro ao verificar token:", error)
    res.status(401).json({ message: "Token inválido" })
  }
}
