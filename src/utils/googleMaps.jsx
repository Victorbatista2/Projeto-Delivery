// Utility para carregar Google Maps dinamicamente
let isGoogleMapsLoaded = false
let isGoogleMapsLoading = false
const callbacks = []

export const loadGoogleMaps = () => {
  return new Promise((resolve, reject) => {
    // Se já está carregado, resolve imediatamente
    if (isGoogleMapsLoaded) {
      resolve(window.google)
      return
    }

    // Adiciona callback à lista
    callbacks.push({ resolve, reject })

    // Se já está carregando, não carrega novamente
    if (isGoogleMapsLoading) {
      return
    }

    isGoogleMapsLoading = true

    // Função de callback global
    window.initGoogleMaps = () => {
      isGoogleMapsLoaded = true
      isGoogleMapsLoading = false

      // Resolve todas as promises pendentes
      callbacks.forEach(({ resolve }) => resolve(window.google))
      callbacks.length = 0 // Limpa o array

      console.log("Google Maps carregado com sucesso!")
    }

    // Função de erro global
    window.googleMapsError = () => {
      isGoogleMapsLoading = false

      // Rejeita todas as promises pendentes
      callbacks.forEach(({ reject }) => reject(new Error("Erro ao carregar Google Maps")))
      callbacks.length = 0 // Limpa o array

      console.error("Erro ao carregar Google Maps")
    }

    // Cria e adiciona o script
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`
    script.async = true
    script.defer = true
    script.onerror = window.googleMapsError

    document.head.appendChild(script)
  })
}

export const isGoogleMapsAvailable = () => {
  return isGoogleMapsLoaded && window.google && window.google.maps
}
