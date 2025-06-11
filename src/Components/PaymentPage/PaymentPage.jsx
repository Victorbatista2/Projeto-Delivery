"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  CreditCard,
  Info,
  ChevronRight,
  X,
  Home,
  Briefcase,
  Clock,
  Edit2,
  Trash2,
  AlertCircle,
  Banknote,
} from "lucide-react"
import { useApp } from "../../contexts/AppContext"
import PaymentMethodSelection from "../PaymentMethodSelection/PaymentMethodSelection"
import CreditCardForm from "../CreditCardForm/CreditCardForm"
import "./PaymentPage.css"
import { useNavigate } from "react-router-dom"

const PaymentPage = ({ cartProducts = [], cartTotal = 0, deliveryFee = 0, onBack }) => {
  const { state, actions } = useApp()
  const [deliveryTab, setDeliveryTab] = useState("entrega")
  const [paymentTab, setPaymentTab] = useState("site")
  const [savedCards, setSavedCards] = useState([])
  const [cpfCnpj, setCpfCnpj] = useState("")
  const [includeCpfCnpj, setIncludeCpfCnpj] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [searchAddress, setSearchAddress] = useState("")
  const [showPaymentMethodSelection, setShowPaymentMethodSelection] = useState(false)
  const [showCreditCardForm, setShowCreditCardForm] = useState(false)
  const [showEditCardModal, setShowEditCardModal] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [cardNickname, setCardNickname] = useState("")
  const [restaurantData, setRestaurantData] = useState(null)
  const [selectedDeliveryPayment, setSelectedDeliveryPayment] = useState(null)
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState("standard")
  const navigate = useNavigate()

  // Delivery option prices
  const deliveryPrices = {
    standard: 7.9,
    fast: 11.99,
    pickup: 0,
  }

  // Handle delivery option selection
  const handleDeliveryOptionSelect = (option) => {
    setSelectedDeliveryOption(option)
  }

  // Calculate current delivery fee
  const getCurrentDeliveryFee = () => {
    if (deliveryTab === "retirada") {
      return 0
    }
    return deliveryPrices[selectedDeliveryOption] || 0
  }

  // Calculate final total
  const getFinalTotal = () => {
    const currentDeliveryFee = getCurrentDeliveryFee()
    return cartTotal + currentDeliveryFee
  }

  const [addressModalStep, setAddressModalStep] = useState(1)
  const [addressSearchQuery, setAddressSearchQuery] = useState("")
  const [newAddress, setNewAddress] = useState({
    label: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    isDefault: false,
  })

  // Load restaurant data when component mounts
  useEffect(() => {
    const loadRestaurantData = async () => {
      const safeCartProducts = Array.isArray(cartProducts) ? cartProducts : []
      if (safeCartProducts.length > 0 && safeCartProducts[0].restaurantId) {
        try {
          const response = await fetch(`http://localhost:3001/api/restaurantes/${safeCartProducts[0].restaurantId}`)
          if (response.ok) {
            const result = await response.json()
            setRestaurantData(result.data)
          }
        } catch (error) {
          console.error("Erro ao carregar dados do restaurante:", error)
        }
      }
    }
    loadRestaurantData()
  }, [cartProducts])

  // Address functionality functions
  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setNewAddress((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const setAddressLabel = (label) => {
    setNewAddress((prev) => ({
      ...prev,
      label,
    }))
  }

  const saveNewAddress = async () => {
    try {
      const savedAddress = await actions.addAddress(newAddress)

      setNewAddress({
        label: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        isDefault: false,
      })

      setShowAddressModal(false)
      setAddressModalStep(1)
    } catch (error) {
      console.error("Erro ao salvar endereço:", error)
    }
  }

  // Payment method functions
  const handleEditCard = (card) => {
    setEditingCard(card)
    setCardNickname(card.apelido || card.nome_titular || "")
    setShowEditCardModal(true)
  }

  const handleSaveCardNickname = async () => {
    try {
      await actions.updatePaymentMethod(editingCard.id, {
        ...editingCard,
        apelido: cardNickname,
      })
      setShowEditCardModal(false)
      setEditingCard(null)
      setCardNickname("")
    } catch (error) {
      console.error("Erro ao atualizar cartão:", error)
    }
  }

  const handleDeleteCard = async (card) => {
    if (window.confirm("Tem certeza que deseja excluir este cartão?")) {
      try {
        await actions.deletePaymentMethod(card.id)
      } catch (error) {
        console.error("Erro ao excluir cartão:", error)
      }
    }
  }

  // Load addresses when component mounts
  useEffect(() => {
    if (state.user && state.user.id) {
      const loadAddresses = async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/usuarios/${state.user.id}/enderecos`)
          if (response.ok) {
            const addresses = await response.json()
            console.log("Endereços carregados no mount:", addresses)
            if (addresses && addresses.length > 0 && !state.selectedAddress) {
              // Se não houver endereço selecionado, selecione o primeiro ou o padrão
              const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0]
              actions.selectAddress(defaultAddress)
            }
          }
        } catch (error) {
          console.error("Erro ao carregar endereços no mount:", error)
        }
      }
      loadAddresses()
    }
  }, [state.user])

  // Load payment methods when component mounts or user changes
  useEffect(() => {
    if (state.user && state.user.id && (!state.paymentMethods || state.paymentMethods.length === 0)) {
      const loadPaymentMethods = async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/metodos-pagamento/usuario/${state.user.id}`)
          if (response.ok) {
            const data = await response.json()
            console.log("Métodos de pagamento carregados:", data)
          }
        } catch (error) {
          console.error("Erro ao carregar métodos de pagamento:", error)
        }
      }
      loadPaymentMethods()
    }
  }, [state.user])

  // Format price for display
  const formatPrice = (price) => {
    if (typeof price !== "number" || isNaN(price)) return "R$ 0,00"
    return `R$ ${price.toFixed(2).replace(".", ",")}`
  }

  // Format address for display in two lines
  const formatAddressForDisplay = (address) => {
    if (!address) return { line1: "Nenhum", line2: "Selecione um endereço" }

    const line1Parts = []
    const line2Parts = []

    // First line: street and number
    if (address.rua && address.numero) {
      line1Parts.push(`${address.rua}, ${address.numero}`)
    } else if (address.street && address.number) {
      line1Parts.push(`${address.street}, ${address.number}`)
    } else if (address.rua) {
      line1Parts.push(address.rua)
    } else if (address.street) {
      line1Parts.push(address.street)
    }

    // Second line: neighborhood, city and state
    if (address.bairro) {
      line2Parts.push(address.bairro)
    } else if (address.neighborhood) {
      line2Parts.push(address.neighborhood)
    }

    const cityState = []
    if (address.cidade) cityState.push(address.cidade)
    else if (address.city) cityState.push(address.city)

    if (address.estado) cityState.push(address.estado)
    else if (address.state) cityState.push(address.state)

    if (cityState.length > 0) {
      line2Parts.push(cityState.join(" - "))
    }

    return {
      line1: line1Parts.length > 0 ? line1Parts.join("") : "Endereço incompleto",
      line2: line2Parts.length > 0 ? line2Parts.join(", ") : "",
    }
  }

  // Format restaurant address for pickup
  const formatRestaurantAddressForDisplay = (restaurant) => {
    if (!restaurant) return { line1: "Carregando...", line2: "Endereço do restaurante" }

    const line1Parts = []
    const line2Parts = []

    // First line: street and number
    if (restaurant.rua && restaurant.numero) {
      line1Parts.push(`${restaurant.rua}, ${restaurant.numero}`)
    } else if (restaurant.endereco && restaurant.numero) {
      line1Parts.push(`${restaurant.endereco}, ${restaurant.numero}`)
    } else if (restaurant.rua) {
      line1Parts.push(restaurant.rua)
    } else if (restaurant.endereco) {
      line1Parts.push(restaurant.endereco)
    }

    // Second line: neighborhood, city and state
    if (restaurant.bairro) {
      line2Parts.push(restaurant.bairro)
    }

    const cityState = []
    if (restaurant.cidade) cityState.push(restaurant.cidade)
    if (restaurant.estado) cityState.push(restaurant.estado)

    if (cityState.length > 0) {
      line2Parts.push(cityState.join(" - "))
    }

    return {
      line1: line1Parts.length > 0 ? line1Parts.join("") : "Endereço do restaurante",
      line2: line2Parts.length > 0 ? line2Parts.join(", ") : "",
    }
  }

  // Load addresses when modal opens
  const handleOpenAddressModal = () => {
    // Only allow address modal for delivery
    if (deliveryTab === "entrega") {
      setShowAddressModal(true)
      setAddressModalStep(1)
    }
  }

  // Get icon for address type
  const getAddressIcon = (rotulo) => {
    switch (rotulo?.toLowerCase()) {
      case "casa":
        return <Home size={20} className="address-icon" />
      case "trabalho":
        return <Briefcase size={20} className="address-icon" />
      default:
        return <Clock size={20} className="address-icon" />
    }
  }

  // Filter addresses based on search
  const filteredAddresses = (state.addresses || []).filter(
    (address) =>
      (address.rua || address.street || "").toLowerCase().includes(searchAddress.toLowerCase()) ||
      (address.bairro || address.neighborhood || "").toLowerCase().includes(searchAddress.toLowerCase()) ||
      (address.cidade || address.city || "").toLowerCase().includes(searchAddress.toLowerCase()) ||
      (address.rotulo || address.label || "").toLowerCase().includes(searchAddress.toLowerCase()),
  )

  // Handle address selection
  const handleAddressSelect = (address) => {
    actions.selectAddress(address)
    setShowAddressModal(false)
  }

  // Handle add card button click
  const handleAddCardClick = () => {
    setShowPaymentMethodSelection(true)
  }

  // Handle credit card selection
  const handleSelectCreditCard = () => {
    setShowCreditCardForm(true)
    setShowPaymentMethodSelection(false)
  }

  // Handle back from credit card form
  const handleBackFromCreditCard = () => {
    setShowCreditCardForm(false)
  }

  // Check if address is incomplete
  const isAddressIncomplete = () => {
    if (!state.selectedAddress) return true

    // Check if essential address fields are present
    const address = state.selectedAddress
    const hasStreet = !!(address.rua || address.street)
    const hasNumber = !!(address.numero || address.number)
    const hasNeighborhood = !!(address.bairro || address.neighborhood)
    const hasCity = !!(address.cidade || address.city)

    return !(hasStreet && hasNumber && hasNeighborhood && hasCity)
  }

  // Handle delivery payment method selection
  const handleDeliveryPaymentSelect = (method) => {
    setSelectedDeliveryPayment(method)
  }

  // Show credit card form if active
  if (showCreditCardForm) {
    return <CreditCardForm onBack={handleBackFromCreditCard} />
  }

  // Safe cart products with fallbacks
  const safeCartProducts = Array.isArray(cartProducts) ? cartProducts : []

  // Show payment method selection if active
  if (showPaymentMethodSelection) {
    return (
      <PaymentMethodSelection
        onBack={() => setShowPaymentMethodSelection(false)}
        onSelectCreditCard={handleSelectCreditCard}
      />
    )
  }

  // Handle place order
  const handlePlaceOrder = async () => {
    try {
      if (!state.selectedAddress && deliveryTab === "entrega") {
        alert("Por favor, selecione um endereço de entrega")
        return
      }

      if (paymentTab === "site" && (!state.paymentMethods || state.paymentMethods.length === 0)) {
        alert("Por favor, adicione um método de pagamento")
        return
      }

      if (paymentTab === "entrega" && !selectedDeliveryPayment) {
        alert("Por favor, selecione uma forma de pagamento")
        return
      }

      // Preparar dados do pedido
      const pedidoData = {
        id_usuario: state.user.id,
        id_restaurante: safeCartProducts[0]?.restaurantId,
        total: getFinalTotal(),
        endereco_entrega:
          deliveryTab === "entrega"
            ? `${state.selectedAddress.street || state.selectedAddress.rua}, ${state.selectedAddress.number || state.selectedAddress.numero}, ${state.selectedAddress.neighborhood || state.selectedAddress.bairro}, ${state.selectedAddress.city || state.selectedAddress.cidade} - ${state.selectedAddress.state || state.selectedAddress.estado}`
            : "Retirada no local",
        metodo_entrega: deliveryTab === "entrega" ? "Entrega" : "Retirada",
        metodo_pagamento:
          paymentTab === "site"
            ? "Cartão de Crédito"
            : selectedDeliveryPayment === "dinheiro"
              ? "Dinheiro"
              : "Não informado",
        troco_para: null,
        itens: safeCartProducts.map((item) => ({
          id_produto: item.id.split("-")[0], // Pegar apenas o ID do produto
          quantidade: item.quantity,
          preco_unitario:
            typeof item.price === "string"
              ? Number.parseFloat(item.price.replace("R$ ", "").replace(",", "."))
              : Number.parseFloat(item.price),
        })),
      }

      console.log("Dados do pedido:", pedidoData)

      // Fazer requisição para criar pedido
      const response = await fetch("http://localhost:3001/api/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pedidoData),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Pedido criado:", result)

        // Limpar carrinho
        actions.clearCart()

        // Redirecionar para tela de acompanhamento
        navigate(`/pedido/${result.data.id_pedido}`)
      } else {
        const error = await response.json()
        console.error("Erro ao criar pedido:", error)
        alert("Erro ao fazer pedido. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao fazer pedido:", error)
      alert("Erro ao fazer pedido. Tente novamente.")
    }
  }

  return (
    <div className="payment-page">
      <div className="payment-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <div className="ifood-logo-container">
          <svg viewBox="0 0 80 24" className="ifood-logo">
            <path
              d="M6.4 0h10.4v6.4H6.4V0zm0 9.6h10.4V16H6.4V9.6zm13.6-9.6H30v6.4H20V0zM0 0h3.2v22.4H0V0zm20 9.6h10.4V16H20V9.6zm-13.6 9.6h24v3.2h-24v-3.2zm30.4-19.2c-1.76 0-3.2 1.44-3.2 3.2v19.2h6.4V3.2c0-1.76-1.44-3.2-3.2-3.2zm7.2 0v22.4h6.4v-8h6.4v8h6.4V0h-6.4v8h-6.4V0h-6.4zm27.2 0c-1.76 0-3.2 1.44-3.2 3.2v19.2h6.4V3.2c0-1.76-1.44-3.2-3.2-3.2z"
              fill="#ea1d2c"
            ></path>
          </svg>
        </div>
      </div>

      <div className="payment-container">
        <div className="payment-main">
          <h1 className="payment-title">Finalize seu pedido</h1>

          {/* Delivery/Pickup Tabs */}
          <div className="delivery-tabs">
            <button
              className={`delivery-tab ${deliveryTab === "entrega" ? "active" : ""}`}
              onClick={() => setDeliveryTab("entrega")}
            >
              Entrega
            </button>
            <button
              className={`delivery-tab ${deliveryTab === "retirada" ? "active" : ""}`}
              onClick={() => setDeliveryTab("retirada")}
            >
              Retirada
            </button>
          </div>

          {/* Delivery Address */}
          <div className="delivery-address">
            {deliveryTab === "entrega" && isAddressIncomplete() ? (
              <>
                <div className="address-alert-icon">
                  <AlertCircle size={20} color="#ea1d2c" />
                </div>
                <div className="address-details">
                  <p className="address-text address-incomplete">Endereço incompleto</p>
                </div>
              </>
            ) : (
              <div className="address-pin-icon">
                <div className="pin-circle">
                  <div className="pin-dot"></div>
                </div>
              </div>
            )}

            <div className="address-details">
              {deliveryTab === "retirada" ? (
                // Show restaurant address for pickup
                restaurantData ? (
                  <>
                    <p className="address-text">{formatRestaurantAddressForDisplay(restaurantData).line1}</p>
                    {formatRestaurantAddressForDisplay(restaurantData).line2 && (
                      <p className="address-text-secondary">
                        {formatRestaurantAddressForDisplay(restaurantData).line2}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="address-text">Carregando endereço do restaurante...</p>
                )
              ) : // Show user address for delivery
              !isAddressIncomplete() && state.selectedAddress ? (
                <>
                  <p className="address-text">{formatAddressForDisplay(state.selectedAddress).line1}</p>
                  {formatAddressForDisplay(state.selectedAddress).line2 && (
                    <p className="address-text-secondary">{formatAddressForDisplay(state.selectedAddress).line2}</p>
                  )}
                </>
              ) : (
                <p className="address-text address-incomplete">Endereço incompleto</p>
              )}
            </div>
            <button className="address-change-button" onClick={handleOpenAddressModal}>
              Trocar
            </button>
          </div>

          {/* Delivery Time and Options */}
          <div className="delivery-time">
            <h3>Opções de entrega</h3>

            {deliveryTab === "retirada" ? (
              <div className="delivery-option selected">
                <div className="delivery-option-content">
                  <div className="delivery-option-radio">
                    <input type="radio" name="deliveryOption" checked={true} readOnly />
                  </div>
                  <div className="delivery-option-details">
                    <div className="delivery-option-header">
                      <span className="delivery-option-label">Retirada no local</span>
                      <Info size={16} className="info-icon" />
                    </div>
                    <div className="delivery-option-info">
                      <span className="delivery-time-text">Hoje, 15-25 min</span>
                      <span className="delivery-fee-text free">Grátis</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`delivery-option ${selectedDeliveryOption === "standard" ? "selected" : ""}`}
                  onClick={() => handleDeliveryOptionSelect("standard")}
                >
                  <div className="delivery-option-content">
                    <div className="delivery-option-radio">
                      <input
                        type="radio"
                        name="deliveryOption"
                        checked={selectedDeliveryOption === "standard"}
                        onChange={() => handleDeliveryOptionSelect("standard")}
                      />
                    </div>
                    <div className="delivery-option-details">
                      <div className="delivery-option-header">
                        <span className="delivery-option-label">Padrão</span>
                        <Info size={16} className="info-icon" />
                      </div>
                      <div className="delivery-option-info">
                        <span className="delivery-time-text">Hoje, 20-30 min</span>
                        <span className="delivery-fee-text">R$ 7,90</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`delivery-option ${selectedDeliveryOption === "fast" ? "selected" : ""}`}
                  onClick={() => handleDeliveryOptionSelect("fast")}
                >
                  <div className="delivery-option-content">
                    <div className="delivery-option-radio">
                      <input
                        type="radio"
                        name="deliveryOption"
                        checked={selectedDeliveryOption === "fast"}
                        onChange={() => handleDeliveryOptionSelect("fast")}
                      />
                    </div>
                    <div className="delivery-option-details">
                      <div className="delivery-option-header">
                        <span className="delivery-option-label">Rápida</span>
                        <Info size={16} className="info-icon" />
                      </div>
                      <div className="delivery-option-info">
                        <span className="delivery-time-text">Hoje, 12-22 min</span>
                        <span className="delivery-fee-text">R$ 11,99</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Payment Method Tabs */}
          <div className="payment-method-tabs">
            <button
              className={`payment-method-tab ${paymentTab === "site" ? "active" : ""}`}
              onClick={() => setPaymentTab("site")}
            >
              Pague pelo site
            </button>
            <button
              className={`payment-method-tab ${paymentTab === "entrega" ? "active" : ""}`}
              onClick={() => setPaymentTab("entrega")}
            >
              Pague na entrega
            </button>
          </div>

          {/* Payment Methods */}
          <div className="payment-methods">
            {paymentTab === "site" ? (
              // Site payment methods
              <>
                {/* Pix Payment */}
                <div className="payment-method-option">
                  <div className="payment-method-icon pix-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M19.6346 4.36541C17.3673 2.09811 13.9538 2.09811 11.6865 4.36541L10.9038 5.14811C10.6731 5.37887 10.6731 5.75964 10.9038 5.9904C11.1346 6.22117 11.5154 6.22117 11.7462 5.9904L12.5288 5.2077C14.3173 3.41925 17.0038 3.41925 18.7923 5.2077C20.5808 6.99617 20.5808 9.68271 18.7923 11.4712L17.0769 13.1866C15.2885 14.975 12.6019 14.975 10.8135 13.1866L10.0308 12.4039C9.80001 12.1731 9.41924 12.1731 9.18847 12.4039C8.95771 12.6346 8.95771 13.0154 9.18847 13.2462L9.97117 14.0289C11.0981 15.1558 12.5673 15.7193 14.0365 15.7193C15.5058 15.7193 16.975 15.1558 18.1019 14.0289L19.8173 12.3135C22.0846 10.0462 22.0846 6.63271 19.6346 4.36541Z"
                        fill="#32BCAD"
                      />
                      <path
                        d="M14.8115 10.0308C15.0423 9.80001 15.0423 9.41924 14.8115 9.18847C14.5808 8.95771 14.2 8.95771 13.9692 9.18847L4.36539 18.7923C2.57693 20.5808 2.57693 23.2673 4.36539 25.0558C6.15385 26.8442 8.84039 26.8442 10.6288 25.0558L12.3442 23.3404C14.1327 21.5519 14.1327 18.8654 12.3442 17.0769L11.5615 16.2942C11.3308 16.0635 10.95 16.0635 10.7192 16.2942C10.4885 16.525 10.4885 16.9058 10.7192 17.1365L11.5019 17.9192C12.7731 19.1904 12.7731 21.2269 11.5019 22.4981L9.78654 24.2135C8.51539 25.4846 6.47885 25.4846 5.20769 24.2135C3.93654 22.9423 3.93654 20.9058 5.20769 19.6346L14.8115 10.0308Z"
                        fill="#32BCAD"
                      />
                    </svg>
                  </div>
                  <div className="payment-method-details">
                    <h3>Pague com Pix</h3>
                    <p>Use o QR Code ou copie e cole o código</p>
                  </div>
                </div>

                {/* Credit Card Section */}
                <div className="payment-section">
                  <h3>Adicione um cartão no iFood</h3>
                  <p>É prático, seguro e você não perde nenhum minuto a mais quando seu pedido chegar.</p>
                  <button className="add-card-button" onClick={handleAddCardClick}>
                    Adicionar novo cartão
                  </button>
                </div>

                {/* Saved Cards */}
                {state.paymentMethods && state.paymentMethods.length > 0 && (
                  <div className="saved-cards">
                    <h3>Cartões salvos</h3>
                    {state.paymentMethods.map((method) => (
                      <div key={method.id} className="saved-card">
                        <div className="card-icon">
                          <CreditCard size={20} />
                        </div>
                        <div className="card-details">
                          <p className="card-name">
                            {method.apelido || method.nome_titular} • {method.bandeira} {method.tipo}
                          </p>
                          <p className="card-number">•••• {method.ultimos_4_digitos}</p>
                        </div>
                        <div className="card-actions">
                          {method.metodo_padrao && <span className="default-badge">Padrão</span>}
                          <button
                            className="edit-card-button"
                            onClick={() => handleEditCard(method)}
                            title="Editar cartão"
                            aria-label="Editar cartão"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="delete-card-button"
                            onClick={() => handleDeleteCard(method)}
                            title="Excluir cartão"
                            aria-label="Excluir cartão"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Delivery payment methods
              <div className="delivery-payment-methods">
                <div
                  className={`delivery-payment-option ${selectedDeliveryPayment === "dinheiro" ? "selected" : ""}`}
                  onClick={() => handleDeliveryPaymentSelect("dinheiro")}
                >
                  <div className="delivery-payment-icon cash-icon">
                    <Banknote size={24} color="#28a745" />
                  </div>
                  <div className="delivery-payment-details">
                    <h3>Dinheiro</h3>
                  </div>
                  <div className="delivery-payment-radio">
                    <input
                      type="radio"
                      name="deliveryPayment"
                      checked={selectedDeliveryPayment === "dinheiro"}
                      onChange={() => handleDeliveryPaymentSelect("dinheiro")}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CPF/CNPJ Section */}
            <div className="cpf-section">
              <div className="cpf-header">
                <span>CPF/CNPJ na nota</span>
              </div>
              <div className="cpf-input-container">
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpfCnpj}
                  onChange={(e) => setCpfCnpj(e.target.value)}
                  disabled={!includeCpfCnpj}
                />
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="cpf-toggle"
                    checked={includeCpfCnpj}
                    onChange={() => setIncludeCpfCnpj(!includeCpfCnpj)}
                  />
                  <label htmlFor="cpf-toggle"></label>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button className="place-order-button" onClick={handlePlaceOrder}>
              Fazer pedido
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <div className="summary-header">
            <div className="summary-restaurant">
              <h3>Seu pedido em</h3>
              <h2>
                {safeCartProducts.length > 0 ? safeCartProducts[0].restaurantName || "Restaurante" : "Restaurante"}
              </h2>
            </div>
            <button className="view-menu-button">Ver Cardápio</button>
          </div>

          <div className="summary-items">
            {safeCartProducts.length > 0 ? (
              safeCartProducts.map((product, index) => (
                <div key={product.id || index} className="summary-item">
                  <div className="item-quantity">{product.quantity || 1}x</div>
                  <div className="item-details">
                    <h4>{product.name || "Produto"}</h4>
                    {product.description && <p className="item-description">{product.description}</p>}
                  </div>
                  <div className="item-price">
                    {formatPrice(
                      (typeof product.price === "string"
                        ? Number.parseFloat(product.price.replace("R$ ", "").replace(",", "."))
                        : Number(product.price) || 0) * (product.quantity || 1),
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-cart-message">Nenhum item no carrinho</div>
            )}
          </div>

          {/* Coupon */}
          <div className="coupon-section">
            <div className="coupon-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M21 5H3C2.4 5 2 5.4 2 6V10C2 10.6 2.4 11 3 11H21C21.6 11 22 10.6 22 10V6C22 5.4 21.6 5 21 5Z"
                  stroke="#717171"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 13H3C2.4 13 2 13.4 2 14V18C2 28.6 2.4 19 3 19H21C21.6 19 22 18.6 22 18V14C22 13.4 21.6 13 21 13Z"
                  stroke="#717171"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.5 8H5.51M5.5 16H5.51"
                  stroke="#717171"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="coupon-details">
              <h4>Cupom</h4>
              <p>Código de cupom</p>
            </div>
            <ChevronRight size={20} className="coupon-arrow" />
          </div>

          {/* Order Totals */}
          <div className="order-totals">
            <div className="total-row">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="total-row">
              <span>Taxa de entrega</span>
              <span className={getCurrentDeliveryFee() === 0 ? "free-delivery" : ""}>
                {getCurrentDeliveryFee() === 0 ? "Grátis" : formatPrice(getCurrentDeliveryFee())}
              </span>
            </div>
            <div className="total-row final-total">
              <span>Total</span>
              <span>{formatPrice(getFinalTotal())}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Card Modal */}
      {showEditCardModal && (
        <div className="modal-overlay" onClick={() => setShowEditCardModal(false)}>
          <div className="edit-card-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar cartão</h2>
              <button className="close-modal" onClick={() => setShowEditCardModal(false)} aria-label="Fechar modal">
                <X size={24} />
              </button>
            </div>
            <div className="modal-content">
              <div className="card-info">
                <div className="card-icon">
                  <CreditCard size={24} />
                </div>
                <div className="card-details">
                  <p className="card-brand">
                    {editingCard?.bandeira} {editingCard?.tipo}
                  </p>
                  <p className="card-number">•••• {editingCard?.ultimos_4_digitos}</p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="cardNickname">Apelido do cartão</label>
                <input
                  type="text"
                  id="cardNickname"
                  value={cardNickname}
                  onChange={(e) => setCardNickname(e.target.value)}
                  placeholder="Ex: Cartão do trabalho"
                  maxLength={50}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="modal-cancel-button" onClick={() => setShowEditCardModal(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className="modal-save-button"
                onClick={handleSaveCardNickname}
                disabled={!cardNickname.trim()}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="address-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {addressModalStep === 1
                  ? "Selecione um endereço"
                  : addressModalStep === 2
                    ? "Buscar endereço"
                    : "Completar endereço"}
              </h2>
              <button
                className="close-modal"
                onClick={() => {
                  setShowAddressModal(false)
                  setAddressModalStep(1)
                }}
                aria-label="Fechar modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Step 1: Address List */}
            {addressModalStep === 1 && (
              <div className="modal-content">
                {state.loading.addresses ? (
                  <div style={{ padding: "40px", textAlign: "center" }}>
                    <div className="loading-spinner"></div>
                    <p>Carregando endereços...</p>
                  </div>
                ) : state.addresses && state.addresses.length > 0 ? (
                  <div className="saved-addresses">
                    {state.addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`saved-address-item ${
                          state.selectedAddress && state.selectedAddress.id === address.id ? "selected" : ""
                        }`}
                        onClick={() => handleAddressSelect(address)}
                      >
                        <div className="address-icon">
                          {(address.label || address.rotulo) === "Casa" ? <Home size={20} /> : <Briefcase size={20} />}
                        </div>
                        <div className="address-details">
                          <div className="address-label">{address.label || address.rotulo}</div>
                          <div className="address-line">
                            {address.street || address.rua}, {address.number || address.numero}
                            {(address.complement || address.complemento) &&
                              `, ${address.complement || address.complemento}`}
                          </div>
                          <div className="address-line secondary">
                            {address.neighborhood || address.bairro}, {address.city || address.cidade} -{" "}
                            {address.state || address.estado}
                          </div>
                        </div>
                        <div className="address-actions">
                          {address.isDefault || address.padrao ? (
                            <div className="default-badge">Padrão</div>
                          ) : (
                            <button
                              className="set-default-button"
                              onClick={(e) => {
                                e.stopPropagation()
                                actions.updateAddress(address.id, { ...address, isDefault: true })
                              }}
                            >
                              Definir como padrão
                            </button>
                          )}
                          <button
                            className="delete-address-button"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (window.confirm("Tem certeza que deseja excluir este endereço?")) {
                                actions.deleteAddress(address.id)
                              }
                            }}
                            title="Excluir endereço"
                            aria-label="Excluir endereço"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3 6H5H21"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-addresses">
                    <div className="empty-addresses-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                          stroke="#ccc"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                          stroke="#ccc"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h3>Nenhum endereço cadastrado</h3>
                    <p>Adicione um novo endereço para continuar.</p>
                  </div>
                )}

                <button
                  className="add-address-button"
                  onClick={() => setAddressModalStep(2)}
                  disabled={state.loading.addresses}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 5V19M5 12H19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {state.addresses && state.addresses.length > 0 ? "Adicionar novo endereço" : "Adicionar endereço"}
                </button>
              </div>
            )}

            {/* Step 2: Address Search */}
            {addressModalStep === 2 && (
              <div className="modal-content">
                <div className="address-search-container">
                  <div className="address-search-input">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="Digite seu endereço"
                      value={addressSearchQuery}
                      onChange={(e) => setAddressSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="address-manual-entry">
                  <button type="button" className="manual-entry-button" onClick={() => setAddressModalStep(3)}>
                    Preencher endereço manualmente
                  </button>
                </div>

                <div className="modal-actions">
                  <button type="button" className="modal-back-button" onClick={() => setAddressModalStep(1)}>
                    Voltar
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Address Form */}
            {addressModalStep === 3 && (
              <div className="modal-content">
                <div className="address-form">
                  <div className="address-label-selector">
                    <div className="label-title">Identificação</div>
                    <div className="label-options">
                      <button
                        type="button"
                        className={`label-option ${newAddress.label === "Casa" ? "selected" : ""}`}
                        onClick={() => setAddressLabel("Casa")}
                      >
                        <Home size={16} />
                        Casa
                      </button>
                      <button
                        type="button"
                        className={`label-option ${newAddress.label === "Trabalho" ? "selected" : ""}`}
                        onClick={() => setAddressLabel("Trabalho")}
                      >
                        <Briefcase size={16} />
                        Trabalho
                      </button>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="street">Rua</label>
                      <input
                        type="text"
                        id="street"
                        name="street"
                        value={newAddress.street}
                        onChange={handleAddressFormChange}
                        placeholder="Nome da rua"
                      />
                    </div>
                  </div>

                  <div className="form-row two-columns">
                    <div className="form-group">
                      <label htmlFor="number">Número</label>
                      <input
                        type="text"
                        id="number"
                        name="number"
                        value={newAddress.number}
                        onChange={handleAddressFormChange}
                        placeholder="Número"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="complement">Complemento</label>
                      <input
                        type="text"
                        id="complement"
                        name="complement"
                        value={newAddress.complement}
                        onChange={handleAddressFormChange}
                        placeholder="Apto, Bloco, etc."
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="neighborhood">Bairro</label>
                      <input
                        type="text"
                        id="neighborhood"
                        name="neighborhood"
                        value={newAddress.neighborhood}
                        onChange={handleAddressFormChange}
                        placeholder="Bairro"
                      />
                    </div>
                  </div>

                  <div className="form-row two-columns">
                    <div className="form-group">
                      <label htmlFor="city">Cidade</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={newAddress.city}
                        onChange={handleAddressFormChange}
                        placeholder="Cidade"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="state">Estado</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={newAddress.state}
                        onChange={handleAddressFormChange}
                        placeholder="Estado"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="zipCode">CEP</label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={newAddress.zipCode}
                        onChange={handleAddressFormChange}
                        placeholder="00000-000"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group checkbox">
                      <input
                        type="checkbox"
                        id="isDefault"
                        name="isDefault"
                        checked={newAddress.isDefault}
                        onChange={handleAddressFormChange}
                      />
                      <label htmlFor="isDefault">Definir como endereço padrão</label>
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="modal-back-button" onClick={() => setAddressModalStep(2)}>
                    Voltar
                  </button>
                  <button
                    type="button"
                    className="modal-save-button"
                    onClick={saveNewAddress}
                    disabled={
                      state.loading.addresses ||
                      !newAddress.label ||
                      !newAddress.street ||
                      !newAddress.number ||
                      !newAddress.neighborhood ||
                      !newAddress.city ||
                      !newAddress.state
                    }
                  >
                    {state.loading.addresses ? "Salvando..." : "Salvar endereço"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentPage
