'use client';

import Link from 'next/link';
import { DepartureBoard } from '@/components/DepartureBoard';
import { Icon, type IconName } from '@/components/Icon';
import { useAuth } from '@/lib/auth';
import { TRAVELERS } from '@/lib/constants';
import { track } from '@/lib/track';

const STEPS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'sliders', title: 'Cuéntanos lo básico', text: 'Presupuesto, fechas, desde dónde sales y qué te mueve.' },
  { icon: 'sparkle', title: 'La IA arma tu viaje', text: 'Transporte, alojamiento y planes locales dentro de tu tope.' },
  { icon: 'lock', title: 'Desbloquea pistas', text: 'Qué empacar, el clima, un sabor típico. ¿Lo adivinas?' },
  { icon: 'pin', title: 'Abre el sobre', text: 'Descubres tu destino y todo ya está listo. Solo lleva la maleta.' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      <section className="container-app grid items-center gap-10 pt-10 pb-14 md:grid-cols-[1.1fr_1fr] md:pt-20 md:pb-24">
        <div className="animate-fade-up">
          <p className="eyebrow text-secondary">{user ? `Hola, ${user.name.split(' ')[0]}` : 'Viajes sorpresa personalizados'}</p>
          <h1 className="display mt-4 text-[clamp(4rem,14vw,8.5rem)]">
            Menos planear,
            <br />
            <span className="text-primary">más viajar.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted">
            Tú pones el presupuesto y las fechas. Nuestra IA arma el viaje completo y el destino lo descubres cuando toca.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/crear" className="btn btn-primary btn-lg" onClick={() => track('cta_click', { where: 'home_hero' })}>
              Crear mi viaje sorpresa <Icon name="arrow" size={20} strokeWidth={2.2} />
            </Link>
            <Link href={user ? '/mis-viajes' : '/crear?regalo=1'} className="btn btn-dark btn-lg">
              {user ? 'Ver mis viajes' : (<><Icon name="gift" size={20} /> Regalar uno</>)}
            </Link>
          </div>
          <p className="mt-5 text-sm text-dim">Tarda menos de 2 minutos · Sin pagar nada todavía</p>
        </div>
        <div className="animate-fade-up md:rotate-1" style={{ animationDelay: '0.15s' }}>
          <DepartureBoard status="Tu sorpresa" />
        </div>
      </section>

      <section className="border-y border-line bg-board/60 py-14">
        <div className="container-app">
          <p className="eyebrow text-secondary">Cómo funciona</p>
          <h2 className="display mt-3 text-5xl md:text-6xl">4 pasos, 0 estrés</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="card p-5">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-full bg-primary/15 text-primary">
                    <Icon name={s.icon} />
                  </span>
                  <span className="font-mono text-sm text-dim">0{i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-1 text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-app py-14">
        <p className="eyebrow text-secondary">Para quién</p>
        <h2 className="display mt-3 text-5xl md:text-6xl">¿Con quién vas?</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRAVELERS.map((t, i) => (
            <Link
              key={t.pax}
              href={`/crear?pax=${t.value}`}
              className={`rounded-3xl p-6 transition hover:-translate-y-1 ${
                i === 1 ? 'bg-primary text-ink' : i === 2 ? 'border border-line bg-board' : 'bg-light-bg text-ink'
              }`}
            >
              <span className="font-mono text-xs tracking-[0.16em]">{t.pax}</span>
              <h3 className="display mt-6 text-4xl">{t.title}</h3>
              <p className={`mt-2 ${i === 2 ? 'text-muted' : 'text-ink/75'}`}>{t.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-app pb-6">
        <div className="card flex flex-col items-start gap-6 overflow-hidden p-7 md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <p className="eyebrow text-secondary">Modo regalo</p>
            <h2 className="display mt-3 text-5xl">Regala un destino que nadie conoce</h2>
            <p className="mt-3 max-w-lg text-muted">Cumpleaños, aniversarios, amor y amistad. Tú pagas, la otra persona recibe las pistas y abre el sobre.</p>
          </div>
          <Link href="/crear?regalo=1" className="btn btn-primary btn-lg shrink-0" onClick={() => track('cta_click', { where: 'home_gift' })}>
            <Icon name="gift" size={20} /> Regalar un viaje
          </Link>
        </div>
      </section>
    </div>
  );
}
