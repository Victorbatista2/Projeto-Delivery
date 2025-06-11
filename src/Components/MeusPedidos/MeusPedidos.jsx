"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useApp } from "../../contexts/AppContext"
import LoadingSpinner from "../../shared/LoadingSpinner"
import LazyImage from "../../shared/LazyImage"
import "./MeusPedidos.css"
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  Phone,
  Star,
} from "lucide-react"

const MeusPedidos = () => {
  const navigate = useNavigate()
  const { state, actions } = useApp()
  const [activeTab, setActiveTab] = useState("em-andamento")
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch user orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      if (!state.user || !state.user.id) {
        setError("Usuário não encontrado. Faça login para ver seus pedidos.")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`http://localhost:3001/api/pedidos/usuario/${state.user.id}`)

        if (!response.ok) {
          throw new Error("Erro ao carregar pedidos")
        }

        const data = await response.json()

        if (data.success) {
          // Transform the data to match the component's expected format
          const transformedOrders = data.data.map((order) => ({
            id: order.id_pedido.toString(),
            restaurantName: order.restaurante_nome || "Restaurante",
            restaurantImage: order.restaurante_logo || "/placeholder.svg?height=60&width=60",
            status: getStatusMapping(order.status),
            statusText: order.status,
            orderDate: order.data_pedido,
            estimatedTime: getEstimatedTime(order.status),
            items: Array.isArray(order.itens)
              ? order.itens.map((item) => ({
                  name: item.produto_nome,
                  quantity: item.quantidade,
                  price: Number.parseFloat(item.preco_unitario),
                }))
              : [],
            total: Number.parseFloat(order.total),
            deliveryAddress: order.endereco_entrega,
            paymentMethod: order.metodo_pagamento,
            deliveryFee: Number.parseFloat(order.taxa_entrega || 0),
            phone: order.telefone_contato,
            deliveredAt: order.status === "Entregue" ? order.data_pedido : null,
            cancelReason: order.status === "Cancelado" ? "Pedido cancelado" : null,
          }))

          setOrders(transformedOrders)
        } else {
          setOrders([])
        }
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error)
        setError("Erro ao carregar seus pedidos. Tente novamente.")
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [state.user])

  // Map backend status to frontend status
  const getStatusMapping = (backendStatus) => {
    const statusMap = {
      "Aguardando Confirmação": "em-preparacao",
      Confirmado: "em-preparacao",
      "Em Preparação": "em-preparacao",
      "Saiu para Entrega": "saiu-para-entrega",
      Entregue: "entregue",
      Cancelado: "cancelado",
      Recusado: "cancelado",
      "Não Aceito": "cancelado",
    }
    return statusMap[backendStatus] || "em-preparacao"
  }

  // Get estimated time based on status
  const getEstimatedTime = (status) => {
    if (status === "Aguardando Confirmação" || status === "Confirmado") {
      return "25-35 min"
    } else if (status === "Em Preparação") {
      return "15-25 min"
    } else if (status === "Saiu para Entrega") {
      return "5-15 min"
    }
    return null
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPrice = (price) => {
    return `R$ ${price.toFixed(2).replace(".", ",")}`
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "em-preparacao":
        return <Clock size={16} className="status-icon preparing" />
      case "saiu-para-entrega":
        return <Truck size={16} className="status-icon delivering" />
      case "entregue":
        return <CheckCircle size={16} className="status-icon delivered" />
      case "cancelado":
        return <XCircle size={16} className="status-icon cancelled" />
      default:
        return <Package size={16} className="status-icon" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "em-preparacao":
        return "#ff9500"
      case "saiu-para-entrega":
        return "#007aff"
      case "entregue":
        return "#34c759"
      case "cancelado":
        return "#ff3b30"
      default:
        return "#8e8e93"
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "em-andamento") {
      return ["em-preparacao", "saiu-para-entrega"].includes(order.status)
    } else {
      return ["entregue", "cancelado"].includes(order.status)
    }
  })

  const handleOrderClick = (orderId) => {
    navigate(`/pedido/${orderId}`)
  }

  const handleReorder = (order) => {
    // Logic to add items back to cart and navigate to restaurant
    console.log("Reordering:", order)
    // For now, just show a message
    actions.addNotification({
      type: "info",
      message: "Funcionalidade de repetir pedido será implementada em breve!",
    })
  }

  const handleRateOrder = (orderId) => {
    // Logic to open rating modal
    console.log("Rating order:", orderId)
    actions.addNotification({
      type: "info",
      message: "Funcionalidade de avaliação será implementada em breve!",
    })
  }

  // Show login message if user is not authenticated
  if (!state.user) {
    return (
      <div className="meus-pedidos-container">
        <header className="meus-pedidos-header">
          <button className="back-button" onClick={() => navigate(-1)} aria-label="Voltar">
            <ArrowLeft size={24} />
          </button>
          <h1>Meus Pedidos</h1>
        </header>
        <div className="empty-state">
          <div className="empty-icon">
            <Package size={64} />
          </div>
          <h2>Faça login para ver seus pedidos</h2>
          <p>Você precisa estar logado para visualizar o histórico de pedidos.</p>
          <button className="cta-button" onClick={() => navigate("/login")}>
            Fazer Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="meus-pedidos-container">
      <header className="meus-pedidos-header">
        <button className="back-button" onClick={() => navigate(-1)} aria-label="Voltar">
          <ArrowLeft size={24} />
        </button>
        <h1>Meus Pedidos</h1>
      </header>

      <div className="pedidos-tabs">
        <button
          className={`tab-button ${activeTab === "em-andamento" ? "active" : ""}`}
          onClick={() => setActiveTab("em-andamento")}
        >
          Em Andamento
          {orders.filter((o) => ["em-preparacao", "saiu-para-entrega"].includes(o.status)).length > 0 && (
            <span className="tab-badge">
              {orders.filter((o) => ["em-preparacao", "saiu-para-entrega"].includes(o.status)).length}
            </span>
          )}
        </button>
        <button
          className={`tab-button ${activeTab === "historico" ? "active" : ""}`}
          onClick={() => setActiveTab("historico")}
        >
          Histórico
        </button>
      </div>

      <div className="pedidos-content">
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner size="large" />
            <p>Carregando seus pedidos...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="error-icon">
              <XCircle size={64} />
            </div>
            <h2>Erro ao carregar pedidos</h2>
            <p>{error}</p>
            <button className="cta-button" onClick={() => window.location.reload()}>
              Tentar Novamente
            </button>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="restaurant-info">
                    <LazyImage src={order.restaurantImage} alt={order.restaurantName} className="restaurant-image" />
                    <div className="restaurant-details">
                      <h3>{order.restaurantName}</h3>
                      <div className="order-date">
                        <Calendar size={14} />
                        {formatDate(order.orderDate)}
                      </div>
                    </div>
                  </div>
                  <div className="order-status" style={{ color: getStatusColor(order.status) }}>
                    {getStatusIcon(order.status)}
                    <span>{order.statusText}</span>
                  </div>
                </div>

                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <span className="item-quantity">{item.quantity}x</span>
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">{formatPrice(item.price)}</span>
                    </div>
                  ))}
                </div>

                <div className="order-details">
                  <div className="detail-row">
                    <MapPin size={14} />
                    <span>{order.deliveryAddress}</span>
                  </div>
                  <div className="detail-row">
                    <CreditCard size={14} />
                    <span>{order.paymentMethod}</span>
                  </div>
                  {order.phone && (
                    <div className="detail-row">
                      <Phone size={14} />
                      <span>{order.phone}</span>
                    </div>
                  )}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <span className="total-label">Total:</span>
                    <span className="total-value">{formatPrice(order.total)}</span>
                  </div>

                  <div className="order-actions">
                    {activeTab === "em-andamento" && (
                      <button className="action-button primary" onClick={() => handleOrderClick(order.id)}>
                        Acompanhar
                      </button>
                    )}

                    {activeTab === "historico" && (
                      <>
                        {order.status === "entregue" && !order.rating && (
                          <button className="action-button secondary" onClick={() => handleRateOrder(order.id)}>
                            <Star size={16} />
                            Avaliar
                          </button>
                        )}
                        <button className="action-button primary" onClick={() => handleReorder(order)}>
                          Pedir Novamente
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {order.estimatedTime && activeTab === "em-andamento" && (
                  <div className="estimated-time">
                    <Clock size={14} />
                    <span>Tempo estimado: {order.estimatedTime}</span>
                  </div>
                )}

                {order.deliveredAt && (
                  <div className="delivered-time">
                    <CheckCircle size={14} />
                    <span>Entregue em {formatDate(order.deliveredAt)}</span>
                  </div>
                )}

                {order.cancelReason && (
                  <div className="cancel-reason">
                    <XCircle size={14} />
                    <span>Motivo: {order.cancelReason}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <Package size={64} />
            </div>
            <h2>{activeTab === "em-andamento" ? "Nenhum pedido em andamento" : "Nenhum pedido no histórico"}</h2>
            <p>
              {activeTab === "em-andamento"
                ? "Quando você fizer um pedido, ele aparecerá aqui."
                : "Seus pedidos finalizados aparecerão aqui."}
            </p>
            <button className="cta-button" onClick={() => navigate("/")}>
              Fazer Pedido
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MeusPedidos

