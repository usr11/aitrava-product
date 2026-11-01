import Link from 'next/link';
import { ABOUT } from '@/lib/content';

/** Quiénes somos, qué hacemos, diferenciador, misión y visión (texto del equipo). `full` = página /nosotros. */
export function About({ full = false }: { full?: boolean }) {
  return (
    <div className="grid gap-12">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 id="quienes-titulo" className="title text-[1.9rem] sm:text-[2.4rem]">
            ¿Quiénes somos?
          </h2>
          {ABOUT.who.map((p) => (
            <p key={p} className="mt-4 max-w-xl text-[1.05rem] text-ink-2">
              {p}
            </p>
          ))}
        </div>
        <div>
          <p className="display text-[2rem] sm:text-[2.6rem]">{ABOUT.what.title}</p>
          {ABOUT.what.text.map((p) => (
            <p key={p} className="mt-4 max-w-xl text-[1.05rem] text-ink-2">
              {p}
            </p>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-pine p-6 text-paper sm:p-8">
        <h3 className="title text-[1.5rem] sm:text-[1.8rem]">{ABOUT.difference.title}</h3>
        <p className="mt-3 max-w-3xl text-on-pine-2">{ABOUT.difference.text}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="title text-[1.3rem]">Misión</h3>
          <p className="mt-2 text-ink-2">{ABOUT.mission}</p>
        </div>
        <div>
          <h3 className="title text-[1.3rem]">Visión</h3>
          {(full ? ABOUT.vision : ABOUT.vision.slice(0, 1)).map((p) => (
            <p key={p} className="mt-2 text-ink-2">
              {p}
            </p>
          ))}
          {!full && (
            <Link href="/nosotros" className="link mt-3 inline-block">
              Conoce más sobre AITRAVA
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
