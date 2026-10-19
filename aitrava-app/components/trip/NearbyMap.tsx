'use client';

import 'leaflet/dist/leaflet.css';
import type { Map as LeafletMap } from 'leaflet';
import { useEffect, useRef } from 'react';
import { formatDuration, formatKm, walkMinutes } from '@/lib/format';
import type { LatLng } from '@/lib/geo';
import { placeUrl } from '@/lib/itinerary';
import type { Place } from './Nearby';

/** Mapa de OpenStreetMap (Leaflet). Se carga solo cuando el usuario elige "Mapa". */
export default function NearbyMap({
  center,
  places,
  selected,
  onSelect,
}: {
  center: LatLng;
  places: Place[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const current = places.find((p) => p.id === selected) ?? null;

  useEffect(() => {
    let cancelled = false;
    import('leaflet').then((L) => {
      if (cancelled || !el.current) return;
      map.current?.remove();
      // En el celular un dedo desplaza la página (no el mapa); el mapa se mueve con dos dedos o con los botones.
      const touch = L.Browser.mobile;
      const m = L.map(el.current, { zoomControl: true, attributionControl: true, dragging: !touch, scrollWheelZoom: false, touchZoom: true }).setView([center.lat, center.lng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      }).addTo(m);
      const dot = (color: string, size: number) =>
        L.divIcon({
          className: '',
          html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 6px rgba(11,31,58,.35)"></span>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      L.marker([center.lat, center.lng], { icon: dot('#1e5bd8', 18), title: 'Punto de referencia' }).addTo(m);
      for (const p of places) {
        L.marker([p.lat, p.lng], { icon: dot('#0b1f3a', 16), title: p.name })
          .addTo(m)
          .on('click', () => onSelect(p.id));
      }
      map.current = m;
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, [center, places, onSelect]);

  useEffect(() => {
    if (current) map.current?.panTo([current.lat, current.lng]);
  }, [current]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line">
      <div ref={el} className="h-[50dvh] max-h-[460px] min-h-72 w-full touch-pan-y" role="region" aria-label="Mapa de lugares cercanos" />
      {/* Bottom sheet compacto: no tapa todo el mapa */}
      {current && (
        <div className="absolute inset-x-3 bottom-3 z-[500] rounded-2xl bg-white p-4 shadow-[var(--shadow-lift)]">
          <p className="font-bold text-navy">{current.name}</p>
          <p className="text-sm text-text-2">
            {formatKm(current.km)} · a pie ≈ {formatDuration(walkMinutes(current.km))}
          </p>
          <a href={placeUrl(current.name, current.lat, current.lng)} target="_blank" rel="noopener noreferrer" className="btn btn-navy btn-sm mt-3 w-full">
            Ver en Google Maps
          </a>
        </div>
      )}
    </div>
  );
}
