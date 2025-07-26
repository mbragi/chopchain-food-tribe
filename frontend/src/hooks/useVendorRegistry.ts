import { useState, useCallback } from "react";
import { useContract, useContractRead, useContractWrite } from "@thirdweb-dev/react";
import { useWallet } from "./useWallet";
import { useToast } from "./use-toast";
import { getContracts } from "@/contracts/addresses";
import { VendorRegistryABI } from "@/contracts/abis";

export function useVendorRegistry() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { chain, address } = useWallet();
  const { toast } = useToast();

  const chainId = chain?.id || 31337;
  const contracts = getContracts(chainId);
  const { contract: vendorRegistryContract } = useContract(
    contracts.VendorRegistry,
    chainId === 31337 ? VendorRegistryABI : undefined
  );

  // Check if current address is a registered vendor
  const {
    data: isVendor,
    isLoading: checkingVendor,
    refetch: refetchVendorStatus,
  } = useContractRead(vendorRegistryContract, "isVendor", [address]);

  const { mutateAsync: registerVendorWrite } = useContractWrite(
    vendorRegistryContract,
    "registerVendor"
  );

  // Register as vendor
  const registerVendor = useCallback(async () => {
    console.log("🚀 Starting vendor registration...");
    console.log("Contract loaded:", !!vendorRegistryContract);
    console.log("Current address:", address);
    console.log("Is already vendor:", isVendor);

    if (!vendorRegistryContract) {
      const error = "Vendor registry contract not loaded";
      setError(error);
      console.error("❌", error);
      return false;
    }

    if (!address) {
      const error = "Wallet not connected";
      setError(error);
      console.error("❌", error);
      return false;
    }

    if (isVendor) {
      const error = "Already registered as vendor";
      setError(error);
      console.error("❌", error);
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("📝 Calling registerVendor on contract...");
      
      toast({
        title: "Registering Vendor",
        description: "Please confirm the transaction in your wallet...",
      });

      const result = await registerVendorWrite({
        args: [],
      });

      console.log("✅ Transaction sent:", result);

      toast({
        title: "Vendor Registered!",
        description: "You are now registered as a ChopChain vendor.",
        variant: "default",
      });

      await refetchVendorStatus();
      setIsLoading(false);
      return result;
    } catch (err: any) {
      console.error("❌ Registration failed:", err);
      const errorMessage = err?.message || "Failed to register vendor";
      setError(errorMessage);
      setIsLoading(false);

      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    }
  }, [
    vendorRegistryContract,
    isVendor,
    registerVendorWrite,
    toast,
    refetchVendorStatus,
    address,
  ]);

  // Check if any address is a vendor
  const checkVendorStatus = useCallback(
    async (vendorAddress: string): Promise<boolean> => {
      if (!vendorRegistryContract) {
        return false;
      }

      try {
        const result = await vendorRegistryContract.call("isVendor", [
          vendorAddress,
        ]);
        return result;
      } catch (err) {
        console.error("Failed to check vendor status:", err);
        return false;
      }
    },
    [vendorRegistryContract]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    isVendor: !!isVendor,
    isLoading: isLoading || checkingVendor,
    error,
    clearError,
    registerVendor,
    checkVendorStatus,
    refetchVendorStatus,
  };
}
