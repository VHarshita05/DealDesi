const express = require('express');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Load products from CSV
let products = [];

const csvPath = path.join(__dirname, 'products.csv');

if (fs.existsSync(csvPath)) {
  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (row) => {
      products.push(row);
    })
    .on('end', () => {
      console.log(`Loaded ${products.length} products from CSV`);
    })
    .on('error', (err) => {
      console.error("CSV Read Error:", err);
    });
} else {
  console.error("products.csv not found at:", csvPath);
}

// Health check (for Render / Load Balancer)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Product API
app.get('/products', (req, res) => {
  res.json(products);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Product Catalog running on port ${PORT}`);
});