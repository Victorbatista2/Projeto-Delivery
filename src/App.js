import React, { Suspense } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AppProvider, useApp } from "./contexts/AppContext"
import ErrorBoundary from "./shared/ErrorBoundary"
import LoadingSpinner from "./shared/LoadingSpinner"
import NotificationSystem from "./shared/NotificationSystem"
import "./App.css"



// Lazy loading dos componentes
const HomePage = React.lazy(() => import("./Components/HomePage/HomePage"))
const CategoryPage = React.lazy(() => import("./Components/CategoryPage/CategoryPage"))
const LoginRegister = React.lazy(() => import("./Components/LoginRegister/LoginRegister"))
const PaymentPage = React.lazy(() => import("./Components/PaymentPage/PaymentPage"))
const RestaurantProfile = React.lazy(() => import("./Components/RestaurantProfile/RestaurantProfile"))
const OrderTracking = React.lazy(() => import("./Components/OrderTracking/OrderTracking"))

// Componente de loading para Suspense
const PageLoader = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f7f7f7",
    }}
  >
    <LoadingSpinner size="large" />
  </div>
)

// Componente principal da aplicação
function AppContent() {
  const { state, actions } = useApp()

  // Mostrar loading apenas por um tempo limitado
  if (state.loading.auth) {
    return <PageLoader />
  }

  return (
    <Router>
      <div className="app">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Rota de login - sempre acessível */}
            <Route path="/login" element={state.isAuthenticated ? <Navigate to="/" replace /> : <LoginRegister />} />

            {/* Rotas protegidas */}
            {state.isAuthenticated ? (
              <>
                <Route path="/" element={<HomePage user={state.user} onLogout={actions.logout} />} />
                <Route path="/categoria/:category" element={<CategoryPage />} />
                <Route path="/restaurante/:id" element={<RestaurantProfile />} />
                <Route
                  path="/pagamento"
                  element={
                    <PaymentPage
                      cartProducts={state.cart.items}
                      cartTotal={state.cart.total}
                      deliveryFee={7.9}
                      selectedAddress={state.selectedAddress}
                      onBack={() => window.history.back()}
                    />
                  }
                />
                <Route path="/pedido/:pedidoId" element={<OrderTracking />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <>
                {/* Rotas públicas quando não autenticado */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            )}
          </Routes>
        </Suspense>

        {/* Sistema de notificações */}
        <NotificationSystem />
      </div>
    </Router>
  )
}

// Componente App principal com providers
function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  )
}

export default App








