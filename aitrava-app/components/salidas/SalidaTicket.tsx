import Link from 'next/link';
import { LINES } from '@/lib/config';
import { formatCOP, formatDay, formatDuration, formatTime, relativeDays } from '@/lib/format';
import type { Salida } from '@/lib/types';
import { Icon } from '../Icon';
import { DemoBadge, SeatMeter } from '../ui';

/** Tiquete de una salida: arriba el qué y el cuándo; después de la perforación, cupos y precio. */
export function SalidaTicket({ s, onSelect, headingLevel = 3 }: { s: Salida; onSelect?: () => void; headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as 'h2' | 'h3';
  return (
    <article className="ticket flex h-full flex-col text-ink">
      <div className="flex flex-1 flex-col gap-3 p-5 pb-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
          <span className="narrow font-semibold">{LINES[s.place.line].label}</span>
          <span aria-hidden>·</span>
          <span>{s.place.area}</span>
          {s.isDemo && <DemoBadge />}
          {s.womenOnly && <span className="narrow rounded-full bg-paper-2 px-2 py-0.5 text-[0.8rem] font-semibold">Solo mujeres</span>}
        </div>
        <H className="title text-[1.35rem]">
          <Link href={`/salidas/${s.slug}`} onClick={onSelect} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {s.title}
          </Link>
        </H>
        <p className="flex flex-wrap items-baseline gap-x-2 text-[1.05rem]">
          <span className="font-bold">{formatDay(s.startsAt)}</span>
          <span className="tnum">{formatTime(s.startsAt)}</span>
          <span className="text-ink-3">· {formatDuration(s.durationMin)}</span>
          <span className="narrow text-sm text-forest">{relativeDays(s.startsAt)}</span>
        </p>
        <p className="flex items-start gap-1.5 text-[0.95rem] text-ink-2">
          <Icon name="pin" size={18} className="mt-0.5 shrink-0" /> {s.place.name}
        </p>
      </div>
      <div className="perforation mx-5" aria-hidden />
      <div className="flex items-end justify-between gap-3 p-5 pt-4">
        <SeatMeter capacity={s.capacity} taken={s.seatsTaken} size="sm" />
        <p className="text-right">
          <span className="display tnum block text-[1.6rem] leading-none">{formatCOP(s.price)}</span>
          <span className="text-xs text-ink-3">por persona</span>
        </p>
      </div>
    </article>
  );
}

export function TicketSkeleton() {
  return <div className="skeleton h-[248px] rounded-[18px]" aria-hidden />;
}
