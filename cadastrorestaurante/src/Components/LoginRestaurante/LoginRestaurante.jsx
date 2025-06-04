"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./LoginRestaurante.css"

const LoginRestaurante = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Limpar erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "E-mail inválido"
    }

    if (!formData.senha.trim()) {
      newErrors.senha = "Senha é obrigatória"
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
      const response = await fetch("http://localhost:3001/api/restaurantes/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          senha: formData.senha,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao fazer login")
      }

      // Armazenar dados do restaurante no localStorage
      localStorage.setItem("restauranteData", JSON.stringify(data.data))

      console.log("Login bem-sucedido, redirecionando para dashboard...")

      // Redirecionar para o dashboard
      navigate("/dashboard")
    } catch (error) {
      setErrors({
        submit: error.message || "Credenciais inválidas. Verifique seu e-mail e senha.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-restaurante-container">
      <div className="login-header">
        <div className="logo-container">
          <svg viewBox="0 0 80 24" className="ifood-logo">
            <path
              d="M6.4 0h10.4v6.4H6.4V0zm0 9.6h10.4V16H6.4V9.6zm13.6-9.6H30v6.4H20V0zM0 0h3.2v22.4H0V0zm20 9.6h10.4V16H20V9.6zm-13.6 9.6h24v3.2h-24v-3.2zm30.4-19.2c-1.76 0-3.2 1.44-3.2 3.2v19.2h6.4V3.2c0-1.76-1.44-3.2-3.2-3.2zm7.2 0v22.4h6.4v-8h6.4v8h6.4V0h-6.4v8h-6.4V0h-6.4zm27.2 0c-1.76 0-3.2 1.44-3.2 3.2v19.2h6.4V3.2c0-1.76-1.44-3.2-3.2-3.2z"
              fill="#ea1d2c"
            ></path>
          </svg>
        </div>
        <h1>Login de Parceiro</h1>
      </div>

      <div className="login-content">
        <div className="login-form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
                placeholder="Seu e-mail de cadastro"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="senha">Senha</label>
              <input
                type="password"
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                className={errors.senha ? "error" : ""}
                placeholder="Sua senha"
              />
              {errors.senha && <span className="error-message">{errors.senha}</span>}
            </div>

            {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

            <button type="submit" className="login-submit-button" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="register-link">
            <p>Ainda não é parceiro?</p>
            <button type="button" className="register-button" onClick={() => navigate("/cadastro")}>
              Cadastre-se aqui
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginRestaurante
