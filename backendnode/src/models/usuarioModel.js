<<<<<<< HEAD
const { pool } = require("../config/db.js")
const bcrypt = require("bcrypt")

async function selectUsers() {
  try {
    const res = await pool.query("SELECT * FROM usuario")
    return res.rows
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    throw error
=======
const { query } = require("../config/db.js")
const bcrypt = require("bcrypt")

async function selectUsers() {
 
  try {
    const res = await query("SELECT * FROM Usuario")
    return res.rows
  } catch (err) {
    console.error("Erro ao buscar usuários:", err)
    throw err
>>>>>>> fe44377103c1601160e79261240ff6d40949a8e6
  }
}

async function selectUser(id) {
<<<<<<< HEAD
  try {
    const res = await pool.query("SELECT * FROM usuario WHERE id=$1", [id])
    return res.rows[0]
  } catch (error) {
    console.error("Erro ao buscar usuário:", error)
    throw error
=======
 
  try {
    const res = await query("SELECT * FROM Usuario WHERE id=$1", [id])
    return res.rows[0]
  } catch (err) {
    console.error("Erro ao buscar usuário:", err)
    throw err
>>>>>>> fe44377103c1601160e79261240ff6d40949a8e6
  }
}

async function findByEmail(email) {
<<<<<<< HEAD
  try {
    console.log("Buscando usuário por email:", email)
    const res = await pool.query("SELECT * FROM usuario WHERE email=$1", [email])
    console.log("Usuário encontrado:", res.rows[0] ? "Sim" : "Não")
    return res.rows[0]
  } catch (error) {
    console.error("Erro ao buscar usuário por email:", error)
    throw error
=======
  
  try {
    const res = await query("SELECT * FROM Usuario WHERE email=$1", [email])
    return res.rows[0]
  } catch (err) {
    console.error("Erro ao buscar usuário por email:", err)
    throw err
>>>>>>> fe44377103c1601160e79261240ff6d40949a8e6
  }
}

async function insertUsuarios(Usuario) {
<<<<<<< HEAD
=======
 
>>>>>>> fe44377103c1601160e79261240ff6d40949a8e6
  try {
    // Hash da senha se for cadastro local
    let senhaHash = Usuario.senha
    if (Usuario.senha && (!Usuario.authProvider || Usuario.authProvider === "local")) {
      senhaHash = await bcrypt.hash(Usuario.senha, 10)
    }

    // Para cadastro regular (sem OAuth)
    if (!Usuario.authProvider || Usuario.authProvider === "local") {
      const sql = `
        INSERT INTO usuario(nome, telefone, email, senha, ativo, data_criacao) 
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) 
        RETURNING *
      `
      const values = [Usuario.nome, Usuario.telefone, Usuario.email, senhaHash, Usuario.ativo]
<<<<<<< HEAD
      const result = await pool.query(sql, values)
=======
      const result = await query(sql, values)
>>>>>>> fe44377103c1601160e79261240ff6d40949a8e6
      return result.rows[0]
    } else {
      // Para cadastro via OAuth (Google)
      const sql = `
        INSERT INTO usuario(nome, telefone, email, senha, ativo, google_id, profile_picture, auth_provider, data_criacao) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) 
        RETURNING *
      `
      const values = [
        Usuario.nome,
        Usuario.telefone,
        Usuario.email,
        senhaHash,
        Usuario.ativo,
        Usuario.googleId || null,
        Usuario.profilePicture || null,
        Usuario.authProvider,
      ]
<<<<<<< HEAD
      const result = await pool.query(sql, values)
      return result.rows[0]
    }
  } catch (error) {
    console.error("Erro ao inserir usuário:", error)
    throw error
=======
      const result = await query(sql, values)
      return result.rows[0]
    }
  } catch (err) {
    console.error("Erro ao inserir usuário:", err)
    throw err
>>>>>>> fe44377103c1601160e79261240ff6d40949a8e6
  }
}

async function updateUsuarios(id, Usuario) {
<<<<<<< HEAD
=======
  
>>>>>>> fe44377103c1601160e79261240ff6d40949a8e6
  try {
    const sql =
      "UPDATE usuario SET nome=$1, telefone=$2, email=$3, senha=$4, ativo=$5, data_atualizacao=CURRENT_TIMESTAMP WHERE id=$6"
    const values = [Usuario.nome, Usuario.telefone, Usuario.email, Usuario.senha, Usuario.ativo, id]
<<<<<<< HEAD
    await pool.query(sql, values)
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error)
    throw error
=======
    await query(sql, values)
  } catch (err) {
    console.error("Erro ao atualizar usuário:", err)
    throw err
>>>>>>> fe44377103c1601160e79261240ff6d40949a8e6
  }
}

async function updateGoogleId(id, googleId) {
<<<<<<< HEAD
  try {
    const sql = "UPDATE usuario SET google_id=$1, data_atualizacao=CURRENT_TIMESTAMP WHERE id=$2"
    await pool.query(sql, [googleId, id])
  } catch (error) {
    console.error("Erro ao atualizar Google ID:", error)
    throw error
=======
  
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
>>>>>>> fe44377103c1601160e79261240ff6d40949a8e6
  }
}

async function deleteUsuario(id) {
<<<<<<< HEAD
  try {
    const sql = "DELETE FROM usuario WHERE id=$1"
    await pool.query(sql, [id])
  } catch (error) {
    console.error("Erro ao deletar usuário:", error)
    throw error
=======
 
  try {
    const sql = "DELETE FROM Usuario WHERE id=$1"
    await query(sql, [id])
  } catch (err) {
    console.error("Erro ao deletar usuário:", err)
    throw err
>>>>>>> fe44377103c1601160e79261240ff6d40949a8e6
  }
}

// Função para autenticar usuário
async function autenticarUsuario(email, senha) {
<<<<<<< HEAD
  try {
    const sql = "SELECT * FROM usuario WHERE email = $1 AND ativo = true"
    const result = await pool.query(sql, [email])
=======
  
  try {
    const sql = "SELECT * FROM Usuario WHERE email = $1 AND ativo = true"
    const result = await query(sql, [email])
>>>>>>> fe44377103c1601160e79261240ff6d40949a8e6

    const usuario = result.rows[0]
    if (!usuario) {
      return null
    }

    // Verificar senha apenas se for login local
    if (usuario.auth_provider === "google" && usuario.google_id) {
      // Usuário OAuth Google, não verificar senha
      delete usuario.senha
      return usuario
    }

    // Verificar senha para login local
    if (!usuario.senha) {
      return null
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha)
    if (!senhaCorreta) {
      return null
    }

    // Remover senha do retorno
    delete usuario.senha
    return usuario
<<<<<<< HEAD
  } catch (error) {
    console.error("Erro ao autenticar usuário:", error)
    throw error
=======
  } catch (err) {
    console.error("Erro ao autenticar usuário:", err)
    throw err
>>>>>>> fe44377103c1601160e79261240ff6d40949a8e6
  }
}

module.exports = {
  selectUsers,
  selectUser,
  findByEmail,
  insertUsuarios,
  updateUsuarios,
  updateGoogleId,
  deleteUsuario,
  autenticarUsuario,
}
