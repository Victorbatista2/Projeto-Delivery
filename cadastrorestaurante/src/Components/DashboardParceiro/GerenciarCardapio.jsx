"use client"

import { useState, useEffect } from "react"

const GerenciarCardapio = ({ restauranteId, produtos, onProdutoAtualizado }) => {
  const [produtosFiltrados, setProdutosFiltrados] = useState([])
  const [filtroCategoria, setFiltroCategoria] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("")
  const [editandoProduto, setEditandoProduto] = useState(null)

  useEffect(() => {
    let filtered = [...produtos]

    if (filtroCategoria) {
      filtered = filtered.filter((produto) => produto.categoria_produto === filtroCategoria)
    }

    if (filtroStatus === "disponivel") {
      filtered = filtered.filter((produto) => produto.disponivel)
    } else if (filtroStatus === "indisponivel") {
      filtered = filtered.filter((produto) => !produto.disponivel)
    }

    setProdutosFiltrados(filtered)
  }, [produtos, filtroCategoria, filtroStatus])

  const categorias = [...new Set(produtos.map((p) => p.categoria_produto))].sort()

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
      ...produto,
      preco: produto.preco.toString(),
    })
  }

  const cancelarEdicao = () => {
    setEditandoProduto(null)
  }

  const salvarEdicao = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/produtos/${editandoProduto.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nomeProduto: editandoProduto.nome_produto,
          descricao: editandoProduto.descricao,
          preco: Number.parseFloat(editandoProduto.preco),
          categoriaProduto: editandoProduto.categoria_produto,
          tempoPreparo: editandoProduto.tempo_preparo,
          ingredientes: editandoProduto.ingredientes,
          informacoesNutricionais: editandoProduto.informacoes_nutricionais,
          imagemUrl: editandoProduto.imagem_url,
          disponivel: editandoProduto.disponivel,
          restauranteId: restauranteId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao atualizar produto")
      }

      setEditandoProduto(null)
      onProdutoAtualizado()
      alert("Produto atualizado com sucesso!")
    } catch (error) {
      alert("Erro ao atualizar produto: " + error.message)
    }
  }

  return (
    <div className="gerenciar-cardapio">
      <h2>Gerenciar Cardápio</h2>

      <div className="filtros">
        <div className="filtro-group">
          <label htmlFor="filtroCategoria">Filtrar por categoria:</label>
          <select id="filtroCategoria" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
            <option value="">Todas as categorias</option>
            {categorias.map((categoria) => (
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
            <div key={produto.id} className="produto-card">
              {editandoProduto && editandoProduto.id === produto.id ? (
                <div className="produto-edit">
                  <input
                    type="text"
                    value={editandoProduto.nome_produto}
                    onChange={(e) => setEditandoProduto({ ...editandoProduto, nome_produto: e.target.value })}
                    className="edit-input"
                  />
                  <textarea
                    value={editandoProduto.descricao}
                    onChange={(e) => setEditandoProduto({ ...editandoProduto, descricao: e.target.value })}
                    className="edit-textarea"
                    rows={2}
                  />
                  <input
                    type="number"
                    value={editandoProduto.preco}
                    onChange={(e) => setEditandoProduto({ ...editandoProduto, preco: e.target.value })}
                    className="edit-input"
                    step="0.01"
                  />
                  <div className="edit-actions">
                    <button onClick={salvarEdicao} className="btn-save">
                      Salvar
                    </button>
                    <button onClick={cancelarEdicao} className="btn-cancel">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="produto-header">
                    <h3>{produto.nome_produto}</h3>
                    <span className="categoria">{produto.categoria_produto}</span>
                  </div>
                  <p className="descricao">{produto.descricao}</p>
                  <div className="produto-info">
                    <span className="preco">R$ {Number.parseFloat(produto.preco).toFixed(2)}</span>
                    <span className="tempo">{produto.tempo_preparo} min</span>
                  </div>
                  <div className="produto-status">
                    <span className={`status ${produto.disponivel ? "disponivel" : "indisponivel"}`}>
                      {produto.disponivel ? "Disponível" : "Indisponível"}
                    </span>
                  </div>
                  <div className="produto-actions">
                    <button onClick={() => iniciarEdicao(produto)} className="btn-edit">
                      Editar
                    </button>
                    <button
                      onClick={() => alterarDisponibilidade(produto.id, !produto.disponivel)}
                      className={`btn-toggle ${produto.disponivel ? "btn-disable" : "btn-enable"}`}
                    >
                      {produto.disponivel ? "Desativar" : "Ativar"}
                    </button>
                    <button onClick={() => deletarProduto(produto.id)} className="btn-delete">
                      Deletar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="no-products">
            <p>Nenhum produto encontrado com os filtros selecionados.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default GerenciarCardapio
