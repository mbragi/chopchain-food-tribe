import { useState } from "react";
import { 
  Zap, 
  Star, 
  TrendingUp, 
  Clock, 
  Gift,
  Target,
  Award,
  ChevronRight,
  Coins,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/hooks/useWallet";
import { useRewards, RewardAction } from "@/hooks/useRewards";
import WalletConnectModal from "@/components/ui/WalletConnectModal";

export default function Rewards() {
  const { connected, address } = useWallet();
  const {
    chopBalance,
    userLevel,
    nextMilestone,
    rewardMultiplier,
    rewardActions,
    userStreak,
    totalClaimable,
    estimatedDaily,
    balancePercentage,
    isLoading,
    claimReward,
    getRewardsByCategory
  } = useRewards();
  
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [claimingRewards, setClaimingRewards] = useState<Record<string, boolean>>({});

  const handleClaimReward = async (action: RewardAction) => {
    setClaimingRewards(prev => ({ ...prev, [action.id]: true }));
    await claimReward(action.id, action.reward);
    setClaimingRewards(prev => ({ ...prev, [action.id]: false }));
  };

  const getProgressToNextMilestone = (): number => {
    const progress = (chopBalance / nextMilestone.amount) * 100;
    return Math.min(progress, 100);
  };

  const formatTokens = (amount: number): string => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toFixed(0);
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <WalletConnectModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
        <Card className="max-w-md mx-auto rounded-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-rewards rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-accent-foreground" />
            </div>
            <CardTitle className="text-primary">Connect Your Wallet</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Connect your wallet to view your CHOP rewards and start earning tokens for every order.
            </p>
            <Button 
              className="w-full bg-gradient-sunset"
              onClick={() => setWalletModalOpen(true)}
            >
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">CHOP Rewards</h1>
              <p className="text-muted-foreground">
                Earn tokens with every order • {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-lg font-bold ${userLevel.color}`}>
                {userLevel.icon} {userLevel.level}
              </span>
              <Badge className="bg-gradient-rewards text-accent-foreground">
                {rewardMultiplier}x Multiplier
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2 rounded-xl border-border bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-rewards rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Balance</p>
                    <p className="text-3xl font-bold text-foreground">
                      {formatTokens(chopBalance)} CHOP
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Est. Daily Earnings</p>
                  <p className="text-lg font-semibold text-secondary">
                    +{formatTokens(estimatedDaily * rewardMultiplier)} CHOP
                  </p>
                </div>
              </div>

              {/* Progress to next milestone */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress to {nextMilestone.reward}</span>
                  <span className="text-foreground">{formatTokens(chopBalance)} / {formatTokens(nextMilestone.amount)}</span>
                </div>
                <Progress value={getProgressToNextMilestone()} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {formatTokens(nextMilestone.amount - chopBalance)} CHOP to unlock {nextMilestone.reward}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Gift className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">Claimable Rewards</span>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{formatTokens(totalClaimable)}</p>
                  <p className="text-xs text-muted-foreground">CHOP Tokens</p>
                </div>
                <Button 
                  className="w-full bg-gradient-trust"
                  disabled={totalClaimable === 0 || isLoading}
                >
                  <Coins className="w-4 h-4 mr-2" />
                  Claim All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="rounded-xl border-border">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-lg font-bold text-foreground">{userStreak.currentStreak}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-lg font-bold text-foreground">{userStreak.longestStreak}</p>
                  <p className="text-xs text-muted-foreground">Best Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-lg font-bold text-foreground">{balancePercentage.toFixed(3)}%</p>
                  <p className="text-xs text-muted-foreground">of Total Supply</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-lg font-bold text-foreground">{userStreak.nextRewardAt}</p>
                  <p className="text-xs text-muted-foreground">Orders to Reward</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reward Actions Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">All Rewards</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewardActions.map((action) => (
                <RewardActionCard
                  key={action.id}
                  action={action}
                  onClaim={() => handleClaimReward(action)}
                  isLoading={claimingRewards[action.id] || false}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getRewardsByCategory('order').map((action) => (
                <RewardActionCard
                  key={action.id}
                  action={action}
                  onClaim={() => handleClaimReward(action)}
                  isLoading={claimingRewards[action.id] || false}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="social">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getRewardsByCategory('referral').concat(getRewardsByCategory('streak')).map((action) => (
                <RewardActionCard
                  key={action.id}
                  action={action}
                  onClaim={() => handleClaimReward(action)}
                  isLoading={claimingRewards[action.id] || false}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getRewardsByCategory('achievement').map((action) => (
                <RewardActionCard
                  key={action.id}
                  action={action}
                  onClaim={() => handleClaimReward(action)}
                  isLoading={claimingRewards[action.id] || false}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface RewardActionCardProps {
  action: RewardAction;
  onClaim: () => void;
  isLoading: boolean;
}

function RewardActionCard({ action, onClaim, isLoading }: RewardActionCardProps) {
  const getCategoryColor = (category: RewardAction['category']): string => {
    switch (category) {
      case 'order': return 'bg-primary/10 text-primary border-primary/20';
      case 'referral': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'streak': return 'bg-accent/10 text-accent border-accent/20';
      case 'achievement': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  return (
    <Card className={`rounded-xl border-border hover:shadow-card-hover transition-all ${action.completed ? 'opacity-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="text-2xl">{action.icon}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-foreground">{action.title}</h3>
                <Badge className={getCategoryColor(action.category)}>
                  {action.category}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
              {action.requirement && (
                <p className="text-xs text-muted-foreground">Requirement: {action.requirement}</p>
              )}
              <div className="flex items-center space-x-1 mt-2">
                <Zap className="w-4 h-4 text-accent" />
                <span className="font-bold text-accent">{action.reward} CHOP</span>
              </div>
            </div>
          </div>
          <div className="ml-4">
            {action.completed ? (
              <Badge className="bg-green-500 text-white">
                ✓ Claimed
              </Badge>
            ) : (
              <Button
                size="sm"
                onClick={onClaim}
                disabled={isLoading}
                className="bg-gradient-trust hover:shadow-glow"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Claim
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}