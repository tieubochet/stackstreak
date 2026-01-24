import { AppConfig, UserSession, showConnect, openContractCall } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { callReadOnlyFunction, standardPrincipalCV, trueCV, falseCV, ClarityType } from '@stacks/transactions';
import { UserData } from '../types';

// Configuration for Stacks
const appConfig = new AppConfig(['store_write', 'publish_data']);

// Initialize UserSession only on client side to prevent SSR issues
export const userSession = new UserSession({ appConfig });

// Switch to Mainnet for production
export const STACKS_CONFIG = {
  // The transaction ID provided: 0xa2efa65b180ea742b6a00ca2bec62305724a6e25e9b5c2d15372edcd9720e3dd
  // Sender/Deployer: SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS
  contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 
  contractName: 'stacks-streak-v1', 
  network: new StacksMainnet(),
};

// Helper to get local storage data mixed with real wallet address
const getStoredUserData = (address: string): UserData => {
  if (typeof window === 'undefined') return { address, currentStreak: 0, bestStreak: 0, lastCheckInDay: 0, points: 0 };
  
  const key = `stacks_streak_${address}`;
  const stored = localStorage.getItem(key);
  
  if (stored) {
    return JSON.parse(stored);
  }

  // Default new user state
  return {
    address,
    currentStreak: 0,
    bestStreak: 0,
    lastCheckInDay: 0,
    points: 0
  };
};

// Helper to safely convert BigInt/Number from Clarity
const cvToNumber = (cv: any): number => {
  if (cv?.type === ClarityType.UInt || cv?.type === ClarityType.Int) {
    return Number(cv.value);
  }
  return 0;
};

/**
 * Fetch the actual streak status from the blockchain (Read-Only)
 */
export const fetchUserStreak = async (address: string): Promise<Partial<UserData> | null> => {
  try {
    const result = await callReadOnlyFunction({
      network: STACKS_CONFIG.network,
      contractAddress: STACKS_CONFIG.contractAddress,
      contractName: STACKS_CONFIG.contractName,
      functionName: 'get-streak',
      functionArgs: [standardPrincipalCV(address)],
      senderAddress: address,
    });

    // Handle Tuple return: (tuple (streak uint) (last-checkin uint) ...)
    let validResult = result;
    
    // Unwrap response-ok if present
    if (validResult.type === ClarityType.ResponseOk) {
      validResult = validResult.value;
    }

    if (validResult.type === ClarityType.Tuple) {
       const data = validResult.data;
       
       // Handle potential key names based on typical contract patterns
       // We accept 'streak' or 'current-streak' to be safe with contract variations
       const streak = cvToNumber(data['streak'] || data['current-streak']);
       const lastCheckIn = cvToNumber(data['last-checkin'] || data['last-active']);
       const bestStreak = cvToNumber(data['best-streak']);

       return {
         currentStreak: streak,
         lastCheckInDay: lastCheckIn,
         bestStreak: bestStreak
       };
    }
    
    return null;
  } catch (e) {
    console.warn("Could not fetch on-chain streak, falling back to local:", e);
    return null;
  }
};

export const getRealUserData = async (): Promise<UserData | null> => {
  if (userSession.isUserSignedIn()) {
    const profile = userSession.loadUserData().profile;
    const address = profile.stxAddress.mainnet;
    
    // 1. Get Local Fallback
    const localData = getStoredUserData(address);

    // 2. Try to fetch On-Chain data
    const chainData = await fetchUserStreak(address);

    if (chainData) {
      // Merge chain data with local points 
      // (Using local points/bestStreak if chain data is partial or missing specific fields)
      const merged = { 
        ...localData, 
        ...chainData,
        // Ensure we don't overwrite existing local bestStreak if chain returns 0 (unless it's actually 0)
        bestStreak: Math.max(localData.bestStreak, chainData.bestStreak || 0)
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`stacks_streak_${address}`, JSON.stringify(merged));
      }
      return merged;
    }

    return localData;
  }
  return null;
};

export const authenticate = (): Promise<UserData> => {
  return new Promise((resolve, reject) => {
    showConnect({
      appDetails: {
        name: 'StacksStreak',
        icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.ico' : '/favicon.ico',
      },
      redirectTo: '/',
      onFinish: async () => {
        const userData = await getRealUserData();
        if (userData) resolve(userData);
        else reject('Failed to load user data');
      },
      onCancel: () => {
        reject('User cancelled login');
      },
      userSession,
    });
  });
};

export const logout = () => {
  userSession.signUserOut();
};

export const submitCheckInTransaction = (currentData: UserData): Promise<{ newData: UserData, reward: number }> => {
  return new Promise((resolve, reject) => {
    openContractCall({
      network: STACKS_CONFIG.network,
      contractAddress: STACKS_CONFIG.contractAddress,
      contractName: STACKS_CONFIG.contractName,
      functionName: 'daily-check-in',
      functionArgs: [], 
      appDetails: {
        name: 'StacksStreak',
        icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.ico' : '/favicon.ico',
      },
      onFinish: (data) => {
        console.log('Transaction broadcasted:', data.txId);
        
        // Optimistic Update
        const newStreak = currentData.currentStreak + 1;
        const reward = 10 + (newStreak * 2);
        
        const newData = {
          ...currentData,
          currentStreak: newStreak,
          bestStreak: Math.max(currentData.bestStreak, newStreak),
          lastCheckInDay: Math.floor(Date.now() / 86400000),
          points: currentData.points + reward
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem(`stacks_streak_${currentData.address}`, JSON.stringify(newData));
        }
        resolve({ newData, reward });
      },
      onCancel: () => {
        reject('Transaction cancelled');
      },
    });
  });
};

export const submitVoteTransaction = (vote: boolean): Promise<string> => {
  return new Promise((resolve, reject) => {
    openContractCall({
      network: STACKS_CONFIG.network,
      contractAddress: STACKS_CONFIG.contractAddress,
      contractName: STACKS_CONFIG.contractName,
      functionName: 'vote', 
      functionArgs: [vote ? trueCV() : falseCV()],
      appDetails: {
        name: 'StacksStreak',
        icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.ico' : '/favicon.ico',
      },
      onFinish: (data) => {
        resolve(data.txId);
      },
      onCancel: () => {
        reject('Vote cancelled');
      },
    });
  });
};

export const formatAddress = (addr: string) => {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};