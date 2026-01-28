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

  // Hàm chuyển đổi index ngày thành dd/mm/yyyy
  const formatDate = (dayIndex: number) => {
    const date = new Date(dayIndex * 86400000); // 86400000 = 24 * 60 * 60 * 1000
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const cells = Array.from({ length: days }, (_, i) => {
    const day = today - (days - 1 - i);
    const active = streakSet.has(day);
    const dateStr = formatDate(day); // Tạo chuỗi ngày tháng

    return (
      <div
        key={day}
        title={dateStr} // ✨ Hiển thị ngày tháng khi hover
        className={`
          w-4 h-4 rounded-sm cursor-help transition-all duration-200
          ${active 
            ? 'bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)] hover:bg-orange-400' 
            : 'bg-slate-700 hover:bg-slate-600'}
        `}
      />
    );
  });

  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-slate-300 mb-2">
        Streak history (last 30 days)
      </h4>

      <div className="grid grid-cols-10 gap-1">
        {cells}
      </div>
    </div>
  );
};

export default StreakHeatmap;