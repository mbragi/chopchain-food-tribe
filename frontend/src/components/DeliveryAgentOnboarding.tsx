import { useState } from "react";
import { Truck, Phone, Mail, MapPin, Shield, DollarSign, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface DeliveryAgentOnboardingProps {
  onRegister: () => Promise<any>;
  isLoading: boolean;
}

export default function DeliveryAgentOnboarding({ onRegister, isLoading }: DeliveryAgentOnboardingProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    location: "",
    vehicleType: "",
    experience: "",
    availability: [] as string[]
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvailabilityChange = (day: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      availability: checked 
        ? [...prev.availability, day]
        : prev.availability.filter(d => d !== day)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fullName || !formData.phone || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive"
      });
      return;
    }

    // Register delivery agent on blockchain
    const success = await onRegister();
    
    if (success) {
      // In a real app, you'd also save the personal details to a database
      toast({
        title: "Registration Successful!",
        description: "Welcome to ChopChain! You can now start accepting deliveries.",
      });
    }
  };

  const availabilityDays = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full rounded-2xl border-border">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-gradient-sunset rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl text-foreground">Join ChopChain as a Delivery Agent</CardTitle>
          <p className="text-muted-foreground">
            Earn money delivering food with blockchain-powered transparency
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-xl">
            <div className="text-center">
              <DollarSign className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="font-medium text-sm">Competitive Pay</p>
              <p className="text-xs text-muted-foreground">Fair rates + tips</p>
            </div>
            <div className="text-center">
              <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="font-medium text-sm">Secure Payments</p>
              <p className="text-xs text-muted-foreground">Blockchain escrow</p>
            </div>
            <div className="text-center">
              <Star className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="font-medium text-sm">Build Reputation</p>
              <p className="text-xs text-muted-foreground">On-chain ratings</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
              
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Your full name"
                  className="mt-1 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
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
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="agent@example.com"
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="location">Service Area *</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Lagos, Nigeria"
                    className="pl-10 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Input
                  id="vehicleType"
                  value={formData.vehicleType}
                  onChange={(e) => handleInputChange("vehicleType", e.target.value)}
                  placeholder="e.g., Motorcycle, Bicycle, Car"
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>

            {/* Work Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Work Information</h3>
              
              <div>
                <Label htmlFor="experience">Delivery Experience</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  placeholder="Tell us about your delivery experience..."
                  className="mt-1 rounded-xl min-h-[100px]"
                />
              </div>

              <div>
                <Label>Availability</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availabilityDays.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={formData.availability.includes(day)}
                        onCheckedChange={(checked) => handleAvailabilityChange(day, checked as boolean)}
                      />
                      <Label htmlFor={day} className="text-sm">{day}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="p-4 bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl">
                <h4 className="font-semibold text-accent-foreground mb-2">Requirements</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Valid ID and phone number</li>
                  <li>• Reliable transportation</li>
                  <li>• Smartphone for order management</li>
                  <li>• Professional and punctual attitude</li>
                </ul>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
                  I agree to ChopChain's delivery agent terms and conditions, privacy policy, 
                  and understand that my wallet address will be registered on the blockchain.
                </Label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="lg:col-span-2 pt-4">
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
                    <Truck className="w-4 h-4 mr-2" />
                    Register as Delivery Agent
                  </>
                )}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-3">
                Your registration will be recorded on the blockchain for transparency and trust.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}