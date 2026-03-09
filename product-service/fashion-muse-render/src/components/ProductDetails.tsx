import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = "https://dealdesi-product-service.onrender.com/products";

const ProductDetails = () => {

  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function loadProduct() {

      try {

        const res = await fetch(`${API}/${id}`);

        if (!res.ok) {
          throw new Error("Product not found");
        }

        const p = await res.json();
        setProduct(p);

        // Load images
        if (p.image_url) {
          try {
            const imgs = JSON.parse(p.image_url.replace(/'/g, '"'));
            setImages(imgs);
          } catch {
            setImages([]);
          }
        }

      } catch (err) {
        console.error("Product load error:", err);
      }

      setLoading(false);

    }

    loadProduct();

  }, [id]);

  if (loading) {
    return <div className="p-10">Loading product...</div>;
  }

  if (!product) {
    return <div className="p-10">Product not found</div>;
  }

  const colors = product.color?.split(",") || ["Black", "White", "Maroon"];
  const sizes = product.size?.split(",") || ["XS", "S", "M", "L", "XL"];

  return (

    <div style={{ padding: "20px" }}>

      <div
        style={{
          maxWidth: "1100px",
          margin: "auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px"
        }}
      >

        {/* Images */}
        <div>
          {images.length > 0 ? (
            images.map((src, i) => (
              <img
                key={i}
                src={src}
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  marginBottom: "15px",
                  objectFit: "cover"
                }}
              />
            ))
          ) : (
            <img
              src={product.image}
              style={{
                width: "100%",
                borderRadius: "12px",
                objectFit: "cover"
              }}
            />
          )}
        </div>

        {/* Details */}
        <div>

          <div style={{ display: "flex", gap: "30px", fontWeight: 500 }}>
            <span style={{ borderBottom: "2px solid black" }}>Women</span>
            <span>Men</span>
          </div>

          <h1 style={{ fontSize: "26px", margin: "15px 0 5px" }}>
            {product.product_name}
          </h1>

          <div style={{ color: "#ff9f00", fontSize: "14px" }}>
            ★★★★★ {Math.floor(Math.random() * 200 + 50)} reviews
          </div>

          {/* Price */}
          <div style={{ margin: "10px 0" }}>

            <span style={{ textDecoration: "line-through", color: "#999", marginRight: "10px" }}>
              ₹{Math.round(product.discounted_price * 1.5)}
            </span>

            <span style={{ fontSize: "22px", fontWeight: 700 }}>
              ₹{product.discounted_price}
            </span>

            <span
              style={{
                background: "#ff3f3f",
                color: "#fff",
                padding: "3px 8px",
                fontSize: "12px",
                borderRadius: "6px",
                marginLeft: "10px"
              }}
            >
              34% OFF
            </span>

          </div>

          {/* Colors */}
          <div style={{ marginTop: "20px" }}>

            <h4 style={{ marginBottom: "8px", fontSize: "14px", letterSpacing: "1px" }}>
              COLOR
            </h4>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>

              {colors.map((c: string, i: number) => (
                <div
                  key={i}
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  {c.trim()}
                </div>
              ))}

            </div>

          </div>

          {/* Sizes */}
          <div style={{ marginTop: "20px" }}>

            <h4 style={{ marginBottom: "8px", fontSize: "14px", letterSpacing: "1px" }}>
              SIZE
            </h4>

            <div style={{ display: "flex", gap: "10px" }}>

              {sizes.map((s: string, i: number) => (
                <div
                  key={i}
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    width: "40px",
                    textAlign: "center",
                    cursor: "pointer"
                  }}
                >
                  {s.trim()}
                </div>
              ))}

            </div>

          </div>

          <div style={{ marginTop: "10px", color: "green", fontSize: "14px" }}>
            ● In stock, ready to ship
          </div>

          <button
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "15px",
              border: "1px solid black",
              background: "#fff",
              cursor: "pointer"
            }}
          >
            Add to cart
          </button>

          <button
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "15px",
              background: "#000",
              color: "#fff",
              border: "none",
              cursor: "pointer"
            }}
          >
            Buy it now
          </button>

          <div style={{ marginTop: "20px", color: "#555", lineHeight: "1.6" }}>
            {product.description || "Premium fashion product"}
          </div>

        </div>

      </div>

    </div>

  );

};

export default ProductDetails;