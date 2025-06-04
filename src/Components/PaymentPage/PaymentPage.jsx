"use client"

import { useState } from "react"
import { ArrowLeft, CreditCard, Info, ChevronRight } from "lucide-react"
import "./PaymentPage.css"

const PaymentPage = ({ cartProducts, cartTotal, deliveryFee, selectedAddress, onBack }) => {
  const [paymentTab, setPaymentTab] = useState("site") // site or delivery
  const [savedCards, setSavedCards] = useState([])
  const [cpfCnpj, setCpfCnpj] = useState("")
  const [includeCpfCnpj, setIncludeCpfCnpj] = useState(false)
  const [couponCode, setCouponCode] = useState("")

  // Format price for display
  const formatPrice = (price) => {
    return `R$ ${price.toFixed(2).replace(".", ",")}`
  }

  // Format address for display
  const formatAddressForDisplay = (address) => {
    if (!address) return "Nenhum - Selecione um endereço"
    return `${address.street}, ${address.number} - ${address.neighborhood}, ${address.city}/${address.state}`
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
              className={`delivery-tab ${!paymentTab || paymentTab === "entrega" ? "active" : ""}`}
              onClick={() => setPaymentTab("entrega")}
            >
              Entrega
            </button>
            <button
              className={`delivery-tab ${paymentTab === "retirada" ? "active" : ""}`}
              onClick={() => setPaymentTab("retirada")}
            >
              Retirada
            </button>
          </div>

          {/* Delivery Address */}
          <div className="delivery-address">
            <div className="address-pin-icon">
              <div className="pin-circle">
                <div className="pin-dot"></div>
              </div>
            </div>
            <div className="address-details">
              <p className="address-text">
                {selectedAddress ? formatAddressForDisplay(selectedAddress) : "Nenhum - Selecione um endereço"}
              </p>
            </div>
            <button className="address-change-button">Trocar</button>
          </div>

          {/* Delivery Time */}
          <div className="delivery-time">
            <h3>Hoje, 20-30 min</h3>

            <div className="delivery-option">
              <div className="delivery-option-header">
                <span className="delivery-option-label">Padrão</span>
                <Info size={16} className="info-icon" />
              </div>
              <div className="delivery-option-details">
                <span>Hoje, 20-30 min</span>
                <span className="delivery-fee-text">Grátis</span>
              </div>
            </div>
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
              <div className="card-info-container">
                <p>É prático, seguro e você não perde nenhum minuto a mais quando seu pedido chegar.</p>
                <div className="card-illustration">
                  <img src="/placeholder.svg?height=100&width=150" alt="Credit card illustration" />
                </div>
              </div>
              <button className="add-card-button">Adicionar novo cartão</button>
            </div>

            {/* Saved Cards */}
            {savedCards.length > 0 && (
              <div className="saved-cards">
                <h3>Cartões salvos</h3>
                {savedCards.map((card) => (
                  <div key={card.id} className="saved-card">
                    <div className="card-icon">
                      <CreditCard size={20} />
                    </div>
                    <div className="card-details">
                      <p className="card-name">{card.name}</p>
                      <p className="card-number">•••• {card.lastDigits}</p>
                    </div>
                  </div>
                ))}
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
            <button className="place-order-button">Fazer pedido</button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <div className="summary-header">
            <div className="summary-restaurant">
              <h3>Seu pedido em</h3>
              <h2>{cartProducts.length > 0 ? cartProducts[0].restaurant : "Restaurante"}</h2>
            </div>
            <button className="view-menu-button">Ver Cardápio</button>
          </div>

          <div className="summary-items">
            {cartProducts.length > 0 ? (
              cartProducts.map((product) => (
                <div key={product.id} className="summary-item">
                  <div className="item-quantity">{product.quantity}x</div>
                  <div className="item-details">
                    <h4>{product.name}</h4>
                    {product.description && <p className="item-description">{product.description}</p>}
                  </div>
                  <div className="item-price">
                    {formatPrice(
                      Number.parseFloat(product.price.replace("R$ ", "").replace(",", ".")) * product.quantity,
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
                  d="M21 13H3C2.4 13 2 13.4 2 14V18C2 18.6 2.4 19 3 19H21C21.6 19 22 18.6 22 18V14C22 13.4 21.6 13 21 13Z"
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
              <span className={deliveryFee === 0 ? "free-delivery" : ""}>
                {deliveryFee === 0 ? "Grátis" : formatPrice(deliveryFee)}
              </span>
            </div>
            <div className="total-row final-total">
              <span>Total</span>
              <span>{formatPrice(cartTotal + deliveryFee)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage

