const { query } = require("../config/db.js")
const bcrypt = require("bcrypt")

async function selectUsers() {
 
  try {
    const res = await query("SELECT * FROM Usuario")
    return res.rows
  } catch (err) {
    console.error("Erro ao buscar usuários:", err)
    throw err
  }
}

async function selectUser(id) {
 
  try {
    const res = await query("SELECT * FROM Usuario WHERE id=$1", [id])
    return res.rows[0]
  } catch (err) {
    console.error("Erro ao buscar usuário:", err)
    throw err
  }
}

async function findByEmail(email) {
  
  try {
    const res = await query("SELECT * FROM Usuario WHERE email=$1", [email])
    return res.rows[0]
  } catch (err) {
    console.error("Erro ao buscar usuário por email:", err)
    throw err
  }
}

async function insertUsuarios(Usuario) {
 
  try {
    // Hash da senha se for cadastro local
    let senhaHash = Usuario.senha
    if (Usuario.senha && (!Usuario.authProvider || Usuario.authProvider === "local")) {
      senhaHash = await bcrypt.hash(Usuario.senha, 10)
    }

    // Para cadastro regular (sem OAuth)
    if (!Usuario.authProvider || Usuario.authProvider === "local") {
      const sql = `
        INSERT INTO Usuario(Nome, Telefone, Email, Senha, ativo) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *
      `
      const values = [Usuario.nome, Usuario.telefone, Usuario.email, senhaHash, Usuario.ativo]
      const result = await query(sql, values)
      return result.rows[0]
    } else {
      // Para cadastro via OAuth (Google/Facebook)
      const sql = `
        INSERT INTO Usuario(Nome, Telefone, Email, Senha, ativo, googleId, facebookId, profilePicture, authProvider) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING *
      `
      const values = [
        Usuario.nome,
        Usuario.telefone,
        Usuario.email,
        senhaHash,
        Usuario.ativo,
        Usuario.googleId || null,
        Usuario.facebookId || null,
        Usuario.profilePicture || null,
        Usuario.authProvider,
      ]
      const result = await query(sql, values)
      return result.rows[0]
    }
  } catch (err) {
    console.error("Erro ao inserir usuário:", err)
    throw err
  }
}

async function updateUsuarios(id, Usuario) {
  
  try {
    const sql = "UPDATE Usuario SET Nome=$1, Telefone=$2, Email=$3, Senha=$4, ativo=$5 WHERE id=$6"
    const values = [Usuario.nome, Usuario.telefone, Usuario.email, Usuario.senha, Usuario.ativo, id]
    await query(sql, values)
  } catch (err) {
    console.error("Erro ao atualizar usuário:", err)
    throw err
  }
}

async function updateGoogleId(id, googleId) {
  
  try {
    const sql = "UPDATE Usuario SET googleId=$1 WHERE id=$2"
    await query(sql, [googleId, id])
  } catch (err) {
    console.error("Erro ao atualizar Google ID:", err)
    throw err
  }
}

async function updateFacebookId(id, facebookId) {
 
  try {
    const sql = "UPDATE Usuario SET facebookId=$1 WHERE id=$2"
    await query(sql, [facebookId, id])
  } catch (err) {
    console.error("Erro ao atualizar Facebook ID:", err)
    throw err
  }
}

async function deleteUsuario(id) {
 
  try {
    const sql = "DELETE FROM Usuario WHERE id=$1"
    await query(sql, [id])
  } catch (err) {
    console.error("Erro ao deletar usuário:", err)
    throw err
  }
}

// Função para autenticar usuário
async function autenticarUsuario(email, senha) {
  
  try {
    const sql = "SELECT * FROM Usuario WHERE email = $1 AND ativo = true"
    const result = await query(sql, [email])

    const usuario = result.rows[0]
    if (!usuario) {
      return null
    }

    // Verificar senha
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha)
    if (!senhaCorreta) {
      return null
    }

    // Remover senha do retorno
    delete usuario.senha
    return usuario
  } catch (err) {
    console.error("Erro ao autenticar usuário:", err)
    throw err
  }
}

module.exports = {
  selectUsers,
  selectUser,
  findByEmail,
  insertUsuarios,
  updateUsuarios,
  updateGoogleId,
  updateFacebookId,
  deleteUsuario,
  autenticarUsuario,
}
