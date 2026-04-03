import { useNavigate } from "react-router-dom";

type Product = {
  id?: number | string;
  name?: string;
  price?: number | string;
  image?: string;
};

const ProductCard = ({ product }: { product: Product }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (product.id) {
      navigate(`/product/${product.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        border: "1px solid #eee",
        padding: "10px",
        borderRadius: "8px",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        cursor: "pointer",
      }}
    >
      {/* ✅ ONLY REAL IMAGE (no dummy) */}
      <img
        src={product.image}
        alt={product.name}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
        style={{
          width: "100%",
          height: "300px",
          objectFit: "cover",
          borderRadius: "6px",
        }}
      />

      {/* Name */}
      <h4 style={{ margin: "10px 0 4px" }}>{product.name}</h4>

      {/* Price */}
      <p style={{ fontWeight: "bold", color: "#c0392b" }}>
        ₹{product.price}
      </p>

      {/* Add to Cart */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // 🚀 prevents navigation
          alert("Added to cart 🛒");
        }}
        style={{
          marginTop: "10px",
          width: "100%",
          background: "black",
          color: "white",
          padding: "10px",
          borderRadius: "6px",
        }}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;