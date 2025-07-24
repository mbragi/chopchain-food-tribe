import { useState } from "react";
import { Search, MapPin, Star, Clock, Zap, Store, Truck, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { VendorCard } from "@/components/VendorCard";

interface Vendor {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number; // in USDT
  image: string;
  isOpen: boolean;
  featured: boolean;
  distance: number;
}
import WalletConnectModal from "@/components/ui/WalletConnectModal";
import RewardsWidget from "@/components/RewardsWidget";
import chopchainLogo from "@/assets/chopchain-logo.png";
import { useWallet } from "@/hooks/useWallet";
import { useVendorRegistry } from "@/hooks/useVendorRegistry"; 
import { useDeliveryAgentRegistry } from "@/hooks/useDeliveryAgentRegistry";
import { useCurrency } from "@/hooks/useCurrency";
import { useUserOnboarding } from "@/hooks/useUserOnboarding";
import { useNavigate } from "react-router-dom";

const categories = [
  "All", "Nigerian", "Continental", "Chinese", "Indian", "Italian", "Fast Food", "Healthy", "Desserts"
];

const featuredVendors: Vendor[] = [
  {
    id: "1",
    name: "Mama's Kitchen",
    cuisine: "Nigerian", 
    rating: 4.8,
    deliveryTime: "25-35 min",
    deliveryFee: 1.52, // ₦2,500 in USDT
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop",
    isOpen: true,
    featured: true,
    distance: 0.8
  },
  {
    id: "2", 
    name: "Urban Grill",
    cuisine: "Continental",
    rating: 4.6,
    deliveryTime: "30-40 min", 
    deliveryFee: 1.82, // ₦3,000 in USDT
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=300&h=200&fit=crop",
    isOpen: true,
    featured: true,
    distance: 1.2
  },
  {
    id: "3",
    name: "Dragon Palace",
    cuisine: "Chinese", 
    rating: 4.7,
    deliveryTime: "20-30 min",
    deliveryFee: 1.21, // ₦2,000 in USDT
    image: "https://images.unsplash.com/photo-1563379091339-03246963d19b?w=300&h=200&fit=crop",
    isOpen: false,
    featured: true,
    distance: 2.1
  }
];

export default function FoodBrowsing() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const { connected, address, disconnect } = useWallet();
  const { isVendor } = useVendorRegistry();
  const { isDeliveryAgent } = useDeliveryAgentRegistry();
  const { getDisplayPrice } = useCurrency();
  const { resetOnboarding } = useUserOnboarding();

  const shortAddress = address ? address.slice(0, 6) + "..." + address.slice(-4) : "";

  const handleVendorAction = () => {
    if (!connected) {
      setWalletModalOpen(true);
      return;
    }
    
    if (isVendor) {
      navigate("/vendor/dashboard");
    } else {
      navigate("/vendor/register");
    }
  };

  const handleDeliveryAgentAction = () => {
    if (!connected) {
      setWalletModalOpen(true);
      return;
    }
    
    if (isDeliveryAgent) {
      navigate("/delivery-agent/dashboard");
    } else {
      navigate("/delivery-agent/register");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <WalletConnectModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
      {/* Header with wallet connection */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-foreground">ChopChain</h1>
              <Badge variant="secondary" className="bg-gradient-rewards text-accent-foreground">
                <Zap className="w-3 h-3 mr-1" />
                Earn $CHOP
              </Badge>
            </div>

                                <div className="flex items-center space-x-3">
                                        <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    Lagos, NG
                  </div>
                  
                  {/* Reset Onboarding - For demo purposes */}
                  <button
                    onClick={resetOnboarding}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
                  >
                    Reset Tutorial
                  </button>
                      
                      {/* Rewards Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/rewards')}
                        className="hidden md:flex items-center space-x-2 rounded-xl border-accent/20 hover:bg-accent/5"
                      >
                        <Gift className="w-4 h-4" />
                        <span>Rewards</span>
                      </Button>
                      
                      {/* Vendor Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleVendorAction}
                        className="hidden md:flex items-center space-x-2 rounded-xl border-primary/20 hover:bg-primary/5"
                      >
                        <Store className="w-4 h-4" />
                        <span>{connected && isVendor ? "Dashboard" : "Become Vendor"}</span>
                      </Button>

                      {/* Delivery Agent Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeliveryAgentAction}
                        className="hidden lg:flex items-center space-x-2 rounded-xl border-secondary/20 hover:bg-secondary/5"
                      >
                        <Truck className="w-4 h-4" />
                        <span>{connected && isDeliveryAgent ? "Agent Dashboard" : "Deliver Food"}</span>
                      </Button>

                      {connected ? (
                        <Button
                          className="bg-gradient-trust text-primary-foreground"
                          onClick={disconnect}
                        >
                          {shortAddress}
                        </Button>
                      ) : (
                        <Button className="bg-gradient-sunset hover:shadow-glow" onClick={() => setWalletModalOpen(true)}>
                          Connect Wallet
                        </Button>
                      )}
                    </div>
          </div>

          {/* Search bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search for food, vendors..."
              className="pl-10 h-12 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Categories */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`whitespace-nowrap rounded-xl ${selectedCategory === category
                  ? "bg-gradient-hibiscus text-primary-foreground"
                  : "hover:bg-muted"
                  }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </section>

        {/* Featured Vendors */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Featured Vendors</h2>
            <Button variant="ghost" className="text-primary">
              View All
            </Button>
          </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {featuredVendors.map((vendor) => {
                     const deliveryFeeDisplay = getDisplayPrice(vendor.deliveryFee);
                     
                     return (
                       <Card
                         key={vendor.id}
                         className="overflow-hidden hover:shadow-card-hover transition-all duration-300 cursor-pointer rounded-2xl border-border"
                         onClick={() => window.location.href = '/vendor-details'}
                       >
                         <div className="relative">
                           <img 
                             src={vendor.image} 
                             alt={vendor.name}
                             className="h-48 w-full object-cover"
                           />
                           <Badge
                             className={`absolute top-3 right-3 ${vendor.isOpen
                               ? "bg-secondary text-secondary-foreground"
                               : "bg-muted text-muted-foreground"
                             }`}
                           >
                             {vendor.isOpen ? "Open" : "Closed"}
                           </Badge>
                           <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">
                             {deliveryFeeDisplay.display} delivery
                           </Badge>
                         </div>
                         <div className="p-4">
                           <div className="flex items-start justify-between mb-2">
                             <h3 className="font-semibold text-lg text-foreground">
                               {vendor.name}
                             </h3>
                             <div className="flex items-center space-x-1">
                               <Star className="w-4 h-4 fill-accent text-accent" />
                               <span className="text-sm font-medium">{vendor.rating}</span>
                             </div>
                           </div>
                           <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                             <div className="flex items-center space-x-1">
                               <Clock className="w-4 h-4" />
                               <span>{vendor.deliveryTime}</span>
                             </div>
                             <Badge variant="outline" className="text-xs">
                               {vendor.cuisine}
                             </Badge>
                           </div>
                           <div className="flex items-center justify-between">
                             <span className="text-sm text-muted-foreground">
                               {vendor.distance} km away
                             </span>
                             <Button
                               className="bg-gradient-sunset hover:shadow-glow rounded-xl"
                               size="sm"
                               disabled={!vendor.isOpen}
                             >
                               {vendor.isOpen ? "Order Now" : "Closed"}
                             </Button>
                           </div>
                         </div>
                       </Card>
                     );
                   })}
                 </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center cursor-pointer hover:shadow-card-hover transition-all rounded-xl border-border">
              <div className="w-12 h-12 bg-gradient-trust rounded-xl mx-auto mb-2 flex items-center justify-center">
                <span className="text-xl">🍲</span>
              </div>
              <p className="font-medium text-foreground">Order Again</p>
              <p className="text-xs text-muted-foreground">Quick reorder</p>
            </Card>

            <Card className="p-4 text-center cursor-pointer hover:shadow-card-hover transition-all rounded-xl border-border">
              <div className="w-12 h-12 bg-gradient-rewards rounded-xl mx-auto mb-2 flex items-center justify-center">
                <Zap className="w-6 h-6 text-accent-foreground" />
              </div>
              <p className="font-medium text-foreground">Earn $CHOP</p>
              <p className="text-xs text-muted-foreground">Reward tokens</p>
            </Card>

            <Card className="p-4 text-center cursor-pointer hover:shadow-card-hover transition-all rounded-xl border-border">
              <div className="w-12 h-12 bg-gradient-hibiscus rounded-xl mx-auto mb-2 flex items-center justify-center">
                <span className="text-xl">🎯</span>
              </div>
              <p className="font-medium text-foreground">Missions</p>
              <p className="text-xs text-muted-foreground">Complete tasks</p>
            </Card>

            <Card 
              className="p-4 text-center cursor-pointer hover:shadow-card-hover transition-all rounded-xl border-border"
              onClick={handleVendorAction}
            >
              <div className="w-12 h-12 bg-gradient-sunset rounded-xl mx-auto mb-2 flex items-center justify-center">
                <Store className="w-6 h-6 text-primary-foreground" />
              </div>
              <p className="font-medium text-foreground">
                {connected && isVendor ? "Dashboard" : "Sell Food"}
              </p>
              <p className="text-xs text-muted-foreground">
                {connected && isVendor ? "Manage orders" : "Join as vendor"}
              </p>
            </Card>
          </div>
        </section>

                    {/* CHOP Rewards Widget */}
            <section className="mb-8">
              <RewardsWidget 
                compact={true}
                showProgress={false}
                showActions={true}
                className="max-w-md mx-auto lg:max-w-none"
              />
            </section>

            {/* Earn with ChopChain Banner */}
            <section className="mb-8">
              <Card className="rounded-2xl bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/20">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-foreground">Earn with ChopChain</h3>
                      <p className="text-muted-foreground">
                        Join our delivery network and start earning money while helping your community
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Truck className="w-4 h-4 text-secondary" />
                          <span>Flexible hours</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-accent" />
                          <span>Build reputation</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="w-4 h-4 text-primary" />
                          <span>Earn CHOP tokens</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button
                        onClick={handleDeliveryAgentAction}
                        className="bg-gradient-trust hover:shadow-glow"
                      >
                        <Truck className="w-4 h-4 mr-2" />
                        {connected && isDeliveryAgent ? "Agent Dashboard" : "Become Delivery Agent"}
                      </Button>
                      <Button
                        onClick={handleVendorAction}
                        variant="outline"
                        className="border-primary/20 hover:bg-primary/5"
                      >
                        <Store className="w-4 h-4 mr-2" />
                        {connected && isVendor ? "Vendor Dashboard" : "Sell Food"}
                      </Button>
                      <Button
                        onClick={() => navigate('/earn')}
                        variant="outline"
                        className="border-accent/20 hover:bg-accent/5"
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        Earn More CHOP
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </section>
      </main>
    </div>
  );
}