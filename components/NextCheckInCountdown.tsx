import { useEffect, useState } from 'react';
import { formatCountdown, DAY_MS } from '../utils/countdown';

type Props = {
  lastCheckInDay: number;
};

export default function NextCheckInCountdown({ lastCheckInDay }: Props) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const update = () => {
      const nextTime = (lastCheckInDay + 1) * DAY_MS;
      const now = Date.now();
      setRemaining(nextTime - now);
    };

    update();
    const id = setInterval(update, 1000);

    return () => clearInterval(id);
  }, [lastCheckInDay]);

  const ready = remaining <= 0;

  return (
    <div
      className={`text-center rounded-lg px-3 py-2 text-sm font-semibold ${
        ready
          ? 'bg-green-900 text-green-400'
          : 'bg-zinc-800 text-orange-400'
      }`}
    >
      {ready ? '✅ Ready to check-in' : `⏰ Next check-in in ${formatCountdown(remaining)}`}
    </div>
  );
}
