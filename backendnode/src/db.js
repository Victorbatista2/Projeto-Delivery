require('dotenv').config();

const { Pool } = require("pg");
const pool = new Pool({
    connectionString: 'postgresql://postgres:1234@localhost:5432/Projeto_Ifood',
});

async function connect() {
    if(global.connection) return global.connection.connect();

    try {
        const client = await pool.connect();
        console.log("Conectado ao banco de dados");

        const res = await client.query("SELECT NOW()");
        console.log(res.rows[0]);

        global.connection = pool;
        return pool.connect();
    } catch (err) {
        console.error("Erro ao conectar ao banco de dados:", err);
        throw err;
    }
}

async function selectUsers() {
    const client = await connect();
    const res = await client.query("SELECT * FROM Usuario");
    return res.rows;
}

async function selectUser(id) {
    const client = await connect();
    const res = await client.query("SELECT * FROM Usuario WHERE id=$1", [id]);
    return res.rows[0];
}

async function insertUsuarios(Usuario) {
    const client = await connect();
    const sql = "INSERT INTO Usuario(Nome, Sobrenome, Email, Senha, ativo) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const values = [Usuario.nome, Usuario.sobrenome, Usuario.email, Usuario.senha, Usuario.ativo];
    const result = await client.query(sql, values);
    return result.rows[0];
}

async function updateUsuarios(id, Usuario) {
    const client = await connect();
    const sql = "UPDATE Usuario SET Nome=$1, Sobrenome=$2, Email=$3, Senha=$4, ativo=$5 WHERE id=$6";
    const values = [Usuario.nome, Usuario.sobrenome, Usuario.email, Usuario.senha, Usuario.ativo, id];
    await client.query(sql, values);
}

async function deleteUsuario(id) {
    const client = await connect();
    const sql = "DELETE FROM Usuario WHERE id=$1";
    const values = [id];
    await client.query(sql, values);
}

module.exports = {
    selectUsers,
    selectUser,
    insertUsuarios,
    updateUsuarios,
    deleteUsuario,
};