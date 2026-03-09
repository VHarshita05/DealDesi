import { Heart, Instagram, Facebook, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground/80">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-display text-lg font-bold text-primary-foreground mb-4">DealDesi</h4>
            <p className="text-sm leading-relaxed">Your one-stop destination for trendy fashion at unbeatable prices.</p>
          </div>
          <div>
            <h5 className="font-semibold text-primary-foreground text-sm uppercase tracking-wider mb-4">Shop</h5>
            <ul className="space-y-2 text-sm">
              {["Men", "Women", "Home"].map((l) => (
                <li key={l}><a href="#" className="hover:text-primary transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-primary-foreground text-sm uppercase tracking-wider mb-4">Help</h5>
            <ul className="space-y-2 text-sm">
              {["Track Order", "Returns", "FAQs", "Contact Us"].map((l) => (
                <li key={l}><a href="#" className="hover:text-primary transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-primary-foreground text-sm uppercase tracking-wider mb-4">Follow Us</h5>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary transition-all duration-300">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 mt-10 pt-6 text-center text-xs">
          Made with <Heart size={12} className="inline text-secondary fill-secondary" /> by DealDesi © 2026
        </div>
      </div>
    </footer>
  );
};

export default Footer;
