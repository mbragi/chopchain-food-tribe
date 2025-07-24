import { useState } from "react";
import { Zap, TrendingUp, Gift, ChevronRight, Coins, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useWallet } from "@/hooks/useWallet";
import { useRewards } from "@/hooks/useRewards";
import { useNavigate } from "react-router-dom";
import WalletConnectModal from "@/components/ui/WalletConnectModal";
import { cn } from "@/lib/utils";

interface RewardsWidgetProps {
  compact?: boolean;
  showProgress?: boolean;
  showActions?: boolean;
  className?: string;
}

export default function RewardsWidget({ 
  compact = true,
  showProgress = false,
  showActions = true,
  className
}: RewardsWidgetProps) {
  const navigate = useNavigate();
  const { connected } = useWallet();
  const {
    chopBalance,
    userLevel,
    nextMilestone,
    rewardMultiplier,
    totalClaimable,
    estimatedDaily,
    connected: rewardsConnected
  } = useRewards();

  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const formatTokens = (amount: number): string => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toFixed(0);
  };

  const getProgressToNextMilestone = (): number => {
    const progress = (chopBalance / nextMilestone.amount) * 100;
    return Math.min(progress, 100);
  };

  if (!connected) {
    return (
      <Card className={cn("rounded-xl border-border", className)}>
        <WalletConnectModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
        <CardContent className="p-4">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-gradient-rewards rounded-xl flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Start Earning CHOP</h3>
              <p className="text-sm text-muted-foreground">
                Connect your wallet to earn tokens with every order
              </p>
            </div>
            <Button 
              size="sm" 
              className="w-full bg-gradient-sunset"
              onClick={() => setWalletModalOpen(true)}
            >
              Connect Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!rewardsConnected) {
    return (
      <Card className={cn("rounded-xl border-border", className)}>
        <CardContent className="p-4">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading rewards...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className={cn("rounded-xl border-border bg-gradient-to-br from-primary/5 to-accent/5", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-rewards rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {formatTokens(chopBalance)} CHOP
                </p>
                <p className="text-xs text-muted-foreground">Your Balance</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-xs">
                <span className={`${userLevel.color}`}>{userLevel.icon}</span>
                <span className="text-muted-foreground">{userLevel.level}</span>
              </div>
              <Badge className="text-xs bg-gradient-rewards text-accent-foreground">
                {rewardMultiplier}x
              </Badge>
            </div>
          </div>

          {totalClaimable > 0 && (
            <div className="bg-primary/10 rounded-lg p-2 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Gift className="w-3 h-3 text-primary" />
                  <span className="text-xs font-medium text-foreground">Claimable</span>
                </div>
                <span className="text-xs font-bold text-primary">
                  {formatTokens(totalClaimable)} CHOP
                </span>
              </div>
            </div>
          )}

          {showActions && (
            <Button 
              size="sm" 
              variant="ghost"
              className="w-full justify-between text-xs h-8"
              onClick={() => navigate('/rewards')}
            >
              <span>View Rewards</span>
              <ChevronRight className="w-3 h-3" />
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full widget
  return (
    <Card className={cn("rounded-xl border-border", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center space-x-2">
          <Zap className="w-5 h-5 text-accent" />
          <span>CHOP Rewards</span>
          <Badge className="bg-gradient-rewards text-accent-foreground">
            {rewardMultiplier}x
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance Display */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <span className={`text-lg ${userLevel.color}`}>{userLevel.icon}</span>
            <span className="text-2xl font-bold text-foreground">
              {formatTokens(chopBalance)}
            </span>
            <span className="text-sm text-muted-foreground">CHOP</span>
          </div>
          <p className="text-xs text-muted-foreground">{userLevel.level} Level</p>
        </div>

        {/* Progress to next milestone */}
        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Next: {nextMilestone.reward}</span>
              <span className="text-foreground">
                {formatTokens(chopBalance)} / {formatTokens(nextMilestone.amount)}
              </span>
            </div>
            <Progress value={getProgressToNextMilestone()} className="h-1.5" />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-muted/30 rounded-lg p-2">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="w-3 h-3 text-secondary" />
              <span className="text-xs font-medium text-foreground">Daily</span>
            </div>
            <p className="text-sm font-bold text-secondary">
              +{formatTokens(estimatedDaily * rewardMultiplier)}
            </p>
          </div>
          <div className="bg-muted/30 rounded-lg p-2">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Gift className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-foreground">Claimable</span>
            </div>
            <p className="text-sm font-bold text-primary">
              {formatTokens(totalClaimable)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="space-y-2">
            {totalClaimable > 0 && (
              <Button 
                size="sm" 
                className="w-full bg-gradient-trust"
                onClick={() => navigate('/rewards')}
              >
                <Coins className="w-4 h-4 mr-2" />
                Claim {formatTokens(totalClaimable)} CHOP
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline"
              className="w-full"
              onClick={() => navigate('/rewards')}
            >
              View All Rewards
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Level up hint */}
        {rewardMultiplier < 2.0 && (
          <div className="bg-secondary/10 rounded-lg p-2">
            <div className="flex items-center space-x-1 mb-1">
              <Star className="w-3 h-3 text-secondary" />
              <span className="text-xs font-medium text-foreground">Tip</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Order more to reach higher levels and unlock better multipliers!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}