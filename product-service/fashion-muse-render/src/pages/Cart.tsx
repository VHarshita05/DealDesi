import { useEffect, useState } from "react";

const CART_API = "https://dealdesi-cart-service.onrender.com/cart";

const Cart = () => {

  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {

    async function loadCart() {
      try {

        const res = await fetch(CART_API);
        const data = await res.json();

        setItems(data);

      } catch (err) {
        console.error("Cart load error:", err);
      }
    }

    loadCart();

  }, []);

  return (

    <div style={{ padding: "40px", maxWidth: "900px", margin: "auto" }}>

      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>
        Your Cart
      </h1>

      {items.length === 0 && (
        <p>Your cart is empty</p>
      )}

      {items.map((item, index) => (

        <div
          key={index}
          style={{
            display: "flex",
            gap: "20px",
            borderBottom: "1px solid #eee",
            padding: "20px 0"
          }}
        >

          <img
            src={item.image}
            style={{ width: "120px", borderRadius: "10px" }}
          />

          <div>

            <h3>{item.name}</h3>

            <p style={{ fontWeight: 600 }}>
              ₹{item.price}
            </p>

          </div>

        </div>

      ))}

    </div>

  );

};

export default Cart;