const { Pool } = require("pg");

const pool = new Pool({
  host: "productdb1.cjgou6wcse07.eu-north-1.rds.amazonaws.com",
  user: "postgres",
  password: "Harshu1972#",     // master password
  database: "productdb1",       // ✅ FIXED
  port: 5432,
  ssl: {
    rejectUnauthorized: false  // required for AWS RDS
  }
});

// Optional: test connection at startup
pool.on("connect", () => {
  console.log("✅ Connected to AWS RDS PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected PG error", err);
  process.exit(1);
});

module.exports = pool;

