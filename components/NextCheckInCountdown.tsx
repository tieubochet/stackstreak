import { useEffect, useState } from 'react';

const DAY_MS = 24 * 60 * 60 * 1000;

type Props = {
  lastCheckInAt?: number;
};

export default function NextCheckInCountdown({ lastCheckInAt }: Props) {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    if (!lastCheckInAt) {
      setRemaining(0);
      return;
    }

    const update = () => {
      const nextTime = lastCheckInAt + DAY_MS;
      const now = Date.now();
      setRemaining(nextTime - now);
    };

    update();
    const id = setInterval(update, 1000);

    return () => clearInterval(id);
  }, [lastCheckInAt]);

  if (!lastCheckInAt || remaining <= 0) {
    return (
      <div className="text-center rounded-lg px-3 py-2 text-sm font-semibold bg-green-900 text-green-400">
        ✅ Ready to check-in
      </div>
    );
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="text-center rounded-lg px-3 py-2 text-sm font-semibold bg-zinc-800 text-orange-400">
      ⏰ Next check-in in {pad(h)}:{pad(m)}:{pad(s)}
    </div>
  );
}
