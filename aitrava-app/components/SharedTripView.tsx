'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { getAnonId, track } from '@/lib/track';
import type { SharedTrip } from '@/lib/types';
import { ClueList } from './ClueList';
import { Countdown } from './Countdown';
import { GuessPicker } from './GuessPicker';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { Postcard } from './Postcard';
import { Spinner } from './Spinner';

/** Vista pública del viaje de otra persona: amigos (o quien recibe el regalo) ven pistas y apuestan. */
export function SharedTripView({ code, mode }: { code: string; mode: 'friend' | 'gift' }) {
  const [trip, setTrip] = useState<SharedTrip | null>(null);
  const [error, setError] = useState('');
  const [guessing, setGuessing] = useState(false);
  const [myGuess, setMyGuess] = useState(false);

  const load = useCallback(() => api<SharedTrip>(`/share/${code}`).then(setTrip).catch((e) => setError(e.message)), [code]);

  useEffect(() => {
    load();
    track(mode === 'gift' ? 'gift_open' : 'share_view', { code });
    const t = setInterval(load, 10_000);
    return () => clearInterval(t);
  }, [load, mode, code]);

  if (error) return <p className="container-app py-20 text-center text-muted">{error}</p>;
  if (!trip) return <Spinner full />;

  const revealed = !!trip.destination;
  const guess = async (slug: string, name?: string) => {
    const updated = await api<SharedTrip>(`/share/${code}/guess`, {
      json: { name: name ?? 'Anónimo', destination: slug },
      headers: { 'x-anon-id': getAnonId() ?? '' },
    });
    setTrip(updated);
    setMyGuess(true);
  };

  const ctaHref = `/registro?ref=${trip.referralCode}&utm_source=${mode === 'gift' ? 'regalo' : 'compartido'}`;
  const title =
    mode === 'gift'
      ? `${trip.giftTo ?? 'Hey'}, ${trip.ownerName} te regaló un viaje sorpresa`
      : `${trip.ownerName} se va de viaje… y no sabe a dónde`;

  return (
    <div className="container-app max-w-5xl py-6 md:py-12">
      <div className="grid gap-8 md:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="eyebrow text-secondary">{mode === 'gift' ? 'Tienes un regalo 🎁' : 'Ayuda a adivinar'}</p>
          <h1 className="display mt-3 text-5xl sm:text-6xl">{title}</h1>
          {mode === 'gift' && trip.giftMessage && (
            <blockquote className="mt-6 rounded-2xl border-l-4 border-primary bg-surface p-5 text-lg italic">
              “{trip.giftMessage}”
              <footer className="mt-2 text-sm text-muted not-italic">— {trip.ownerName}</footer>
            </blockquote>
          )}

          {revealed ? (
            <Postcard destination={trip.destination!} className="mt-6 min-h-64" />
          ) : (
            <div className="card mt-6 p-5">
              <span className="eyebrow text-[11px] text-muted-2">Salida el {formatDate(trip.startDate, { day: 'numeric', month: 'long' })} · se revela en</span>
              <div className="mt-2">
                {trip.status === 'GENERATED' ? <p className="text-muted">El viaje aún no está reservado.</p> : <Countdown to={trip.revealAt} />}
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {trip.vibes.map((v) => (
                  <span key={v} className="rounded-full bg-surface-2 px-3 py-1 text-xs text-primary">{v}</span>
                ))}
              </div>
            </div>
          )}

          {!revealed && (
            <button onClick={() => setGuessing(true)} disabled={myGuess} className="btn btn-primary btn-lg mt-4 w-full">
              <Icon name="mystery" size={20} /> {myGuess ? '¡Apuesta guardada!' : 'Apostar por un destino'}
            </button>
          )}

          {trip.guesses.length > 0 && (
            <div className="card mt-6 p-5">
              <p className="font-semibold">Apuestas ({trip.guesses.length})</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {trip.guesses.map((g, i) => (
                  <li key={i} className={`rounded-full px-3 py-1.5 text-sm ${g.correct ? 'bg-primary text-ink' : 'bg-surface-2'}`}>
                    {g.name}
                    {g.isOwner && ' (viajero)'}
                    {revealed && (g.correct ? ' 🎯' : ' ✗')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <p className="eyebrow mb-3 text-muted-2">Pistas desbloqueadas</p>
          <ClueList clues={trip.clues} />
          <div className="mt-8 rounded-3xl bg-primary p-6 text-ink">
            <Logo size={30} />
            <h2 className="display mt-4 text-4xl">¿Y si el próximo sorprendido eres tú?</h2>
            <p className="mt-2 text-ink/80">Pones presupuesto y fechas; la IA arma todo. Tú solo empacas.</p>
            <Link href={ctaHref} onClick={() => track('referral_click', { from: mode })} className="btn mt-5 w-full bg-ink text-text hover:bg-surface">
              Quiero mi viaje sorpresa <Icon name="arrow" size={18} />
            </Link>
          </div>
        </div>
      </div>
      <GuessPicker open={guessing} onClose={() => setGuessing(false)} onPick={guess} askName />
    </div>
  );
}
