const pkg = require("pg");
const { Pool } = pkg;
const dotenv = require("dotenv");

const pool = new Pool({
  host: process.env.DATABASE_HOST_NAME,
  user: process.env.DATABASE_OWNER_NAME,
  password: process.env.DATABASE_PASSWORD,
  database: "neondb",
  port: 5432,
  ssl: true,                       
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const query = (text, params = []) => pool.query(text, params)

async function withTransaction(callback) {
  const client = await pool.connect()
  try {
      await client.query('BEGIN')
      const result = await callback(client)
      await client.query('COMMIT')
      return result
  } catch (err) {
      await client.query('ROLLBACK')
      throw err
  } finally {
      client.release()
  }
}


module.exports = { pool, query, withTransaction }