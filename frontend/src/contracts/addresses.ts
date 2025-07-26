// ChopChain Smart Contract Addresses
// Update these addresses after deploying contracts

export type ContractAddresses = {
  Escrow: string;
  CHOPToken: string;
  VendorRegistry: string;
  DeliveryAgentRegistry: string;
  USDT: string;
  USDC: string;
};

export const contracts: Record<string, ContractAddresses> = {
  // Local development (Foundry anvil)
  local: {
    Escrow: "0xcD95e0E356A5f414894Be4bAD363acdaCcAb30a9",
    CHOPToken: "0x6AE5E129054a5dBFCeBb9Dfcb1CE1AA229fB1Ddb",
    VendorRegistry: "0xf13D09eD3cbdD1C930d4de74808de1f33B6b3D4f",
    DeliveryAgentRegistry: "0x5c4a3C2CD1ffE6aAfDF62b64bb3E620C696c832E",
    USDT: "0x5aAdFB43eF8dAF45DD80F4676345b7676f1D70e3", // Mock USDC (using as USDT)
    USDC: "0x5aAdFB43eF8dAF45DD80F4676345b7676f1D70e3", // Mock USDC
  },

  // Base Sepolia Testnet
  baseSepolia: {
    Escrow: "0x...", // Deploy contracts here
    CHOPToken: "0x...",
    VendorRegistry: "0x...",
    DeliveryAgentRegistry: "0x...",
    USDT: "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2", // Base Sepolia USDT
    USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia USDC
  },

  // Ethereum Sepolia Testnet
  ethereumSepolia: {
    Escrow: "0x...", // Deploy contracts here
    CHOPToken: "0x...",
    VendorRegistry: "0x...",
    DeliveryAgentRegistry: "0x...",
    USDT: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06", // Ethereum Sepolia USDT
    USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Ethereum Sepolia USDC
  },

  // Base Mainnet
  base: {
    Escrow: "0x...", // Deploy contracts here
    CHOPToken: "0x...",
    VendorRegistry: "0x...",
    DeliveryAgentRegistry: "0x...",
    USDT: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", // Base USDT
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base USDC
  },

  // Ethereum Mainnet
  ethereum: {
    Escrow: "0x...", // Deploy contracts here
    CHOPToken: "0x...",
    VendorRegistry: "0x...",
    DeliveryAgentRegistry: "0x...",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Ethereum USDT
    USDC: "0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8", // Ethereum USDC
  },
};

// Get contracts for current environment
export function getContracts(chainId: number): ContractAddresses {
  switch (chainId) {
    case 31337: // Localhost
      return contracts.local;
    case 84532: // Base Sepolia
      return contracts.baseSepolia;
    case 11155111: // Ethereum Sepolia
      return contracts.ethereumSepolia;
    case 8453: // Base Mainnet
      return contracts.base;
    case 1: // Ethereum Mainnet
      return contracts.ethereum;
    default:
      console.warn(`Unknown chain ID ${chainId}, using local contracts`);
      return contracts.local;
  }
}

// Environment detection
export function getCurrentEnvironment(): string {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "local";
    }
    if (hostname.includes("staging") || hostname.includes("testnet")) {
      return "baseSepolia";
    }
  }
  return "base"; // Production default
}
