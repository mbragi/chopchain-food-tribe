# ChopChain - Africa's First Web3 Food Delivery Platform 🍽️⚡

> **Status: ✅ FULLY FUNCTIONAL MVP COMPLETE**  
> All 8 development milestones successfully implemented

## 🌍 Vision

ChopChain is a decentralized food delivery platform built specifically for the African market, combining the power of blockchain technology with local payment solutions. Users see prices in their local currency (NGN), pay with stablecoins (USDT), and earn CHOP tokens for every interaction.

## ✨ Key Features

### 🔐 **Secure & Trustless**
- Smart contract escrow system holds funds until delivery confirmation
- No payment delays or chargebacks for vendors
- Transparent, on-chain delivery agent reputation system

### 💰 **Crypto-Native Rewards**
- Earn CHOP tokens with every order, delivery, and platform interaction
- User leveling system with reward multipliers
- Build your Web3 portfolio while ordering food

### 🌍 **Africa-First Design**
- Display prices in local currency (NGN) while using crypto for payments
- Vendor off-ramp to local bank accounts and mobile money
- Built with African fintech patterns and warm, Afrocentric aesthetics

### 🚚 **Decentralized Delivery Network**
- On-chain delivery agent registry with reputation tracking
- Transparent earnings and instant crypto payments
- Proof-of-delivery system with photo verification

## 🏗️ Development Milestones - ALL COMPLETE ✅

### ✅ Milestone 1: Design System & Foundation Setup
- Modern fintech UI with Afrocentric warmth
- Tailwind CSS + Shadcn/ui component system
- Responsive design optimized for mobile-first African market

### ✅ Milestone 2: Consumer Ordering Interface  
- Restaurant browsing with real-time availability
- Shopping cart with NGN price display and USDT payment calculation
- Mobile-optimized food ordering experience

### ✅ Milestone 3: Wallet Abstraction + Smart Contract Hooks
- Thirdweb integration for seamless wallet connections
- Smart contract hooks for escrow, rewards, and user management
- Multi-chain support (Base, Ethereum, local development)

### ✅ Milestone 4: Vendor Dashboard
- Complete restaurant management interface
- Order processing and inventory management
- Analytics dashboard with crypto earnings tracking
- Off-ramp integration for local currency conversion

### ✅ Milestone 5: Delivery Agent App
- On-chain delivery agent registration and verification
- Real-time order assignment and delivery tracking
- Reputation system with transparent performance metrics
- Instant crypto payments upon delivery confirmation

### ✅ Milestone 6: Rewards & Token Logic
- CHOP token smart contract with minting mechanisms
- User leveling system (Bronze → Silver → Gold → Platinum)
- Reward multipliers and various earning actions
- Comprehensive rewards dashboard and earning opportunities

### ✅ Milestone 7: OneRamp Integration & Checkout Finalization
- Enhanced checkout flow with real-time USDT transactions
- Currency conversion system (NGN display, USDT payment)
- OneRamp API integration for vendor crypto-to-fiat conversion
- Bank transfer and mobile money off-ramp options

### ✅ Milestone 8: Landing Page & Onboarding
- Beautiful landing page showcasing Web3 food delivery benefits
- User type selection (Customer, Vendor, Delivery Agent)
- Personalized onboarding flows with crypto education
- Persistent user state management with localStorage

## 🛠️ Technical Stack

### **Frontend**
- **React 18** with TypeScript for type-safe development
- **Vite** for blazing-fast development and optimized builds
- **Tailwind CSS** for utility-first styling
- **Shadcn/ui** for consistent, accessible components
- **Lucide React** for beautiful, scalable icons

### **Blockchain Integration**
- **Thirdweb SDK** for wallet connections and contract interactions
- **Base Chain** as primary network with Ethereum fallback
- **Foundry** for smart contract development and testing
- **USDT/USDC** stablecoins for payments

### **Smart Contracts**
- **Escrow System** - Secure payment holding until delivery
- **CHOP Token (ERC-20)** - Platform rewards and governance
- **Vendor Registry** - On-chain restaurant verification
- **Delivery Agent Registry** - Decentralized delivery network
- **Order Management** - Complete order lifecycle on-chain

### **State Management**
- Custom React hooks for wallet, rewards, currency, and onboarding
- localStorage for persistent user preferences
- React Query for efficient API state management

## 🚀 Getting Started

### Prerequisites
```bash
# Node.js 18+ and npm
node --version
npm --version

# For smart contract development
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Installation & Setup
```bash
# Clone the repository
git clone https://github.com/your-org/chopchain
cd chopchain

# Install frontend dependencies
cd frontend
npm install

# Install smart contract dependencies  
cd ../smart_contract
forge install

# Start development environment
cd ../frontend
npm run dev
```

### Smart Contract Development
```bash
cd smart_contract

# Compile contracts
forge build

# Run comprehensive tests
forge test -vvv

# Deploy to local network
forge script script/Deploy.s.sol --fork-url http://localhost:8545 --broadcast
```

## 📱 User Experience

### **For Customers**
1. **Discover** - Browse local restaurants with real-time availability
2. **Order** - See prices in NGN, pay with USDT held in secure escrow
3. **Track** - Real-time delivery tracking with proof-of-delivery
4. **Earn** - Accumulate CHOP tokens and level up your rewards

### **For Vendors**  
1. **Register** - Complete on-chain verification and KYC
2. **Manage** - Handle orders, inventory, and menu through dashboard
3. **Earn** - Receive instant USDT payments upon delivery confirmation
4. **Cash Out** - Convert crypto earnings to NGN via OneRamp integration

### **For Delivery Agents**
1. **Join** - Register on-chain and build your reputation profile
2. **Deliver** - Accept orders, earn crypto, and provide proof-of-delivery
3. **Build** - Develop verified work history and access premium delivery zones
4. **Grow** - Transparent performance metrics drive higher earnings

## 🌟 What Makes ChopChain Special

### **Crypto-Native African Solution**
- First Web3 food delivery platform designed specifically for African markets
- Combines familiar fintech UX patterns with cutting-edge blockchain technology
- Addresses real problems: payment delays, trust issues, and financial inclusion

### **True Decentralization**
- No single point of failure - smart contracts govern all transactions
- Transparent delivery agent reputation prevents platform manipulation
- Users own their data, earnings, and reputation through blockchain verification

### **Sustainable Token Economics**
- CHOP tokens have real utility beyond speculation
- Reward mechanisms drive genuine platform engagement
- Deflationary tokenomics through transaction fees and staking

### **Local-First, Global-Ready**
- Built for Nigerian market but designed for Pan-African expansion
- Multi-currency support with local payment method integration
- Culturally appropriate design language and user experience patterns

## 🔒 Security & Trust

- **Smart Contract Auditing**: All contracts undergo rigorous testing with Foundry
- **Escrow Protection**: Customer funds held securely until delivery confirmation
- **Reputation System**: On-chain delivery agent performance prevents bad actors
- **Transparent Fees**: All platform fees visible and governed by smart contracts

## 🌱 Future Roadmap

- **Multi-Chain Expansion**: Polygon, Arbitrum, and other L2 solutions
- **DAO Governance**: CHOP token holders vote on platform decisions
- **Advanced Features**: Subscription models, group orders, loyalty NFTs
- **Pan-African Launch**: Ghana, Kenya, South Africa market expansion

## 📞 Support & Community

- **Website**: [chopchain.com](https://chopchain.com)
- **Documentation**: [docs.chopchain.com](https://docs.chopchain.com)
- **Discord**: [discord.gg/chopchain](https://discord.gg/chopchain)
- **Twitter**: [@ChopChainAfrica](https://twitter.com/ChopChainAfrica)
- **Support**: support@chopchain.com

---

**Built with ❤️ for Africa** | **Powered by Web3** | **Secured by Smart Contracts**

> ChopChain is more than food delivery - it's financial empowerment through blockchain technology, designed specifically for the African market. 