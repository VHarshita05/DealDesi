import { useEffect, useState } from "react";

export default function Women() {

  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  return (
    <div>
      <h2>Women Products</h2>

      {products.map((p, index) => (
        <div key={index}>
          <img src={p.image} width="200" />
          <h4>{p.name}</h4>
          <p>${p.price}</p>
        </div>
      ))}

    </div>
  );
}