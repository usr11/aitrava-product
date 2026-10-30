import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { TEAM } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Quiénes somos',
  description: 'AiTrava es un proyecto de cuatro estudiantes en Cali que arma salidas en grupo para gente que no tiene con quién ir.',
};

export default function NosotrosPage() {
  return (
    <>
      <PageHeader title="Quiénes somos" text="Cuatro estudiantes en Cali probando una idea simple: que no tener con quién ir no sea la razón para quedarse en casa." />
      <div className="wrap max-w-3xl space-y-12 py-10 lg:py-14">
        <section className="space-y-4 text-[1.05rem] text-ink-2">
          <p>
            Empezamos haciendo un planificador de viajes con inteligencia artificial. Nos dimos cuenta de que eso ya lo hace cualquier chat gratis, y de que
            el problema real era otro: mucha gente quiere salir el fin de semana, pero sus amigos cancelan, no sabe qué hay cerca y le da pereza organizar
            con desconocidos.
          </p>
          <p>
            Por eso AiTrava arma el grupo. Elegimos el lugar con un anfitrión local, juntamos a personas con la misma intención y ponemos un ritual para que
            la conversación arranque. Tú solo tienes que llegar.
          </p>
          <p>
            Estamos en etapa de prueba: las primeras salidas las coordinamos a mano por WhatsApp y vamos ajustando con lo que nos dicen quienes vienen. No
            somos todavía una empresa constituida y no recibimos el dinero de las salidas: le pagas directo al anfitrión.
          </p>
        </section>
        <section aria-labelledby="equipo">
          <h2 id="equipo" className="title text-[1.6rem]">
            El equipo
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {TEAM.map((p) => (
              <li key={p.name} className="panel p-5">
                <p className="font-bold">{p.name}</p>
                <p className="text-ink-2">{p.area}</p>
              </li>
            ))}
          </ul>
        </section>
        <Link href="/salidas" className="btn btn-ember">
          Ver las próximas salidas
        </Link>
      </div>
    </>
  );
}
