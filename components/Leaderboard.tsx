import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import {
  getLeaderboard,
  LEADERBOARD_UPDATED_EVENT,
  LeaderboardEntry,
} from '../services/leaderboard';
import { formatAddress } from '../services/stacks';

const rankStyle = (index: number) => {
  switch (index) {
    case 0:
      return { icon: '🥇', className: 'text-yellow-400 font-bold' };
    case 1:
      return { icon: '🥈', className: 'text-gray-300 font-semibold' };
    case 2:
      return { icon: '🥉', className: 'text-amber-600 font-semibold' };
    default:
      return {
        icon: `#${index + 1}`,
        className: 'text-gray-400',
      };
  }
};

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);

  const refresh = () => {
    setData(getLeaderboard());
  };

  useEffect(() => {
    refresh();

    const handler = () => refresh();
    window.addEventListener(LEADERBOARD_UPDATED_EVENT, handler);

    return () => {
      window.removeEventListener(LEADERBOARD_UPDATED_EVENT, handler);
    };
  }, []);

  if (data.length === 0) {
    return (
      <div className="text-sm text-gray-400 text-center">
        No leaderboard data yet
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-yellow-400 font-semibold">
        <Trophy size={18} />
        Leaderboard
      </div>

      {data.map((u, i) => {
        const rank = rankStyle(i);

        return (
          <div
            key={u.address}
            className={`flex justify-between items-center text-sm rounded-lg px-2 py-1 ${
              i < 3 ? 'bg-zinc-800' : ''
            }`}
          >
            <div className={`flex items-center gap-2 ${rank.className}`}>
              <span>{rank.icon}</span>
              <span>{formatAddress(u.address)}</span>
            </div>

            <div className="font-bold text-orange-400">
              🔥 {u.bestStreak}
            </div>
          </div>
        );
      })}
    </div>
  );
}
