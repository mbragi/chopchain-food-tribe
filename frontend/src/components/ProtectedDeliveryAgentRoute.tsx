import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useWallet } from "@/hooks/useWallet";
import { useDeliveryAgentRegistry } from "@/hooks/useDeliveryAgentRegistry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Loader2 } from "lucide-react";

interface ProtectedDeliveryAgentRouteProps {
  children: ReactNode;
}

export default function ProtectedDeliveryAgentRoute({ children }: ProtectedDeliveryAgentRouteProps) {
  const { connected, address } = useWallet();
  const { isDeliveryAgent, isLoading } = useDeliveryAgentRegistry();

  // Show loading while checking delivery agent status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto rounded-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-sunset rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
            </div>
            <CardTitle className="text-primary">Verifying Access</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Checking your delivery agent registration status...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to home if not connected
  if (!connected) {
    return <Navigate to="/" replace />;
  }

  // Redirect to delivery agent registration if not a delivery agent
  if (!isDeliveryAgent) {
    return <Navigate to="/delivery-agent/register" replace />;
  }

  // User is a verified delivery agent, show the protected content
  return <>{children}</>;
}