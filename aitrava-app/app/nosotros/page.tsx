import type { Metadata } from 'next';
import Link from 'next/link';
import { About } from '@/components/landing/About';
import { HOST_WHATSAPP_TEXT } from '@/lib/content';
import { TEAM, whatsappLink } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Quiénes somos',
  description:
    'AITRAVA conecta personas que quieren vivir nuevas experiencias con anfitriones y negocios locales. No necesitas tener el parche antes de hacer el plan.',
};

export default function NosotrosPage() {
  return (
    <div className="wrap space-y-14 py-10 lg:py-14">
      <h1 className="sr-only">Quiénes somos</h1>
      <About full />
      <section aria-labelledby="equipo">
        <h2 id="equipo" className="title text-[1.6rem]">
          El equipo
        </h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((p) => (
            <li key={p.name} className="panel p-5">
              <p className="font-bold">{p.name}</p>
              <p className="text-ink-2">{p.area}</p>
            </li>
          ))}
        </ul>
      </section>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/salidas" className="btn btn-ember">
          Ver las próximas experiencias
        </Link>
        <a href={whatsappLink(HOST_WHATSAPP_TEXT)} target="_blank" rel="noopener noreferrer" className="btn btn-line">
          Quiero ser anfitrión
        </a>
      </div>
    </div>
  );
}
