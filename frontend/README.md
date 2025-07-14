# ChopChain Food Tribe Frontend

This is the frontend for ChopChain, a Web3-powered food delivery app for the African market. It is a mobile-first Progressive Web App (PWA) built with React, Vite, and Tailwind CSS.

## Features
- Vendor browsing and food ordering
- Cart and checkout flow
- Mock wallet connection and stablecoin balance
- Modular hooks for cart and wallet logic
- Afrocentric, fintech-inspired UI

## Getting Started

1. Install dependencies:
   ```sh
   npm install
   # or
   bun install
   ```
2. Start the development server:
   ```sh
   npm run dev
   # or
   bun run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

- `src/` — Main source code
  - `components/` — UI and feature components
  - `pages/` — App pages (Cart, VendorDetails, etc.)
  - `hooks/` — Custom hooks (e.g., `useWallet`, `useCart`)
  - `lib/` — Utility functions
- `public/` — Static assets

## Mock Data & Logic
- Wallet and cart logic are currently mocked for development.
- Use `useWallet` and `useCart` hooks for wallet state and cart management.
- Smart contract logic will be integrated post-MVP using the Thirdweb SDK.

## Development Notes
- Keep UX logic separate from blockchain logic (except in hooks).
- Document major decisions in `DEV_DECISIONS.md`.

## Scripts
- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build

---

For more details, see the code and comments in each directory. 