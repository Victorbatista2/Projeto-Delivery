import { CreditCard } from "lucide-react"
import "./PaymentMethodSelection.css"

const PaymentMethodSelection = ({ onSelectCreditCard, onBack }) => {
  return (
    <div className="payment-method-selection">
      <div className="payment-method-content">
        <h1 className="payment-method-title">Escolha um meio de pagamento</h1>

        <div className="payment-options">
          <button
            className="payment-option"
            onClick={onSelectCreditCard}
          >
            <div className="payment-option-icon">
              <CreditCard size={20} color="#666666" />
            </div>
            <span className="payment-option-text">Crédito</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentMethodSelection







