import { useEffect, useState, useRef, useCallback } from "react";
import ProductCard from "../components/ProductCard";

const PRODUCTS_URL =
  import.meta.env.VITE_PRODUCTS_URL ||
  "https://dealdesi-product-service.onrender.com";

const PAGE_SIZE = 500;

interface Product {
  id?: number | string;
  name?: string;
  price?: number | string;
  image?: string;
  description?: string;
  color?: string;
  size?: string;
  [key: string]: any;
}

export default function Women() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [waking, setWaking] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFetching = useRef(false);
  const allProducts = useRef<Product[]>([]);

  // Fetch all products
  const fetchAll = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);

    const load = async (): Promise<void> => {
      try {
        const res = await fetch(`${PRODUCTS_URL}/products`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const rows: Product[] = Array.isArray(json) ? json : [];

        allProducts.current = rows;

        const firstSlice = rows.slice(0, PAGE_SIZE);
        setProducts(firstSlice);
        setPage(2);
        setHasMore(rows.length > PAGE_SIZE);
        setLoading(false);
        setWaking(false);
        isFetching.current = false;
      } catch (err) {
        setWaking(true);
        setTimeout(load, 3000);
      }
    };

    await load();
  }, []);

  // Load more (infinite scroll)
  const loadMore = useCallback(() => {
    if (isFetching.current || !hasMore) return;
    isFetching.current = true;

    const start = (page - 1) * PAGE_SIZE;
    const slice = allProducts.current.slice(start, start + PAGE_SIZE);

    setProducts(prev => [...prev, ...slice]);
    setPage(p => p + 1);
    setHasMore(start + PAGE_SIZE < allProducts.current.length);
    isFetching.current = false;
  }, [page, hasMore]);

  // Initial fetch
  useEffect(() => {
    fetchAll();
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching.current) {
          loadMore();
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <div style={{ padding: "40px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: 0 }}>Women Products</h2>

        {waking && products.length === 0 && (
          <p style={{ color: "#888", marginTop: "8px" }}>
            Waking up server... please wait ☕
          </p>
        )}

        {products.length > 0 && (
          <p style={{ color: "#888", margin: "6px 0 0", fontSize: "14px" }}>
            Showing {products.length.toLocaleString()} of{" "}
            {allProducts.current.length.toLocaleString()} products
            {hasMore ? " · scroll for more" : " · all loaded ✓"}
          </p>
        )}
      </div>

      {/* Product Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {products.map((p, i) => (
          <ProductCard
            key={p.id ?? i}
            product={{
               id: i, 
              name: p.name,
              price: p.price,
              image: p.image,
            }}
          />
        ))}
      </div>

      {/* Scroll Trigger */}
      <div ref={sentinelRef} style={{ height: "1px" }} />

      {/* Loading */}
      {loading && products.length > 0 && (
        <div style={{ textAlign: "center", padding: "32px", color: "#888" }}>
          Loading more...
        </div>
      )}

      {/* End */}
      {!hasMore && products.length > 0 && (
        <div style={{ textAlign: "center", padding: "32px", color: "#bbb" }}>
          All {allProducts.current.length.toLocaleString()} products loaded ✓
        </div>
      )}
    </div>
  );
}