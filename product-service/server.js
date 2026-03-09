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

// Store products
let products = [];

// CSV path
const csvPath = path.join(__dirname, 'products.csv');

/*
  Extract first valid ASOS image from the messy CSV string
*/
function extractFirstImage(imagesField) {
  if (!imagesField) return null;

  const match = imagesField.match(/https:\/\/images\.asos-media\.com\/[^',\]]+/);

  if (!match) return null;

  // remove query params like ?$n_1920w$&wid=...
  return match[0].split('?')[0];
}

// Load CSV
if (fs.existsSync(csvPath)) {
  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (row) => {

      const image = extractFirstImage(row.images);

      const product = {
        ...row,
        image: image
      };

      products.push(product);
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

// Health check
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