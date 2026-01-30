export interface UserData {
  address: string;
  currentStreak: number;
  bestStreak: number;
  lastCheckInDay: number;
  points: number;
  lastCheckInAt: number;
  streakDays: number[];
  lastMintDay: number; 
  shields: number;
  tokenBalance: number;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  streak: number;
  points: number;
}

export enum AppState {
  IDLE,
  CHECKING_IN,
  SPINNING,
  VOTING,
}

export interface ContractConfig {
  contractAddress: string;
  contractName: string;
}

export interface StacksSessionState {
  isLoggedIn: boolean;
  userData?: {
    profile: {
      stxAddress: {
        mainnet: string;
        testnet: string;
      }
    }
  }
}