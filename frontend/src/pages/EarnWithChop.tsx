import { useState } from "react";
import { 
  Zap, 
  Users, 
  Share2, 
  Calendar, 
  Trophy, 
  Star,
  Copy,
  Instagram,
  Twitter,
  MessageCircle,
  TrendingUp,
  Target,
  Gift,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/hooks/useWallet";
import { useRewards } from "@/hooks/useRewards";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import WalletConnectModal from "@/components/ui/WalletConnectModal";
import RewardsWidget from "@/components/RewardsWidget";

interface EarnMethod {
  id: string;
  title: string;
  description: string;
  reward: number;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'referral' | 'social' | 'streak' | 'achievement';
  action: string;
  requirement?: string;
}

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarned: number;
  thisMonth: number;
}

export default function EarnWithChop() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { connected, address } = useWallet();
  const {
    chopBalance,
    userLevel,
    userStreak,
    rewardMultiplier,
    connected: rewardsConnected
  } = useRewards();

  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("referrals");
  const [referralCode] = useState(`CHOP${address?.slice(-6).toUpperCase() || 'DEMO'}`);

  // Mock referral stats
  const referralStats: ReferralStats = {
    totalReferrals: 12,
    activeReferrals: 8,
    totalEarned: 2400,
    thisMonth: 600
  };

  const earnMethods: EarnMethod[] = [
    {
      id: 'refer-friend',
      title: 'Refer a Friend',
      description: 'Both you and your friend get 200 CHOP when they place their first order',
      reward: 200,
      icon: '👥',
      difficulty: 'Easy',
      category: 'referral',
      action: 'Share Your Code'
    },
    {
      id: 'social-share',
      title: 'Share on Social Media',
      description: 'Share ChopChain on Twitter, Instagram, or TikTok',
      reward: 50,
      icon: '📱',
      difficulty: 'Easy',
      category: 'social',
      action: 'Share Now'
    },
    {
      id: 'daily-streak',
      title: 'Daily Order Streak',
      description: 'Order every day for 7 days straight',
      reward: 300,
      icon: '🔥',
      difficulty: 'Medium',
      category: 'streak',
      action: 'Start Streak',
      requirement: '7 consecutive days'
    },
    {
      id: 'week-streak',
      title: 'Weekly Champion',
      description: 'Maintain a 30-day ordering streak',
      reward: 1000,
      icon: '👑',
      difficulty: 'Hard',
      category: 'streak',
      action: 'View Progress',
      requirement: '30 consecutive days'
    },
    {
      id: 'first-review',
      title: 'Write Your First Review',
      description: 'Help other users by reviewing a vendor',
      reward: 25,
      icon: '⭐',
      difficulty: 'Easy',
      category: 'achievement',
      action: 'Write Review'
    },
    {
      id: 'vendor-explorer',
      title: 'Vendor Explorer',
      description: 'Order from 10 different vendors',
      reward: 500,
      icon: '🗺️',
      difficulty: 'Medium',
      category: 'achievement',
      action: 'Explore Vendors',
      requirement: '10 different vendors'
    }
  ];

  const formatTokens = (amount: number): string => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Copied!",
      description: "Your referral code has been copied to clipboard",
      variant: "default"
    });
  };

  const shareReferralLink = (platform: string) => {
    const message = `Join me on ChopChain and earn 200 CHOP tokens when you place your first order! Use my code: ${referralCode}`;
    const url = `https://chopchain.com?ref=${referralCode}`;
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing, so we copy the message
        navigator.clipboard.writeText(`${message} ${url}`);
        toast({
          title: "Copied for Instagram!",
          description: "Message copied. Paste it in your Instagram story or post.",
          variant: "default"
        });
        return;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  const handleEarnAction = (method: EarnMethod) => {
    if (!connected) {
      setWalletModalOpen(true);
      return;
    }

    switch (method.id) {
      case 'refer-friend':
        setActiveTab('referrals');
        break;
      case 'social-share':
        setActiveTab('social');
        break;
      case 'daily-streak':
        navigate('/');
        toast({
          title: "Start Your Streak!",
          description: "Place an order today to begin your daily streak.",
          variant: "default"
        });
        break;
      case 'first-review':
        navigate('/');
        toast({
          title: "Order First!",
          description: "Complete an order to unlock the ability to write reviews.",
          variant: "default"
        });
        break;
      default:
        navigate('/');
    }
  };

  const getDifficultyColor = (difficulty: EarnMethod['difficulty']): string => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Medium': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'Hard': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-muted/10 text-muted-foreground border-border';
    }
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
            <CardTitle className="text-primary">Start Earning CHOP</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Connect your wallet to access referral programs, streaks, and bonus rewards.
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
              <h1 className="text-2xl font-bold text-foreground">Earn with CHOP</h1>
              <p className="text-muted-foreground">
                Refer friends, complete challenges, and earn more tokens
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="rounded-xl border-border">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-lg font-bold text-foreground">{referralStats.totalReferrals}</p>
                      <p className="text-xs text-muted-foreground">Total Referrals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-border">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-secondary" />
                    <div>
                      <p className="text-lg font-bold text-foreground">{userStreak.currentStreak}</p>
                      <p className="text-xs text-muted-foreground">Current Streak</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-border">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Gift className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-lg font-bold text-foreground">{formatTokens(referralStats.totalEarned)}</p>
                      <p className="text-xs text-muted-foreground">Total Earned</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-border">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-lg font-bold text-foreground">{formatTokens(referralStats.thisMonth)}</p>
                      <p className="text-xs text-muted-foreground">This Month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Earning Methods Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="referrals">Referrals</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
                <TabsTrigger value="streaks">Streaks</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>

              <TabsContent value="referrals" className="space-y-6">
                {/* Referral Code Card */}
                <Card className="rounded-2xl border-border bg-gradient-to-br from-primary/5 to-secondary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Your Referral Code</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Input 
                        value={referralCode} 
                        readOnly 
                        className="font-mono text-lg font-bold text-center"
                      />
                      <Button onClick={copyReferralCode} size="icon" variant="outline">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Both you and your friend get <span className="font-bold text-accent">200 CHOP</span> when they complete their first order!
                      </p>
                      
                      <div className="flex justify-center space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => shareReferralLink('whatsapp')}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          WhatsApp
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => shareReferralLink('twitter')}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          <Twitter className="w-4 h-4 mr-2" />
                          Twitter
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => shareReferralLink('instagram')}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          <Instagram className="w-4 h-4 mr-2" />
                          Instagram
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Referral Stats */}
                <Card className="rounded-2xl border-border">
                  <CardHeader>
                    <CardTitle>Referral Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-primary/10 rounded-xl">
                        <p className="text-2xl font-bold text-primary">{referralStats.activeReferrals}</p>
                        <p className="text-sm text-muted-foreground">Active This Month</p>
                      </div>
                      <div className="text-center p-4 bg-secondary/10 rounded-xl">
                        <p className="text-2xl font-bold text-secondary">{formatTokens(referralStats.thisMonth)}</p>
                        <p className="text-sm text-muted-foreground">CHOP Earned</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Monthly Goal Progress</span>
                        <span>8/15 referrals</span>
                      </div>
                      <Progress value={(8/15) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        7 more referrals to unlock 500 bonus CHOP tokens!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="social" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {earnMethods
                    .filter(method => method.category === 'social')
                    .map((method) => (
                      <EarnMethodCard
                        key={method.id}
                        method={method}
                        onAction={() => handleEarnAction(method)}
                      />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="streaks" className="space-y-4">
                {/* Current Streak */}
                <Card className="rounded-2xl border-border bg-gradient-to-br from-accent/10 to-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <div className="text-2xl">🔥</div>
                      <span>Current Streak</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-accent">{userStreak.currentStreak}</p>
                      <p className="text-sm text-muted-foreground">Days in a row</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Next reward at {userStreak.nextRewardAt} days</span>
                        <span>{userStreak.currentStreak}/{userStreak.nextRewardAt}</span>
                      </div>
                      <Progress value={(userStreak.currentStreak / userStreak.nextRewardAt) * 100} className="h-2" />
                    </div>
                    
                    <Button className="w-full bg-gradient-trust" onClick={() => navigate('/')}>
                      Order Now to Continue Streak
                    </Button>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {earnMethods
                    .filter(method => method.category === 'streak')
                    .map((method) => (
                      <EarnMethodCard
                        key={method.id}
                        method={method}
                        onAction={() => handleEarnAction(method)}
                      />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {earnMethods
                    .filter(method => method.category === 'achievement')
                    .map((method) => (
                      <EarnMethodCard
                        key={method.id}
                        method={method}
                        onAction={() => handleEarnAction(method)}
                      />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rewards Widget */}
            <RewardsWidget 
              compact={false}
              showProgress={true}
              showActions={true}
            />

            {/* Quick Tips */}
            <Card className="rounded-xl border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Pro Tips</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">💡 Share authentically</p>
                  <p className="text-muted-foreground">Personal recommendations work best for referrals</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">🎯 Focus on streaks</p>
                  <p className="text-muted-foreground">Daily orders give the highest reward rates</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">📱 Use social media</p>
                  <p className="text-muted-foreground">Stories and posts reach more people</p>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard Preview */}
            <Card className="rounded-xl border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <Trophy className="w-4 h-4" />
                  <span>Top Earners</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { rank: 1, name: "ChopMaster", earned: 12500, icon: "🥇" },
                  { rank: 2, name: "FoodieKing", earned: 8900, icon: "🥈" },
                  { rank: 3, name: "TokenHunter", earned: 7200, icon: "🥉" }
                ].map((user) => (
                  <div key={user.rank} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{user.icon}</span>
                      <span className="font-medium text-sm">{user.name}</span>
                    </div>
                    <span className="text-sm font-bold text-accent">
                      {formatTokens(user.earned)} CHOP
                    </span>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => navigate('/rewards')}
                >
                  View Full Leaderboard
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EarnMethodCardProps {
  method: EarnMethod;
  onAction: () => void;
}

function EarnMethodCard({ method, onAction }: EarnMethodCardProps) {
  const getDifficultyColor = (difficulty: EarnMethod['difficulty']): string => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Medium': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'Hard': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  return (
    <Card className="rounded-xl border-border hover:shadow-card-hover transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">{method.icon}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-foreground">{method.title}</h3>
                <Badge className={getDifficultyColor(method.difficulty)}>
                  {method.difficulty}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
              {method.requirement && (
                <p className="text-xs text-muted-foreground">Requirement: {method.requirement}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Zap className="w-4 h-4 text-accent" />
            <span className="font-bold text-accent">{method.reward} CHOP</span>
          </div>
          <Button
            size="sm"
            onClick={onAction}
            className="bg-gradient-trust hover:shadow-glow"
          >
            {method.action}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}