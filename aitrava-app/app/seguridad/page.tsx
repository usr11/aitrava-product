import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { SAFETY } from '@/lib/content';
import { CONTACT, whatsappDisplay } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Seguridad y convivencia',
  description: 'Las reglas de seguridad de AiTrava, la regla de convivencia y el consentimiento informado que aceptas al reservar.',
};

const CONDUCT = [
  'Trato con respeto a todas las personas del grupo, al anfitrión y a la comunidad local.',
  'No hay acoso de ningún tipo: ni comentarios, ni contacto, ni mensajes que la otra persona no quiera.',
  'No llego bajo efectos de alcohol o drogas y no los consumo durante la salida.',
  'Sigo las indicaciones del anfitrión y del equipo, sobre todo en naturaleza y en el agua.',
  'Cuido el lugar: no dejo basura, no saco plantas ni animales y respeto los senderos.',
  'Las fotos de otras personas solo se comparten con su permiso.',
];

const CONSENT = [
  'Entiendo que las salidas pueden incluir caminatas, cambios de clima y actividad física moderada, y declaro que estoy en condiciones de hacerlas.',
  'Informaré al equipo, antes de la salida, cualquier condición de salud, alergia o limitación que deban conocer.',
  'Acepto que el equipo o el anfitrión pueden pedirme que me retire si incumplo la regla de convivencia, sin reembolso.',
  'Sé que en las salidas de naturaleza hay póliza de accidentes por día incluida en el precio.',
];

export default function SeguridadPage() {
  return (
    <>
      <PageHeader title="Seguridad y convivencia" text="Salir con desconocidos pide confianza. Esto es lo que hacemos nosotros y lo que te pedimos a ti." />
      <div className="wrap max-w-4xl py-10 lg:py-14">
        <section aria-labelledby="reglas">
          <h2 id="reglas" className="title text-[1.6rem]">
            Lo que hacemos en cada salida
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2">
            {SAFETY.map((r) => (
              <li key={r.title} className="flex gap-3">
                <Icon name="shield" className="mt-0.5 shrink-0 text-forest" />
                <div>
                  <h3 className="font-bold">{r.title}</h3>
                  <p className="mt-1 text-ink-2">{r.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section id="convivencia" className="mt-14" aria-labelledby="conv">
          <h2 id="conv" className="title text-[1.6rem]">
            Regla de convivencia
          </h2>
          <p className="mt-2 text-ink-2">La aceptas al reservar. Aplica desde el grupo de WhatsApp hasta el final de la salida.</p>
          <ul className="mt-5 space-y-3">
            {CONDUCT.map((c) => (
              <li key={c} className="flex gap-3">
                <Icon name="check" className="mt-0.5 shrink-0 text-forest" /> {c}
              </li>
            ))}
          </ul>
        </section>

        <section id="consentimiento" className="mt-14" aria-labelledby="cons">
          <h2 id="cons" className="title text-[1.6rem]">
            Consentimiento informado
          </h2>
          <ul className="mt-5 space-y-3">
            {CONSENT.map((c) => (
              <li key={c} className="flex gap-3">
                <Icon name="check" className="mt-0.5 shrink-0 text-forest" /> {c}
              </li>
            ))}
          </ul>
        </section>

        <section id="reportar" className="mt-14 rounded-2xl bg-pine p-6 text-paper sm:p-8" aria-labelledby="rep">
          <h2 id="rep" className="title text-[1.6rem]">
            Reportar un incidente
          </h2>
          <p className="mt-2 text-on-pine-2">Si algo te hizo sentir incómodo o inseguro, antes, durante o después de una salida, escríbenos. Lo atendemos el mismo día.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a href={`https://wa.me/${CONTACT.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="btn btn-ember">
              <Icon name="whatsapp" /> {whatsappDisplay()}
            </a>
            <a href={`mailto:${CONTACT.email}?subject=Reporte%20de%20incidente`} className="btn btn-line text-paper">
              <Icon name="mail" /> {CONTACT.email}
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
