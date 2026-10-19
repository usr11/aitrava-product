import Link from 'next/link';
import { CONTACT, FUTURE_SOCIAL, whatsappLink } from '@/lib/site';
import { Icon } from './Icon';
import { Logo } from './Logo';

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Producto',
    links: [
      { href: '/', label: 'Inicio' },
      { href: '/planear', label: 'Planear viaje' },
      { href: '/mis-viajes', label: 'Mis viajes' },
      { href: '/ayuda#boveda', label: 'Bóveda' },
      { href: '/ayuda#modo-viaje', label: 'Modo Viaje' },
    ],
  },
  {
    title: 'Explora',
    links: [
      { href: '/destinos', label: 'Destinos' },
      { href: '/proveedores', label: 'Proveedores' },
      { href: '/nosotros', label: 'Nosotros' },
      { href: '/contacto', label: 'Contacto' },
      { href: '/ayuda', label: 'Ayuda' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/terminos', label: 'Términos y condiciones' },
      { href: '/privacidad', label: 'Política de privacidad' },
      { href: '/tratamiento-de-datos', label: 'Tratamiento de datos' },
      { href: '/privacidad#cookies', label: 'Cookies' },
    ],
  },
];

function Contact() {
  return (
    <ul className="space-y-3 text-sm">
      <li>
        <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-2 text-white/80 hover:text-white">
          <Icon name="mail" size={18} /> {CONTACT.email}
        </a>
      </li>
      <li>
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white/80 hover:text-white">
          <Icon name="whatsapp" size={18} /> {CONTACT.whatsappDisplay}
        </a>
      </li>
      <li>
        <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white/80 hover:text-white">
          <Icon name="instagram" size={18} /> Instagram
        </a>
      </li>
      {FUTURE_SOCIAL.filter((s) => s.url).map((s) => (
        <li key={s.name}>
          <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white">
            {s.name}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  return (
    <footer className="bg-navy text-white print:hidden">
      <div className="container-app py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div>
            <Logo size={40} light />
            <p className="mt-4 max-w-xs text-white/75">AITRAVA — Tu viaje vive aquí.</p>
            <p className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
              Proyecto universitario en desarrollo
            </p>
          </div>

          {/* Escritorio: columnas */}
          {COLUMNS.map((c) => (
            <div key={c.title} className="hidden lg:block">
              <p className="eyebrow text-yellow">{c.title}</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-white/80 hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="hidden lg:block">
            <p className="eyebrow text-yellow">Contacto</p>
            <div className="mt-4">
              <Contact />
            </div>
          </div>

          {/* Móvil: acordeones (no se pierde ningún enlace legal) */}
          <div className="divide-y divide-white/10 border-y border-white/10 lg:hidden">
            {COLUMNS.map((c) => (
              <details key={c.title} className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between font-semibold">
                  {c.title}
                  <Icon name="chevronDown" size={18} className="transition group-open:rotate-180" />
                </summary>
                <ul className="space-y-1 pb-4">
                  {c.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="block py-2 text-white/80">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
            <div className="py-5">
              <p className="mb-3 font-semibold">Contacto</p>
              <Contact />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} AITRAVA · Proyecto universitario en desarrollo. No es una empresa constituida.</p>
          <p>Fotos de destinos: Wikimedia Commons.</p>
        </div>
      </div>
    </footer>
  );
}
