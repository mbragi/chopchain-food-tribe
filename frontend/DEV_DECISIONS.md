# DEV_DECISIONS.md

## [2024-06-07] Initial Mock Integration

### Why
- To enable frontend development and state mocking before on-chain logic is implemented.

### What
- Added `useWallet` and `useCart` hooks for simulating wallet and cart state.
- Created placeholder contract files: `Escrow.ts`, `CHOPToken.ts`, `VendorRegistry.ts` in `/src/contracts/`.

### Affected Components
- All pages/components that will use wallet, cart, or contract logic.

### Hooks/Chains Integrated
- None yet (mock only).

### Risks/Fallbacks
- All logic is mocked; no real blockchain or wallet integration yet.
- Will need to refactor when integrating Thirdweb SDK and real contracts. 