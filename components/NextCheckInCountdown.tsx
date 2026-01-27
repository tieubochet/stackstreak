
import React, { useEffect, useState } from 'react';

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
  
  const currentDay = Math.floor(now / DAY_MS);
  
  
  if (currentDay > lastCheckInDay) {
    return (
      <div className="inline-block px-4 py-2 bg-green-500/20 border border-green-500 rounded-lg mb-4">
        <p className="text-sm font-bold text-green-400 flex items-center gap-2">
           ✅ You can check in now!
        </p>
      </div>
    );
  }


  const endOfDay = (currentDay + 1) * DAY_MS;
  const diff = endOfDay - now;
  
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return (
    <div className="mb-6 bg-slate-900/50 p-3 rounded-lg border border-slate-700 inline-block">
      <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-bold">Next Check-in</p>
      <div className="font-mono text-xl text-orange-400 font-bold">
        {h}h {m}m {s}s
      </div>
    </div>
  );
};

export default NextCheckInCountdown;