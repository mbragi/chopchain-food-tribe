import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import VendorDetails from "./pages/VendorDetails";
import Cart from "./pages/Cart";
import OrderConfirmation from "./pages/OrderConfirmation";
import NotFound from "./pages/NotFound";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { supportedChains, Base } from "@/constants/chains";

const queryClient = new QueryClient();

const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

const App = () => (
  <ThirdwebProvider
    supportedChains={supportedChains}
    clientId={clientId}
    dAppMeta={{
      name: "ChopChain",
      description: "Decentralized food delivery for Africa",
      url: "https://chopchain.com",
      logoUrl: "https://chopchain.com/logo.png"
    }}
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/vendor-details" element={<VendorDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThirdwebProvider>
);

export default App;
