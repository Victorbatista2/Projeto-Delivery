"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useApp } from "../../contexts/AppContext"
import LazyImage from "../../shared/LazyImage"
import LoadingSpinner from "../../shared/LoadingSpinner"
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
  ChevronLeft,
  ChevronRight,
  Ticket,
  Coffee,
  Pizza,
  Utensils,
  ShoppingCart,
  Cake,
  Fish,
  Beef,
  Apple,
  Beer,
  Sandwich,
  LogOut,
  Star,
  Clock,
} from "lucide-react"

// Memoized category icon component
const CategoryIcon = React.memo(({ category }) => {
  const getIcon = useCallback((cat) => {
    switch (cat?.toLowerCase()) {
      case "lanches":
        return <Sandwich size={24} />
      case "pizza":
        return <Pizza size={24} />
      case "japonesa":
        return <Fish size={24} />
      case "brasileira":
        return <Utensils size={24} />
      case "doces & bolos":
        return <Cake size={24} />
      case "árabe":
        return <Utensils size={24} />
      case "chinesa":
        return <Utensils size={24} />
      case "italiana":
        return <Utensils size={24} />
      case "vegetariana":
        return <Apple size={24} />
      case "carnes":
        return <Beef size={24} />
      case "açaí":
        return <Apple size={24} />
      case "sorvetes":
        return <Coffee size={24} />
      case "salgados":
        return <Sandwich size={24} />
      case "gourmet":
        return <Utensils size={24} />
      case "marmita":
        return <Utensils size={24} />
      case "pastel":
        return <Sandwich size={24} />
      case "padarias":
        return <Cake size={24} />
      case "bebidas":
        return <Beer size={24} />
      case "café":
        return <Coffee size={24} />
      case "mercado":
        return <ShoppingCart size={24} />
      default:
        return <Utensils size={24} />
    }
  }, [])

  return getIcon(category)
})

// Memoized restaurant card component
const RestaurantCard = React.memo(({ restaurant }) => {
  const formatPrice = useCallback((price) => {
    return `R$ ${price.toFixed(2).replace(".", ",")}`
  }, [])

  return (
    <div className="restaurant-card">
      <div className="restaurant-card-image-container">
        <LazyImage src={restaurant.image} alt={restaurant.name} className="restaurant-card-image" />
        {restaurant.featured && <div className="featured-badge">Destaque</div>}
      </div>
      <div className="restaurant-card-content">
        <h3 className="restaurant-card-name">{restaurant.name}</h3>
        <div className="restaurant-card-info">
          <div className="restaurant-card-rating">
            <Star size={14} className="star-icon" />
            <span>{restaurant.rating}</span>
          </div>
          <span className="restaurant-card-category">{restaurant.category}</span>
          <span className="restaurant-card-distance">{restaurant.distance}</span>
        </div>
        <div className="restaurant-card-delivery">
          <span className="restaurant-card-time">
            <Clock size={12} />
            {restaurant.deliveryTime}
          </span>
          <span className="restaurant-card-fee">
            {restaurant.deliveryFee === "Grátis" ? (
              <span className="free-delivery-text">Grátis</span>
            ) : (
              restaurant.deliveryFee
            )}
          </span>
        </div>
        {restaurant.coupon && (
          <div className="restaurant-card-coupon">
            <Ticket size={14} />
            <span>{restaurant.coupon}</span>
          </div>
        )}
      </div>
    </div>
  )
})

const HomePage = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const { state, actions } = useApp()

  // Local state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("restaurantes")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState({ restaurants: [], products: [] })
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [addressModalStep, setAddressModalStep] = useState(1)
  const [addressSearchQuery, setAddressSearchQuery] = useState("")
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
  const [showCart, setShowCart] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [map, setMap] = useState(null)
  const [marker, setMarker] = useState(null)
  const [autocomplete, setAutocomplete] = useState(null)
  // Após os outros estados
  const [addressSearchInput, setAddressSearchInput] = useState("")

  // Refs
  const searchRef = useRef(null)
  const categoriesContainerRef = useRef(null)
  const productsContainerRef = useRef(null)
  const cartRef = useRef(null)
  const mapRef = useRef(null)
  const autocompleteInputRef = useRef(null)

  // Memoized categories list
  const categories = useMemo(
    () => [
      "Lanches",
      "Pizza",
      "Doces & Bolos",
      "Japonesa",
      "Brasileira",
      "Açaí",
      "Árabe",
      "Chinesa",
      "Sorvetes",
      "Italiana",
      "Vegetariana",
      "Carnes",
      "Salgados",
      "Gourmet",
      "Marmita",
      "Pastel",
      "Padarias",
    ],
    [],
  )

  // Load restaurants on component mount - apenas uma vez
  useEffect(() => {
    if (state.restaurants.length === 0 && !state.loading.restaurants) {
      actions.loadRestaurants()
    }
  }, []) // Dependências vazias para executar apenas uma vez

  // Estado para controlar o Google Maps
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [mapInstance, setMapInstance] = useState(null)
  const [mapMarker, setMapMarker] = useState(null)
  const [autocompleteInstance, setAutocompleteInstance] = useState(null)

  // Função para carregar o Google Maps dinamicamente
  const loadGoogleMapsScript = useCallback(() => {
    return new Promise((resolve, reject) => {
      // Se o Google Maps já está carregado, resolve imediatamente
      if (window.google && window.google.maps) {
        resolve(window.google)
        return
      }

      // Se já existe um script carregando, aguarda
      if (window.googleMapsLoading) {
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkLoaded)
            resolve(window.google)
          }
        }, 100)
        return
      }

      window.googleMapsLoading = true

      // Função de callback global
      window.initGoogleMaps = () => {
        console.log("Google Maps carregado com sucesso!")
        window.googleMapsLoading = false
        resolve(window.google)
      }

      // Função de erro global
      window.googleMapsError = () => {
        console.error("Erro ao carregar Google Maps")
        window.googleMapsLoading = false
        reject(new Error("Erro ao carregar Google Maps"))
      }

      // Cria e adiciona o script
      const script = document.createElement("script")
      // Usando sua chave de API do Google Maps
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDdRLljL01LunT_X0eyE59DYtxdtav6oP0&libraries=places&callback=initGoogleMaps`
      script.async = true
      script.defer = true
      script.onerror = window.googleMapsError

      document.head.appendChild(script)
    })
  }, [])

  // Initialize Google Maps
  const initializeMap = useCallback(async () => {
    if (!mapRef.current) {
      console.log("mapRef não está disponível")
      return
    }

    try {
      console.log("Iniciando carregamento do Google Maps...")

      // Carregar Google Maps
      const google = await loadGoogleMapsScript()
      console.log("Google Maps carregado, criando mapa...")

      // Limpar conteúdo anterior do container
      if (mapRef.current) {
        mapRef.current.innerHTML = ""
      }

      // Criar o mapa centrado em São Paulo
      const mapOptions = {
        center: { lat: -23.5505, lng: -46.6333 }, // São Paulo
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      }

      const newMap = new google.maps.Map(mapRef.current, mapOptions)
      setMapInstance(newMap)

      // Criar o autocomplete para o input
      if (autocompleteInputRef.current) {
        // Limpar qualquer autocomplete anterior
        if (autocompleteInstance) {
          google.maps.event.clearInstanceListeners(autocompleteInstance)
        }

        const newAutocomplete = new google.maps.places.Autocomplete(autocompleteInputRef.current, {
          types: ["address"],
          componentRestrictions: { country: "br" },
          fields: ["address_components", "geometry", "formatted_address", "name"],
        })

        // Listener para quando um lugar é selecionado
        newAutocomplete.addListener("place_changed", () => {
          const place = newAutocomplete.getPlace()
          console.log("Lugar selecionado:", place)

          if (!place.geometry || !place.geometry.location) {
            console.log("Nenhuma localização encontrada para o lugar selecionado")
            return
          }

          // Atualizar o mapa
          newMap.setCenter(place.geometry.location)
          newMap.setZoom(17)

          // Remover marcador anterior
          if (mapMarker) {
            mapMarker.setMap(null)
          }

          // Criar novo marcador
          const newMarker = new google.maps.Marker({
            position: place.geometry.location,
            map: newMap,
            title: place.formatted_address,
            animation: google.maps.Animation.DROP,
          })

          setMapMarker(newMarker)

          // Extrair componentes do endereço de forma mais robusta
          let street = ""
          let number = ""
          let neighborhood = ""
          let city = ""
          let state = ""
          let zipCode = ""

          if (place.address_components) {
            place.address_components.forEach((component) => {
              const types = component.types

              if (types.includes("street_number")) {
                number = component.long_name
              }
              if (types.includes("route")) {
                street = component.long_name
              }
              if (
                types.includes("sublocality_level_1") ||
                types.includes("sublocality") ||
                types.includes("neighborhood")
              ) {
                neighborhood = component.long_name
              }
              if (types.includes("locality") || types.includes("administrative_area_level_2")) {
                city = component.long_name
              }
              if (types.includes("administrative_area_level_1")) {
                state = component.short_name
              }
              if (types.includes("postal_code")) {
                zipCode = component.long_name
              }
            })
          }

          // Se não encontrou o número na estrutura, tentar extrair do nome ou endereço formatado
          if (!number && place.name) {
            const numberMatch = place.name.match(/\d+/)
            if (numberMatch) {
              number = numberMatch[0]
            }
          }

          // Se ainda não tem número, tentar extrair do endereço formatado
          if (!number && place.formatted_address) {
            const numberMatch = place.formatted_address.match(/(\d+)/)
            if (numberMatch) {
              number = numberMatch[1]
            }
          }

          // Formatar CEP se necessário
          if (zipCode && zipCode.length === 8) {
            zipCode = `${zipCode.slice(0, 5)}-${zipCode.slice(5)}`
          }

          // Atualizar o formulário com todos os dados
          setNewAddress((prev) => ({
            ...prev,
            street: street || prev.street,
            number: number || prev.number,
            neighborhood: neighborhood || prev.neighborhood,
            city: city || prev.city,
            state: state || prev.state,
            zipCode: zipCode || prev.zipCode,
          }))

          console.log("Endereço extraído:", {
            street,
            number,
            neighborhood,
            city,
            state,
            zipCode,
            formatted_address: place.formatted_address,
          })

          // Se conseguiu extrair pelo menos rua e cidade, mostrar botão para continuar
          if (street && city) {
            console.log("Endereço completo encontrado, usuário pode continuar")
          }
        })

        setAutocompleteInstance(newAutocomplete)
      }

      setGoogleMapsLoaded(true)
      setMapError(false)
      console.log("Google Maps inicializado com sucesso!")
    } catch (error) {
      console.error("Erro ao inicializar o mapa:", error)
      setMapError(true)
      setGoogleMapsLoaded(false)
    }
  }, [mapMarker, autocompleteInstance, addressSearchInput])

  // Cleanup do Google Maps quando o modal fecha
  const cleanupGoogleMaps = useCallback(() => {
    if (autocompleteInstance) {
      window.google?.maps?.event?.clearInstanceListeners(autocompleteInstance)
      setAutocompleteInstance(null)
    }

    if (mapMarker) {
      mapMarker.setMap(null)
      setMapMarker(null)
    }

    if (mapInstance) {
      // Não destruir a instância do mapa, apenas limpar
      setMapInstance(null)
    }

    setGoogleMapsLoaded(false)

    // Limpar o input do autocomplete
    if (autocompleteInputRef.current) {
      autocompleteInputRef.current.value = ""
    }
    setAddressSearchInput("")
  }, [autocompleteInstance, mapMarker, mapInstance])

  // Load Google Maps when modal opens
  useEffect(() => {
    if (showAddressModal && addressModalStep === 2 && !googleMapsLoaded && !mapError) {
      // Pequeno delay para garantir que o DOM está pronto
      const timer = setTimeout(() => {
        initializeMap()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [showAddressModal, addressModalStep, googleMapsLoaded, mapError, initializeMap])

  // Cleanup quando o modal fecha
  useEffect(() => {
    if (!showAddressModal) {
      cleanupGoogleMaps()
    }
  }, [showAddressModal, cleanupGoogleMaps])

  // Função para buscar endereço por CEP e atualizar o mapa
  const searchCEPAndUpdateMap = useCallback(
    async (cep) => {
      try {
        const cleanCEP = cep.replace(/\D/g, "")
        if (cleanCEP.length !== 8) return

        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
        const data = await response.json()

        if (!data.erro) {
          const fullAddress = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}, Brasil`

          setNewAddress((prev) => ({
            ...prev,
            street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
            zipCode: `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5)}`,
          }))

          // Se o mapa estiver carregado, geocodificar e atualizar
          if (googleMapsLoaded && mapInstance && window.google) {
            const geocoder = new window.google.maps.Geocoder()

            geocoder.geocode({ address: fullAddress }, (results, status) => {
              if (status === "OK" && results[0]) {
                const location = results[0].geometry.location

                // Atualizar o mapa
                mapInstance.setCenter(location)
                mapInstance.setZoom(17)

                // Remover marcador anterior
                if (mapMarker) {
                  mapMarker.setMap(null)
                }

                // Criar novo marcador
                const newMarker = new window.google.maps.Marker({
                  position: location,
                  map: mapInstance,
                  title: fullAddress,
                  animation: window.google.maps.Animation.DROP,
                })

                setMapMarker(newMarker)
              }
            })
          }
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error)
      }
    },
    [googleMapsLoaded, mapInstance, mapMarker],
  )

  // Handle category click
  const handleCategoryClick = useCallback(
    (category) => {
      navigate(`/categoria/${category.toLowerCase().replace(/\s+/g, "-")}`)
    },
    [navigate],
  )

  // Handle carousel scroll
  const handleCarouselScroll = useCallback((containerRef, direction) => {
    if (!containerRef.current) return

    const scrollAmount = direction === "left" ? -300 : 300
    containerRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    })
  }, [])

  // Search functionality
  const performSearch = useCallback(
    (query) => {
      const normalizedQuery = query.toLowerCase().trim()

      const filteredRestaurants = state.restaurants.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(normalizedQuery) ||
          restaurant.category.toLowerCase().includes(normalizedQuery),
      )

      setSearchResults({
        restaurants: filteredRestaurants,
        products: [], // Products will be implemented later
      })
    },
    [state.restaurants],
  )

  const handleSearchInputChange = useCallback(
    (e) => {
      const query = e.target.value
      setSearchQuery(query)

      if (query.trim().length > 2) {
        performSearch(query)
        setShowSearchResults(true)
      } else {
        setSearchResults({ restaurants: [], products: [] })
        setShowSearchResults(false)
      }
    },
    [performSearch],
  )

  const clearSearch = useCallback(() => {
    setSearchQuery("")
    setSearchResults({ restaurants: [], products: [] })
    setShowSearchResults(false)
  }, [])

  // Address functionality
  const handleAddressFormChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    setNewAddress((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }, [])

  const setAddressLabel = useCallback((label) => {
    setNewAddress((prev) => ({
      ...prev,
      label,
    }))
  }, [])

  // CEP search function
  const searchCEP = useCallback(async (cep) => {
    try {
      const cleanCEP = cep.replace(/\D/g, "")
      if (cleanCEP.length !== 8) return

      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
      const data = await response.json()

      if (!data.erro) {
        setNewAddress((prev) => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
          zipCode: `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5)}`,
        }))
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
    }
  }, [])

  const handleCEPChange = useCallback(
    (e) => {
      const value = e.target.value.replace(/\D/g, "")
      const formattedCEP = value.length > 5 ? `${value.slice(0, 5)}-${value.slice(5, 8)}` : value

      setNewAddress((prev) => ({
        ...prev,
        zipCode: formattedCEP,
      }))

      if (value.length === 8) {
        searchCEPAndUpdateMap(value)
      }
    },
    [searchCEPAndUpdateMap],
  )

  const saveNewAddress = useCallback(async () => {
    try {
      const savedAddress = await actions.addAddress(newAddress)

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
    } catch (error) {
      console.error("Erro ao salvar endereço:", error)
    }
  }, [newAddress, actions])

  const selectSavedAddress = useCallback(
    (address) => {
      actions.selectAddress(address)
      setShowAddressModal(false)
    },
    [actions],
  )

  const deleteAddress = useCallback(
    async (addressId, e) => {
      e.stopPropagation()

      if (window.confirm("Tem certeza que deseja excluir este endereço?")) {
        try {
          await actions.deleteAddress(addressId)
        } catch (error) {
          console.error("Erro ao excluir endereço:", error)
        }
      }
    },
    [actions],
  )

  // Format functions
  const formatAddressForDisplay = useCallback((address) => {
    if (!address) return "Adicionar endereço"
    return `${address.street}, ${address.number}`
  }, [])

  const formatPrice = useCallback((price) => {
    return `R$ ${price.toFixed(2).replace(".", ",")}`
  }, [])

  // Cart functionality
  const toggleCart = useCallback(() => {
    setShowCart((prev) => !prev)
  }, [])

  const calculateSubtotal = useCallback(() => {
    return state.cart.total
  }, [state.cart.total])

  const calculateTotal = useCallback(() => {
    const deliveryFee = 7.9
    return calculateSubtotal() + deliveryFee
  }, [calculateSubtotal])

  // Handle logout
  const handleLogout = useCallback(() => {
    if (window.confirm("Tem certeza que deseja sair?")) {
      actions.logout()
      if (onLogout) onLogout()
    }
  }, [actions, onLogout])

  // Close modals when clicking outside
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

      if (showUserMenu && !event.target.closest(".user-menu-container")) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showCart, showUserMenu])

  // Adicione esta função junto com os outros callbacks
  const searchAddressOnMap = useCallback(() => {
    if (!addressSearchInput.trim() || !googleMapsLoaded || !mapInstance) return

    const geocoder = new window.google.maps.Geocoder()

    geocoder.geocode({ address: addressSearchInput + ", Brasil" }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location

        // Atualizar o mapa
        mapInstance.setCenter(location)
        mapInstance.setZoom(17)

        // Remover marcador anterior
        if (mapMarker) {
          mapMarker.setMap(null)
        }

        // Criar novo marcador
        const newMarker = new window.google.maps.Marker({
          position: location,
          map: mapInstance,
          title: results[0].formatted_address,
          animation: window.google.maps.Animation.DROP,
        })

        setMapMarker(newMarker)

        // Extrair componentes do endereço
        let street = ""
        let number = ""
        let neighborhood = ""
        let city = ""
        let state = ""
        let zipCode = ""

        if (results[0].address_components) {
          results[0].address_components.forEach((component) => {
            const types = component.types

            if (types.includes("street_number")) {
              number = component.long_name
            }
            if (types.includes("route")) {
              street = component.long_name
            }
            if (
              types.includes("sublocality_level_1") ||
              types.includes("sublocality") ||
              types.includes("neighborhood")
            ) {
              neighborhood = component.long_name
            }
            if (types.includes("locality") || types.includes("administrative_area_level_2")) {
              city = component.long_name
            }
            if (types.includes("administrative_area_level_1")) {
              state = component.short_name
            }
            if (types.includes("postal_code")) {
              zipCode = component.long_name
            }
          })
        }

        // Se não encontrou o número na estrutura, tentar extrair do endereço formatado
        if (!number && results[0].formatted_address) {
          const numberMatch = results[0].formatted_address.match(/(\d+)/)
          if (numberMatch) {
            number = numberMatch[1]
          }
        }

        // Formatar CEP se necessário
        if (zipCode && zipCode.length === 8) {
          zipCode = `${zipCode.slice(0, 5)}-${zipCode.slice(5)}`
        }

        // Atualizar o formulário
        setNewAddress((prev) => ({
          ...prev,
          street: street || prev.street,
          number: number || prev.number,
          neighborhood: neighborhood || prev.neighborhood,
          city: city || prev.city,
          state: state || prev.state,
          zipCode: zipCode || prev.zipCode,
        }))

        console.log("Endereço encontrado:", results[0].formatted_address)
      } else {
        console.error("Geocode não foi bem-sucedido pelo seguinte motivo: " + status)
        alert("Não foi possível encontrar o endereço. Por favor, verifique e tente novamente.")
      }
    })
  }, [addressSearchInput, googleMapsLoaded, mapInstance, mapMarker])

  return (
    <div className="home-container">
      <header className="header">
        <div className="header-container">
          {/* Logo */}
          <div className="logo">
            <button
              type="button"
              onClick={() => setActiveTab("restaurantes")}
              className="logo-button"
              aria-label="Ir para página inicial"
            >
              <svg viewBox="0 0 80 24" className="ifood-logo" aria-hidden="true">
                <path
                  d="M6.4 0h10.4v6.4H6.4V0zm0 9.6h10.4V16H6.4V9.6zm13.6-9.6H30v6.4H20V0zM0 0h3.2v22.4H0V0zm20 9.6h10.4V16H20V9.6zm-13.6 9.6h24v3.2h-24v-3.2zm30.4-19.2c-1.76 0-3.2 1.44-3.2 3.2v19.2h6.4V3.2c0-1.76-1.44-3.2-3.2-3.2zm7.2 0v22.4h6.4v-8h6.4v8h6.4V0h-6.4v8h-6.4V0h-6.4zm27.2 0c-1.76 0-3.2 1.44-3.2 3.2v19.2h6.4V3.2c0-1.76-1.44-3.2-3.2-3.2z"
                  fill="#ea1d2c"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
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
                <button type="button" onClick={() => setActiveTab("inicio")} className="nav-link">
                  Início
                </button>
              </li>
              <li className={activeTab === "restaurantes" ? "nav-item active" : "nav-item"}>
                <button type="button" onClick={() => setActiveTab("restaurantes")} className="nav-link">
                  Restaurantes
                </button>
              </li>
              <li className={activeTab === "mercados" ? "nav-item active" : "nav-item"}>
                <button type="button" onClick={() => setActiveTab("mercados")} className="nav-link">
                  Mercados
                </button>
              </li>
              <li className={activeTab === "bebidas" ? "nav-item active" : "nav-item"}>
                <button type="button" onClick={() => setActiveTab("bebidas")} className="nav-link">
                  Bebidas
                </button>
              </li>
              <li className={activeTab === "farmacias" ? "nav-item active" : "nav-item"}>
                <button type="button" onClick={() => setActiveTab("farmacias")} className="nav-link">
                  Farmácias
                </button>
              </li>
              <li className={activeTab === "pets" ? "nav-item active" : "nav-item"}>
                <button type="button" onClick={() => setActiveTab("pets")} className="nav-link">
                  Pets
                </button>
              </li>
              <li className={activeTab === "shopping" ? "nav-item active" : "nav-item"}>
                <button type="button" onClick={() => setActiveTab("shopping")} className="nav-link">
                  Shopping
                </button>
              </li>
            </ul>
          </nav>

          {/* Search Bar */}
          <div className="search-container" ref={searchRef}>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="search-input">
                <Search className="search-icon" size={20} aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Busque por item ou loja"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => searchQuery.trim().length > 2 && setShowSearchResults(true)}
                  aria-label="Buscar restaurantes e produtos"
                />
                {searchQuery && (
                  <button type="button" className="clear-search" onClick={clearSearch} aria-label="Limpar busca">
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>

            {/* Search Results */}
            {showSearchResults && (
              <div className="search-results">
                {searchResults.restaurants.length > 0 && (
                  <div className="search-results-section">
                    <h3>Restaurantes</h3>
                    <ul>
                      {searchResults.restaurants.map((restaurant) => (
                        <li key={`restaurant-${restaurant.id}`} className="restaurant-item">
                          <div className="restaurant-image">
                            <LazyImage src={restaurant.image} alt={restaurant.name} />
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

                {searchResults.restaurants.length === 0 && (
                  <div className="no-results">
                    <p>Nenhum resultado encontrado para "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Actions */}
          <div className="user-actions">
            <div
              className="address-selector"
              onClick={() => setShowAddressModal(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setShowAddressModal(true)
                }
              }}
            >
              <span>
                {state.selectedAddress ? formatAddressForDisplay(state.selectedAddress) : "Adicionar endereço"}
              </span>
              <ChevronDown size={16} />
            </div>

            <div className="notification-icon">
              <Bell size={24} />
              {state.notifications.length > 0 && (
                <span className="notification-badge">{state.notifications.length}</span>
              )}
            </div>

            <div className="cart-icon" onClick={toggleCart}>
              <ShoppingBag size={24} />
              <div className="cart-info">
                <div className="cart-total">{state.cart.total > 0 ? formatPrice(state.cart.total) : "R$ 0,00"}</div>
                <div className="cart-items">
                  {state.cart.items.length} {state.cart.items.length === 1 ? "item" : "itens"}
                </div>
              </div>
            </div>

            {/* User Menu */}
            <div className="user-menu-container">
              <button
                className="user-menu-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px",
                  borderRadius: "4px",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#f7f7f7")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: "#ea1d2c",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  {user?.nome ? user.nome.charAt(0).toUpperCase() : "U"}
                </div>
                <ChevronDown size={16} />
              </button>

              {showUserMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: "0",
                    marginTop: "8px",
                    backgroundColor: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgb(255, 243, 243)",
                    minWidth: "200px",
                    zIndex: 1000,
                  }}
                >
                  <div
                    style={{
                      padding: "16px",
                      borderBottom: "1px solidrgb(214, 6, 6)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#3e3e3e",
                        marginBottom: "4px",
                      }}
                    >
                      {user?.nome}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#717171",
                      }}
                    >
                      {user?.email}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: "none",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                      color: "#ea1d2c",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#fff0f0")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                  >
                    <LogOut size={16} />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="green-line"></div>

      {/* Page Content */}
      <div className="content-area">
        {activeTab === "restaurantes" ? (
          <>
            {/* Categories Section */}
            <div className="categories-section">
              <h2 className="section-title">Categorias</h2>
              <div className="categories-carousel">
                <button
                  className="carousel-arrow carousel-prev"
                  onClick={() => handleCarouselScroll(categoriesContainerRef, "left")}
                  aria-label="Categorias anteriores"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="categories-container" ref={categoriesContainerRef}>
                  <div className="categories-items">
                    {categories.map((category) => (
                      <div
                        key={category}
                        className="category-item"
                        onClick={() => handleCategoryClick(category)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleCategoryClick(category)
                          }
                        }}
                      >
                        <div className="category-icon">
                          <CategoryIcon category={category} />
                        </div>
                        <span className="category-name">{category}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  className="carousel-arrow carousel-next"
                  onClick={() => handleCarouselScroll(categoriesContainerRef, "right")}
                  aria-label="Próximas categorias"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>

            {/* Restaurants Grid */}
            <div className="restaurants-section">
              <h2 className="section-title">Lojas</h2>
              {state.loading.restaurants ? (
                <div className="loading-state">
                  <LoadingSpinner size="large" />
                  <p>Carregando restaurantes...</p>
                </div>
              ) : state.restaurants.length > 0 ? (
                <div className="restaurants-grid">
                  {state.restaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
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
          </>
        ) : activeTab === "inicio" ? (
          <>
            <h1>Bem-vindo ao iFood, {user?.nome}!</h1>
            <p>Encontre os melhores restaurantes, mercados e muito mais.</p>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              {activeTab === "mercados" && <ShoppingCart size={48} />}
              {activeTab === "bebidas" && <Beer size={48} />}
              {activeTab === "farmacias" && (
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <path d="M12 8v8"></path>
                  <path d="M8 12h8"></path>
                </svg>
              )}
              {activeTab === "pets" && (
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"></path>
                  <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"></path>
                  <path d="M8 14v.5"></path>
                  <path d="M16 14v.5"></path>
                  <path d="M11.25 16.25h1.5L12 17l-.75-.75Z"></path>
                  <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306"></path>
                </svg>
              )}
              {activeTab === "shopping" && (
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                  <path d="M3 6h18"></path>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              )}
            </div>
            <h2>Conteúdo de {activeTab} em breve</h2>
            <p>Esta seção está em desenvolvimento.</p>
          </div>
        )}
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="address-modal" onClick={(e) => e.stopPropagation()}>
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
                aria-label="Fechar modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Step 1: Address List */}
            {addressModalStep === 1 && (
              <div className="modal-content">
                {state.loading.addresses ? (
                  <div style={{ padding: "40px", textAlign: "center" }}>
                    <LoadingSpinner />
                    <p>Carregando endereços...</p>
                  </div>
                ) : state.addresses.length > 0 ? (
                  <div className="saved-addresses">
                    {state.addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`saved-address-item ${
                          state.selectedAddress && state.selectedAddress.id === address.id ? "selected" : ""
                        }`}
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
                                actions.updateAddress(address.id, { ...address, isDefault: true })
                              }}
                            >
                              Definir como padrão
                            </button>
                          )}
                          <button
                            className="delete-address-button"
                            onClick={(e) => deleteAddress(address.id, e)}
                            title="Excluir endereço"
                            aria-label="Excluir endereço"
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

                <button
                  className="add-address-button"
                  onClick={() => setAddressModalStep(2)}
                  disabled={state.loading.addresses}
                >
                  <Plus size={20} />
                  {state.addresses.length > 0 ? "Adicionar novo endereço" : "Adicionar endereço"}
                </button>
              </div>
            )}

            {/* Step 2: Address Search */}
            {addressModalStep === 2 && (
              <div className="modal-content">
                <div className="address-search-container">
                  {/* Google Maps Section */}
                  <div className="search-by-maps">
                    <h3>Buscar no mapa</h3>
                    <div className="maps-input-group" style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        placeholder="Digite o endereço completo"
                        value={addressSearchInput}
                        onChange={(e) => setAddressSearchInput(e.target.value)}
                        style={{
                          flex: 1,
                          padding: "12px",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          fontSize: "14px",
                          marginBottom: "16px",
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            searchAddressOnMap()
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={searchAddressOnMap}
                        style={{
                          padding: "12px 16px",
                          backgroundColor: "#ea1d2c",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "500",
                          marginBottom: "16px",
                        }}
                      >
                        Buscar no mapa
                      </button>
                    </div>

                    {/* Google Map */}
                    <div
                      ref={mapRef}
                      style={{
                        height: "300px",
                        width: "100%",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        position: "relative",
                        marginBottom: "20px",
                      }}
                    >
                      {!mapLoaded && !mapError && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(245, 245, 245, 0.9)",
                            zIndex: 10,
                          }}
                        >
                          <LoadingSpinner />
                          <p style={{ marginTop: "16px", color: "#666" }}>Carregando mapa...</p>
                        </div>
                      )}

                      {mapError && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(245, 245, 245, 0.9)",
                            zIndex: 10,
                            padding: "20px",
                            textAlign: "center",
                          }}
                        >
                          <MapPin size={48} color="#ea1d2c" />
                          <p style={{ marginTop: "16px", color: "#666" }}>
                            Não foi possível carregar o mapa. Por favor, use a busca por CEP ou preencha o endereço
                            manualmente.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CEP Search Section */}
                  <div className="search-by-cep">
                    <h3>Ou buscar por CEP</h3>
                    <div className="cep-input-group">
                      <input
                        type="text"
                        placeholder="Digite o CEP (ex: 01234-567)"
                        value={newAddress.zipCode}
                        onChange={handleCEPChange}
                        maxLength={9}
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                    <p style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
                      Digite o CEP para preencher automaticamente o endereço
                    </p>
                  </div>

                  <div className="address-manual-entry" style={{ marginTop: "20px" }}>
                    <button
                      type="button"
                      className="manual-entry-button"
                      onClick={() => setAddressModalStep(3)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #ea1d2c",
                        backgroundColor: "transparent",
                        color: "#ea1d2c",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      Preencher endereço manualmente
                    </button>
                  </div>
                </div>

                <div className="modal-actions" style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
                  <button
                    type="button"
                    className="modal-back-button"
                    onClick={() => setAddressModalStep(1)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      border: "1px solid #ddd",
                      backgroundColor: "white",
                      color: "#666",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    Voltar
                  </button>
                  {newAddress.street && (
                    <button
                      type="button"
                      onClick={() => setAddressModalStep(3)}
                      style={{
                        flex: 1,
                        padding: "12px",
                        backgroundColor: "#ea1d2c",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Continuar
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Address Form */}
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
                      <label htmlFor="zipCode">CEP</label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={newAddress.zipCode}
                        onChange={handleCEPChange}
                        placeholder="00000-000"
                        maxLength={9}
                      />
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
                      state.loading.addresses ||
                      !newAddress.label ||
                      !newAddress.street ||
                      !newAddress.number ||
                      !newAddress.neighborhood ||
                      !newAddress.city ||
                      !newAddress.state
                    }
                  >
                    {state.loading.addresses ? (
                      <>
                        <LoadingSpinner size="small" color="white" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar endereço"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div className="cart-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-sidebar" ref={cartRef} onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>Sacola</h2>
              <button className="close-cart" onClick={() => setShowCart(false)} aria-label="Fechar sacola">
                <X size={24} />
              </button>
            </div>

            <div className="cart-content">
              {state.cart.items.length > 0 ? (
                <>
                  {state.cart.restaurant && (
                    <div className="cart-restaurant">
                      <div className="restaurant-info">
                        <h3>{state.cart.restaurant}</h3>
                        <p>Entrega em 30-45 min</p>
                      </div>
                    </div>
                  )}

                  <div className="cart-items-list">
                    {state.cart.items.map((product) => (
                      <div key={product.id} className="cart-item">
                        <div className="cart-item-image">
                          <LazyImage src={product.image} alt={product.name} />
                        </div>
                        <div className="cart-item-details">
                          <h4>{product.name}</h4>
                          <div className="cart-item-price">{product.price}</div>

                          <div className="cart-item-actions">
                            <button
                              type="button"
                              className="remove-item"
                              onClick={() => actions.removeFromCart(product.id)}
                              aria-label={`Remover ${product.name} do carrinho`}
                            >
                              <Trash2 size={16} />
                            </button>

                            <div className="quantity-controls">
                              <button
                                type="button"
                                className="quantity-btn decrease"
                                onClick={() => actions.updateCartItem(product.id, product.quantity - 1)}
                                disabled={product.quantity <= 1}
                                aria-label="Diminuir quantidade"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="quantity">{product.quantity}</span>
                              <button
                                type="button"
                                className="quantity-btn increase"
                                onClick={() => actions.updateCartItem(product.id, product.quantity + 1)}
                                aria-label="Aumentar quantidade"
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
                      <span>{formatPrice(7.9)}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total</span>
                      <span>{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>

                  <div className="cart-footer">
                    <button type="button" className="checkout-button" onClick={() => navigate("/pagamento")}>
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
