import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import VendorDetails from "./pages/VendorDetails";
import Cart from "./pages/Cart";
import OrderConfirmation from "./pages/OrderConfirmation";
import VendorDashboard from "./pages/VendorDashboard";
import VendorRegistration from "./pages/VendorRegistration";
import ProtectedVendorRoute from "./components/ProtectedVendorRoute";
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
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/vendor-details" element={<VendorDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            
            {/* Vendor Routes */}
            <Route path="/vendor/register" element={<VendorRegistration />} />
            <Route 
              path="/vendor/dashboard" 
              element={
                <ProtectedVendorRoute>
                  <VendorDashboard />
                </ProtectedVendorRoute>
              } 
            />
            
            {/* Catch-all route - MUST be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThirdwebProvider>
);

export default App;
