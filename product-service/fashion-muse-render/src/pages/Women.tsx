import { useEffect, useState } from "react";

export default function Women() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          "https://dealdesi-product-service.onrender.com/products"
        );

        if (!res.ok) {
          throw new Error("Server not ready yet");
        }

        const data = await res.json();
        console.log("Products:", data);

        setProducts(data);
        setLoading(false);
      } catch (err) {
        console.log("Backend sleeping, retrying in 3 seconds...");
        setError("Waking up server... please wait");
        setTimeout(fetchProducts, 3000);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Women Products</h2>
        <p>{error || "Loading products..."}</p>
      </div>
    );
  }

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
              background: "#fff",
            }}
          >
            <img
              src={p.image}
              alt={p.name}
              style={{
                width: "100%",
                height: "300px",
                objectFit: "cover",
              }}
            />

            <h4>{p.name}</h4>

            <p style={{ fontWeight: "bold" }}>${p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}