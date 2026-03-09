import heroBanner from "@/assets/hero-banner.jpg";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[500px] md:h-[550px]">
        <img
          src={heroBanner}
          alt="Fashion Sale"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/20 to-transparent" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-lg animate-fade-in-up">
            <p className="text-primary-foreground/80 text-sm font-semibold tracking-[0.3em] uppercase mb-3">
              Season's Biggest Sale
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-black text-primary-foreground leading-[0.95] mb-4">
              STYLE
              <br />
              <span className="text-accent">FEST</span>
            </h1>
            <p className="text-primary-foreground/80 text-lg mb-8 font-body max-w-sm">
              Up to 70% off on top brands. Refresh your wardrobe this season.
            </p>
            <div className="flex gap-3">
              <Button variant="hero" size="lg" className="text-base px-8">
                Shop Now <ArrowRight size={18} />
              </Button>
              <Button variant="pill" size="lg" className="text-base px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-foreground">
                Explore
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
