import { useState } from "react";

export function useWallet() {
  // Simulate wallet connection state
  const [connected, setConnected] = useState(true);
  // Mock wallet address
  const address = connected ? "0x1234...abcd" : null;
  // Mock stablecoin balance
  const balance = connected ? 150.25 : 0;

  // Simulate connect/disconnect
  function connect() {
    setConnected(true);
  }
  function disconnect() {
    setConnected(false);
  }

  return { connected, address, balance, connect, disconnect };
}
