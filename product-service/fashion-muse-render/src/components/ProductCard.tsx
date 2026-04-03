// ProductCard.jsx
const ProductCard = ({ product }) => {
  return (
    <div className="border rounded-xl p-3 shadow-sm">
      <img src={product.image} className="w-full h-64 object-cover rounded-lg" />

      <h3 className="mt-2 font-medium">{product.name}</h3>
      <p className="text-orange-600 font-bold">₹{product.price}</p>

      <button className="w-full mt-2 bg-black text-white py-2 rounded-lg">
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;