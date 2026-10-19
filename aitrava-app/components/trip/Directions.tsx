'use client';

import { formatDuration, formatKm, formatTime, haversineKm, walkMinutes } from '@/lib/format';
import { GEO_EXPLAIN, type GeoState, type LatLng } from '@/lib/geo';
import { directionsUrl, type TravelMode } from '@/lib/itinerary';
import { track } from '@/lib/track';
import type { ItineraryItem } from '@/lib/types';
import { Icon, type IconName } from '../Icon';
import { Alert, Sheet } from '../ui';

const MODES: { key: TravelMode; label: string; icon: IconName }[] = [
  { key: 'walking', label: 'A pie', icon: 'walk' },
  { key: 'transit', label: 'Transporte público', icon: 'train' },
  { key: 'driving', label: 'Carro o taxi', icon: 'car' },
];

export const distanceTo = (item: ItineraryItem, pos: LatLng | null) =>
  pos && item.latitude != null && item.longitude != null ? haversineKm(pos, { lat: item.latitude, lng: item.longitude }) : null;

/** "¿Cómo quieres llegar?" → abre la ruta real en Google Maps. No inventamos rutas ni tiempos. */
export function DirectionsSheet({
  item,
  city,
  open,
  onClose,
  geo,
  tripId,
}: {
  item: ItineraryItem | null;
  city: string;
  open: boolean;
  onClose: () => void;
  geo: { state: GeoState; pos: LatLng | null; request: () => void };
  tripId: string;
}) {
  if (!item) return null;
  const km = distanceTo(item, geo.pos);
  return (
    <Sheet open={open} onClose={onClose} title="¿Cómo quieres llegar?">
      <div className="rounded-2xl bg-surface p-4">
        <p className="font-bold text-navy">{item.title}</p>
        <p className="text-sm text-text-2">
          {formatTime(item.startAt)}
          {item.locationName ? ` · ${item.locationName}` : ''}
        </p>
        {item.address && <p className="text-sm text-text-2">{item.address}</p>}
        {km != null && (
          <p className="mt-2 text-sm text-navy">
            <strong>{formatKm(km)}</strong> en línea recta · ≈ {formatDuration(walkMinutes(km))} a pie <span className="text-text-3">(aprox.)</span>
          </p>
        )}
      </div>
      {geo.state !== 'granted' && (
        <div className="mt-3">
          {geo.state === 'denied' ? (
            <Alert tone="warn">No tenemos permiso de ubicación. Igual puedes abrir la ruta: Google Maps la calcula desde donde estés.</Alert>
          ) : (
            <button onClick={geo.request} className="btn btn-outline btn-sm w-full" disabled={geo.state === 'asking'}>
              <Icon name="navigation" size={16} /> {geo.state === 'asking' ? 'Buscando tu ubicación…' : 'Ver la distancia desde mi ubicación'}
            </button>
          )}
          {geo.state === 'idle' && <p className="mt-2 text-xs text-text-2">{GEO_EXPLAIN}</p>}
        </div>
      )}
      <div className="mt-4 grid gap-2">
        {MODES.map((m) => (
          <a
            key={m.key}
            href={directionsUrl({ ...item, city }, m.key)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('directions_clicked', { mode: m.key }, tripId)}
            className="flex min-h-14 items-center gap-3 rounded-2xl border border-line px-4 font-semibold text-navy transition hover:border-navy"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-sky text-blue">
              <Icon name={m.icon} size={20} />
            </span>
            {m.label}
            <Icon name="externalLink" size={16} className="ml-auto text-text-3" />
          </a>
        ))}
      </div>
      <p className="mt-3 text-xs text-text-2">La ruta, el tiempo y la distancia exactos los calcula Google Maps.</p>
    </Sheet>
  );
}
