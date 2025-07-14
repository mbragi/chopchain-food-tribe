import { useEffect, useState } from "react";
import { CheckCircle, Clock, MapPin, Wallet, ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { AnimeLoader } from "@/components/ui/AnimeLoader";

const orderStages = [
  { id: 1, name: "Order Placed", icon: CheckCircle, completed: true },
  { id: 2, name: "Preparing", icon: Clock, completed: false, current: true },
  { id: 3, name: "On the Way", icon: MapPin, completed: false },
  { id: 4, name: "Delivered", icon: CheckCircle, completed: false }
];

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(25);
  const [currentStage, setCurrentStage] = useState(1);

  // Simulate order progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 5;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (progress < 100) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <AnimeLoader size={64} />
        <p className="text-lg font-semibold text-accent mt-4">Order in progress...</p>
      </div>
    );
  }

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
            
            <div>
              <h1 className="text-xl font-semibold">Order Confirmation</h1>
              <p className="text-sm text-muted-foreground">Order #CHC-001234</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Success Message */}
        <Card className="mb-6 rounded-xl border-border bg-gradient-to-br from-secondary/5 to-secondary/10">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-secondary mb-2">Order Placed Successfully!</h2>
            <p className="text-muted-foreground">
              Your payment is secured in escrow and will be released upon delivery confirmation.
            </p>
          </CardContent>
        </Card>

        {/* Order Progress */}
        <Card className="mb-6 rounded-xl border-border">
          <CardHeader>
            <CardTitle>Order Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Estimated delivery time</span>
                <span className="font-medium">25-35 minutes</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-4">
              {orderStages.map((stage, index) => (
                <div key={stage.id} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    stage.completed 
                      ? "bg-secondary text-secondary-foreground" 
                      : stage.current
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    <stage.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      stage.completed || stage.current ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {stage.name}
                    </p>
                  </div>
                  {stage.current && (
                    <Badge className="bg-primary text-primary-foreground">
                      Current
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="mb-6 rounded-xl border-border">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Vendor</span>
              <span className="font-medium">Mama Temi's Kitchen</span>
            </div>
            <div className="flex justify-between">
              <span>Items</span>
              <span className="font-medium">2x Special Jollof Rice, 1x Pepper Soup</span>
            </div>
            <div className="flex justify-between">
              <span>Total Paid</span>
              <span className="font-medium">$56.99 USDT</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method</span>
              <div className="flex items-center space-x-2">
                <span>💰</span>
                <span className="font-medium">USDT (Base)</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span>Delivery Address</span>
              <span className="font-medium text-right">123 Victoria Island, Lagos</span>
            </div>
          </CardContent>
        </Card>

        {/* Escrow Info */}
        <Card className="mb-6 rounded-xl border-border bg-gradient-to-br from-accent/5 to-accent/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Wallet className="w-8 h-8 text-accent" />
              <div>
                <p className="font-semibold text-accent-foreground">Escrow Protection Active</p>
                <p className="text-sm text-muted-foreground">
                  Your $56.99 USDT is held safely until you confirm delivery
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rewards Earned */}
        <Card className="mb-6 rounded-xl border-border bg-gradient-rewards/10 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Zap className="w-8 h-8 text-accent" />
              <div>
                <p className="font-semibold text-accent-foreground">You Earned 25 $CHOP Tokens!</p>
                <p className="text-sm text-muted-foreground">
                  Tokens will be credited after delivery confirmation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={() => navigate("/order-tracking")}
          >
            Track Order
          </Button>
          
          <Button
            variant="ghost"
            className="w-full rounded-xl"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </Button>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-xl">
          <p className="text-sm text-muted-foreground text-center">
            Need help? Contact support via WhatsApp or in-app chat
          </p>
        </div>
      </main>
    </div>
  );
}