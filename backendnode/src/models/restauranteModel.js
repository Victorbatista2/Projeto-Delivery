const { connect } = require("../config/db.js")
const bcrypt = require("bcrypt")

// Cadastrar novo restaurante
async function cadastrar(restaurante) {
  const client = await connect()

  try {
    // Iniciar transação
    await client.query("BEGIN")

    // Hash da senha
    const senhaHash = await bcrypt.hash(restaurante.senha, 10)

    // Inserir dados do restaurante
    const sqlRestaurante = `
            INSERT INTO Restaurante(
                nome_restaurante, 
                categoria,
                cnpj, 
                telefone, 
                email, 
                cep, 
                rua, 
                numero, 
                complemento, 
                bairro, 
                cidade, 
                estado, 
                nome_responsavel, 
                cpf_responsavel, 
                telefone_responsavel, 
                email_responsavel, 
                banco, 
                agencia, 
                conta, 
                tipo_conta, 
                senha,
                ativo
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) 
            RETURNING *
        `

    const valuesRestaurante = [
      restaurante.nomeRestaurante,
      restaurante.categoria || "Restaurante",
      restaurante.cnpj,
      restaurante.telefone,
      restaurante.email,
      restaurante.cep,
      restaurante.rua,
      restaurante.numero,
      restaurante.complemento,
      restaurante.bairro,
      restaurante.cidade,
      restaurante.estado,
      restaurante.nomeResponsavel,
      restaurante.cpfResponsavel,
      restaurante.telefoneResponsavel,
      restaurante.emailResponsavel,
      restaurante.banco,
      restaurante.agencia,
      restaurante.conta,
      restaurante.tipoConta,
      senhaHash,
      true, // Ativo por padrão
    ]

    const result = await client.query(sqlRestaurante, valuesRestaurante)

    // Confirmar transação
    await client.query("COMMIT")

    return result.rows[0]
  } catch (error) {
    // Reverter transação em caso de erro
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.end()
  }
}

// Listar todos os restaurantes
async function listarTodos() {
  const client = await connect()
  try {
    const sql = "SELECT * FROM Restaurante ORDER BY nome_restaurante"
    const result = await client.query(sql)
    return result.rows
  } finally {
    client.end()
  }
}

// Listar apenas restaurantes ativos
async function listarAtivos() {
  const client = await connect()
  try {
    const sql = "SELECT * FROM Restaurante WHERE ativo = true ORDER BY nome_restaurante"
    const result = await client.query(sql)
    return result.rows
  } finally {
    client.end()
  }
}

// Buscar restaurante por ID
async function buscarPorId(id) {
  const client = await connect()
  try {
    const sql = "SELECT * FROM Restaurante WHERE id = $1"
    const result = await client.query(sql, [id])
    return result.rows[0]
  } finally {
    client.end()
  }
}

// Buscar restaurante por CNPJ
async function buscarPorCnpj(cnpj) {
  const client = await connect()
  try {
    const sql = "SELECT * FROM Restaurante WHERE cnpj = $1"
    const result = await client.query(sql, [cnpj])
    return result.rows[0]
  } finally {
    client.end()
  }
}

// Buscar restaurante por e-mail
async function buscarPorEmail(email) {
  const client = await connect()
  try {
    const sql = "SELECT * FROM Restaurante WHERE email = $1"
    const result = await client.query(sql, [email])
    return result.rows[0]
  } finally {
    client.end()
  }
}

// Buscar restaurantes por categoria
async function buscarPorCategoria(categoria) {
  const client = await connect()
  try {
    const sql = "SELECT * FROM Restaurante WHERE categoria ILIKE $1 AND ativo = true ORDER BY nome_restaurante"
    const result = await client.query(sql, [`%${categoria}%`])
    return result.rows
  } finally {
    client.end()
  }
}

// Atualizar restaurante
async function atualizar(id, restaurante) {
  const client = await connect()

  try {
    // Iniciar transação
    await client.query("BEGIN")

    let senhaHash = restaurante.senha

    // Se a senha foi fornecida, fazer o hash
    if (restaurante.senha && restaurante.senha.trim() !== "") {
      senhaHash = await bcrypt.hash(restaurante.senha, 10)
    } else {
      // Se não foi fornecida, buscar a senha atual
      const sqlSenhaAtual = "SELECT senha FROM Restaurante WHERE id = $1"
      const resultSenha = await client.query(sqlSenhaAtual, [id])
      senhaHash = resultSenha.rows[0]?.senha || restaurante.senha
    }

    // Atualizar dados do restaurante
    const sqlRestaurante = `
            UPDATE Restaurante SET
                nome_restaurante = $1, 
                categoria = $2,
                cnpj = $3, 
                telefone = $4, 
                email = $5, 
                cep = $6, 
                rua = $7, 
                numero = $8, 
                complemento = $9, 
                bairro = $10, 
                cidade = $11, 
                estado = $12, 
                nome_responsavel = $13, 
                cpf_responsavel = $14, 
                telefone_responsavel = $15, 
                email_responsavel = $16, 
                banco = $17, 
                agencia = $18, 
                conta = $19, 
                tipo_conta = $20, 
                senha = $21
            WHERE id = $22
        `

    const valuesRestaurante = [
      restaurante.nomeRestaurante,
      restaurante.categoria || "Restaurante",
      restaurante.cnpj,
      restaurante.telefone,
      restaurante.email,
      restaurante.cep,
      restaurante.rua,
      restaurante.numero,
      restaurante.complemento,
      restaurante.bairro,
      restaurante.cidade,
      restaurante.estado,
      restaurante.nomeResponsavel,
      restaurante.cpfResponsavel,
      restaurante.telefoneResponsavel,
      restaurante.emailResponsavel,
      restaurante.banco,
      restaurante.agencia,
      restaurante.conta,
      restaurante.tipoConta,
      senhaHash,
      id,
    ]

    await client.query(sqlRestaurante, valuesRestaurante)

    // Confirmar transação
    await client.query("COMMIT")
  } catch (error) {
    // Reverter transação em caso de erro
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.end()
  }
}

// Alterar status do restaurante (ativar/desativar)
async function alterarStatus(id, ativo) {
  const client = await connect()
  try {
    const sql = "UPDATE Restaurante SET ativo = $1 WHERE id = $2"
    await client.query(sql, [ativo, id])
  } finally {
    client.end()
  }
}

// Autenticar restaurante (login)
async function autenticar(email, senha) {
  const client = await connect()
  try {
    const sql = "SELECT * FROM Restaurante WHERE email = $1"
    const result = await client.query(sql, [email])

    const restaurante = result.rows[0]

    if (!restaurante) {
      return null
    }

    const senhaCorreta = await bcrypt.compare(senha, restaurante.senha)

    if (!senhaCorreta) {
      return null
    }

    return restaurante
  } finally {
    client.end()
  }
}

module.exports = {
  cadastrar,
  listarTodos,
  listarAtivos,
  buscarPorId,
  buscarPorCnpj,
  buscarPorEmail,
  buscarPorCategoria,
  atualizar,
  alterarStatus,
  autenticar,
}



