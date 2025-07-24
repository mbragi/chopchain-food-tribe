import { useState } from "react";
import { 
  Truck, 
  MapPin, 
  Clock, 
  DollarSign,
  Star,
  Package,
  Zap,
  Settings,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/hooks/useWallet";
import { useDeliveryAgentRegistry } from "@/hooks/useDeliveryAgentRegistry";
import { useDeliveryAssignment } from "@/hooks/useDeliveryAssignment";
import { useRewards } from "@/hooks/useRewards";
import DeliveryQueue from "@/components/DeliveryQueue";
import ActiveDeliveries from "@/components/ActiveDeliveries";
import DeliveryAgentProfile from "@/components/DeliveryAgentProfile";

export default function DeliveryAgentDashboard() {
  const { address } = useWallet();
  const { 
    isAgentActive, 
    agentDetails, 
    formatRating, 
    setAgentStatus, 
    isLoading: statusLoading 
  } = useDeliveryAgentRegistry();
  const { agentOrders, unassignedOrders } = useDeliveryAssignment();
  const { chopBalance } = useRewards();
  const [activeTab, setActiveTab] = useState("queue");

  // Mock earnings data (in real app, calculate from completed orders)
  const mockEarnings = {
    today: 45.50,
    thisWeek: 234.75,
    thisMonth: 892.30,
    completedDeliveries: agentDetails?.totalDeliveries || 0
  };

  const handleToggleStatus = async () => {
    await setAgentStatus(!isAgentActive);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-sunset rounded-xl flex items-center justify-center">
                <Truck className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Delivery Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge className="bg-gradient-rewards text-accent-foreground">
                {chopBalance.toFixed(2)} CHOP
              </Badge>
              
              {/* Status Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleStatus}
                  disabled={statusLoading}
                  className={`flex items-center space-x-1 ${
                    isAgentActive 
                      ? "text-secondary hover:text-secondary/80" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isAgentActive ? (
                    <>
                      <ToggleRight className="w-5 h-5" />
                      <span>Online</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5" />
                      <span>Offline</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="rounded-xl border-border">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    ${mockEarnings.today.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Today's Earnings</p>
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
                    {mockEarnings.completedDeliveries}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Deliveries</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Star className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {agentDetails ? formatRating(agentDetails.rating).toFixed(1) : "5.0"}
                  </p>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {agentOrders.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Banner */}
        {!isAgentActive && (
          <Card className="mb-6 rounded-xl border-border bg-gradient-to-br from-muted/5 to-muted/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">You're Currently Offline</p>
                    <p className="text-sm text-muted-foreground">
                      Turn on your status to start receiving delivery requests
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleToggleStatus}
                  className="bg-gradient-sunset"
                >
                  Go Online
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="queue" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Order Queue ({unassignedOrders.length})</span>
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center space-x-2">
              <Truck className="w-4 h-4" />
              <span>Active Deliveries ({agentOrders.length})</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="queue">
            <DeliveryQueue />
          </TabsContent>

          <TabsContent value="active">
            <ActiveDeliveries />
          </TabsContent>

          <TabsContent value="profile">
            <DeliveryAgentProfile />
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card className="rounded-xl border-border">
            <CardHeader>
              <CardTitle>Weekly Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">This Week</span>
                  <span className="font-semibold text-lg text-foreground">
                    ${mockEarnings.thisWeek.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">This Month</span>
                  <span className="font-semibold text-lg text-foreground">
                    ${mockEarnings.thisMonth.toFixed(2)}
                  </span>
                </div>
                <div className="p-3 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Average per delivery</p>
                  <p className="text-xl font-bold text-secondary">
                    ${mockEarnings.completedDeliveries > 0 
                      ? (mockEarnings.thisMonth / mockEarnings.completedDeliveries).toFixed(2)
                      : "0.00"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border">
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Customer Rating</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="font-semibold">
                      {agentDetails ? formatRating(agentDetails.rating).toFixed(1) : "5.0"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Deliveries</span>
                  <span className="font-semibold">{mockEarnings.completedDeliveries}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">CHOP Rewards</span>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4 text-accent" />
                    <span className="font-semibold">{chopBalance.toFixed(0)}</span>
                  </div>
                </div>
                {isAgentActive && (
                  <div className="p-3 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-secondary">Available for orders</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}