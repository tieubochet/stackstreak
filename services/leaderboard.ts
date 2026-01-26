import { UserData } from '../types';

export type LeaderboardEntry = {
  address: string;
  bestStreak: number;
};

const KEY = 'stacks_streak_leaderboard';
export const LEADERBOARD_UPDATED_EVENT = 'leaderboard-updated';

export const saveToLeaderboard = (user: UserData) => {
  if (typeof window === 'undefined') return;

  const raw = localStorage.getItem(KEY);
  const list: LeaderboardEntry[] = raw
    ? (JSON.parse(raw) as LeaderboardEntry[])
    : [];

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

  // 🔄 Notify UI
  window.dispatchEvent(new Event(LEADERBOARD_UPDATED_EVENT));
};

export const getLeaderboard = (): LeaderboardEntry[] => {
  if (typeof window === 'undefined') return [];

  const raw = localStorage.getItem(KEY);
  if (!raw) return [];

  const parsed = JSON.parse(raw) as LeaderboardEntry[];

  return parsed
    .sort(
      (a: LeaderboardEntry, b: LeaderboardEntry) =>
        b.bestStreak - a.bestStreak
    )
    .slice(0, 20);
};
