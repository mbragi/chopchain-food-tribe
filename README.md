# ChopChain Monorepo

A Web3-powered food delivery app for the African market, integrating stablecoin payments, vendor wallet abstraction, and token incentives for users and delivery agents.

---

## Overview
ChopChain is a decentralized food delivery platform designed for the African market. It features:
- Mobile-first PWA frontend (React + Vite + Tailwind)
- Smart contracts for escrow, rewards, and vendor registry (Solidity, Foundry)
- Wallet abstraction and contract interaction (Thirdweb SDK)
- Token incentives and stablecoin checkout

---

## Monorepo Structure

```
/
├── frontend/         # Mobile-first PWA (React, Vite, Tailwind)
├── smart_contract/   # All Foundry smart contract code, tests, and scripts
│   ├── contracts/    # Solidity contracts (Escrow, CHOPToken, VendorRegistry)
│   ├── test/         # Foundry tests
│   ├── script/       # Deployment scripts
│   ├── lib/          # Dependencies (OpenZeppelin, forge-std)
│   ├── foundry.toml  # Foundry config
│   └── .gitmodules   # Submodule config (if used)
└── README.md         # Project overview (this file)
```

---

## Getting Started

### Frontend
```sh
cd frontend
npm install
npm run dev
```

### Smart Contracts
```sh
cd smart_contract
forge install
forge build
forge test
```

---

## Contribution
- Use placeholder wallet data and mock contracts for frontend testing
- Keep contract logic modular and isolated
- Document any major contract or architecture changes in `frontend/DEV_DECISIONS.md`
- PRs should include tests for new contract logic

---

## License
MIT 