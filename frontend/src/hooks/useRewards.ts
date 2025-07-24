import { useState, useCallback, useEffect } from 'react';
import { useContract, useContractRead, useContractWrite } from '@thirdweb-dev/react';
import { useWallet } from './useWallet';
import { getContracts } from '@/contracts/addresses';
import { useToast } from './use-toast';
import { ethers } from 'ethers';

export function useRewards() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { chain, address } = useWallet();
  const { toast } = useToast();

  const chainId = chain?.id || 31337;
  const contracts = getContracts(chainId);

  const { contract: chopTokenContract } = useContract(contracts.CHOPToken);
  
  // Get CHOP token balance
  const { data: rawBalance, isLoading: balanceLoading, refetch: refetchBalance } = useContractRead(
    chopTokenContract,
    'balanceOf',
    [address]
  );

  // Get token symbol and decimals
  const { data: symbol } = useContractRead(chopTokenContract, 'symbol');
  const { data: decimals } = useContractRead(chopTokenContract, 'decimals');

  // Format balance from wei to readable format
  const chopBalance = rawBalance ? 
    parseFloat(ethers.utils.formatUnits(rawBalance.toString(), decimals || 18)) : 0;

  // Calculate potential rewards (5% of order amount)
  const calculateRewards = useCallback((orderAmount: number): number => {
    return orderAmount * 0.05; // 5% rewards
  }, []);

  // Get total rewards earned (could be tracked via events)
  const getTotalRewardsEarned = useCallback(async (): Promise<number> => {
    // This would require querying past events from Escrow contract
    // For now, return current balance as approximation
    return chopBalance;
  }, [chopBalance]);

  // Claim/use rewards (if implementing a rewards spending system)
  const useReward = useCallback(async (amount: string) => {
    if (!chopTokenContract) {
      setError('CHOP token contract not loaded');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // This would implement reward spending logic
      // For now, just show toast
      toast({
        title: 'Rewards Used',
        description: `Used ${amount} CHOP tokens`,
        variant: 'default'
      });

      await refetchBalance();
      setIsLoading(false);
      return true;

    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to use rewards';
      setError(errorMessage);
      setIsLoading(false);
      
      toast({
        title: 'Reward Usage Failed',
        description: errorMessage,
        variant: 'destructive'
      });

      return false;
    }
  }, [chopTokenContract, toast, refetchBalance]);

  const clearError = useCallback(() => setError(null), []);

  // Refresh balance periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (address && chopTokenContract) {
        refetchBalance();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [address, chopTokenContract, refetchBalance]);

  return {
    chopBalance,
    chopSymbol: symbol || 'CHOP',
    isLoading: isLoading || balanceLoading,
    error,
    clearError,
    calculateRewards,
    getTotalRewardsEarned,
    useReward,
    refetchBalance
  };
}