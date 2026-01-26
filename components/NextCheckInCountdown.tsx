import { useEffect, useState } from 'react';

const DAY_MS = 24 * 60 * 60 * 1000;

type Props = {
  lastCheckInDay: number;
};

const NextCheckInCountdown: React.FC<Props> = ({ lastCheckInDay }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const nextCheckInAt = (lastCheckInDay + 1) * DAY_MS;
  const diff = nextCheckInAt - now;

  // ✅ ĐÃ TỚI GIỜ CHECK-IN
  if (diff <= 0) {
    return (
      <div className="mb-4 text-sm font-semibold text-green-400">
        ✅ You can check in now
      </div>
    );
  }

  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return (
    <div className="mb-4 text-sm text-slate-400">
      ⏰ Next check-in in{' '}
      <span className="font-mono text-orange-400">
        {h}h {m}m {s}s
      </span>
