import { Search, Heart, ShoppingBag, User, MapPin, Users } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";

const navLinks = ["MEN", "WOMEN", "HOME", "GENZ"];

const Navbar = () => {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16 gap-2 md:gap-6">
        
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <img src={logo} alt="DealDesi" className="h-10 w-10 object-contain" />
          <span className="font-display text-xl font-bold text-gradient hidden sm:block">DealDesi</span>
        </div>

        {/* Nav links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link}
              to={`/${link.toLowerCase()}`}
              className="px-3 py-2 text-sm font-semibold tracking-wide text-foreground hover:text-primary border-b-2 border-transparent hover:border-primary transition-all duration-200"
            >
              {link}
            </Link>
          ))}
        </div>

        {/* Search */}
        <div className={`relative flex-1 max-w-md transition-all duration-300 ${searchFocused ? 'max-w-lg' : ''}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search for products, brands and more"
            className="w-full bg-muted rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none border-2 border-transparent focus:border-primary/30 transition-all duration-300 placeholder:text-muted-foreground"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-1">

          {/* ✅ GROUP BUY ICON */}
          <Link
            to="/group"
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg hover:bg-muted transition-colors group"
          >
            <Users size={20} className="text-foreground group-hover:text-primary transition-colors" />
            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary hidden sm:block">
              Group Buy
            </span>
          </Link>

          {[
            { icon: MapPin, label: "Location" },
            { icon: User, label: "Profile" },
            { icon: Heart, label: "Wishlist" },
            { icon: ShoppingBag, label: "Bag" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg hover:bg-muted transition-colors group"
            >
              <Icon size={20} className="text-foreground group-hover:text-primary transition-colors" />
              <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary hidden sm:block">
                {label}
              </span>
            </button>
          ))}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;