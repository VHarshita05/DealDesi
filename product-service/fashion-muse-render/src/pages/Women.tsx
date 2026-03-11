import { useEffect, useState } from "react";

export default function Women() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("https://dealdesi-product-service.onrender.com/products")
      .then((res) => res.json())
      .then((data) => {
        console.log("Products:", data);
        setProducts(data);
      });
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h2>Women Products</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {products.map((p, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #eee",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            <img
              src={p.image}
              alt={p.name}
              style={{ width: "100%", height: "300px", objectFit: "cover" }}
            />

            <h4>{p.name}</h4>

            <p>${p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}