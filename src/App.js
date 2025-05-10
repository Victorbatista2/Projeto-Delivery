"use client"
import { useState, useEffect } from "react"
import LoginRegister from "./Components/LoginRegister/LoginRegister"
import HomePage from "./Components/HomePage/HomePage"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true) // Adicionamos um estado de loading

  useEffect(() => {
    // Verifica se há um usuário salvo, mas não faz login automaticamente
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      // Não definimos isAuthenticated como true aqui
    }
    setIsLoading(false)
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("user")
    // Adicione isso se estiver usando tokens:
    localStorage.removeItem("token")
  }

  if (isLoading) {
    return <div>Carregando...</div> // Ou um spinner de loading
  }

  return (
    <div>
      {!isAuthenticated ? (
        <LoginRegister onLoginSuccess={handleLoginSuccess} />
      ) : (
        <HomePage user={user} onLogout={handleLogout} />
      )}
    </div>
  )
}

export default App