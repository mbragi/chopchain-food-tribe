import { useState } from "react";
import { Store, Phone, Mail, MapPin, Camera, Wallet, Clock, DollarSign, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { VendorRegistrationData } from "@/hooks/useVendorRegistry";
import { parseEther } from "ethers";

interface VendorOnboardingProps {
  onRegister: (vendorData: VendorRegistrationData) => Promise<any>;
  isLoading: boolean;
}

export default function VendorOnboarding({ onRegister, isLoading }: VendorOnboardingProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    storeName: "",
    description: "",
    cuisineTypes: [""],
    contactPhone: "",
    contactEmail: "",
    physicalAddress: "",
    deliveryRadius: "10",
    minimumOrder: "5.00",
    deliveryFee: "2.50",
    preparationTime: "30"
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCuisineChange = (index: number, value: string) => {
    const newCuisineTypes = [...formData.cuisineTypes];
    newCuisineTypes[index] = value;
    setFormData(prev => ({ ...prev, cuisineTypes: newCuisineTypes }));
  };

  const addCuisineType = () => {
    if (formData.cuisineTypes.length < 5) {
      setFormData(prev => ({ 
        ...prev, 
        cuisineTypes: [...prev.cuisineTypes, ""] 
      }));
    }
  };

  const removeCuisineType = (index: number) => {
    if (formData.cuisineTypes.length > 1) {
      const newCuisineTypes = formData.cuisineTypes.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, cuisineTypes: newCuisineTypes }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.storeName || !formData.contactPhone || !formData.physicalAddress) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Store Name, Phone, Address)",
        variant: "destructive"
      });
      return;
    }

    // Validate cuisine types
    const validCuisineTypes = formData.cuisineTypes.filter(cuisine => cuisine.trim() !== "");
    if (validCuisineTypes.length === 0) {
      toast({
        title: "Missing Cuisine Information",
        description: "Please specify at least one cuisine type",
        variant: "destructive"
      });
      return;
    }

    // Convert form data to blockchain format
    try {
      const vendorData: VendorRegistrationData = {
        storeName: formData.storeName,
        description: formData.description,
        cuisineTypes: validCuisineTypes,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        physicalAddress: formData.physicalAddress,
        deliveryRadius: parseInt(formData.deliveryRadius),
        minimumOrder: parseEther(formData.minimumOrder).toString(),
        deliveryFee: parseEther(formData.deliveryFee).toString(),
        preparationTime: parseInt(formData.preparationTime),
      };

      // Register vendor on blockchain with comprehensive data
      const success = await onRegister(vendorData);
      
      if (success) {
        toast({
          title: "Registration Successful!",
          description: "Your vendor profile has been created on-chain. Welcome to ChopChain!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to process registration data",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full rounded-2xl border-border">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-gradient-sunset rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl text-foreground">Join ChopChain as a Vendor</CardTitle>
          <p className="text-muted-foreground">
            Create your comprehensive on-chain restaurant profile
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
              <Badge className="bg-gradient-rewards text-accent-foreground mb-2">5% Rewards</Badge>
              <p className="font-medium text-sm">CHOP Token Rewards</p>
            </div>
            <div className="text-center">
              <Store className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="font-medium text-sm">On-Chain Profile</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Store Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Store className="w-5 h-5" />
                Store Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="storeName">Store Name *</Label>
                  <Input
                    id="storeName"
                    value={formData.storeName}
                    onChange={(e) => handleInputChange("storeName", e.target.value)}
                    placeholder="e.g., Mama Temi's Kitchen"
                    className="mt-1 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="preparationTime">Average Preparation Time (minutes) *</Label>
                  <Input
                    id="preparationTime"
                    type="number"
                    min="5"
                    max="300"
                    value={formData.preparationTime}
                    onChange={(e) => handleInputChange("preparationTime", e.target.value)}
                    className="mt-1 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Tell customers about your amazing food..."
                  className="mt-1 rounded-xl min-h-[80px]"
                />
              </div>

              {/* Cuisine Types */}
              <div>
                <Label>Cuisine Types *</Label>
                <div className="space-y-2 mt-1">
                  {formData.cuisineTypes.map((cuisine, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={cuisine}
                        onChange={(e) => handleCuisineChange(index, e.target.value)}
                        placeholder={`Cuisine type ${index + 1} (e.g., Nigerian, Continental)`}
                        className="rounded-xl"
                      />
                      {formData.cuisineTypes.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeCuisineType(index)}
                          className="rounded-xl"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {formData.cuisineTypes.length < 5 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addCuisineType}
                      className="w-full rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Another Cuisine Type
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactPhone">Phone Number *</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                    placeholder="+234 801 234 5678"
                    className="mt-1 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contactEmail">Email Address</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                    placeholder="restaurant@chopchain.com"
                    className="mt-1 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="physicalAddress">Restaurant Address *</Label>
                <Textarea
                  id="physicalAddress"
                  value={formData.physicalAddress}
                  onChange={(e) => handleInputChange("physicalAddress", e.target.value)}
                  placeholder="15 Victoria Island, Lagos, Nigeria"
                  className="mt-1 rounded-xl min-h-[60px]"
                  required
                />
              </div>
            </div>

            {/* Business Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Business Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="deliveryRadius">Delivery Radius (km) *</Label>
                  <Input
                    id="deliveryRadius"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.deliveryRadius}
                    onChange={(e) => handleInputChange("deliveryRadius", e.target.value)}
                    className="mt-1 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="minimumOrder">Minimum Order (USD) *</Label>
                  <Input
                    id="minimumOrder"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.minimumOrder}
                    onChange={(e) => handleInputChange("minimumOrder", e.target.value)}
                    className="mt-1 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="deliveryFee">Delivery Fee (USD) *</Label>
                  <Input
                    id="deliveryFee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.deliveryFee}
                    onChange={(e) => handleInputChange("deliveryFee", e.target.value)}
                    className="mt-1 rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Note about business hours */}
            <div className="p-4 bg-muted/50 rounded-xl">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Business Hours</p>
                  <p className="text-sm text-muted-foreground">
                    Default hours are set to 9:00 AM - 9:00 PM daily. You can customize these after registration in your vendor dashboard.
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-6 text-lg font-semibold rounded-xl bg-gradient-sunset hover:bg-gradient-sunset/90"
              disabled={isLoading}
            >
              {isLoading ? "Creating On-Chain Profile..." : "Create Vendor Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}