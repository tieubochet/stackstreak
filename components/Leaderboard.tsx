import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import {
  getLeaderboard,
  LEADERBOARD_UPDATED_EVENT,
  LeaderboardEntry,
} from '../services/leaderboard';
import { formatAddress, fetchBnsName } from '../services/stacks';

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
  // Cache để lưu tên miền đã fetch, tránh gọi API nhiều lần
  const [bnsMap, setBnsMap] = useState<Record<string, string>>({});

  const refresh = () => {
    const list = getLeaderboard();
    setData(list);
    // Gọi hàm load tên BNS mỗi khi danh sách cập nhật
    loadBnsNames(list);
  };

  // Hàm helper để load BNS cho danh sách user
  const loadBnsNames = async (entries: LeaderboardEntry[]) => {
    const newMap = { ...bnsMap };
    let hasUpdate = false;

    for (const entry of entries) {
      // Chỉ fetch nếu chưa có trong cache
      if (!newMap[entry.address]) {
        const name = await fetchBnsName(entry.address);
        if (name) {
          newMap[entry.address] = name;
          hasUpdate = true;
        }
      }
    }

    // Chỉ update state nếu có thay đổi để tránh re-render thừa
    if (hasUpdate) {
      setBnsMap(prev => ({ ...prev, ...newMap }));
    }
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
        // Ưu tiên hiển thị tên BNS từ map, nếu không có thì dùng địa chỉ rút gọn
        const displayName = bnsMap[u.address] || formatAddress(u.address);

        return (
          <div
            key={u.address}
            className={`flex justify-between items-center text-sm rounded-lg px-2 py-1 ${
              i < 3 ? 'bg-zinc-800' : ''
            }`}
          >
            <div className={`flex items-center gap-2 ${rank.className}`}>
              <span>{rank.icon}</span>
              <span className="truncate max-w-[120px]" title={u.address}>
                {displayName}
              </span>
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