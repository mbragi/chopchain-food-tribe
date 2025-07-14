# ChopChain Food Tribe Monorepo

ChopChain is a Web3-powered food delivery app for the African market, featuring stablecoin payments, vendor wallet abstraction, and token incentives for users and delivery agents.

## Monorepo Structure

```
chopchain-food-tribe/
  frontend/    # React PWA (mobile-first, Vite + Tailwind)
  contracts/   # Smart contracts (Solidity, placeholder for now)
  README.md    # This file
```

## Getting Started

### Frontend

1. `cd frontend`
2. Install dependencies:
   ```sh
   npm install
   # or
   bun install
   ```
3. Start the development server:
   ```sh
   npm run dev
   # or
   bun run dev
   ```

### Contracts

- All contract files are in the `contracts/` directory.
- Placeholder files exist for Escrow, CHOPToken, and VendorRegistry contracts.
- When ready, initialize your preferred smart contract framework (e.g., Hardhat, Foundry) in this directory.

## Development Notes

- **Frontend** uses mock wallet and cart logic for now (see `frontend/hooks/`).
- **Smart contract** logic will be integrated post-MVP using the Thirdweb SDK.
- See `frontend/DEV_DECISIONS.md` for architectural and integration decisions.

## Contributing

- Keep UX logic isolated from blockchain concerns (except in hooks).
- Use modular hooks for wallet, cart, and contract logic.
- Document major decisions in `frontend/DEV_DECISIONS.md`.

---

For more details, see the code and comments in each directory.