import { useNavigate } from "react-router-dom";
import { useWallet } from "@/hooks/useWallet";
import { useVendorRegistry } from "@/hooks/useVendorRegistry";
import VendorOnboarding from "@/components/VendorOnboarding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useEffect } from "react";

export default function VendorRegistration() {
  const navigate = useNavigate();
  const { connected, address } = useWallet();
  const { isVendor, registerVendor, isLoading: registering } = useVendorRegistry();

  // Redirect to dashboard if already a vendor
  useEffect(() => {
    if (connected && isVendor) {
      navigate("/vendor/dashboard", { replace: true });
    }
  }, [connected, isVendor, navigate]);

  // If not connected, show connect wallet message
  if (!connected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-primary">Connect Your Wallet</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You need to connect your wallet to register as a vendor on ChopChain.
            </p>
            <div className="space-y-2">
              <Button 
                className="w-full bg-gradient-sunset"
                onClick={() => navigate("/")}
              >
                Connect Wallet
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If already a vendor, show success message
  if (isVendor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto rounded-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-trust rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-secondary">Already Registered</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You are already registered as a vendor on ChopChain.
            </p>
            <Button 
              className="w-full bg-gradient-sunset"
              onClick={() => navigate("/vendor/dashboard")}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show vendor onboarding form
  return <VendorOnboarding onRegister={registerVendor} isLoading={registering} />;
}