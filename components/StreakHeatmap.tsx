type Props = {
  days: number[];
};

const StreakHeatmap: React.FC<Props> = ({ days }) => {
  const today = Math.floor(Date.now() / 86400000);
  const map = new Set(days);

  return (
    <div className="mt-6">
      <h4 className="text-sm font-bold text-slate-300 mb-2">
        🔥 Streak Activity
      </h4>
      <div className="grid grid-cols-14 gap-1">
        {Array.from({ length: 98 }).map((_, i) => {
          const day = today - (97 - i);
          const active = map.has(day);

          return (
            <div
              key={i}
              className={`w-3 h-3 rounded-sm ${
                active
                  ? 'bg-orange-500'
                  : 'bg-slate-700'
              }`}
              title={active ? 'Checked in' : 'Missed'}
            />
          );
        })}
      </div>
    </div>
  );
};

export default StreakHeatmap;
