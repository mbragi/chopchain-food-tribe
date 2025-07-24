import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Calendar } from "lucide-react";

export default function VendorAnalytics() {
  // Mock analytics data
  const analyticsData = {
    monthlyRevenue: [
      { month: "Jan", revenue: 1250 },
      { month: "Feb", revenue: 1890 },
      { month: "Mar", revenue: 2150 },
      { month: "Apr", revenue: 2348 },
    ],
    topItems: [
      { name: "Jollof Rice", orders: 45, revenue: 675 },
      { name: "Pepper Soup", orders: 32, revenue: 720 },
      { name: "Egusi Soup", orders: 28, revenue: 560 },
    ],
    customerStats: {
      totalCustomers: 156,
      returningCustomers: 89,
      newCustomers: 67,
    }
  };

  return (
    <div className="space-y-6">
      {/* Revenue Trend */}
      <Card className="rounded-xl border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Revenue Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analyticsData.monthlyRevenue.map((data) => (
                <div key={data.month} className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">{data.month}</p>
                  <p className="text-lg font-bold text-foreground">${data.revenue}</p>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl">
              <p className="text-sm text-muted-foreground">Monthly Growth</p>
              <p className="text-2xl font-bold text-primary">+23.4%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Items */}
      <Card className="rounded-xl border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-secondary" />
            <span>Top Performing Items</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topItems.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-sunset rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-foreground">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.orders} orders</p>
                  </div>
                </div>
                <p className="font-semibold text-foreground">${item.revenue}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-xl border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-accent" />
              <span>Customer Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Customers</span>
                <span className="font-semibold">{analyticsData.customerStats.totalCustomers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Returning</span>
                <span className="font-semibold text-secondary">{analyticsData.customerStats.returningCustomers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">New</span>
                <span className="font-semibold text-primary">{analyticsData.customerStats.newCustomers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>Performance Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Average Order Value</p>
                <p className="text-xl font-bold text-secondary">$18.45</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Customer Rating</p>
                <p className="text-xl font-bold text-accent">4.8 ⭐</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Delivery Time</p>
                <p className="text-xl font-bold text-primary">28 min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}