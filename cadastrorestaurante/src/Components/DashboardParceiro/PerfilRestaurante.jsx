import { useState } from "react"
import "./PerfilRestaurante.css"

const PerfilRestaurante = ({ restauranteData, produtos, loading }) => {
  const [showSidebar, setShowSidebar] = useState(false)
  const [termoPesquisa, setTermoPesquisa] = useState("")

  if (!restauranteData) {
    return <div className="loading">Carregando dados do restaurante...</div>
  }

  // Filtrar produtos pela pesquisa
  const produtosFiltrados = produtos
    ? produtos.filter((produto) => {
        if (!termoPesquisa) return true
        const termo = termoPesquisa.toLowerCase()
        return (
          produto.nome.toLowerCase().includes(termo) ||
          (produto.descricao && produto.descricao.toLowerCase().includes(termo))
        )
      })
    : []

  // Agrupar produtos filtrados por categoria
  const produtosPorCategoria = produtosFiltrados.reduce((acc, produto) => {
    const categoria = produto.categoria_nome || "Outros"
    if (!acc[categoria]) {
      acc[categoria] = []
    }
    acc[categoria].push(produto)
    return acc
  }, {})

  // Obter todas as categorias que têm produtos após a filtragem
  const categorias = Object.keys(produtosPorCategoria)

  return (
    <div className="perfil-ifood-container">
      {/* Header do Restaurante */}
      <div className="restaurante-header">
        <div className="restaurante-info-header">
          <div className="restaurante-logo">
            {restauranteData.imagem ? (
              <img
                src={restauranteData.imagem || "/placeholder.svg"}
                alt={restauranteData.nome_restaurante}
                className="logo-img"
              />
            ) : (
              <div className="logo-placeholder">
                <span>{restauranteData.nome_restaurante?.charAt(0)}</span>
              </div>
            )}
          </div>

          <div className="restaurante-detalhes-header">
            <h1 className="nome-restaurante">{restauranteData.nome_restaurante}</h1>
            <div className="rating">
              <span className="estrelas">
                ⭐{" "}
                {restauranteData.avaliacao_media
                  ? Number(restauranteData.avaliacao_media).toFixed(1)
                  : "Sem avaliações"}
              </span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button className="ver-mais-btn" onClick={() => setShowSidebar(true)}>
            Ver mais
          </button>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className="busca-container">
        <div className="busca-input">
          <img
            src="https://img.icons8.com/sf-black/64/search.png"
            alt="search"
            className="busca-icon"
            width="16"
            height="16"
          />
          <input
            type="text"
            placeholder="Buscar no cardápio"
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
          />
        </div>
      </div>

      {/* Seções de Produtos por Categoria */}
      {loading ? (
        <div className="loading-produtos">Carregando produtos...</div>
      ) : categorias.length > 0 ? (
        categorias.map((categoria) => (
          <div key={categoria} className="produtos-secao">
            <h2 className="secao-titulo">{categoria}</h2>
            <div className="produtos-grid">
              {produtosPorCategoria[categoria].map((produto) => (
                <div key={produto.id_produto} className="produto-card">
                  <div className="produto-info">
                    <h3 className="produto-nome">{produto.nome}</h3>

                    <p className="produto-ingredientes">{produto.descricao}</p>

                    <div className="produto-preco-container">
                      <span className="preco-atual">R$ {Number.parseFloat(produto.preco).toFixed(2)}</span>
                      {produto.preco_original && (
                        <span className="preco-original">
                          R$ {Number.parseFloat(produto.preco_original).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="produto-imagem-wrapper">
                    {produto.imagem ? (
                      <>
                        <img src={produto.imagem || "/placeholder.svg"} alt={produto.nome} className="produto-img" />
                        {!produto.ativo && <div className="produto-status">Fechado</div>}
                      </>
                    ) : (
                      <div className="produto-img-placeholder">
                        <span>
                          {categoria === "Bebidas"
                            ? "🥤"
                            : categoria === "Sobremesas"
                              ? "🍰"
                              : categoria === "Pizza"
                                ? "🍕"
                                : "🍔"}
                        </span>
                        {!produto.ativo && <div className="produto-status">Fechado</div>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : termoPesquisa ? (
        <div className="sem-produtos">
          <p>Nenhum produto encontrado para "{termoPesquisa}".</p>
        </div>
      ) : (
        <div className="sem-produtos">
          <p>Nenhum produto disponível no momento.</p>
        </div>
      )}

      {/* Sidebar "Sobre" */}
      {showSidebar && (
        <div className="sidebar-overlay">
          <div className="sidebar-sobre">
            <div className="sidebar-header">
              <h2>Sobre</h2>
              <button className="close-btn" onClick={() => setShowSidebar(false)}>
                ✕
              </button>
            </div>

            <div className="sidebar-content">
              <div className="sidebar-section">
                <h3>História</h3>
                <p>{restauranteData.descricao || "Este restaurante ainda não adicionou uma descrição."}</p>
              </div>

              <div className="sidebar-section">
                <h3>Endereço</h3>
                <p>
                  {restauranteData.rua || restauranteData.endereco || ""} {restauranteData.numero || ""}
                  {restauranteData.complemento ? `, ${restauranteData.complemento}` : ""}
                  <br />
                  {restauranteData.bairro || ""} - {restauranteData.cidade || ""}/{restauranteData.estado || ""}
                  <br />
                  CEP: {restauranteData.cep || ""}
                </p>
              </div>

              <div className="sidebar-section">
                <h3>Outras informações</h3>
                <p>CNPJ: {restauranteData.cnpj || ""}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PerfilRestaurante
