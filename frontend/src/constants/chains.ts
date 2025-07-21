// Supported EVM chains for ChopChain
// Add or edit chain objects as needed for custom/testnet/mainnet support

export const Base = {
  id: 8453,
  chainId: 8453,
  name: "Base",
  chain: "base",
  shortName: "base",
  slug: "base",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpc: ["https://mainnet.base.org"],
  explorers: [
    { name: "Basescan", url: "https://basescan.org", standard: "EIP3091" },
  ],
  testnet: false,
};

export const Sepolia = {
  id: 11155111,
  chainId: 11155111,
  name: "Sepolia",
  chain: "sepolia",
  shortName: "sep",
  slug: "sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpc: ["https://rpc.sepolia.org"],
  explorers: [
    {
      name: "Etherscan",
      url: "https://sepolia.etherscan.io",
      standard: "EIP3091",
    },
  ],
  testnet: true,
};

export const Localhost = {
  id: 31337,
  chainId: 31337,
  name: "Localhost",
  chain: "localhost",
  shortName: "local",
  slug: "localhost",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpc: ["http://127.0.0.1:8545"],
  explorers: [
    {
      name: "Localhost Explorer",
      url: "http://localhost:8545",
      standard: "EIP3091",
    },
  ],
  testnet: true,
};

// Add more custom/testnet/mainnet chains as needed

export const supportedChains = [Base, Sepolia, Localhost];
