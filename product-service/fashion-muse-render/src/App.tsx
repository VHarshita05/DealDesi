import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import GroupShopping from "./group-shopping/GroupShopping";
import { Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Cart from "./pages/Cart";
import Index from "./pages/Index";
import Women from "./pages/Women";
import NotFound from "./pages/NotFound";
import ProductDetails from "./components/ProductDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <Router>
        <Navbar /> {/* ✅ Navbar globally once */}

        <Routes>

          <Route path="/product/:id" element={<ProductDetails />} />

          <Route path="/cart" element={<Cart />} />

          <Route path="/" element={<Index />} />
<Route path="/women" element={<Women />} />

          {/* ✅ FIXED GROUP ROUTE */}
          <Route path="/group" element={<GroupShopping />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>

    </TooltipProvider>
  </QueryClientProvider>
);

export default App;