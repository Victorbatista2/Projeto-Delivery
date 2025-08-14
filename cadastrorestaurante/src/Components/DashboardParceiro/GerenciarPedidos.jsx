import { useState, useEffect } from "react"
import "./GerenciarPedidos.css"

const GerenciarPedidos = ({ restauranteId }) => {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [processando, setProcessando] = useState({})
  const [abaAtiva, setAbaAtiva] = useState("pendentes")
  const [pedidosAceitos, setPedidosAceitos] = useState([])
  const [pedidosFinalizados, setPedidosFinalizados] = useState([])

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

  // Carregar pedidos aceitos
  const carregarPedidosAceitos = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/pedidos/restaurante/${restauranteId}/aceitos`)
      const data = await response.json()

      if (data.success) {
        setPedidosAceitos(data.data)
      }
    } catch (error) {
      console.error("Erro ao carregar pedidos aceitos:", error)
    }
  }

  // Carregar pedidos finalizados
  const carregarPedidosFinalizados = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/pedidos/restaurante/${restauranteId}/finalizados`)
      const data = await response.json()

      if (data.success) {
        setPedidosFinalizados(data.data)
      }
    } catch (error) {
      console.error("Erro ao carregar pedidos finalizados:", error)
    }
  }

  // Polling para atualizar pedidos em tempo real
  useEffect(() => {
    const carregarDados = () => {
      if (abaAtiva === "pendentes") {
        carregarPedidos()
      } else if (abaAtiva === "aceitos") {
        carregarPedidosAceitos()
      } else if (abaAtiva === "finalizados") {
        carregarPedidosFinalizados()
      }
    }

    carregarDados()

    const interval = setInterval(() => {
      carregarDados()
    }, 10000)

    return () => clearInterval(interval)
  }, [restauranteId, abaAtiva])

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
      // Encontrar o pedido na lista de pendentes
      const pedidoAceito = pedidos.find((p) => p.id_pedido === pedidoId)

      if (!pedidoAceito) {
        alert("Pedido não encontrado na lista de pendentes")
        return
      }

      const response = await fetch(`http://localhost:3001/api/pedidos/${pedidoId}/aceitar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ restauranteId }),
      })

      const data = await response.json()

      if (data.success) {
        // Remove o pedido da lista de pendentes
        setPedidos((prev) => prev.filter((p) => p.id_pedido !== pedidoId))

        // Adiciona o pedido à lista de aceitos com status atualizado
        const pedidoAtualizado = {
          ...pedidoAceito,
          status: "Confirmado",
        }

        setPedidosAceitos((prev) => [pedidoAtualizado, ...prev])

        // Muda para a aba de pedidos aceitos
        setAbaAtiva("aceitos")

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

  // Cancelar pedido aceito
  const cancelarPedido = async (pedidoId) => {
    if (!window.confirm("Tem certeza que deseja cancelar este pedido?")) {
      return
    }

    setProcessando((prev) => ({ ...prev, [pedidoId]: true }))

    try {
      const response = await fetch(`http://localhost:3001/api/pedidos/${pedidoId}/cancelar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ restauranteId }),
      })

      const data = await response.json()

      if (data.success) {
        // Remove o pedido da lista de aceitos
        setPedidosAceitos((prev) => prev.filter((p) => p.id_pedido !== pedidoId))
        alert("Pedido cancelado com sucesso")
      } else {
        alert("Erro ao cancelar pedido: " + data.message)
      }
    } catch (error) {
      console.error("Erro ao cancelar pedido:", error)
      alert("Erro ao cancelar pedido")
    } finally {
      setProcessando((prev) => ({ ...prev, [pedidoId]: false }))
    }
  }

  // Marcar pedido como saiu para entrega
  const marcarSaiuParaEntrega = async (pedidoId) => {
    setProcessando((prev) => ({ ...prev, [pedidoId]: true }))

    try {
      const response = await fetch(`http://localhost:3001/api/pedidos/${pedidoId}/saiu-entrega`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ restauranteId }),
      })

      const data = await response.json()

      if (data.success) {
        // Remove o pedido da lista de aceitos
        setPedidosAceitos((prev) => prev.filter((p) => p.id_pedido !== pedidoId))
        alert("Pedido marcado como saiu para entrega!")
      } else {
        alert("Erro ao marcar pedido: " + data.message)
      }
    } catch (error) {
      console.error("Erro ao marcar pedido:", error)
      alert("Erro ao marcar pedido")
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

  return (
    <div className="gerenciar-pedidos">
      <div className="pedidos-header">
        <h2>Gerenciar Pedidos</h2>
        <button
          onClick={() => {
            if (abaAtiva === "pendentes") {
              carregarPedidos()
            } else if (abaAtiva === "aceitos") {
              carregarPedidosAceitos()
            } else if (abaAtiva === "finalizados") {
              carregarPedidosFinalizados()
            }
          }}
          className="btn-refresh"
        >
          🔄 Atualizar
        </button>
      </div>

      <div className="pedidos-tabs">
        <button
          className={`tab-button ${abaAtiva === "pendentes" ? "active" : ""}`}
          onClick={() => setAbaAtiva("pendentes")}
        >
          Pedidos Pendentes ({pedidos.length})
        </button>
        <button
          className={`tab-button ${abaAtiva === "aceitos" ? "active" : ""}`}
          onClick={() => setAbaAtiva("aceitos")}
        >
          Pedidos Aceitos ({pedidosAceitos.length})
        </button>
        <button
          className={`tab-button ${abaAtiva === "finalizados" ? "active" : ""}`}
          onClick={() => setAbaAtiva("finalizados")}
        >
          Pedidos Finalizados ({pedidosFinalizados.length})
        </button>
      </div>

      {loading ? (
        <div className="loading">Carregando pedidos...</div>
      ) : (
        <>
          {abaAtiva === "pendentes" && (
            <div className="pedidos-content">
              {pedidos.length > 0 && (
                <div className="pedidos-count-display">
                  <span className="pedidos-count">{pedidos.length} pedidos aguardando</span>
                </div>
              )}

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
          )}

          {abaAtiva === "aceitos" && (
            <div className="pedidos-content">
              {pedidosAceitos.length > 0 && (
                <div className="pedidos-count-display">
                  <span className="pedidos-count">{pedidosAceitos.length} pedidos aceitos</span>
                </div>
              )}

              {pedidosAceitos.length === 0 ? (
                <div className="no-pedidos">
                  <p>Nenhum pedido aceito no momento</p>
                </div>
              ) : (
                <div className="pedidos-list">
                  {pedidosAceitos.map((pedido) => (
                    <div key={pedido.id_pedido} className="pedido-card">
                      <div className="pedido-header">
                        <div className="pedido-info">
                          <h3>Pedido #{pedido.id_pedido}</h3>
                          <p className="cliente-nome">{pedido.usuario_nome}</p>
                          <p className="pedido-data">{formatarData(pedido.data_pedido)}</p>
                          <p className="pedido-status">Status: {pedido.status}</p>
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
                          <div className="total-pedido">
                            <strong>Total: {formatarValor(pedido.total)}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="pedido-actions">
                        <button
                          onClick={() => marcarSaiuParaEntrega(pedido.id_pedido)}
                          disabled={processando[pedido.id_pedido]}
                          className="btn-saiu-entrega"
                        >
                          {processando[pedido.id_pedido] ? "Processando..." : "Saiu para Entrega"}
                        </button>
                        <button
                          onClick={() => cancelarPedido(pedido.id_pedido)}
                          disabled={processando[pedido.id_pedido]}
                          className="btn-cancelar"
                        >
                          {processando[pedido.id_pedido] ? "Processando..." : "Cancelar Pedido"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {abaAtiva === "finalizados" && (
            <div className="pedidos-content">
              {pedidosFinalizados.length > 0 && (
                <div className="pedidos-count-display">
                  <span className="pedidos-count">{pedidosFinalizados.length} pedidos finalizados</span>
                </div>
              )}

              {pedidosFinalizados.length === 0 ? (
                <div className="no-pedidos">
                  <p>Nenhum pedido finalizado ainda</p>
                </div>
              ) : (
                <div className="pedidos-list">
                  {pedidosFinalizados.map((pedido) => (
                    <div key={pedido.id_pedido} className="pedido-card finalizado">
                      <div className="pedido-header">
                        <div className="pedido-info">
                          <h3>Pedido #{pedido.id_pedido}</h3>
                          <p className="cliente-nome">{pedido.usuario_nome}</p>
                          <p className="pedido-data">{formatarData(pedido.data_pedido)}</p>
                          <p className="pedido-status">Status: {pedido.status}</p>
                        </div>
                      </div>

                      <div className="pedido-detalhes">
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
                          <div className="total-pedido">
                            <strong>Total: {formatarValor(pedido.total)}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default GerenciarPedidos






