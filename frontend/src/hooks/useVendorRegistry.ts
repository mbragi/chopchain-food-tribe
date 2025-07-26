import { useState, useCallback } from "react";
import { useContract, useContractRead, useContractWrite } from "@thirdweb-dev/react";
import { useWallet } from "./useWallet";
import { useToast } from "./use-toast";
import { getContracts } from "@/contracts/addresses";
import { VendorRegistryABI } from "@/contracts/abis";

export interface VendorProfile {
  vendorAddress: string;
  storeName: string;
  description: string;
  cuisineTypes: string[];
  contactPhone: string;
  contactEmail: string;
  physicalAddress: string;
  deliveryRadius: number;
  minimumOrder: string; // in wei
  deliveryFee: string; // in wei
  preparationTime: number;
  isActive: boolean;
  rating: number;
  totalOrders: number;
  registeredAt: number;
}

export interface MenuItem {
  itemId: number;
  name: string;
  description: string;
  price: string; // in wei
  category: string;
  isAvailable: boolean;
  isPopular: boolean;
  spicyLevel: number;
}

export interface DayHours {
  isOperating: boolean;
  openTime: number; // minutes from midnight
  closeTime: number; // minutes from midnight
}

export interface VendorRegistrationData {
  storeName: string;
  description: string;
  cuisineTypes: string[];
  contactPhone: string;
  contactEmail: string;
  physicalAddress: string;
  deliveryRadius: number;
  minimumOrder: string; // in wei
  deliveryFee: string; // in wei
  preparationTime: number;
}

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

  const { mutateAsync: updateVendorProfileWrite } = useContractWrite(
    vendorRegistryContract,
    "updateVendorProfile"
  );

  const { mutateAsync: setVendorStatusWrite } = useContractWrite(
    vendorRegistryContract,
    "setVendorStatus"
  );

  const { mutateAsync: updateBusinessHoursWrite } = useContractWrite(
    vendorRegistryContract,
    "updateBusinessHours"
  );

  const { mutateAsync: addMenuItemWrite } = useContractWrite(
    vendorRegistryContract,
    "addMenuItem"
  );

  const { mutateAsync: updateMenuItemWrite } = useContractWrite(
    vendorRegistryContract,
    "updateMenuItem"
  );

  const { mutateAsync: removeMenuItemWrite } = useContractWrite(
    vendorRegistryContract,
    "removeMenuItem"
  );

  // Register as vendor with comprehensive data
  const registerVendor = useCallback(async (vendorData: VendorRegistrationData) => {
    if (!vendorRegistryContract) {
      setError("Vendor registry contract not loaded");
      return false;
    }

    if (isVendor) {
      setError("Already registered as vendor");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      toast({
        title: "Registering Vendor",
        description: "Registering your vendor profile on-chain...",
      });

      const result = await registerVendorWrite({
        args: [
          vendorData.storeName,
          vendorData.description,
          vendorData.cuisineTypes,
          vendorData.contactPhone,
          vendorData.contactEmail,
          vendorData.physicalAddress,
          vendorData.deliveryRadius,
          vendorData.minimumOrder,
          vendorData.deliveryFee,
          vendorData.preparationTime,
        ],
      });

      toast({
        title: "Vendor Registered!",
        description: "Your vendor profile has been created on-chain.",
        variant: "default",
      });

      await refetchVendorStatus();
      setIsLoading(false);
      return result;
    } catch (err: any) {
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
  ]);

  // Update vendor profile
  const updateVendorProfile = useCallback(async (vendorData: VendorRegistrationData) => {
    if (!vendorRegistryContract) {
      setError("Vendor registry contract not loaded");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      toast({
        title: "Updating Profile",
        description: "Updating your vendor profile on-chain...",
      });

      const result = await updateVendorProfileWrite({
        args: [
          vendorData.storeName,
          vendorData.description,
          vendorData.cuisineTypes,
          vendorData.contactPhone,
          vendorData.contactEmail,
          vendorData.physicalAddress,
          vendorData.deliveryRadius,
          vendorData.minimumOrder,
          vendorData.deliveryFee,
          vendorData.preparationTime,
        ],
      });

      toast({
        title: "Profile Updated!",
        description: "Your vendor profile has been updated on-chain.",
        variant: "default",
      });

      setIsLoading(false);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to update profile";
      setError(errorMessage);
      setIsLoading(false);

      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    }
  }, [vendorRegistryContract, updateVendorProfileWrite, toast]);

  // Set vendor status (active/inactive)
  const setVendorStatus = useCallback(async (isActive: boolean) => {
    if (!vendorRegistryContract) {
      setError("Vendor registry contract not loaded");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await setVendorStatusWrite({
        args: [isActive],
      });

      toast({
        title: "Status Updated!",
        description: `Vendor is now ${isActive ? 'active' : 'inactive'}.`,
        variant: "default",
      });

      setIsLoading(false);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to update status";
      setError(errorMessage);
      setIsLoading(false);

      toast({
        title: "Status Update Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    }
  }, [vendorRegistryContract, setVendorStatusWrite, toast]);

  // Update business hours
  const updateBusinessHours = useCallback(async (businessHours: DayHours[]) => {
    if (!vendorRegistryContract || businessHours.length !== 7) {
      setError("Invalid business hours data");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await updateBusinessHoursWrite({
        args: [businessHours],
      });

      toast({
        title: "Business Hours Updated!",
        description: "Your business hours have been updated on-chain.",
        variant: "default",
      });

      setIsLoading(false);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to update business hours";
      setError(errorMessage);
      setIsLoading(false);

      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    }
  }, [vendorRegistryContract, updateBusinessHoursWrite, toast]);

  // Add menu item
  const addMenuItem = useCallback(async (
    name: string,
    description: string,
    price: string, // in wei
    category: string,
    isPopular: boolean,
    spicyLevel: number
  ) => {
    if (!vendorRegistryContract) {
      setError("Vendor registry contract not loaded");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await addMenuItemWrite({
        args: [name, description, price, category, isPopular, spicyLevel],
      });

      toast({
        title: "Menu Item Added!",
        description: `${name} has been added to your menu.`,
        variant: "default",
      });

      setIsLoading(false);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to add menu item";
      setError(errorMessage);
      setIsLoading(false);

      toast({
        title: "Add Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    }
  }, [vendorRegistryContract, addMenuItemWrite, toast]);

  // Update menu item
  const updateMenuItem = useCallback(async (
    itemId: number,
    name: string,
    description: string,
    price: string, // in wei
    category: string,
    isAvailable: boolean,
    isPopular: boolean,
    spicyLevel: number
  ) => {
    if (!vendorRegistryContract) {
      setError("Vendor registry contract not loaded");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await updateMenuItemWrite({
        args: [itemId, name, description, price, category, isAvailable, isPopular, spicyLevel],
      });

      toast({
        title: "Menu Item Updated!",
        description: `${name} has been updated.`,
        variant: "default",
      });

      setIsLoading(false);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to update menu item";
      setError(errorMessage);
      setIsLoading(false);

      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    }
  }, [vendorRegistryContract, updateMenuItemWrite, toast]);

  // Remove menu item
  const removeMenuItem = useCallback(async (itemId: number) => {
    if (!vendorRegistryContract) {
      setError("Vendor registry contract not loaded");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await removeMenuItemWrite({
        args: [itemId],
      });

      toast({
        title: "Menu Item Removed!",
        description: "Item has been removed from your menu.",
        variant: "default",
      });

      setIsLoading(false);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to remove menu item";
      setError(errorMessage);
      setIsLoading(false);

      toast({
        title: "Remove Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    }
  }, [vendorRegistryContract, removeMenuItemWrite, toast]);

  // Get vendor profile
  const getVendorProfile = useCallback(async (vendorAddress: string): Promise<VendorProfile | null> => {
    if (!vendorRegistryContract) {
      return null;
    }

    try {
      const result = await vendorRegistryContract.call("getVendorProfile", [vendorAddress]);
      return result;
    } catch (err) {
      console.error("Failed to get vendor profile:", err);
      return null;
    }
  }, [vendorRegistryContract]);

  // Get vendor menu
  const getVendorMenu = useCallback(async (vendorAddress: string): Promise<MenuItem[]> => {
    if (!vendorRegistryContract) {
      return [];
    }

    try {
      const result = await vendorRegistryContract.call("getVendorMenu", [vendorAddress]);
      return result;
    } catch (err) {
      console.error("Failed to get vendor menu:", err);
      return [];
    }
  }, [vendorRegistryContract]);

  // Get business hours
  const getBusinessHours = useCallback(async (vendorAddress: string): Promise<DayHours[]> => {
    if (!vendorRegistryContract) {
      return [];
    }

    try {
      const result = await vendorRegistryContract.call("getBusinessHours", [vendorAddress]);
      return result;
    } catch (err) {
      console.error("Failed to get business hours:", err);
      return [];
    }
  }, [vendorRegistryContract]);

  // Get active vendors
  const getActiveVendors = useCallback(async (): Promise<string[]> => {
    if (!vendorRegistryContract) {
      return [];
    }

    try {
      const result = await vendorRegistryContract.call("getActiveVendors");
      return result;
    } catch (err) {
      console.error("Failed to get active vendors:", err);
      return [];
    }
  }, [vendorRegistryContract]);

  // Check if any address is a vendor
  const checkVendorStatus = useCallback(
    async (vendorAddress: string): Promise<boolean> => {
      if (!vendorRegistryContract) {
        return false;
      }

      try {
        const result = await vendorRegistryContract.call("isVendor", [vendorAddress]);
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
    updateVendorProfile,
    setVendorStatus,
    updateBusinessHours,
    addMenuItem,
    updateMenuItem,
    removeMenuItem,
    getVendorProfile,
    getVendorMenu,
    getBusinessHours,
    getActiveVendors,
    checkVendorStatus,
    refetchVendorStatus,
  };
}
