const { connect } = require("../config/db.js")

// Buscar todos os endereços de um usuário
async function buscarEnderecosPorUsuario(usuarioId) {
  const client = await connect()
  try {
    // Verificar primeiro se a tabela existe e qual é o nome correto
    const checkTable = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name = 'endereco' OR table_name = 'Endereco' OR table_name = 'enderecos')
    `)

    console.log("Tabelas de endereço encontradas:", checkTable.rows)

    if (checkTable.rows.length === 0) {
      throw new Error("Nenhuma tabela de endereço encontrada no banco de dados")
    }

    const tableName = checkTable.rows[0].table_name
    console.log("Usando tabela:", tableName)

    const sql = `
      SELECT id, rotulo, rua, numero, complemento, bairro, cidade, estado, cep, padrao, ativo
      FROM ${tableName} 
      WHERE usuario_id = $1 AND ativo = true 
      ORDER BY padrao DESC, created_at ASC
    `
    const result = await client.query(sql, [usuarioId])
    return result.rows
  } catch (error) {
    console.error("Erro ao buscar endereços por usuário:", error)
    throw error
  } finally {
    client.end()
  }
}

// Buscar endereço por ID
async function buscarEnderecoPorId(id, usuarioId) {
  const client = await connect()
  try {
    // Verificar qual tabela usar
    const checkTable = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name = 'endereco' OR table_name = 'Endereco' OR table_name = 'enderecos')
    `)

    if (checkTable.rows.length === 0) {
      throw new Error("Nenhuma tabela de endereço encontrada no banco de dados")
    }

    const tableName = checkTable.rows[0].table_name

    const sql = `
      SELECT id, rotulo, rua, numero, complemento, bairro, cidade, estado, cep, padrao, ativo
      FROM ${tableName} 
      WHERE id = $1 AND usuario_id = $2 AND ativo = true
    `
    const result = await client.query(sql, [id, usuarioId])
    return result.rows[0]
  } catch (error) {
    console.error("Erro ao buscar endereço por ID:", error)
    throw error
  } finally {
    client.end()
  }
}

// Inserir novo endereço
async function inserirEndereco(endereco) {
  const client = await connect()

  try {
    await client.query("BEGIN")

    // Verificar qual tabela usar
    const checkTable = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name = 'endereco' OR table_name = 'Endereco' OR table_name = 'enderecos')
    `)

    console.log("Tabelas de endereço encontradas:", checkTable.rows)

    if (checkTable.rows.length === 0) {
      throw new Error(
        "Nenhuma tabela de endereço encontrada no banco de dados. Verifique se a tabela existe e tem o nome correto.",
      )
    }

    const tableName = checkTable.rows[0].table_name
    console.log("Usando tabela:", tableName)

    // Se este for o primeiro endereço do usuário, definir como padrão
    const countSql = `SELECT COUNT(*) as total FROM ${tableName} WHERE usuario_id = $1 AND ativo = true`
    const countResult = await client.query(countSql, [endereco.usuarioId])
    const isFirstAddress = Number.parseInt(countResult.rows[0].total) === 0

    const sql = `
      INSERT INTO ${tableName}(
        usuario_id, rotulo, rua, numero, complemento, bairro, 
        cidade, estado, cep, padrao, ativo
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING id, rotulo, rua, numero, complemento, bairro, cidade, estado, cep, padrao, ativo
    `

    const values = [
      endereco.usuarioId,
      endereco.rotulo,
      endereco.rua,
      endereco.numero,
      endereco.complemento || null,
      endereco.bairro,
      endereco.cidade,
      endereco.estado,
      endereco.cep,
      endereco.padrao || isFirstAddress,
      true,
    ]

    console.log("Inserindo endereço com valores:", values)
    const result = await client.query(sql, values)

    await client.query("COMMIT")
    return result.rows[0]
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Erro ao inserir endereço:", error)
    throw error
  } finally {
    client.end()
  }
}

// Atualizar endereço
async function atualizarEndereco(id, endereco, usuarioId) {
  const client = await connect()

  try {
    await client.query("BEGIN")

    // Verificar qual tabela usar
    const checkTable = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name = 'endereco' OR table_name = 'Endereco' OR table_name = 'enderecos')
    `)

    if (checkTable.rows.length === 0) {
      throw new Error("Nenhuma tabela de endereço encontrada no banco de dados")
    }

    const tableName = checkTable.rows[0].table_name

    const sql = `
      UPDATE ${tableName} SET
        rotulo = $1,
        rua = $2,
        numero = $3,
        complemento = $4,
        bairro = $5,
        cidade = $6,
        estado = $7,
        cep = $8,
        padrao = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10 AND usuario_id = $11 AND ativo = true
      RETURNING id, rotulo, rua, numero, complemento, bairro, cidade, estado, cep, padrao, ativo
    `

    const values = [
      endereco.rotulo,
      endereco.rua,
      endereco.numero,
      endereco.complemento || null,
      endereco.bairro,
      endereco.cidade,
      endereco.estado,
      endereco.cep,
      endereco.padrao || false,
      id,
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
    client.end()
  }
}

// Definir endereço como padrão
async function definirEnderecoPadrao(id, usuarioId) {
  const client = await connect()

  try {
    await client.query("BEGIN")

    // Verificar qual tabela usar
    const checkTable = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name = 'endereco' OR table_name = 'Endereco' OR table_name = 'enderecos')
    `)

    if (checkTable.rows.length === 0) {
      throw new Error("Nenhuma tabela de endereço encontrada no banco de dados")
    }

    const tableName = checkTable.rows[0].table_name

    // Remover padrão de todos os endereços do usuário
    await client.query(`UPDATE ${tableName} SET padrao = false WHERE usuario_id = $1 AND ativo = true`, [usuarioId])

    // Definir o endereço específico como padrão
    const sql = `
      UPDATE ${tableName} SET 
        padrao = true,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND usuario_id = $2 AND ativo = true
      RETURNING id, rotulo, rua, numero, complemento, bairro, cidade, estado, cep, padrao, ativo
    `

    const result = await client.query(sql, [id, usuarioId])

    await client.query("COMMIT")
    return result.rows[0]
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Erro ao definir endereço padrão:", error)
    throw error
  } finally {
    client.end()
  }
}

// Deletar endereço (soft delete)
async function deletarEndereco(id, usuarioId) {
  const client = await connect()

  try {
    await client.query("BEGIN")

    // Verificar qual tabela usar
    const checkTable = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name = 'endereco' OR table_name = 'Endereco' OR table_name = 'enderecos')
    `)

    if (checkTable.rows.length === 0) {
      throw new Error("Nenhuma tabela de endereço encontrada no banco de dados")
    }

    const tableName = checkTable.rows[0].table_name

    // Verificar se é o endereço padrão
    const checkSql = `SELECT padrao FROM ${tableName} WHERE id = $1 AND usuario_id = $2 AND ativo = true`
    const checkResult = await client.query(checkSql, [id, usuarioId])

    if (checkResult.rows.length === 0) {
      throw new Error("Endereço não encontrado")
    }

    const isPadrao = checkResult.rows[0].padrao

    // Deletar o endereço (soft delete)
    const deleteSql = `
      UPDATE ${tableName} SET 
        ativo = false,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND usuario_id = $2
    `
    await client.query(deleteSql, [id, usuarioId])

    // Se era o endereço padrão, definir outro como padrão
    if (isPadrao) {
      const newDefaultSql = `
        UPDATE ${tableName} SET 
          padrao = true,
          updated_at = CURRENT_TIMESTAMP
        WHERE usuario_id = $1 AND ativo = true AND id = (
          SELECT id FROM ${tableName} 
          WHERE usuario_id = $1 AND ativo = true 
          ORDER BY created_at ASC 
          LIMIT 1
        )
      `
      await client.query(newDefaultSql, [usuarioId])
    }

    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Erro ao deletar endereço:", error)
    throw error
  } finally {
    client.end()
  }
}

// Buscar endereço padrão do usuário
async function buscarEnderecoPadrao(usuarioId) {
  const client = await connect()
  try {
    // Verificar qual tabela usar
    const checkTable = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name = 'endereco' OR table_name = 'Endereco' OR table_name = 'enderecos')
    `)

    if (checkTable.rows.length === 0) {
      throw new Error("Nenhuma tabela de endereço encontrada no banco de dados")
    }

    const tableName = checkTable.rows[0].table_name

    const sql = `
      SELECT id, rotulo, rua, numero, complemento, bairro, cidade, estado, cep, padrao, ativo
      FROM ${tableName} 
      WHERE usuario_id = $1 AND padrao = true AND ativo = true
    `
    const result = await client.query(sql, [usuarioId])
    return result.rows[0]
  } catch (error) {
    console.error("Erro ao buscar endereço padrão:", error)
    throw error
  } finally {
    client.end()
  }
}

module.exports = {
  buscarEnderecosPorUsuario,
  buscarEnderecoPorId,
  inserirEndereco,
  atualizarEndereco,
  definirEnderecoPadrao,
  deletarEndereco,
  buscarEnderecoPadrao,
}



