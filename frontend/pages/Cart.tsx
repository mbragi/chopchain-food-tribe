import { useState } from "react";
import { ArrowLeft, MapPin, Clock, Wallet, CreditCard, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/hooks/useWallet";
import { useCart } from "@/hooks/useCart";

export default function Cart() {
  const navigate = useNavigate();
  const { items: cartItems, total: cartTotal } = useCart();
  const { connected, address, balance } = useWallet();
  const [selectedPayment, setSelectedPayment] = useState("usdt");
  const [deliveryAddress, setDeliveryAddress] = useState("123 Victoria Island, Lagos");
  const [phoneNumber, setPhoneNumber] = useState("+234 801 234 5678");

  // Remove subtotal, deliveryFee, serviceFee, total, paymentMethods, selectedMethod, hasInsufficientFunds
  // Use mock stablecoin balance from wallet
  const deliveryFee = 2.50;
  const serviceFee = 1.25;
  const total = cartTotal + deliveryFee + serviceFee;
  const hasInsufficientFunds = balance < total;

  const handlePlaceOrder = () => {
    // Mock escrow transaction
    console.log("Placing order with escrow...");
    // Navigate to order confirmation
    navigate("/order-confirmation");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <div>
              <h1 className="text-xl font-semibold">Your Cart</h1>
              <p className="text-sm text-muted-foreground">{cartItems.length} items</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Order Items */}
        <Card className="mb-6 rounded-xl border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Order from Vendor</span>
              <Badge className="bg-secondary text-secondary-foreground">
                <Clock className="w-3 h-3 mr-1" />
                25-35 min
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Delivery Details */}
        <Card className="mb-6 rounded-xl border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              Delivery Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Delivery Address</Label>
              <Input
                id="address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="mb-6 rounded-xl border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border">
              <div>
                <p className="font-semibold">Mock Stablecoin</p>
                <p className="text-xs text-muted-foreground">Wallet: {address}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">${balance.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
            </div>
            {hasInsufficientFunds && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                <p className="text-sm text-destructive font-medium">Insufficient balance</p>
                <p className="text-xs text-destructive/80 mt-1">
                  You need ${(total - balance).toFixed(2)} more
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Escrow Protection */}
        <Card className="mb-6 rounded-xl border-border bg-gradient-to-br from-secondary/5 to-secondary/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-secondary" />
              <div>
                <p className="font-semibold text-secondary">Escrow Protection</p>
                <p className="text-sm text-muted-foreground">
                  Your payment is held safely until delivery is confirmed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="mb-6 rounded-xl border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service Fee</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            {/* $CHOP Rewards */}
            <div className="bg-gradient-rewards/10 p-3 rounded-xl border border-accent/20">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent-foreground">
                  Earn 25 $CHOP tokens with this order!
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Place Order Button */}
        <Button
          className="w-full rounded-xl"
          size="lg"
          disabled={hasInsufficientFunds}
          onClick={handlePlaceOrder}
        >
          <Shield className="w-4 h-4 mr-2" />
          Place Order (Escrow)
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-4">
          By placing this order, you agree to our terms and escrow policy.
          Payment will be held until delivery is confirmed.
        </p>
      </main>
    </div>
  );
}