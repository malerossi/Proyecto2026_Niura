const pkg = require("pg");
const { Pool } = pkg;

const pool = new Pool({
  host: "ep-frosty-queen-acwcglms-pooler.sa-east-1.aws.neon.tech",
  user: "neondb_owner",
  password: "npg_0s3dhjYEXely",
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

module.exports = { pool, query }; 