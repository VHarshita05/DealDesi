import PromoBanner from "@/components/PromoBanner";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import TrendingProducts from "@/components/TrendingProducts";
import CategoryGrid from "@/components/CategoryGrid";
import FeatureStrip from "@/components/FeatureStrip";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">

      <PromoBanner />

      {/* HERO SECTION */}
      <HeroBanner />

      {/* SHOP BY CATEGORY */}
      <CategoryGrid />

      {/* PRODUCTS */}
      <TrendingProducts />

      {/* FEATURES */}
      <FeatureStrip />

      <Footer />

    </div>
  );
};

export default Index;