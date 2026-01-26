export const DAY_MS = 24 * 60 * 60 * 1000;

export const getNextCheckInTime = (lastDay: number) => {
  return (lastDay + 1) * DAY_MS;
};

export const formatCountdown = (ms: number) => {
  if (ms <= 0) return 'Ready';

  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};
