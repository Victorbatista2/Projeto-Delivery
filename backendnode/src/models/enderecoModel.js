const { pool } = require("../config/db.js")

// Buscar endereços de um usuário
async function buscarEnderecosPorUsuario(usuarioId) {
  try {
    const sql = `
      SELECT * FROM endereco_usuario 
      WHERE usuario_id = $1 AND ativo = true 
      ORDER BY endereco_padrao DESC, data_criacao DESC
    `
    const result = await pool.query(sql, [usuarioId])
    console.log(`Encontrados ${result.rows.length} endereços para usuário ${usuarioId}`)
    return result.rows
  } catch (error) {
    console.error("Erro ao buscar endereços:", error)
    throw error
  }
}

// Buscar endereço por ID
async function buscarEnderecoPorId(enderecoId, usuarioId) {
  try {
    const sql = `
      SELECT * FROM endereco_usuario 
      WHERE id = $1 AND usuario_id = $2 AND ativo = true
    `
    const result = await pool.query(sql, [enderecoId, usuarioId])
    return result.rows[0]
  } catch (error) {
    console.error("Erro ao buscar endereço por ID:", error)
    throw error
  }
}

// Criar novo endereço
async function criarEndereco(enderecoData) {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    console.log("Criando endereço com dados:", enderecoData)

    // Se este endereço for padrão, remover padrão dos outros
    if (enderecoData.endereco_padrao) {
      await client.query("UPDATE endereco_usuario SET endereco_padrao = false WHERE usuario_id = $1", [
        enderecoData.usuario_id,
      ])
    }

    const sql = `
      INSERT INTO endereco_usuario (
        usuario_id, rotulo, cep, rua, numero, complemento, 
        bairro, cidade, estado, endereco_padrao, ativo, data_criacao
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *
    `

    const values = [
      enderecoData.usuario_id,
      enderecoData.rotulo,
      enderecoData.cep,
      enderecoData.rua,
      enderecoData.numero,
      enderecoData.complemento || "",
      enderecoData.bairro,
      enderecoData.cidade,
      enderecoData.estado,
      enderecoData.endereco_padrao || false,
      true, // ativo
    ]

    console.log("Executando SQL:", sql)
    console.log("Com valores:", values)

    const result = await client.query(sql, values)
    await client.query("COMMIT")

    console.log("Endereço criado com sucesso:", result.rows[0])
    return result.rows[0]
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Erro ao criar endereço:", error)
    throw error
  } finally {
    client.release()
  }
}

// Atualizar endereço
async function atualizarEndereco(enderecoId, usuarioId, enderecoData) {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    // Se este endereço for padrão, remover padrão dos outros
    if (enderecoData.endereco_padrao) {
      await client.query("UPDATE endereco_usuario SET endereco_padrao = false WHERE usuario_id = $1 AND id != $2", [
        usuarioId,
        enderecoId,
      ])
    }

    const sql = `
      UPDATE endereco_usuario SET
        rotulo = $1,
        cep = $2,
        rua = $3,
        numero = $4,
        complemento = $5,
        bairro = $6,
        cidade = $7,
        estado = $8,
        endereco_padrao = $9
      WHERE id = $10 AND usuario_id = $11
      RETURNING *
    `

    const values = [
      enderecoData.rotulo,
      enderecoData.cep,
      enderecoData.rua,
      enderecoData.numero,
      enderecoData.complemento || "",
      enderecoData.bairro,
      enderecoData.cidade,
      enderecoData.estado,
      enderecoData.endereco_padrao || false,
      enderecoId,
      usuarioId,
    ]

    const result = await client.query(sql, values)
    await client.query("COMMIT")

    return result.rows[0]
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Erro ao atualizar endereço:", error)
    throw error
  } finally {
    client.release()
  }
}

// Excluir endereço (soft delete)
async function excluirEndereco(enderecoId, usuarioId) {
  try {
    const sql = `
      UPDATE endereco_usuario SET 
        ativo = false
      WHERE id = $1 AND usuario_id = $2
    `
    await pool.query(sql, [enderecoId, usuarioId])
  } catch (error) {
    console.error("Erro ao excluir endereço:", error)
    throw error
  }
}

// Definir endereço como padrão
async function definirEnderecoPadrao(enderecoId, usuarioId) {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    // Remover padrão de todos os endereços do usuário
    await client.query("UPDATE endereco_usuario SET endereco_padrao = false WHERE usuario_id = $1", [usuarioId])

    // Definir o endereço específico como padrão
    const sql = `
      UPDATE endereco_usuario SET 
        endereco_padrao = true
      WHERE id = $1 AND usuario_id = $2
      RETURNING *
    `

    const result = await client.query(sql, [enderecoId, usuarioId])
    await client.query("COMMIT")

    return result.rows[0]
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Erro ao definir endereço padrão:", error)
    throw error
  } finally {
    client.release()
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
