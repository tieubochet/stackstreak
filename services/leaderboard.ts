import { UserData } from '../types';

export type LeaderboardEntry = {
  address: string;
  bestStreak: number;
};

const KEY = 'stacks_streak_leaderboard';

export const saveToLeaderboard = (user: UserData) => {
  if (typeof window === 'undefined') return;

  const raw = localStorage.getItem(KEY);
  const list: LeaderboardEntry[] = raw ? JSON.parse(raw) : [];

  const idx = list.findIndex(u => u.address === user.address);

  if (idx >= 0) {
    list[idx].bestStreak = Math.max(
      list[idx].bestStreak,
      user.bestStreak
    );
  } else {
    list.push({
      address: user.address,
      bestStreak: user.bestStreak,
    });
  }

  localStorage.setItem(KEY, JSON.stringify(list));
};

export const getLeaderboard = (): LeaderboardEntry[] => {
  if (typeof window === 'undefined') return [];

  const raw = localStorage.getItem(KEY);
  if (!raw) return [];

  return JSON.parse(raw)
    .sort((a, b) => b.bestStreak - a.bestStreak)
    .slice(0, 20);
};
