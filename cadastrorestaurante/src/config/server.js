const express = require("express");
const { connect } = require("backendnode/src/config/db.js"); 
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Rota de cadastro
app.post("/api/restaurantes/cadastro", async (req, res) => {
  const client = await connect();
  try {
    const {
      nomeRestaurante,
      cnpj,
      telefone,
      email,
      categoria,
      cep,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      nomeResponsavel,
      cpfResponsavel,
      telefoneResponsavel,
      emailResponsavel,
      banco,
      agencia,
      conta,
      tipoConta,
      senha,
    } = req.body;

    // Validação básica (adicione mais conforme necessário)
    if (!nomeRestaurante || !cnpj || !email) {
      return res.status(400).json({ error: "Campos obrigatórios faltando" });
    }

    // Inserção no banco de dados
    const query = `
      INSERT INTO restaurantes (
        nome, cnpj, telefone, email, categoria,
        cep, rua, numero, complemento, bairro, cidade, estado,
        responsavel_nome, responsavel_cpf, responsavel_telefone, responsavel_email,
        banco, agencia, conta, tipo_conta, senha
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING id;
    `;

    const values = [
      nomeRestaurante, cnpj, telefone, email, categoria,
      cep, rua, numero, complemento, bairro, cidade, estado,
      nomeResponsavel, cpfResponsavel, telefoneResponsavel, emailResponsavel,
      banco, agencia, conta, tipoConta, senha,
    ];

    const result = await client.query(query, values);
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error("Erro no cadastro:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  } finally {
    client.release();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});