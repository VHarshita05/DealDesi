import { useEffect, useState, useRef, useCallback } from "react";

const PRODUCTS_URL = import.meta.env.VITE_PRODUCTS_URL || "https://dealdesi-product-service.onrender.com";
const PAGE_SIZE = 500;

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image_url: string;
  description: string;
  color: string;
  size: string;
}

export default function Women() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [hasMore, setHasMore]     = useState(true);
  const [error, setError]         = useState("");
  const [waking, setWaking]       = useState(false);
  const sentinelRef               = useRef<HTMLDivElement>(null);
  const isFetching                = useRef(false);

  const fetchPage = useCallback(async (pageNum: number) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    setError("");

    const load = async (): Promise<void> => {
      try {
        const res = await fetch(
          `${PRODUCTS_URL}/products?limit=${PAGE_SIZE}&page=${pageNum}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const rows: Product[] = Array.isArray(json)
          ? json
          : Array.isArray(json.data)
          ? json.data
          : [];

        setProducts(prev => pageNum === 1 ? rows : [...prev, ...rows]);
        setHasMore(rows.length === PAGE_SIZE);
        setPage(pageNum + 1);
        setLoading(false);
        setWaking(false);
        isFetching.current = false;
      } catch (err) {
        setWaking(true);
        setError("Waking up server... retrying");
        setTimeout(load, 3000);
      }
    };

    await load();
  }, []);

  // Load first page on mount
  useEffect(() => {
    fetchPage(1);
  }, []);

  // IntersectionObserver watches the sentinel div at the bottom
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching.current) {
          fetchPage(page);
        }
      },
      { rootMargin: "400px" } // start loading 400px before hitting bottom
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, page, fetchPage]);

  return (
    <div style={{ padding: "40px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: 0 }}>Women Products</h2>
        {products.length > 0 && (
          <p style={{ color: "#888", margin: "6px 0 0", fontSize: "14px" }}>
            {products.length.toLocaleString()} products loaded
            {hasMore ? " · scroll for more" : " · all loaded"}
          </p>
        )}
      </div>

      {/* Initial waking state */}
      {waking && products.length === 0 && (
        <p style={{ color: "#888" }}>Waking up server... please wait ☕</p>
      )}

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #eee",
              padding: "10px",
              borderRadius: "8px",
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            {p.image_url ? (
              <img
                src={p.image_url}
                alt={p.name}
                style={{ width: "100%", height: "300px", objectFit: "cover", borderRadius: "6px" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
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
            {p.color && (
              <p style={{ fontSize: "12px", color: "#888", margin: "2px 0" }}>
                {p.color}{p.size ? ` · ${p.size}` : ""}
              </p>
            )}
            <p style={{ fontWeight: "bold", color: "#c0392b", margin: "6px 0 0" }}>
              ₹{Number(p.price).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Sentinel — IntersectionObserver watches this */}
      <div ref={sentinelRef} style={{ height: "1px" }} />

      {/* Loading spinner at bottom */}
      {loading && products.length > 0 && (
        <div style={{ textAlign: "center", padding: "32px", color: "#888", fontSize: "14px" }}>
          {waking ? "Waking up server... ☕" : "Loading more products..."}
        </div>
      )}

      {/* All done */}
      {!hasMore && products.length > 0 && (
        <div style={{ textAlign: "center", padding: "32px", color: "#bbb", fontSize: "13px" }}>
          All {products.length.toLocaleString()} products loaded ✓
        </div>
      )}
    </div>
  );
}
