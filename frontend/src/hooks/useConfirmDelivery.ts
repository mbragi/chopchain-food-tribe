import { useState, useCallback } from 'react';
import { useContract, useContractWrite } from '@thirdweb-dev/react';
import { useWallet } from './useWallet';
import { getContracts } from '@/contracts/addresses';
import { useToast } from './use-toast';

export function useConfirmDelivery() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { chain } = useWallet();
  const { toast } = useToast();

  const chainId = chain?.id || 31337;
  const contracts = getContracts(chainId);

  const { contract: escrowContract } = useContract(contracts.Escrow);
  const { mutateAsync: confirmDeliveryWrite } = useContractWrite(escrowContract, 'confirmDelivery');

  const confirmDelivery = useCallback(async (orderId: string) => {
    if (!escrowContract) {
      setError('Escrow contract not loaded');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      toast({
        title: 'Confirming Delivery',
        description: 'Confirming delivery and releasing payment to vendor...',
      });

      const result = await confirmDeliveryWrite({
        args: [orderId]
      });

      toast({
        title: 'Delivery Confirmed!',
        description: `Order ${orderId} confirmed. Payment released to vendor.`,
        variant: 'default'
      });

      setIsLoading(false);
      return result;

    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to confirm delivery';
      setError(errorMessage);
      setIsLoading(false);
      
      toast({
        title: 'Confirmation Failed',
        description: errorMessage,
        variant: 'destructive'
      });

      return false;
    }
  }, [escrowContract, confirmDeliveryWrite, toast]);

  const clearError = useCallback(() => setError(null), []);

  return {
    confirmDelivery,
    isLoading,
    error,
    clearError
  };
}