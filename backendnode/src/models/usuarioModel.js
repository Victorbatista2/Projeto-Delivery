const { connect } = require("../config/db.js")

async function selectUsers() {
  const client = await connect()
  try {
    const res = await client.query("SELECT * FROM Usuario")
    return res.rows
  } finally {
    client.end()
  }
}

async function selectUser(id) {
  const client = await connect()
  try {
    const res = await client.query("SELECT * FROM Usuario WHERE id=$1", [id])
    return res.rows[0]
  } finally {
    client.end()
  }
}

async function findByEmail(email) {
  const client = await connect()
  try {
    const res = await client.query("SELECT * FROM Usuario WHERE email=$1", [email])
    return res.rows[0]
  } finally {
    client.end()
  }
}

async function insertUsuarios(Usuario) {
  const client = await connect()

  try {
    // Para cadastro regular (sem OAuth)
    if (!Usuario.authProvider || Usuario.authProvider === "local") {
      const sql = `
        INSERT INTO Usuario(Nome, Telefone, Email, Senha, ativo) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *
      `
      const values = [Usuario.nome, Usuario.telefone, Usuario.email, Usuario.senha, Usuario.ativo]
      const result = await client.query(sql, values)
      return result.rows[0]
    } else {
      // Para cadastro via OAuth (Google/Facebook) - só se as colunas existirem
      const sql = `
        INSERT INTO Usuario(Nome, Telefone, Email, Senha, ativo, googleId, facebookId, profilePicture, authProvider) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING *
      `
      const values = [
        Usuario.nome,
        Usuario.telefone,
        Usuario.email,
        Usuario.senha,
        Usuario.ativo,
        Usuario.googleId || null,
        Usuario.facebookId || null,
        Usuario.profilePicture || null,
        Usuario.authProvider,
      ]
      const result = await client.query(sql, values)
      return result.rows[0]
    }
  } finally {
    client.end()
  }
}

async function updateUsuarios(id, Usuario) {
  const client = await connect()
  try {
    const sql = "UPDATE Usuario SET Nome=$1, Telefone=$2, Email=$3, Senha=$4, ativo=$5 WHERE id=$6"
    const values = [Usuario.nome, Usuario.telefone, Usuario.email, Usuario.senha, Usuario.ativo, id]
    await client.query(sql, values)
  } finally {
    client.end()
  }
}

async function updateGoogleId(id, googleId) {
  const client = await connect()
  try {
    const sql = "UPDATE Usuario SET googleId=$1 WHERE id=$2"
    await client.query(sql, [googleId, id])
  } finally {
    client.end()
  }
}

async function updateFacebookId(id, facebookId) {
  const client = await connect()
  try {
    const sql = "UPDATE Usuario SET facebookId=$1 WHERE id=$2"
    await client.query(sql, [facebookId, id])
  } finally {
    client.end()
  }
}

async function deleteUsuario(id) {
  const client = await connect()
  try {
    const sql = "DELETE FROM Usuario WHERE id=$1"
    await client.query(sql, [id])
  } finally {
    client.end()
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
}



