const express = require("express");
const router = express.Router();
const pool = require("../db/db");
const cors = require('cors')
// ------------------------------------
// GET /products OR /products?page=1&limit=20
// ------------------------------------

app.use(cors({
  origin: [
    'https://dealdesi-frontend.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}))
app.options('*', cors())
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT id, name, size, category, price, color, sku, description, image_url
       FROM products
       ORDER BY id
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.status(200).json({
      page,
      limit,
      count: result.rows.length,
      data: result.rows
    });

  } catch (err) {
    console.error("DB ERROR 👉", err);
    res.status(500).json({
      error: "Database error",
      details: err.message
    });
  }
});

// ------------------------------------
// GET /products/categories
// ------------------------------------
router.get("/categories", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT category FROM products ORDER BY category"
    );

    res.json(result.rows.map(r => r.category));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------
// GET /products/category/:category
// ------------------------------------
router.get("/category/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT id, name, size, category, price, color, sku, description, image_url
       FROM products
       WHERE category ILIKE $1
       ORDER BY id
       LIMIT $2 OFFSET $3`,
      [`%${category}%`, limit, offset]
    );

    res.json({
      page,
      limit,
      count: result.rows.length,
      data: result.rows
    });

  } catch (err) {
    console.error("CATEGORY API ERROR 👉", err);
    res.status(500).json({ error: err.message });
  }
});
// ------------------------------------
// GET /products/:id  (Product details)
// ------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, name, size, category, price, color, sku, description, image_url
       FROM products
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("PRODUCT DETAIL ERROR 👉", err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
