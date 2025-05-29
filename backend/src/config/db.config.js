const { Pool } = require('pg');

const pool = new Pool({
  user: 'jeanshopdev',
  host: 'localhost',
  database: 'jeanshop',
  password: 'jeanshopdev',
  port: 5433,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};