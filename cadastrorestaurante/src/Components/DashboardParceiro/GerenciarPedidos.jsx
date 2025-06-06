"use client"

import { useState, useEffect } from "react"
import "./GerenciarPedidos.css"

const GerenciarPedidos = ({ restauranteId }) => {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [processando, setProcessando] = useState({})

  // Carregar pedidos pendentes
  const carregarPedidos = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/pedidos/restaurante/${restauranteId}/pendentes`)
      const data = await response.json()

      if (data.success) {
        setPedidos(data.data)
      }
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error)
    } finally {
      setLoading(false)
    }
  }

  // Polling para atualizar pedidos em tempo real
  useEffect(() => {
    carregarPedidos()

    const interval = setInterval(() => {
      carregarPedidos()
    }, 10000) // Atualiza a cada 10 segundos

    return () => clearInterval(interval)
  }, [restauranteId])

  // Calcular tempo restante para cada pedido
  const calcularTempoRestante = (dataPedido) => {
    const agora = new Date()
    const pedidoTime = new Date(dataPedido)
    const diffMs = agora - pedidoTime
    const diffMinutos = Math.floor(diffMs / (1000 * 60))
    const tempoRestante = 5 - diffMinutos

    return Math.max(0, tempoRestante)
  }

  // Aceitar pedido
  const aceitarPedido = async (pedidoId) => {
    setProcessando((prev) => ({ ...prev, [pedidoId]: true }))

    try {
      const response = await fetch(`http://localhost:3001/api/pedidos/${pedidoId}/aceitar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ restauranteId }),
      })

      const data = await response.json()

      if (data.success) {
        // Remove o pedido da lista após aceitar
        setPedidos((prev) => prev.filter((p) => p.id_pedido !== pedidoId))
        alert("Pedido aceito com sucesso!")
      } else {
        alert("Erro ao aceitar pedido: " + data.message)
      }
    } catch (error) {
      console.error("Erro ao aceitar pedido:", error)
      alert("Erro ao aceitar pedido")
    } finally {
      setProcessando((prev) => ({ ...prev, [pedidoId]: false }))
    }
  }

  // Recusar pedido
  const recusarPedido = async (pedidoId) => {
    setProcessando((prev) => ({ ...prev, [pedidoId]: true }))

    try {
      const response = await fetch(`http://localhost:3001/api/pedidos/${pedidoId}/recusar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ restauranteId }),
      })

      const data = await response.json()

      if (data.success) {
        // Remove o pedido da lista após recusar
        setPedidos((prev) => prev.filter((p) => p.id_pedido !== pedidoId))
        alert("Pedido recusado")
      } else {
        alert("Erro ao recusar pedido: " + data.message)
      }
    } catch (error) {
      console.error("Erro ao recusar pedido:", error)
      alert("Erro ao recusar pedido")
    } finally {
      setProcessando((prev) => ({ ...prev, [pedidoId]: false }))
    }
  }

  // Formatar valor monetário
  const formatarValor = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  // Formatar data
  const formatarData = (data) => {
    return new Date(data).toLocaleString("pt-BR")
  }

  if (loading) {
    return (
      <div className="gerenciar-pedidos">
        <h2>Pedidos Pendentes</h2>
        <div className="loading">Carregando pedidos...</div>
      </div>
    )
  }

  return (
    <div className="gerenciar-pedidos">
      <div className="pedidos-header">
        <h2>Pedidos Pendentes</h2>
        <div className="pedidos-info">
          <span className="pedidos-count">{pedidos.length} pedidos aguardando</span>
          <button onClick={carregarPedidos} className="btn-refresh">
            🔄 Atualizar
          </button>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div className="no-pedidos">
          <p>Nenhum pedido pendente no momento</p>
        </div>
      ) : (
        <div className="pedidos-list">
          {pedidos.map((pedido) => {
            const tempoRestante = calcularTempoRestante(pedido.data_pedido)
            const isExpirando = tempoRestante <= 1

            return (
              <div key={pedido.id_pedido} className={`pedido-card ${isExpirando ? "expirando" : ""}`}>
                <div className="pedido-header">
                  <div className="pedido-info">
                    <h3>Pedido #{pedido.id_pedido}</h3>
                    <p className="cliente-nome">{pedido.usuario_nome}</p>
                    <p className="pedido-data">{formatarData(pedido.data_pedido)}</p>
                  </div>
                  <div className="pedido-timer">
                    <div className={`timer ${isExpirando ? "expirando" : ""}`}>{tempoRestante}min</div>
                    <span className="timer-label">restantes</span>
                  </div>
                </div>

                <div className="pedido-detalhes">
                  <div className="endereco-entrega">
                    <h4>Endereço de Entrega:</h4>
                    <p>{pedido.endereco_entrega}</p>
                  </div>

                  <div className="itens-pedido">
                    <h4>Itens do Pedido:</h4>
                    {pedido.itens &&
                      pedido.itens.map((item, index) => (
                        <div key={index} className="item-pedido">
                          <span className="item-quantidade">{item.quantidade}x</span>
                          <span className="item-nome">{item.produto_nome}</span>
                          <span className="item-preco">{formatarValor(item.preco_unitario)}</span>
                        </div>
                      ))}
                  </div>

                  <div className="pedido-pagamento">
                    <div className="pagamento-info">
                      <p>
                        <strong>Método de Entrega:</strong> {pedido.metodo_entrega}
                      </p>
                      <p>
                        <strong>Método de Pagamento:</strong> {pedido.metodo_pagamento}
                      </p>
                      {pedido.troco_para && (
                        <p>
                          <strong>Troco para:</strong> {formatarValor(pedido.troco_para)}
                        </p>
                      )}
                    </div>
                    <div className="total-pedido">
                      <strong>Total: {formatarValor(pedido.total)}</strong>
                    </div>
                  </div>
                </div>

                <div className="pedido-actions">
                  <button
                    onClick={() => recusarPedido(pedido.id_pedido)}
                    disabled={processando[pedido.id_pedido]}
                    className="btn-recusar"
                  >
                    {processando[pedido.id_pedido] ? "Processando..." : "Recusar"}
                  </button>
                  <button
                    onClick={() => aceitarPedido(pedido.id_pedido)}
                    disabled={processando[pedido.id_pedido]}
                    className="btn-aceitar"
                  >
                    {processando[pedido.id_pedido] ? "Processando..." : "Aceitar Pedido"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default GerenciarPedidos
