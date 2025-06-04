"use client"

import { createContext, useContext, useReducer, useEffect, useCallback } from "react"

// Estado inicial
const initialState = {
  user: null,
  isAuthenticated: false,
  addresses: [],
  selectedAddress: null,
  cart: {
    items: [],
    total: 0,
    restaurant: null,
  },
  restaurants: [],
  categories: [],
  notifications: [],
  loading: {
    auth: true,
    restaurants: false,
    addresses: false,
    cart: false,
  },
  errors: {},
}

// Actions
const ACTIONS = {
  SET_USER: "SET_USER",
  SET_AUTHENTICATED: "SET_AUTHENTICATED",
  SET_ADDRESSES: "SET_ADDRESSES",
  ADD_ADDRESS: "ADD_ADDRESS",
  UPDATE_ADDRESS: "UPDATE_ADDRESS",
  DELETE_ADDRESS: "DELETE_ADDRESS",
  SET_SELECTED_ADDRESS: "SET_SELECTED_ADDRESS",
  SET_CART: "SET_CART",
  ADD_TO_CART: "ADD_TO_CART",
  REMOVE_FROM_CART: "REMOVE_FROM_CART",
  UPDATE_CART_ITEM: "UPDATE_CART_ITEM",
  CLEAR_CART: "CLEAR_CART",
  SET_RESTAURANTS: "SET_RESTAURANTS",
  SET_CATEGORIES: "SET_CATEGORIES",
  ADD_NOTIFICATION: "ADD_NOTIFICATION",
  REMOVE_NOTIFICATION: "REMOVE_NOTIFICATION",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  RESET_AUTH_LOADING: "RESET_AUTH_LOADING",
}

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: {
          ...state.loading,
          auth: false,
        },
      }

    case ACTIONS.SET_AUTHENTICATED:
      return {
        ...state,
        isAuthenticated: action.payload,
        loading: {
          ...state.loading,
          auth: false,
        },
      }

    case ACTIONS.RESET_AUTH_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          auth: false,
        },
      }

    case ACTIONS.SET_ADDRESSES:
      return {
        ...state,
        addresses: action.payload,
      }

    case ACTIONS.ADD_ADDRESS:
      return {
        ...state,
        addresses: [...state.addresses, action.payload],
      }

    case ACTIONS.UPDATE_ADDRESS:
      return {
        ...state,
        addresses: state.addresses.map((addr) => (addr.id === action.payload.id ? action.payload : addr)),
      }

    case ACTIONS.DELETE_ADDRESS:
      return {
        ...state,
        addresses: state.addresses.filter((addr) => addr.id !== action.payload),
        selectedAddress: state.selectedAddress?.id === action.payload ? null : state.selectedAddress,
      }

    case ACTIONS.SET_SELECTED_ADDRESS:
      return {
        ...state,
        selectedAddress: action.payload,
      }

    case ACTIONS.SET_CART:
      return {
        ...state,
        cart: action.payload,
      }

    case ACTIONS.ADD_TO_CART:
      const existingItem = state.cart.items.find((item) => item.id === action.payload.id)
      let newItems

      if (existingItem) {
        newItems = state.cart.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      } else {
        newItems = [...state.cart.items, { ...action.payload, quantity: 1 }]
      }

      const newTotal = newItems.reduce((total, item) => {
        const price = Number.parseFloat(item.price.replace("R$ ", "").replace(",", "."))
        return total + price * item.quantity
      }, 0)

      return {
        ...state,
        cart: {
          ...state.cart,
          items: newItems,
          total: newTotal,
          restaurant: action.payload.restaurant || state.cart.restaurant,
        },
      }

    case ACTIONS.REMOVE_FROM_CART:
      const filteredItems = state.cart.items.filter((item) => item.id !== action.payload)
      const updatedTotal = filteredItems.reduce((total, item) => {
        const price = Number.parseFloat(item.price.replace("R$ ", "").replace(",", "."))
        return total + price * item.quantity
      }, 0)

      return {
        ...state,
        cart: {
          ...state.cart,
          items: filteredItems,
          total: updatedTotal,
          restaurant: filteredItems.length === 0 ? null : state.cart.restaurant,
        },
      }

    case ACTIONS.UPDATE_CART_ITEM:
      const updatedItems = state.cart.items
        .map((item) => (item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item))
        .filter((item) => item.quantity > 0)

      const recalculatedTotal = updatedItems.reduce((total, item) => {
        const price = Number.parseFloat(item.price.replace("R$ ", "").replace(",", "."))
        return total + price * item.quantity
      }, 0)

      return {
        ...state,
        cart: {
          ...state.cart,
          items: updatedItems,
          total: recalculatedTotal,
          restaurant: updatedItems.length === 0 ? null : state.cart.restaurant,
        },
      }

    case ACTIONS.CLEAR_CART:
      return {
        ...state,
        cart: {
          items: [],
          total: 0,
          restaurant: null,
        },
      }

    case ACTIONS.SET_RESTAURANTS:
      return {
        ...state,
        restaurants: action.payload,
      }

    case ACTIONS.SET_CATEGORIES:
      return {
        ...state,
        categories: action.payload,
      }

    case ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, { ...action.payload, id: Date.now() }],
      }

    case ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter((notif) => notif.id !== action.payload),
      }

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      }

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.value,
        },
      }

    case ACTIONS.CLEAR_ERROR:
      const newErrors = { ...state.errors }
      delete newErrors[action.payload]
      return {
        ...state,
        errors: newErrors,
      }

    default:
      return state
  }
}

// Context
const AppContext = createContext()

// Provider
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Verificar sessão salva com timeout
  useEffect(() => {
    const checkSavedSession = async () => {
      try {
        const savedUserData = localStorage.getItem("userData")
        if (savedUserData) {
          const userData = JSON.parse(savedUserData)
          dispatch({ type: ACTIONS.SET_USER, payload: userData })

          // Carregar endereços do usuário se houver ID
          if (userData.id) {
            loadUserAddresses(userData.id)
          }
        } else {
          // Não há sessão salva
          dispatch({ type: ACTIONS.RESET_AUTH_LOADING })
        }
      } catch (error) {
        console.error("Erro ao recuperar sessão:", error)
        localStorage.removeItem("userData")
        dispatch({ type: ACTIONS.RESET_AUTH_LOADING })
      }
    }

    // Timeout para garantir que o loading não seja infinito
    const timeoutId = setTimeout(() => {
      dispatch({ type: ACTIONS.RESET_AUTH_LOADING })
    }, 3000) // 3 segundos máximo

    checkSavedSession()

    return () => clearTimeout(timeoutId)
  }, [])

  // Carregar endereços do usuário
  const loadUserAddresses = useCallback(async (userId) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { key: "addresses", value: true } })

      const response = await fetch(`http://localhost:3001/api/usuarios/${userId}/enderecos`)
      if (response.ok) {
        const addresses = await response.json()
        dispatch({ type: ACTIONS.SET_ADDRESSES, payload: addresses })

        // Selecionar endereço padrão
        const defaultAddress = addresses.find((addr) => addr.isDefault)
        if (defaultAddress) {
          dispatch({ type: ACTIONS.SET_SELECTED_ADDRESS, payload: defaultAddress })
        }
      }
    } catch (error) {
      console.error("Erro ao carregar endereços:", error)
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { key: "addresses", value: false } })
    }
  }, [])

  // Actions
  const actions = {
    // Auth
    login: async (credentials) => {
      try {
        dispatch({ type: ACTIONS.SET_LOADING, payload: { key: "auth", value: true } })
        dispatch({ type: ACTIONS.CLEAR_ERROR, payload: "auth" })

        const response = await fetch("http://localhost:3001/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Erro no login")
        }

        const userData = data.usuario || data
        dispatch({ type: ACTIONS.SET_USER, payload: userData })
        localStorage.setItem("userData", JSON.stringify(userData))

        // Carregar endereços do usuário se houver ID
        if (userData.id) {
          loadUserAddresses(userData.id)
        }

        dispatch({
          type: ACTIONS.ADD_NOTIFICATION,
          payload: {
            type: "success",
            message: "Login realizado com sucesso!",
          },
        })

        return userData
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: { key: "auth", value: error.message } })
        dispatch({ type: ACTIONS.RESET_AUTH_LOADING })
        throw error
      }
    },

    register: async (userData) => {
      try {
        dispatch({ type: ACTIONS.SET_LOADING, payload: { key: "auth", value: true } })
        dispatch({ type: ACTIONS.CLEAR_ERROR, payload: "auth" })

        const response = await fetch("http://localhost:3001/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Erro no cadastro")
        }

        dispatch({
          type: ACTIONS.ADD_NOTIFICATION,
          payload: {
            type: "success",
            message: "Cadastro realizado com sucesso!",
          },
        })

        dispatch({ type: ACTIONS.RESET_AUTH_LOADING })
        return data
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: { key: "auth", value: error.message } })
        dispatch({ type: ACTIONS.RESET_AUTH_LOADING })
        throw error
      }
    },

    logout: () => {
      dispatch({ type: ACTIONS.SET_USER, payload: null })
      dispatch({ type: ACTIONS.SET_ADDRESSES, payload: [] })
      dispatch({ type: ACTIONS.SET_SELECTED_ADDRESS, payload: null })
      dispatch({ type: ACTIONS.CLEAR_CART })
      localStorage.removeItem("userData")

      dispatch({
        type: ACTIONS.ADD_NOTIFICATION,
        payload: {
          type: "info",
          message: "Logout realizado com sucesso!",
        },
      })
    },

    // Addresses
    addAddress: async (addressData) => {
      try {
        dispatch({ type: ACTIONS.SET_LOADING, payload: { key: "addresses", value: true } })

        const response = await fetch(`http://localhost:3001/api/usuarios/${state.user.id}/enderecos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addressData),
        })

        if (!response.ok) {
          throw new Error("Erro ao salvar endereço")
        }

        const newAddress = await response.json()
        dispatch({ type: ACTIONS.ADD_ADDRESS, payload: newAddress })

        if (addressData.isDefault || state.addresses.length === 0) {
          dispatch({ type: ACTIONS.SET_SELECTED_ADDRESS, payload: newAddress })
        }

        dispatch({
          type: ACTIONS.ADD_NOTIFICATION,
          payload: {
            type: "success",
            message: "Endereço salvo com sucesso!",
          },
        })

        return newAddress
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: { key: "addresses", value: error.message } })
        throw error
      } finally {
        dispatch({ type: ACTIONS.SET_LOADING, payload: { key: "addresses", value: false } })
      }
    },

    updateAddress: async (addressId, addressData) => {
      try {
        const response = await fetch(`http://localhost:3001/api/usuarios/${state.user.id}/enderecos/${addressId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addressData),
        })

        if (!response.ok) {
          throw new Error("Erro ao atualizar endereço")
        }

        const updatedAddress = await response.json()
        dispatch({ type: ACTIONS.UPDATE_ADDRESS, payload: updatedAddress })

        dispatch({
          type: ACTIONS.ADD_NOTIFICATION,
          payload: {
            type: "success",
            message: "Endereço atualizado com sucesso!",
          },
        })

        return updatedAddress
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: { key: "addresses", value: error.message } })
        throw error
      }
    },

    deleteAddress: async (addressId) => {
      try {
        const response = await fetch(`http://localhost:3001/api/usuarios/${state.user.id}/enderecos/${addressId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Erro ao excluir endereço")
        }

        dispatch({ type: ACTIONS.DELETE_ADDRESS, payload: addressId })

        dispatch({
          type: ACTIONS.ADD_NOTIFICATION,
          payload: {
            type: "success",
            message: "Endereço excluído com sucesso!",
          },
        })
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: { key: "addresses", value: error.message } })
        throw error
      }
    },

    selectAddress: (address) => {
      dispatch({ type: ACTIONS.SET_SELECTED_ADDRESS, payload: address })
    },

    // Cart
    addToCart: (product) => {
      dispatch({ type: ACTIONS.ADD_TO_CART, payload: product })
      dispatch({
        type: ACTIONS.ADD_NOTIFICATION,
        payload: {
          type: "success",
          message: `${product.name} adicionado ao carrinho!`,
        },
      })
    },

    removeFromCart: (productId) => {
      dispatch({ type: ACTIONS.REMOVE_FROM_CART, payload: productId })
    },

    updateCartItem: (productId, quantity) => {
      dispatch({ type: ACTIONS.UPDATE_CART_ITEM, payload: { id: productId, quantity } })
    },

    clearCart: () => {
      dispatch({ type: ACTIONS.CLEAR_CART })
    },

    // Restaurants
    loadRestaurants: async () => {
      try {
        dispatch({ type: ACTIONS.SET_LOADING, payload: { key: "restaurants", value: true } })

        const response = await fetch("http://localhost:3001/api/restaurantes")
        if (response.ok) {
          const restaurants = await response.json()
          dispatch({ type: ACTIONS.SET_RESTAURANTS, payload: restaurants })
        } else {
          console.error("Erro ao carregar restaurantes:", response.status)
          dispatch({ type: ACTIONS.SET_RESTAURANTS, payload: [] })
        }
      } catch (error) {
        console.error("Erro ao carregar restaurantes:", error)
        dispatch({ type: ACTIONS.SET_RESTAURANTS, payload: [] })
      } finally {
        dispatch({ type: ACTIONS.SET_LOADING, payload: { key: "restaurants", value: false } })
      }
    },

    // Notifications
    addNotification: (notification) => {
      const notificationWithId = { ...notification, id: Date.now() }
      dispatch({ type: ACTIONS.ADD_NOTIFICATION, payload: notificationWithId })

      // Auto remove after 5 seconds
      setTimeout(() => {
        dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: notificationWithId.id })
      }, 5000)
    },

    removeNotification: (notificationId) => {
      dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: notificationId })
    },

    // Errors
    clearError: (key) => {
      dispatch({ type: ACTIONS.CLEAR_ERROR, payload: key })
    },
  }

  return <AppContext.Provider value={{ state, actions }}>{children}</AppContext.Provider>
}

// Hook para usar o contexto
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp deve ser usado dentro de AppProvider")
  }
  return context
}



