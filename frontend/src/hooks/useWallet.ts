import {
  useAddress,
  useConnectionStatus,
  useDisconnect,
  useMetamask,
  useChain,
  useSwitchChain,
  useBalance,
} from "@thirdweb-dev/react";
import { useCallback, useState } from "react";

// Supported chain IDs (EVM chains)
const CHAINS = {
  base: 8453, // Base mainnet
  baseSepolia: 84532, // Base Sepolia testnet
  sepolia: 11155111, // Ethereum Sepolia testnet
  localhost: 31337,
};

/**
 * useWallet - Modular wallet abstraction using Thirdweb SDK
 * Supports EVM chains (Base, Sepolia, localhost). Starknet placeholder for future.
 * Now exposes error and clearError for UI notification.
 */
export function useWallet() {
  const address = useAddress();
  const status = useConnectionStatus();
  const connect = useMetamask();
  const disconnect = useDisconnect();
  const chainResult = useChain(); // Always call the hook
  const chain = chainResult ? chainResult.chain : undefined;
  const switchChain = useSwitchChain();
  const { data: balance, isLoading: balanceLoading } = useBalance();

  const [error, setError] = useState<string | null>(null);

  // Helper to extract error message
  function getErrorMessage(err: unknown, fallback: string) {
    if (typeof err === "object" && err && "message" in err) {
      const maybeError = err as { message?: unknown };
      if (typeof maybeError.message === "string") {
        return maybeError.message;
      }
    }
    return fallback;
  }

  // Modular connect/disconnect with error handling
  const handleConnect = useCallback(async () => {
    try {
      await connect();
      setError(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to connect wallet"));
    }
  }, [connect]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
      setError(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to disconnect wallet"));
    }
  }, [disconnect]);

  // Modular chain switcher with error handling
  const changeChain = useCallback(
    async (chainId: number) => {
      try {
        await switchChain(chainId);
        setError(null);
      } catch (err: unknown) {
        setError(getErrorMessage(err, `Failed to switch to chain ${chainId}`));
      }
    },
    [switchChain]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    connected: status === "connected",
    connecting: status === "connecting",
    disconnected: status === "disconnected",
    address,
    balance: balance?.displayValue || 0,
    balanceSymbol: balance?.symbol || "",
    balanceLoading,
    connect: handleConnect,
    disconnect: handleDisconnect,
    chain,
    switchChain: changeChain,
    CHAINS,
    error,
    clearError,
  };
}
