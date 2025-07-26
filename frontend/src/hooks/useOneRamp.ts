/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback } from "react";
import { useWallet } from "./useWallet";
import { useToast } from "./use-toast";

interface BankAccount {
  accountNumber: string;
  bankName: string;
  accountName: string;
}

interface MobileWallet {
  phoneNumber: string;
  provider: "mtn" | "airtel" | "glo" | "9mobile";
}

interface OffRampRequest {
  amount: number; // USDT amount
  currency: "NGN" | "USD";
  bankAccount?: BankAccount;
  mobileWallet?: MobileWallet;
}

interface OffRampTransaction {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
  exchangeRate: number;
  localAmount: number;
  fees: number;
  recipient: {
    type: "bank" | "mobile_wallet";
    details: BankAccount | MobileWallet;
  };
}

interface OneRampConfig {
  apiKey: string;
  environment: "sandbox" | "production";
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
    apiKey: import.meta.env.VITE_ONERAMP_API_KEY || "sandbox_key_123",
    environment:
      import.meta.env.VITE_MODE === "production" ? "production" : "sandbox",
    supportedCurrencies: ["NGN", "USD", "GHS", "KES"],
    supportedTokens: ["USDT", "USDC", "DAI"],
  };

  // OneRamp API base URL
  const getApiBaseUrl = () => {
    return config.environment === "production"
      ? "https://api.oneramp.io/v1"
      : "https://sandbox-api.oneramp.io/v1";
  };

  // Initialize off-ramp request
  const initiateOffRamp = useCallback(
    async (request: OffRampRequest): Promise<OffRampTransaction | null> => {
      if (!connected || !address) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet to initiate off-ramp",
          variant: "destructive",
        });
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Make actual OneRamp API call
        const apiUrl = `${getApiBaseUrl()}/off-ramp`;

        const requestBody = {
          wallet_address: address,
          token: "USDT",
          amount: request.amount,
          destination_currency: request.currency,
          recipient: request.bankAccount || request.mobileWallet,
          callback_url: `${window.location.origin}/api/oneramp/callback`,
          metadata: {
            source: "chopchain",
            user_type: "vendor",
          },
        };

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `OneRamp API error: ${response.statusText} - ${
              errorData.message || "Unknown error"
            }`
          );
        }

        const transactionData = await response.json();

        // Transform OneRamp response to our format
        const transaction: OffRampTransaction = {
          id:
            transactionData.id ||
            `OR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: request.amount,
          currency: request.currency,
          status: transactionData.status || "pending",
          createdAt: new Date().toISOString(),
          exchangeRate:
            transactionData.exchange_rate ||
            (request.currency === "NGN" ? 1650 : 1),
          localAmount:
            transactionData.local_amount ||
            (request.currency === "NGN"
              ? request.amount * 1650
              : request.amount),
          fees: transactionData.fees || request.amount * 0.015,
          recipient: {
            type: request.bankAccount ? "bank" : "mobile_wallet",
            details: request.bankAccount || request.mobileWallet,
          },
        };

        setTransactions((prev) => [transaction, ...prev]);
        setIsLoading(false);

        toast({
          title: "Off-ramp Initiated",
          description: `Converting ${
            request.amount
          } USDT to ${transaction.localAmount.toLocaleString()} ${
            request.currency
          }`,
        });

        // Set up polling for status updates
        if (transaction.status === "pending") {
          pollTransactionStatus(transaction.id);
        }

        return transaction;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initiate off-ramp";
        setError(errorMessage);
        setIsLoading(false);

        toast({
          title: "Off-ramp Failed",
          description: errorMessage,
          variant: "destructive",
        });

        return null;
      }
    },
    [connected, address, toast, getApiBaseUrl, config.apiKey]
  );

  // Update transaction status
  const updateTransactionStatus = useCallback(
    (transactionId: string, status: OffRampTransaction["status"]) => {
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.id === transactionId
            ? {
                ...tx,
                status,
                completedAt:
                  status === "completed"
                    ? new Date().toISOString()
                    : tx.completedAt,
              }
            : tx
        )
      );

      if (status === "completed") {
        toast({
          title: "Off-ramp Completed",
          description: "Funds have been sent to your account",
        });
      }
    },
    [toast]
  );

  // Poll transaction status from OneRamp API
  const pollTransactionStatus = useCallback(
    async (transactionId: string) => {
      const maxAttempts = 30; // 5 minutes with 10-second intervals
      let attempts = 0;

      const poll = async () => {
        try {
          const apiUrl = `${getApiBaseUrl()}/transactions/${transactionId}`;
          const response = await fetch(apiUrl, {
            headers: {
              Authorization: `Bearer ${config.apiKey}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            const newStatus = data.status as OffRampTransaction["status"];

            updateTransactionStatus(transactionId, newStatus);

            // Stop polling if transaction is completed or failed
            if (newStatus === "completed" || newStatus === "failed") {
              return;
            }
          }
        } catch (error) {
          console.error("Failed to poll transaction status:", error);
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        }
      };

      poll();
    },
    [config.apiKey, getApiBaseUrl, updateTransactionStatus]
  );

  // Get exchange rate quote
  const getExchangeRate = useCallback(
    async (
      fromToken: string,
      toCurrency: string
    ): Promise<{
      rate: number;
      fees: number;
      minimumAmount: number;
      maximumAmount: number;
    } | null> => {
      try {
        // Fetch real exchange rate from OneRamp API
        const apiUrl = `${getApiBaseUrl()}/quote`;
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from_token: fromToken,
            to_currency: toCurrency,
            amount: 1, // Get rate for 1 USDT
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return {
            rate: data.exchange_rate || (toCurrency === "NGN" ? 1650 : 1),
            fees: data.fee_percentage || 0.015,
            minimumAmount: data.minimum_amount || 5,
            maximumAmount: data.maximum_amount || 10000,
          };
        } else {
          // Fallback to mock data if API fails
          console.warn("OneRamp API failed, using fallback rates");
          return {
            rate: toCurrency === "NGN" ? 1650 : 1,
            fees: 0.015,
            minimumAmount: 5,
            maximumAmount: 10000,
          };
        }
      } catch (err) {
        console.error("Failed to fetch exchange rate:", err);
        // Fallback to mock data
        return {
          rate: toCurrency === "NGN" ? 1650 : 1,
          fees: 0.015,
          minimumAmount: 5,
          maximumAmount: 10000,
        };
      }
    },
    [config.apiKey, getApiBaseUrl]
  );

  // Get supported payment methods for a currency
  const getPaymentMethods = useCallback((currency: string) => {
    const methods = {
      NGN: [
        {
          type: "bank",
          name: "Bank Transfer",
          supported_banks: [
            "GTBank",
            "Access Bank",
            "First Bank",
            "UBA",
            "Zenith Bank",
          ],
        },
        {
          type: "mobile_wallet",
          name: "Mobile Money",
          supported_providers: ["mtn", "airtel", "glo", "9mobile"],
        },
      ],
      USD: [
        {
          type: "bank",
          name: "Bank Transfer",
          supported_banks: ["Chase", "Bank of America", "Wells Fargo"],
        },
      ],
    };

    return methods[currency as keyof typeof methods] || [];
  }, []);

  // Calculate off-ramp details
  const calculateOffRamp = useCallback(
    async (amount: number, currency: string) => {
      const rateInfo = await getExchangeRate("USDT", currency);
      if (!rateInfo) return null;

      const grossAmount = amount * rateInfo.rate;
      const fees = amount * rateInfo.fees;
      const netAmount = grossAmount - fees * rateInfo.rate;

      return {
        amount,
        currency,
        exchangeRate: rateInfo.rate,
        grossAmount,
        fees,
        netAmount,
        feesInLocal: fees * rateInfo.rate,
      };
    },
    [getExchangeRate]
  );

  // Get transaction history
  const getTransactionHistory = useCallback(() => {
    return transactions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [transactions]);

  // Check if OneRamp is available in user's region
  const isAvailable = useCallback(
    (currency: string) => {
      return config.supportedCurrencies.includes(currency);
    },
    [config.supportedCurrencies]
  );

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
    pollTransactionStatus,
    clearError,
  };
}
