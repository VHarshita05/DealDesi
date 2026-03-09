app.use(express.json());

/* SERVE FRONTEND */
const frontendPath = path.join(__dirname, "fashion-muse-render", "dist");
app.use(express.static(frontendPath));

/* API ROUTES */
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

/* FRONTEND FALLBACK */
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

/* START SERVER */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});