"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Search, ShoppingBag, Bell, ChevronDown, ChevronLeft, Filter, Star, Clock, Ticket } from "lucide-react"
import "./CategoryPage.css"

const CategoryPage = () => {
  const { category } = useParams()
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState([])
  const [notifications, setNotifications] = useState(0)
  const [cartItems, setCartItems] = useState(0)
  const [cartTotal, setCartTotal] = useState(0)
  const [selectedAddress, setSelectedAddress] = useState(null)

  // Formatar o nome da categoria para exibição
  const formatCategoryName = (categorySlug) => {
    return categorySlug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const categoryName = formatCategoryName(category)

  // Buscar restaurantes da categoria
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!categoryName) return

      setLoading(true)
      try {
        console.log(`Buscando restaurantes da categoria: ${categoryName}`)

        // Função para fazer requisição com retry automático
        const fetchWithRetry = async (url, maxRetries = 3) => {
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              const controller = new AbortController()
              const timeoutId = setTimeout(() => controller.abort(), 8000)

              const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                  "Content-Type": "application/json",
                },
              })

              clearTimeout(timeoutId)

              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
              }

              const data = await response.json()
              return Array.isArray(data) ? data : []
            } catch (error) {
              console.warn(`Tentativa ${attempt}/${maxRetries} falhou:`, error.message)
              if (attempt === maxRetries) throw error
              await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
            }
          }
        }

        const data = await fetchWithRetry(
          `http://localhost:3001/api/restaurantes/categoria/${encodeURIComponent(categoryName)}`,
        )

        console.log(`${data.length} restaurantes encontrados para ${categoryName}`)
        setRestaurants(data)
      } catch (error) {
        console.error("Erro ao buscar restaurantes da categoria:", error)
        setRestaurants([])
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurants()
  }, [categoryName])

  // Formatar o endereço para exibição
  const formatAddressForDisplay = (address) => {
    if (!address) return ""
    return `${address.street}, ${address.number}`
  }

  // Formatar preço para exibição
  const formatPrice = (price) => {
    return `R$ ${price.toFixed(2).replace(".", ",")}`
  }

  // Aplicar filtro
  const toggleFilter = (filter) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== filter))
    } else {
      setSelectedFilters([...selectedFilters, filter])
    }
  }

  // Voltar para a página anterior
  const goBack = () => {
    navigate(-1)
  }

  return (
    <div className="category-page">
      <header className="category-header">
        <div className="header-container">
          <button className="back-button" onClick={goBack}>
            <ChevronLeft size={24} />
          </button>
          <h1 className="category-title">{categoryName}</h1>
          <div className="header-actions">
            <div className="notification-icon">
              <Bell size={24} />
              {notifications > 0 && <span className="notification-badge">{notifications}</span>}
            </div>
            <div className="cart-icon">
              <ShoppingBag size={24} />
              <div className="cart-info">
                <div className="cart-total">{cartTotal > 0 ? formatPrice(cartTotal) : "R$ 0,00"}</div>
                <div className="cart-items">
                  {cartItems} {cartItems === 1 ? "item" : "itens"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="category-content">
        <div className="search-container">
          <div className="search-input">
            <Search className="search-icon" size={20} />
            <input type="text" placeholder={`Buscar em ${categoryName}`} />
          </div>
        </div>

        <div className="filters-container">
          <button
            className={`filter-button ${selectedFilters.includes("ordenar") ? "active" : ""}`}
            onClick={() => toggleFilter("ordenar")}
          >
            Ordenar <ChevronDown size={16} />
          </button>
          <button
            className={`filter-button ${selectedFilters.includes("entrega-gratis") ? "active" : ""}`}
            onClick={() => toggleFilter("entrega-gratis")}
          >
            Entrega Grátis
          </button>
          <button
            className={`filter-button ${selectedFilters.includes("vale-refeicao") ? "active" : ""}`}
            onClick={() => toggleFilter("vale-refeicao")}
          >
            Vale-refeição <ChevronDown size={16} />
          </button>
          <button
            className={`filter-button ${selectedFilters.includes("distancia") ? "active" : ""}`}
            onClick={() => toggleFilter("distancia")}
          >
            Distância <ChevronDown size={16} />
          </button>
          <button
            className={`filter-button ${selectedFilters.includes("entrega-parceira") ? "active" : ""}`}
            onClick={() => toggleFilter("entrega-parceira")}
          >
            Entrega Parceira
          </button>
          <button
            className={`filter-button ${selectedFilters.includes("super-restaurantes") ? "active" : ""}`}
            onClick={() => toggleFilter("super-restaurantes")}
          >
            Super Restaurantes
          </button>
          <button
            className={`filter-button ${selectedFilters.includes("pra-retirar") ? "active" : ""}`}
            onClick={() => toggleFilter("pra-retirar")}
          >
            Pra retirar
          </button>
          <button className="filter-button filters-all">
            Filtros <Filter size={16} />
          </button>
          <button className="filter-button clear-filters">Limpar</button>
        </div>

        <div className="restaurants-list">
          {loading ? (
            <div className="loading-state">
              <p>Carregando restaurantes...</p>
            </div>
          ) : restaurants.length > 0 ? (
            restaurants.map((restaurant) => (
              <div key={restaurant.id} className="restaurant-item">
                <div className="restaurant-logo">
                  <img src={restaurant.image || "/placeholder.svg?height=100&width=100"} alt={restaurant.name} />
                  {restaurant.featured && <div className="featured-badge"></div>}
                </div>
                <div className="restaurant-info">
                  <h3 className="restaurant-name">{restaurant.name}</h3>
                  <div className="restaurant-details">
                    <div className="restaurant-rating">
                      <Star size={16} className="star-icon" />
                      <span>{restaurant.rating}</span>
                    </div>
                    <span className="restaurant-category">{restaurant.category}</span>
                    <span className="restaurant-distance">{restaurant.distance}</span>
                  </div>
                  <div className="restaurant-delivery">
                    <div className="delivery-time">
                      <Clock size={16} />
                      <span>{restaurant.deliveryTime}</span>
                    </div>
                    <div className="delivery-fee">
                      {restaurant.deliveryFee === "Grátis" ? (
                        <span className="free-delivery">Grátis</span>
                      ) : (
                        <span>{restaurant.deliveryFee}</span>
                      )}
                    </div>
                  </div>
                  {restaurant.coupon && (
                    <div className="restaurant-coupon">
                      <Ticket size={16} />
                      <span>{restaurant.coupon}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <ShoppingBag size={48} />
              </div>
              <h2>Nenhum restaurante encontrado</h2>
              <p>Não encontramos restaurantes da categoria {categoryName} disponíveis no momento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CategoryPage




