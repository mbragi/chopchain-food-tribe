import { useState } from "react";
import { ArrowLeft, Star, Clock, MapPin, Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
  spicyLevel?: number;
}

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Special Jollof Rice",
    description: "Perfectly seasoned rice with chicken and plantains",
    price: 15.99,
    image: "/placeholder.svg",
    category: "Rice",
    popular: true,
    spicyLevel: 2
  },
  {
    id: 2,
    name: "Pepper Soup (Catfish)",
    description: "Spicy traditional soup with fresh catfish",
    price: 22.50,
    image: "/placeholder.svg", 
    category: "Soup",
    spicyLevel: 3
  },
  {
    id: 3,
    name: "Egusi with Pounded Yam",
    description: "Melon seed stew with assorted meat and pounded yam",
    price: 18.75,
    image: "/placeholder.svg",
    category: "Swallow",
    popular: true,
    spicyLevel: 1
  },
  {
    id: 4,
    name: "Suya Platter",
    description: "Grilled spiced beef with onions and tomatoes",
    price: 12.00,
    image: "/placeholder.svg",
    category: "Protein",
    spicyLevel: 3
  },
  {
    id: 5,
    name: "Moi Moi",
    description: "Steamed bean pudding with fish and egg",
    price: 8.50,
    image: "/placeholder.svg",
    category: "Snacks",
    spicyLevel: 0
  }
];

const vendor = {
  name: "Mama Temi's Kitchen",
  rating: 4.8,
  reviews: 342,
  deliveryTime: "25-35 min",
  deliveryFee: 2.50,
  minOrder: 10.00,
  address: "Victoria Island, Lagos",
  isOpen: true,
  coverImage: "/placeholder.svg"
};

export default function VendorDetails() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<{[key: number]: number}>({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const categories = ["All", ...Array.from(new Set(menuItems.map(item => item.category)))];
  
  const filteredItems = selectedCategory === "All" 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const addToCart = (itemId: number) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) - 1)
    }));
  };

  const cartTotal = Object.entries(cart).reduce((total, [itemId, quantity]) => {
    const item = menuItems.find(i => i.id === parseInt(itemId));
    return total + (item?.price || 0) * quantity;
  }, 0);

  const cartItemCount = Object.values(cart).reduce((total, quantity) => total + quantity, 0);

  const getSpicyIndicator = (level: number | undefined) => {
    if (!level) return null;
    return "🌶️".repeat(level);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/")}
              className="rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex-1">
              <h1 className="text-xl font-semibold">{vendor.name}</h1>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4 fill-accent text-accent" />
                <span>{vendor.rating} ({vendor.reviews} reviews)</span>
                <span>•</span>
                <Clock className="w-4 h-4" />
                <span>{vendor.deliveryTime}</span>
              </div>
            </div>

            {cartItemCount > 0 && (
              <Button 
                onClick={() => navigate("/cart")}
                className="relative bg-gradient-sunset hover:shadow-glow rounded-xl"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
                <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground min-w-5 h-5 flex items-center justify-center p-0 text-xs">
                  {cartItemCount}
                </Badge>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Vendor Info */}
      <section className="relative">
        <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <span className="text-6xl">🍛</span>
        </div>
        
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="rounded-xl border-border">
              <CardContent className="p-4 text-center">
                <MapPin className="w-5 h-5 mx-auto mb-2 text-primary" />
                <p className="font-medium text-sm">Delivery</p>
                <p className="text-xs text-muted-foreground">${vendor.deliveryFee}</p>
              </CardContent>
            </Card>
            
            <Card className="rounded-xl border-border">
              <CardContent className="p-4 text-center">
                <Clock className="w-5 h-5 mx-auto mb-2 text-secondary" />
                <p className="font-medium text-sm">Time</p>
                <p className="text-xs text-muted-foreground">{vendor.deliveryTime}</p>
              </CardContent>
            </Card>
            
            <Card className="rounded-xl border-border">
              <CardContent className="p-4 text-center">
                <ShoppingCart className="w-5 h-5 mx-auto mb-2 text-accent" />
                <p className="font-medium text-sm">Min Order</p>
                <p className="text-xs text-muted-foreground">${vendor.minOrder}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-6">
        {/* Categories */}
        <section className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`whitespace-nowrap rounded-xl ${
                  selectedCategory === category 
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

        {/* Menu Items */}
        <section className="space-y-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden rounded-xl border-border hover:shadow-card-hover transition-all">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-foreground">{item.name}</h3>
                          {item.popular && (
                            <Badge className="bg-accent/20 text-accent-foreground text-xs">
                              Popular
                            </Badge>
                          )}
                          {getSpicyIndicator(item.spicyLevel) && (
                            <span className="text-xs">{getSpicyIndicator(item.spicyLevel)}</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                        <p className="text-lg font-bold text-primary">${item.price}</p>
                      </div>
                    </div>

                    {/* Add to cart controls */}
                    <div className="flex items-center space-x-2">
                      {cart[item.id] > 0 ? (
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 p-0 rounded-lg"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="font-medium w-8 text-center">{cart[item.id]}</span>
                          <Button
                            size="sm"
                            onClick={() => addToCart(item.id)}
                            className="w-8 h-8 p-0 rounded-lg bg-gradient-sunset"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => addToCart(item.id)}
                          className="bg-gradient-sunset hover:shadow-glow rounded-lg"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Item image */}
                  <div className="w-24 h-24 m-4 bg-gradient-to-br from-muted to-muted/60 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🍽️</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Floating cart summary */}
        {cartTotal > 0 && (
          <div className="fixed bottom-4 left-4 right-4 z-50">
            <Card className="bg-gradient-sunset text-primary-foreground rounded-2xl shadow-glow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{cartItemCount} items • ${cartTotal.toFixed(2)}</p>
                    <p className="text-sm opacity-90">
                      {cartTotal >= vendor.minOrder ? "Ready to checkout" : `$${(vendor.minOrder - cartTotal).toFixed(2)} more for delivery`}
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/cart")}
                    variant="secondary"
                    className="bg-background text-foreground hover:bg-background/90 rounded-xl"
                    disabled={cartTotal < vendor.minOrder}
                  >
                    View Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}