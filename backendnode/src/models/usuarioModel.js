const { connect } = require("../config/db.js");

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
    await client.query(sql, [id]);
}

module.exports = {
    selectUsers,
    selectUser,
    insertUsuarios,
    updateUsuarios,
    deleteUsuario,
};
