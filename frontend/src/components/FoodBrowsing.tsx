import { useState } from "react";
import { Search, MapPin, Star, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { VendorCard, Vendor } from "@/components/VendorCard";
import WalletConnectModal from "@/components/ui/WalletConnectModal";
import chopchainLogo from "@/assets/chopchain-logo.png";
import { useWallet } from "@/hooks/useWallet";

const categories = [
  "All", "Jollof", "Soups", "Snacks", "Rice", "Protein", "Swallow", "Drinks"
];

const featuredVendors: Vendor[] = [
  {
    id: 1,
    name: "Mama Temi's Kitchen",
    rating: 4.8,
    deliveryTime: "25-35 min",
    category: "Traditional",
    image: "/placeholder.svg",
    specialties: ["Jollof Rice", "Pepper Soup"],
    priceRange: "$",
    isOpen: true
  },
  {
    id: 2,
    name: "Chop Life Lagos",
    rating: 4.6,
    deliveryTime: "15-25 min",
    category: "Fast Food",
    image: "/placeholder.svg",
    specialties: ["Shawarma", "Suya"],
    priceRange: "$$",
    isOpen: true
  },
  {
    id: 3,
    name: "Abuja Delight",
    rating: 4.9,
    deliveryTime: "30-40 min",
    category: "Premium",
    image: "/placeholder.svg",
    specialties: ["Egusi", "Pounded Yam"],
    priceRange: "$$$",
    isOpen: false
  }
];

export default function FoodBrowsing() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const { connected, address, disconnect } = useWallet();

  const shortAddress = address ? address.slice(0, 6) + "..." + address.slice(-4) : "";

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
            {featuredVendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onClick={() => window.location.href = '/vendor-details'}
                disabled={!vendor.isOpen}
              />
            ))}
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

            <Card className="p-4 text-center cursor-pointer hover:shadow-card-hover transition-all rounded-xl border-border">
              <div className="w-12 h-12 bg-gradient-sunset rounded-xl mx-auto mb-2 flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <p className="font-medium text-foreground">Wallet</p>
              <p className="text-xs text-muted-foreground">USDT balance</p>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}