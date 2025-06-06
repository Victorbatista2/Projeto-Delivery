const db = require("../config/db")

exports.criarMetodoPagamento = async (req, res) => {
  try {
    const {
      usuario_id,
      tipo,
      ultimos_4_digitos,
      nome_titular,
      bandeira,
      data_expiracao,
      token_pagamento,
      metodo_padrao,
      apelido,
    } = req.body

    // Validações básicas
    if (!usuario_id || !tipo || !ultimos_4_digitos || !nome_titular) {
      return res.status(400).json({
        error: "Campos obrigatórios: usuario_id, tipo, ultimos_4_digitos, nome_titular",
      })
    }

    // Se este método for definido como padrão, remover padrão dos outros
    if (metodo_padrao) {
      await db.query("UPDATE metodo_pagamento_usuario SET metodo_padrao = false WHERE usuario_id = $1", [usuario_id])
    }

    // Inserir novo método de pagamento
    const query = `
      INSERT INTO metodo_pagamento_usuario 
      (usuario_id, tipo, ultimos_4_digitos, nome_titular, bandeira, data_expiracao, token_pagamento, metodo_padrao, apelido, ativo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
      RETURNING *
    `

    const values = [
      usuario_id,
      tipo,
      ultimos_4_digitos,
      nome_titular,
      bandeira || null,
      data_expiracao || null,
      token_pagamento || null,
      metodo_padrao || false,
      apelido || null,
    ]

    const result = await db.query(query, values)

    res.status(201).json({
      message: "Método de pagamento criado com sucesso",
      metodo_pagamento: result.rows[0],
    })
  } catch (error) {
    console.error("Erro ao criar método de pagamento:", error)
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    })
  }
}

exports.listarMetodosPagamento = async (req, res) => {
  try {
    const { usuario_id } = req.params

    if (!usuario_id) {
      return res.status(400).json({
        error: "ID do usuário é obrigatório",
      })
    }

    const query = `
      SELECT * FROM metodo_pagamento_usuario 
      WHERE usuario_id = $1 AND ativo = true
      ORDER BY metodo_padrao DESC, data_criacao DESC
    `

    const result = await db.query(query, [usuario_id])

    res.status(200).json({
      metodos_pagamento: result.rows,
    })
  } catch (error) {
    console.error("Erro ao listar métodos de pagamento:", error)
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    })
  }
}

exports.atualizarMetodoPagamento = async (req, res) => {
  try {
    const { id } = req.params
    const { metodo_padrao, apelido } = req.body

    if (!id) {
      return res.status(400).json({
        error: "ID do método de pagamento é obrigatório",
      })
    }

    // Se definindo como padrão, remover padrão dos outros do mesmo usuário
    if (metodo_padrao) {
      const metodoAtual = await db.query("SELECT usuario_id FROM metodo_pagamento_usuario WHERE id = $1", [id])

      if (metodoAtual.rows.length === 0) {
        return res.status(404).json({
          error: "Método de pagamento não encontrado",
        })
      }

      await db.query("UPDATE metodo_pagamento_usuario SET metodo_padrao = false WHERE usuario_id = $1", [
        metodoAtual.rows[0].usuario_id,
      ])
    }

    // Construir query dinamicamente baseado nos campos fornecidos
    const updateFields = []
    const values = []
    let paramCount = 1

    if (metodo_padrao !== undefined) {
      updateFields.push(`metodo_padrao = $${paramCount}`)
      values.push(metodo_padrao)
      paramCount++
    }

    if (apelido !== undefined) {
      updateFields.push(`apelido = $${paramCount}`)
      values.push(apelido)
      paramCount++
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: "Nenhum campo para atualizar foi fornecido",
      })
    }

    updateFields.push(`data_criacao = CURRENT_TIMESTAMP`)
    values.push(id)

    const query = `
      UPDATE metodo_pagamento_usuario 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramCount} AND ativo = true
      RETURNING *
    `

    const result = await db.query(query, values)

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Método de pagamento não encontrado",
      })
    }

    res.status(200).json({
      message: "Método de pagamento atualizado com sucesso",
      metodo_pagamento: result.rows[0],
    })
  } catch (error) {
    console.error("Erro ao atualizar método de pagamento:", error)
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    })
  }
}

exports.removerMetodoPagamento = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        error: "ID do método de pagamento é obrigatório",
      })
    }

    const query = `
      DELETE FROM metodo_pagamento_usuario 
      WHERE id = $1
      RETURNING *
    `

    const result = await db.query(query, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Método de pagamento não encontrado",
      })
    }

    res.status(200).json({
      message: "Método de pagamento removido com sucesso",
    })
  } catch (error) {
    console.error("Erro ao remover método de pagamento:", error)
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    })
  }
}
