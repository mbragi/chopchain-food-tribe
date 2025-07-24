import { ThirdwebProvider, coinbaseWallet, metamaskWallet, walletConnect } from "@thirdweb-dev/react";
import { Ethereum, Polygon, Arbitrum, Optimism } from "@thirdweb-dev/chains";
import React from 'react';

// Chain configurations
const activeChains = [
  Ethereum, // Mainnet
  Polygon,  // Polygon mainnet
  Arbitrum, // Arbitrum One
  Optimism  // Optimism mainnet
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
    projectId: process.env.VITE_WALLETCONNECT_PROJECT_ID || "your-project-id",
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
      activeChain={Ethereum}
      supportedChains={activeChains}
      clientId={process.env.VITE_THIRDWEB_CLIENT_ID || "your-client-id"}
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