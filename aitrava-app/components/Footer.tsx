import Link from 'next/link';
import { CONTACT, whatsappDisplay } from '@/lib/site';
import { Icon } from './Icon';
import { Logo } from './Logo';

const COLS = [
  {
    title: 'Salir con AiTrava',
    links: [
      { href: '/salidas', label: 'Próximas salidas' },
      { href: '/lugares', label: 'Lugares' },
      { href: '/seguridad', label: 'Seguridad y convivencia' },
      { href: '/ayuda', label: 'Preguntas y reembolsos' },
    ],
  },
  {
    title: 'AiTrava',
    links: [
      { href: '/nosotros', label: 'Quiénes somos' },
      { href: '/anfitriones', label: 'Soy anfitrión o guía' },
      { href: '/equipo/ingresar', label: 'Acceso del equipo' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/terminos', label: 'Términos y condiciones' },
      { href: '/privacidad', label: 'Política de privacidad' },
      { href: '/tratamiento-de-datos', label: 'Tratamiento de datos' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-pine pb-[calc(var(--safe-bottom)+88px)] text-on-pine lg:pb-0">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo tone="paper" />
          <p className="mt-4 max-w-xs text-on-pine-2">Salidas en grupos pequeños a la naturaleza y la cultura de Cali. Ve solo, sal acompañado.</p>
          <div className="mt-5 flex flex-col gap-2 text-[0.95rem]">
            <a href={`https://wa.me/${CONTACT.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-ember">
              <Icon name="whatsapp" size={18} /> {whatsappDisplay()}
            </a>
            <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-ember">
              <Icon name="instagram" size={18} /> Instagram
            </a>
            <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-2 hover:text-ember">
              <Icon name="mail" size={18} /> {CONTACT.email}
            </a>
          </div>
        </div>
        {COLS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="font-bold text-paper">{c.title}</h2>
            <ul className="mt-3 space-y-2.5 text-on-pine-2">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-paper hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-pine-3">
        <p className="wrap py-5 text-sm text-on-pine-2">
          Proyecto universitario en Cali, en etapa de prueba.
        </p>
      </div>
    </footer>
  );
}
