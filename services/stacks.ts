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
  ClarityType,
} from '@stacks/transactions';
import { UserData } from '../types';
import { saveToLeaderboard } from './leaderboard';
const now = Date.now();


/* =========================
   NETWORK & CONFIG
========================= */

export const network = new StacksMainnet();

const appConfig = new AppConfig(['store_write', 'publish_data']);

export const userSession = new UserSession({ appConfig });

export const STACKS_CONFIG = {
  contractAddress: 'SPHMWZQ1KW03KHYPADC81Q6XXS284S7QCHRAS3A8',
  contractName: 'streak-reg',
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

const getStoredUserData = (address: string): UserData => {
  if (typeof window === 'undefined') {
    return {
      address,
      currentStreak: 0,
      bestStreak: 0,
      lastCheckInDay: 0,
      points: 0,
      streakDays: [],
    };
  }

  const raw = localStorage.getItem(`stacks_streak_${address}`);
  if (raw) return JSON.parse(raw);

  return {
    address,
    currentStreak: 0,
    bestStreak: 0,
    lastCheckInDay: 0,
    points: 0,
    streakDays: [],
  };
};

/* =========================
   READ ONLY – ON CHAIN
========================= */

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
      senderAddress: address, // 🔴 BẮT BUỘC – fix lỗi build
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

/* =========================
   USER DATA MERGE
========================= */

export const getRealUserData = async (): Promise<UserData | null> => {
  if (!userSession.isUserSignedIn()) return null;

  const profile = userSession.loadUserData().profile;
  const address = profile.stxAddress.mainnet;

  const local = getStoredUserData(address);
  const chain = await fetchUserStreak(address);

  const merged: UserData = {
    ...local,
    ...chain,
    bestStreak: Math.max(
      local.bestStreak,
      chain?.bestStreak ?? 0
    ),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(
      `stacks_streak_${address}`,
      JSON.stringify(merged)
    );
  }

  return merged;
};

/* =========================
   AUTH (🔥 FIX EXPORT)
========================= */

export const authenticate = (): Promise<UserData> => {
  return new Promise((resolve, reject) => {
    showConnect({
      userSession,
      appDetails: {
        name: 'StacksStreak',
        icon:
          typeof window !== 'undefined'
            ? `${window.location.origin}/favicon.ico`
            : '',
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
        icon:
          typeof window !== 'undefined'
            ? window.location.origin + '/favicon.ico'
            : '/favicon.ico',
      },
      onFinish: () => {
        const now = Date.now();
        const todayDayIndex = Math.floor(
          now / (24 * 60 * 60 * 1000)
        );

        const newStreak = current.currentStreak + 1;
        const reward = 10 + newStreak * 2;

        const newData: UserData = {
          ...current,
          currentStreak: newStreak,
          bestStreak: Math.max(current.bestStreak, newStreak),
          lastCheckInDay: todayDayIndex,
          lastCheckInAt: now,
          points: current.points + reward,
          streakDays: Array.from(
            new Set([...(current.streakDays || []), todayDayIndex])
          ),
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem(
            `stacks_streak_${current.address}`,
            JSON.stringify(newData)
          );
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
      functionArgs: [uintCV(vote ? 1 : 0)], // 🔥 CONTRACT NHẬN uint
      appDetails: {
        name: 'StacksStreak',
        icon:
          typeof window !== 'undefined'
            ? `${window.location.origin}/favicon.ico`
            : '',
      },
      onFinish: (data) => resolve(data.txId),
      onCancel: () => reject('Cancelled'),
    });
  });
};

/* =========================
   UI HELPERS
========================= */

export const formatAddress = (addr: string) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
