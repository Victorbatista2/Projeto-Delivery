"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Clock, CheckCircle, Truck, MapPin, Phone, MessageCircle } from "lucide-react"
import "./OrderTracking.css"

const OrderTracking = () => {
  const { pedidoId } = useParams()
  const navigate = useNavigate()
  const [pedido, setPedido] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentStatus, setCurrentStatus] = useState(0)

  // Status do pedido
  const statusSteps = [
    {
      id: 0,
      title: "Pedido realizado",
      description: "Seu pedido foi enviado para o restaurante",
      icon: CheckCircle,
      status: "Aguardando Confirmação",
    },
    {
      id: 1,
      title: "Pedido aceito pelo restaurante",
      description: "O restaurante confirmou seu pedido e está preparando",
      icon: CheckCircle,
      status: "Confirmado",
    },
    {
      id: 2,
      title: "Pedido em preparo",
      description: "Seu pedido está sendo preparado com carinho",
      icon: Clock,
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
      icon: CheckCircle,
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

          // Determinar status atual baseado no status do pedido
          const statusIndex = statusSteps.findIndex((step) => step.status === result.data.status)
          setCurrentStatus(statusIndex >= 0 ? statusIndex : 0)
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
    if (currentStatus === 0) return "Aguardando confirmação"
    if (currentStatus === 1) return "20-30 min"
    if (currentStatus === 2) return "15-25 min"
    if (currentStatus === 3) return "5-15 min"
    return "Entregue"
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

  return (
    <div className="order-tracking-container">
      {/* Header */}
      <div className="order-tracking-header">
        <button className="btn-back" onClick={() => navigate("/")}>
          <ArrowLeft size={24} />
        </button>
        <div className="header-content">
          <h1>Acompanhar pedido</h1>
          <p>Pedido #{pedido.codigo_entrega}</p>
        </div>
      </div>

      {/* Status Principal */}
      <div className="order-main-status">
        <div className="status-icon">
          {currentStatus === 0 && <Clock size={48} className="status-icon-waiting" />}
          {currentStatus === 1 && <CheckCircle size={48} className="status-icon-confirmed" />}
          {currentStatus === 2 && <Clock size={48} className="status-icon-preparing" />}
          {currentStatus === 3 && <Truck size={48} className="status-icon-delivery" />}
          {currentStatus === 4 && <CheckCircle size={48} className="status-icon-delivered" />}
        </div>

        <div className="status-content">
          <h2>{statusSteps[currentStatus]?.title}</h2>
          <p>{statusSteps[currentStatus]?.description}</p>
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
              className={`timeline-step ${index <= currentStatus ? "completed" : ""} ${index === currentStatus ? "current" : ""}`}
            >
              <div className="timeline-icon">
                <step.icon size={20} />
              </div>
              <div className="timeline-content">
                <h4>{step.title}</h4>
                <p>{step.description}</p>
                {index <= currentStatus && <span className="timeline-time">{formatTime(pedido.data_pedido)}</span>}
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
      </div>

      {/* Ações */}
      <div className="order-actions">
        <button className="btn-contact">
          <Phone size={20} />
          Ligar para o restaurante
        </button>
        <button className="btn-help">
          <MessageCircle size={20} />
          Precisa de ajuda?
        </button>
      </div>

      {/* Botão de Avaliação (apenas se entregue) */}
      {currentStatus === 4 && (
        <div className="order-rating">
          <button className="btn-rate">Avaliar pedido</button>
        </div>
      )}
    </div>
  )
}

export default OrderTracking
