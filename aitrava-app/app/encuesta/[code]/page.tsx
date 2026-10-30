'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Alert, ErrorState, Field, YesNo } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { formatLongDate } from '@/lib/format';
import type { Place } from '@/lib/types';
import { usePlaces } from '@/lib/useSalidas';

type Info = { code: string; name: string; salida: { title: string; startsAt: string }; canAnswer: boolean; done: boolean };

function Encuesta() {
  const { code } = useParams<{ code: string }>();
  const token = useSearchParams().get('t') ?? '';
  const [info, setInfo] = useState<Info | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: places } = usePlaces();

  const [cameAlone, setCameAlone] = useState<boolean | null>(null);
  const [newContact, setNewContact] = useState<boolean | null>(null);
  const [nps, setNps] = useState<number | null>(null);
  const [wouldReturn, setWouldReturn] = useState<boolean | null>(null);
  const [returnPlace, setReturnPlace] = useState('');
  const [improve, setImprove] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (token.length < 20) {
      setError('Este enlace está incompleto. Ábrelo desde el mensaje que te enviamos.');
      return;
    }
    api<Info>(`/surveys/${encodeURIComponent(code)}?token=${encodeURIComponent(token)}`)
      .then(setInfo)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'No pudimos abrir la encuesta.'));
  }, [code, token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cameAlone === null || newContact === null || nps === null || wouldReturn === null) {
      setFormError('Responde las primeras cuatro preguntas (la última es opcional).');
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      await api(`/surveys/${encodeURIComponent(code)}`, {
        json: { token, cameAlone, newContact, nps, wouldReturn, returnPlace: returnPlace || undefined, improve: improve || undefined },
      });
      setSent(true);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No pudimos enviar tus respuestas. Intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  if (error) return <div className="wrap max-w-2xl py-10"><ErrorState title="No pudimos abrir la encuesta" text={error} /></div>;
  if (!info) return <div className="wrap max-w-2xl py-10"><div className="skeleton h-64" /></div>;

  if (sent || info.done)
    return (
      <div className="wrap max-w-2xl py-12">
        <h1 className="display text-[2.4rem]">Gracias, {info.name}</h1>
        <p className="lede mt-4 text-ink-2">Con tus respuestas ajustamos la próxima salida. Te avisamos por WhatsApp cuando abramos fechas.</p>
        <Link href="/salidas" className="btn btn-ember mt-8">
          Ver las próximas salidas
        </Link>
      </div>
    );

  if (!info.canAnswer)
    return (
      <div className="wrap max-w-2xl py-10">
        <Alert tone="info">La encuesta se abre cuando termina la salida. ¡Nos vemos allá!</Alert>
      </div>
    );

  return (
    <div className="wrap max-w-2xl py-10">
      <h1 className="display text-[2.2rem] sm:text-[2.8rem]">¿Cómo te fue, {info.name}?</h1>
      <p className="mt-3 text-ink-2">
        {info.salida.title}, <span>{formatLongDate(info.salida.startsAt)}</span>. Son 5 preguntas, menos de un minuto.
      </p>
      <form onSubmit={submit} noValidate className="mt-8 grid gap-8">
        <fieldset>
          <legend className="label">1. ¿Viniste solo o con alguien que ya conocías?</legend>
          <YesNo name="alone" value={cameAlone} onChange={setCameAlone} yes="Vine solo" no="Con alguien" />
        </fieldset>
        <fieldset>
          <legend className="label">2. ¿Saliste con al menos un contacto nuevo?</legend>
          <YesNo name="contact" value={newContact} onChange={setNewContact} />
        </fieldset>
        <fieldset>
          <legend className="label">3. Del 0 al 10, ¿qué tan probable es que recomiendes AiTrava a un amigo?</legend>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
            {Array.from({ length: 11 }, (_, n) => (
              <label key={n} className="choice tnum justify-center px-0">
                <input type="radio" name="nps" className="sr-only" checked={nps === n} onChange={() => setNps(n)} />
                {n}
              </label>
            ))}
          </div>
          <p className="hint flex justify-between">
            <span>0 · nada probable</span>
            <span>10 · muy probable</span>
          </p>
        </fieldset>
        <fieldset>
          <legend className="label">4. ¿Volverías a una salida de AiTrava?</legend>
          <YesNo name="return" value={wouldReturn} onChange={setWouldReturn} />
          {wouldReturn && (
            <div className="mt-4">
              <Field label="¿A cuál de estos lugares?" htmlFor="place" optional>
                <select id="place" className="input" value={returnPlace} onChange={(e) => setReturnPlace(e.target.value)}>
                  <option value="">Elige un lugar</option>
                  {(places ?? []).map((p: Place) => (
                    <option key={p.slug} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}
        </fieldset>
        <Field label="5. ¿Qué cambiarías para la próxima?" htmlFor="improve" optional>
          <textarea id="improve" className="input" rows={4} value={improve} onChange={(e) => setImprove(e.target.value)} maxLength={1000} />
        </Field>
        {formError && <Alert tone="bad">{formError}</Alert>}
        <button type="submit" disabled={busy} className="btn btn-ember btn-block sm:w-auto sm:justify-self-start">
          {busy ? 'Enviando…' : 'Enviar mis respuestas'}
        </button>
      </form>
    </div>
  );
}

export default function EncuestaPage() {
  return (
    <Suspense>
      <Encuesta />
    </Suspense>
  );
}
