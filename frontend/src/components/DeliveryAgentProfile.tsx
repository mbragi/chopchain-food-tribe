import { useState } from "react";
import { 
  User, 
  Star, 
  Package, 
  DollarSign,
  Clock,
  Award,
  TrendingUp,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useWallet } from "@/hooks/useWallet";
import { useDeliveryAgentRegistry } from "@/hooks/useDeliveryAgentRegistry";

export default function DeliveryAgentProfile() {
  const { address } = useWallet();
  const { 
    agentDetails, 
    formatRating, 
    isAgentActive,
    setAgentStatus,
    isLoading 
  } = useDeliveryAgentRegistry();

  // Mock performance data (in real app, fetch from contract events)
  const performanceData = {
    thisWeek: {
      deliveries: 12,
      earnings: 156.40,
      avgRating: agentDetails ? formatRating(agentDetails.rating) : 5.0,
      hoursWorked: 28
    },
    thisMonth: {
      deliveries: agentDetails?.totalDeliveries || 0,
      earnings: 623.80,
      avgRating: agentDetails ? formatRating(agentDetails.rating) : 5.0,
      hoursWorked: 118
    },
    achievements: [
      { name: "Fast Delivery", description: "Delivered 10 orders under 30 minutes", achieved: true },
      { name: "5-Star Agent", description: "Maintained 5.0 rating for 30 days", achieved: agentDetails ? formatRating(agentDetails.rating) >= 4.8 : false },
      { name: "Century Club", description: "Complete 100 successful deliveries", achieved: (agentDetails?.totalDeliveries || 0) >= 100 },
      { name: "Reliable Agent", description: "No missed deliveries for 60 days", achieved: true }
    ]
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAchievementProgress = (): number => {
    const achieved = performanceData.achievements.filter(a => a.achieved).length;
    return (achieved / performanceData.achievements.length) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="rounded-xl border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-primary" />
            <span>Delivery Agent Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-sunset rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Delivery Agent #{address?.slice(-6)}
                  </p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {address}
                  </p>
                </div>
              </div>
              
              {agentDetails && (
                <div className="flex items-center space-x-4 pt-2">
                  <Badge className={isAgentActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"}>
                    {isAgentActive ? "Online" : "Offline"}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="font-semibold">
                      {formatRating(agentDetails.rating).toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Joined {formatDate(agentDetails.registeredAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-6 h-6 text-primary" />
              <div>
                <p className="text-lg font-bold text-foreground">
                  {agentDetails?.totalDeliveries || 0}
                </p>
                <p className="text-xs text-muted-foreground">Total Deliveries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-6 h-6 text-accent" />
              <div>
                <p className="text-lg font-bold text-foreground">
                  {agentDetails ? formatRating(agentDetails.rating).toFixed(1) : "5.0"}
                </p>
                <p className="text-xs text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-6 h-6 text-secondary" />
              <div>
                <p className="text-lg font-bold text-foreground">
                  ${performanceData.thisMonth.earnings.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Total Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-6 h-6 text-primary" />
              <div>
                <p className="text-lg font-bold text-foreground">
                  {performanceData.thisMonth.hoursWorked}h
                </p>
                <p className="text-xs text-muted-foreground">Hours Worked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Performance */}
      <Card className="rounded-xl border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>This Week's Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Deliveries Completed</span>
                <span className="font-semibold text-foreground">{performanceData.thisWeek.deliveries}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Earnings This Week</span>
                <span className="font-semibold text-foreground">${performanceData.thisWeek.earnings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Hours Worked</span>
                <span className="font-semibold text-foreground">{performanceData.thisWeek.hoursWorked}h</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Weekly Goal Progress</span>
                <span className="text-foreground">{Math.min(100, (performanceData.thisWeek.deliveries / 15) * 100).toFixed(0)}%</span>
              </div>
              <Progress value={Math.min(100, (performanceData.thisWeek.deliveries / 15) * 100)} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {15 - performanceData.thisWeek.deliveries > 0 
                  ? `${15 - performanceData.thisWeek.deliveries} more deliveries to reach weekly goal`
                  : "Weekly goal achieved! 🎉"
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="rounded-xl border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-primary" />
              <span>Achievements</span>
            </div>
            <Badge variant="outline">
              {performanceData.achievements.filter(a => a.achieved).length} / {performanceData.achievements.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Achievement Progress</span>
              <span className="text-foreground">{getAchievementProgress().toFixed(0)}%</span>
            </div>
            <Progress value={getAchievementProgress()} className="h-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {performanceData.achievements.map((achievement, index) => (
              <div 
                key={index}
                className={`p-3 rounded-xl border ${
                  achievement.achieved 
                    ? "bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20"
                    : "bg-muted/5 border-border"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    achievement.achieved ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${achievement.achieved ? "text-foreground" : "text-muted-foreground"}`}>
                      {achievement.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.achieved && (
                    <Badge className="bg-secondary text-secondary-foreground">
                      ✓
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card className="rounded-xl border-border">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Agent Status</p>
              <p className="text-sm text-muted-foreground">
                Control whether you receive new delivery requests
              </p>
            </div>
            <Button
              onClick={() => setAgentStatus(!isAgentActive)}
              disabled={isLoading}
              variant={isAgentActive ? "default" : "outline"}
              className={isAgentActive ? "bg-green-500 hover:bg-green-600" : ""}
            >
              {isAgentActive ? "Go Offline" : "Go Online"}
            </Button>
          </div>
          
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Your delivery agent registration is permanently recorded on the blockchain. 
              Performance metrics and ratings are transparently tracked on-chain.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}