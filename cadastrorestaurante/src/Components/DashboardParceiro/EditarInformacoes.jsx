import { useState } from "react"

const EditarInformacoes = ({ restauranteData, onRestauranteAtualizado }) => {
  const [formData, setFormData] = useState({
    nome_restaurante: restauranteData.nome_restaurante || "",
    cnpj: restauranteData.cnpj || "",
    telefone: restauranteData.telefone || "",
    email: restauranteData.email || "",
    categoria: restauranteData.categoria || "",
    cep: restauranteData.cep || "",
    rua: restauranteData.rua || "",
    numero: restauranteData.numero || "",
    complemento: restauranteData.complemento || "",
    bairro: restauranteData.bairro || "",
    cidade: restauranteData.cidade || "",
    estado: restauranteData.estado || "",
    nome_responsavel: restauranteData.nome_responsavel || "",
    cpf_responsavel: restauranteData.cpf_responsavel || "",
    telefone_responsavel: restauranteData.telefone_responsavel || "",
    email_responsavel: restauranteData.email_responsavel || "",
    banco: restauranteData.banco || "",
    agencia: restauranteData.agencia || "",
    conta: restauranteData.conta || "",
    tipo_conta: restauranteData.tipo_conta || "",
    imagem: restauranteData.imagem || "",
    senha: "",
    confirmarSenha: "",
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [imagemPreview, setImagemPreview] = useState(restauranteData.imagem || "")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Verificar se é uma imagem
      if (!file.type.startsWith("image/")) {
        setMessage("Por favor, selecione apenas arquivos de imagem.")
        return
      }

      // Verificar tamanho do arquivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage("A imagem deve ter no máximo 5MB.")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target.result
        setFormData((prev) => ({
          ...prev,
          imagem: base64,
        }))
        setImagemPreview(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.senha && formData.senha !== formData.confirmarSenha) {
      setMessage("As senhas não coincidem!")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const dadosParaEnviar = { ...formData }

      // Remove campos de confirmação e senha vazia
      delete dadosParaEnviar.confirmarSenha
      if (!dadosParaEnviar.senha) {
        delete dadosParaEnviar.senha
      }

      const response = await fetch(`http://localhost:3001/api/restaurantes/${restauranteData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosParaEnviar),
      })

      const data = await response.json()

      if (data.success) {
        setMessage("Informações atualizadas com sucesso!")
        onRestauranteAtualizado({ ...restauranteData, ...dadosParaEnviar })

        // Limpar campos de senha
        setFormData((prev) => ({
          ...prev,
          senha: "",
          confirmarSenha: "",
        }))
      } else {
        setMessage(data.message || "Erro ao atualizar informações")
      }
    } catch (error) {
      console.error("Erro ao atualizar informações:", error)
      setMessage("Erro ao atualizar informações")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="editar-informacoes">
      <h2>Editar Informações do Restaurante</h2>

      {message && <div className={`message ${message.includes("sucesso") ? "success" : "error"}`}>{message}</div>}

      <form onSubmit={handleSubmit} className="edit-form">
        {/* Foto do Restaurante */}
        <div className="form-section">
          <h3>Foto do Restaurante</h3>
          <div className="image-upload-section">
            <div className="current-image">
              {imagemPreview ? (
                <img
                  src={imagemPreview || "/placeholder.svg"}
                  alt="Foto do restaurante"
                  className="restaurant-image-preview"
                />
              ) : (
                <div className="no-image-placeholder">
                  <span>Nenhuma foto selecionada</span>
                </div>
              )}
            </div>
            <div className="image-upload-controls">
              <label htmlFor="imagem-upload" className="upload-btn">
                Escolher Foto
              </label>
              <input
                id="imagem-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <small>Formatos aceitos: JPG, PNG, GIF (máximo 5MB)</small>
            </div>
          </div>
        </div>

        {/* Dados do Restaurante */}
        <div className="form-section">
          <h3>Dados do Restaurante</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nome do Restaurante *</label>
              <input
                type="text"
                name="nome_restaurante"
                value={formData.nome_restaurante}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>CNPJ *</label>
              <input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Telefone *</label>
              <input type="tel" name="telefone" value={formData.telefone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Categoria</label>
            <input
              type="text"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              placeholder="Ex: Hamburgueria, Pizzaria, etc."
            />
          </div>
        </div>

        {/* Endereço */}
        <div className="form-section">
          <h3>Endereço</h3>
          <div className="form-row">
            <div className="form-group">
              <label>CEP *</label>
              <input type="text" name="cep" value={formData.cep} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Rua *</label>
              <input type="text" name="rua" value={formData.rua} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Número *</label>
              <input type="text" name="numero" value={formData.numero} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Complemento</label>
              <input type="text" name="complemento" value={formData.complemento} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Bairro *</label>
              <input type="text" name="bairro" value={formData.bairro} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Cidade *</label>
              <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Estado *</label>
            <select name="estado" value={formData.estado} onChange={handleChange} required>
              <option value="">Selecione o estado</option>
              <option value="AC">Acre</option>
              <option value="AL">Alagoas</option>
              <option value="AP">Amapá</option>
              <option value="AM">Amazonas</option>
              <option value="BA">Bahia</option>
              <option value="CE">Ceará</option>
              <option value="DF">Distrito Federal</option>
              <option value="ES">Espírito Santo</option>
              <option value="GO">Goiás</option>
              <option value="MA">Maranhão</option>
              <option value="MT">Mato Grosso</option>
              <option value="MS">Mato Grosso do Sul</option>
              <option value="MG">Minas Gerais</option>
              <option value="PA">Pará</option>
              <option value="PB">Paraíba</option>
              <option value="PR">Paraná</option>
              <option value="PE">Pernambuco</option>
              <option value="PI">Piauí</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="RN">Rio Grande do Norte</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="RO">Rondônia</option>
              <option value="RR">Roraima</option>
              <option value="SC">Santa Catarina</option>
              <option value="SP">São Paulo</option>
              <option value="SE">Sergipe</option>
              <option value="TO">Tocantins</option>
            </select>
          </div>
        </div>

        {/* Dados do Responsável */}
        <div className="form-section">
          <h3>Dados do Responsável</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nome do Responsável *</label>
              <input
                type="text"
                name="nome_responsavel"
                value={formData.nome_responsavel}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>CPF do Responsável *</label>
              <input
                type="text"
                name="cpf_responsavel"
                value={formData.cpf_responsavel}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Telefone do Responsável *</label>
              <input
                type="tel"
                name="telefone_responsavel"
                value={formData.telefone_responsavel}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email do Responsável *</label>
              <input
                type="email"
                name="email_responsavel"
                value={formData.email_responsavel}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Dados Bancários */}
        <div className="form-section">
          <h3>Dados Bancários</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Banco *</label>
              <input type="text" name="banco" value={formData.banco} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Agência *</label>
              <input type="text" name="agencia" value={formData.agencia} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Conta *</label>
              <input type="text" name="conta" value={formData.conta} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Tipo de Conta *</label>
              <select name="tipo_conta" value={formData.tipo_conta} onChange={handleChange} required>
                <option value="">Selecione</option>
                <option value="corrente">Conta Corrente</option>
                <option value="poupanca">Conta Poupança</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alterar Senha */}
        <div className="form-section">
          <h3>Alterar Senha (opcional)</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nova Senha</label>
              <input
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="Deixe em branco para manter a senha atual"
              />
            </div>
            <div className="form-group">
              <label>Confirmar Nova Senha</label>
              <input
                type="password"
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                placeholder="Confirme a nova senha"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="save-btn">
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>

      <style jsx>{`
        .editar-informacoes {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }

        .editar-informacoes h2 {
          color: #333;
          margin-bottom: 20px;
          text-align: center;
        }

        .message {
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
          text-align: center;
        }

        .message.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .edit-form {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .form-section {
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .form-section:last-child {
          border-bottom: none;
        }

        .form-section h3 {
          color: #ea1d2c;
          margin-bottom: 15px;
          font-size: 18px;
        }

        .image-upload-section {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }

        .current-image {
          flex-shrink: 0;
        }

        .restaurant-image-preview {
          width: 150px;
          height: 150px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #ddd;
        }

        .no-image-placeholder {
          width: 150px;
          height: 150px;
          border: 2px dashed #ddd;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-size: 14px;
          text-align: center;
        }

        .image-upload-controls {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .upload-btn {
          background-color: #ea1d2c;
          color: white;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          text-align: center;
          transition: background-color 0.2s;
          display: inline-block;
          width: fit-content;
        }

        .upload-btn:hover {
          background-color: #d1001c;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: 500;
          margin-bottom: 5px;
          color: #333;
        }

        .form-group input,
        .form-group select {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #ea1d2c;
          box-shadow: 0 0 0 2px rgba(234, 29, 44, 0.1);
        }

        .form-actions {
          padding: 20px;
          text-align: center;
          background-color: #f8f9fa;
        }

        .save-btn {
          background-color: #ea1d2c;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .save-btn:hover:not(:disabled) {
          background-color: #d1001c;
        }

        .save-btn:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .editar-informacoes {
            padding: 10px;
          }

          .image-upload-section {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  )
}

export default EditarInformacoes






