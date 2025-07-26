import { useContract } from "@thirdweb-dev/react";
import { getContracts } from "@/contracts/addresses";
import { getContractABI, ContractName } from "@/contracts/abis";

/**
 * Custom hook that creates a contract instance with the appropriate ABI based on the current chain
 * @param chainId - The current chain ID
 * @param contractName - The name of the contract to create
 * @returns The contract instance
 */
export function useContractWithABI(
  chainId: number,
  contractName: ContractName
) {
  const contracts = getContracts(chainId);
  const contractAddress = contracts[contractName];
  const abi = getContractABI(chainId, contractName);

  return useContract(contractAddress, abi);
}

/**
 * Hook to get multiple contracts with ABIs
 * @param chainId - The current chain ID
 * @param contractNames - Array of contract names to create
 * @returns Object with contract instances
 */
export function useContractsWithABI(
  chainId: number,
  contractNames: ContractName[]
) {
  const contracts = getContracts(chainId);
  const result: Record<string, any> = {};

  contractNames.forEach((name) => {
    const contractAddress = contracts[name];
    const abi = getContractABI(chainId, name);
    const { contract } = useContract(contractAddress, abi);
    result[name] = contract;
  });

  return result;
}
