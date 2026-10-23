require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

const { query, pool } = require('./db')

query('SELECT now() AS ahora, current_user AS usuario')
    .then(r => console.log('Conexión OK:', r.rows[0]))
    .catch(e => console.error('Falló la conexión:', e.message))
    .finally(() => pool.end())