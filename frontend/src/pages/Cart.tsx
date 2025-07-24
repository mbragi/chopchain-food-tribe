import { useState } from "react";
import { Minus, Plus, ShoppingCart, CreditCard, Shield, Clock, Zap, Star, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useWallet } from "@/hooks/useWallet"; 
import { useRewards } from "@/hooks/useRewards";
import { useNavigate } from "react-router-dom";
import WalletConnectModal from "@/components/ui/WalletConnectModal";
import RewardsWidget from "@/components/RewardsWidget";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  vendor: string;
  image: string;
  special?: string;
}

export default function Cart() {
  const navigate = useNavigate();
  const { connected } = useWallet();
  const { 
    chopBalance, 
    userLevel, 
    rewardMultiplier, 
    connected: rewardsConnected,
    getUserLevel,
    getRewardMultiplier
  } = useRewards();
  
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Jollof Rice with Chicken",
      price: 12.50,
      quantity: 2,
      vendor: "Mama's Kitchen",
      image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=100&h=100&fit=crop",
      special: "Spicy"
    },
    {
      id: "2", 
      name: "Grilled Fish with Plantain",
      price: 15.00,
      quantity: 1,
      vendor: "Mama's Kitchen",
      image: "https://images.unsplash.com/photo-1544943342-0c3d1b5e7e21?w=100&h=100&fit=crop"
    }
  ]);

  const updateQuantity = (id: string, change: number) => {
    setCartItems(items => 
      items.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 2.50;
  const serviceFee = 1.25;
  const total = subtotal + deliveryFee + serviceFee;

  // Calculate CHOP rewards (5% of total)
  const baseRewardAmount = total * 0.05;
  const actualRewardAmount = baseRewardAmount * (rewardsConnected ? rewardMultiplier : 1);
  
  const formatTokens = (amount: number): string => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toFixed(1);
  };

  const handlePlaceOrder = () => {
    if (!connected) {
      setWalletModalOpen(true);
      return;
    }
    // Navigate to order confirmation
    navigate('/order-confirmation');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto rounded-2xl">
          <CardHeader className="text-center">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Your cart is empty</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Add some delicious food to get started!
            </p>
            <Button 
              className="w-full bg-gradient-sunset"
              onClick={() => navigate('/')}
            >
              Browse Food
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <WalletConnectModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
      
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Your Order</h1>
              <p className="text-muted-foreground">
                Review and confirm your delicious choices
              </p>
            </div>
            <Button variant="ghost" onClick={() => navigate('/')}>
              ← Continue Shopping
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items List */}
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Order Items</span>
                  <Badge variant="secondary">{cartItems.length} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-muted/30 rounded-xl">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.vendor}</p>
                      {item.special && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {item.special}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="font-bold text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* CHOP Rewards Preview */}
            {connected && rewardsConnected && (
              <Card className="rounded-2xl border-border bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-accent" />
                    <span>Reward Preview</span>
                    <Badge className="bg-gradient-rewards text-accent-foreground">
                      {rewardMultiplier}x Multiplier
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">You'll earn with this order:</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-accent">
                          +{formatTokens(actualRewardAmount)} CHOP
                        </span>
                        {rewardMultiplier > 1 && (
                          <div className="text-sm text-muted-foreground">
                            <span className="line-through">{formatTokens(baseRewardAmount)}</span>
                            <span className="ml-1 text-accent font-medium">
                              (+{formatTokens(actualRewardAmount - baseRewardAmount)} bonus)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-sm">
                        <span className={`${userLevel.color}`}>{userLevel.icon}</span>
                        <span className="text-muted-foreground">{userLevel.level} Level</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Current balance: {formatTokens(chopBalance)} CHOP
                      </p>
                    </div>
                  </div>

                  {/* Level up preview */}
                  {rewardMultiplier < 2.0 && (
                    <div className="bg-secondary/10 rounded-xl p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-medium text-foreground">Level Up Rewards</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Reach higher levels to unlock better multipliers! 
                        Diamond level gets 2.0x rewards on every order.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Delivery Information */}
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Delivery Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Standard Delivery</p>
                      <p className="text-sm text-muted-foreground">25-35 minutes</p>
                    </div>
                  </div>
                  <p className="font-bold text-foreground">${deliveryFee.toFixed(2)}</p>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>📍 Delivering to: Victoria Island, Lagos</p>
                  <p>🏠 Block 5, Apartment 3B</p>
                  <p>📞 +234 808 123 4567</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            {/* Rewards Widget */}
            <RewardsWidget 
              compact={false}
              showProgress={true}
              className="lg:block hidden"
            />

            {/* Order Summary */}
            <Card className="rounded-2xl border-border sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span className="font-medium">${serviceFee.toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>

                  {/* Rewards Earning Summary */}
                  {connected && rewardsConnected && (
                    <div className="bg-accent/10 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-accent" />
                          <span className="text-sm font-medium">You'll earn</span>
                        </div>
                        <span className="font-bold text-accent">
                          +{formatTokens(actualRewardAmount)} CHOP
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        5% rewards • {rewardMultiplier}x multiplier applied
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>Escrow protection active</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <CreditCard className="w-4 h-4" />
                    <span>Paying with USDT</span>
                  </div>
                </div>

                <Button 
                  className="w-full h-12 bg-gradient-sunset hover:shadow-glow text-lg font-semibold"
                  onClick={handlePlaceOrder}
                >
                  {connected ? (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Place Order • ${total.toFixed(2)}
                    </>
                  ) : (
                    <>
                      Connect Wallet to Order
                    </>
                  )}
                </Button>

                {!connected && (
                  <p className="text-xs text-muted-foreground text-center">
                    Connect your wallet to place order and start earning CHOP rewards
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}