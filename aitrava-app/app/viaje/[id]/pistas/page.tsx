'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ClueList } from '@/components/ClueList';
import { Countdown } from '@/components/Countdown';
import { GuessPicker } from '@/components/GuessPicker';
import { Icon } from '@/components/Icon';
import { RequireAuth } from '@/components/RequireAuth';
import { Spinner } from '@/components/Spinner';
import { api } from '@/lib/api';
import { useConfig } from '@/lib/hooks';
import { shareLink } from '@/lib/share';
import { track } from '@/lib/track';
import type { Trip } from '@/lib/types';
import { useTrip } from '@/lib/useTrip';

export default function CluesPage() {
  return (
    <RequireAuth>
      <Clues />
    </RequireAuth>
  );
}

function Clues() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { trip, setTrip, error, refresh } = useTrip(id);
  const [guessing, setGuessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [justReserved, setJustReserved] = useState(false);
  const config = useConfig();

  useEffect(() => {
    setJustReserved(new URLSearchParams(window.location.search).has('nuevo'));
  }, []);

  // Refresca para traer pistas recién desbloqueadas.
  useEffect(() => {
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, [refresh]);

  useEffect(() => {
    if (!trip) return;
    if (trip.status === 'GENERATED') router.replace(`/viaje/${id}`);
    if (trip.status === 'REVEALED' || trip.status === 'COMPLETED') router.replace(`/viaje/${id}/revelacion`);
    track('clue_view', { tripId: id, unlocked: trip.clues.filter((c) => !c.locked).length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip?.status, trip?.clues.filter((c) => !c.locked).length]);

  if (error) return <p className="container-app py-20 text-center text-muted">{error}</p>;
  if (!trip) return <Spinner full />;

  const unlocked = trip.clues.filter((c) => !c.locked).length;
  const shareUrl = `${window.location.origin}/${trip.isGift ? 'regalo' : 's'}/${trip.shareCode}`;

  const share = async () => {
    const text = trip.isGift
      ? `${trip.giftTo}, te tengo una sorpresa 🎁✈️ Abre esto:`
      : '¡Me voy de viaje y NO sé a dónde! 🤫✈️ Ayúdame a adivinar con las pistas:';
    if (await shareLink(shareUrl, text, 'clues')) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const guess = async (slug: string) => {
    setTrip(await api<Trip>(`/trips/${id}/guess`, { json: { destination: slug } }));
  };

  return (
    <div className="container-app max-w-5xl py-6 md:py-12">
      {justReserved && (
        <div className="animate-pop mb-6 rounded-2xl bg-primary px-5 py-4 text-ink">
          <p className="font-bold">¡Reserva confirmada! 🎉</p>
          <p className="text-sm text-ink/80">Todo está listo. Ahora empieza lo mejor: la espera. Cada pista te acerca al destino.</p>
        </div>
      )}
      <div className="grid gap-8 md:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="eyebrow text-secondary">{trip.isGift ? `Sorpresa para ${trip.giftTo}` : 'Mi sorpresa'}</p>
          <h1 className="display mt-3 text-5xl sm:text-6xl">Pistas antes de despegar</h1>

          <div className="card mt-6 p-5">
            <span className="eyebrow text-[11px] text-muted-2">{trip.canReveal ? 'Ya puedes abrirlo' : 'Revelación en'}</span>
            <div className="mt-2">
              {trip.canReveal ? <p className="display text-5xl text-primary">¡Ahora!</p> : <Countdown to={trip.revealAt} onDone={refresh} />}
            </div>
            <div className="mt-4 grid grid-cols-5 gap-1.5">
              {trip.clues.map((c) => (
                <span key={c.order} className={`h-1.5 rounded-full ${c.locked ? 'bg-line-strong' : 'bg-primary'}`} />
              ))}
            </div>
            <p className="mt-2 text-sm text-muted">{unlocked} de {trip.clues.length} pistas desbloqueadas</p>
          </div>

          {trip.canReveal ? (
            <Link href={`/viaje/${id}/revelacion`} className="btn btn-primary btn-lg animate-pop mt-4 w-full">
              <Icon name="envelope" size={20} /> Abrir el sobre
            </Link>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button onClick={() => setGuessing(true)} className="btn btn-primary">
                <Icon name="mystery" size={20} /> {trip.ownerGuess ? 'Cambiar apuesta' : 'Adivinar'}
              </button>
              <button onClick={share} className="btn btn-dark">
                <Icon name="share" size={18} /> {copied ? '¡Link copiado!' : 'Compartir'}
              </button>
            </div>
          )}

          {config?.demoMode && !trip.canReveal && (
            <button
              onClick={async () => setTrip(await api<Trip>(`/trips/${id}/demo-skip`, { method: 'POST' }))}
              className="btn btn-ghost mt-2 w-full text-sm"
            >
              ⏩ Adelantar el tiempo (solo demo)
            </button>
          )}

          {trip.ownerGuess && !trip.canReveal && (
            <p className="mt-4 text-sm text-muted">
              Tu apuesta está guardada. Sabrás si acertaste al abrir el sobre. 🤞
            </p>
          )}

          <div className="card mt-6 p-5">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Tus acompañantes también juegan</p>
              <Icon name="users" className="text-secondary" />
            </div>
            <p className="mt-1 text-sm text-muted">Comparte el link: verán las pistas y apostarán por un destino.</p>
            {trip.friendGuesses.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {trip.friendGuesses.map((g, i) => (
                  <li key={i} className="rounded-full bg-surface-2 px-3 py-1.5 text-sm">
                    {g.name} ya apostó 🎲
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 font-mono text-xs text-dim">Nadie ha apostado todavía</p>
            )}
          </div>
        </div>

        <div>
          <ClueList clues={trip.clues} />
        </div>
      </div>

      <GuessPicker open={guessing} onClose={() => setGuessing(false)} onPick={guess} />
    </div>
  );
}
