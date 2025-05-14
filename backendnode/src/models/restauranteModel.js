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
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) 
            RETURNING *
        `

    const valuesRestaurante = [
      restaurante.nomeRestaurante,
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
      false, // Inicialmente inativo até aprovação
    ]

    const result = await client.query(sqlRestaurante, valuesRestaurante)

    // Confirmar transação
    await client.query("COMMIT")

    return result.rows[0]
  } catch (error) {
    // Reverter transação em caso de erro
    await client.query("ROLLBACK")
    throw error
  }
}

// Listar todos os restaurantes
async function listarTodos() {
  const client = await connect()
  const sql = "SELECT * FROM Restaurante ORDER BY nome_restaurante"
  const result = await client.query(sql)
  return result.rows
}

// Buscar restaurante por ID
async function buscarPorId(id) {
  const client = await connect()
  const sql = "SELECT * FROM Restaurante WHERE id = $1"
  const result = await client.query(sql, [id])
  return result.rows[0]
}

// Buscar restaurante por CNPJ
async function buscarPorCnpj(cnpj) {
  const client = await connect()
  const sql = "SELECT * FROM Restaurante WHERE cnpj = $1"
  const result = await client.query(sql, [cnpj])
  return result.rows[0]
}

// Buscar restaurante por e-mail
async function buscarPorEmail(email) {
  const client = await connect()
  const sql = "SELECT * FROM Restaurante WHERE email = $1"
  const result = await client.query(sql, [email])
  return result.rows[0]
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
      // Se não foi fornecida, manter a senha atual
      const restauranteAtual = await buscarPorId(id)
      senhaHash = restauranteAtual.senha
    }

    // Atualizar dados do restaurante
    const sqlRestaurante = `
            UPDATE Restaurante SET
                nome_restaurante = $1, 
                cnpj = $2, 
                telefone = $3, 
                email = $4, 
                cep = $5, 
                rua = $6, 
                numero = $7, 
                complemento = $8, 
                bairro = $9, 
                cidade = $10, 
                estado = $11, 
                nome_responsavel = $12, 
                cpf_responsavel = $13, 
                telefone_responsavel = $14, 
                email_responsavel = $15, 
                banco = $16, 
                agencia = $17, 
                conta = $18, 
                tipo_conta = $19, 
                senha = $20
            WHERE id = $21
        `

    const valuesRestaurante = [
      restaurante.nomeRestaurante,
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
  }
}

// Alterar status do restaurante (ativar/desativar)
async function alterarStatus(id, ativo) {
  const client = await connect()
  const sql = "UPDATE Restaurante SET ativo = $1 WHERE id = $2"
  await client.query(sql, [ativo, id])
}

// Autenticar restaurante (login)
async function autenticar(email, senha) {
  const client = await connect()
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
}

module.exports = {
  cadastrar,
  listarTodos,
  buscarPorId,
  buscarPorCnpj,
  buscarPorEmail,
  atualizar,
  alterarStatus,
  autenticar,
}
