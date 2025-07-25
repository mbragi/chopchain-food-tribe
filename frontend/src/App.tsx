import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import VendorDetails from "./pages/VendorDetails";
import Cart from "./pages/Cart";
import OrderConfirmation from "./pages/OrderConfirmation";
import Rewards from "./pages/Rewards";
import EarnWithChop from "./pages/EarnWithChop";
import VendorDashboard from "./pages/VendorDashboard";
import VendorRegistration from "./pages/VendorRegistration";
import DeliveryAgentDashboard from "./pages/DeliveryAgentDashboard";
import DeliveryAgentRegistration from "./pages/DeliveryAgentRegistration";
import ProtectedVendorRoute from "./components/ProtectedVendorRoute";
import ProtectedDeliveryAgentRoute from "./components/ProtectedDeliveryAgentRoute";
import NotFound from "./pages/NotFound";
import FoodBrowsing from "./components/FoodBrowsing";
import OnboardingFlow from "./components/OnboardingFlow";
import FramePage from "./pages/FramePage";
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
                    <Route path="/browse" element={<FoodBrowsing />} />
                    <Route path="/vendor-details" element={<VendorDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/order-confirmation" element={<OrderConfirmation />} />
                    
                    {/* Farcaster Frame Route */}
                    <Route path="/frame" element={<FramePage />} />
                    
                    {/* Onboarding Routes */}
                    <Route path="/onboarding/customer" element={<OnboardingFlow userType="customer" />} />
                    <Route path="/onboarding/vendor" element={<OnboardingFlow userType="vendor" />} />
                    <Route path="/onboarding/delivery-agent" element={<OnboardingFlow userType="delivery_agent" />} />
                    
                    {/* Rewards Routes */}
                    <Route path="/rewards" element={<Rewards />} />
                    <Route path="/earn" element={<EarnWithChop />} />
                    
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
                    
                    {/* Delivery Agent Routes */}
                    <Route path="/delivery-agent/register" element={<DeliveryAgentRegistration />} />
                    <Route 
                      path="/delivery-agent/dashboard" 
                      element={
                        <ProtectedDeliveryAgentRoute>
                          <DeliveryAgentDashboard />
                        </ProtectedDeliveryAgentRoute>
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
