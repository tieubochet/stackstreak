import { AppConfig, UserSession, showConnect, openContractCall } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import {
  callReadOnlyFunction,
  standardPrincipalCV,
  trueCV,
  falseCV,
  ClarityType,
} from '@stacks/transactions';
import { UserData } from '../types';

/* -------------------- NETWORK (SINGLETON) -------------------- */
const network = new StacksMainnet();

/* -------------------- CONFIG -------------------- */
const appConfig = new AppConfig(['store_write', 'publish_data']);

export const userSession = new UserSession({ appConfig });

export const STACKS_CONFIG = {
  contractAddress: 'SPHMWZQ1KW03KHYPADC81Q6XXS284S7QCHRAS3A8',
  contractName: 'streak-reg',
};

/* -------------------- HELPERS -------------------- */

const cvToNumber = (cv: any): number => {
  if (cv?.type === ClarityType.UInt || cv?.type === ClarityType.Int) {
    return Number(cv.value);
  }
  return 0;
};

const getStoredUserData = (address: string): UserData => {
  if (typeof window === 'undefined') {
    return { address, currentStreak: 0, bestStreak: 0, lastCheckInDay: 0, points: 0 };
  }

  const raw = localStorage.getItem(`stacks_streak_${address}`);
  return raw
    ? JSON.parse(raw)
    : { address, currentStreak: 0, bestStreak: 0, lastCheckInDay: 0, points: 0 };
};

/* -------------------- READ ONLY -------------------- */

export const fetchUserStreak = async (
  address: string
): Promise<Partial<UserData> | null> => {
  try {
    const result = await callReadOnlyFunction({
      network,
      contractAddress: STACKS_CONFIG.contractAddress,
      contractName: STACKS_CONFIG.contractName,
      functionName: 'get-streak',
      functionArgs: [standardPrincipalCV(address)],
    });

    let value = result;
    if (value.type === ClarityType.ResponseOk) value = value.value;

    if (value.type !== ClarityType.Tuple) return null;

    const data = value.data;

    return {
      currentStreak: cvToNumber(data['streak']),
      lastCheckInDay: cvToNumber(data['last-checkin']),
      bestStreak: cvToNumber(data['best-streak']),
    };
  } catch (err) {
    console.warn('Read-only failed:', err);
    return null;
  }
};

/* -------------------- AUTH -------------------- */

export const authenticate = (): Promise<UserData> =>
  new Promise((resolve, reject) => {
    showConnect({
      appDetails: {
        name: 'StacksStreak',
        icon:
          typeof window !== 'undefined'
            ? `${window.location.origin}/favicon.ico`
            : '/favicon.ico',
      },
      redirectTo: '/',
      userSession,
      onFinish: async () => {
        const userData = await getRealUserData();
        userData ? resolve(userData) : reject('Failed to load user data');
      },
      onCancel: () => reject('User cancelled login'),
    });
  });

export const logout = () => userSession.signUserOut();

/* -------------------- USER DATA -------------------- */

export const getRealUserData = async (): Promise<UserData | null> => {
  if (!userSession.isUserSignedIn()) return null;

  const profile = userSession.loadUserData().profile;
  const address = profile.stxAddress.mainnet;

  const local = getStoredUserData(address);
  const chain = await fetchUserStreak(address);

  const merged = {
    ...local,
    ...chain,
    bestStreak: Math.max(local.bestStreak, chain?.bestStreak || 0),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(`stacks_streak_${address}`, JSON.stringify(merged));
  }

  return merged;
};

/* -------------------- TRANSACTIONS -------------------- */

export const submitCheckInTransaction = (
  currentData: UserData
): Promise<{ newData: UserData; reward: number }> =>
  new Promise((resolve, reject) => {
    openContractCall({
      contractAddress: STACKS_CONFIG.contractAddress,
      contractName: STACKS_CONFIG.contractName,
      functionName: 'daily-check-in',
      functionArgs: [],
      network: 'mainnet', // 🔴 QUAN TRỌNG
      appDetails: {
        name: 'StacksStreak',
        icon:
          typeof window !== 'undefined'
            ? `${window.location.origin}/favicon.ico`
            : '/favicon.ico',
      },
      onFinish: ({ txId }) => {
        console.log('TX submitted:', txId);

        const newStreak = currentData.currentStreak + 1;
        const reward = 10 + newStreak * 2;

        const newData: UserData = {
          ...currentData,
          currentStreak: newStreak,
          bestStreak: Math.max(currentData.bestStreak, newStreak),
          lastCheckInDay: currentData.lastCheckInDay + 1,
          points: currentData.points + reward,
        };

        localStorage.setItem(
          `stacks_streak_${currentData.address}`,
          JSON.stringify(newData)
        );

        resolve({ newData, reward });
      },
      onCancel: () => reject('Transaction cancelled'),
    });
  });

export const submitVoteTransaction = (vote: boolean): Promise<string> =>
  new Promise((resolve, reject) => {
    openContractCall({
      contractAddress: STACKS_CONFIG.contractAddress,
      contractName: STACKS_CONFIG.contractName,
      functionName: 'vote',
      functionArgs: [vote ? trueCV() : falseCV()],
      network: 'mainnet',
      appDetails: {
        name: 'StacksStreak',
        icon:
          typeof window !== 'undefined'
            ? `${window.location.origin}/favicon.ico`
            : '/favicon.ico',
      },
      onFinish: ({ txId }) => resolve(txId),
      onCancel: () => reject('Vote cancelled'),
    });
  });

export const formatAddress = (addr: string) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
