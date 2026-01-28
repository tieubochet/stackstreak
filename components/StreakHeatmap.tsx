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
  const streakSet = new Set<number>(streakDays);

  const formatDate = (dayIndex: number) => {
    const date = new Date(dayIndex * 86400000);
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const cells = Array.from({ length: days }, (_, i) => {
    const day = today - (days - 1 - i);
    const active = streakSet.has(day);
    const dateStr = formatDate(day);

    return (
      <div
        key={day}
        title={dateStr}
        className={`
          aspect-square rounded-[3px] cursor-help transition-all duration-300
          ${active 
            ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)] hover:bg-orange-400 hover:scale-110 hover:shadow-[0_0_12px_rgba(249,115,22,0.6)] z-10' 
            : 'bg-slate-700/50 hover:bg-slate-600'}
        `}
      />
    );
  });

  return (
    <div>
      <div className="grid grid-cols-6 gap-2">
        {cells}
      </div>
      <div className="mt-3 flex justify-between items-center text-[10px] text-slate-500 px-1">
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
};

export default StreakHeatmap;