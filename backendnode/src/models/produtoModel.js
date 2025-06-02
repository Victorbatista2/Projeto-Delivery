const { pool, transaction } = require("../config/db.js")

// Cadastrar novo produto
async function cadastrar(produto) {
  return await transaction(async (client) => {
    // Inserir produto na tabela produto
    const sqlProduto = `
      INSERT INTO produto(
        id_restaurante,
        nome,
        descricao,
        preco,
        imagem,
        ativo
      ) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `

    const valuesProduto = [
      produto.restauranteId,
      produto.nomeProduto,
      produto.descricao,
      produto.preco,
      produto.imagemUrl || "",
      produto.disponivel !== false, // Default true
    ]

    const resultProduto = await client.query(sqlProduto, valuesProduto)
    const produtoInserido = resultProduto.rows[0]

    // Se há categoria, inserir na tabela produto_categoria
    if (produto.categoriaProduto) {
      // Primeiro, verificar se a categoria existe ou criar
      const sqlCategoria = `
        INSERT INTO categoria (nome) 
        VALUES ($1) 
        ON CONFLICT (nome) DO NOTHING
        RETURNING id_categoria
      `
      let categoriaResult = await client.query(sqlCategoria, [produto.categoriaProduto])

      // Se não retornou (categoria já existe), buscar o ID
      if (categoriaResult.rows.length === 0) {
        const sqlBuscarCategoria = "SELECT id_categoria FROM categoria WHERE nome = $1"
        categoriaResult = await client.query(sqlBuscarCategoria, [produto.categoriaProduto])
      }

      if (categoriaResult.rows.length > 0) {
        const categoriaId = categoriaResult.rows[0].id_categoria

        // Inserir na tabela produto_categoria
        const sqlProdutoCategoria = `
          INSERT INTO produto_categoria (id_produto, id_categoria)
          VALUES ($1, $2)
        `
        await client.query(sqlProdutoCategoria, [produtoInserido.id_produto, categoriaId])
      }
    }

    return produtoInserido
  })
}

// Listar produtos por restaurante
async function listarPorRestaurante(restauranteId) {
  const sql = `
    SELECT p.*, r.nome_restaurante, c.nome as categoria_nome
    FROM produto p
    JOIN restaurante r ON p.id_restaurante = r.id
    LEFT JOIN produto_categoria pc ON p.id_produto = pc.id_produto
    LEFT JOIN categoria c ON pc.id_categoria = c.id_categoria
    WHERE p.id_restaurante = $1 
    ORDER BY c.nome, p.nome
  `
  const result = await pool.query(sql, [restauranteId])
  return result.rows
}

// Listar produtos disponíveis por restaurante
async function listarDisponiveis(restauranteId) {
  const sql = `
    SELECT p.*, c.nome as categoria_nome
    FROM produto p
    LEFT JOIN produto_categoria pc ON p.id_produto = pc.id_produto
    LEFT JOIN categoria c ON pc.id_categoria = c.id_categoria
    WHERE p.id_restaurante = $1 AND p.ativo = true 
    ORDER BY c.nome, p.nome
  `
  const result = await pool.query(sql, [restauranteId])
  return result.rows
}

// Buscar produto por ID
async function buscarPorId(id) {
  const sql = `
    SELECT p.*, c.nome as categoria_nome
    FROM produto p
    LEFT JOIN produto_categoria pc ON p.id_produto = pc.id_produto
    LEFT JOIN categoria c ON pc.id_categoria = c.id_categoria
    WHERE p.id_produto = $1
  `
  const result = await pool.query(sql, [id])
  return result.rows[0]
}

// Atualizar produto
async function atualizar(id, produto) {
  return await transaction(async (client) => {
    const sql = `
      UPDATE produto SET
        nome = $1,
        descricao = $2,
        preco = $3,
        imagem = $4,
        ativo = $5
      WHERE id_produto = $6 AND id_restaurante = $7
    `

    const values = [
      produto.nomeProduto,
      produto.descricao,
      produto.preco,
      produto.imagemUrl,
      produto.disponivel,
      id,
      produto.restauranteId,
    ]

    await client.query(sql, values)
  })
}

// Deletar produto
async function deletar(id, restauranteId) {
  const sql = "DELETE FROM produto WHERE id_produto = $1 AND id_restaurante = $2"
  await pool.query(sql, [id, restauranteId])
}

// Alterar disponibilidade
async function alterarDisponibilidade(id, disponivel, restauranteId) {
  const sql = "UPDATE produto SET ativo = $1 WHERE id_produto = $2 AND id_restaurante = $3"
  await pool.query(sql, [disponivel, id, restauranteId])
}

// Buscar produtos por categoria
async function buscarPorCategoria(categoria, restauranteId) {
  const sql = `
    SELECT p.*, c.nome as categoria_nome
    FROM produto p
    LEFT JOIN produto_categoria pc ON p.id_produto = pc.id_produto
    LEFT JOIN categoria c ON pc.id_categoria = c.id_categoria
    WHERE c.nome ILIKE $1 AND p.id_restaurante = $2 AND p.ativo = true
    ORDER BY p.nome
  `
  const result = await pool.query(sql, [`%${categoria}%`, restauranteId])
  return result.rows
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
