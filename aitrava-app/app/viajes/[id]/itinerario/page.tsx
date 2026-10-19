'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { ItemForm } from '@/components/trip/forms';
import { ItineraryTimeline } from '@/components/trip/Timeline';
import { EmptyState, SectionTitle } from '@/components/ui';
import { track } from '@/lib/track';
import { useLoadedTrip } from '@/lib/trip-context';

export default function ItinerarioPage() {
  const { trip } = useLoadedTrip();
  const [adding, setAdding] = useState(false);
  useEffect(() => {
    track('itinerary_viewed', {}, trip.id);
  }, [trip.id]);

  return (
    <div className="mx-auto max-w-3xl">
      <SectionTitle
        eyebrow="Itinerario"
        title="Día por día"
        action={
          <button onClick={() => setAdding(true)} className="btn btn-navy btn-sm">
            <Icon name="plus" size={16} /> Agregar
          </button>
        }
      />
      {trip.items.length ? (
        <ItineraryTimeline />
      ) : (
        <EmptyState
          icon="calendar"
          title="Tu itinerario está esperando"
          text="Agrega actividades, comidas y traslados. Las reservas que cargues también pueden aparecer aquí."
          action={
            <button onClick={() => setAdding(true)} className="btn btn-primary">
              Agregar mi primera actividad
            </button>
          }
        />
      )}
      <ItemForm open={adding} onClose={() => setAdding(false)} />
    </div>
  );
}
