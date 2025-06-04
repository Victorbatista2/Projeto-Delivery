"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, X, Clock } from "lucide-react"
import { useApp } from "../../contexts/AppContext"
import "./RestaurantProfile.css"

const RestaurantProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { actions } = useApp()

  const [restauranteData, setRestauranteData] = useState(null)
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [termoPesquisa, setTermoPesquisa] = useState("")
  const [showSidebar, setShowSidebar] = useState(false)

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
    const categoria = produto.categoria || "Destaques"
    if (!acc[categoria]) {
      acc[categoria] = []
    }
    acc[categoria].push(produto)
    return acc
  }, {})

  // Adicionar produto ao carrinho
  const adicionarAoCarrinho = (produto) => {
    actions.addToCart({
      id: produto.id,
      name: produto.nome,
      price: Number.parseFloat(produto.preco),
      image: produto.imagem_url || "/placeholder.svg?height=150&width=250",
      restaurantId: id,
      restaurantName: restauranteData?.nome_restaurante,
    })
  }

  const formatarPreco = (preco) => {
    return `R$ ${Number.parseFloat(preco).toFixed(2).replace(".", ",")}`
  }

  const voltar = () => {
    navigate(-1)
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
            <div className="pedido-minimo">
              <span>Pedido mínimo R$ 20,00</span>
            </div>
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
          <div className="delivery-selector">
            <Clock size={16} />
            <span>Entrega</span>
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
                  <div key={produto.id} className="produto-card-large">
                    <div className="produto-info-large">
                      <h3 className="produto-nome-large">{produto.nome}</h3>
                      <p className="produto-descricao-large">{produto.descricao}</p>
                      <div className="produto-preco-large">{formatarPreco(produto.preco)}</div>
                    </div>
                    <div className="produto-imagem-section">
                      <img
                        src={produto.imagem_url || "/placeholder.svg?height=150&width=150"}
                        alt={produto.nome}
                        className="produto-imagem-large"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=150&width=150"
                        }}
                      />
                      <button className="btn-adicionar-large" onClick={() => adicionarAoCarrinho(produto)}>
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          // Se não tem produtos, mostra a mensagem
          <div className="empty-state-large">
            <h2>Nenhum produto disponível</h2>
            <p>Este restaurante ainda não possui produtos cadastrados.</p>
          </div>
        )}
      </div>

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






