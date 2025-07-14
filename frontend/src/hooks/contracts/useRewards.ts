// Hook to get CHOPToken rewards and claim
export function useRewards(): { balance: string; claim: () => Promise<void> } {
  // TODO: Integrate with Thirdweb/viem contract read
  return {
    balance: "100", // mock balance
    claim: async () => {
      // TODO: Implement claim logic
    },
  };
}
