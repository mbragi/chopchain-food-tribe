import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  Star, 
  Zap, 
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  ExternalLink
} from "lucide-react";

export default function VendorAnalytics() {
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("weekly");

  // Mock analytics data (would come from contract/backend)
  const analyticsData = {
    revenue: {
      current: 245000, // in Naira equivalent
      previous: 198000,
      usdt: 612.5, // USDT equivalent
      growth: 23.7
    },
    orders: {
      completed: 127,
      cancelled: 8,
      pending: 3,
      total: 138,
      averageValue: 5500
    },
    chopRewards: {
      earned: 1250, // CHOP tokens earned
      pending: 85, // Pending rewards
      totalValue: 15600, // Naira equivalent
      growth: 18.2
    },
    performance: {
      rating: 4.8,
      onTimeDelivery: 94,
      customerSatisfaction: 96
    },
    payouts: {
      nextPayout: 189000, // Available for OneRamp off-ramp
      lastPayout: 156000,
      payoutDate: "Friday, Jan 12"
    }
  };

  // Mock chart data
  const revenueData = [
    { day: "Mon", revenue: 28000, orders: 12 },
    { day: "Tue", revenue: 32000, orders: 15 },
    { day: "Wed", revenue: 41000, orders: 18 },
    { day: "Thu", revenue: 38000, orders: 16 },
    { day: "Fri", revenue: 52000, orders: 22 },
    { day: "Sat", revenue: 48000, orders: 20 },
    { day: "Sun", revenue: 35000, orders: 14 },
  ];

  const handleOneRampPayout = () => {
    toast({
      title: "OneRamp Payout Initiated",
      description: `Converting ₦${analyticsData.payouts.nextPayout.toLocaleString()} to your local bank account`,
      variant: "default",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Data Export",
      description: "Analytics data exported successfully",
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track your business performance and earnings</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <select
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as "daily" | "weekly" | "monthly")}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-sunset/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <Badge className={`${analyticsData.revenue.growth > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} flex items-center gap-1`}>
                {analyticsData.revenue.growth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(analyticsData.revenue.growth)}%
              </Badge>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">₦{analyticsData.revenue.current.toLocaleString()}</h3>
              <p className="text-sm text-muted-foreground">${analyticsData.revenue.usdt} USDT</p>
              <p className="text-xs text-muted-foreground mt-1">vs ₦{analyticsData.revenue.previous.toLocaleString()} last period</p>
            </div>
          </Card>

          {/* Orders Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-trust/10 rounded-lg">
                <Package className="w-5 h-5 text-secondary" />
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {analyticsData.orders.total} Total
              </Badge>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{analyticsData.orders.completed}</h3>
              <p className="text-sm text-muted-foreground">Completed Orders</p>
              <p className="text-xs text-muted-foreground mt-1">Avg: ₦{analyticsData.orders.averageValue.toLocaleString()}</p>
            </div>
          </Card>

          {/* CHOP Rewards Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-rewards/10 rounded-lg">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <Badge className={`bg-yellow-100 text-yellow-800 flex items-center gap-1`}>
                <ArrowUpRight className="w-3 h-3" />
                {analyticsData.chopRewards.growth}%
              </Badge>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{analyticsData.chopRewards.earned}</h3>
              <p className="text-sm text-muted-foreground">CHOP Tokens Earned</p>
              <p className="text-xs text-muted-foreground mt-1">≈ ₦{analyticsData.chopRewards.totalValue.toLocaleString()}</p>
            </div>
          </Card>

          {/* Performance Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-hibiscus/10 rounded-lg">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <Badge className="bg-green-100 text-green-800">
                Top Rated
              </Badge>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{analyticsData.performance.rating}</h3>
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <p className="text-xs text-muted-foreground mt-1">{analyticsData.performance.onTimeDelivery}% on-time delivery</p>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="rewards">CHOP Rewards</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Revenue Trends</h2>
              <div className="space-y-4">
                {revenueData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium w-12">{data.day}</span>
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-sunset h-2 rounded-full" 
                          style={{ width: `${(data.revenue / 60000) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">₦{data.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{data.orders} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{analyticsData.orders.completed}</div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">{analyticsData.orders.cancelled}</div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">{analyticsData.orders.pending}</div>
                <p className="text-sm text-muted-foreground">Pending</p>
              </Card>
            </div>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Order Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completion Rate</span>
                  <span className="text-sm font-medium">{((analyticsData.orders.completed / analyticsData.orders.total) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Order Value</span>
                  <span className="text-sm font-medium">₦{analyticsData.orders.averageValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Customer Satisfaction</span>
                  <span className="text-sm font-medium">{analyticsData.performance.customerSatisfaction}%</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* CHOP Rewards Tab */}
          <TabsContent value="rewards" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Token Balance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Earned CHOP</span>
                    <span className="text-lg font-bold text-accent">{analyticsData.chopRewards.earned}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending Rewards</span>
                    <span className="text-sm font-medium text-yellow-600">{analyticsData.chopRewards.pending}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Value</span>
                    <span className="text-sm font-medium">₦{analyticsData.chopRewards.totalValue.toLocaleString()}</span>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Rewards Growth</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2">+{analyticsData.chopRewards.growth}%</div>
                  <p className="text-sm text-muted-foreground">This {timeframe}</p>
                  <Button className="mt-4 bg-gradient-rewards text-accent-foreground">
                    <Zap className="w-4 h-4 mr-2" />
                    Claim Rewards
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* OneRamp Payouts Tab */}
          <TabsContent value="payouts" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">OneRamp Payouts</h2>
                <Badge className="bg-gradient-trust text-primary-foreground">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  OneRamp
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-trust/10 rounded-xl">
                    <h3 className="font-medium text-foreground mb-2">Available for Payout</h3>
                    <div className="text-2xl font-bold text-secondary">₦{analyticsData.payouts.nextPayout.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">Ready for off-ramp to your bank</p>
                  </div>
                  
                  <Button 
                    onClick={handleOneRampPayout}
                    className="w-full bg-gradient-trust text-primary-foreground"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Withdraw via OneRamp
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-foreground mb-3">Payout History</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm">Last Payout</span>
                        <span className="text-sm font-medium">₦{analyticsData.payouts.lastPayout.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm">Next Payout Date</span>
                        <span className="text-sm font-medium">{analyticsData.payouts.payoutDate}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm">Payout Method</span>
                        <span className="text-sm font-medium">OneRamp → Bank Transfer</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Automatic Payouts</h4>
                    <p className="text-sm text-muted-foreground">
                      Your earnings are automatically converted from USDT to local currency every Friday via OneRamp. 
                      Funds are deposited directly to your registered bank account.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}