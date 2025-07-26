import { useState } from "react";
import { Store, Phone, Mail, MapPin, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface VendorOnboardingProps {
  onRegister: () => Promise<any>;
  isLoading: boolean;
}

export default function VendorOnboarding({ 
  onRegister, 
  isLoading 
}: VendorOnboardingProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    storeName: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    cuisine: "",
    deliveryRadius: "5",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For now, we'll just register on blockchain
    // TODO: Store business details in database or IPFS
    console.log("Business details collected:", formData);
    
    try {
      // Register vendor on blockchain
      const success = await onRegister();
      
      if (success) {
        toast({
          title: "Registration Successful!",
          description: "Your vendor account has been created. Welcome to ChopChain!",
        });
        
        // TODO: Save business details to database
        console.log("Business details to be stored:", formData);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        title: "Registration Failed",
        description: "Failed to register vendor. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full rounded-2xl border-border">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-gradient-sunset rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl text-foreground">
            Join ChopChain as a Vendor
          </CardTitle>
          <p className="text-muted-foreground">
            Start earning with blockchain-powered food delivery
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-xl">
            <div className="text-center">
              <Wallet className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="font-medium text-sm">Instant Payments</p>
            </div>
            <div className="text-center">
              <Badge className="bg-gradient-rewards text-accent-foreground mb-2">
                5% Rewards
              </Badge>
              <p className="font-medium text-sm">CHOP Token Rewards</p>
            </div>
            <div className="text-center">
              <Store className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="font-medium text-sm">Global Reach</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Store Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Store Information
              </h3>
              
              <div>
                <Label htmlFor="storeName">Store Name *</Label>
                <Input
                  id="storeName"
                  value={formData.storeName}
                  onChange={(e) => 
                    handleInputChange("storeName", e.target.value)
                  }
                  placeholder="e.g., Mama Temi's Kitchen"
                  className="mt-1 rounded-xl"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => 
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Tell customers about your amazing food..."
                  className="mt-1 rounded-xl min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="cuisine">Cuisine Type</Label>
                <Input
                  id="cuisine"
                  value={formData.cuisine}
                  onChange={(e) => 
                    handleInputChange("cuisine", e.target.value)
                  }
                  placeholder="e.g., Nigerian, African, Continental"
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => 
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="+234 801 234 5678"
                      className="pl-10 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => 
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="vendor@example.com"
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Location</h3>
              
              <div>
                <Label htmlFor="address">Store Address *</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => 
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="123 Victoria Island, Lagos, Nigeria"
                    className="pl-10 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="deliveryRadius">Delivery Radius (km)</Label>
                <Input
                  id="deliveryRadius"
                  type="number"
                  value={formData.deliveryRadius}
                  onChange={(e) => 
                    handleInputChange("deliveryRadius", e.target.value)
                  }
                  placeholder="5"
                  className="mt-1 rounded-xl"
                  min="1"
                  max="50"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-gradient-sunset hover:shadow-glow rounded-xl"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    Registering...
                  </div>
                ) : (
                  <>
                    <Store className="w-4 h-4 mr-2" />
                    Register as Vendor
                  </>
                )}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-3">
                By registering, you agree to ChopChain&apos;s vendor terms and conditions.
                Your wallet address will be registered on the blockchain.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}