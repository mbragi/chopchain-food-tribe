import { useWallet } from "./useWallet";
import { useContractsWithABI } from "./useContractWithABI";

/**
 * Hook that creates all contracts with appropriate ABIs for the current chain
 * This demonstrates the batch contract creation feature
 */
export function useAllContracts() {
  const { chain } = useWallet();
  const chainId = parseInt(chain) || 31337;

  const contracts = useContractsWithABI(chainId, [
    "VendorRegistry",
    "Escrow",
    "USDT",
    "USDC",
    "CHOPToken",
  ]);

  return {
    chainId,
    contracts,
    // Convenience getters
    vendorRegistry: contracts.VendorRegistry,
    escrow: contracts.Escrow,
    usdt: contracts.USDT,
    usdc: contracts.USDC,
    chopToken: contracts.CHOPToken,
  };
}
