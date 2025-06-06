"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, X, Clock, Minus, Plus, ArrowRight } from "lucide-react"
import { useApp } from "../../contexts/AppContext"
import "./RestaurantProfile.css"

const RestaurantProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, actions } = useApp()

  const [restauranteData, setRestauranteData] = useState(null)
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [termoPesquisa, setTermoPesquisa] = useState("")
  const [showSidebar, setShowSidebar] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productQuantity, setProductQuantity] = useState(1)
  const [showCartSidebar, setShowCartSidebar] = useState(false)

  // Buscar dados do restaurante
  useEffect(() => {
    const fetchRestauranteData = async () => {
      try {
        setLoading(true)

        // Buscar dados do restaurante
        const restauranteResponse = await fetch(`http://localhost:3001/api/restaurantes/${id}`)
        if (restauranteResponse.ok) {
          const restauranteResult = await restauranteResponse.json()
          setRestauranteData(restauranteResult.data)
        }

        // Buscar produtos do restaurante
        const produtosResponse = await fetch(`http://localhost:3001/api/produtos/restaurante/${id}`)
        if (produtosResponse.ok) {
          const produtosResult = await produtosResponse.json()
          setProdutos(Array.isArray(produtosResult.data) ? produtosResult.data : [])
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchRestauranteData()
    }
  }, [id])

  // Filtrar produtos baseado na pesquisa
  const produtosFiltrados = produtos.filter(
    (produto) =>
      produto.nome?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      produto.descricao?.toLowerCase().includes(termoPesquisa.toLowerCase()),
  )

  // Agrupar produtos por categoria
  const produtosPorCategoria = produtosFiltrados.reduce((acc, produto) => {
    const categoria = produto.categoria_nome || "Destaques"
    if (!acc[categoria]) {
      acc[categoria] = []
    }
    acc[categoria].push(produto)
    return acc
  }, {})

  // Abrir modal do produto
  const abrirModalProduto = (produto) => {
    setSelectedProduct(produto)
    setProductQuantity(1)
  }

  // Fechar modal do produto
  const fecharModalProduto = () => {
    setSelectedProduct(null)
    setProductQuantity(1)
  }

  // Adicionar produto ao carrinho
  const adicionarAoCarrinho = () => {
    if (selectedProduct) {
      const produto = {
        id: `${selectedProduct.id_produto || selectedProduct.id}-${Date.now()}`, // ID único
        name: selectedProduct.nome,
        price: formatarPreco(selectedProduct.preco), // Passar como string formatada
        image: selectedProduct.imagem || selectedProduct.imagem_url || "/placeholder.svg?height=150&width=250",
        restaurantId: id,
        restaurantName: restauranteData?.nome_restaurante,
        quantity: productQuantity,
      }

      // Adicionar cada quantidade individualmente
      for (let i = 0; i < productQuantity; i++) {
        actions.addToCart({
          ...produto,
          id: `${selectedProduct.id_produto || selectedProduct.id}-${Date.now()}-${i}`, // ID único para cada item
        })
      }

      fecharModalProduto()
      setShowCartSidebar(true)
    }
  }

  // Aumentar quantidade
  const aumentarQuantidade = () => {
    setProductQuantity((prev) => prev + 1)
  }

  // Diminuir quantidade
  const diminuirQuantidade = () => {
    if (productQuantity > 1) {
      setProductQuantity((prev) => prev - 1)
    }
  }

  const formatarPreco = (preco) => {
    return `R$ ${Number.parseFloat(preco).toFixed(2).replace(".", ",")}`
  }

  const calcularPrecoTotal = () => {
    if (selectedProduct) {
      const total = Number.parseFloat(selectedProduct.preco) * productQuantity
      return formatarPreco(total)
    }
    return "R$ 0,00"
  }

  const voltar = () => {
    navigate(-1)
  }

  const irParaPagamento = () => {
    setShowCartSidebar(false)
    navigate("/pagamento")
  }

  if (loading) {
    return (
      <div className="restaurant-profile-loading">
        <div className="loading-spinner"></div>
        <p>Carregando restaurante...</p>
      </div>
    )
  }

  if (!restauranteData) {
    return (
      <div className="restaurant-profile-error">
        <h2>Restaurante não encontrado</h2>
        <button onClick={voltar} className="btn-voltar">
          Voltar
        </button>
      </div>
    )
  }

  const temProdutos = Object.keys(produtosPorCategoria).length > 0

  return (
    <div className="restaurant-profile-container">
      {/* Header com botão voltar */}
      <div className="restaurant-header-simple">
        <div className="header-content">
          <button onClick={voltar} className="btn-back-simple">
            <ArrowLeft size={24} />
          </button>
        </div>
      </div>

      {/* Informações do Restaurante */}
      <div className="restaurant-info-section">
        <div className="info-content">
          <div className="restaurant-logo-large">
            {restauranteData.imagem ? (
              <img
                src={restauranteData.imagem || "/placeholder.svg"}
                alt={restauranteData.nome_restaurante}
                className="logo-img-large"
              />
            ) : (
              <div className="logo-placeholder-large">
                <span>{restauranteData.nome_restaurante?.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="restaurant-details-large">
            <h1 className="restaurant-name-large">{restauranteData.nome_restaurante}</h1>
            <div className="restaurant-meta">
              <div className="restaurant-rating-large">⭐ {restauranteData.avaliacao_media || "Novo"}</div>
              <div className="restaurant-delivery-info">
                <Clock size={16} />
                <span>30-45 min</span>
              </div>
            </div>
          </div>
          <div className="restaurant-actions">
            <button className="btn-ver-mais-large" onClick={() => setShowSidebar(true)}>
              Ver mais
            </button>
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="search-section">
        <div className="search-content">
          <div className="search-bar-large">
            <img src="https://img.icons8.com/sf-black/64/search.png" alt="search" className="search-icon-large" />
            <input
              type="text"
              placeholder="Buscar no cardápio"
              value={termoPesquisa}
              onChange={(e) => setTermoPesquisa(e.target.value)}
              className="search-input-large"
            />
          </div>
        </div>
      </div>

      {/* Conteúdo Principal - Produtos ou Mensagem */}
      <div className="main-content">
        {temProdutos ? (
          // Se tem produtos, mostra as categorias
          Object.entries(produtosPorCategoria).map(([categoria, produtosCategoria]) => (
            <div key={categoria} className="menu-section-large">
              <h2 className="section-title-large">{categoria}</h2>
              <div className="produtos-grid-large">
                {produtosCategoria.map((produto) => (
                  <div
                    key={produto.id_produto || produto.id}
                    className="produto-card-large"
                    onClick={() => abrirModalProduto(produto)}
                  >
                    <div className="produto-info-large">
                      <h3 className="produto-nome-large">{produto.nome}</h3>
                      <p className="produto-descricao-large">{produto.descricao}</p>
                      <div className="produto-preco-large">{formatarPreco(produto.preco)}</div>
                    </div>
                    <div className="produto-imagem-section">
                      <img
                        src={produto.imagem || produto.imagem_url || "/placeholder.svg?height=150&width=150"}
                        alt={produto.nome}
                        className="produto-imagem-large"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=150&width=150"
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          // Se não tem produtos, mostra a mensagem dentro da mesma estrutura de seção
          <div className="menu-section-large">
            <h2 className="section-title-large">Destaques</h2>
            <div className="empty-state">
              <h3>Nenhum produto disponível</h3>
              <p>Este restaurante ainda não possui produtos cadastrados.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal do Produto */}
      {selectedProduct && (
        <>
          <div className="product-modal-overlay" onClick={fecharModalProduto} />
          <div className="product-modal">
            <div className="product-modal-header">
              <button className="btn-close-modal" onClick={fecharModalProduto}>
                <X size={24} />
              </button>
              <h2 className="product-modal-title">{selectedProduct.nome.toUpperCase()}</h2>
            </div>

            <div className="product-modal-content">
              <div className="product-modal-image">
                <img
                  src={selectedProduct.imagem || selectedProduct.imagem_url || "/placeholder.svg?height=400&width=400"}
                  alt={selectedProduct.nome}
                  className="modal-product-image"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=400&width=400"
                  }}
                />
              </div>

              <div className="product-modal-details">
                <p className="product-modal-description">{selectedProduct.descricao}</p>

                <div className="product-modal-price">
                  <span className="current-price">{formatarPreco(selectedProduct.preco)}</span>
                </div>

                <div className="product-modal-restaurant">
                  <span className="restaurant-name">🏪 {restauranteData.nome_restaurante}</span>
                  <span className="restaurant-rating">⭐ {restauranteData.avaliacao_media || "Novo"}</span>
                </div>

                <div className="product-modal-delivery">
                  <Clock size={16} />
                  <span>30-45 min • Grátis</span>
                </div>

                <div className="product-modal-actions">
                  <div className="quantity-selector">
                    <button className="quantity-btn" onClick={diminuirQuantidade} disabled={productQuantity <= 1}>
                      <Minus size={16} />
                    </button>
                    <span className="quantity-display">{productQuantity}</span>
                    <button className="quantity-btn" onClick={aumentarQuantidade}>
                      <Plus size={16} />
                    </button>
                  </div>

                  <button className="btn-add-to-cart" onClick={adicionarAoCarrinho}>
                    Adicionar {calcularPrecoTotal()}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Cart Sidebar */}
      {showCartSidebar && (
        <div className="cart-overlay" onClick={() => setShowCartSidebar(false)}>
          <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>Sacola</h2>
              <button className="close-cart" onClick={() => setShowCartSidebar(false)} aria-label="Fechar sacola">
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
                    {state.cart.items.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="cart-item">
                        <div className="cart-item-image">
                          <img
                            src={item.image || "/placeholder.svg?height=60&width=60"}
                            alt={item.name}
                            onError={(e) => {
                              e.target.src = "/placeholder.svg?height=60&width=60"
                            }}
                          />
                        </div>
                        <div className="cart-item-details">
                          <h4>{item.name}</h4>
                          <div className="cart-item-price">
                            {formatarPreco(
                              typeof item.price === "string"
                                ? Number.parseFloat(item.price.replace("R$ ", "").replace(",", ".")) * item.quantity
                                : Number.parseFloat(item.price) * item.quantity,
                            )}
                          </div>

                          <div className="cart-item-actions">
                            <button
                              type="button"
                              className="remove-item"
                              onClick={() => actions.removeFromCart(item.id)}
                              aria-label={`Remover ${item.name} do carrinho`}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M3 6H5H21"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>

                            <div className="quantity-controls">
                              <button
                                type="button"
                                className="quantity-btn decrease"
                                onClick={() => actions.updateCartItem(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                aria-label="Diminuir quantidade"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="quantity">{item.quantity}</span>
                              <button
                                type="button"
                                className="quantity-btn increase"
                                onClick={() => actions.updateCartItem(item.id, item.quantity + 1)}
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
                      <span>{formatarPreco(state.cart.total)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Taxa de entrega</span>
                      <span>{formatarPreco(7.9)}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total</span>
                      <span>{formatarPreco(state.cart.total + 7.9)}</span>
                    </div>
                  </div>

                  <div className="cart-footer">
                    <button type="button" className="checkout-button" onClick={irParaPagamento}>
                      <span>Escolher forma de pagamento</span>
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-cart">
                  <div className="empty-cart-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 6H21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3>Sua sacola está vazia</h3>
                  <p>Adicione itens para continuar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Sobre o Restaurante */}
      {showSidebar && (
        <>
          <div className="sidebar-overlay" onClick={() => setShowSidebar(false)} />
          <div className="sidebar">
            <div className="sidebar-header">
              <h2>Sobre</h2>
              <button className="btn-close-sidebar" onClick={() => setShowSidebar(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="sidebar-content">
              {restauranteData.historia && (
                <div className="sidebar-section">
                  <h3>História</h3>
                  <p>{restauranteData.historia}</p>
                </div>
              )}

              <div className="sidebar-section">
                <h3>Endereço</h3>
                <p>
                  {restauranteData.rua || restauranteData.endereco}, {restauranteData.numero}
                  <br />
                  {restauranteData.bairro} - {restauranteData.cidade}/{restauranteData.estado}
                  <br />
                  CEP: {restauranteData.cep}
                </p>
              </div>

              <div className="sidebar-section">
                <h3>Outras informações</h3>
                <p>CNPJ: {restauranteData.cnpj}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default RestaurantProfile






