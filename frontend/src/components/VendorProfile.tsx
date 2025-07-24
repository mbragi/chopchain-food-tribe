import { useState } from "react";
import { 
  Store, 
  Edit, 
  Save, 
  Camera, 
  Star, 
  MapPin, 
  Clock,
  Phone,
  Mail,
  Wallet,
  Globe,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";

export default function VendorProfile() {
  const { toast } = useToast();
  const { address } = useWallet();
  const [isEditing, setIsEditing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  
  // Mock vendor data - in real app, this would come from your database
  const [vendorData, setVendorData] = useState({
    storeName: "Mama Temi's Kitchen",
    description: "Authentic Nigerian cuisine made with love and traditional recipes passed down through generations.",
    cuisine: "Nigerian, African",
    phone: "+234 801 234 5678",
    email: "mamatemi@chopchain.com",
    address: "15 Victoria Island, Lagos, Nigeria",
    deliveryRadius: "8",
    minOrder: "10.00",
    deliveryFee: "2.50",
    rating: 4.8,
    totalOrders: 127,
    joinDate: "March 2024"
  });

  const handleInputChange = (field: string, value: string) => {
    setVendorData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // In real app, save to database
    toast({
      title: "Profile Updated",
      description: "Your vendor profile has been updated successfully.",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="rounded-xl border-border">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-sunset rounded-xl flex items-center justify-center">
                  <Store className="w-10 h-10 text-primary-foreground" />
                </div>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 w-8 h-8 p-0 rounded-full"
                  variant="outline"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    {vendorData.storeName}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className={isOnline ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}
                    >
                      {isOnline ? "Online" : "Offline"} 
                    </Badge>
                    <Switch checked={isOnline} onCheckedChange={setIsOnline} />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span>{vendorData.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Package className="w-4 h-4" />
                    <span>{vendorData.totalOrders} orders</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Joined {vendorData.joinDate}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Wallet className="w-4 h-4" />
                  <span className="font-mono">{address}</span>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className={isEditing ? "bg-gradient-trust" : "bg-gradient-sunset"}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>

          {/* Store Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Store Description</Label>
            {isEditing ? (
              <Textarea
                id="description"
                value={vendorData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="rounded-xl"
                rows={3}
              />
            ) : (
              <p className="text-muted-foreground">{vendorData.description}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Store Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card className="rounded-xl border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-primary" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={vendorData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="mt-1 rounded-xl"
                />
              ) : (
                <p className="mt-1 text-foreground">{vendorData.phone}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={vendorData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="mt-1 rounded-xl"
                />
              ) : (
                <p className="mt-1 text-foreground">{vendorData.email}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="cuisine">Cuisine Type</Label>
              {isEditing ? (
                <Input
                  id="cuisine"
                  value={vendorData.cuisine}
                  onChange={(e) => handleInputChange("cuisine", e.target.value)}
                  className="mt-1 rounded-xl"
                />
              ) : (
                <p className="mt-1 text-foreground">{vendorData.cuisine}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Store Settings */}
        <Card className="rounded-xl border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-secondary" />
              <span>Store Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Store Address</Label>
              {isEditing ? (
                <Input
                  id="address"
                  value={vendorData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="mt-1 rounded-xl"
                />
              ) : (
                <p className="mt-1 text-foreground">{vendorData.address}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deliveryRadius">Delivery Radius (km)</Label>
                {isEditing ? (
                  <Input
                    id="deliveryRadius"
                    type="number"
                    value={vendorData.deliveryRadius}
                    onChange={(e) => handleInputChange("deliveryRadius", e.target.value)}
                    className="mt-1 rounded-xl"
                  />
                ) : (
                  <p className="mt-1 text-foreground">{vendorData.deliveryRadius} km</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="minOrder">Min Order ($)</Label>
                {isEditing ? (
                  <Input
                    id="minOrder"
                    type="number"
                    step="0.50"
                    value={vendorData.minOrder}
                    onChange={(e) => handleInputChange("minOrder", e.target.value)}
                    className="mt-1 rounded-xl"
                  />
                ) : (
                  <p className="mt-1 text-foreground">${vendorData.minOrder}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="deliveryFee">Delivery Fee ($)</Label>
              {isEditing ? (
                <Input
                  id="deliveryFee"
                  type="number"
                  step="0.25"
                  value={vendorData.deliveryFee}
                  onChange={(e) => handleInputChange("deliveryFee", e.target.value)}
                  className="mt-1 rounded-xl"
                />
              ) : (
                <p className="mt-1 text-foreground">${vendorData.deliveryFee}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout Settings */}
      <Card className="rounded-xl border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-accent" />
            <span>Payout Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Blockchain Payouts</p>
                <p className="text-sm text-muted-foreground">
                  Receive payments directly to your wallet address via escrow
                </p>
              </div>
              <Badge className="bg-gradient-trust text-primary-foreground">
                Active
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-border rounded-xl">
              <p className="font-medium text-foreground">Wallet Address</p>
              <p className="text-sm text-muted-foreground font-mono mt-1">{address}</p>
            </div>
            
            <div className="p-4 border border-border rounded-xl">
              <p className="font-medium text-foreground">Supported Tokens</p>
              <div className="flex space-x-2 mt-2">
                <Badge variant="outline">USDT</Badge>
                <Badge variant="outline">USDC</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}