const db = require("../config/db.js")

// Listar todos os pedidos de um usuário
async function listarPorUsuario(usuarioId) {
  const sql = `
    SELECT 
      p.*,
      r.nome_restaurante as restaurante_nome,
      r.logo_url as restaurante_logo,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'produto_nome', pr.nome,
            'quantidade', ip.quantidade,
            'preco_unitario', ip.preco_unitario
          )
        ) FILTER (WHERE ip.id_item_pedido IS NOT NULL), 
        '[]'
      ) as itens
    FROM pedido p
    LEFT JOIN restaurante r ON p.id_restaurante = r.id
    LEFT JOIN itens_pedido ip ON p.id_pedido = ip.id_pedido
    LEFT JOIN produto pr ON ip.id_produto = pr.id_produto
    WHERE p.id_usuario = $1
    GROUP BY p.id_pedido, r.nome_restaurante, r.logo_url
    ORDER BY p.data_pedido DESC
  `

  const result = await db.query(sql, [usuarioId])
  return result.rows
}

// Listar pedidos pendentes de um restaurante (últimos 5 minutos)
async function listarPendentesRestaurante(restauranteId) {
  const sql = `
    SELECT 
      p.*,
      u.nome as usuario_nome,
      u.telefone as usuario_telefone,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'produto_nome', pr.nome,
            'quantidade', ip.quantidade,
            'preco_unitario', ip.preco_unitario
          )
        ) FILTER (WHERE ip.id_item_pedido IS NOT NULL), 
        '[]'
      ) as itens
    FROM pedido p
    LEFT JOIN usuario u ON p.id_usuario = u.id
    LEFT JOIN itens_pedido ip ON p.id_pedido = ip.id_pedido
    LEFT JOIN produto pr ON ip.id_produto = pr.id_produto
    WHERE p.id_restaurante = $1 
      AND p.status = 'Aguardando Confirmação'
      AND p.data_pedido >= NOW() - INTERVAL '5 minutes'
    GROUP BY p.id_pedido, u.nome, u.telefone
    ORDER BY p.data_pedido DESC
  `

  const result = await db.query(sql, [restauranteId])
  return result.rows
}

// Buscar pedido por ID
async function buscarPorId(pedidoId) {
  const sql = "SELECT * FROM pedido WHERE id_pedido = $1"
  const result = await db.query(sql, [pedidoId])
  return result.rows[0]
}

// Buscar pedido com detalhes completos (para acompanhamento)
async function buscarComDetalhes(pedidoId) {
  const sql = `
    SELECT 
      p.*,
      u.nome as usuario_nome,
      u.telefone as usuario_telefone,
      r.nome_restaurante as restaurante_nome,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'produto_nome', pr.nome,
            'quantidade', ip.quantidade,
            'preco_unitario', ip.preco_unitario
          )
        ) FILTER (WHERE ip.id_item_pedido IS NOT NULL), 
        '[]'
      ) as itens
    FROM pedido p
    LEFT JOIN usuario u ON p.id_usuario = u.id
    LEFT JOIN restaurante r ON p.id_restaurante = r.id
    LEFT JOIN itens_pedido ip ON p.id_pedido = ip.id_pedido
    LEFT JOIN produto pr ON ip.id_produto = pr.id_produto
    WHERE p.id_pedido = $1
    GROUP BY p.id_pedido, u.nome, u.telefone, r.nome_restaurante
  `

  const result = await db.query(sql, [pedidoId])
  return result.rows[0]
}

// Atualizar status do pedido
async function atualizarStatus(pedidoId, novoStatus) {
  return db.transaction(async (client) => {
    // Atualizar status do pedido
    const sqlPedido = "UPDATE pedido SET status = $1 WHERE id_pedido = $2"
    await client.query(sqlPedido, [novoStatus, pedidoId])

    // Adicionar registro de acompanhamento
    const sqlAcompanhamento = `
      INSERT INTO acompanhamento_pedido (id_pedido, status, data_hora_status)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
    `
    await client.query(sqlAcompanhamento, [pedidoId, novoStatus])
  })
}

// Gerar código de confirmação de 4 dígitos
function gerarCodigoConfirmacao(pedidoId) {
  let codigo
  do {
    codigo = Math.floor(1000 + Math.random() * 9000).toString()
  } while (codigo === pedidoId.toString())

  return codigo
}

// Criar novo pedido
async function criar(pedidoData) {
  return db.transaction(async (client) => {
    // Gerar código de confirmação temporário (será substituído após obter o ID)
    let codigoConfirmacao = Math.floor(1000 + Math.random() * 9000).toString()

    // Inserir pedido
    const sqlPedido = `
      INSERT INTO pedido (
        id_usuario, id_restaurante, total, endereco_entrega, 
        metodo_entrega, metodo_pagamento, troco_para, codigo_entrega
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `

    const valuesPedido = [
      pedidoData.id_usuario,
      pedidoData.id_restaurante,
      pedidoData.total,
      pedidoData.endereco_entrega,
      pedidoData.metodo_entrega,
      pedidoData.metodo_pagamento,
      pedidoData.troco_para || null,
      codigoConfirmacao,
    ]

    const resultPedido = await client.query(sqlPedido, valuesPedido)
    const pedido = resultPedido.rows[0]

    // Verificar se o código é igual ao ID e gerar novo se necessário
    if (codigoConfirmacao === pedido.id_pedido.toString()) {
      do {
        codigoConfirmacao = Math.floor(1000 + Math.random() * 9000).toString()
      } while (codigoConfirmacao === pedido.id_pedido.toString())

      // Atualizar com o novo código
      const sqlUpdateCodigo = "UPDATE pedido SET codigo_entrega = $1 WHERE id_pedido = $2"
      await client.query(sqlUpdateCodigo, [codigoConfirmacao, pedido.id_pedido])
      pedido.codigo_entrega = codigoConfirmacao
    }

    // Inserir itens do pedido
    if (pedidoData.itens && pedidoData.itens.length > 0) {
      for (const item of pedidoData.itens) {
        const sqlItem = `
          INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
          VALUES ($1, $2, $3, $4)
        `
        await client.query(sqlItem, [pedido.id_pedido, item.id_produto, item.quantidade, item.preco_unitario])
      }
    }

    // Adicionar primeiro status de acompanhamento
    const sqlAcompanhamento = `
      INSERT INTO acompanhamento_pedido (id_pedido, status)
      VALUES ($1, 'Aguardando Confirmação')
    `
    await client.query(sqlAcompanhamento, [pedido.id_pedido])

    return pedido
  })
}

// Limpar pedidos expirados (mais de 5 minutos sem confirmação)
async function limparPedidosExpirados() {
  return db.transaction(async (client) => {
    // Buscar pedidos expirados
    const sqlBuscar = `
      SELECT id_pedido FROM pedido 
      WHERE status = 'Aguardando Confirmação' 
        AND data_pedido < NOW() - INTERVAL '5 minutes'
    `
    const pedidosExpirados = await client.query(sqlBuscar)

    if (pedidosExpirados.rows.length > 0) {
      // Atualizar status para "Não Aceito"
      const sqlAtualizar = `
        UPDATE pedido 
        SET status = 'Não Aceito' 
        WHERE status = 'Aguardando Confirmação' 
          AND data_pedido < NOW() - INTERVAL '5 minutes'
      `
      await client.query(sqlAtualizar)

      // Adicionar acompanhamento para cada pedido expirado
      for (const pedido of pedidosExpirados.rows) {
        const sqlAcompanhamento = `
          INSERT INTO acompanhamento_pedido (id_pedido, status)
          VALUES ($1, 'Não Aceito')
        `
        await client.query(sqlAcompanhamento, [pedido.id_pedido])
      }
    }

    return pedidosExpirados.rows.length
  })
}

// Listar pedidos aceitos/confirmados de um restaurante
async function listarAceitosRestaurante(restauranteId) {
  const sql = `
    SELECT 
      p.*,
      u.nome as usuario_nome,
      u.telefone as usuario_telefone,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'produto_nome', pr.nome,
            'quantidade', ip.quantidade,
            'preco_unitario', ip.preco_unitario
          )
        ) FILTER (WHERE ip.id_item_pedido IS NOT NULL), 
        '[]'
      ) as itens
    FROM pedido p
    LEFT JOIN usuario u ON p.id_usuario = u.id
    LEFT JOIN itens_pedido ip ON p.id_pedido = ip.id_pedido
    LEFT JOIN produto pr ON ip.id_produto = pr.id_produto
    WHERE p.id_restaurante = $1 
      AND p.status IN ('Confirmado', 'Preparando', 'Pronto')
    GROUP BY p.id_pedido, u.nome, u.telefone
    ORDER BY p.data_pedido DESC
  `

  const result = await db.query(sql, [restauranteId])
  return result.rows
}

// Listar pedidos finalizados de um restaurante
async function listarFinalizadosRestaurante(restauranteId) {
  const sql = `
    SELECT 
      p.*,
      u.nome as usuario_nome,
      u.telefone as usuario_telefone,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'produto_nome', pr.nome,
            'quantidade', ip.quantidade,
            'preco_unitario', ip.preco_unitario
          )
        ) FILTER (WHERE ip.id_item_pedido IS NOT NULL), 
        '[]'
      ) as itens
    FROM pedido p
    LEFT JOIN usuario u ON p.id_usuario = u.id
    LEFT JOIN itens_pedido ip ON p.id_pedido = ip.id_pedido
    LEFT JOIN produto pr ON ip.id_produto = pr.id_produto
    WHERE p.id_restaurante = $1 
      AND p.status IN ('Entregue', 'Saiu para Entrega', 'Cancelado', 'Recusado', 'Não Aceito')
    GROUP BY p.id_pedido, u.nome, u.telefone
    ORDER BY p.data_pedido DESC
    LIMIT 50
  `

  const result = await db.query(sql, [restauranteId])
  return result.rows
}

module.exports = {
  listarPorUsuario,
  listarPendentesRestaurante,
  listarAceitosRestaurante,
  listarFinalizadosRestaurante,
  buscarPorId,
  buscarComDetalhes,
  atualizarStatus,
  criar,
  limparPedidosExpirados,
  gerarCodigoConfirmacao,
}





