const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "Abhi@123",
  database: "ada_db",
  port: 5432
});

module.exports = pool;
