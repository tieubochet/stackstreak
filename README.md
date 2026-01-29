# StacksStreak

A daily on-chain engagement dApp built on the Stacks blockchain. Users can check in daily, maintain streaks, earn points, vote on community proposals, stake STX, predict market trends, and mint exclusive daily NFTs.

## Features

- **Wallet Connection**: Support for Leather (Hiro) and Xverse wallets via `@stacks/connect`.
- **Daily Check-in**: Smart contract interaction to record daily activity and maintain streaks.
- **Daily NFT Minting**: Users who check in can mint a "Daily Dolphin" collectible (SIP-009 Standard).
- **Stake to Support (NEW)**: Lock 0.1 STX to show commitment to the community.
- **Prediction Market (NEW)**: Predict whether STX price will go UP or DOWN.
- **Gamification**: Streak tracking, heatmaps, daily rewards wheel, leaderboard, and social sharing.
- **Voting**: On-chain community voting mechanism.
- **BNS Integration**: Displays Bitcoin Name System names (e.g., `user.btc`) instead of raw addresses.
- **Responsive UI**: Built with Tailwind CSS for mobile and desktop, featuring a modern cyberpunk aesthetic.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **Blockchain**: Stacks.js libraries (`@stacks/network`, `@stacks/transactions`, `@stacks/profile`)
- **Smart Contracts**: Clarity (SIP-009 for NFTs)

## Smart Contracts (Mainnet)

This dApp interacts with four main contracts:

1. **Streak Registry** (`streak-reg`): Handles user profiles, check-ins, and streak logic.
2. **NFT Collection** (`teeboo-nft`): Handles the minting of the Daily Dolphin NFTs.
3. **Staking** (`simple-staking`): Handles the 0.1 STX locking mechanism.
4. **Prediction Market** (`prediction-market`): Handles STX price prediction logic.

Deployed Address: `SPHMWZQ1KW03KHYPADC81Q6XXS284S7QCHRAS3A8`

## Getting Started

1. **Clone the repository:**
```
  git clone https://github.com/tieubochet/stacks-streak.git
  cd stacks-streak
```

2. **Install dependencies:**
```
npm install
# or
yarn install
```


3. **Asset Setup:**
Ensure you have the NFT image placed at:
`public/assets/dolphin.jpg`


4. **Run the development server:**
```
npm run dev
```


5. Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser.

## Configuration

The app is currently configured for **Stacks Mainnet**.
You can change the contract settings in `services/stacks.ts`.

**Contract Configurations:**

```typescript
export const STACKS_CONFIG = {
  contractAddress: 'SPHMWZQ1KW03KHYPADC81Q6XXS284S7QCHRAS3A8', 
  contractName: 'streak-reg', 
  network: new StacksMainnet(),
};

export const NFT_CONFIG = {
  contractAddress: 'SPHMWZQ1KW03KHYPADC81Q6XXS284S7QCHRAS3A8',
  contractName: 'teeboo-nft', 
  network: new StacksMainnet(),
};

export const STAKE_CONFIG = {
  contractAddress: 'SPHMWZQ1KW03KHYPADC81Q6XXS284S7QCHRAS3A8',
  contractName: 'simple-staking', 
  network: new StacksMainnet(),
};

export const PREDICTION_CONFIG = {
  contractAddress: 'SPHMWZQ1KW03KHYPADC81Q6XXS284S7QCHRAS3A8',
  contractName: 'prediction-market', 
  network: new StacksMainnet(),
};

```

## Deployment

This project is ready to be deployed on **Vercel**:

1. Push your code to GitHub.
2. Import the project into Vercel.
3. Vercel will automatically detect Next.js and deploy.

## License

MIT
