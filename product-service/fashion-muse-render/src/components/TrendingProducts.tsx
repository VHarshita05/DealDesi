import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TrendingProducts = () => {

  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate();   // 👈 added

  useEffect(() => {
    fetch("https://dealdesi-product-service.onrender.com/products")
      .then(res => res.json())
      .then(data => {
        console.log("Products loaded:", data);
        setProducts(data.slice(0, 8));
      })
      .catch(err => console.error("Fetch error:", err));
  }, []);

  return (
    <section className="px-8 py-12">

      <h2 className="text-3xl font-bold mb-8">
        Trending Products
      </h2>

      <div className="grid grid-cols-4 gap-6">

        {products.map((product, index) => (

          <div
            key={index}
            onClick={() => navigate(`/product/${index}`, { state: product })}  // 👈 added
            className="border rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
          >

            <img
              src={product.image}
              alt={product.product_name}
              className="w-full h-64 object-cover"
            />

            <h3 className="mt-3 font-semibold">
  {product.name}
</h3>

           <p className="text-lg font-bold mt-1">
  ${Number(product.price)}
</p>

            <button
              onClick={(e) => {
                e.stopPropagation(); // 👈 prevents navigation when clicking cart
                alert("Added to cart");
              }}
              className="bg-black text-white px-4 py-2 mt-3 rounded w-full"
            >
              Add to Cart
            </button>

          </div>

        ))}

      </div>

    </section>
  );
};

export default TrendingProducts;