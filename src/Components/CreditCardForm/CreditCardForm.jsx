import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useApp } from "../../contexts/AppContext"
import "./CreditCardForm.css"

const CreditCardForm = ({ onBack }) => {
  const { state, actions } = useApp()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [cardFlipped, setCardFlipped] = useState(false)

  const [formData, setFormData] = useState({
    numero: "",
    titular: "",
    validade: "",
    codigo: "",
    apelido: "",
    documento: "",
  })

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  // Format expiry date MM/AA
  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  // Format CPF/CNPJ
  const formatCpfCnpj = (value) => {
    const v = value.replace(/\D/g, "")
    if (v.length <= 11) {
      // CPF format: 000.000.000-00
      return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    } else {
      // CNPJ format: 00.000.000/0000-00
      return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value

    switch (name) {
      case "numero":
        formattedValue = formatCardNumber(value)
        if (formattedValue.replace(/\s/g, "").length > 16) return
        break
      case "validade":
        formattedValue = formatExpiryDate(value)
        if (formattedValue.length > 5) return
        break
      case "codigo":
        formattedValue = value.replace(/\D/g, "")
        if (formattedValue.length > 4) return
        break
      case "documento":
        formattedValue = formatCpfCnpj(value)
        break
      case "titular":
        formattedValue = value.toUpperCase()
        break
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleCvvFocus = () => {
    setCardFlipped(true)
  }

  const handleCvvBlur = () => {
    setCardFlipped(false)
  }

  const validateForm = () => {
    const newErrors = {}

    // Card number validation
    const cardNumberClean = formData.numero.replace(/\s/g, "")
    if (!cardNumberClean) {
      newErrors.numero = "Número do cartão é obrigatório"
    } else if (cardNumberClean.length < 13 || cardNumberClean.length > 16) {
      newErrors.numero = "Número do cartão inválido"
    }

    // Card name validation
    if (!formData.titular.trim()) {
      newErrors.titular = "Nome no cartão é obrigatório"
    }

    // Expiry date validation
    if (!formData.validade) {
      newErrors.validade = "Data de validade é obrigatória"
    } else if (formData.validade.length !== 5) {
      newErrors.validade = "Data de validade inválida"
    } else {
      const [month, year] = formData.validade.split("/")
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear() % 100
      const currentMonth = currentDate.getMonth() + 1

      if (Number.parseInt(month) < 1 || Number.parseInt(month) > 12) {
        newErrors.validade = "Mês inválido"
      } else if (
        Number.parseInt(year) < currentYear ||
        (Number.parseInt(year) === currentYear && Number.parseInt(month) < currentMonth)
      ) {
        newErrors.validade = "Cartão expirado"
      }
    }

    // CVV validation
    if (!formData.codigo) {
      newErrors.codigo = "CVV é obrigatório"
    } else if (formData.codigo.length < 3 || formData.codigo.length > 4) {
      newErrors.codigo = "CVV inválido"
    }

    // Card nickname validation
    if (!formData.apelido.trim()) {
      newErrors.apelido = "Apelido do cartão é obrigatório"
    }

    // CPF/CNPJ validation
    if (!formData.documento) {
      newErrors.documento = "CPF/CNPJ é obrigatório"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const cardData = {
        usuario_id: state.user.id,
        tipo: "credito",
        ultimos_4_digitos: formData.numero.replace(/\s/g, "").slice(-4),
        nome_titular: formData.titular,
        bandeira: detectCardBrand(formData.numero),
        data_expiracao: `20${formData.validade.split("/")[1]}-${formData.validade.split("/")[0]}-01`,
        token_pagamento: generateToken(),
        metodo_padrao: state.paymentMethods.length === 0, // Set as default if it's the first card
        apelido: formData.apelido,
      }

      // Use the context action instead of direct fetch
      await actions.addPaymentMethod(cardData)

      // Navigate back to payment page
      onBack()
    } catch (error) {
      console.error("Erro ao salvar cartão:", error)
      setErrors({ submit: "Erro ao salvar cartão. Tente novamente." })
    } finally {
      setLoading(false)
    }
  }

  const detectCardBrand = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, "")
    if (number.startsWith("4")) return "Visa"
    if (number.startsWith("5") || number.startsWith("2")) return "Mastercard"
    if (number.startsWith("3")) return "American Express"
    return "Outros"
  }

  const generateToken = () => {
    // In production, this would be handled by a secure payment processor
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const getDisplayCardNumber = () => {
    if (!formData.numero) return "0000 0000 0000 0000"
    const formatted = formData.numero.padEnd(19, "0").substring(0, 19)
    return formatted || "0000 0000 0000 0000"
  }

  const getDisplayName = () => {
    return formData.titular || "Nome impresso no cartão"
  }

  const getDisplayExpiry = () => {
    return formData.validade || "MM/AA"
  }

  return (
    <div className="credit-card-form">
      <div className="credit-card-header">
        <button className="credit-card-back-button" onClick={onBack}>
          <ArrowLeft size={20} />
          Crédito
        </button>
      </div>

      <div className="credit-card-container">
        <div className="credit-card-form-section">
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="credit-card-form-group">
              <input
                type="text"
                name="numero"
                placeholder="Número do cartão"
                value={formData.numero}
                onChange={handleInputChange}
                autoComplete="off"
                className={errors.numero ? "input-error" : ""}
              />
              {errors.numero && <div className="form-error">{errors.numero}</div>}
            </div>

            <div className="credit-card-form-group">
              <input
                type="text"
                name="titular"
                placeholder="Nome impresso no cartão"
                value={formData.titular}
                onChange={handleInputChange}
                autoComplete="off"
                className={errors.titular ? "input-error" : ""}
              />
              {errors.titular && <div className="form-error">{errors.titular}</div>}
            </div>

            <div className="credit-card-form-row">
              <div className="credit-card-form-group">
                <input
                  type="text"
                  name="validade"
                  placeholder="Validade"
                  value={formData.validade}
                  onChange={handleInputChange}
                  autoComplete="off"
                  className={errors.validade ? "input-error" : ""}
                />
                {errors.validade && <div className="form-error">{errors.validade}</div>}
              </div>

              <div className="credit-card-form-group">
                <input
                  type="text"
                  name="codigo"
                  placeholder="CVV"
                  value={formData.codigo}
                  onChange={handleInputChange}
                  onFocus={handleCvvFocus}
                  onBlur={handleCvvBlur}
                  autoComplete="off"
                  className={errors.codigo ? "input-error" : ""}
                />
                {errors.codigo && <div className="form-error">{errors.codigo}</div>}
              </div>
            </div>

            <div className="credit-card-form-group">
              <input
                type="text"
                name="apelido"
                placeholder="Apelido do cartão"
                value={formData.apelido}
                onChange={handleInputChange}
                autoComplete="off"
                className={errors.apelido ? "input-error" : ""}
              />
              {errors.apelido && <div className="form-error">{errors.apelido}</div>}
            </div>

            <div className="credit-card-form-group">
              <input
                type="text"
                name="documento"
                placeholder="CPF/CNPJ do titular"
                value={formData.documento}
                onChange={handleInputChange}
                autoComplete="off"
                className={errors.documento ? "input-error" : ""}
              />
              {errors.documento && <div className="form-error">{errors.documento}</div>}
            </div>

            {errors.submit && <div className="form-error">{errors.submit}</div>}

            <button type="submit" className="credit-card-submit" disabled={loading}>
              {loading ? (
                <div className="credit-card-loading">
                  <div className="credit-card-spinner"></div>
                  Adicionando...
                </div>
              ) : (
                "Adicionar"
              )}
            </button>
          </form>
        </div>

        <div className="credit-card-preview">
          <div className={`credit-card-preview-card ${cardFlipped ? "flipped" : ""}`}>
            <div className="credit-card-front">
              <div className="credit-card-type">
                <div className="credit-card-type-icon">
                  <svg width="16" height="12" viewBox="0 0 24 16" fill="none">
                    <rect width="24" height="16" rx="2" fill="white" fillOpacity="0.3" />
                    <circle cx="8" cy="8" r="3" fill="white" fillOpacity="0.6" />
                    <circle cx="16" cy="8" r="3" fill="white" fillOpacity="0.6" />
                  </svg>
                </div>
                <span className="credit-card-type-text">Crédito</span>
              </div>

              <div className="credit-card-number">{getDisplayCardNumber()}</div>

              <div className="credit-card-details">
                <div className="credit-card-name">{getDisplayName()}</div>
                <div className="credit-card-expiry">{getDisplayExpiry()}</div>
              </div>
            </div>

            <div className="credit-card-back">
              <div className="credit-card-magnetic-strip"></div>

              <div className="credit-card-cvv-area">
                <div className="credit-card-cvv-display">{formData.codigo || "CVV"}</div>
              </div>

              <div className="credit-card-signature-strip">
                <div className="credit-card-signature-text">{formData.titular || "Assinatura do portador"}</div>
              </div>

              <div className="credit-card-back-info">
                <div>Este cartão é propriedade do banco emissor</div>
                <div>e deve ser devolvido quando solicitado.</div>
                <div style={{ marginTop: "8px", fontSize: "10px" }}>CVV é o código de segurança de 3 ou 4 dígitos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreditCardForm
