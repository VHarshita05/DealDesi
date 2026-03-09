import { Heart, Star, RefreshCw } from "lucide-react";
import { useState, useCallback } from "react";

import modelMen1 from "@/assets/model-men-1.jpg";
import modelMen2 from "@/assets/model-men-2.jpg";
import modelMen3 from "@/assets/model-men-3.jpg";
import modelMen4 from "@/assets/model-men-4.jpg";
import modelMen5 from "@/assets/model-men-5.jpg";
import modelMen6 from "@/assets/model-men-6.jpg";
import modelWomen1 from "@/assets/model-women-1.jpg";
import modelWomen2 from "@/assets/model-women-2.jpg";
import modelWomen3 from "@/assets/model-women-3.jpg";
import modelWomen4 from "@/assets/model-women-4.jpg";
import modelWomen5 from "@/assets/model-women-5.jpg";
import modelWomen6 from "@/assets/model-women-6.jpg";

const menImages = [modelMen1, modelMen2, modelMen3, modelMen4, modelMen5, modelMen6];
const womenImages = [modelWomen1, modelWomen2, modelWomen3, modelWomen4, modelWomen5, modelWomen6];

const products = [
  { id: 1, brand: "Roadster", name: "Men Slim Fit Casual Shirt", price: 899, mrp: 1999, rating: 4.3, reviews: 2456, gender: "men" },
  { id: 2, brand: "HRX", name: "Women Sports Running Outfit", price: 1499, mrp: 3299, rating: 4.5, reviews: 1823, gender: "women" },
  { id: 3, brand: "Mast & Harbour", name: "Men Printed Round Neck T-Shirt", price: 599, mrp: 1299, rating: 4.1, reviews: 987, gender: "men" },
  { id: 4, brand: "Libas", name: "Women Ethnic Kurta Set", price: 1299, mrp: 2999, rating: 4.6, reviews: 3201, gender: "women" },
  { id: 5, brand: "Allen Solly", name: "Men Formal Blazer & Trousers", price: 1199, mrp: 2499, rating: 4.2, reviews: 1456, gender: "men" },
  { id: 6, brand: "W", name: "Women Printed Palazzo Set", price: 799, mrp: 1699, rating: 4.0, reviews: 678, gender: "women" },
  { id: 7, brand: "Puma", name: "Men Streetwear Hoodie Set", price: 2499, mrp: 4999, rating: 4.7, reviews: 4521, gender: "men" },
  { id: 8, brand: "Biba", name: "Women Anarkali Dress", price: 1599, mrp: 3499, rating: 4.4, reviews: 2189, gender: "women" },
];

const TrendingProducts = () => {
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [imageIndices, setImageIndices] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    products.forEach((p, i) => {
      initial[p.id] = i % 6;
    });
    return initial;
  });

  const toggleWishlist = (id: number) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const cycleImage = useCallback((id: number) => {
    setImageIndices((prev) => ({
      ...prev,
      [id]: ((prev[id] ?? 0) + 1) % 6,
    }));
  }, []);

  const getImage = (product: typeof products[0]) => {
    const idx = imageIndices[product.id] ?? 0;
    return product.gender === "men" ? menImages[idx] : womenImages[idx];
  };

  return (
    <section className="bg-warm-gradient py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Trending Now 🔥
          </h2>
          <p className="text-muted-foreground mt-2 font-body">Handpicked styles just for you</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {products.map((product, i) => (
            <div
              key={product.id}
              className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => cycleImage(product.id)}>
                <img
                  src={getImage(product)}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-foreground/60 backdrop-blur-sm text-primary-foreground text-[10px] font-semibold px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <RefreshCw size={10} /> Click for new look
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
                >
                  <Heart
                    size={16}
                    className={wishlist.includes(product.id) ? "fill-secondary text-secondary" : "text-foreground/50"}
                  />
                </button>
              </div>

              {/* Details */}
              <div className="p-3">
                <p className="text-xs font-bold text-foreground uppercase tracking-wide">{product.brand}</p>
                <p className="text-sm text-muted-foreground truncate mt-0.5">{product.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-bold text-foreground">₹{product.price}</span>
                  <span className="text-xs text-muted-foreground line-through">₹{product.mrp}</span>
                  <span className="text-xs font-semibold text-secondary">
                    ({Math.round((1 - product.price / product.mrp) * 100)}% OFF)
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <div className="flex items-center gap-0.5 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {product.rating} <Star size={8} className="fill-current" />
                  </div>
                  <span className="text-[10px] text-muted-foreground">| {product.reviews.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;
