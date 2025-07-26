import { ThirdwebProvider, coinbaseWallet, metamaskWallet, walletConnect } from "@thirdweb-dev/react";
import { Base, Ethereum, Sepolia } from "@thirdweb-dev/chains";
import React from 'react';

// Custom Base Sepolia chain configuration
const BaseSepolia = {
  id: 84532,
  chainId: 84532,
  name: "Base Sepolia",
  chain: "base-sepolia",
  shortName: "base-sep",
  slug: "base-sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpc: ["https://sepolia.base.org"],
  explorers: [
    { name: "Basescan", url: "https://sepolia.basescan.org", standard: "EIP3091" },
  ],
  testnet: true,
};

// Localhost chain configuration for Anvil
const Localhost = {
  id: 31337,
  chainId: 31337,
  name: "Localhost",
  chain: "localhost",
  shortName: "local",
  slug: "localhost",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpc: ["http://localhost:8545"],
  explorers: [],
  testnet: true,
};

// Chain configurations - Localhost first for development
const activeChains = [
  Localhost,      // Local development (Anvil)
  Base,           // Base mainnet
  BaseSepolia,    // Base testnet
  Ethereum,       // Ethereum mainnet
  Sepolia         // Ethereum testnet
];

// Wallet configurations
const supportedWallets = [
  metamaskWallet({
    recommended: true,
  }),
  coinbaseWallet({
    recommended: true,
  }),
  walletConnect({
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "your-project-id",
    recommended: true,
  }),
];

interface ThirdwebAppProviderProps {
  children: React.ReactNode;
}

export default function ThirdwebAppProvider({ children }: ThirdwebAppProviderProps) {
  return (
    <ThirdwebProvider
      supportedWallets={supportedWallets}
      activeChain={Localhost}
      supportedChains={activeChains}
      clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID || "your-client-id"}
      autoConnect={true}
      dAppMeta={{
        name: "ChopChain",
        description: "Decentralized Food Delivery Platform",
        logoUrl: "https://chopchain.app/logo.png",
        url: "https://chopchain.app",
        isDarkMode: false,
      }}
    >
      {children}
    </ThirdwebProvider>
  );
}