import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Clock, DollarSign } from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  location: string;
  specialOffer?: string;
}

const FrameApp = () => {
  const [featuredVendors] = useState<Vendor[]>([
    {
      id: "1",
      name: "Mama's Kitchen",
      image: "/placeholder.svg",
      cuisine: "Nigerian",
      rating: 4.8,
      deliveryTime: "25-35 min",
      deliveryFee: "₦200",
      location: "Lagos Island",
      specialOffer: "20% off first order"
    },
    {
      id: "2", 
      name: "Jollof Express",
      image: "/placeholder.svg",
      cuisine: "West African",
      rating: 4.6,
      deliveryTime: "30-40 min",
      deliveryFee: "₦300",
      location: "Victoria Island"
    },
    {
      id: "3",
      name: "Suya Palace",
      image: "/placeholder.svg", 
      cuisine: "Grills",
      rating: 4.7,
      deliveryTime: "20-30 min",
      deliveryFee: "₦250",
      location: "Ikeja"
    }
  ]);

  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const handleVendorSelect = (vendor: Vendor) => {
    setSelectedVendor(vendor);
  };

  const handleOrderNow = () => {
    // In a real frame, this would integrate with smart contracts
    alert(`🍽️ Redirecting to ${selectedVendor?.name || 'ChopChain'} for ordering!`);
  };

  const handleBackToList = () => {
    setSelectedVendor(null);
  };

  if (selectedVendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={handleBackToList}>
              ← Back
            </Button>
            <img src="/chopchain-logo.png" alt="ChopChain" className="h-8" />
          </div>

          {/* Vendor Details */}
          <Card className="mb-6">
            <CardHeader className="text-center">
              <img 
                src={selectedVendor.image} 
                alt={selectedVendor.name}
                className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
              />
              <CardTitle className="text-2xl">{selectedVendor.name}</CardTitle>
              <CardDescription className="flex items-center justify-center gap-2">
                <Badge variant="secondary">{selectedVendor.cuisine}</Badge>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{selectedVendor.rating}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedVendor.deliveryTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>Delivery: {selectedVendor.deliveryFee}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedVendor.location}</span>
                </div>
                {selectedVendor.specialOffer && (
                  <Badge className="w-full bg-green-100 text-green-800 justify-center">
                    🎉 {selectedVendor.specialOffer}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleOrderNow}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg"
            >
              🍽️ Order Now
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open('https://chopchain.com', '_blank')}
            >
              🌐 Open Full App
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground mt-6">
            <p>Powered by ChopChain 🚀</p>
            <p>Decentralized food delivery for Africa</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <img src="/chopchain-logo.png" alt="ChopChain" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🍽️ ChopChain
          </h1>
          <p className="text-gray-600">
            Decentralized food delivery for Africa
          </p>
        </div>

        {/* Featured Vendors */}
        <div className="space-y-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">🔥 Featured Restaurants</h2>
          
          {featuredVendors.map((vendor) => (
            <Card 
              key={vendor.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleVendorSelect(vendor)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={vendor.image}
                    alt={vendor.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">{vendor.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{vendor.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{vendor.cuisine}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {vendor.deliveryTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {vendor.deliveryFee}
                      </span>
                    </div>
                    {vendor.specialOffer && (
                      <Badge className="mt-2 bg-green-100 text-green-800 text-xs">
                        🎉 {vendor.specialOffer}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg"
            onClick={() => window.open('https://chopchain.com', '_blank')}
          >
            🌐 Explore All Restaurants
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.open('https://github.com/chopchain', '_blank')}
          >
            💻 View on GitHub
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-6">
          <p>Built with ❤️ for Web3 food lovers</p>
          <p className="mt-1">Share to spread the word! 🚀</p>
        </div>
      </div>
    </div>
  );
};

export default FrameApp;