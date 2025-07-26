/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { useContract, useContractRead, useContractWrite } from '@thirdweb-dev/react';
import { useWallet } from './useWallet';
import { getContracts } from '@/contracts/addresses';
import { useToast } from './use-toast';

export interface DeliveryAgent {
  agent: string;
  isActive: boolean;
  totalDeliveries: number;
  rating: number; // Scaled by 100 (e.g., 450 = 4.50 stars)
  registeredAt: number;
}

export function useDeliveryAgentRegistry() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { chain, address } = useWallet();
  const { toast } = useToast();

  const chainId = parseInt(chain) || 31337;
  const contracts = getContracts(chainId);

  const { contract: deliveryAgentRegistryContract } = useContract(contracts.DeliveryAgentRegistry);
  
  // Check if current address is a registered delivery agent
  const { data: isDeliveryAgent, isLoading: checkingAgent, refetch: refetchAgentStatus } = useContractRead(
    deliveryAgentRegistryContract,
    'isDeliveryAgent',
    [address]
  );

  // Check if agent is currently active
  const { data: isAgentActive, refetch: refetchActiveStatus } = useContractRead(
    deliveryAgentRegistryContract,
    'isAgentActive',
    [address]
  );

  // Get agent details
  const { data: agentDetails, refetch: refetchAgentDetails } = useContractRead(
    deliveryAgentRegistryContract,
    'getDeliveryAgent',
    [address],
  );

  // Get total agents count
  const { data: totalAgents } = useContractRead(
    deliveryAgentRegistryContract,
    'getTotalAgents'
  );

  // Get active agents
  const { data: activeAgents, refetch: refetchActiveAgents } = useContractRead(
    deliveryAgentRegistryContract,
    'getActiveAgents'
  );

  const { mutateAsync: registerAgentWrite } = useContractWrite(deliveryAgentRegistryContract, 'registerDeliveryAgent');
  const { mutateAsync: setStatusWrite } = useContractWrite(deliveryAgentRegistryContract, 'setAgentStatus');

  // Register as delivery agent
  const registerDeliveryAgent = useCallback(async () => {
    if (!deliveryAgentRegistryContract) {
      setError('Delivery agent registry contract not loaded');
      return false;
    }

    if (isDeliveryAgent) {
      setError('Already registered as delivery agent');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      toast({
        title: 'Registering Delivery Agent',
        description: 'Registering your address as a delivery agent...',
      });

      const result = await registerAgentWrite({
        args: []
      });

      toast({
        title: 'Delivery Agent Registered!',
        description: 'You are now registered as a ChopChain delivery agent.',
        variant: 'default'
      });

      await Promise.all([
        refetchAgentStatus(),
        refetchActiveStatus(),
        refetchAgentDetails(),
        refetchActiveAgents()
      ]);

      setIsLoading(false);
      return result;

    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to register delivery agent';
      setError(errorMessage);
      setIsLoading(false);
      
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive'
      });

      return false;
    }
  }, [deliveryAgentRegistryContract, isDeliveryAgent, registerAgentWrite, toast, refetchAgentStatus, refetchActiveStatus, refetchAgentDetails, refetchActiveAgents]);

  // Toggle agent active status
  const setAgentStatus = useCallback(async (isActive: boolean) => {
    if (!deliveryAgentRegistryContract) {
      setError('Delivery agent registry contract not loaded');
      return false;
    }

    if (!isDeliveryAgent) {
      setError('Not registered as delivery agent');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      toast({
        title: isActive ? 'Going Online' : 'Going Offline',
        description: `Setting your status to ${isActive ? 'active' : 'inactive'}...`,
      });

      const result = await setStatusWrite({
        args: [isActive]
      });

      toast({
        title: 'Status Updated!',
        description: `You are now ${isActive ? 'active and accepting orders' : 'offline'}.`,
        variant: 'default'
      });

      await Promise.all([
        refetchActiveStatus(),
        refetchAgentDetails(),
        refetchActiveAgents()
      ]);

      setIsLoading(false);
      return result;

    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update status';
      setError(errorMessage);
      setIsLoading(false);
      
      toast({
        title: 'Status Update Failed',
        description: errorMessage,
        variant: 'destructive'
      });

      return false;
    }
  }, [deliveryAgentRegistryContract, isDeliveryAgent, setStatusWrite, toast, refetchActiveStatus, refetchAgentDetails, refetchActiveAgents]);

  // Get agent details by address
  const getAgentDetails = useCallback(async (agentAddress: string): Promise<DeliveryAgent | null> => {
    if (!deliveryAgentRegistryContract) {
      return null;
    }

    try {
      const details = await deliveryAgentRegistryContract.call('getDeliveryAgent', [agentAddress]);
      return {
        agent: details.agent,
        isActive: details.isActive,
        totalDeliveries: details.totalDeliveries.toNumber(),
        rating: details.rating.toNumber(),
        registeredAt: details.registeredAt.toNumber()
      };
    } catch (err) {
      console.error('Failed to get agent details:', err);
      return null;
    }
  }, [deliveryAgentRegistryContract]);

  const clearError = useCallback(() => setError(null), []);

  // Format rating from contract (scaled by 100) to display format
  const formatRating = useCallback((rating: number): number => {
    return rating / 100; // Convert 450 to 4.50
  }, []);

  // Parse agent details from contract response
  const parsedAgentDetails: DeliveryAgent | null = agentDetails ? {
    agent: agentDetails.agent,
    isActive: agentDetails.isActive,
    totalDeliveries: agentDetails.totalDeliveries?.toNumber() || 0,
    rating: agentDetails.rating?.toNumber() || 500,
    registeredAt: agentDetails.registeredAt?.toNumber() || 0
  } : null;

  return {
    isDeliveryAgent: !!isDeliveryAgent,
    isAgentActive: !!isAgentActive,
    agentDetails: parsedAgentDetails,
    totalAgents: totalAgents?.toNumber() || 0,
    activeAgents: activeAgents || [],
    isLoading: isLoading || checkingAgent,
    error,
    clearError,
    registerDeliveryAgent,
    setAgentStatus,
    getAgentDetails,
    formatRating,
    refetchAgentStatus,
    refetchActiveStatus,
    refetchAgentDetails
  };
}