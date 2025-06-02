const { connect } = require("../config/db.js")

// Cadastrar novo produto
async function cadastrar(produto) {
  const client = await connect()

  try {
    await client.query("BEGIN")

    const sql = `
      INSERT INTO Produto(
        nome_produto,
        descricao,
        preco,
        categoria_produto,
        disponivel,
        tempo_preparo,
        imagem_url,
        restaurante_id,
        ingredientes,
        informacoes_nutricionais
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *
    `

    const values = [
      produto.nomeProduto,
      produto.descricao,
      produto.preco,
      produto.categoriaProduto,
      produto.disponivel !== false, // Default true
      produto.tempoPreparo || 30,
      produto.imagemUrl || null,
      produto.restauranteId,
      produto.ingredientes || null,
      produto.informacoesNutricionais || null,
    ]

    const result = await client.query(sql, values)
    await client.query("COMMIT")

    return result.rows[0]
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.end()
  }
}

// Listar produtos por restaurante
async function listarPorRestaurante(restauranteId) {
  const client = await connect()
  try {
    const sql = `
      SELECT p.*, r.nome_restaurante 
      FROM Produto p
      JOIN Restaurante r ON p.restaurante_id = r.id
      WHERE p.restaurante_id = $1 
      ORDER BY p.categoria_produto, p.nome_produto
    `
    const result = await client.query(sql, [restauranteId])
    return result.rows
  } finally {
    client.end()
  }
}

// Listar produtos disponíveis por restaurante
async function listarDisponiveis(restauranteId) {
  const client = await connect()
  try {
    const sql = `
      SELECT * FROM Produto 
      WHERE restaurante_id = $1 AND disponivel = true 
      ORDER BY categoria_produto, nome_produto
    `
    const result = await client.query(sql, [restauranteId])
    return result.rows
  } finally {
    client.end()
  }
}

// Buscar produto por ID
async function buscarPorId(id) {
  const client = await connect()
  try {
    const sql = "SELECT * FROM Produto WHERE id = $1"
    const result = await client.query(sql, [id])
    return result.rows[0]
  } finally {
    client.end()
  }
}

// Atualizar produto
async function atualizar(id, produto) {
  const client = await connect()

  try {
    await client.query("BEGIN")

    const sql = `
      UPDATE Produto SET
        nome_produto = $1,
        descricao = $2,
        preco = $3,
        categoria_produto = $4,
        disponivel = $5,
        tempo_preparo = $6,
        imagem_url = $7,
        ingredientes = $8,
        informacoes_nutricionais = $9
      WHERE id = $10 AND restaurante_id = $11
    `

    const values = [
      produto.nomeProduto,
      produto.descricao,
      produto.preco,
      produto.categoriaProduto,
      produto.disponivel,
      produto.tempoPreparo,
      produto.imagemUrl,
      produto.ingredientes,
      produto.informacoesNutricionais,
      id,
      produto.restauranteId,
    ]

    await client.query(sql, values)
    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.end()
  }
}

// Deletar produto
async function deletar(id, restauranteId) {
  const client = await connect()
  try {
    const sql = "DELETE FROM Produto WHERE id = $1 AND restaurante_id = $2"
    await client.query(sql, [id, restauranteId])
  } finally {
    client.end()
  }
}

// Alterar disponibilidade
async function alterarDisponibilidade(id, disponivel, restauranteId) {
  const client = await connect()
  try {
    const sql = "UPDATE Produto SET disponivel = $1 WHERE id = $2 AND restaurante_id = $3"
    await client.query(sql, [disponivel, id, restauranteId])
  } finally {
    client.end()
  }
}

// Buscar produtos por categoria
async function buscarPorCategoria(categoria, restauranteId) {
  const client = await connect()
  try {
    const sql = `
      SELECT * FROM Produto 
      WHERE categoria_produto ILIKE $1 AND restaurante_id = $2 AND disponivel = true
      ORDER BY nome_produto
    `
    const result = await client.query(sql, [`%${categoria}%`, restauranteId])
    return result.rows
  } finally {
    client.end()
  }
}

module.exports = {
  cadastrar,
  listarPorRestaurante,
  listarDisponiveis,
  buscarPorId,
  atualizar,
  deletar,
  alterarDisponibilidade,
  buscarPorCategoria,
}
