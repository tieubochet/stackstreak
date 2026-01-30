# StacksStreak 🚀

A gamified on-chain engagement dApp built on the Stacks blockchain. Users can check in daily, earn **$STREAK** tokens, maintain streaks, protect their progress with Shields, customize their experience with Themes, and participate in community DeFi activities.

![StacksStreak Banner](public/assets/dolphin.jpg)

## ✨ Key Features

### 1. Core Gamification
- **Daily Check-in**: Record your activity on-chain to build your streak.
- **$STREAK Rewards (SIP-010)**: Automatically mint **$STREAK** tokens to your wallet upon every check-in.
  - *Reward Formula:* `10 + (2 * Current Streak)` tokens per day.
- **Daily NFT**: Mint a "Daily Dolphin" collectible (SIP-009) if you check in.
- **Leaderboard**: Compete with others (displays **BNS names** like `user.btc`).
- **Heatmap**: Visual tracking of your activity over the last 30 days.

### 2. Shop & Items
- **Streak Freeze (Shields) 🛡️**: 
  - Buy shields for **5 STX**.
  - Automatically consumes 1 shield to save your streak if you miss a day.
- **Theme Shop 🎨**: 
  - Customize the dApp's look and feel.
  - **Standard**: Free (Orange/Slate).
  - **Matrix**: Buy for **1 STX** (Green/Black).
  - **Cyberpunk**: Buy for **1 STX** (Pink/Purple).

### 3. Community & DeFi
- **Prediction Market 📈**: Predict if STX price will go **UP** or **DOWN**. (Entry: 0.5 STX).
- **Staking 🪙**: Lock **0.1 STX** to show your commitment to the community.
- **Voting 🗳️**: On-chain community voting mechanism.

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript.
- **Styling**: Tailwind CSS (Dynamic Themes), Lucide React Icons.
- **Blockchain Integration**: Stacks.js (`@stacks/connect`, `@stacks/transactions`, `@stacks/network`).
- **Smart Contracts**: Clarity (v2).

## 📜 Smart Contracts (Mainnet)

The dApp interacts with a suite of contracts deployed at `SPHMWZQ1KW03KHYPADC81Q6XXS284S7QCHRAS3A8`:

| Feature | Contract Name | Description |
| :--- | :--- | :--- |
| **Registry** | `streak-reg-v2` | Handles user profiles, streaks, shields, and themes. |
| **Token** | `streak-token-v2` | The $STREAK SIP-010 fungible token. |
| **NFT** | `teeboo-nft` | The Daily Dolphin SIP-009 NFT collection. |
| **Staking** | `simple-staking` | Handles the 0.1 STX locking mechanism. |
| **Prediction** | `prediction-market` | Handles STX price prediction logic. |

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


4. Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser.

## ⚙️ Configuration

You can update contract addresses and network settings in `services/stacks.ts`:

```typescript
export const STACKS_CONFIG = {
  contractAddress: 'SPHMWZQ1KW03KHYPADC81Q6XXS284S7QCHRAS3A8',
  contractName: 'streak-reg-v2', // Latest registry
  network: new StacksMainnet(),
};

export const TOKEN_CONFIG = {
  contractAddress: 'SPHMWZQ1KW03KHYPADC81Q6XXS284S7QCHRAS3A8',
  contractName: 'streak-token-v2', // Latest token
  network: new StacksMainnet(),
};

```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

