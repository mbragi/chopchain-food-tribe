/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { useConnect, metamaskWallet, walletConnect, coinbaseWallet } from "@thirdweb-dev/react";
import { useState, useEffect } from "react";

export default function WalletConnectModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const {
    connected,
    connecting,
    address,
    balance,
    balanceSymbol,
    chain,
    switchChain,
    CHAINS,
    disconnect,
    error,
    clearError,
  } = useWallet();
  const { toast } = useToast();
  const [showChains, setShowChains] = useState(false);
  const connect = useConnect();

  useEffect(() => {
    if (error) {
      toast({
        title: "Wallet Error",
        description: error,
        variant: "destructive"
      });
      clearError();
    }
  }, [error, toast, clearError]);

  // Helper to get chain label
  const getChainLabel = (chainObj: unknown) => {
    if (typeof chainObj === "object" && chainObj !== null && "name" in chainObj) {
      // @ts-expect-error: dynamic object
      return chainObj.name || chainObj.id || String(chainObj);
    }
    return String(chainObj);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-6 bg-background">
        <DialogHeader>
          <DialogTitle className="text-primary">Wallet Connection</DialogTitle>
          <DialogDescription>
            {connected
              ? "You are connected to ChopChain."
              : "Connect your wallet to start ordering and earning rewards."}
          </DialogDescription>
        </DialogHeader>
        {connected ? (
          <div className="space-y-4 mt-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Address</span>
              <span className="font-mono text-foreground bg-muted rounded px-2 py-1 break-all">{address}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Balance:</span>
              <span className="font-semibold text-foreground">{balance} {balanceSymbol}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Chain:</span>
              <span className="font-semibold text-foreground">{getChainLabel(chain)}</span>
              <Button size="sm" variant="outline" onClick={() => setShowChains((v) => !v)}>
                Switch
              </Button>
            </div>
            {showChains && (
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(CHAINS).map(([key, id]) => (
                  <Button
                    key={id}
                    size="sm"
                    variant={chain !== null && chain !== undefined && typeof chain === "object" && (chain as any).id === id ? "default" : "outline"}
                    onClick={() => switchChain(id as number)}
                  >
                    {key}
                  </Button>
                ))}
              </div>
            )}
            <Button className="w-full bg-destructive text-destructive-foreground mt-4" onClick={disconnect}>
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-6">
            <Button className="w-full bg-gradient-sunset text-primary-foreground" onClick={() => connect(metamaskWallet())}>
              Connect Metamask
            </Button>
            <Button className="w-full bg-gradient-hibiscus text-primary-foreground" onClick={() => connect(walletConnect())}>
              Connect WalletConnect
            </Button>
            <Button className="w-full bg-gradient-trust text-primary-foreground" onClick={() => connect(coinbaseWallet())}>
              Connect Coinbase
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 