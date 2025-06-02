"use client"

import { useState, useEffect } from "react"

const GerenciarCardapio = ({ restauranteId, produtos, onProdutoAtualizado }) => {
  const [produtosFiltrados, setProdutosFiltrados] = useState([])
  const [filtroCategoria, setFiltroCategoria] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("")
  const [editandoProduto, setEditandoProduto] = useState(null)
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false)
  const [produtoDetalhes, setProdutoDetalhes] = useState(null)
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false)
  const [loading, setLoading] = useState(false)

  const categorias = [
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
    "Bebidas",
    "Sobremesas",
    "Entradas",
    "Pratos Principais",
  ]

  useEffect(() => {
    let filtered = [...produtos]

    if (filtroCategoria) {
      filtered = filtered.filter((produto) => produto.categoria_nome === filtroCategoria)
    }

    if (filtroStatus === "disponivel") {
      filtered = filtered.filter((produto) => produto.ativo)
    } else if (filtroStatus === "indisponivel") {
      filtered = filtered.filter((produto) => !produto.ativo)
    }

    setProdutosFiltrados(filtered)
  }, [produtos, filtroCategoria, filtroStatus])

  const categoriasDisponiveis = [...new Set(produtos.map((p) => p.categoria_nome).filter(Boolean))].sort()

  const alterarDisponibilidade = async (produtoId, novoStatus) => {
    try {
      const response = await fetch(`http://localhost:3001/api/produtos/${produtoId}/disponibilidade`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          disponivel: novoStatus,
          restauranteId: restauranteId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao alterar disponibilidade")
      }

      onProdutoAtualizado()
    } catch (error) {
      alert("Erro ao alterar disponibilidade: " + error.message)
    }
  }

  const deletarProduto = async (produtoId) => {
    if (!window.confirm("Tem certeza que deseja deletar este produto?")) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/produtos/${produtoId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restauranteId: restauranteId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao deletar produto")
      }

      onProdutoAtualizado()
      alert("Produto deletado com sucesso!")
    } catch (error) {
      alert("Erro ao deletar produto: " + error.message)
    }
  }

  const iniciarEdicao = (produto) => {
    setEditandoProduto({
      id: produto.id_produto,
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco.toString(),
      categoria: produto.categoria_nome || "",
      ingredientes: produto.ingredientes || "",
      imagem: produto.imagem || "",
      imagemFile: null,
      ativo: produto.ativo,
    })
    setModalEdicaoAberto(true)
  }

  const cancelarEdicao = () => {
    setEditandoProduto(null)
    setModalEdicaoAberto(false)
  }

  const handleEdicaoChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditandoProduto({
      ...editandoProduto,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleImagemChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (event) => {
          setEditandoProduto({
            ...editandoProduto,
            imagemFile: event.target.result,
          })
        }
        reader.readAsDataURL(file)
      } else {
        alert("Por favor, selecione apenas arquivos de imagem.")
      }
    }
  }

  const salvarEdicao = async () => {
    if (!editandoProduto.nome.trim() || !editandoProduto.descricao.trim() || !editandoProduto.preco.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`http://localhost:3001/api/produtos/${editandoProduto.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nomeProduto: editandoProduto.nome,
          descricao: editandoProduto.descricao,
          preco: Number.parseFloat(editandoProduto.preco),
          categoriaProduto: editandoProduto.categoria,
          ingredientes: editandoProduto.ingredientes,
          imagemUrl: editandoProduto.imagemFile || editandoProduto.imagem,
          disponivel: editandoProduto.ativo,
          restauranteId: restauranteId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao atualizar produto")
      }

      setEditandoProduto(null)
      setModalEdicaoAberto(false)
      onProdutoAtualizado()
      alert("Produto atualizado com sucesso!")
    } catch (error) {
      alert("Erro ao atualizar produto: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const abrirDetalhes = (produto) => {
    setProdutoDetalhes(produto)
    setModalDetalhesAberto(true)
  }

  const fecharDetalhes = () => {
    setProdutoDetalhes(null)
    setModalDetalhesAberto(false)
  }

  return (
    <div className="gerenciar-cardapio">
      <h2>Gerenciar Cardápio</h2>

      <div className="filtros">
        <div className="filtro-group">
          <label htmlFor="filtroCategoria">Filtrar por categoria:</label>
          <select id="filtroCategoria" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
            <option value="">Todas as categorias</option>
            {categoriasDisponiveis.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-group">
          <label htmlFor="filtroStatus">Filtrar por status:</label>
          <select id="filtroStatus" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="disponivel">Disponível</option>
            <option value="indisponivel">Indisponível</option>
          </select>
        </div>
      </div>

      <div className="produtos-grid">
        {produtosFiltrados.length > 0 ? (
          produtosFiltrados.map((produto) => (
            <div key={produto.id_produto} className="produto-card-improved" onClick={() => abrirDetalhes(produto)}>
              <div className="produto-info-container">
                <h3 className="produto-nome">{produto.nome}</h3>
                <p className="produto-descricao">{produto.descricao}</p>
                <p className="produto-preco">R$ {Number.parseFloat(produto.preco).toFixed(2)}</p>
                <span className={`produto-status ${produto.ativo ? "ativo" : "inativo"}`}>
                  {produto.ativo ? "Disponível" : "Indisponível"}
                </span>
                <div className="produto-actions" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => iniciarEdicao(produto)} className="btn-edit">
                    Editar
                  </button>
                  <button
                    onClick={() => alterarDisponibilidade(produto.id_produto, !produto.ativo)}
                    className={`btn-toggle ${produto.ativo ? "btn-disable" : "btn-enable"}`}
                  >
                    {produto.ativo ? "Desativar" : "Ativar"}
                  </button>
                  <button onClick={() => deletarProduto(produto.id_produto)} className="btn-delete">
                    Deletar
                  </button>
                </div>
              </div>
              <div className="produto-image-container">
                <img
                  src={produto.imagem || "/placeholder.svg?height=120&width=120"}
                  alt={produto.nome}
                  className="produto-image"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=120&width=120"
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="no-products">
            <p>Nenhum produto encontrado com os filtros selecionados.</p>
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      {modalEdicaoAberto && editandoProduto && (
        <div className="modal-overlay" onClick={cancelarEdicao}>
          <div className="modal-content modal-edit" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Produto</h2>
              <button className="modal-close" onClick={cancelarEdicao}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <form className="edit-form">
                <div className="form-group">
                  <label htmlFor="nome">Nome do Produto *</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={editandoProduto.nome}
                    onChange={handleEdicaoChange}
                    placeholder="Nome do produto"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="categoria">Categoria</label>
                  <select
                    id="categoria"
                    name="categoria"
                    value={editandoProduto.categoria}
                    onChange={handleEdicaoChange}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="descricao">Descrição *</label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={editandoProduto.descricao}
                    onChange={handleEdicaoChange}
                    placeholder="Descrição do produto"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="preco">Preço (R$) *</label>
                  <input
                    type="number"
                    id="preco"
                    name="preco"
                    value={editandoProduto.preco}
                    onChange={handleEdicaoChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="ingredientes">Ingredientes</label>
                  <textarea
                    id="ingredientes"
                    name="ingredientes"
                    value={editandoProduto.ingredientes}
                    onChange={handleEdicaoChange}
                    placeholder="Liste os ingredientes principais..."
                    rows={2}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="imagemFile">Nova Imagem do Produto</label>
                  <input type="file" id="imagemFile" name="imagemFile" onChange={handleImagemChange} accept="image/*" />
                  {(editandoProduto.imagemFile || editandoProduto.imagem) && (
                    <div style={{ marginTop: "10px" }}>
                      <img
                        src={editandoProduto.imagemFile || editandoProduto.imagem || "/placeholder.svg"}
                        alt="Preview"
                        style={{
                          maxWidth: "200px",
                          maxHeight: "150px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="ativo" checked={editandoProduto.ativo} onChange={handleEdicaoChange} />
                    Produto disponível para venda
                  </label>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button onClick={cancelarEdicao} className="btn-cancel">
                Cancelar
              </button>
              <button onClick={salvarEdicao} className="btn-save" disabled={loading}>
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {modalDetalhesAberto && produtoDetalhes && (
        <div className="modal-overlay" onClick={fecharDetalhes}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{produtoDetalhes.nome}</h2>
              <button className="modal-close" onClick={fecharDetalhes}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <img
                src={produtoDetalhes.imagem || "/placeholder.svg?height=300&width=300"}
                alt={produtoDetalhes.nome}
                className="modal-image"
              />
              <div className="modal-details">
                <p>
                  <strong>Descrição:</strong> {produtoDetalhes.descricao}
                </p>
                <p>
                  <strong>Preço:</strong> R$ {Number.parseFloat(produtoDetalhes.preco).toFixed(2)}
                </p>
                <p>
                  <strong>Status:</strong> {produtoDetalhes.ativo ? "Disponível" : "Indisponível"}
                </p>
                {produtoDetalhes.ingredientes && (
                  <p>
                    <strong>Ingredientes:</strong> {produtoDetalhes.ingredientes}
                  </p>
                )}
                {produtoDetalhes.categoria_nome && (
                  <p>
                    <strong>Categoria:</strong> {produtoDetalhes.categoria_nome}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GerenciarCardapio



