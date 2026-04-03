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
  image?: string;          // built by server.js from CSV images field
  description?: string;
  color?: string;
  size?: string;
  [key: string]: any;
}

export default function Women() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [hasMore, setHasMore]   = useState(true);
  const [waking, setWaking]     = useState(false);
  const sentinelRef             = useRef<HTMLDivElement>(null);
  const isFetching              = useRef(false);
  const allProducts             = useRef<Product[]>([]); // master list for slicing

  // server.js returns a plain array of ALL products at once
  // so we fetch once, then paginate client-side
  const fetchAll = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);

    const load = async (): Promise<void> => {
      try {
        const res = await fetch(`${PRODUCTS_URL}/products`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        // server.js returns a plain array
        const rows: Product[] = Array.isArray(json) ? json : [];

        allProducts.current = rows;

        // Show first page immediately
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

  // Load more from the already-fetched master list (client-side pagination)
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

  // Fetch all on mount
  useEffect(() => { fetchAll(); }, []);

  // IntersectionObserver for infinite scroll
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
      name: p.name,
      price: p.price,
      image: p.image
    }}
  />
))}
          >
            {p.image ? (
              <img
                src={p.image}
                alt={p.name}
                style={{ width: "100%", height: "300px", objectFit: "cover", borderRadius: "6px" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div style={{
                width: "100%", height: "300px", borderRadius: "6px",
                background: "#fce4ec", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: "48px",
              }}>
                👗
              </div>
            )}
            <h4 style={{ margin: "10px 0 4px", fontSize: "14px" }}>{p.name}</h4>
            {p.colour && (
              <p style={{ fontSize: "12px", color: "#888", margin: "2px 0" }}>
                {p.colour}
              </p>
            )}
            <p style={{ fontWeight: "bold", color: "#c0392b", margin: "6px 0 0" }}>
              ₹{Number(p.price).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Sentinel for IntersectionObserver */}
      <div ref={sentinelRef} style={{ height: "1px" }} />

      {loading && products.length > 0 && (
        <div style={{ textAlign: "center", padding: "32px", color: "#888", fontSize: "14px" }}>
          Loading more...
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div style={{ textAlign: "center", padding: "32px", color: "#bbb", fontSize: "13px" }}>
          All {allProducts.current.length.toLocaleString()} products loaded ✓
        </div>
      )}
    </div>
  );
}
