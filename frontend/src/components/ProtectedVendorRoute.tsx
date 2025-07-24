import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useWallet } from "@/hooks/useWallet";
import { useVendorRegistry } from "@/hooks/useVendorRegistry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2 } from "lucide-react";

interface ProtectedVendorRouteProps {
  children: ReactNode;
}

export default function ProtectedVendorRoute({ children }: ProtectedVendorRouteProps) {
  const { connected, address } = useWallet();
  const { isVendor, isLoading } = useVendorRegistry();

  // Show loading while checking vendor status
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
              Checking your vendor registration status...
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

  // Redirect to vendor registration if not a vendor
  if (!isVendor) {
    return <Navigate to="/vendor/register" replace />;
  }

  // User is a verified vendor, show the protected content
  return <>{children}</>;
}