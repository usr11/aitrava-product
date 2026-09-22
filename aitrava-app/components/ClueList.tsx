'use client';

import { CLUE_LABELS } from '@/lib/constants';
import { splitDuration, useNow } from '@/lib/hooks';
import type { ClueView } from '@/lib/types';
import { Icon } from './Icon';

const until = (iso: string, now: number) => {
  const { days, hours, minutes, seconds } = splitDuration(new Date(iso).getTime() - now);
  if (days) return `en ${days} d ${hours} h`;
  if (hours) return `en ${hours} h ${minutes} min`;
  if (minutes) return `en ${minutes} min ${seconds} s`;
  return `en ${seconds} s`;
};

/** Pistas: la más reciente en amarillo, las anteriores normales y las futuras bloqueadas. */
export function ClueList({ clues }: { clues: ClueView[] }) {
  const now = useNow();
  const unlocked = clues.filter((c) => !c.locked);
  const newest = unlocked[unlocked.length - 1]?.order;
  const ordered = [...unlocked].reverse().concat(clues.filter((c) => c.locked));

  return (
    <ul className="space-y-3">
      {ordered.map((c) =>
        c.locked ? (
          <li key={c.order} className="flex items-center justify-between rounded-2xl bg-surface px-5 py-4 text-muted-2 opacity-60">
            <span className="eyebrow text-[11px]">
              Pista {c.order} · {until(c.unlockAt, now)}
            </span>
            <Icon name="locked" size={18} />
          </li>
        ) : (
          <li
            key={c.order}
            className={`animate-fade-up rounded-2xl px-5 py-4 ${c.order === newest ? 'bg-primary text-ink' : 'bg-surface'}`}
          >
            <span className={`eyebrow text-[11px] ${c.order === newest ? 'font-semibold text-ink' : 'text-muted-2'}`}>
              Pista {c.order} · {CLUE_LABELS[c.type] ?? c.type}
              {c.order === newest && ' · Nueva'}
              {c.paid && ' · Extra'}
            </span>
            <p className={`mt-1.5 leading-snug ${c.order === newest ? 'text-lg font-semibold' : 'text-text-soft'}`}>{c.text}</p>
          </li>
        ),
      )}
    </ul>
  );
}
