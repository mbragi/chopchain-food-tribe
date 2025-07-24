import { useState, useCallback } from 'react';
import { useContract, useContractWrite, useContractRead, useAddress } from '@thirdweb-dev/react';
import { useWallet } from './useWallet';
import { useCurrency } from './useCurrency';
import { useToast } from './use-toast';
import { ethers } from 'ethers';

// Contract addresses (these would be set after deployment)
const CONTRACT_ADDRESSES = {
  escrow: process.env.VITE_ESCROW_CONTRACT || '0x742d35Cc6C4e8e37C9Fd5Bf5f54e61b7e3b2B2A1',
  chopToken: process.env.VITE_CHOP_TOKEN_CONTRACT || '0x742d35Cc6C4e8e37C9Fd5Bf5f54e61b7e3b2B2A2',
  vendorRegistry: process.env.VITE_VENDOR_REGISTRY_CONTRACT || '0x742d35Cc6C4e8e37C9Fd5Bf5f54e61b7e3b2B2A3',
  usdt: process.env.VITE_USDT_CONTRACT || '0xdAC17F958D2ee523a2206206994597C13D831ec7'
};

interface OrderItem {
  name: string;
  priceUsdt: number;
  quantity: number;
  vendor: string;
  vendorAddress?: string;
}

interface CheckoutState {
  isProcessing: boolean;
  currentStep: 'approval' | 'placing' | 'confirming' | 'completed' | 'error';
  transactionHash?: string;
  orderId?: string;
  error?: string;
}

export function useEnhancedCheckout() {
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    isProcessing: false,
    currentStep: 'approval'
  });

  const { connected, address } = useWallet();
  const { getPriceBreakdown } = useCurrency();
  const { toast } = useToast();

  // Contract hooks
  const { contract: escrowContract } = useContract(CONTRACT_ADDRESSES.escrow);
  const { contract: usdtContract } = useContract(CONTRACT_ADDRESSES.usdt);
  const { contract: chopTokenContract } = useContract(CONTRACT_ADDRESSES.chopToken);

  // Contract write functions
  const { mutateAsync: approveUSDT } = useContractWrite(usdtContract, 'approve');
  const { mutateAsync: placeOrder } = useContractWrite(escrowContract, 'placeOrder');
  const { mutateAsync: confirmDelivery } = useContractWrite(escrowContract, 'confirmDelivery');
  const { mutateAsync: requestRefund } = useContractWrite(escrowContract, 'refund');

  // Contract read functions
  const { data: usdtBalance } = useContractRead(usdtContract, 'balanceOf', [address]);
  const { data: usdtAllowance } = useContractRead(usdtContract, 'allowance', [address, CONTRACT_ADDRESSES.escrow]);

  // Check if user has sufficient USDT balance and allowance
  const checkBalance = useCallback(async (totalUsdtAmount: number): Promise<boolean> => {
    if (!usdtBalance) return false;
    
    const balance = parseFloat(ethers.utils.formatUnits(usdtBalance, 6)); // USDT has 6 decimals
    return balance >= totalUsdtAmount;
  }, [usdtBalance]);

  const checkAllowance = useCallback(async (totalUsdtAmount: number): Promise<boolean> => {
    if (!usdtAllowance) return false;
    
    const allowance = parseFloat(ethers.utils.formatUnits(usdtAllowance, 6));
    return allowance >= totalUsdtAmount;
  }, [usdtAllowance]);

  // Main checkout function
  const processCheckout = useCallback(async (
    items: OrderItem[],
    deliveryAddress: string,
    vendorAddress: string
  ): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    if (!connected || !address) {
      return { success: false, error: 'Wallet not connected' };
    }

    setCheckoutState({ isProcessing: true, currentStep: 'approval' });

    try {
      // Calculate total price
      const priceBreakdown = getPriceBreakdown(
        items.map(item => ({ price: item.priceUsdt, quantity: item.quantity }))
      );
      
      const totalUsdtAmount = priceBreakdown.total.usdt;
      const totalUsdtWei = ethers.utils.parseUnits(totalUsdtAmount.toString(), 6);

      // Step 1: Check balance
      const hasSufficientBalance = await checkBalance(totalUsdtAmount);
      if (!hasSufficientBalance) {
        throw new Error('Insufficient USDT balance');
      }

      // Step 2: Check and approve USDT allowance
      const hasAllowance = await checkAllowance(totalUsdtAmount);
      if (!hasAllowance) {
        toast({
          title: 'Approving USDT',
          description: 'Please approve USDT spending in your wallet...',
        });

        const approvalTx = await approveUSDT({
          args: [CONTRACT_ADDRESSES.escrow, totalUsdtWei]
        });

        await approvalTx.receipt;
        
        toast({
          title: 'USDT Approved',
          description: 'USDT spending approved successfully',
        });
      }

      // Step 3: Place order on escrow contract
      setCheckoutState({ isProcessing: true, currentStep: 'placing' });
      
      toast({
        title: 'Placing Order',
        description: 'Creating escrow order on blockchain...',
      });

      const orderTx = await placeOrder({
        args: [vendorAddress, totalUsdtWei, JSON.stringify({
          items,
          deliveryAddress,
          timestamp: Date.now()
        })]
      });

      const receipt = await orderTx.receipt;
      
      // Extract order ID from events (simplified - in practice, parse logs)
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      setCheckoutState({
        isProcessing: false,
        currentStep: 'completed',
        transactionHash: receipt.transactionHash,
        orderId
      });

      toast({
        title: 'Order Placed Successfully!',
        description: `Order ID: ${orderId}`,
      });

      return { success: true, orderId };

    } catch (error: any) {
      console.error('Checkout error:', error);
      
      const errorMessage = error.message || 'Failed to process checkout';
      
      setCheckoutState({
        isProcessing: false,
        currentStep: 'error',
        error: errorMessage
      });

      toast({
        title: 'Checkout Failed',
        description: errorMessage,
        variant: 'destructive'
      });

      return { success: false, error: errorMessage };
    }
  }, [
    connected,
    address,
    getPriceBreakdown,
    checkBalance,
    checkAllowance,
    approveUSDT,
    placeOrder,
    toast
  ]);

  // Function to confirm delivery (for customers)
  const confirmOrderDelivery = useCallback(async (orderId: string) => {
    if (!connected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to confirm delivery',
        variant: 'destructive'
      });
      return false;
    }

    try {
      toast({
        title: 'Confirming Delivery',
        description: 'Please confirm the transaction in your wallet...',
      });

      const tx = await confirmDelivery({ args: [orderId] });
      await tx.receipt;

      toast({
        title: 'Delivery Confirmed',
        description: 'Payment has been released to the vendor and CHOP tokens have been minted!',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Confirmation Failed',
        description: error.message || 'Failed to confirm delivery',
        variant: 'destructive'
      });
      return false;
    }
  }, [connected, confirmDelivery, toast]);

  // Function to request refund
  const requestOrderRefund = useCallback(async (orderId: string, reason: string) => {
    if (!connected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to request refund',
        variant: 'destructive'
      });
      return false;
    }

    try {
      toast({
        title: 'Requesting Refund',
        description: 'Please confirm the transaction in your wallet...',
      });

      const tx = await requestRefund({ args: [orderId] });
      await tx.receipt;

      toast({
        title: 'Refund Requested',
        description: 'Your refund has been processed and USDT returned to your wallet',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Refund Failed',
        description: error.message || 'Failed to process refund',
        variant: 'destructive'
      });
      return false;
    }
  }, [connected, requestRefund, toast]);

  // Reset checkout state
  const resetCheckout = useCallback(() => {
    setCheckoutState({
      isProcessing: false,
      currentStep: 'approval'
    });
  }, []);

  // Get formatted balances
  const getFormattedBalances = useCallback(() => {
    const usdtBalanceFormatted = usdtBalance 
      ? parseFloat(ethers.utils.formatUnits(usdtBalance, 6)).toFixed(2)
      : '0.00';
    
    const allowanceFormatted = usdtAllowance
      ? parseFloat(ethers.utils.formatUnits(usdtAllowance, 6)).toFixed(2)
      : '0.00';

    return {
      usdt: usdtBalanceFormatted,
      allowance: allowanceFormatted
    };
  }, [usdtBalance, usdtAllowance]);

  return {
    // State
    checkoutState,
    balances: getFormattedBalances(),
    contractAddresses: CONTRACT_ADDRESSES,

    // Functions
    processCheckout,
    confirmOrderDelivery,
    requestOrderRefund,
    resetCheckout,
    
    // Utilities
    checkBalance,
    checkAllowance
  };
}