import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { Fragment, useState, useEffect } from "react";

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
    connect,
    disconnect,
    error,
    clearError,
  } = useWallet();
  const { toast } = useToast();
  const [showChains, setShowChains] = useState(false);

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
              <span className="font-semibold text-foreground">{chain?.name || chain?.id}</span>
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
                    variant={chain?.id === id ? "default" : "outline"}
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
            <Button className="w-full bg-gradient-sunset text-primary-foreground" onClick={connect} disabled={connecting}>
              {connecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          </div>
        )}
        <DialogClose asChild>
          <Button variant="ghost" className="absolute top-4 right-4">Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
} 