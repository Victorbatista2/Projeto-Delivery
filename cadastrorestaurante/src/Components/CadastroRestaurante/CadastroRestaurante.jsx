import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./CadastroRestaurante.css"

const CadastroRestaurante = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Dados do restaurante
    nomeRestaurante: "",
    cnpj: "",
    telefone: "",
    email: "",

    // Dados do endereço
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",

    // Dados do responsável
    nomeResponsavel: "",
    cpfResponsavel: "",
    telefoneResponsavel: "",
    emailResponsavel: "",

    // Dados bancários
    banco: "",
    agencia: "",
    conta: "",
    tipoConta: "corrente",

    // Dados de acesso
    senha: "",
    confirmarSenha: "",
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    // Limpar erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      })
    }
  }

  const validateStep = (currentStep) => {
    const newErrors = {}

    if (currentStep === 1) {
      if (!formData.nomeRestaurante.trim()) {
        newErrors.nomeRestaurante = "Nome do restaurante é obrigatório"
      }

      if (!formData.cnpj.trim()) {
        newErrors.cnpj = "CNPJ é obrigatório"
      } else if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(formData.cnpj)) {
        newErrors.cnpj = "CNPJ inválido. Use o formato: 00.000.000/0000-00"
      }

      if (!formData.telefone.trim()) {
        newErrors.telefone = "Telefone é obrigatório"
      }

      if (!formData.email.trim()) {
        newErrors.email = "E-mail é obrigatório"
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "E-mail inválido"
      }
    } else if (currentStep === 2) {
      if (!formData.cep.trim()) {
        newErrors.cep = "CEP é obrigatório"
      }

      if (!formData.rua.trim()) {
        newErrors.rua = "Rua é obrigatória"
      }

      if (!formData.numero.trim()) {
        newErrors.numero = "Número é obrigatório"
      }

      if (!formData.bairro.trim()) {
        newErrors.bairro = "Bairro é obrigatório"
      }

      if (!formData.cidade.trim()) {
        newErrors.cidade = "Cidade é obrigatória"
      }

      if (!formData.estado.trim()) {
        newErrors.estado = "Estado é obrigatório"
      }
    } else if (currentStep === 3) {
      if (!formData.nomeResponsavel.trim()) {
        newErrors.nomeResponsavel = "Nome do responsável é obrigatório"
      }

      if (!formData.cpfResponsavel.trim()) {
        newErrors.cpfResponsavel = "CPF é obrigatório"
      } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpfResponsavel)) {
        newErrors.cpfResponsavel = "CPF inválido. Use o formato: 000.000.000-00"
      }

      if (!formData.telefoneResponsavel.trim()) {
        newErrors.telefoneResponsavel = "Telefone é obrigatório"
      }

      if (!formData.emailResponsavel.trim()) {
        newErrors.emailResponsavel = "E-mail é obrigatório"
      } else if (!/\S+@\S+\.\S+/.test(formData.emailResponsavel)) {
        newErrors.emailResponsavel = "E-mail inválido"
      }
    } else if (currentStep === 4) {
      if (!formData.banco.trim()) {
        newErrors.banco = "Banco é obrigatório"
      }

      if (!formData.agencia.trim()) {
        newErrors.agencia = "Agência é obrigatória"
      }

      if (!formData.conta.trim()) {
        newErrors.conta = "Conta é obrigatória"
      }
    } else if (currentStep === 5) {
      if (!formData.senha.trim()) {
        newErrors.senha = "Senha é obrigatória"
      } else if (formData.senha.length < 8) {
        newErrors.senha = "A senha deve ter pelo menos 8 caracteres"
      }

      if (!formData.confirmarSenha.trim()) {
        newErrors.confirmarSenha = "Confirme sua senha"
      } else if (formData.senha !== formData.confirmarSenha) {
        newErrors.confirmarSenha = "As senhas não coincidem"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
    window.scrollTo(0, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateStep(step)) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch("http://localhost:3001/api/restaurantes/cadastro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao cadastrar restaurante")
      }

      // Redirecionar para página de sucesso
      navigate("/cadastro-sucesso")
    } catch (error) {
      setErrors({
        submit: error.message || "Ocorreu um erro ao processar seu cadastro. Tente novamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  const buscarCep = async () => {
    if (!formData.cep || formData.cep.length !== 8) {
      setErrors({
        ...errors,
        cep: "CEP inválido. Digite apenas os 8 números.",
      })
      return
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${formData.cep}/json/`)
      const data = await response.json()

      if (data.erro) {
        setErrors({
          ...errors,
          cep: "CEP não encontrado",
        })
        return
      }

      setFormData({
        ...formData,
        rua: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf,
      })
    } catch (error) {
      setErrors({
        ...errors,
        cep: "Erro ao buscar CEP",
      })
    }
  }

  const formatCNPJ = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1")
  }

  const formatCPF = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1")
  }

  const formatPhone = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1")
  }

  const handleCNPJChange = (e) => {
    const formattedValue = formatCNPJ(e.target.value)
    setFormData({
      ...formData,
      cnpj: formattedValue,
    })
  }

  const handleCPFChange = (e) => {
    const formattedValue = formatCPF(e.target.value)
    setFormData({
      ...formData,
      cpfResponsavel: formattedValue,
    })
  }

  const handlePhoneChange = (e, field) => {
    const formattedValue = formatPhone(e.target.value)
    setFormData({
      ...formData,
      [field]: formattedValue,
    })
  }

  const handleCepChange = (e) => {
    const value = e.target.value.replace(/\D/g, "")
    setFormData({
      ...formData,
      cep: value,
    })
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="form-step">
            <h2>Dados do Restaurante</h2>
            <p className="step-description">Informe os dados do seu estabelecimento</p>

            <div className="form-group">
              <label htmlFor="nomeRestaurante">Nome do Restaurante *</label>
              <input
                type="text"
                id="nomeRestaurante"
                name="nomeRestaurante"
                value={formData.nomeRestaurante}
                onChange={handleChange}
                className={errors.nomeRestaurante ? "error" : ""}
              />
              {errors.nomeRestaurante && <span className="error-message">{errors.nomeRestaurante}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cnpj">CNPJ *</label>
              <input
                type="text"
                id="cnpj"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleCNPJChange}
                maxLength={18}
                placeholder="00.000.000/0000-00"
                className={errors.cnpj ? "error" : ""}
              />
              {errors.cnpj && <span className="error-message">{errors.cnpj}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="telefone">Telefone do Restaurante *</label>
              <input
                type="text"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={(e) => handlePhoneChange(e, "telefone")}
                maxLength={15}
                placeholder="(00) 00000-0000"
                className={errors.telefone ? "error" : ""}
              />
              {errors.telefone && <span className="error-message">{errors.telefone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail do Restaurante *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-buttons">
              <button type="button" className="btn-next" onClick={nextStep}>
                Continuar
              </button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="form-step">
            <h2>Endereço do Restaurante</h2>
            <p className="step-description">Informe o endereço do seu estabelecimento</p>

            <div className="form-group">
              <label htmlFor="cep">CEP *</label>
              <div className="cep-container">
                <input
                  type="text"
                  id="cep"
                  name="cep"
                  value={formData.cep}
                  onChange={handleCepChange}
                  maxLength={8}
                  placeholder="00000000"
                  className={errors.cep ? "error" : ""}
                />
                <button type="button" className="btn-buscar-cep" onClick={buscarCep}>
                  Buscar
                </button>
              </div>
              {errors.cep && <span className="error-message">{errors.cep}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="rua">Rua *</label>
              <input
                type="text"
                id="rua"
                name="rua"
                value={formData.rua}
                onChange={handleChange}
                className={errors.rua ? "error" : ""}
              />
              {errors.rua && <span className="error-message">{errors.rua}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="numero">Número *</label>
                <input
                  type="text"
                  id="numero"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  className={errors.numero ? "error" : ""}
                />
                {errors.numero && <span className="error-message">{errors.numero}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="complemento">Complemento</label>
                <input
                  type="text"
                  id="complemento"
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bairro">Bairro *</label>
              <input
                type="text"
                id="bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                className={errors.bairro ? "error" : ""}
              />
              {errors.bairro && <span className="error-message">{errors.bairro}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cidade">Cidade *</label>
                <input
                  type="text"
                  id="cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  className={errors.cidade ? "error" : ""}
                />
                {errors.cidade && <span className="error-message">{errors.cidade}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="estado">Estado *</label>
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className={errors.estado ? "error" : ""}
                >
                  <option value="">Selecione</option>
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
                {errors.estado && <span className="error-message">{errors.estado}</span>}
              </div>
            </div>

            <div className="form-buttons">
              <button type="button" className="btn-back" onClick={prevStep}>
                Voltar
              </button>
              <button type="button" className="btn-next" onClick={nextStep}>
                Continuar
              </button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="form-step">
            <h2>Dados do Responsável</h2>
            <p className="step-description">Informe os dados do responsável pelo restaurante</p>

            <div className="form-group">
              <label htmlFor="nomeResponsavel">Nome Completo *</label>
              <input
                type="text"
                id="nomeResponsavel"
                name="nomeResponsavel"
                value={formData.nomeResponsavel}
                onChange={handleChange}
                className={errors.nomeResponsavel ? "error" : ""}
              />
              {errors.nomeResponsavel && <span className="error-message">{errors.nomeResponsavel}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cpfResponsavel">CPF *</label>
              <input
                type="text"
                id="cpfResponsavel"
                name="cpfResponsavel"
                value={formData.cpfResponsavel}
                onChange={handleCPFChange}
                maxLength={14}
                placeholder="000.000.000-00"
                className={errors.cpfResponsavel ? "error" : ""}
              />
              {errors.cpfResponsavel && <span className="error-message">{errors.cpfResponsavel}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="telefoneResponsavel">Telefone *</label>
              <input
                type="text"
                id="telefoneResponsavel"
                name="telefoneResponsavel"
                value={formData.telefoneResponsavel}
                onChange={(e) => handlePhoneChange(e, "telefoneResponsavel")}
                maxLength={15}
                placeholder="(00) 00000-0000"
                className={errors.telefoneResponsavel ? "error" : ""}
              />
              {errors.telefoneResponsavel && <span className="error-message">{errors.telefoneResponsavel}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="emailResponsavel">E-mail *</label>
              <input
                type="email"
                id="emailResponsavel"
                name="emailResponsavel"
                value={formData.emailResponsavel}
                onChange={handleChange}
                className={errors.emailResponsavel ? "error" : ""}
              />
              {errors.emailResponsavel && <span className="error-message">{errors.emailResponsavel}</span>}
            </div>

            <div className="form-buttons">
              <button type="button" className="btn-back" onClick={prevStep}>
                Voltar
              </button>
              <button type="button" className="btn-next" onClick={nextStep}>
                Continuar
              </button>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="form-step">
            <h2>Dados Bancários</h2>
            <p className="step-description">Informe os dados bancários para recebimento</p>

            <div className="form-group">
              <label htmlFor="banco">Banco *</label>
              <select
                id="banco"
                name="banco"
                value={formData.banco}
                onChange={handleChange}
                className={errors.banco ? "error" : ""}
              >
                <option value="">Selecione o banco</option>
                <option value="001">Banco do Brasil</option>
                <option value="104">Caixa Econômica Federal</option>
                <option value="033">Santander</option>
                <option value="341">Itaú</option>
                <option value="237">Bradesco</option>
                <option value="260">Nubank</option>
                <option value="077">Inter</option>
                <option value="336">C6 Bank</option>
                <option value="212">Banco Original</option>
                <option value="655">Votorantim</option>
                <option value="041">Banrisul</option>
                <option value="748">Sicredi</option>
                <option value="756">Sicoob</option>
                <option value="outros">Outros</option>
              </select>
              {errors.banco && <span className="error-message">{errors.banco}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="agencia">Agência *</label>
                <input
                  type="text"
                  id="agencia"
                  name="agencia"
                  value={formData.agencia}
                  onChange={handleChange}
                  className={errors.agencia ? "error" : ""}
                />
                {errors.agencia && <span className="error-message">{errors.agencia}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="conta">Conta *</label>
                <input
                  type="text"
                  id="conta"
                  name="conta"
                  value={formData.conta}
                  onChange={handleChange}
                  className={errors.conta ? "error" : ""}
                />
                {errors.conta && <span className="error-message">{errors.conta}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Tipo de Conta *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="tipoConta"
                    value="corrente"
                    checked={formData.tipoConta === "corrente"}
                    onChange={handleChange}
                  />
                  Conta Corrente
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="tipoConta"
                    value="poupanca"
                    checked={formData.tipoConta === "poupanca"}
                    onChange={handleChange}
                  />
                  Conta Poupança
                </label>
              </div>
            </div>

            <div className="form-buttons">
              <button type="button" className="btn-back" onClick={prevStep}>
                Voltar
              </button>
              <button type="button" className="btn-next" onClick={nextStep}>
                Continuar
              </button>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="form-step">
            <h2>Dados de Acesso</h2>
            <p className="step-description">Crie sua senha para acessar o sistema</p>

            <div className="form-group">
              <label htmlFor="senha">Senha *</label>
              <input
                type="password"
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                className={errors.senha ? "error" : ""}
              />
              {errors.senha && <span className="error-message">{errors.senha}</span>}
              <small className="password-hint">A senha deve ter pelo menos 8 caracteres</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmarSenha">Confirmar Senha *</label>
              <input
                type="password"
                id="confirmarSenha"
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                className={errors.confirmarSenha ? "error" : ""}
              />
              {errors.confirmarSenha && <span className="error-message">{errors.confirmarSenha}</span>}
            </div>

            {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

            <div className="form-buttons">
              <button type="button" className="btn-back" onClick={prevStep}>
                Voltar
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "Processando..." : "Finalizar Cadastro"}
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="cadastro-restaurante-container">
      <div className="cadastro-header">
        <div className="logo-container">
          <svg viewBox="0 0 80 24" className="ifood-logo">
            <path
              d="M6.4 0h10.4v6.4H6.4V0zm0 9.6h10.4V16H6.4V9.6zm13.6-9.6H30v6.4H20V0zM0 0h3.2v22.4H0V0zm20 9.6h10.4V16H20V9.6zm-13.6 9.6h24v3.2h-24v-3.2zm30.4-19.2c-1.76 0-3.2 1.44-3.2 3.2v19.2h6.4V3.2c0-1.76-1.44-3.2-3.2-3.2zm7.2 0v22.4h6.4v-8h6.4v8h6.4V0h-6.4v8h-6.4V0h-6.4zm27.2 0c-1.76 0-3.2 1.44-3.2 3.2v19.2h6.4V3.2c0-1.76-1.44-3.2-3.2-3.2z"
              fill="#ea1d2c"
            ></path>
          </svg>
        </div>
        <h1>Cadastro de Restaurante</h1>
      </div>

      <div className="progress-bar">
        <div className="progress-steps">
          <div className={`progress-step ${step >= 1 ? "active" : ""}`}>
            <div className="step-number">1</div>
            <span className="step-text">Dados do Restaurante</span>
          </div>
          <div className={`progress-step ${step >= 2 ? "active" : ""}`}>
            <div className="step-number">2</div>
            <span className="step-text">Endereço</span>
          </div>
          <div className={`progress-step ${step >= 3 ? "active" : ""}`}>
            <div className="step-number">3</div>
            <span className="step-text">Responsável</span>
          </div>
          <div className={`progress-step ${step >= 4 ? "active" : ""}`}>
            <div className="step-number">4</div>
            <span className="step-text">Dados Bancários</span>
          </div>
          <div className={`progress-step ${step >= 5 ? "active" : ""}`}>
            <div className="step-number">5</div>
            <span className="step-text">Acesso</span>
          </div>
        </div>
        <div className="progress-bar-fill" style={{ width: `${(step / 5) * 100}%` }}></div>
      </div>

      <div className="cadastro-content">
        <div className="form-container">
          <form onSubmit={handleSubmit}>{renderStep()}</form>
        </div>

        <div className="benefits-container">
          <div className="benefits-content">
            <h3>Vantagens de ser um parceiro iFood</h3>
            <ul className="benefits-list">
              <li>
                <div className="benefit-icon">📈</div>
                <div className="benefit-text">
                  <h4>Aumente suas vendas</h4>
                  <p>Alcance milhões de clientes em potencial</p>
                </div>
              </li>
              <li>
                <div className="benefit-icon">🚀</div>
                <div className="benefit-text">
                  <h4>Gestão simplificada</h4>
                  <p>Ferramentas para gerenciar seu negócio</p>
                </div>
              </li>
              <li>
                <div className="benefit-icon">📱</div>
                <div className="benefit-text">
                  <h4>Visibilidade online</h4>
                  <p>Seu restaurante disponível 24h por dia</p>
                </div>
              </li>
              <li>
                <div className="benefit-icon">💰</div>
                <div className="benefit-text">
                  <h4>Pagamentos seguros</h4>
                  <p>Receba seus pagamentos de forma rápida e segura</p>
                </div>
              </li>
              <li>
                <div className="benefit-icon">📊</div>
                <div className="benefit-text">
                  <h4>Relatórios detalhados</h4>
                  <p>Acompanhe o desempenho do seu negócio</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CadastroRestaurante


