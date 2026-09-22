import { POSTCARD_GRADIENTS } from '@/lib/constants';
import type { DestinationView } from '@/lib/types';

/** Postal del destino con degradado (sin depender de fotos externas). */
export function Postcard({ destination, className = '' }: { destination: DestinationView; className?: string }) {
  const idx = [...destination.slug].reduce((a, c) => a + c.charCodeAt(0), 0) % POSTCARD_GRADIENTS.length;
  return (
    <div
      className={`relative flex flex-col justify-end overflow-hidden rounded-3xl p-6 ${className}`}
      style={{ background: destination.imageUrl ? `center/cover url(${destination.imageUrl})` : POSTCARD_GRADIENTS[idx] }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="relative">
        <p className="eyebrow text-white/80">{destination.region}</p>
        <h2 className="display mt-2 text-6xl text-white sm:text-7xl">{destination.name}</h2>
      </div>
    </div>
  );
}
