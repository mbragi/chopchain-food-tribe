import { useNavigate } from "react-router-dom";
import { useWallet } from "@/hooks/useWallet";
import { useDeliveryAgentRegistry } from "@/hooks/useDeliveryAgentRegistry";
import DeliveryAgentOnboarding from "@/components/DeliveryAgentOnboarding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useEffect } from "react";

export default function DeliveryAgentRegistration() {
  const navigate = useNavigate();
  const { connected, address } = useWallet();
  const { isDeliveryAgent, registerDeliveryAgent, isLoading: registering } = useDeliveryAgentRegistry();

  // Redirect to dashboard if already a delivery agent
  useEffect(() => {
    if (connected && isDeliveryAgent) {
      navigate("/delivery-agent/dashboard", { replace: true });
    }
  }, [connected, isDeliveryAgent, navigate]);

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
              You need to connect your wallet to register as a delivery agent on ChopChain.
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

  // If already a delivery agent, show success message
  if (isDeliveryAgent) {
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
              You are already registered as a delivery agent on ChopChain.
            </p>
            <Button 
              className="w-full bg-gradient-sunset"
              onClick={() => navigate("/delivery-agent/dashboard")}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show delivery agent onboarding form
  return <DeliveryAgentOnboarding onRegister={registerDeliveryAgent} isLoading={registering} />;
}