import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { Faq } from '@/components/landing/Faq';
import { Hero } from '@/components/landing/Hero';
import { LinesPreview } from '@/components/landing/LinesPreview';
import { Upcoming } from '@/components/landing/Upcoming';
import { WaitlistForm } from '@/components/salidas/WaitlistForm';
import { SectionHeading } from '@/components/ui';
import { FAQ, SAFETY } from '@/lib/content';

/** Lo que pasa desde que apartas hasta que sales con gente nueva (sí es una secuencia: va numerada). */
const STEPS = [
  { title: 'Apartas tu cupo en un minuto', text: 'Eliges la salida y respondes cuatro preguntas. Sin crear cuenta. Tu cupo queda apartado 48 horas.' },
  { title: 'Te escribimos por WhatsApp', text: 'Confirmamos tu cupo y te pasamos los datos del anfitrión. Le pagas directo a él con tu referencia.' },
  { title: 'Conoces al grupo el día antes', text: 'Te agregamos a un grupo de WhatsApp con los demás asistentes, moderado por nosotros.' },
  { title: 'Llegas solo, sales acompañado', text: 'Tarjetas para romper el hielo, la experiencia con el anfitrión y, si quieres, el reto del celular.' },
];

export default function Home() {
  return (
    <>
      <Hero />

      <section className="wrap py-16 lg:py-24" aria-labelledby="salidas-titulo">
        <SectionHeading id="salidas-titulo" title="Próximas salidas" text="Grupos de 6 a 10 personas. Los puntos son los cupos: cada uno es alguien que también va solo." />
        <div className="mt-8">
          <Upcoming limit={6} />
        </div>
      </section>

      <section className="border-y border-line bg-card" aria-labelledby="como-titulo">
        <div className="wrap py-16 lg:py-24">
          <SectionHeading id="como-titulo" title="Cómo funciona" />
          <ol className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative">
                <span className="display tnum text-[3.2rem] text-ember">{i + 1}</span>
                <h3 className="title mt-2 text-[1.25rem]">{s.title}</h3>
                <p className="mt-2 text-ink-2">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-pine text-paper" aria-labelledby="ritual-titulo">
        <div className="wrap grid gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div>
            <h2 id="ritual-titulo" className="title text-[1.9rem] sm:text-[2.4rem]">
              No pagas por la caminata. Pagas por el grupo.
            </h2>
            <p className="mt-4 max-w-xl text-[1.05rem] text-on-pine-2">
              Una caminata la puedes contratar con cualquier guía. Lo que no consigues solo es un grupo curado de personas con la misma intención,
              y un momento que las conecte.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-pine-3 bg-pine-2 p-6">
              <Icon name="message" size={28} className="text-ember" />
              <h3 className="title mt-4 text-[1.25rem]">Tarjetas rompehielos</h3>
              <p className="mt-2 text-on-pine-2">Preguntas para los primeros 20 minutos. Nadie tiene que inventarse de qué hablar.</p>
            </div>
            <div className="rounded-2xl border border-pine-3 bg-pine-2 p-6">
              <Icon name="mail" size={28} className="text-ember" />
              <h3 className="title mt-4 text-[1.25rem]">El sobre sellado</h3>
              <p className="mt-2 text-on-pine-2">Reto voluntario: el celular va en un sobre durante la actividad. Al final, una sola foto del grupo.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap py-16 lg:py-24" aria-labelledby="lugares-titulo">
        <SectionHeading
          id="lugares-titulo"
          title="A dónde vamos"
          text="Naturaleza y cultura en Cali y sus alrededores, en tres líneas. Los precios son de referencia mientras cerramos cotizaciones con cada anfitrión."
        />
        <div className="mt-8">
          <LinesPreview />
        </div>
      </section>

      <section className="border-y border-line bg-card" aria-labelledby="seguridad-titulo">
        <div className="wrap grid gap-10 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:py-24">
          <div>
            <SectionHeading id="seguridad-titulo" title="Reglas que no negociamos" text="Salir con desconocidos pide confianza. Estas reglas aplican en todas las salidas." />
            <Link href="/seguridad" className="btn btn-line mt-6">
              Leer la regla de convivencia
            </Link>
          </div>
          <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {SAFETY.map((r) => (
              <li key={r.title} className="flex gap-3">
                <Icon name="shield" className="mt-0.5 shrink-0 text-forest" />
                <div>
                  <h3 className="font-bold">{r.title}</h3>
                  <p className="mt-1 text-[0.95rem] text-ink-2">{r.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="wrap py-16 lg:py-24" aria-labelledby="faq-titulo">
        <SectionHeading id="faq-titulo" title="Preguntas" />
        <div className="mt-8">
          <Faq items={FAQ} />
        </div>
      </section>

      <section id="lista" className="bg-pine text-paper" aria-labelledby="lista-titulo">
        <div className="wrap grid gap-10 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:py-24">
          <div>
            <h2 id="lista-titulo" className="title text-[1.9rem] sm:text-[2.4rem]">
              ¿Ninguna fecha te sirve?
            </h2>
            <p className="mt-4 max-w-md text-[1.05rem] text-on-pine-2">Déjanos tu WhatsApp y te avisamos cuando abramos la próxima salida del tipo que prefieras.</p>
          </div>
          <WaitlistForm onPine />
        </div>
      </section>

      <section className="wrap flex flex-col items-start justify-between gap-6 py-14 sm:flex-row sm:items-center">
        <div>
          <h2 className="title text-[1.5rem]">¿Eres guía o anfitrión en Cali?</h2>
          <p className="mt-1 text-ink-2">Te llevamos grupos nuevos. Solo pagas comisión por las reservas que te traemos.</p>
        </div>
        <Link href="/anfitriones" className="btn btn-pine shrink-0">
          Quiero ser anfitrión
        </Link>
      </section>
    </>
  );
}
