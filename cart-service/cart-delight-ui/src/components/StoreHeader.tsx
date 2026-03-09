import { Search, MapPin, User, Heart, ShoppingBag, X } from "lucide-react";
import { Link } from "react-router-dom";

const StoreHeader = () => {
  return (
    <header>
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground text-center py-2 px-4 text-sm font-medium relative">
        <span>🎉 GET FLAT 10% OFF | FREE SHIPPING ON ORDER ABOVE ₹999</span>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-foreground/80 hover:text-primary-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Main Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-border">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold text-primary tracking-tight">
            DealDesi
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold uppercase tracking-wider text-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Men</Link>
            <Link to="/" className="hover:text-primary transition-colors">Women</Link>
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/" className="hover:text-primary transition-colors">GenZ</Link>
          </div>
        </div>

        <div className="hidden lg:flex items-center flex-1 max-w-lg mx-8">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for products, brands and more"
              className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex items-center gap-5 text-foreground">
          <button className="flex flex-col items-center gap-0.5 text-xs hover:text-primary transition-colors">
            <MapPin className="h-5 w-5" />
            <span className="hidden md:inline">Location</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-xs hover:text-primary transition-colors">
            <User className="h-5 w-5" />
            <span className="hidden md:inline">Profile</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-xs hover:text-primary transition-colors">
            <Heart className="h-5 w-5" />
            <span className="hidden md:inline">Wishlist</span>
          </button>
          <Link to="/cart" className="flex flex-col items-center gap-0.5 text-xs hover:text-primary transition-colors relative">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
            <span className="hidden md:inline">Bag</span>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default StoreHeader;
