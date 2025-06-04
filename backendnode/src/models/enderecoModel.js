const { connect } = require("../config/db.js")

// Buscar endereços de um usuário
async function buscarEnderecosPorUsuario(usuarioId) {
  const client = await connect()
  try {
    const sql = `
      SELECT * FROM Endereco 
      WHERE usuario_id = $1 AND ativo = true 
      ORDER BY padrao DESC, created_at DESC
    `
    const result = await client.query(sql, [usuarioId])
    return result.rows
  } finally {
    client.end()
  }
}

// Buscar endereço por ID
async function buscarEnderecoPorId(enderecoId, usuarioId) {
  const client = await connect()
  try {
    const sql = `
      SELECT * FROM Endereco 
      WHERE id = $1 AND usuario_id = $2 AND ativo = true
    `
    const result = await client.query(sql, [enderecoId, usuarioId])
    return result.rows[0]
  } finally {
    client.end()
  }
}

// Criar novo endereço
async function criarEndereco(enderecoData) {
  const client = await connect()

  try {
    await client.query("BEGIN")

    // Se este endereço for padrão, remover padrão dos outros
    if (enderecoData.padrao) {
      await client.query("UPDATE Endereco SET padrao = false WHERE usuario_id = $1", [enderecoData.usuario_id])
    }

    const sql = `
      INSERT INTO Endereco (
        usuario_id, rotulo, cep, rua, numero, complemento, 
        bairro, cidade, estado, padrao, ativo, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *
    `

    const values = [
      enderecoData.usuario_id,
      enderecoData.rotulo,
      enderecoData.cep,
      enderecoData.rua,
      enderecoData.numero,
      enderecoData.complemento,
      enderecoData.bairro,
      enderecoData.cidade,
      enderecoData.estado,
      enderecoData.padrao || false,
      true,
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

// Atualizar endereço
async function atualizarEndereco(enderecoId, usuarioId, enderecoData) {
  const client = await connect()

  try {
    await client.query("BEGIN")

    // Se este endereço for padrão, remover padrão dos outros
    if (enderecoData.padrao) {
      await client.query("UPDATE Endereco SET padrao = false WHERE usuario_id = $1 AND id != $2", [
        usuarioId,
        enderecoId,
      ])
    }

    const sql = `
      UPDATE Endereco SET
        rotulo = $1,
        cep = $2,
        rua = $3,
        numero = $4,
        complemento = $5,
        bairro = $6,
        cidade = $7,
        estado = $8,
        padrao = $9,
        updated_at = NOW()
      WHERE id = $10 AND usuario_id = $11
      RETURNING *
    `

    const values = [
      enderecoData.rotulo,
      enderecoData.cep,
      enderecoData.rua,
      enderecoData.numero,
      enderecoData.complemento,
      enderecoData.bairro,
      enderecoData.cidade,
      enderecoData.estado,
      enderecoData.padrao || false,
      enderecoId,
      usuarioId,
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

// Excluir endereço (soft delete)
async function excluirEndereco(enderecoId, usuarioId) {
  const client = await connect()
  try {
    const sql = `
      UPDATE Endereco SET 
        ativo = false, 
        updated_at = NOW() 
      WHERE id = $1 AND usuario_id = $2
    `
    await client.query(sql, [enderecoId, usuarioId])
  } finally {
    client.end()
  }
}

// Definir endereço como padrão
async function definirEnderecoPadrao(enderecoId, usuarioId) {
  const client = await connect()

  try {
    await client.query("BEGIN")

    // Remover padrão de todos os endereços do usuário
    await client.query("UPDATE Endereco SET padrao = false WHERE usuario_id = $1", [usuarioId])

    // Definir o endereço específico como padrão
    const sql = `
      UPDATE Endereco SET 
        padrao = true, 
        updated_at = NOW() 
      WHERE id = $1 AND usuario_id = $2
      RETURNING *
    `

    const result = await client.query(sql, [enderecoId, usuarioId])
    await client.query("COMMIT")

    return result.rows[0]
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.end()
  }
}

module.exports = {
  buscarEnderecosPorUsuario,
  buscarEnderecoPorId,
  criarEndereco,
  atualizarEndereco,
  excluirEndereco,
  definirEnderecoPadrao,
}


