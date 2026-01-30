import {
  AppConfig,
  UserSession,
  showConnect,
  openContractCall,
} from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import {
  callReadOnlyFunction,
  standardPrincipalCV,
  uintCV,
  trueCV,     
  falseCV,    
  ClarityType,
  makeStandardSTXPostCondition, 
  FungibleConditionCode,       
} from '@stacks/transactions';
import { UserData } from '../types';
import { saveToLeaderboard } from './leaderboard';

/* =========================
   NETWORK & CONFIG
========================= */

export const network = new StacksMainnet();

const appConfig = new AppConfig(['store_write', 'publish_data']);

export const userSession = new UserSession({ appConfig });

export const TOKEN_CONFIG = {
  contractAddress: 'SPHMWZQ1KW03KHYPADC81Q6XXS284S7QCHRAS3A8', =
  contractName: 'streak-token-v2',
  network,
};

export const STACKS_CONFIG = {
  contractAddress: 'SPHMWZQ1KW03KHYPADC81Q6XXS284S7QCHRAS3A8',
  contractName: 'streak-reg-v2',
  network,
};


export const NFT_CONFIG = {
  contractAddress: 'SPHMWZQ1KW03KHYPADC81Q6XXS284S7QCHRAS3A8',
  contractName: 'teeboo-nft', 
  network,
};


export const STAKE_CONFIG = {
  contractAddress: 'SPHMWZQ1KW03KHYPADC81Q6XXS284S7QCHRAS3A8',
  contractName: 'stake', 
  network,
};


export const PREDICTION_CONFIG = {
  contractAddress: 'SPHMWZQ1KW03KHYPADC81Q6XXS284S7QCHRAS3A8',
  contractName: 'prediction-market', 
  network,
};

/* =========================
   HELPERS
========================= */


const DAY_MS = 86_400_000;

const cvToNumber = (cv: any): number => {
  if (!cv) return 0;
  if (cv.type === ClarityType.UInt || cv.type === ClarityType.Int) {
    return Number(cv.value);
  }
  return 0;
};

export const fetchTokenBalance = async (address: string): Promise<number> => {
  try {
    const res = await callReadOnlyFunction({
      network: TOKEN_CONFIG.network,
      contractAddress: TOKEN_CONFIG.contractAddress,
      contractName: TOKEN_CONFIG.contractName,
      functionName: 'get-balance',
      functionArgs: [standardPrincipalCV(address)],
      senderAddress: address,
    });
    
    if (res.type === ClarityType.ResponseOk) {
       return Number(res.value.value); 
    }
    return 0;
  } catch (e) {
    console.warn("Error fetching token balance:", e);
    return 0;
  }
};

const getStoredUserData = (address: string): UserData => {
  const defaultData: UserData = {
    address,
    currentStreak: 0,
    bestStreak: 0,
    lastCheckInDay: 0,
    lastCheckInAt: 0,
    points: 0,
    streakDays: [],
    lastMintDay: 0,
  };

  if (typeof window === 'undefined') return defaultData;

  const key = `stacks_streak_${address}`;
  const stored = localStorage.getItem(key);

  if (stored) {
    const parsed = JSON.parse(stored) as Partial<UserData>;
    return {
      ...defaultData,
      ...parsed,
      streakDays: parsed.streakDays ?? [],
      lastMintDay: parsed.lastMintDay ?? 0, 
    };
  }

  return defaultData;
};

export const fetchUserStreak = async (
  address: string
): Promise<Partial<UserData> | null> => {
  try {
    const res = await callReadOnlyFunction({
      network,
      contractAddress: STACKS_CONFIG.contractAddress,
      contractName: STACKS_CONFIG.contractName,
      functionName: 'get-user',
      functionArgs: [standardPrincipalCV(address)],
      senderAddress: address,
    });

    if (res.type !== ClarityType.Tuple) return null;

    const data = res.data;

    return {
      currentStreak: cvToNumber(data['streak']),
      bestStreak: cvToNumber(data['best-streak']),
      lastCheckInDay: cvToNumber(data['last-day']),
    };
  } catch (err) {
    console.warn('Read-only failed:', err);
    return null;
  }
};

export const getRealUserData = async (): Promise<UserData | null> => {
  if (!userSession.isUserSignedIn()) return null;

  const profile = userSession.loadUserData().profile;
  const address = profile.stxAddress.mainnet;

  const local = getStoredUserData(address);
  const chain = await fetchUserStreak(address);

  const balance = await fetchTokenBalance(address);

  const merged: UserData = {
    ...local,
    ...chain,
    currentStreak: Math.max(local.currentStreak, chain?.currentStreak ?? 0),
    bestStreak: Math.max(local.bestStreak, chain?.bestStreak ?? 0),
    lastCheckInDay: Math.max(local.lastCheckInDay, chain?.lastCheckInDay ?? 0),
    lastMintDay: local.lastMintDay, 
    shields: chain?.shields ?? local.shields ?? 0,
    tokenBalance: balance,
  };

  if (merged.currentStreak > 0 && merged.streakDays.length === 0) {
    const today = Math.floor(Date.now() / DAY_MS);
    merged.streakDays = Array.from({ length: merged.currentStreak }, (_, i) => today - i);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(`stacks_streak_${address}`, JSON.stringify(merged));
    saveToLeaderboard(merged);
  }

  return merged;
};

export const authenticate = (): Promise<UserData> => {
  return new Promise((resolve, reject) => {
    showConnect({
      userSession,
      appDetails: {
        name: 'StacksStreak',
        icon: typeof window !== 'undefined' ? `${window.location.origin}/favicon.ico` : '',
      },
      onFinish: async () => {
        const user = await getRealUserData();
        if (user) resolve(user);
        else reject('Failed to load user');
      },
      onCancel: () => reject('User cancelled'),
    });
  });
};

export const logout = () => {
  userSession.signUserOut();
};

/* =========================
   TRANSACTIONS
========================= */

export const submitCheckInTransaction = (
  current: UserData
): Promise<{ newData: UserData; reward: number }> => {
  return new Promise((resolve, reject) => {
    openContractCall({
      network: STACKS_CONFIG.network,
      contractAddress: STACKS_CONFIG.contractAddress,
      contractName: STACKS_CONFIG.contractName,
      functionName: 'check-in',
      functionArgs: [],
      appDetails: {
        name: 'StacksStreak',
        icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.ico' : '/favicon.ico',
      },
      onFinish: () => {
        const now = Date.now();
        const todayDayIndex = Math.floor(now / DAY_MS);

        const newStreak = current.currentStreak + 1;
        const reward = 10 + newStreak * 2;

        const newData: UserData = {
          ...current,
          currentStreak: newStreak,
          bestStreak: Math.max(current.bestStreak, newStreak),
          lastCheckInDay: todayDayIndex,
          lastCheckInAt: now,
          points: current.points + reward,
          streakDays: Array.from(new Set([...(current.streakDays || []), todayDayIndex])),
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem(`stacks_streak_${current.address}`, JSON.stringify(newData));
        }

        resolve({ newData, reward });
      },
      onCancel: () => reject('Transaction cancelled'),
    });
  });
};

export const submitVoteTransaction = (
  vote: boolean
): Promise<string> => {
  return new Promise((resolve, reject) => {
    openContractCall({
      network,
      contractAddress: STACKS_CONFIG.contractAddress,
      contractName: STACKS_CONFIG.contractName,
      functionName: 'vote',
      functionArgs: [uintCV(vote ? 1 : 0)],
      appDetails: {
        name: 'StacksStreak',
        icon: typeof window !== 'undefined' ? `${window.location.origin}/favicon.ico` : '',
      },
      onFinish: (data) => resolve(data.txId),
      onCancel: () => reject('Cancelled'),
    });
  });
};

export const submitMintNftTransaction = (user: UserData): Promise<string> => {
  return new Promise((resolve, reject) => {
    openContractCall({
      network: NFT_CONFIG.network,
      contractAddress: NFT_CONFIG.contractAddress,
      contractName: NFT_CONFIG.contractName,
      functionName: 'mint',
      functionArgs: [],
      appDetails: {
        name: 'StacksStreak NFT',
        icon: typeof window !== 'undefined' ? `${window.location.origin}/favicon.ico` : '',
      },
      onFinish: (data) => {
        const todayDayIndex = Math.floor(Date.now() / DAY_MS);
        const newData = { ...user, lastMintDay: todayDayIndex };
        
        if (typeof window !== 'undefined') {
          localStorage.setItem(`stacks_streak_${user.address}`, JSON.stringify(newData));
        }
        
        resolve(data.txId);
      },
      onCancel: () => reject('Mint cancelled'),
    });
  });
};


export const submitStakeTransaction = (): Promise<string> => {
  return new Promise((resolve, reject) => {

    const address = userSession.loadUserData().profile.stxAddress.mainnet;


    const postCondition = makeStandardSTXPostCondition(
      address,
      FungibleConditionCode.Equal,
      100000 
    );

    openContractCall({
      network: STAKE_CONFIG.network,
      contractAddress: STAKE_CONFIG.contractAddress,
      contractName: STAKE_CONFIG.contractName,
      functionName: 'stake-stx',
      functionArgs: [],
      appDetails: {
        name: 'StacksStreak Staking',
        icon: typeof window !== 'undefined' ? `${window.location.origin}/favicon.ico` : '',
      },

      postConditions: [postCondition], 
      onFinish: (data) => resolve(data.txId),
      onCancel: () => reject('Staking cancelled'),
    });
  });
};

export const submitPredictionTransaction = (isUp: boolean): Promise<string> => {
  return new Promise((resolve, reject) => {
    const address = userSession.loadUserData().profile.stxAddress.mainnet;

    const postCondition = makeStandardSTXPostCondition(
      address,
      FungibleConditionCode.Equal,
      100000 
    );

    openContractCall({
      network: PREDICTION_CONFIG.network,
      contractAddress: PREDICTION_CONFIG.contractAddress,
      contractName: PREDICTION_CONFIG.contractName,
      functionName: 'predict',
      functionArgs: [isUp ? trueCV() : falseCV()],
      appDetails: {
        name: 'StacksStreak Prediction',
        icon: typeof window !== 'undefined' ? `${window.location.origin}/favicon.ico` : '',
      },
      
      postConditions: [postCondition], 
      onFinish: (data) => resolve(data.txId),
      onCancel: () => reject('Prediction cancelled'),
    });
  });
};

export const formatAddress = (addr: string) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';


export const fetchBnsName = async (address: string): Promise<string | null> => {
  try {
    const res = await fetch(`https://api.mainnet.hiro.so/v1/addresses/stacks/${address}`);
    const data = await res.json();
    return data.names && data.names.length > 0 ? data.names[0] : null;
  } catch (e) {
    return null;
  }
};