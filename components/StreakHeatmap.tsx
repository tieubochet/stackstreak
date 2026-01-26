import { Flame } from 'lucide-react';

const DAY_MS = 24 * 60 * 60 * 1000;

type Props = {
  streakDays: number[];
  days?: number; // default 30
};

export default function StreakHeatmap({
  streakDays,
  days = 30,
}: Props) {
  const today = Math.floor(Date.now() / DAY_MS);

  const cells = Array.from({ length: days }).map((_, i) => {
    const day = today - (days - 1 - i);
    const active = streakDays.includes(day);

    return { day, active };
  });

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-orange-400">
        <Flame size={16} />
        Streak Calendar
      </div>

      <div className="grid grid-cols-10 gap-2">
        {cells.map((c, i) => (
          <div
            key={i}
            title={`Day ${c.day}`}
            className={`w-4 h-4 rounded-sm transition-all ${
              c.active
                ? 'bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.8)]'
                : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      <div className="mt-3 text-xs text-slate-500">
        Last {days} days
      </div>
    </div>
  );
}
