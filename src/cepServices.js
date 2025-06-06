/**
 * Serviço para buscar informações de endereço a partir do CEP
 * Utiliza a API gratuita ViaCEP
 */

export const buscarCep = async (cep) => {
  // Remove caracteres não numéricos
  const cepLimpo = cep.replace(/\D/g, "")

  // Verifica se o CEP tem 8 dígitos
  if (cepLimpo.length !== 8) {
    throw new Error("CEP inválido. O CEP deve conter 8 dígitos.")
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
    const data = await response.json()

    // Verifica se o CEP existe
    if (data.erro) {
      throw new Error("CEP não encontrado.")
    }

    // Retorna os dados formatados
    return {
      cep: data.cep,
      logradouro: data.logradouro,
      complemento: data.complemento,
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf,
    }
  } catch (error) {
    console.error("Erro ao buscar CEP:", error)
    throw new Error("Não foi possível buscar o CEP. Tente novamente.")
  }
}

/**
 * Formata um CEP adicionando o hífen
 * Ex: 12345678 -> 12345-678
 */
export const formatarCep = (cep) => {
  const cepLimpo = cep.replace(/\D/g, "")
  if (cepLimpo.length === 8) {
    return cepLimpo.replace(/(\d{5})(\d{3})/, "$1-$2")
  }
  return cepLimpo
}

/**
 * Mascara para input de CEP
 * Limita a 9 caracteres (incluindo hífen) e formata automaticamente
 */
export const mascaraCep = (value) => {
  const cepLimpo = value.replace(/\D/g, "")
  if (cepLimpo.length <= 5) {
    return cepLimpo
  }
  return formatarCep(cepLimpo)
}
