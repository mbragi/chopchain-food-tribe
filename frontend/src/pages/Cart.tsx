import { useState } from "react";
import { Minus, Plus, ShoppingCart, CreditCard, Shield, Clock, Zap, Star, Gift, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useWallet } from "@/hooks/useWallet"; 
import { useRewards } from "@/hooks/useRewards";
import { useCurrency } from "@/hooks/useCurrency";
import { useEnhancedCheckout } from "@/hooks/useEnhancedCheckout";
import { useNavigate } from "react-router-dom";
import WalletConnectModal from "@/components/ui/WalletConnectModal";
import RewardsWidget from "@/components/RewardsWidget";

interface CartItem {
  id: string;
  name: string;
  priceUsdt: number; // Base price in USDT
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
  
  const {
    exchangeRates,
    formatNGN,
    formatUSDT,
    getDisplayPrice,
    getPriceBreakdown,
    areRatesStale,
    fetchExchangeRates,
    isLoading: currencyLoading
  } = useCurrency();

  const {
    checkoutState,
    processCheckout,
    balances
  } = useEnhancedCheckout();
  
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Jollof Rice with Chicken",
      priceUsdt: 7.58, // ~₦12,500 at current rate
      quantity: 2,
      vendor: "Mama's Kitchen",
      image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=100&h=100&fit=crop",
      special: "Spicy"
    },
    {
      id: "2", 
      name: "Grilled Fish with Plantain",
      priceUsdt: 9.09, // ~₦15,000 at current rate
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

  // Calculate prices using currency system
  const priceBreakdown = getPriceBreakdown(
    cartItems.map(item => ({ price: item.priceUsdt, quantity: item.quantity }))
  );

  // Calculate CHOP rewards (5% of total USDT amount)
  const baseRewardAmount = priceBreakdown.total.usdt * 0.05;
  const actualRewardAmount = baseRewardAmount * (rewardsConnected ? rewardMultiplier : 1);
  
  const formatTokens = (amount: number): string => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toFixed(1);
  };

  const handlePlaceOrder = async () => {
    if (!connected) {
      setWalletModalOpen(true);
      return;
    }
    
    // Mock vendor address - in production, this would come from the vendor data
    const vendorAddress = '0x742d35Cc6C4e8e37C9Fd5Bf5f54e61b7e3b2B2A1';
    const deliveryAddress = 'Block 5, Apartment 3B, Victoria Island, Lagos';
    
    const orderItems = cartItems.map(item => ({
      name: item.name,
      priceUsdt: item.priceUsdt,
      quantity: item.quantity,
      vendor: item.vendor
    }));

    const result = await processCheckout(orderItems, deliveryAddress, vendorAddress);
    
    if (result.success) {
      // Navigate to order confirmation with order ID
      navigate('/order-confirmation', { 
        state: { 
          orderId: result.orderId,
          transactionHash: checkoutState.transactionHash 
        }
      });
    }
    // Error handling is done in the hook with toast notifications
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
                                             <div className="text-right min-w-[100px]">
                         <p className="font-bold text-foreground">
                           {getDisplayPrice(item.priceUsdt * item.quantity).display}
                         </p>
                         <p className="text-sm text-muted-foreground">
                           {getDisplayPrice(item.priceUsdt).display} each
                         </p>
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
               <CardHeader className="flex flex-row items-center justify-between">
                 <CardTitle>Order Summary</CardTitle>
                 {areRatesStale && (
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={fetchExchangeRates}
                     disabled={currencyLoading}
                     className="h-8 px-2"
                   >
                     <RefreshCw className={`w-3 h-3 ${currencyLoading ? 'animate-spin' : ''}`} />
                   </Button>
                 )}
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="space-y-3">
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Subtotal</span>
                     <span className="font-medium">{priceBreakdown.subtotal.display}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Delivery Fee</span>
                     <span className="font-medium">{priceBreakdown.deliveryFee.display}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Service Fee</span>
                     <span className="font-medium">{priceBreakdown.serviceFee.display}</span>
                   </div>
                   
                   <Separator />
                   
                   <div className="flex justify-between text-lg font-bold">
                     <span>Total</span>
                     <span>{priceBreakdown.total.display}</span>
                   </div>

                   {/* Payment Amount in USDT */}
                   <div className="bg-muted/30 rounded-xl p-3">
                     <div className="flex justify-between items-center">
                       <span className="text-sm font-medium text-foreground">You'll pay</span>
                       <span className="font-bold text-primary">{priceBreakdown.payment.formatted}</span>
                     </div>
                     <div className="flex justify-between items-center mt-1">
                       <span className="text-xs text-muted-foreground">Exchange rate</span>
                       <span className="text-xs text-muted-foreground">
                         1 USDT = ₦{priceBreakdown.exchangeRate.toLocaleString()}
                       </span>
                     </div>
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
                   <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                     <span className="w-4 h-4 text-center">₦</span>
                     <span>Prices shown in NGN</span>
                   </div>
                 </div>

                 <Button 
                   className="w-full h-12 bg-gradient-sunset hover:shadow-glow text-lg font-semibold"
                   onClick={handlePlaceOrder}
                   disabled={checkoutState.isProcessing || !connected}
                 >
                   {checkoutState.isProcessing ? (
                     <>
                       <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                       {checkoutState.currentStep === 'approval' && 'Approving USDT...'}
                       {checkoutState.currentStep === 'placing' && 'Placing Order...'}
                       {checkoutState.currentStep === 'confirming' && 'Confirming...'}
                     </>
                   ) : connected ? (
                     <>
                       <CreditCard className="w-5 h-5 mr-2" />
                       Place Order • {priceBreakdown.payment.formatted}
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