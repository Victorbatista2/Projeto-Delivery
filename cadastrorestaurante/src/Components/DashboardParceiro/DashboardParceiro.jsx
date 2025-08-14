import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import CadastroProduto from "./CadastroProduto"
import GerenciarCardapio from "./GerenciarCardapio"
import EditarInformacoes from "./EditarInformacoes"
import PerfilRestaurante from "./PerfilRestaurante"
import "./DashboardParceiro.css"
import GerenciarPedidos from "./GerenciarPedidos"

const DashboardParceiro = () => {
  const navigate = useNavigate()
  const [restauranteData, setRestauranteData] = useState(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se o usuário está logado
    const userData = localStorage.getItem("restauranteData")
    if (!userData) {
      navigate("/login")
      return
    }

    try {
      const parsedData = JSON.parse(userData)
      setRestauranteData(parsedData)
      carregarProdutos(parsedData.id)
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error)
      navigate("/login")
    }
  }, [navigate])

  // Recarregar produtos sempre que a aba ativa mudar
  useEffect(() => {
    if (restauranteData && (activeTab === "dashboard" || activeTab === "perfil")) {
      carregarProdutos(restauranteData.id)
    }
  }, [activeTab, restauranteData])

  const carregarProdutos = async (restauranteId) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:3001/api/produtos/restaurante/${restauranteId}`)
      const data = await response.json()

      if (data.success) {
        setProdutos(data.data)
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("restauranteData")
    navigate("/login")
  }

  const handleProdutoAdicionado = () => {
    if (restauranteData) {
      carregarProdutos(restauranteData.id)
    }
  }

  const handleProdutoAtualizado = () => {
    if (restauranteData) {
      carregarProdutos(restauranteData.id)
    }
  }

  const handleRestauranteAtualizado = (dadosAtualizados) => {
    setRestauranteData(dadosAtualizados)
    localStorage.setItem("restauranteData", JSON.stringify(dadosAtualizados))
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    // Recarregar produtos quando necessário
    if ((tab === "dashboard" || tab === "perfil") && restauranteData) {
      carregarProdutos(restauranteData.id)
    }
  }

  if (!restauranteData) {
    return <div className="loading">Carregando...</div>
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="dashboard-content">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total de Produtos</h3>
                <p className="stat-number">{produtos.length}</p>
              </div>
              <div className="stat-card">
                <h3>Produtos Disponíveis</h3>
                <p className="stat-number">{produtos.filter((p) => p.ativo).length}</p>
              </div>
              <div className="stat-card">
                <h3>Categorias</h3>
                <p className="stat-number">{new Set(produtos.map((p) => p.categoria_nome).filter(Boolean)).size}</p>
              </div>
              <div className="stat-card">
                <h3>Status</h3>
                <p className="stat-status active">Ativo</p>
              </div>
            </div>

            <div className="recent-products">
              <h3>Produtos Recentes</h3>
              {loading ? (
                <p>Carregando produtos...</p>
              ) : produtos.length > 0 ? (
                <div className="products-list">
                  {produtos.slice(0, 5).map((produto) => (
                    <div key={produto.id_produto} className="product-item">
                      <div className="product-info">
                        <h4>{produto.nome}</h4>
                        <p>{produto.categoria_nome || "Sem categoria"}</p>
                        <span className="price">R$ {Number.parseFloat(produto.preco).toFixed(2)}</span>
                      </div>
                      <div className={`status ${produto.ativo ? "available" : "unavailable"}`}>
                        {produto.ativo ? "Disponível" : "Indisponível"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Nenhum produto cadastrado ainda.</p>
              )}
            </div>
          </div>
        )

      case "produtos":
        return <CadastroProduto restauranteId={restauranteData.id} onProdutoAdicionado={handleProdutoAdicionado} />

      case "cardapio":
        return (
          <GerenciarCardapio
            restauranteId={restauranteData.id}
            produtos={produtos}
            onProdutoAtualizado={handleProdutoAtualizado}
          />
        )

      case "pedidos":
        return <GerenciarPedidos restauranteId={restauranteData.id} />

      case "perfil":
        return <PerfilRestaurante restauranteData={restauranteData} produtos={produtos} loading={loading} />

      case "informacoes":
        return (
          <EditarInformacoes restauranteData={restauranteData} onRestauranteAtualizado={handleRestauranteAtualizado} />
        )

      default:
        return <div>Página não encontrada</div>
    }
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <img
              src="/Captura de tela 2025-06-11 013942.png"
              alt="TO NA LAAARAS!!"
              className="custom-logo"
              style={{
                height: "35px",
                width: "auto",
                borderRadius: "6px",
              }}
            />
            <h1>Painel do Parceiro</h1>
          </div>
          <div className="user-section">
            <span className="restaurant-name">{restauranteData.nome_restaurante}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        <nav className="sidebar">
          <ul className="nav-menu">
            <li>
              <button
                className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => handleTabChange("dashboard")}
              >
                <span className="nav-icon">📊</span>
                Dashboard
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === "produtos" ? "active" : ""}`}
                onClick={() => handleTabChange("produtos")}
              >
                <span className="nav-icon">➕</span>
                Cadastrar Produto
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === "cardapio" ? "active" : ""}`}
                onClick={() => handleTabChange("cardapio")}
              >
                <span className="nav-icon">📋</span>
                Gerenciar Cardápio
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === "pedidos" ? "active" : ""}`}
                onClick={() => handleTabChange("pedidos")}
              >
                <span className="nav-icon">📋</span>
                Pedidos
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === "perfil" ? "active" : ""}`}
                onClick={() => handleTabChange("perfil")}
              >
                <span className="nav-icon">👤</span>
                Perfil
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === "informacoes" ? "active" : ""}`}
                onClick={() => handleTabChange("informacoes")}
              >
                <span className="nav-icon">⚙️</span>
                Editar Informações
              </button>
            </li>
          </ul>
        </nav>

        <main className="main-content">{renderContent()}</main>
      </div>
    </div>
  )
}

export default DashboardParceiro
