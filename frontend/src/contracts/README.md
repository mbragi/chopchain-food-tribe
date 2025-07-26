# Modular Contract System

This directory contains a modular system for handling smart contracts with chain-specific ABIs.

## Architecture

### 1. ABI Definitions (`abis/index.ts`)

- **Individual ABIs**: Each contract has its own ABI definition
- **Chain Configuration**: `CONTRACT_CONFIGS` maps chain IDs to contract ABIs
- **Helper Functions**: `getContractABI()` for retrieving ABIs by chain and contract

### 2. Contract Addresses (`addresses.ts`)

- **Chain-specific addresses**: Each chain has its own contract addresses
- **Dynamic loading**: `getContracts()` returns addresses based on chain ID

### 3. Custom Hooks (`hooks/useContractWithABI.ts`)

- **Single Contract**: `useContractWithABI(chainId, contractName)`
- **Batch Contracts**: `useContractsWithABI(chainId, contractNames[])`

## Usage Examples

### Single Contract

```typescript
import { useContractWithABI } from '@/hooks/useContractWithABI';

function MyComponent() {
  const { contract } = useContractWithABI(31337, "VendorRegistry");
  // Contract automatically gets the correct ABI for localhost
}
```

### Multiple Contracts

```typescript
import { useContractsWithABI } from '@/hooks/useContractWithABI';

function MyComponent() {
  const contracts = useContractsWithABI(31337, ["Escrow", "USDT", "CHOPToken"]);
  // All contracts get appropriate ABIs
}
```

### All Contracts

```typescript
import { useAllContracts } from '@/hooks/useAllContracts';

function MyComponent() {
  const { vendorRegistry, escrow, usdt, chopToken } = useAllContracts();
  // All contracts with convenience getters
}
```

## Adding New Contracts

1. **Add ABI** to `abis/index.ts`:

```typescript
export const NewContractABI = [
  // ... ABI definition
] as const;
```

2. **Add to CONTRACT_CONFIGS**:

```typescript
export const CONTRACT_CONFIGS = {
  31337: {
    // ... existing contracts
    NewContract: NewContractABI,
  },
  // ... other chains
} as const;
```

3. **Add address** to `addresses.ts`:

```typescript
export const contracts = {
  local: {
    // ... existing addresses
    NewContract: "0x...",
  },
  // ... other chains
};
```

## Benefits

- **Modular**: Easy to add new contracts and chains
- **Type-safe**: Full TypeScript support
- **Chain-aware**: Automatic ABI selection based on chain
- **Reusable**: Single pattern for all contract interactions
- **Maintainable**: Centralized configuration
