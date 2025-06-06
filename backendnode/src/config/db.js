require("dotenv").config()
const { Pool } = require("pg")

// Configuração mais conservadora do pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:1234@localhost:5432/Projeto_Ifood",
  max: 10, // Reduzir para evitar sobrecarga
  min: 2, // Manter algumas conexões sempre ativas
  idleTimeoutMillis: 10000, // Reduzir tempo idle
  connectionTimeoutMillis: 5000, // Reduzir timeout de conexão
  acquireTimeoutMillis: 10000,
  createTimeoutMillis: 5000,
  destroyTimeoutMillis: 2000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 200,
  allowExitOnIdle: true,
})

// Event listeners para debug
pool.on("connect", (client) => {
  console.log(
    `Nova conexão estabelecida. Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount}`,
  )
})

pool.on("acquire", (client) => {
  console.log(`Conexão adquirida. Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount}`)
})

pool.on("release", (client) => {
  console.log(`Conexão liberada. Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount}`)
})

pool.on("error", (err, client) => {
  console.error("Erro inesperado no cliente idle:", err)
})

// Função para executar queries diretamente no pool
async function query(text, params) {
  const start = Date.now()
  try {
    console.log(`Executando query: ${text.substring(0, 50)}...`)
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log(`Query executada em ${duration}ms, retornou ${res.rowCount} linhas`)
    return res
  } catch (err) {
    console.error("Erro na query:", err)
    throw err
  }
}

// Função para transações
async function transaction(callback) {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }
}

// Função para verificar status do pool
function getPoolStatus() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  }
}

// Função para fechar o pool quando necessário
async function closePool() {
  try {
    await pool.end()
    console.log("Pool de conexões fechado")
  } catch (err) {
    console.error("Erro ao fechar pool:", err)
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Recebido SIGINT, fechando pool de conexões...")
  await closePool()
  process.exit(0)
})

process.on("SIGTERM", async () => {
  console.log("Recebido SIGTERM, fechando pool de conexões...")
  await closePool()
  process.exit(0)
})

module.exports = { pool, query, transaction, getPoolStatus, closePool }


