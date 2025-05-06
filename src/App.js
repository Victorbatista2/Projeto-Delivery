
"use client"

import { useState, useEffect } from "react"
import LoginRegister from "./Components/LoginRegister/LoginRegister"
import HomePage from "./Components/HomePage/HomePage"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  // Check if user is already logged in (e.g., from localStorage or session)
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
  }, [])

  // Handle successful login
  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    // Store user data for persistence
    localStorage.setItem("user", JSON.stringify(userData))
  }

  // Handle logout
  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("user")
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

