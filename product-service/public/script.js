const API_URL = "http://localhost:3000/products";

const productsDiv = document.getElementById("products");
const categoryFilter = document.getElementById("categoryFilter");

let allProducts = [];

// Fetch products from backend
async function loadProducts() {
  const res = await fetch(API_URL + "?limit=50");
  const json = await res.json();

  allProducts = json.data;
  populateCategories(allProducts);
  renderProducts(allProducts);
}

// Extract unique categories
function populateCategories(products) {
  const categories = new Set();

  products.forEach(p => {
    if (p.category) categories.add(p.category);
  });

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

// Render product cards
function renderProducts(products) {
  productsDiv.innerHTML = "";

  products.forEach(product => {
    // Convert image_url string → array
    let images = [];
    try {
      images = JSON.parse(
        product.image_url.replace(/'/g, '"')
      );
    } catch (e) {}

    const image = images[0] || "";

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${image}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p class="price">₹ ${product.price}</p>
    `;

    productsDiv.appendChild(card);
  });
}

// Category filter handler
categoryFilter.addEventListener("change", () => {
  const value = categoryFilter.value;

  if (!value) {
    renderProducts(allProducts);
  } else {
    renderProducts(
      allProducts.filter(p => p.category === value)
    );
  }
});

// Load on page start
loadProducts();
