"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Clock, CheckCircle2, Truck, MapPin, Phone, Hash, Star } from "lucide-react"
import { useApp } from "../../contexts/AppContext"
import "./OrderTracking.css"

const OrderTracking = () => {
  const { pedidoId } = useParams()
  const navigate = useNavigate()
  const { actions } = useApp()
  const [pedido, setPedido] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completedSteps, setCompletedSteps] = useState([])
  const [codigoConfirmacao, setCodigoConfirmacao] = useState("")
  const [validandoCodigo, setValidandoCodigo] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submittingRating, setSubmittingRating] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)

  // Status do pedido
  const statusSteps = [
    {
      id: 0,
      title: "Pedido realizado",
      description: "Seu pedido foi enviado para o restaurante",
      icon: CheckCircle2,
      status: "Aguardando Confirmação",
    },
    {
      id: 1,
      title: "Pedido aceito pelo restaurante",
      description: "O restaurante confirmou seu pedido e está preparando",
      icon: CheckCircle2,
      status: "Confirmado",
    },
    {
      id: 2,
      title: "Pedido em preparo",
      description: "Seu pedido está sendo preparado com carinho",
      icon: CheckCircle2,
      status: "Em Preparo",
    },
    {
      id: 3,
      title: "Saiu para entrega",
      description: "O entregador já está com seu pedido e está a caminho!",
      icon: Truck,
      status: "Saiu para Entrega",
    },
    {
      id: 4,
      title: "Pedido entregue",
      description: "Seu pedido foi entregue. Bom apetite!",
      icon: CheckCircle2,
      status: "Entregue",
    },
  ]

  // Buscar dados do pedido
  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/pedidos/${pedidoId}`)
        if (response.ok) {
          const result = await response.json()
          setPedido(result.data)

          // Verificar se o pedido foi recusado ou cancelado
          if (result.data.status === "Recusado" || result.data.status === "Cancelado") {
            const reason =
              result.data.status === "Recusado"
                ? "O restaurante recusou seu pedido"
                : "O restaurante cancelou seu pedido"
            setCancelReason(reason)
            setShowCancelModal(true)
            return
          }

          // Determinar passos concluídos com base no status do pedido
          const completed = [0] // Pedido realizado sempre está concluído

          if (result.data.status === "Confirmado" || result.data.status === "Em Preparo") {
            completed.push(1, 2) // Pedido aceito e em preparo estão concluídos
          } else if (result.data.status === "Saiu para Entrega") {
            completed.push(1, 2, 3) // Todos até "Saiu para entrega" estão concluídos
          } else if (result.data.status === "Entregue") {
            completed.push(1, 2, 3, 4) // Todos os passos estão concluídos
          }

          setCompletedSteps(completed)
        }
      } catch (error) {
        console.error("Erro ao buscar pedido:", error)
      } finally {
        setLoading(false)
      }
    }

    if (pedidoId) {
      fetchPedido()

      // Atualizar a cada 10 segundos
      const interval = setInterval(fetchPedido, 10000)
      return () => clearInterval(interval)
    }
  }, [pedidoId])

  // Confirmar entrega com código
  const confirmarEntrega = async () => {
    if (!codigoConfirmacao || codigoConfirmacao.length !== 4) {
      alert("Por favor, digite o código de confirmação de 4 dígitos")
      return
    }

    if (codigoConfirmacao !== pedido.codigo_entrega) {
      alert("Código de confirmação incorreto")
      return
    }

    setValidandoCodigo(true)

    try {
      const response = await fetch(`http://localhost:3001/api/pedidos/${pedidoId}/finalizar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo_confirmacao: codigoConfirmacao,
        }),
      })

      if (response.ok) {
        // Atualizar o pedido localmente
        setPedido((prev) => ({ ...prev, status: "Entregue" }))
        setCompletedSteps([0, 1, 2, 3, 4]) // Todos os passos concluídos
        alert("Entrega confirmada com sucesso!")
      } else {
        alert("Erro ao confirmar entrega")
      }
    } catch (error) {
      console.error("Erro ao confirmar entrega:", error)
      alert("Erro ao confirmar entrega")
    } finally {
      setValidandoCodigo(false)
    }
  }

  // Lidar com pedido cancelado/recusado
  const handleCancelModalOk = () => {
    // Esvaziar carrinho
    actions.clearCart()

    // Fechar modal
    setShowCancelModal(false)

    // Redirecionar para homepage
    navigate("/")
  }

  // Abrir modal de avaliação
  const openRatingModal = () => {
    setShowRatingModal(true)
  }

  // Fechar modal de avaliação
  const closeRatingModal = () => {
    setShowRatingModal(false)
    setRating(0)
    setComment("")
  }

  // Submeter avaliação
  const submitRating = async () => {
    setSubmittingRating(true)

    try {
      const response = await fetch(`http://localhost:3001/api/pedidos/${pedidoId}/avaliar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avaliacao: rating,
          comentario: comment,
          restaurante_id: pedido.restaurante_id,
        }),
      })

      if (response.ok) {
        alert("Avaliação enviada com sucesso!")
      } else {
        alert("Erro ao enviar avaliação")
      }
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error)
      alert("Erro ao enviar avaliação")
    } finally {
      setSubmittingRating(false)
      closeRatingModal()
      navigate("/")
    }
  }

  // Ignorar avaliação
  const skipRating = () => {
    closeRatingModal()
    navigate("/")
  }

  // Abrir modal de telefone
  const openPhoneModal = () => {
    setShowPhoneModal(true)
  }

  // Fechar modal de telefone
  const closePhoneModal = () => {
    setShowPhoneModal(false)
  }

  const formatPrice = (price) => {
    return `R$ ${Number.parseFloat(price).toFixed(2).replace(".", ",")}`
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getEstimatedTime = () => {
    if (!pedido) return "Aguardando confirmação"

    if (pedido.status === "Aguardando Confirmação") return "Aguardando confirmação"
    if (pedido.status === "Confirmado" || pedido.status === "Em Preparo") return "20-30 min"
    if (pedido.status === "Saiu para Entrega") return "5-15 min"
    return "Entregue"
  }

  // Obter o último passo concluído para exibir como status principal
  const getLastCompletedStep = () => {
    if (completedSteps.length === 0) return 0
    return Math.max(...completedSteps)
  }

  if (loading) {
    return (
      <div className="order-tracking-loading">
        <div className="loading-spinner"></div>
        <p>Carregando pedido...</p>
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="order-tracking-error">
        <h2>Pedido não encontrado</h2>
        <button onClick={() => navigate("/")} className="btn-home">
          Voltar ao início
        </button>
      </div>
    )
  }

  const lastCompletedStep = getLastCompletedStep()

  return (
    <div className="order-tracking-container">
      {/* Modal de Cancelamento/Recusa */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Pedido {pedido.status === "Recusado" ? "Recusado" : "Cancelado"}</h3>
            </div>
            <div className="modal-body">
              <p>{cancelReason}</p>
              <p>Você pode fazer um novo pedido quando desejar.</p>
            </div>
            <div className="modal-footer">
              <button onClick={handleCancelModalOk} className="btn-modal-ok">
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Avaliação */}
      {showRatingModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Avaliar Pedido</h3>
            </div>
            <div className="modal-body">
              <p>Como foi sua experiência com {pedido.restaurante_nome}?</p>

              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-button ${rating >= star ? "active" : ""}`}
                    onClick={() => setRating(star)}
                  >
                    <Star size={32} fill={rating >= star ? "#ffd700" : "none"} color="#ffd700" />
                  </button>
                ))}
              </div>

              <div className="comment-section">
                <label htmlFor="comment">Comentário (opcional):</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Conte-nos sobre sua experiência..."
                  rows={4}
                  maxLength={500}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={skipRating} className="btn-modal-secondary">
                Ignorar
              </button>
              <button onClick={submitRating} className="btn-modal-primary" disabled={rating === 0 || submittingRating}>
                {submittingRating ? "Enviando..." : "Avaliar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Telefone */}
      {showPhoneModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Telefone do Restaurante</h3>
            </div>
            <div className="modal-body">
              <p>{pedido.restaurante_telefone || "(11) 99999-9999"}</p>
            </div>
            <div className="modal-footer">
              <button onClick={closePhoneModal} className="btn-modal-ok">
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="order-tracking-header">
        <button className="btn-back" onClick={() => navigate("/")}>
          <ArrowLeft size={24} />
        </button>
        <div className="header-content">
          <h1>Acompanhar pedido</h1>
          <p>Pedido #{pedido.id}</p>
        </div>
      </div>

      {/* Status Principal */}
      <div className="order-main-status">
        <div className="status-icon">
          {(() => {
            const IconComponent = statusSteps[lastCompletedStep].icon
            return IconComponent ? <IconComponent size={48} className="status-icon-completed" /> : null
          })()}
        </div>

        <div className="status-content">
          <h2>{statusSteps[lastCompletedStep].title}</h2>
          <p>{statusSteps[lastCompletedStep].description}</p>
          <div className="estimated-time">
            <Clock size={16} />
            <span>{getEstimatedTime()}</span>
          </div>
        </div>
      </div>

      {/* Timeline do Pedido */}
      <div className="order-timeline">
        <h3>Acompanhe seu pedido</h3>
        <div className="timeline-container">
          {statusSteps.map((step, index) => (
            <div
              key={step.id}
              className={`timeline-step ${completedSteps.includes(index) ? "completed" : "not-reached"}`}
            >
              <div className="timeline-icon">
                <step.icon size={20} />
              </div>
              <div className="timeline-content">
                <h4>{step.title}</h4>
                <p>{step.description}</p>
                {completedSteps.includes(index) && (
                  <span className="timeline-time">{formatTime(pedido.data_pedido)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Informações do Pedido */}
      <div className="order-details">
        <h3>Detalhes do pedido</h3>

        <div className="order-restaurant">
          <div className="restaurant-info">
            <h4>Restaurante</h4>
            <p>{pedido.restaurante_nome || "Restaurante"}</p>
          </div>
        </div>

        <div className="order-items">
          <h4>Itens do pedido</h4>
          {pedido.itens &&
            pedido.itens.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-quantity">{item.quantidade}x</div>
                <div className="item-details">
                  <span className="item-name">{item.produto_nome}</span>
                </div>
                <div className="item-price">
                  {formatPrice(Number.parseFloat(item.preco_unitario) * item.quantidade)}
                </div>
              </div>
            ))}
        </div>

        <div className="order-address">
          <h4>Endereço de entrega</h4>
          <div className="address-info">
            <MapPin size={16} />
            <span>{pedido.endereco_entrega}</span>
          </div>
        </div>

        <div className="order-payment">
          <h4>Forma de pagamento</h4>
          <p>{pedido.metodo_pagamento}</p>
        </div>

        <div className="order-total">
          <div className="total-row">
            <span>Total do pedido</span>
            <span className="total-price">{formatPrice(pedido.total)}</span>
          </div>
        </div>

        {/* Código de Confirmação - só aparece quando pedido for aceito */}
        {pedido.status !== "Aguardando Confirmação" &&
          pedido.status !== "Recusado" &&
          pedido.status !== "Não Aceito" &&
          pedido.status !== "Cancelado" && (
            <div className="order-confirmation-code">
              <div className="confirmation-code-content">
                <Hash size={24} />
                <div>
                  <h3>Código de Confirmação</h3>
                  <p className="confirmation-code">{pedido.codigo_entrega}</p>
                  <span>Apresente este código ao receber seu pedido</span>
                </div>
              </div>

              {/* Campo para confirmar entrega - só aparece quando saiu para entrega */}
              {pedido.status === "Saiu para Entrega" && (
                <div className="delivery-confirmation">
                  <h3>Confirmar Recebimento</h3>
                  <p>Digite o código de confirmação fornecido pelo entregador:</p>
                  <div className="confirmation-input">
                    <input
                      type="text"
                      maxLength="4"
                      placeholder="0000"
                      value={codigoConfirmacao}
                      onChange={(e) => setCodigoConfirmacao(e.target.value.replace(/\D/g, ""))}
                      className="codigo-input"
                    />
                    <button
                      onClick={confirmarEntrega}
                      disabled={validandoCodigo || codigoConfirmacao.length !== 4}
                      className="btn-confirmar"
                    >
                      {validandoCodigo ? "Confirmando..." : "Confirmar Entrega"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
      </div>

      {/* Ações */}
      <div className="order-actions">
        <button className="btn-contact" onClick={openPhoneModal}>
          <Phone size={20} />
          Ligar para o restaurante
        </button>
      </div>

      {/* Botão de Avaliação (apenas se entregue) */}
      {completedSteps.includes(4) && (
        <div className="order-rating">
          <button className="btn-rate" onClick={openRatingModal}>
            Avaliar pedido
          </button>
        </div>
      )}
    </div>
  )
}

export default OrderTracking






































