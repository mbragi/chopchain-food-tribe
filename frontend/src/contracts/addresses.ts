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
    Escrow: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    CHOPToken: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    VendorRegistry: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    DeliveryAgentRegistry: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    USDT: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9", // Mock USDT
    USDC: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707", // Mock USDC
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
  
  // Base Mainnet
  base: {
    Escrow: "0x...", // Deploy contracts here
    CHOPToken: "0x...",
    VendorRegistry: "0x...",
    DeliveryAgentRegistry: "0x...",
    USDT: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", // Base USDT
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base USDC
  },
};

// Get contracts for current environment
export function getContracts(chainId: number): ContractAddresses {
  switch (chainId) {
    case 31337: // Localhost
      return contracts.local;
    case 84532: // Base Sepolia
      return contracts.baseSepolia;
    case 8453: // Base Mainnet
      return contracts.base;
    default:
      console.warn(`Unknown chain ID ${chainId}, using local contracts`);
      return contracts.local;
  }
}

// Environment detection
export function getCurrentEnvironment(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'local';
    }
    if (hostname.includes('staging') || hostname.includes('testnet')) {
      return 'baseSepolia';
    }
  }
  return 'base'; // Production default
}
