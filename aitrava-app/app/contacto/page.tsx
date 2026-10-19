import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { CONTACT, whatsappLink } from '@/lib/site';
import { ContactForm } from './form';

export const metadata: Metadata = { title: 'Contacto', description: 'Escríbenos por WhatsApp, correo o Instagram.' };

export default function ContactoPage() {
  const channels = [
    { icon: 'whatsapp' as const, label: 'WhatsApp', value: CONTACT.whatsappDisplay, href: whatsappLink() },
    { icon: 'mail' as const, label: 'Correo', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { icon: 'instagram' as const, label: 'Instagram', value: '@aitrava26', href: CONTACT.instagram },
  ];
  return (
    <>
      <PageHeader eyebrow="Contacto" title="Hablemos" text="Respondemos lo antes posible. Somos un equipo pequeño y leemos todo." />
      <div className="container-app grid gap-8 py-10 lg:grid-cols-[1fr_1.2fr] lg:py-14">
        <ul className="space-y-3">
          {channels.map((c) => (
            <li key={c.label}>
              <a href={c.href} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-4 p-5 transition hover:shadow-[var(--shadow-lift)]">
                <span className="grid size-12 place-items-center rounded-2xl bg-sky text-blue">
                  <Icon name={c.icon} />
                </span>
                <span>
                  <span className="block text-sm text-text-2">{c.label}</span>
                  <span className="block font-bold text-navy">{c.value}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <ContactForm />
      </div>
    </>
  );
}
