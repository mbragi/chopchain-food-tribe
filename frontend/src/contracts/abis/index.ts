// Contract ABIs for local development
export const VendorRegistryABI = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "batchDeregisterVendors",
    inputs: [
      {
        name: "vendors",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "deregisterVendor",
    inputs: [
      {
        name: "vendor",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isVendor",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "registerVendor",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "newOwner",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "VendorDeregistered",
    inputs: [
      {
        name: "vendor",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "VendorRegistered",
    inputs: [
      {
        name: "vendor",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "AlreadyRegistered",
    inputs: [
      {
        name: "vendor",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "InvalidAmount",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "NotRegistered",
    inputs: [
      {
        name: "vendor",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ZeroAddress",
    inputs: [],
  },
] as const;

export const EscrowABI = [
  {
    type: "function",
    name: "placeOrder",
    inputs: [
      { name: "vendor", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "orderId", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "confirmDelivery",
    inputs: [{ name: "orderId", type: "string" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "refund",
    inputs: [{ name: "orderId", type: "string" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export const USDTABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

export const CHOPTokenABI = [
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

// Contract configuration by chain
export const CONTRACT_CONFIGS = {
  // Local development (Anvil)
  31337: {
    VendorRegistry: VendorRegistryABI,
    Escrow: EscrowABI,
    USDT: USDTABI,
    USDC: USDTABI, // Same as USDT for local testing
    CHOPToken: CHOPTokenABI,
  },
  // Base Sepolia
  84532: {
    VendorRegistry: undefined, // Will use Thirdweb metadata
    Escrow: undefined,
    USDT: undefined,
    USDC: undefined,
    CHOPToken: undefined,
  },
  // Ethereum Sepolia
  11155111: {
    VendorRegistry: undefined,
    Escrow: undefined,
    USDT: undefined,
    USDC: undefined,
    CHOPToken: undefined,
  },
  // Base Mainnet
  8453: {
    VendorRegistry: undefined,
    Escrow: undefined,
    USDT: undefined,
    USDC: undefined,
    CHOPToken: undefined,
  },
  // Ethereum Mainnet
  1: {
    VendorRegistry: undefined,
    Escrow: undefined,
    USDT: undefined,
    USDC: undefined,
    CHOPToken: undefined,
  },
} as const;

// Helper function to get ABI for a contract on a specific chain
export function getContractABI(
  chainId: number,
  contractName: keyof (typeof CONTRACT_CONFIGS)[31337]
) {
  const chainConfig =
    CONTRACT_CONFIGS[chainId as keyof typeof CONTRACT_CONFIGS];
  return chainConfig?.[contractName] || undefined;
}

// Type for contract names
export type ContractName = keyof (typeof CONTRACT_CONFIGS)[31337];
