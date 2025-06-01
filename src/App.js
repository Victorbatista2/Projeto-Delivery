"use client"

import { useState, useEffect } from "react"
import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom"
import "./App.css"
import HomePage from "./Components/HomePage/HomePage"
import CategoryPage from "./Components/CategoryPage/CategoryPage"
import LoginRegister from "./Components/LoginRegister/LoginRegister"
import PaymentPage from "./Components/PaymentPage/PaymentPage"

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentData, setPaymentData] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Verificar se há sessão salva no localStorage
  useEffect(() => {
    const savedUserData = localStorage.getItem("userData")

    if (savedUserData) {
      try {
        const userData = JSON.parse(savedUserData)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Erro ao recuperar dados do usuário:", error)
        localStorage.removeItem("userData")
      }
    }

    setLoading(false)
  }, [])

  // Função para lidar com login bem-sucedido
  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem("userData", JSON.stringify(userData))
  }

  // Função para lidar com logout
  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("userData")
    setShowPayment(false)
    setPaymentData(null)
  }

  // Função para proceder ao pagamento
  const handleProceedToPayment = (cartProducts, cartTotal, deliveryFee, selectedAddress) => {
    setPaymentData({
      cartProducts,
      cartTotal,
      deliveryFee,
      selectedAddress,
    })
    setShowPayment(true)
  }

  // Função para voltar da tela de pagamento
  const handleBackFromPayment = () => {
    setShowPayment(false)
    setPaymentData(null)
  }

  // Mostrar loading enquanto verifica a sessão
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          color: "#717171",
        }}
      >
        Carregando...
      </div>
    )
  }

  // Se não estiver autenticado, mostrar LoginRegister
  if (!isAuthenticated) {
    return <LoginRegister onLoginSuccess={handleLoginSuccess} />
  }

  // Se estiver na tela de pagamento, mostrar PaymentPage
  if (showPayment && paymentData) {
    return (
      <PaymentPage
        cartProducts={paymentData.cartProducts}
        cartTotal={paymentData.cartTotal}
        deliveryFee={paymentData.deliveryFee}
        selectedAddress={paymentData.selectedAddress}
        onBack={handleBackFromPayment}
      />
    )
  }

  // Configuração das rotas (só acessível após autenticação)
  const router = createBrowserRouter([
    {
      path: "/",
      element: <HomePage user={user} onLogout={handleLogout} onProceedToPayment={handleProceedToPayment} />,
    },
    {
      path: "/categoria/:category",
      element: <CategoryPage />,
    },
    // Rota catch-all para redirecionar para home se a rota não existir
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ])

  return <RouterProvider router={router} />
}

export default App



