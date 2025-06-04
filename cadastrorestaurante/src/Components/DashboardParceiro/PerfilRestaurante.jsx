import "./PerfilRestaurante.css"

const PerfilRestaurante = ({ restauranteData, produtos, loading }) => {
  if (!restauranteData) {
    return <div className="loading">Carregando dados do restaurante...</div>
  }

  // Filtrar produtos por categoria
  const bebidas = produtos ? produtos.filter((produto) => produto.categoria_nome === "Bebidas") : []
  const outrosProdutos = produtos ? produtos.filter((produto) => produto.categoria_nome !== "Bebidas") : []

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
              <span className="estrelas">⭐ 4.9</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button className="ver-mais-btn">Ver mais</button>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className="busca-container">
        <div className="busca-input">
          <span className="busca-icon">🔍</span>
          <input type="text" placeholder="Buscar no cardápio" />
        </div>
      </div>

      {/* Seção de Produtos */}
      <div className="produtos-secao">
        <h2 className="secao-titulo">Cardápio</h2>

        {loading ? (
          <div className="loading-produtos">Carregando produtos...</div>
        ) : outrosProdutos && outrosProdutos.length > 0 ? (
          <div className="produtos-grid">
            {outrosProdutos.map((produto) => (
              <div key={produto.id_produto} className="produto-card">
                <div className="produto-info">
                  <h3 className="produto-nome">{produto.nome}</h3>

                  <p className="produto-ingredientes">{produto.descricao}</p>

                  <div className="produto-preco-container">
                    <span className="preco-atual">R$ {Number.parseFloat(produto.preco).toFixed(2)}</span>
                    {produto.preco_original && (
                      <span className="preco-original">R$ {Number.parseFloat(produto.preco_original).toFixed(2)}</span>
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
                      <span>🍔</span>
                      {!produto.ativo && <div className="produto-status">Fechado</div>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="sem-produtos">
            <p>Nenhum produto disponível no momento.</p>
          </div>
        )}
      </div>

      {/* Seção de Bebidas */}
      <div className="produtos-secao">
        <h2 className="secao-titulo">Bebidas</h2>

        {loading ? (
          <div className="loading-produtos">Carregando bebidas...</div>
        ) : bebidas && bebidas.length > 0 ? (
          <div className="produtos-grid">
            {bebidas.map((produto) => (
              <div key={produto.id_produto} className="produto-card">
                <div className="produto-info">
                  <h3 className="produto-nome">{produto.nome}</h3>

                  <p className="produto-ingredientes">{produto.descricao}</p>

                  <div className="produto-preco-container">
                    <span className="preco-atual">R$ {Number.parseFloat(produto.preco).toFixed(2)}</span>
                    {produto.preco_original && (
                      <span className="preco-original">R$ {Number.parseFloat(produto.preco_original).toFixed(2)}</span>
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
                      <span>🥤</span>
                      {!produto.ativo && <div className="produto-status">Fechado</div>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="sem-produtos">
            <p>Nenhuma bebida disponível no momento.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PerfilRestaurante

















