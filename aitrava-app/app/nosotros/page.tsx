import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { CONTACT, TEAM } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Nosotros',
  description: 'AITRAVA es un proyecto universitario en desarrollo que convierte cada viaje en un espacio digital.',
};

export default function NosotrosPage() {
  return (
    <>
      <PageHeader eyebrow="Nosotros" title="Un proyecto universitario en desarrollo" text="Somos un equipo interdisciplinario que quiere que tu viaje deje de estar regado en diez aplicaciones." />
      <div className="container-app grid gap-10 py-12 lg:grid-cols-[1.2fr_1fr] lg:py-16">
        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-extrabold text-navy">Nuestra historia</h2>
            <p className="mt-3 text-lg text-text-2">
              AITRAVA nace como un proyecto universitario a partir de una pregunta: ¿por qué la experiencia de un viaje sigue fragmentada entre
              tantas plataformas, documentos y servicios?
            </p>
            <p className="mt-3 text-lg text-text-2">
              El proyecto comenzó explorando nuevas formas de simplificar la planeación de viajes y evolucionó hacia una visión más amplia:
              convertir cada viaje en un espacio digital donde el viajero pueda organizar, centralizar y consultar lo que necesita antes y durante
              su experiencia, empezando por ahorrar para él.
            </p>
          </section>
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="card p-6">
              <Icon name="target" className="text-blue" />
              <h3 className="mt-3 font-extrabold text-navy">Misión</h3>
              <p className="mt-2 text-text-2">
                Simplificar la experiencia de viajar centralizando la información, decisiones y herramientas que una persona necesita antes y
                durante su viaje en un solo espacio digital.
              </p>
            </div>
            <div className="card p-6">
              <Icon name="compass" className="text-blue" />
              <h3 className="mt-3 font-extrabold text-navy">Visión</h3>
              <p className="mt-2 text-text-2">
                Construir una plataforma capaz de acompañar al viajero durante todo el ciclo de su viaje, conectando planificación, organización,
                información y servicios en una experiencia simple y personalizada.
              </p>
            </div>
          </section>
          <section className="rounded-[28px] bg-navy p-6 text-white sm:p-8">
            <h2 className="text-2xl font-extrabold">¿Qué queremos hacer diferente?</h2>
            <p className="mt-3 text-white/85">
              AITRAVA no busca diferenciarse simplemente por ofrecer vuelos, hoteles o actividades. Busca conectar los distintos elementos de un
              viaje alrededor del viajero.
            </p>
            <p className="mt-3 text-white/85">
              Incluso cuando una reserva fue realizada fuera de AITRAVA, el usuario puede incorporarla a su viaje y mantener su experiencia
              organizada en un mismo espacio.
            </p>
          </section>
        </div>
        <aside>
          <h2 className="text-2xl font-extrabold text-navy">Equipo fundador</h2>
          <p className="mt-2 text-text-2">Equipo interdisciplinario del proyecto universitario.</p>
          <ul className="mt-6 space-y-3">
            {TEAM.map((m) => (
              <li key={m.name} className="card flex items-center gap-4 p-4">
                <span className="grid size-12 place-items-center rounded-full bg-yellow font-extrabold text-navy" aria-hidden>
                  {m.name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')}
                </span>
                <div>
                  <p className="font-bold text-navy">{m.name}</p>
                  <p className="text-sm text-text-2">{m.area}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="card-flat mt-6 p-5">
            <p className="font-bold text-navy">Síguenos</p>
            <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 font-semibold text-blue">
              <Icon name="instagram" size={18} /> @aitrava26
            </a>
            <Link href="/contacto" className="btn btn-outline btn-sm mt-4 w-full">
              Escríbenos
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
