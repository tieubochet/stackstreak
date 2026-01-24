# StacksStreak

A daily on-chain engagement dApp built on the Stacks blockchain. Users can check in daily, maintain streaks, earn points, and participate in community voting.

## Features

- **Wallet Connection**: Support for Leather (Hiro) and Xverse wallets via `@stacks/connect`.
- **Daily Check-in**: Smart contract interaction to record daily activity.
- **Gamification**: Streak tracking, daily rewards wheel, and points system.
- **Voting**: On-chain community voting mechanism.
- **Responsive UI**: Built with Tailwind CSS for mobile and desktop.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **Blockchain**: Stacks.js libraries (`@stacks/network`, `@stacks/transactions`)

## Getting Started

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

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Configuration

The app is currently configured for **Stacks Mainnet**.
You can change the contract settings in `services/stacks.ts`:

```typescript
export const STACKS_CONFIG = {
  contractAddress: 'SPHMWZQ1KW03KHYPADC81Q6XXS284S7QCHRAS3A8', 
  contractName: 'streak-reg', 
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
