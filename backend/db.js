const pkg = require("pg");
const { Pool } = pkg;
const dotenv = require("dotenv");

const pool = new Pool({
  host: process.env.DATABASE_HOST_NAME,
  user: process.env.DATABASE_OWNER_NAME,
  password: process.env.DATABASE_PASSWORD,
  database: "neondb",
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
  channelBinding: "require",
});

const query = async (text, params = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

module.exports = { pool, query }