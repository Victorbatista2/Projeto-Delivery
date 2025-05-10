"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import "./HomePage.css"
import {
  Search,
  ShoppingBag,
  Bell,
  ChevronDown,
  X,
  Home,
  Briefcase,
  MapPin,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
} from "lucide-react"

const HomePage = ({ user, onLogout, onProceedToPayment }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("inicio")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState({ restaurants: [], products: [] })
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [cartItems, setCartItems] = useState(0)
  const [cartTotal, setCartTotal] = useState(0)
  const [notifications, setNotifications] = useState(0)
  const searchRef = useRef(null)

  // Restaurantes e produtos
  const [restaurants, setRestaurants] = useState([])
  const [products, setProducts] = useState([])

  // Estados para o modal de endereço
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [addressModalStep, setAddressModalStep] = useState(1) // 1: lista, 2: busca, 3: formulário
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [addressSearchQuery, setAddressSearchQuery] = useState("")
  const [addressSuggestions, setAddressSuggestions] = useState([])
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
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef(null)
  const autocompleteInputRef = useRef(null)

  // Estados para a sacola
  const [showCart, setShowCart] = useState(false)
  const [cartProducts, setCartProducts] = useState([])
  const [deliveryFee, setDeliveryFee] = useState(7.9)
  const cartRef = useRef(null)

  // Adicionar a função para excluir um endereço
  const deleteAddress = (addressId, e) => {
    e.stopPropagation() // Evitar que o clique propague para o item do endereço

    // Confirmar antes de excluir
    if (window.confirm("Tem certeza que deseja excluir este endereço?")) {
      // Remover o endereço da lista
      const updatedAddresses = savedAddresses.filter((addr) => addr.id !== addressId)
      setSavedAddresses(updatedAddresses)

      // Se o endereço excluído for o selecionado, limpar a seleção ou selecionar outro
      if (selectedAddress && selectedAddress.id === addressId) {
        // Se houver outro endereço, selecionar o primeiro (ou o padrão, se existir)
        if (updatedAddresses.length > 0) {
          const defaultAddress = updatedAddresses.find((addr) => addr.isDefault)
          setSelectedAddress(defaultAddress || updatedAddresses[0])
        } else {
          setSelectedAddress(null)
        }
      }
    }
  }

  // Inicializar o mapa e o autocomplete
  const initMap = useCallback(() => {
    if (!mapRef.current || mapLoaded) return

    setMapLoaded(true)

    // Inicializar o mapa
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: -23.5505, lng: -46.6333 }, // São Paulo como centro padrão
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    })

    // Inicializar o autocomplete
    const autocomplete = new window.google.maps.places.Autocomplete(autocompleteInputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "br" }, // Restringir para Brasil, ajuste conforme necessário
    })

    // Vincular o autocomplete ao mapa
    autocomplete.bindTo("bounds", map)

    // Adicionar um marcador para o endereço selecionado
    const marker = new window.google.maps.Marker({
      map: map,
      anchorPoint: new window.google.maps.Point(0, -29),
    })

    // Evento para quando um lugar é selecionado no autocomplete
    autocomplete.addListener("place_changed", () => {
      marker.setVisible(false)
      const place = autocomplete.getPlace()

      if (!place.geometry || !place.geometry.location) {
        console.error("Detalhes do local não encontrados para este endereço.")
        return
      }

      // Centralizar o mapa no local selecionado
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport)
      } else {
        map.setCenter(place.geometry.location)
        map.setZoom(17)
      }

      // Posicionar o marcador
      marker.setPosition(place.geometry.location)
      marker.setVisible(true)

      // Extrair informações do endereço
      let street = ""
      let number = ""
      let neighborhood = ""
      let city = ""
      let state = ""
      let zipCode = ""

      // Processar os componentes do endereço
      for (const component of place.address_components) {
        const types = component.types

        if (types.includes("route")) {
          street = component.long_name
        } else if (types.includes("street_number")) {
          number = component.long_name
        } else if (types.includes("sublocality_level_1") || types.includes("sublocality")) {
          neighborhood = component.long_name
        } else if (types.includes("administrative_area_level_2")) {
          city = component.long_name
        } else if (types.includes("administrative_area_level_1")) {
          state = component.short_name
        } else if (types.includes("postal_code")) {
          zipCode = component.long_name
        }
      }

      // Atualizar o estado do novo endereço
      setNewAddress((prev) => ({
        ...prev,
        street,
        number,
        neighborhood,
        city,
        state,
        zipCode,
      }))

      // Avançar para o próximo passo
      setAddressModalStep(3)
    })

    // Salvar referências para uso posterior
    window.googleMap = map
    window.googleMarker = marker
    window.googleAutocomplete = autocomplete
  }, [mapLoaded])

  // Busca de endereços com a API do Google Maps
  const handleAddressSearch = (e) => {
    const query = e.target.value
    setAddressSearchQuery(query)
    // O Google Autocomplete gerencia as sugestões automaticamente
  }

  // Fechar resultados da pesquisa quando clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false)
      }

      if (
        showCart &&
        cartRef.current &&
        !cartRef.current.contains(event.target) &&
        !event.target.closest(".cart-icon") &&
        !event.target.closest(".cart-overlay")
      ) {
        setShowCart(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [searchRef, showCart])

  // Carregar o script do Google Maps
  useEffect(() => {
    if (showAddressModal && addressModalStep === 2 && !mapLoaded) {
      // Verificar se o script já foi carregado
      if (!document.getElementById("google-maps-script")) {
        const googleMapScript = document.createElement("script")
        googleMapScript.id = "google-maps-script"
        googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDdRLljL01LunT_X0eyE59DYtxdtav6oP0&libraries=places&callback=initGoogleMaps`
        googleMapScript.async = true
        googleMapScript.defer = true

        // Definir uma função global de callback
        window.initGoogleMaps = () => {
          initMap()
        }

        document.body.appendChild(googleMapScript)

        return () => {
          // Limpar a função global ao desmontar
          window.initGoogleMaps = null
        }
      } else if (window.google && window.google.maps) {
        // Se o script já foi carregado, inicializar o mapa diretamente
        initMap()
      }
    }
  }, [showAddressModal, addressModalStep, mapLoaded, initMap])

  // Selecionar um endereço sugerido
  const handleSelectSuggestion = (placeId) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error("Google Maps API não está disponível")
      return
    }

    const placesService = new window.google.maps.places.PlacesService(window.googleMap)

    placesService.getDetails(
      {
        placeId: placeId,
        fields: ["address_components", "geometry", "formatted_address"],
      },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          // Extrair informações do endereço
          let street = ""
          let number = ""
          let neighborhood = ""
          let city = ""
          let state = ""
          let zipCode = ""

          // Processar os componentes do endereço
          for (const component of place.address_components) {
            const types = component.types

            if (types.includes("route")) {
              street = component.long_name
            } else if (types.includes("street_number")) {
              number = component.long_name
            } else if (types.includes("sublocality_level_1") || types.includes("sublocality")) {
              neighborhood = component.long_name
            } else if (types.includes("administrative_area_level_2")) {
              city = component.long_name
            } else if (types.includes("administrative_area_level_1")) {
              state = component.short_name
            } else if (types.includes("postal_code")) {
              zipCode = component.long_name
            }
          }

          // Atualizar o estado do novo endereço
          setNewAddress({
            ...newAddress,
            street,
            number,
            neighborhood,
            city,
            state,
            zipCode,
          })

          // Centralizar o mapa no local selecionado
          if (window.googleMap && place.geometry) {
            if (place.geometry.viewport) {
              window.googleMap.fitBounds(place.geometry.viewport)
            } else {
              window.googleMap.setCenter(place.geometry.location)
              window.googleMap.setZoom(17)
            }

            // Posicionar o marcador
            if (window.googleMarker) {
              window.googleMarker.setPosition(place.geometry.location)
              window.googleMarker.setVisible(true)
            }
          }

          // Avançar para o próximo passo
          setAddressModalStep(3)
        } else {
          console.error("Erro ao obter detalhes do local:", status)
        }
      },
    )
  }

  // Salvar o novo endereço
  const saveNewAddress = () => {
    const addressToSave = {
      ...newAddress,
      id: Date.now(), // Usar timestamp como ID temporário
    }

    // Se o endereço for definido como padrão, atualizar os outros endereços
    if (addressToSave.isDefault) {
      const updatedAddresses = savedAddresses.map((addr) => ({
        ...addr,
        isDefault: false,
      }))
      setSavedAddresses([...updatedAddresses, addressToSave])
    } else {
      // Se for o primeiro endereço, definir como padrão automaticamente
      if (savedAddresses.length === 0) {
        addressToSave.isDefault = true
      }
      setSavedAddresses([...savedAddresses, addressToSave])
    }

    // Selecionar o novo endereço
    setSelectedAddress(addressToSave)

    // Resetar o formulário e fechar o modal
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
  }

  // Selecionar um endereço salvo
  const selectSavedAddress = (address) => {
    setSelectedAddress(address)
    setShowAddressModal(false)
  }

  // Definir um endereço como padrão
  const setAddressAsDefault = (addressId) => {
    const updatedAddresses = savedAddresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === addressId,
    }))

    setSavedAddresses(updatedAddresses)

    // Atualizar o endereço selecionado se necessário
    const defaultAddress = updatedAddresses.find((addr) => addr.id === addressId)
    if (defaultAddress) {
      setSelectedAddress(defaultAddress)
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    setIsMobileMenuOpen(false)
  }

  // Função para pesquisar restaurantes e produtos
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      performSearch(searchQuery)
    }
  }

  // Função para pesquisar em tempo real enquanto o usuário digita
  const handleSearchInputChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.trim().length > 2) {
      performSearch(query)
      setShowSearchResults(true)
    } else {
      setSearchResults({ restaurants: [], products: [] })
      setShowSearchResults(false)
    }
  }

  // Função que realiza a pesquisa nos dados
  const performSearch = (query) => {
    const normalizedQuery = query.toLowerCase().trim()

    // Pesquisar restaurantes
    const filteredRestaurants = restaurants.filter(
      (restaurant) =>
        restaurant.name.toLowerCase().includes(normalizedQuery) ||
        restaurant.category.toLowerCase().includes(normalizedQuery),
    )

    // Pesquisar produtos
    const filteredProducts = products.filter(
      (product) =>
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.restaurant.toLowerCase().includes(normalizedQuery),
    )

    // Combinar resultados
    setSearchResults({
      restaurants: filteredRestaurants,
      products: filteredProducts,
    })
  }

  // Limpar a pesquisa
  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults({ restaurants: [], products: [] })
    setShowSearchResults(false)
  }

  // Adicionar ao carrinho
  const addToCart = (product) => {
    // Verificar se o produto já está no carrinho
    const existingProductIndex = cartProducts.findIndex((item) => item.id === product.id)

    if (existingProductIndex !== -1) {
      // Se o produto já existe, aumentar a quantidade
      const updatedCartProducts = [...cartProducts]
      updatedCartProducts[existingProductIndex].quantity += 1
      setCartProducts(updatedCartProducts)
    } else {
      // Se o produto não existe, adicionar ao carrinho
      setCartProducts([...cartProducts, { ...product, quantity: 1 }])
    }

    // Atualizar o número total de itens
    setCartItems((prevItems) => prevItems + 1)

    // Atualizar o valor total
    const price = Number.parseFloat(product.price.replace("R$ ", "").replace(",", "."))
    setCartTotal((prevTotal) => prevTotal + price)

    // Fechar os resultados da pesquisa
    setShowSearchResults(false)
  }

  // Aumentar quantidade de um item no carrinho
  const increaseQuantity = (productId) => {
    const updatedCartProducts = cartProducts.map((product) => {
      if (product.id === productId) {
        const newQuantity = product.quantity + 1
        const price = Number.parseFloat(product.price.replace("R$ ", "").replace(",", "."))
        setCartTotal((prevTotal) => prevTotal + price)
        setCartItems((prevItems) => prevItems + 1)
        return { ...product, quantity: newQuantity }
      }
      return product
    })

    setCartProducts(updatedCartProducts)
  }

  // Diminuir quantidade de um item no carrinho
  const decreaseQuantity = (productId) => {
    const updatedCartProducts = cartProducts.map((product) => {
      if (product.id === productId && product.quantity > 1) {
        const newQuantity = product.quantity - 1
        const price = Number.parseFloat(product.price.replace("R$ ", "").replace(",", "."))
        setCartTotal((prevTotal) => prevTotal - price)
        setCartItems((prevItems) => prevItems - 1)
        return { ...product, quantity: newQuantity }
      }
      return product
    })

    setCartProducts(updatedCartProducts)
  }

  // Remover um item do carrinho
  const removeFromCart = (productId) => {
    const productToRemove = cartProducts.find((product) => product.id === productId)

    if (productToRemove) {
      const price = Number.parseFloat(productToRemove.price.replace("R$ ", "").replace(",", "."))
      const totalPriceToRemove = price * productToRemove.quantity

      setCartTotal((prevTotal) => prevTotal - totalPriceToRemove)
      setCartItems((prevItems) => prevItems - productToRemove.quantity)
      setCartProducts(cartProducts.filter((product) => product.id !== productId))
    }
  }

  // Formatar o endereço para exibição
  const formatAddressForDisplay = (address) => {
    if (!address) return ""
    return `${address.street}, ${address.number}`
  }

  // Manipular mudanças no formulário de endereço
  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setNewAddress({
      ...newAddress,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  // Definir o rótulo do endereço (Casa ou Trabalho)
  const setAddressLabel = (label) => {
    setNewAddress({
      ...newAddress,
      label,
    })
  }

  // Formatar preço para exibição
  const formatPrice = (price) => {
    return `R$ ${price.toFixed(2).replace(".", ",")}`
  }

  // Abrir a sacola
  const toggleCart = () => {
    setShowCart(!showCart)
  }

  // Calcular o subtotal
  const calculateSubtotal = () => {
    return cartTotal
  }

  // Calcular o total
  const calculateTotal = () => {
    return calculateSubtotal() + deliveryFee
  }

  return (
    <div className="home-container">
      <header className="header">
        <div className="header-container">
          {/* Logo */}
          <div className="logo">
            <button type="button" onClick={() => handleTabClick("inicio")} className="logo-button">
              <svg viewBox="0 0 80 24" className="ifood-logo">
                <path
                  d="M6.4 0h10.4v6.4H6.4V0zm0 9.6h10.4V16H6.4V9.6zm13.6-9.6H30v6.4H20V0zM0 0h3.2v22.4H0V0zm20 9.6h10.4V16H20V9.6zm-13.6 9.6h24v3.2h-24v-3.2zm30.4-19.2c-1.76 0-3.2 1.44-3.2 3.2v19.2h6.4V3.2c0-1.76-1.44-3.2-3.2-3.2zm7.2 0v22.4h6.4v-8h6.4v8h6.4V0h-6.4v8h-6.4V0h-6.4zm27.2 0c-1.76 0-3.2 1.44-3.2 3.2v19.2h6.4V3.2c0-1.76-1.44-3.2-3.2-3.2z"
                  fill="#ea1d2c"
                ></path>
              </svg>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="menu-toggle" onClick={toggleMobileMenu}>
            <div className={isMobileMenuOpen ? "hamburger active" : "hamburger"}>
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className={isMobileMenuOpen ? "nav-menu active" : "nav-menu"}>
            <ul className="nav-list">
              <li className={activeTab === "inicio" ? "nav-item active" : "nav-item"}>
                <button type="button" onClick={() => handleTabClick("inicio")} className="nav-link">
                  Início
                </button>
              </li>
              <li className={activeTab === "restaurantes" ? "nav-item active" : "nav-item"}>
                <button type="button" onClick={() => handleTabClick("restaurantes")} className="nav-link">
                  Restaurantes
                </button>
              </li>
              <li className={activeTab === "mercados" ? "nav-item active" : "nav-item"}>
                <button type="button" onClick={() => handleTabClick("mercados")} className="nav-link">
                  Mercados
                </button>
              </li>
              <li className={activeTab === "bebidas" ? "nav-item active" : "nav-item"}>
                <button type="button" onClick={() => handleTabClick("bebidas")} className="nav-link">
                  Bebidas
                </button>
              </li>
              <li className={activeTab === "farmacias" ? "nav-item active" : "nav-item"}>
                <button type="button" onClick={() => handleTabClick("farmacias")} className="nav-link">
                  Farmácias
                </button>
              </li>
              <li className={activeTab === "pets" ? "nav-item active" : "nav-item"}>
                <button type="button" onClick={() => handleTabClick("pets")} className="nav-link">
                  Pets
                </button>
              </li>
              <li className={activeTab === "shopping" ? "nav-item active" : "nav-item"}>
                <button type="button" onClick={() => handleTabClick("shopping")} className="nav-link">
                  Shopping
                </button>
              </li>
            </ul>
          </nav>

          {/* Search Bar */}
          <div className="search-container" ref={searchRef}>
            <form onSubmit={handleSearch}>
              <div className="search-input">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Busque por item ou loja"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => searchQuery.trim().length > 2 && setShowSearchResults(true)}
                />
                {searchQuery && (
                  <button type="button" className="clear-search" onClick={clearSearch}>
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>

            {/* Resultados da pesquisa */}
            {showSearchResults && (
              <div className="search-results">
                {searchResults.restaurants.length > 0 && (
                  <div className="search-results-section">
                    <h3>Restaurantes</h3>
                    <ul>
                      {searchResults.restaurants.map((restaurant) => (
                        <li key={`restaurant-${restaurant.id}`} className="restaurant-item">
                          <div className="restaurant-image">
                            <img
                              src={restaurant.image || "/placeholder.svg?height=60&width=60"}
                              alt={restaurant.name}
                            />
                          </div>
                          <div className="restaurant-info">
                            <h4>{restaurant.name}</h4>
                            <div className="restaurant-details">
                              <span className="restaurant-category">{restaurant.category}</span>
                              <span className="restaurant-rating">★ {restaurant.rating}</span>
                              <span className="restaurant-delivery-time">{restaurant.deliveryTime}</span>
                            </div>
                            <div className="restaurant-delivery-fee">{restaurant.deliveryFee}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {searchResults.products.length > 0 && (
                  <div className="search-results-section">
                    <h3>Produtos</h3>
                    <ul>
                      {searchResults.products.map((product) => (
                        <li key={`product-${product.id}`} className="product-item">
                          <div className="product-image">
                            <img src={product.image || "/placeholder.svg?height=60&width=60"} alt={product.name} />
                          </div>
                          <div className="product-info">
                            <h4>{product.name}</h4>
                            <div className="product-restaurant">{product.restaurant}</div>
                            <div className="product-price">{product.price}</div>
                          </div>
                          <button className="add-to-cart-button" onClick={() => addToCart(product)}>
                            +
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {searchResults.restaurants.length === 0 && searchResults.products.length === 0 && (
                  <div className="no-results">
                    <p>Nenhum resultado encontrado para "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Actions */}
          <div className="user-actions">
            <div className="address-selector" onClick={() => setShowAddressModal(true)}>
              <span>{selectedAddress ? formatAddressForDisplay(selectedAddress) : "Adicionar endereço"}</span>
              <ChevronDown size={16} />
            </div>
            <div className="notification-icon">
              <Bell size={24} />
              {notifications > 0 && <span className="notification-badge">{notifications}</span>}
            </div>
            <div className="cart-icon" onClick={toggleCart}>
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
      <div className="green-line"></div>

      {/* Page Content */}
      <div className="content-area">
        <h1>Bem-vindo ao iFood</h1>
        <p>Encontre os melhores restaurantes, mercados e muito mais.</p>

        {activeTab === "restaurantes" && (
          <div>
            {restaurants.length > 0 ? (
              <div className="restaurants-grid">
                {restaurants.map((restaurant) => (
                  <div key={restaurant.id} className="restaurant-card">
                    <img
                      src={restaurant.image || "/placeholder.svg?height=150&width=250"}
                      alt={restaurant.name}
                      className="restaurant-card-image"
                    />
                    <h3>{restaurant.name}</h3>
                    <div className="restaurant-card-details">
                      <span>★ {restaurant.rating}</span>
                      <span>{restaurant.category}</span>
                      <span>{restaurant.deliveryTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <ShoppingBag size={48} />
                </div>
                <h2>Nenhum restaurante disponível</h2>
                <p>Os restaurantes aparecerão aqui quando forem cadastrados.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Endereço */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="address-modal" onClick={(e) => e.stopPropagation()}>
            {/* Cabeçalho do Modal */}
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
              >
                <X size={24} />
              </button>
            </div>

            {/* Conteúdo do Modal - Passo 1: Lista de Endereços */}
            {addressModalStep === 1 && (
              <div className="modal-content">
                {savedAddresses.length > 0 ? (
                  <div className="saved-addresses">
                    {savedAddresses.map((address) => (
                      <div
                        key={address.id}
                        className={`saved-address-item ${selectedAddress && selectedAddress.id === address.id ? "selected" : ""}`}
                        onClick={() => selectSavedAddress(address)}
                      >
                        <div className="address-icon">
                          {address.label === "Casa" ? <Home size={20} /> : <Briefcase size={20} />}
                        </div>
                        <div className="address-details">
                          <div className="address-label">{address.label}</div>
                          <div className="address-line">
                            {formatAddressForDisplay(address)}
                            {address.complement && `, ${address.complement}`}
                          </div>
                          <div className="address-line secondary">
                            {address.neighborhood}, {address.city} - {address.state}
                          </div>
                        </div>
                        <div className="address-actions">
                          {address.isDefault ? (
                            <div className="default-badge">Padrão</div>
                          ) : (
                            <button
                              className="set-default-button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setAddressAsDefault(address.id)
                              }}
                            >
                              Definir como padrão
                            </button>
                          )}
                          <button
                            className="delete-address-button"
                            onClick={(e) => deleteAddress(address.id, e)}
                            title="Excluir endereço"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-addresses">
                    <div className="empty-addresses-icon">
                      <MapPin size={48} />
                    </div>
                    <h3>Nenhum endereço cadastrado</h3>
                    <p>Adicione um novo endereço para continuar.</p>
                  </div>
                )}

                <button className="add-address-button" onClick={() => setAddressModalStep(2)}>
                  <Plus size={20} />
                  {savedAddresses.length > 0 ? "Adicionar novo endereço" : "Adicionar endereço"}
                </button>
              </div>
            )}

            {/* Conteúdo do Modal - Passo 2: Busca de Endereço */}
            {addressModalStep === 2 && (
              <div className="modal-content">
                <div className="address-search-container">
                  <div className="address-search-input">
                    <MapPin size={20} className="address-search-icon" />
                    <input
                      type="text"
                      placeholder="Digite seu endereço"
                      value={addressSearchQuery}
                      onChange={(e) => setAddressSearchQuery(e.target.value)}
                      ref={autocompleteInputRef}
                    />
                  </div>

                  <div className="address-map-container" ref={mapRef}>
                    {/* O mapa do Google será renderizado aqui */}
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

            {/* Conteúdo do Modal - Passo 3: Formulário de Endereço */}
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
                      !newAddress.label ||
                      !newAddress.street ||
                      !newAddress.number ||
                      !newAddress.neighborhood ||
                      !newAddress.city ||
                      !newAddress.state
                    }
                  >
                    Salvar endereço
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sacola (Carrinho) */}
      {showCart && (
        <div className="cart-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-sidebar" ref={cartRef} onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>Sacola</h2>
              <button className="close-cart" onClick={() => setShowCart(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="cart-content">
              {cartProducts.length > 0 ? (
                <>
                  <div className="cart-restaurant">
                    {cartProducts[0]?.restaurant && (
                      <div className="restaurant-info">
                        <h3>{cartProducts[0].restaurant}</h3>
                        <p>Entrega em 30-45 min</p>
                      </div>
                    )}
                  </div>

                  <div className="cart-items-list">
                    {cartProducts.map((product) => (
                      <div key={product.id} className="cart-item">
                        <div className="cart-item-image">
                          <img src={product.image || "/placeholder.svg?height=60&width=60"} alt={product.name} />
                        </div>
                        <div className="cart-item-details">
                          <h4>{product.name}</h4>
                          <div className="cart-item-price">{product.price}</div>

                          <div className="cart-item-actions">
                            <button type="button" className="remove-item" onClick={() => removeFromCart(product.id)}>
                              <Trash2 size={16} />
                            </button>

                            <div className="quantity-controls">
                              <button
                                type="button"
                                className="quantity-btn decrease"
                                onClick={() => decreaseQuantity(product.id)}
                                disabled={product.quantity <= 1}
                              >
                                <Minus size={16} />
                              </button>
                              <span className="quantity">{product.quantity}</span>
                              <button
                                type="button"
                                className="quantity-btn increase"
                                onClick={() => increaseQuantity(product.id)}
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cart-summary">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>{formatPrice(calculateSubtotal())}</span>
                    </div>
                    <div className="summary-row">
                      <span>Taxa de entrega</span>
                      <span>{formatPrice(deliveryFee)}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total</span>
                      <span>{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>

                  <div className="cart-footer">
                    <button
                      type="button"
                      className="checkout-button"
                      onClick={() =>
                        onProceedToPayment(cartProducts, calculateTotal() - deliveryFee, deliveryFee, selectedAddress)
                      }
                    >
                      <span>Escolher forma de pagamento</span>
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-cart">
                  <div className="empty-cart-icon">
                    <ShoppingBag size={48} />
                  </div>
                  <h3>Sua sacola está vazia</h3>
                  <p>Adicione itens para continuar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage