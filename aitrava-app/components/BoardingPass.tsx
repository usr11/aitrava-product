import { flightCode, formatDate } from '@/lib/format';
import type { Trip } from '@/lib/types';
import { Icon } from './Icon';

const cityCode = (city: string) =>
  city.normalize('NFD').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();

/** Pase de abordaje: el destino siempre es ??? hasta la revelación. */
export function BoardingPass({ trip }: { trip: Trip }) {
  const revealed = !!trip.destination;
  return (
    <div className="relative overflow-hidden rounded-3xl bg-light-bg text-ink shadow-2xl shadow-black/50">
      <div className="flex items-center justify-between bg-ink px-5 py-3 text-text">
        <span className="eyebrow text-primary">Pase de abordaje</span>
        <span className="eyebrow text-muted">{flightCode(trip.id)}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 pt-6">
        <div>
          <p className="eyebrow text-[10px] text-ink/60">Desde</p>
          <p className="display text-5xl sm:text-6xl">{cityCode(trip.originCity)}</p>
          <p className="text-sm font-medium text-ink/70">{trip.originCity}</p>
        </div>
        <Icon name="plane" size={30} className="text-gold-text" />
        <div className="text-right">
          <p className="eyebrow text-[10px] text-ink/60">Hacia</p>
          <p className={`display text-5xl sm:text-6xl ${revealed ? '' : 'text-gold-text'}`}>
            {revealed ? cityCode(trip.destination!.name) : '???'}
          </p>
          <p className="text-sm font-medium text-ink/70">{revealed ? trip.destination!.name : 'Sorpresa'}</p>
        </div>
      </div>
      <div className="mx-5 my-5 grid grid-cols-3 gap-3 border-y border-dashed border-ink/25 py-4">
        <div>
          <p className="eyebrow text-[10px] text-ink/60">Salida</p>
          <p className="font-semibold">{formatDate(trip.startDate)}</p>
        </div>
        <div>
          <p className="eyebrow text-[10px] text-ink/60">Regreso</p>
          <p className="font-semibold">{formatDate(trip.endDate)}</p>
        </div>
        <div>
          <p className="eyebrow text-[10px] text-ink/60">Pasajeros</p>
          <p className="font-semibold">PAX {String(trip.travelers).padStart(2, '0')}</p>
        </div>
      </div>
      <div className="flex items-end justify-between gap-4 px-5 pb-5">
        <div className="flex flex-wrap gap-1.5">
          {trip.vibes.map((v) => (
            <span key={v} className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-primary">
              {v}
            </span>
          ))}
        </div>
        {/* Código de barras decorativo */}
        <div className="flex h-10 shrink-0 items-end gap-[2px]" aria-hidden>
          {Array.from({ length: 22 }, (_, i) => (
            <span key={i} className="bg-ink" style={{ width: i % 3 === 0 ? 3 : 1.5, height: `${60 + ((i * 37) % 40)}%` }} />
          ))}
        </div>
      </div>
      {/* Muescas laterales del ticket */}
      <span className="absolute top-[58%] -left-3 size-6 rounded-full bg-bg" aria-hidden />
      <span className="absolute top-[58%] -right-3 size-6 rounded-full bg-bg" aria-hidden />
    </div>
  );
}
