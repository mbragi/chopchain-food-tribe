import { useState, useCallback } from 'react';
import { useWallet } from './useWallet';
import { useToast } from './use-toast';

interface OffRampRequest {
  amount: number; // USDT amount
  currency: 'NGN' | 'USD';
  bankAccount?: {
    accountNumber: string;
    bankName: string;
    accountName: string;
  };
  mobileWallet?: {
    phoneNumber: string;
    provider: 'mtn' | 'airtel' | 'glo' | '9mobile';
  };
}

interface OffRampTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  exchangeRate: number;
  localAmount: number;
  fees: number;
  recipient: {
    type: 'bank' | 'mobile_wallet';
    details: any;
  };
}

interface OneRampConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  supportedCurrencies: string[];
  supportedTokens: string[];
}

export function useOneRamp() {
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<OffRampTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { connected, address } = useWallet();
  const { toast } = useToast();

  // OneRamp configuration
  const config: OneRampConfig = {
    apiKey: process.env.VITE_ONERAMP_API_KEY || 'sandbox_key_123',
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    supportedCurrencies: ['NGN', 'USD', 'GHS', 'KES'],
    supportedTokens: ['USDT', 'USDC', 'DAI']
  };

  // Initialize off-ramp request
  const initiateOffRamp = useCallback(async (request: OffRampRequest): Promise<OffRampTransaction | null> => {
    if (!connected || !address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to initiate off-ramp',
        variant: 'destructive'
      });
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Mock OneRamp API call - in production, this would be the actual OneRamp API
      const mockTransaction: OffRampTransaction = {
        id: `OR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: request.amount,
        currency: request.currency,
        status: 'pending',
        createdAt: new Date().toISOString(),
        exchangeRate: request.currency === 'NGN' ? 1650 : 1, // 1 USDT = 1650 NGN
        localAmount: request.currency === 'NGN' ? request.amount * 1650 : request.amount,
        fees: request.amount * 0.015, // 1.5% fee
        recipient: {
          type: request.bankAccount ? 'bank' : 'mobile_wallet',
          details: request.bankAccount || request.mobileWallet
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, this would make actual API call:
      /*
      const response = await fetch('https://api.oneramp.io/v1/off-ramp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          wallet_address: address,
          token: 'USDT',
          amount: request.amount,
          destination_currency: request.currency,
          recipient: request.bankAccount || request.mobileWallet,
          callback_url: `${window.location.origin}/api/oneramp/callback`
        })
      });

      if (!response.ok) {
        throw new Error(`OneRamp API error: ${response.statusText}`);
      }

      const transaction = await response.json();
      */

      setTransactions(prev => [mockTransaction, ...prev]);
      setIsLoading(false);

      toast({
        title: 'Off-ramp Initiated',
        description: `Converting ${request.amount} USDT to ${mockTransaction.localAmount.toLocaleString()} ${request.currency}`,
      });

      // Simulate status updates
      setTimeout(() => {
        updateTransactionStatus(mockTransaction.id, 'processing');
      }, 5000);

      setTimeout(() => {
        updateTransactionStatus(mockTransaction.id, 'completed');
      }, 15000);

      return mockTransaction;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate off-ramp';
      setError(errorMessage);
      setIsLoading(false);
      
      toast({
        title: 'Off-ramp Failed',
        description: errorMessage,
        variant: 'destructive'
      });

      return null;
    }
  }, [connected, address, toast, config.apiKey]);

  // Update transaction status (simulated)
  const updateTransactionStatus = useCallback((transactionId: string, status: OffRampTransaction['status']) => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.id === transactionId 
          ? { ...tx, status, completedAt: status === 'completed' ? new Date().toISOString() : tx.completedAt }
          : tx
      )
    );

    if (status === 'completed') {
      toast({
        title: 'Off-ramp Completed',
        description: 'Funds have been sent to your account',
      });
    }
  }, [toast]);

  // Get exchange rate quote
  const getExchangeRate = useCallback(async (fromToken: string, toCurrency: string): Promise<{
    rate: number;
    fees: number;
    minimumAmount: number;
    maximumAmount: number;
  } | null> => {
    try {
      // Mock exchange rate - in production, fetch from OneRamp API
      const mockRate = {
        rate: toCurrency === 'NGN' ? 1650 : 1,
        fees: 0.015, // 1.5%
        minimumAmount: 5, // 5 USDT minimum
        maximumAmount: 10000 // 10,000 USDT maximum
      };

      return mockRate;
    } catch (err) {
      console.error('Failed to fetch exchange rate:', err);
      return null;
    }
  }, []);

  // Get supported payment methods for a currency
  const getPaymentMethods = useCallback((currency: string) => {
    const methods = {
      NGN: [
        { type: 'bank', name: 'Bank Transfer', supported_banks: ['GTBank', 'Access Bank', 'First Bank', 'UBA', 'Zenith Bank'] },
        { type: 'mobile_wallet', name: 'Mobile Money', supported_providers: ['mtn', 'airtel', 'glo', '9mobile'] }
      ],
      USD: [
        { type: 'bank', name: 'Bank Transfer', supported_banks: ['Chase', 'Bank of America', 'Wells Fargo'] }
      ]
    };

    return methods[currency as keyof typeof methods] || [];
  }, []);

  // Calculate off-ramp details
  const calculateOffRamp = useCallback(async (amount: number, currency: string) => {
    const rateInfo = await getExchangeRate('USDT', currency);
    if (!rateInfo) return null;

    const grossAmount = amount * rateInfo.rate;
    const fees = amount * rateInfo.fees;
    const netAmount = grossAmount - (fees * rateInfo.rate);

    return {
      amount,
      currency,
      exchangeRate: rateInfo.rate,
      grossAmount,
      fees,
      netAmount,
      feesInLocal: fees * rateInfo.rate
    };
  }, [getExchangeRate]);

  // Get transaction history
  const getTransactionHistory = useCallback(() => {
    return transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions]);

  // Check if OneRamp is available in user's region
  const isAvailable = useCallback((currency: string) => {
    return config.supportedCurrencies.includes(currency);
  }, [config.supportedCurrencies]);

  const clearError = useCallback(() => setError(null), []);

  return {
    // State
    isLoading,
    error,
    transactions: getTransactionHistory(),
    config,

    // Functions
    initiateOffRamp,
    getExchangeRate,
    getPaymentMethods,
    calculateOffRamp,
    isAvailable,
    updateTransactionStatus,
    clearError
  };
}