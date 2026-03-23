import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import GroupPage from "./pages/GroupPage";

import Cart from "./pages/Cart";
import Index from "./pages/Index";
import Women from "./pages/Women";
import NotFound from "./pages/NotFound";
import ProductDetails from "./components/ProductDetails";   // 👈 added

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <Routes>

          <Route path="/" element={<Index />} />

          {/* PRODUCT DETAILS PAGE */}
          <Route path="/product/:id" element={<ProductDetails />} />   {/* 👈 added */}
          
              {/* Cart page */}
    <Route path="/cart" element={<Cart />} />
          
          <Route path="/women" element={<Women />} />
          <Route path="/group" element={<GroupPage />} />

          {/* CATCH ALL ROUTE */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;