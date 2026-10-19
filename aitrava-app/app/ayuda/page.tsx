import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { CONTACT, whatsappLink } from '@/lib/site';

export const metadata: Metadata = { title: 'Ayuda', description: 'Preguntas frecuentes sobre AITRAVA, la Bóveda, el Modo Viaje, el plan de ahorro y el AITRAVA Pass.' };

const FAQ: { id: string; q: string; a: React.ReactNode }[] = [
  {
    id: 'crear',
    q: '¿Cómo creo un viaje?',
    a: (
      <>
        Entra a <Link href="/planear" className="font-semibold text-blue">Planear viaje</Link> y sigue los 5 pasos: destino, fechas, viajeros,
        presupuesto y preferencias. Si no sabes a dónde ir, elige “Ayúdame a elegir” o “Destino sorpresa”.
      </>
    ),
  },
  {
    id: 'ahorro',
    q: '¿Cómo funciona el plan de ahorro?',
    a: 'Le pones una meta (el costo del viaje), cuánto llevas ahorrado y cada cuánto ahorras (semanal, quincenal o mensual). AITRAVA calcula la cuota para que tengas la plata de cada parte del viaje a tiempo: el vuelo suele pagarse unos 60 días antes, el alojamiento unos 30, y así. Tú registras tus aportes y el plan se recalcula.',
  },
  {
    id: 'dinero',
    q: '¿AITRAVA guarda mi dinero?',
    a: 'No. AITRAVA no recibe ni guarda tus ahorros. Ahorras en tu propia cuenta (por ejemplo, en un bolsillo de tu banco) y en AITRAVA llevas el plan y tu avance.',
  },
  {
    id: 'externas',
    q: '¿Puedo agregar reservas externas?',
    a: 'Sí. Ese es el punto: el vuelo que compraste en la aerolínea, el hotel de Booking, el Airbnb, el tour o el seguro. Los agregas a tu viaje con su referencia, fecha y costo.',
  },
  {
    id: 'boveda',
    q: '¿Qué es la Bóveda?',
    a: 'Es el lugar de tu viaje donde guardas tiquetes, reservas, QR y pólizas (PDF o imagen, hasta 5 MB). Los archivos son privados: solo tú los ves con tu sesión. El plan gratis guarda hasta 3 documentos por viaje; con el Pass es ilimitada.',
  },
  {
    id: 'modo-viaje',
    q: '¿Qué es Modo Viaje?',
    a: 'Cuando llega la fecha, Modo Viaje te muestra qué tienes ahora, qué sigue y qué viene después, con acceso rápido a tu reserva, a cómo llegar (te abrimos la ruta en Google Maps) y a lugares cerca de ti. Es parte del AITRAVA Pass.',
  },
  {
    id: 'pass',
    q: '¿Qué incluye AITRAVA Pass?',
    a: 'Es un pago único por viaje (no una suscripción) que activa la Bóveda completa, Modo Viaje, Cómo llegar, Explora cerca y Cambiar mis planes para ese viaje.',
  },
  {
    id: 'pago',
    q: '¿Cómo funciona el pago?',
    a: 'Te llevamos al checkout seguro de Wompi. AITRAVA nunca te pide datos de tarjeta ni claves. Cuando el pago se confirma, el Pass se activa y puedes descargar tu comprobante. El pago corresponde solo al Pass, no a vuelos, hoteles ni otros servicios.',
  },
  {
    id: 'contacto',
    q: '¿Cómo contacto a AITRAVA?',
    a: (
      <>
        Por <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue">WhatsApp</a>, al correo{' '}
        <a href={`mailto:${CONTACT.email}`} className="font-semibold text-blue">{CONTACT.email}</a> o desde{' '}
        <Link href="/contacto" className="font-semibold text-blue">Contacto</Link>.
      </>
    ),
  },
  {
    id: 'eliminar',
    q: '¿Cómo elimino mi cuenta?',
    a: (
      <>
        En <Link href="/mi-cuenta" className="font-semibold text-blue">Mi cuenta</Link> → “Eliminar mi cuenta”. Se borran tus viajes,
        documentos y datos. Si tienes un pago aprobado, escríbenos y conservamos solo el registro contable.
      </>
    ),
  },
];

export default function AyudaPage() {
  return (
    <>
      <PageHeader eyebrow="Ayuda" title="Preguntas frecuentes" />
      <div className="container-app max-w-3xl py-10 lg:py-14">
        <div className="space-y-3">
          {FAQ.map((f) => (
            <details key={f.id} id={f.id} className="card group scroll-mt-24 p-0 open:shadow-[var(--shadow-lift)]">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-bold text-navy">
                {f.q}
                <Icon name="chevronDown" size={20} className="shrink-0 text-text-2 transition group-open:rotate-180" />
              </summary>
              <div className="px-5 pb-5 text-text-2">{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
