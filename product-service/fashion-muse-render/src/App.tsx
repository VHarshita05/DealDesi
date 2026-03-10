import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Cart from "./pages/Cart";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProductDetails from "./components/ProductDetails";   // 👈 added

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<Index />} />

          {/* PRODUCT DETAILS PAGE */}
          <Route path="/product/:id" element={<ProductDetails />} />   {/* 👈 added */}
          
              {/* Cart page */}
    <Route path="/cart" element={<Cart />} />

          {/* CATCH ALL ROUTE */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;