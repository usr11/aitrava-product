'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Envelope } from '@/components/Envelope';
import { Icon } from '@/components/Icon';
import { NpsForm } from '@/components/NpsForm';
import { Postcard } from '@/components/Postcard';
import { RequireAuth } from '@/components/RequireAuth';
import { Spinner } from '@/components/Spinner';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { Trip } from '@/lib/types';
import { useTrip } from '@/lib/useTrip';

export default function RevealPage() {
  return (
    <RequireAuth>
      <Reveal />
    </RequireAuth>
  );
}

function Reveal() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { trip, setTrip, error } = useTrip(id);
  const [opening, setOpening] = useState(false);
  const [justOpened, setJustOpened] = useState(false);

  useEffect(() => {
    if (trip?.status === 'GENERATED') router.replace(`/viaje/${id}`);
    else if (trip?.status === 'RESERVED' && !trip.canReveal) router.replace(`/viaje/${id}/pistas`);
  }, [trip, id, router]);

  if (error) return <p className="container-app py-20 text-center text-muted">{error}</p>;
  if (!trip) return <Spinner full />;

  const open = async () => {
    setOpening(true);
    const [revealed] = await Promise.all([api<Trip>(`/trips/${id}/reveal`, { method: 'POST' }), new Promise((r) => setTimeout(r, 1500))]);
    setJustOpened(true);
    setTrip(revealed);
  };

  if (!trip.destination) {
    return (
      <div className="container-app grid min-h-[75dvh] place-items-center py-10 text-center">
        <div className="w-full max-w-lg">
          <p className="eyebrow text-secondary">Llegó el momento</p>
          <h1 className="display mt-3 mb-10 text-6xl sm:text-7xl">Abre tu sobre</h1>
          <Envelope opening={opening} onOpen={open} />
          <p className="mt-10 text-muted">{opening ? 'Rompiendo el sello…' : 'Toca el sobre para descubrir a dónde vas'}</p>
        </div>
      </div>
    );
  }

  const d = trip.destination;
  const guess = trip.ownerGuess;
  const winners = trip.friendGuesses.filter((g) => g.correct);

  return (
    <div className="container-app max-w-5xl py-6 md:py-12">
      <div className={justOpened ? 'animate-pop' : ''}>
        <p className="eyebrow text-secondary">{trip.isGift ? `El regalo para ${trip.giftTo} es…` : 'Te vas para…'}</p>
        <Postcard destination={d} className="mt-4 min-h-72 sm:min-h-96" />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <div className="card p-5 sm:p-6">
            <p className="eyebrow text-muted-2">Por qué te elegimos {d.name}</p>
            <p className="mt-3 text-lg leading-relaxed">{trip.aiReason}</p>
            <p className="mt-3 text-sm text-muted">{d.description}</p>
            {trip.aiGenerated && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                <Icon name="sparkle" size={14} /> Recomendado y escrito por la IA de AiTrava
              </p>
            )}
          </div>

          <div>
            <h2 className="display text-4xl">Tu itinerario</h2>
            <p className="mt-1 text-sm text-muted">
              {formatDate(trip.startDate, { weekday: 'long', day: 'numeric', month: 'long' })} → {formatDate(trip.endDate, { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <ol className="mt-5 space-y-4">
              {trip.itinerary?.map((day) => (
                <li key={day.day} className="card p-5">
                  <p className="eyebrow text-secondary">Día {day.day}</p>
                  <h3 className="mt-1 text-xl font-bold">{day.title}</h3>
                  <ul className="mt-3 space-y-2">
                    {day.items.map((it) => (
                      <li key={it} className="flex gap-2.5 text-text-soft">
                        <Icon name="check" size={18} className="mt-0.5 shrink-0 text-primary" strokeWidth={2.4} /> {it}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-6">
          {!trip.isGift && <div className={`rounded-3xl p-6 ${guess?.correct ? 'bg-primary text-ink' : 'card'}`}>
            <p className={`eyebrow ${guess?.correct ? 'text-ink' : 'text-muted-2'}`}>Tu apuesta</p>
            <p className="display mt-2 text-4xl">
              {!guess ? 'No apostaste 🙈' : guess.correct ? '¡Le atinaste! 🎯' : 'Casi… 😅'}
            </p>
            {guess && !guess.correct && <p className="mt-1 text-sm text-muted">Apostaste por otro destino. ¡La próxima!</p>}
          </div>}

          {trip.friendGuesses.length > 0 && (
            <div className="card p-5">
              <p className="font-semibold">Así apostaron tus amigos</p>
              <ul className="mt-3 space-y-2 text-sm">
                {trip.friendGuesses.map((g, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{g.name}</span>
                    <span className={g.correct ? 'text-ok' : 'text-muted-2'}>{g.correct ? 'Acertó 🎯' : 'Falló'}</span>
                  </li>
                ))}
              </ul>
              {winners.length > 0 && <p className="mt-3 text-sm text-primary">{winners.map((w) => w.name).join(', ')} se ganó el derecho a presumir.</p>}
            </div>
          )}

          <NpsForm tripId={trip.id} />

          <Link href="/crear" className="btn btn-dark w-full">
            <Icon name="plus" size={18} /> Planear otra sorpresa
          </Link>
        </div>
      </div>
    </div>
  );
}
