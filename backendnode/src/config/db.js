require('dotenv').config();
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:426715@localhost:5432/postgres',
});

async function connect() {
    if (global.connection) return global.connection.connect();

    try {
        const client = await pool.connect();
        console.log("Conectado ao banco de dados");
        global.connection = pool;
        return client;
    } catch (err) {
        console.error("Erro ao conectar ao banco de dados:", err);
        throw err;
    }
}

module.exports = { connect };



