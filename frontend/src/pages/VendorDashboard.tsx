import { useState } from "react";
import { 
  Store, 
  BarChart3, 
  Package, 
  Settings, 
  Wallet, 
  Plus,
  TrendingUp,
  Clock,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/hooks/useWallet";
import { useRewards } from "@/hooks/useRewards";
import VendorProfile from "@/components/VendorProfile";
import OrderManagement from "@/components/OrderManagement";
import VendorAnalytics from "@/components/VendorAnalytics";
import VendorOffRamp from "@/components/VendorOffRamp";

export default function VendorDashboard() {
  const { address } = useWallet();
  const { chopBalance } = useRewards();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for demo
  const mockStats = {
    totalOrders: 127,
    totalRevenue: 2348.50,
    pendingOrders: 5,
    completedToday: 12,
    avgRating: 4.8,
    totalEarnedChop: chopBalance
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-sunset rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Vendor Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-gradient-rewards text-accent-foreground">
                {chopBalance.toFixed(2)} CHOP
              </Badge>
              <Button size="sm" className="bg-gradient-trust">
                <Plus className="w-4 h-4 mr-1" />
                Add Menu Item
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center space-x-2">
              <Wallet className="w-4 h-4" />
              <span>Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <Store className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="rounded-xl border-border">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        ${mockStats.totalRevenue}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-border">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Package className="w-8 h-8 text-secondary" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {mockStats.totalOrders}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-border">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-8 h-8 text-accent" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {mockStats.pendingOrders}
                      </p>
                      <p className="text-sm text-muted-foreground">Pending Orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-border">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {mockStats.totalEarnedChop.toFixed(0)}
                      </p>
                      <p className="text-sm text-muted-foreground">CHOP Earned</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="rounded-xl border-border">
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { id: "ORD-001", customer: "0x1234...5678", amount: 25.50, status: "preparing" },
                    { id: "ORD-002", customer: "0x8765...4321", amount: 18.75, status: "delivered" },
                    { id: "ORD-003", customer: "0x9876...1234", amount: 32.00, status: "confirmed" }
                  ].map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">${order.amount}</p>
                        <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-xl border-border">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-gradient-sunset" size="lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Menu Item
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <Settings className="w-4 h-4 mr-2" />
                    Update Store Info
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <Wallet className="w-4 h-4 mr-2" />
                    Withdraw Earnings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="wallet">
            <VendorOffRamp />
          </TabsContent>

          <TabsContent value="profile">
            <VendorProfile />
          </TabsContent>

          <TabsContent value="analytics">
            <VendorAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}