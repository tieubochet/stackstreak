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
  trueCV,
  falseCV,
  ClarityType,
  PostConditionMode,
} from '@stacks/transactions';

import { UserData } from '../types';

/* ------------------------------------------------------------------ */
/* CONFIG */
/* ------------------------------------------------------------------ */

export const appConfig = new AppConfig(['store_write']);
export const userSession = new UserSession({ appConfig });

export const STACKS_CONFIG = {
  network: new StacksMainnet(),

  contractAddress: 'SPHMWZQ1KW03KHYPADC81Q6XXS284S7QCHRAS3A8', // ⚠️ thay bằng address deploy contract
  contractName: 'streak-reg',  // ⚠️ đúng tên contract

  appDetails: {
    name: 'StackStreak',
    icon: 'https://stackstreak.xyz/icon.png',
  },
};

/* ------------------------------------------------------------------ */
/* AUTH */
/* ------------------------------------------------------------------ */

export const connectWallet = async () => {
  return new Promise<void>((resolve) => {
    showConnect({
      userSession,
      appDetails: STACKS_CONFIG.appDetails,
      onFinish: () => resolve(),
      onCancel: () => resolve(),
    });
  });
};

export const disconnectWallet = () => {
  userSession.signUserOut();
};

export const getUserData = (): UserData | null => {
  if (!userSession.isUserSignedIn()) return null;
  return userSession.loadUserData() as UserData;
};

/* ------------------------------------------------------------------ */
/* READ-ONLY: GET STREAK */
/* ------------------------------------------------------------------ */

export const getStreak = async (principal: string): Promise<number> => {
  const result = await callReadOnlyFunction({
    network: STACKS_CONFIG.network,
    contractAddress: STACKS_CONFIG.contractAddress,
    contractName: STACKS_CONFIG.contractName,
    functionName: 'get-streak',
    functionArgs: [standardPrincipalCV(principal)],
    senderAddress: principal,
  });

  if (result.type === ClarityType.UInt) {
    return Number(result.value);
  }

  return 0;
};

/* ------------------------------------------------------------------ */
/* WRITE: CHECK-IN */
/* ------------------------------------------------------------------ */

export const checkIn = async () => {
  if (!userSession.isUserSignedIn()) {
    throw new Error('Wallet not connected');
  }

  const userData = userSession.loadUserData();
  const sender = userData.profile.stxAddress.mainnet;

  await openContractCall({
    network: STACKS_CONFIG.network,
    contractAddress: STACKS_CONFIG.contractAddress,
    contractName: STACKS_CONFIG.contractName,
    functionName: 'check-in',
    functionArgs: [],
    senderAddress: sender,
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data) => {
      console.log('TX SENT:', data.txId);
    },
    onCancel: () => {
      console.log('TX CANCELLED');
    },
  });
};
