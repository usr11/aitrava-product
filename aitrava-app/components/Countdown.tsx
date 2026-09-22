'use client';

import { splitDuration, useNow } from '@/lib/hooks';

export function Countdown({ to, onDone }: { to: string; onDone?: () => void }) {
  const now = useNow();
  const left = new Date(to).getTime() - now;
  if (left <= 0 && onDone) queueMicrotask(onDone);
  const { days, hours, minutes, seconds } = splitDuration(left);
  const parts = days > 0 ? [[days, 'días'], [hours, 'h'], [minutes, 'min']] : [[hours, 'h'], [minutes, 'min'], [seconds, 's']];
  return (
    <div className="flex items-baseline gap-2.5 font-display font-extrabold uppercase" aria-live="polite">
      {parts.map(([n, l]) => (
        <span key={l as string} className="flex items-baseline gap-1">
          <strong className="text-5xl leading-none text-primary tabular-nums sm:text-6xl">{String(n).padStart(2, '0')}</strong>
          <span className="text-muted-2">{l}</span>
        </span>
      ))}
    </div>
  );
}
