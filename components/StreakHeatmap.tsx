import React from 'react';

type Props = {
  /** day-indexes user has checked in */
  streakDays: number[];

  /** number of days to display (default 30) */
  days?: number;
};

const StreakHeatmap: React.FC<Props> = ({
  streakDays,
  days = 30,
}) => {
  const today = Math.floor(Date.now() / 86400000);

  // ✅ đúng: Set từ array streakDays
  const streakSet = new Set<number>(streakDays);

  const cells = Array.from({ length: days }, (_, i) => {
    const day = today - (days - 1 - i);
    const active = streakSet.has(day);

    return (
      <div
        key={day}
        title={`Day ${day}`}
        className={`
          w-4 h-4 rounded-sm
          ${active ? 'bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]' : 'bg-slate-700'}
        `}
      />
    );
  });

  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-slate-300 mb-2">
        Streak history
      </h4>

      <div className="grid grid-cols-10 gap-1">
        {cells}
      </div>
    </div>
  );
};

export default StreakHeatmap;
