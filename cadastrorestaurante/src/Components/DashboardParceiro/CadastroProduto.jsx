"use client"

import { useState } from "react"

const CadastroProduto = ({ restauranteId, onProdutoAdicionado }) => {
  const [formData, setFormData] = useState({
    nomeProduto: "",
    descricao: "",
    preco: "",
    categoriaProduto: "",
    tempoPreparo: "",
    ingredientes: "",
    informacoesNutricionais: "",
    imagemUrl: "",
    disponivel: true,
  })

  const [errors, setErrors] = useState({})
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    // Limpar erro do campo
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nomeProduto.trim()) {
      newErrors.nomeProduto = "Nome do produto é obrigatório"
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = "Descrição é obrigatória"
    }

    if (!formData.preco.trim()) {
      newErrors.preco = "Preço é obrigatório"
    } else if (isNaN(formData.preco) || Number.parseFloat(formData.preco) <= 0) {
      newErrors.preco = "Preço deve ser um número válido maior que zero"
    }

    if (!formData.categoriaProduto) {
      newErrors.categoriaProduto = "Categoria é obrigatória"
    }

    if (formData.tempoPreparo && (isNaN(formData.tempoPreparo) || Number.parseInt(formData.tempoPreparo) <= 0)) {
      newErrors.tempoPreparo = "Tempo de preparo deve ser um número válido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const produtoData = {
        ...formData,
        restauranteId: restauranteId,
        preco: Number.parseFloat(formData.preco),
        tempoPreparo: formData.tempoPreparo ? Number.parseInt(formData.tempoPreparo) : 30,
      }

      const response = await fetch("http://localhost:3001/api/produtos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(produtoData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao cadastrar produto")
      }

      // Limpar formulário
      setFormData({
        nomeProduto: "",
        descricao: "",
        preco: "",
        categoriaProduto: "",
        tempoPreparo: "",
        ingredientes: "",
        informacoesNutricionais: "",
        imagemUrl: "",
        disponivel: true,
      })

      // Notificar componente pai
      onProdutoAdicionado()

      alert("Produto cadastrado com sucesso!")
    } catch (error) {
      setErrors({
        submit: error.message || "Erro ao cadastrar produto. Tente novamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cadastro-produto">
      <h2>Cadastrar Novo Produto</h2>

      <form onSubmit={handleSubmit} className="produto-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nomeProduto">Nome do Produto *</label>
            <input
              type="text"
              id="nomeProduto"
              name="nomeProduto"
              value={formData.nomeProduto}
              onChange={handleChange}
              className={errors.nomeProduto ? "error" : ""}
              placeholder="Ex: Hambúrguer Artesanal"
            />
            {errors.nomeProduto && <span className="error-message">{errors.nomeProduto}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="categoriaProduto">Categoria *</label>
            <select
              id="categoriaProduto"
              name="categoriaProduto"
              value={formData.categoriaProduto}
              onChange={handleChange}
              className={errors.categoriaProduto ? "error" : ""}
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
            {errors.categoriaProduto && <span className="error-message">{errors.categoriaProduto}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="descricao">Descrição *</label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            className={errors.descricao ? "error" : ""}
            placeholder="Descreva seu produto..."
            rows={3}
          />
          {errors.descricao && <span className="error-message">{errors.descricao}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="preco">Preço (R$) *</label>
            <input
              type="number"
              id="preco"
              name="preco"
              value={formData.preco}
              onChange={handleChange}
              className={errors.preco ? "error" : ""}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            {errors.preco && <span className="error-message">{errors.preco}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="tempoPreparo">Tempo de Preparo (min)</label>
            <input
              type="number"
              id="tempoPreparo"
              name="tempoPreparo"
              value={formData.tempoPreparo}
              onChange={handleChange}
              className={errors.tempoPreparo ? "error" : ""}
              placeholder="30"
              min="1"
            />
            {errors.tempoPreparo && <span className="error-message">{errors.tempoPreparo}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="ingredientes">Ingredientes</label>
          <textarea
            id="ingredientes"
            name="ingredientes"
            value={formData.ingredientes}
            onChange={handleChange}
            placeholder="Liste os ingredientes principais..."
            rows={2}
          />
        </div>

        <div className="form-group">
          <label htmlFor="imagemUrl">URL da Imagem</label>
          <input
            type="url"
            id="imagemUrl"
            name="imagemUrl"
            value={formData.imagemUrl}
            onChange={handleChange}
            placeholder="https://exemplo.com/imagem.jpg"
          />
        </div>

        <div className="form-group">
          <label htmlFor="informacoesNutricionais">Informações Nutricionais</label>
          <textarea
            id="informacoesNutricionais"
            name="informacoesNutricionais"
            value={formData.informacoesNutricionais}
            onChange={handleChange}
            placeholder="Calorias, proteínas, carboidratos..."
            rows={2}
          />
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input type="checkbox" name="disponivel" checked={formData.disponivel} onChange={handleChange} />
            Produto disponível para venda
          </label>
        </div>

        {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

        <div className="form-buttons">
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar Produto"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CadastroProduto
