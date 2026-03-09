import { X } from "lucide-react";
import { useState } from "react";

const PromoBanner = () => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="bg-promo-gradient py-2.5 px-4 relative">
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm font-medium text-primary-foreground">
          🎉 GET FLAT 10% OFF | FREE SHIPPING ON ORDER ABOVE ₹999
        </span>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default PromoBanner;
