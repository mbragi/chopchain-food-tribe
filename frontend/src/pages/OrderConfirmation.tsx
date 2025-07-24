import { useState, useEffect } from "react";
import { CheckCircle, Clock, MapPin, Zap, Star, Gift, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/hooks/useWallet";
import { useRewards } from "@/hooks/useRewards";
import RewardsWidget from "@/components/RewardsWidget";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const { connected, address } = useWallet();
  const {
    chopBalance,
    userLevel,
    nextMilestone,
    rewardMultiplier,
    connected: rewardsConnected,
    refetchBalance
  } = useRewards();

  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [rewardsEarned, setRewardsEarned] = useState(0);

  // Mock order data
  const orderData = {
    orderId: "CHOPv2-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    vendor: "Mama's Kitchen",
    items: [
      { name: "Jollof Rice with Chicken", quantity: 2, price: 12.50 },
      { name: "Grilled Fish with Plantain", quantity: 1, price: 15.00 }
    ],
    subtotal: 40.00,
    deliveryFee: 2.50,
    serviceFee: 1.25,
    total: 43.75,
    estimatedDelivery: "25-35 minutes",
    deliveryAddress: "Block 5, Apartment 3B, Victoria Island, Lagos"
  };

  // Calculate rewards earned (5% of total)
  const baseRewardAmount = orderData.total * 0.05;
  const actualRewardAmount = baseRewardAmount * (rewardsConnected ? rewardMultiplier : 1);

  const formatTokens = (amount: number): string => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toFixed(1);
  };

  // Simulate reward earning animation
  useEffect(() => {
    if (connected && rewardsConnected) {
      const timer = setTimeout(() => {
        setShowRewardAnimation(true);
        setRewardsEarned(actualRewardAmount);
        // Simulate balance update
        refetchBalance();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [connected, rewardsConnected, actualRewardAmount, refetchBalance]);

  const getProgressToNextMilestone = (): number => {
    const progress = (chopBalance / nextMilestone.amount) * 100;
    return Math.min(progress, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Success Header */}
      <header className="bg-gradient-to-br from-green-500/10 to-primary/10 border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Order Confirmed!</h1>
              <p className="text-muted-foreground mt-2">
                Your delicious food is being prepared with love
              </p>
            </div>
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
              Order #{orderData.orderId}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* CHOP Rewards Earned */}
            {connected && rewardsConnected && (
              <Card 
                className={`rounded-2xl border-border bg-gradient-to-br from-accent/10 to-primary/10 transition-all duration-500 ${
                  showRewardAnimation ? 'shadow-lg ring-2 ring-accent/20' : ''
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className={`transition-all duration-500 ${showRewardAnimation ? 'animate-pulse' : ''}`}>
                      <Zap className="w-6 h-6 text-accent" />
                    </div>
                    <span>CHOP Rewards Earned!</span>
                    <Badge className="bg-gradient-rewards text-accent-foreground">
                      {rewardMultiplier}x Multiplier Applied
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Tokens earned with this order:</p>
                      <div className={`flex items-center space-x-2 transition-all duration-500 ${
                        showRewardAnimation ? 'scale-110' : ''
                      }`}>
                        <span className="text-3xl font-bold text-accent">
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
                        Total balance: {formatTokens(chopBalance + actualRewardAmount)} CHOP
                      </p>
                    </div>
                  </div>

                  {/* Progress indicator if close to next level */}
                  {getProgressToNextMilestone() > 70 && (
                    <div className="bg-secondary/10 rounded-xl p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-medium text-foreground">Almost there!</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Just {formatTokens(nextMilestone.amount - chopBalance)} more CHOP to unlock {nextMilestone.reward}
                      </p>
                      <Progress value={getProgressToNextMilestone()} className="h-1.5" />
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="bg-gradient-trust flex-1"
                      onClick={() => navigate('/rewards')}
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      View All Rewards
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate('/earn')}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Earn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Status */}
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>Order Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="w-px h-8 bg-green-500 mt-2"></div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Order Confirmed</p>
                    <p className="text-sm text-muted-foreground">We've received your order and payment</p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-600">Completed</Badge>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="w-px h-8 bg-border mt-2"></div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Preparing Your Food</p>
                    <p className="text-sm text-muted-foreground">{orderData.vendor} is cooking your meal</p>
                  </div>
                  <Badge className="bg-orange-500/10 text-orange-600">In Progress</Badge>
                </div>

                <div className="flex items-center space-x-4 opacity-50">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-border rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-muted-foreground">Out for Delivery</p>
                    <p className="text-sm text-muted-foreground">On its way to your location</p>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">{orderData.vendor}</h3>
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${orderData.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span>${orderData.deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service Fee</span>
                      <span>${orderData.serviceFee.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${orderData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Delivery Address</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{orderData.deliveryAddress}</p>
                  <p className="text-sm text-muted-foreground">ETA: {orderData.estimatedDelivery}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rewards Widget */}
            <RewardsWidget 
              compact={false}
              showProgress={true}
              showActions={true}
            />

            {/* Quick Actions */}
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle className="text-base">What's Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => navigate('/')}
                >
                  <span>Order Again</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => navigate('/rewards')}
                >
                  <span>Track Rewards</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => navigate('/earn')}
                >
                  <span>Refer Friends</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card className="rounded-2xl border-border">
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Need Help?</h3>
                    <p className="text-sm text-muted-foreground">
                      Contact our support team if you have any questions
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Get Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}