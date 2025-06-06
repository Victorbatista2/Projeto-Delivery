const db = require("../config/db.js")
const bcrypt = require("bcrypt")

// Cadastrar novo restaurante
async function cadastrar(restaurante) {
  return db.transaction(async (client) => {
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
    return result.rows[0]
  })
}

// Listar todos os restaurantes
async function listarTodos() {
  const sql = "SELECT * FROM Restaurante ORDER BY nome_restaurante"
  const result = await db.query(sql)
  return result.rows
}

// Listar apenas restaurantes ativos
async function listarAtivos() {
  const sql = "SELECT * FROM Restaurante WHERE ativo = true ORDER BY nome_restaurante"
  const result = await db.query(sql)
  return result.rows
}

// Buscar restaurante por ID
async function buscarPorId(id) {
  const sql = "SELECT * FROM Restaurante WHERE id = $1"
  const result = await db.query(sql, [id])
  return result.rows[0]
}

// Buscar restaurante por CNPJ
async function buscarPorCnpj(cnpj) {
  const sql = "SELECT * FROM Restaurante WHERE cnpj = $1"
  const result = await db.query(sql, [cnpj])
  return result.rows[0]
}

// Buscar restaurante por e-mail
async function buscarPorEmail(email) {
  const sql = "SELECT * FROM Restaurante WHERE email = $1"
  const result = await db.query(sql, [email])
  return result.rows[0]
}

// Buscar restaurantes por categoria
async function buscarPorCategoria(categoria) {
  const sql = "SELECT * FROM Restaurante WHERE categoria ILIKE $1 AND ativo = true ORDER BY nome_restaurante"
  const result = await db.query(sql, [`%${categoria}%`])
  return result.rows
}

// Atualizar restaurante
async function atualizar(id, restaurante) {
  return db.transaction(async (client) => {
    // Buscar dados atuais do restaurante
    const sqlAtual = "SELECT * FROM Restaurante WHERE id = $1"
    const resultAtual = await client.query(sqlAtual, [id])
    const dadosAtuais = resultAtual.rows[0]

    if (!dadosAtuais) {
      throw new Error("Restaurante não encontrado")
    }

    let senhaHash = dadosAtuais.senha

    // Se a senha foi fornecida, fazer o hash
    if (restaurante.senha && restaurante.senha.trim() !== "") {
      senhaHash = await bcrypt.hash(restaurante.senha, 10)
    }

    // Atualizar dados do restaurante com validação
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
          senha = $21,
          imagem = $23
      WHERE id = $22
    `

    const valuesRestaurante = [
      restaurante.nomeRestaurante || dadosAtuais.nome_restaurante,
      restaurante.categoria || dadosAtuais.categoria,
      restaurante.cnpj || dadosAtuais.cnpj,
      restaurante.telefone || dadosAtuais.telefone,
      restaurante.email || dadosAtuais.email,
      restaurante.cep || dadosAtuais.cep,
      restaurante.rua || dadosAtuais.rua,
      restaurante.numero || dadosAtuais.numero,
      restaurante.complemento || dadosAtuais.complemento,
      restaurante.bairro || dadosAtuais.bairro,
      restaurante.cidade || dadosAtuais.cidade,
      restaurante.estado || dadosAtuais.estado,
      restaurante.nomeResponsavel || dadosAtuais.nome_responsavel,
      restaurante.cpfResponsavel || dadosAtuais.cpf_responsavel,
      restaurante.telefoneResponsavel || dadosAtuais.telefone_responsavel,
      restaurante.emailResponsavel || dadosAtuais.email_responsavel,
      restaurante.banco || dadosAtuais.banco,
      restaurante.agencia || dadosAtuais.agencia,
      restaurante.conta || dadosAtuais.conta,
      restaurante.tipoConta || dadosAtuais.tipo_conta,
      senhaHash,
      id,
      restaurante.imagem || dadosAtuais.imagem,
    ]

    await client.query(sqlRestaurante, valuesRestaurante)
  })
}

// Alterar status do restaurante (ativar/desativar)
async function alterarStatus(id, ativo) {
  const sql = "UPDATE Restaurante SET ativo = $1 WHERE id = $2"
  await db.query(sql, [ativo, id])
}

// Autenticar restaurante (login)
async function autenticar(email, senha) {
  const sql = "SELECT * FROM Restaurante WHERE email = $1"
  const result = await db.query(sql, [email])

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
  listarAtivos,
  buscarPorId,
  buscarPorCnpj,
  buscarPorEmail,
  buscarPorCategoria,
  atualizar,
  alterarStatus,
  autenticar,
}




