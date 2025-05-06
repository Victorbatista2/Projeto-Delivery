async function connect(){

    if(global.connection)
        return global.connection.connect();

    const { Pool } = require("pg");
    const pool = new Pool({
        connectionString: process.env.CONNECTION_STRING,
    })

    const client = await pool.connect();
    console.log("Criou pool de coneao")

    const res = await client.query("select now()")
    console.log(res.rows[0]);

    global.connection = pool;
    return pool.connect();
}

connect();

async function selectUsers(){
    const client = await connect();
    const res = await client.query("SELECT * FROM Usuario");
    return res.rows;
}

async function selectUser(id){
    const client = await connect();
    const res = await client.query("SELECT * FROM Usuario WHERE ID=$1", [id]);
    return res.rows;
}

async function insertUsuarios(Usuario){
    const client = await connect();
    const sql = "INSERT INTO Usuario(Nome,Sobrenome,Email,Senha,ativo) VALUES ($1, $2, $3, $4, $5)"
    const values = [Usuario.nome, Usuario.sobrenome, Usuario.email, Usuario.senha, Usuario.ativo];
    await client.query(sql, values);
}

async function updateUsuarios(id, Usuario){
    const client = await connect();
    const sql = "UPDATE Usuario SET Nome=$1, Sobrenome=$2, Email=$3, Senha=$4, ativo=$5 WHERE id=$6";
    const values = [Usuario.nome, Usuario.sobrenome, Usuario.email, Usuario.senha, Usuario.ativo, id];
    await client.query(sql, values);
}

async function deleteUsuario(id,){
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
    deleteUsuario
};