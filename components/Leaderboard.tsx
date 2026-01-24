import React from 'react';
import { LeaderboardEntry } from '../types';
import { formatAddress } from '../services/stacks';
import { Medal } from 'lucide-react';

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, address: 'SP3X...92KA', streak: 42, points: 12500 },
  { rank: 2, address: 'SP1K...J442', streak: 38, points: 10200 },
  { rank: 3, address: 'SP2N...M921', streak: 35, points: 9800 },
  { rank: 4, address: 'SP4M...K112', streak: 21, points: 5400 },
  { rank: 5, address: 'SP9A...L334', streak: 14, points: 3200 },
];

const Leaderboard: React.FC = () => {
  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Top Streakers</h3>
        <span className="text-xs font-bold text-slate-500 uppercase border border-slate-600 px-2 py-1 rounded">Weekly</span>
      </div>
      
      <div className="divide-y divide-slate-700">
        {MOCK_LEADERBOARD.map((entry) => (
          <div key={entry.rank} className="flex items-center justify-between p-4 hover:bg-slate-750 transition-colors">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold 
                ${entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' : 
                  entry.rank === 2 ? 'bg-slate-300/20 text-slate-300' : 
                  entry.rank === 3 ? 'bg-amber-700/20 text-amber-700' : 'text-slate-500'}`}>
                {entry.rank <= 3 ? <Medal className="w-4 h-4" /> : entry.rank}
              </div>
              <div>
                <p className="font-mono text-slate-300 text-sm">{entry.address}</p>
                <p className="text-xs text-slate-500">Streak: <span className="text-orange-400">{entry.streak} days</span></p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-white">{entry.points.toLocaleString()}</p>
              <p className="text-xs text-slate-500 uppercase">Points</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 text-center">
        <button className="text-sm text-slate-400 hover:text-orange-400 transition-colors">View Full Leaderboard</button>
      </div>
    </div>
  );
};

export default Leaderboard;