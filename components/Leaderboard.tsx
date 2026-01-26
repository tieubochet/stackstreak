import { Trophy } from 'lucide-react';
import { getLeaderboard } from '../services/leaderboard';
import { formatAddress } from '../services/stacks';

export default function Leaderboard() {
  const leaderboard = getLeaderboard();

  if (leaderboard.length === 0) {
    return (
      <div className="text-sm text-gray-400 text-center">
        No data yet
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-yellow-400 font-semibold">
        <Trophy size={18} />
        Leaderboard
      </div>

      {leaderboard.map((u, i) => (
        <div
          key={u.address}
          className="flex justify-between text-sm"
        >
          <span>
            #{i + 1} {formatAddress(u.address)}
          </span>
          <span className="font-bold">
            🔥 {u.bestStreak}
          </span>
        </div>
      ))}
    </div>
  );
}
