import { useState, useCallback, useEffect } from 'react';
import { useContract, useContractRead, useContractWrite } from '@thirdweb-dev/react';
import { useWallet } from './useWallet';
import { getContracts } from '@/contracts/addresses';
import { useToast } from './use-toast';

export interface RewardAction {
  id: string;
  title: string;
  description: string;
  reward: number; // CHOP tokens
  icon: string;
  completed: boolean;
  requirement?: string;
  category: 'order' | 'referral' | 'streak' | 'achievement';
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastOrderDate: string;
  nextRewardAt: number; // Orders until next reward
}

export function useRewards() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { chain, address, connected } = useWallet();
  const { toast } = useToast();

  const chainId = chain?.id || 31337;
  const contracts = getContracts(chainId);

  const { contract: chopTokenContract } = useContract(contracts.CHOPToken);
  const { contract: escrowContract } = useContract(contracts.Escrow);

  // Get CHOP token balance
  const { data: chopBalance, refetch: refetchBalance } = useContractRead(
    chopTokenContract,
    'balanceOf',
    [address],
    { enabled: !!address }
  );

  // Get total supply for percentage calculations
  const { data: totalSupply } = useContractRead(
    chopTokenContract,
    'totalSupply'
  );

  // Mock reward actions (in real app, these would come from contract events or backend)
  const getRewardActions = useCallback((): RewardAction[] => {
    return [
      {
        id: 'first-order',
        title: 'First Order',
        description: 'Place your first order on ChopChain',
        reward: 50,
        icon: '🍽️',
        completed: false,
        category: 'order'
      },
      {
        id: 'five-orders',
        title: 'Regular Customer',
        description: 'Complete 5 orders',
        reward: 100,
        icon: '⭐',
        completed: false,
        requirement: '5 orders',
        category: 'order'
      },
      {
        id: 'first-referral',
        title: 'Share the Love',
        description: 'Refer your first friend to ChopChain',
        reward: 200,
        icon: '💝',
        completed: false,
        category: 'referral'
      },
      {
        id: 'week-streak',
        title: 'Weekly Warrior',
        description: 'Order every day for a week',
        reward: 300,
        icon: '🔥',
        completed: false,
        requirement: '7 day streak',
        category: 'streak'
      },
      {
        id: 'vendor-supporter',
        title: 'Vendor Supporter',
        description: 'Order from 10 different vendors',
        reward: 250,
        icon: '🏪',
        completed: false,
        requirement: '10 vendors',
        category: 'achievement'
      },
      {
        id: 'early-adopter',
        title: 'Early Adopter',
        description: 'Be among the first 1000 users',
        reward: 500,
        icon: '🚀',
        completed: false,
        category: 'achievement'
      }
    ];
  }, []);

  // Mock user streak data
  const getUserStreak = useCallback((): UserStreak => {
    return {
      currentStreak: 3,
      longestStreak: 7,
      lastOrderDate: new Date().toISOString(),
      nextRewardAt: 4 // Next reward at 7 day streak
    };
  }, []);

  // Format CHOP balance from wei to readable format
  const formatChopBalance = useCallback((balance: any): number => {
    if (!balance) return 0;
    return parseFloat(balance.toString()) / 1e18;
  }, []);

  // Get percentage of total supply
  const getBalancePercentage = useCallback((balance: any, total: any): number => {
    if (!balance || !total) return 0;
    const balanceNum = parseFloat(balance.toString());
    const totalNum = parseFloat(total.toString());
    return (balanceNum / totalNum) * 100;
  }, []);

  // Calculate next reward milestone
  const getNextMilestone = useCallback((balance: number): { amount: number; reward: string } => {
    if (balance < 100) return { amount: 100, reward: 'Bronze Status' };
    if (balance < 500) return { amount: 500, reward: 'Silver Status' };
    if (balance < 1000) return { amount: 1000, reward: 'Gold Status' };
    if (balance < 2500) return { amount: 2500, reward: 'Platinum Status' };
    return { amount: 5000, reward: 'Diamond Status' };
  }, []);

  // Calculate user level based on CHOP balance
  const getUserLevel = useCallback((balance: number): { level: string; color: string; icon: string } => {
    if (balance >= 5000) return { level: 'Diamond', color: 'text-blue-400', icon: '💎' };
    if (balance >= 2500) return { level: 'Platinum', color: 'text-purple-400', icon: '👑' };
    if (balance >= 1000) return { level: 'Gold', color: 'text-yellow-400', icon: '🥇' };
    if (balance >= 500) return { level: 'Silver', color: 'text-gray-400', icon: '🥈' };
    if (balance >= 100) return { level: 'Bronze', color: 'text-orange-400', icon: '🥉' };
    return { level: 'Starter', color: 'text-green-400', icon: '🌱' };
  }, []);

  // Mock function to simulate claiming rewards (in real app, this would interact with contract)
  const claimReward = useCallback(async (actionId: string, amount: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Reward Claimed!',
        description: `You earned ${amount} CHOP tokens!`,
        variant: 'default'
      });

      // Refetch balance to show updated amount
      await refetchBalance();
      
      setIsLoading(false);
      return true;

    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to claim reward';
      setError(errorMessage);
      setIsLoading(false);
      
      toast({
        title: 'Claim Failed',
        description: errorMessage,
        variant: 'destructive'
      });

      return false;
    }
  }, [toast, refetchBalance]);

  // Calculate total claimable rewards
  const getTotalClaimable = useCallback((): number => {
    const actions = getRewardActions();
    return actions
      .filter(action => !action.completed)
      .reduce((total, action) => total + action.reward, 0);
  }, [getRewardActions]);

  // Get rewards by category
  const getRewardsByCategory = useCallback((category: RewardAction['category']): RewardAction[] => {
    return getRewardActions().filter(action => action.category === category);
  }, [getRewardActions]);

  // Calculate estimated daily rewards
  const getEstimatedDailyRewards = useCallback((): number => {
    // Base calculation: 5% of order value in CHOP tokens
    // Average order value ~$20, so ~1 CHOP per order
    // Estimate 1-3 orders per day for active users
    return 2.5; // CHOP tokens per day
  }, []);

  // Get reward multiplier based on user level
  const getRewardMultiplier = useCallback((level: string): number => {
    switch (level) {
      case 'Diamond': return 2.0;
      case 'Platinum': return 1.8;
      case 'Gold': return 1.5;
      case 'Silver': return 1.3;
      case 'Bronze': return 1.1;
      default: return 1.0;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // Parse balance for display
  const chopBalanceFormatted = formatChopBalance(chopBalance);
  const balancePercentage = getBalancePercentage(chopBalance, totalSupply);
  const nextMilestone = getNextMilestone(chopBalanceFormatted);
  const userLevel = getUserLevel(chopBalanceFormatted);
  const userStreak = getUserStreak();
  const rewardActions = getRewardActions();
  const totalClaimable = getTotalClaimable();
  const estimatedDaily = getEstimatedDailyRewards();
  const rewardMultiplier = getRewardMultiplier(userLevel.level);

  return {
    // Balance and token info
    chopBalance: chopBalanceFormatted,
    chopBalanceRaw: chopBalance,
    totalSupply: totalSupply ? formatChopBalance(totalSupply) : 0,
    balancePercentage,
    
    // User progression
    userLevel,
    nextMilestone,
    rewardMultiplier,
    
    // Rewards and actions
    rewardActions,
    userStreak,
    totalClaimable,
    estimatedDaily,
    
    // State
    isLoading,
    error,
    connected,
    
    // Functions
    claimReward,
    getRewardsByCategory,
    getUserLevel,
    getRewardMultiplier,
    clearError,
    refetchBalance,
    
    // Contract references
    contracts
  };
}