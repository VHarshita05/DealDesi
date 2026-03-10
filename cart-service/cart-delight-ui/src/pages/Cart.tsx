import { useState, useEffect } from "react";
import { Minus, Plus, X, Truck, ShieldCheck, RotateCcw, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import StoreHeader from "@/components/StoreHeader";

interface CartItem {
  id: number;
  name: string;
  brand: string;
  size: string;
  color: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;
}

const Cart = () => {

  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState("");

  useEffect(() => {

    async function loadCart() {

      try {

        const res = await fetch("https://dealdesi-cart-service.onrender.com/cart");
        const data = await res.json();

        const mapped: CartItem[] = data.map((item: any, index: number) => ({
          id: index + 1,
          name: item.name,
          brand: "DealDesi",
          size: "M",
          color: "Default",
          price: item.price,
          originalPrice: item.price * 2,
          quantity: 1,
          image: item.image
        }));

        setItems(mapped);

      } catch (err) {
        console.error("Cart load error:", err);
      }

    }

    loadCart();

  }, []);

  const updateQty = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalOriginal = items.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
  const discount = totalOriginal - subtotal;
  const shipping = subtotal > 999 ? 0 : 79;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-secondary">
      <StoreHeader />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Shopping Bag</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {items.length} item{items.length !== 1 ? "s" : ""} in your bag
        </p>

        {items.length === 0 ? (
          <div className="bg-card rounded-xl p-16 text-center">
            <p className="text-muted-foreground text-lg mb-4">Your bag is empty</p>
            <Button variant="coral" size="lg">Continue Shopping</Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-card rounded-xl p-4 flex gap-4 relative border border-border">

                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-32 object-cover rounded-lg"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {item.brand}
                    </p>

                    <h3 className="font-semibold text-foreground mt-0.5 truncate">
                      {item.name}
                    </h3>

                    <p className="text-xs text-muted-foreground mt-1">
                      Size: {item.size} &nbsp;|&nbsp; Color: {item.color}
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-lg font-bold text-foreground">
                        ₹{item.price}
                      </span>

                      <span className="text-sm text-muted-foreground line-through">
                        ₹{item.originalPrice}
                      </span>

                      <span className="text-xs font-semibold text-primary">
                        {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-border rounded-lg overflow-hidden">

                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="px-2.5 py-1.5 hover:bg-accent transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>

                        <span className="px-3 py-1.5 text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="px-2.5 py-1.5 hover:bg-accent transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>

                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>

                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-4">

              {/* Coupon */}
              <div className="bg-card rounded-xl p-5 border border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-primary" />
                  Apply Coupon
                </h3>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  />

                  <Button variant="coral" size="sm">
                    Apply
                  </Button>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-card rounded-xl p-5 border border-border">

                <h3 className="font-semibold text-foreground mb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 text-sm">

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)
                    </span>

                    <span className="text-foreground">
                      ₹{totalOriginal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>

                    <span className="text-primary font-medium">
                      - ₹{discount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>

                    <span className={shipping === 0 ? "text-primary font-medium" : "text-foreground"}>
                      {shipping === 0 ? "FREE" : `₹${shipping}`}
                    </span>
                  </div>

                  <div className="border-t border-border pt-3 flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>

                  <p className="text-xs text-primary font-medium">
                    You save ₹{discount.toLocaleString()} on this order!
                  </p>

                </div>

                <Button variant="coral" className="w-full mt-5" size="lg">
                  Proceed to Checkout
                </Button>

              </div>

              {/* Trust badges */}
              <div className="bg-card rounded-xl p-5 border border-border grid grid-cols-3 gap-3 text-center">

                <div className="flex flex-col items-center gap-1.5">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-[11px] text-muted-foreground leading-tight">
                    Free Shipping<br />above ₹999
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="text-[11px] text-muted-foreground leading-tight">
                    Secure<br />Payment
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  <RotateCcw className="h-5 w-5 text-primary" />
                  <span className="text-[11px] text-muted-foreground leading-tight">
                    Easy<br />Returns
                  </span>
                </div>

              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;