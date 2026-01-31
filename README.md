# StacksStreak 🚀

**StacksStreak** is a gamified on-chain engagement dApp built on the Stacks blockchain. It transforms daily activity into a rewarding game where users can earn tokens, collect evolving NFTs, and participate in community DeFi activities.

![StacksStreak Banner](public/assets/dolphin.jpg)

## ✨ Key Features

### 1. 🎮 Core Gamification
- **Daily Check-in**: Verify your activity on-chain to build your streak.
- **$STREAK Rewards (SIP-010)**: Earn **$STREAK** tokens directly to your wallet with every check-in.
  - *Reward Formula:* `10 + (2 * Current Streak)` tokens per day.
- **Leaderboard**: Compete globally (supports **BNS names** like `user.btc`).
- **Heatmap**: Visual tracking of your on-chain consistency over the last 30 days.

### 2. 🦈 NFT Evolution (Fusion Chamber)
- **Daily Mint**: Collect a "Daily Dolphin" NFT (SIP-009) every day you check in.
- **Fusion Mechanics**: Use the **Fusion Chamber** to merge **5 Common Dolphins** into **1 Rare Shark**.
  - *Burn Mechanism:* Reduces NFT supply and increases asset rarity.

### 3. 🛡️ Shop & Items
- **Streak Freeze (Shields)**: 
  - Buy shields for **5 STX**.
  - **Auto-Protection**: Automatically consumes 1 shield to save your streak if you miss a day.
- **Theme Shop**: 
  - **Standard**: Free (Orange/Slate).
  - **Matrix**: Green/Black hacker aesthetic.
  - **Cyberpunk**: Pink/Purple neon style.

### 4. 💰 Community DeFi
- **Prediction Market**: Bet on whether the STX price will go **UP** or **DOWN**.
- **Staking**: Lock **0.1 STX** to demonstrate "Proof of Commitment" to the community.
- **Voting**: On-chain governance signaling.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript.
- **Styling**: Tailwind CSS (Dynamic Themes), Lucide Icons.
- **Blockchain Integration**: Stacks.js (`@stacks/connect`, `@stacks/transactions`, `@stacks/network`).
- **Smart Contracts**: Clarity (SIP-009 NFT, SIP-010 Fungible Token).

---

## 📜 Smart Contracts

This dApp interacts with a suite of contracts on the Stacks Mainnet (deployed at `SPHMWZQ1KW03KHYPADC81Q6XXS284S7QCHRAS3A8`):

| Feature | Contract Name | Description |
| :--- | :--- | :--- |
| **Registry** | `streak-reg-v2` | Manages user state, streaks, shields, and rewards logic. |
| **Token** | `streak-token-v2` | The $STREAK SIP-010 reward token. |
| **NFT** | `teeboo-nft` | The evolving SIP-009 NFT collection. |
| **Staking** | `stake` | Handles STX locking. |
| **Prediction** | `prediction-market` | Handles price prediction logic. |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A Stacks Wallet (Leather or Xverse)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/tieubochet/stacks-streak.git
cd stacks-streak
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
```


3. **Run the development server:**
```bash
npm run dev
```


4. Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser.

---

## ⚙️ Configuration

To switch between Mainnet and Testnet, update `services/stacks.ts`:

```typescript
import { StacksMainnet, StacksTestnet } from '@stacks/network';

// Use StacksMainnet() for production, StacksTestnet() for development
export const network = new StacksMainnet();

export const STACKS_CONFIG = {
  contractAddress: 'YOUR_DEPLOYER_ADDRESS',
  contractName: 'streak-reg-v2', 
  network,
};

```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue.

## 📄 License

This project is licensed under the MIT License.
