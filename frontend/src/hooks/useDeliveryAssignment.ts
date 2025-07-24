import { useState, useCallback } from 'react';
import { useContract, useContractRead, useContractWrite } from '@thirdweb-dev/react';
import { useWallet } from './useWallet';
import { getContracts } from '@/contracts/addresses';
import { useToast } from './use-toast';

export interface OrderDetails {
  user: string;
  vendor: string;
  deliveryAgent: string;
  amount: string;
  confirmed: boolean;
  refunded: boolean;
  paid: boolean;
  assignedAt: number;
}

export function useDeliveryAssignment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { chain, address } = useWallet();
  const { toast } = useToast();

  const chainId = chain?.id || 31337;
  const contracts = getContracts(chainId);

  const { contract: escrowContract } = useContract(contracts.Escrow);

  // Get unassigned orders available for delivery
  const { data: unassignedOrders, refetch: refetchUnassignedOrders, isLoading: loadingUnassigned } = useContractRead(
    escrowContract,
    'getUnassignedOrders'
  );

  // Get orders assigned to current agent
  const { data: agentOrders, refetch: refetchAgentOrders, isLoading: loadingAgentOrders } = useContractRead(
    escrowContract,
    'getAgentOrders',
    [address]
  );

  const { mutateAsync: assignDeliveryAgentWrite } = useContractWrite(escrowContract, 'assignDeliveryAgent');
  const { mutateAsync: startDeliveryWrite } = useContractWrite(escrowContract, 'startDelivery');
  const { mutateAsync: confirmDeliveryWrite } = useContractWrite(escrowContract, 'confirmDelivery');
  const { mutateAsync: rateDeliveryAgentWrite } = useContractWrite(escrowContract, 'rateDeliveryAgent');

  // Assign delivery agent to an order
  const assignToOrder = useCallback(async (orderId: string) => {
    if (!escrowContract) {
      setError('Escrow contract not loaded');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      toast({
        title: 'Assigning Order',
        description: `Assigning order ${orderId} to you...`,
      });

      const result = await assignDeliveryAgentWrite({
        args: [orderId]
      });

      toast({
        title: 'Order Assigned!',
        description: `Order ${orderId} has been assigned to you.`,
        variant: 'default'
      });

      await Promise.all([
        refetchUnassignedOrders(),
        refetchAgentOrders()
      ]);

      setIsLoading(false);
      return result;

    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to assign order';
      setError(errorMessage);
      setIsLoading(false);
      
      toast({
        title: 'Assignment Failed',
        description: errorMessage,
        variant: 'destructive'
      });

      return false;
    }
  }, [escrowContract, assignDeliveryAgentWrite, toast, refetchUnassignedOrders, refetchAgentOrders]);

  // Start delivery process
  const startDelivery = useCallback(async (orderId: string) => {
    if (!escrowContract) {
      setError('Escrow contract not loaded');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      toast({
        title: 'Starting Delivery',
        description: `Starting delivery for order ${orderId}...`,
      });

      const result = await startDeliveryWrite({
        args: [orderId]
      });

      toast({
        title: 'Delivery Started!',
        description: `You have started delivery for order ${orderId}.`,
        variant: 'default'
      });

      await refetchAgentOrders();
      setIsLoading(false);
      return result;

    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to start delivery';
      setError(errorMessage);
      setIsLoading(false);
      
      toast({
        title: 'Start Delivery Failed',
        description: errorMessage,
        variant: 'destructive'
      });

      return false;
    }
  }, [escrowContract, startDeliveryWrite, toast, refetchAgentOrders]);

  // Confirm delivery completion
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
        description: `Confirming delivery completion for order ${orderId}...`,
      });

      const result = await confirmDeliveryWrite({
        args: [orderId]
      });

      toast({
        title: 'Delivery Confirmed!',
        description: `Order ${orderId} has been marked as delivered and payment released.`,
        variant: 'default'
      });

      await refetchAgentOrders();
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
  }, [escrowContract, confirmDeliveryWrite, toast, refetchAgentOrders]);

  // Rate delivery agent (called by customer)
  const rateDeliveryAgent = useCallback(async (orderId: string, rating: number) => {
    if (!escrowContract) {
      setError('Escrow contract not loaded');
      return false;
    }

    // Convert rating from 1-5 scale to contract scale (100-500)
    const contractRating = Math.round(rating * 100);
    if (contractRating < 100 || contractRating > 500) {
      setError('Rating must be between 1 and 5 stars');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      toast({
        title: 'Rating Delivery Agent',
        description: `Submitting ${rating} star rating...`,
      });

      const result = await rateDeliveryAgentWrite({
        args: [orderId, contractRating]
      });

      toast({
        title: 'Rating Submitted!',
        description: `You rated the delivery agent ${rating} stars.`,
        variant: 'default'
      });

      setIsLoading(false);
      return result;

    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to rate delivery agent';
      setError(errorMessage);
      setIsLoading(false);
      
      toast({
        title: 'Rating Failed',
        description: errorMessage,
        variant: 'destructive'
      });

      return false;
    }
  }, [escrowContract, rateDeliveryAgentWrite, toast]);

  // Get order details
  const getOrderDetails = useCallback(async (orderId: string): Promise<OrderDetails | null> => {
    if (!escrowContract) {
      return null;
    }

    try {
      const details = await escrowContract.call('getOrder', [orderId]);
      return {
        user: details[0],
        vendor: details[1],
        deliveryAgent: details[2],
        amount: details[3].toString(),
        confirmed: details[4],
        refunded: details[5],
        paid: details[6],
        assignedAt: details[7].toNumber()
      };
    } catch (err) {
      console.error('Failed to get order details:', err);
      return null;
    }
  }, [escrowContract]);

  // Get order status for display
  const getOrderStatus = useCallback((orderDetails: OrderDetails): string => {
    if (orderDetails.refunded) return 'refunded';
    if (orderDetails.confirmed && orderDetails.paid) return 'completed';
    if (orderDetails.deliveryAgent && orderDetails.deliveryAgent !== '0x0000000000000000000000000000000000000000') {
      return 'in_delivery';
    }
    return 'pending_assignment';
  }, []);

  // Format amount from wei to readable format
  const formatAmount = useCallback((amountWei: string): number => {
    return parseFloat(amountWei) / 1e18; // Convert from wei to USDC/USDT
  }, []);

  // Calculate estimated delivery time
  const getEstimatedDeliveryTime = useCallback((assignedAt: number): string => {
    if (assignedAt === 0) return 'Not assigned';
    
    const assignedTime = new Date(assignedAt * 1000);
    const estimatedTime = new Date(assignedTime.getTime() + (30 * 60 * 1000)); // 30 minutes
    const now = new Date();
    
    if (estimatedTime <= now) {
      return 'Overdue';
    }
    
    const timeDiff = estimatedTime.getTime() - now.getTime();
    const minutesLeft = Math.round(timeDiff / (1000 * 60));
    
    return `${minutesLeft} minutes`;
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    unassignedOrders: unassignedOrders || [],
    agentOrders: agentOrders || [],
    isLoading: isLoading || loadingUnassigned || loadingAgentOrders,
    error,
    clearError,
    assignToOrder,
    startDelivery,
    confirmDelivery,
    rateDeliveryAgent,
    getOrderDetails,
    getOrderStatus,
    formatAmount,
    getEstimatedDeliveryTime,
    refetchUnassignedOrders,
    refetchAgentOrders
  };
}