const { OAuth2Client } = require("google-auth-library")
const fetch = require("node-fetch")
const usuarioModel = require("../models/usuarioModel")

// Configuração do Google OAuth
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

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
      if (!user.googleid) {
        await usuarioModel.updateGoogleId(user.id, googleId)
      }
    }

    res.json({
      message: "Login com Google bem-sucedido",
      usuario: {
        id: user.id,
        nome: user.nome,
        telefone: user.telefone,
        email: user.email,
        profilePicture: user.profilepicture || picture,
      },
    })
  } catch (error) {
    console.error("Erro no login com Google:", error)
    res.status(401).json({ message: "Token do Google inválido" })
  }
}

// Login com Facebook
exports.facebookLogin = async (req, res) => {
  try {
    const { accessToken, userID, email, name } = req.body

    if (!accessToken || !userID) {
      return res.status(400).json({ message: "Dados do Facebook são obrigatórios" })
    }

    // Verificar o token com o Facebook
    const fbResponse = await fetch(
      `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture`,
    )

    if (!fbResponse.ok) {
      throw new Error("Token do Facebook inválido")
    }

    const fbData = await fbResponse.json()

    if (fbData.id !== userID) {
      throw new Error("ID do usuário não confere")
    }

    // Separar nome
    const nameParts = (name || fbData.name).split(" ")
    const firstName = nameParts[0]

    const userEmail = email || fbData.email

    // Verificar se o usuário já existe
    let user = await usuarioModel.findByEmail(userEmail)

    if (!user) {
      // Criar novo usuário
      const newUser = {
        nome: firstName,
        telefone: "", // Campo vazio para usuários OAuth
        email: userEmail,
        senha: null, // Usuários OAuth não têm senha
        ativo: true,
        facebookId: userID,
        profilePicture: fbData.picture?.data?.url,
        authProvider: "facebook",
      }

      user = await usuarioModel.insertUsuarios(newUser)
    } else {
      // Atualizar dados do Facebook se necessário
      if (!user.facebookid) {
        await usuarioModel.updateFacebookId(user.id, userID)
      }
    }

    res.json({
      message: "Login com Facebook bem-sucedido",
      usuario: {
        id: user.id,
        nome: user.nome,
        telefone: user.telefone,
        email: user.email,
        profilePicture: user.profilepicture || fbData.picture?.data?.url,
      },
    })
  } catch (error) {
    console.error("Erro no login com Facebook:", error)
    res.status(401).json({ message: "Dados do Facebook inválidos" })
  }
}
