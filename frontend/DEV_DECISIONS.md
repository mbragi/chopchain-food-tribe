# DEV_DECISIONS.md

## [2024-01-15] Smart Contract Integration & Vendor Dashboard Implementation

### Why

- Complete Milestone 3 (Smart Contract Hooks) and Milestone 4 (Vendor Dashboard) to enable real blockchain functionality and vendor management.
- Implement proper access control for vendor-only features to ensure security and user experience.

### What

#### Smart Contract Hooks Created:
- `usePlaceOrder.ts` - Handles escrow order placement with USDT/USDC approval and blockchain transactions
- `useConfirmDelivery.ts` - Manages delivery confirmation and payment release from escrow
- `useRewards.ts` - Tracks CHOP token balance and reward calculations (5% of order value)
- `useVendorRegistry.ts` - Manages vendor registration and verification on-chain

#### Vendor Dashboard System:
- `VendorDashboard.tsx` - Main dashboard with analytics, order management, and profile tabs
- `VendorOnboarding.tsx` - Registration form for new vendors with business details
- `VendorProfile.tsx` - Vendor profile management with store settings and payout configuration
- `OrderManagement.tsx` - Order tracking with status updates and escrow monitoring
- `VendorAnalytics.tsx` - Revenue analytics and performance metrics
- `ProtectedVendorRoute.tsx` - Access control component that restricts vendor features to registered vendors only

#### Contract Configuration:
- Enhanced `contracts/addresses.ts` with multi-environment support (local, Base Sepolia, Base mainnet)
- Added proper USDT/USDC contract addresses for each network
- Environment-based contract resolution with fallbacks

### Affected Components

- **New Routes Added:**
  - `/vendor/register` - Vendor registration (public access)
  - `/vendor/dashboard` - Vendor dashboard (protected, vendors only)
- **Enhanced Navigation:**
  - Added "Become Vendor" / "Dashboard" button in main header
  - Dynamic vendor action button in quick actions section
- **Access Control:**
  - Non-vendors are automatically redirected to registration when accessing protected routes
  - Loading states during vendor verification
  - Proper wallet connection requirements

### Blockchain Integration Points

- **Escrow System:** Orders are placed on-chain with stablecoin (USDT/USDC) held in escrow until delivery confirmation
- **CHOP Rewards:** Automatic minting of 5% order value as CHOP tokens upon order placement
- **Vendor Registry:** On-chain vendor verification system prevents unauthorized access to vendor features
- **Multi-Chain Support:** Ready for Base mainnet, Base Sepolia testnet, and local development

### Security Considerations

- **Protected Routes:** Vendor dashboard is completely inaccessible to non-vendors
- **Smart Contract Validation:** All transactions include proper error handling and user feedback
- **Environment Separation:** Clear distinction between development, testnet, and mainnet configurations
- **Wallet State Management:** Proper handling of disconnection and chain switching

### Rollout Strategy

1. **Development Phase:** Test with local Foundry setup using mock contracts
2. **Testnet Deployment:** Deploy contracts to Base Sepolia and update addresses
3. **User Testing:** Validate vendor onboarding flow and order placement
4. **Mainnet Launch:** Deploy to Base mainnet with proper contract verification

### Risks and Mitigation

- **Contract Addresses:** Currently using placeholder addresses - must be updated after deployment
- **Gas Costs:** Transaction costs on mainnet may affect user adoption - consider meta-transactions
- **User Experience:** Loading states and error handling implemented to manage blockchain delays
- **Access Control:** Comprehensive testing needed to ensure no unauthorized access to vendor features

---

## [2024-06-07] Initial Mock Integration

### Why

- To enable frontend development and state mocking before on-chain logic is implemented.

### What

- Added `useWallet` and `useCart` hooks for simulating wallet and cart state.
- Created placeholder contract files: `Escrow.ts`, `CHOPToken.ts`, `VendorRegistry.ts` in `/src/contracts/`.

### Affected Components

- All pages/components that will use wallet, cart, or contract logic.

### Hooks/Chains Integrated

- Thirdweb SDK integration with Base, Sepolia, and localhost chains.
- Mock wallet functionality with balance simulation.

### Risks/Fallbacks

- All logic was initially mocked; now replaced with real blockchain integration.
- Smart contract addresses need to be updated after deployment. 