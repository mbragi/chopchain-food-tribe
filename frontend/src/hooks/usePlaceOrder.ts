import { useState, useCallback } from 'react';
import { useContract, useContractWrite } from '@thirdweb-dev/react';
import { useWallet } from './useWallet';
import { getContracts } from '@/contracts/addresses';
import { useToast } from './use-toast';

export interface PlaceOrderParams {
  vendorAddress: string;
  amount: string; // In USDT/USDC (18 decimals)
  orderId: string;
  stablecoinAddress: string; // USDT or USDC contract address
}

export function usePlaceOrder() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { chain } = useWallet();
  const { toast } = useToast();

  const chainId = chain?.id || 31337;
  const contracts = getContracts(chainId);

  const { contract: escrowContract } = useContract(contracts.Escrow);
  const { contract: stablecoinContract } = useContract(contracts.USDT); // Default to USDT

  const { mutateAsync: placeOrderWrite } = useContractWrite(escrowContract, 'placeOrder');
  const { mutateAsync: approveWrite } = useContractWrite(stablecoinContract, 'approve');

  const placeOrder = useCallback(async (params: PlaceOrderParams) => {
    if (!escrowContract || !stablecoinContract) {
      setError('Contracts not loaded');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First approve the escrow contract to spend stablecoin
      toast({
        title: 'Approving Payment',
        description: 'Please approve the transaction in your wallet...',
      });

      await approveWrite({
        args: [contracts.Escrow, params.amount]
      });

      toast({
        title: 'Placing Order',
        description: 'Placing your order on the blockchain...',
      });

      // Then place the order
      const result = await placeOrderWrite({
        args: [params.vendorAddress, params.amount, params.orderId]
      });

      toast({
        title: 'Order Placed!',
        description: `Order ${params.orderId} placed successfully with escrow protection.`,
        variant: 'default'
      });

      setIsLoading(false);
      return result;

    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to place order';
      setError(errorMessage);
      setIsLoading(false);
      
      toast({
        title: 'Order Failed',
        description: errorMessage,
        variant: 'destructive'
      });

      return false;
    }
  }, [escrowContract, stablecoinContract, contracts.Escrow, placeOrderWrite, approveWrite, toast]);

  const clearError = useCallback(() => setError(null), []);

  return {
    placeOrder,
    isLoading,
    error,
    clearError,
    contracts
  };
}