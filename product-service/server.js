const express = require("express");
const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/* -----------------------------
   SERVE REACT BUILD
------------------------------*/

const frontendPath = path.join(__dirname, "fashion-muse-render", "dist");

app.use(express.static(frontendPath));
app.use("/assets", express.static(path.join(frontendPath, "assets")));
/* -----------------------------
   LOAD PRODUCTS FROM CSV
------------------------------*/

let products = [];
const csvPath = path.join(__dirname, "products.csv");

function extractFirstImage(imagesField) {
  if (!imagesField) return null;

  const match = imagesField.match(/https:\/\/images\.asos-media\.com\/[^',\]]+/);
  if (!match) return null;

  return match[0].split("?")[0];
}

if (fs.existsSync(csvPath)) {
  fs.createReadStream(csvPath)
    .pipe(csv())
    .on("data", (row) => {
      const image = extractFirstImage(row.images);

      products.push({
        ...row,
        image: image,
      });
    })
    .on("end", () => {
      console.log(`Loaded ${products.length} products`);
    });
}

/* -----------------------------
   API ROUTES
------------------------------*/

app.get("/products", (req, res) => {
  res.json(products);
});

app.get("/products/:id", (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id < 0 || id >= products.length) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(products[id]);
});

app.get("/health", (req, res) => {
  res.send("OK");
});

/* -----------------------------
   REACT ROUTER FALLBACK
------------------------------*/

app.get(/^\/(?!api|products|assets).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});
/* -----------------------------
   START SERVER
------------------------------*/

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});