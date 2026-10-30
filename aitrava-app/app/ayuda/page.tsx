import type { Metadata } from 'next';
import { Faq } from '@/components/landing/Faq';
import { PageHeader } from '@/components/PageHeader';
import { FAQ } from '@/lib/content';
import { CONTACT, whatsappDisplay, whatsappLink } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Preguntas y reembolsos',
  description: 'Cómo reservar, cómo pagar, qué pasa si cancelas y cómo funcionan las salidas de AiTrava.',
};

const MORE = [
  { q: '¿Tengo que crear una cuenta?', a: 'No. Apartas tu cupo con tu nombre y tu WhatsApp. Te damos un enlace privado para ver tu reserva; guárdalo.' },
  { q: '¿Perdí el enlace de mi reserva?', a: 'Escríbenos por WhatsApp con tu referencia AITRAVA-C y te enviamos uno nuevo. Si reservaste desde este celular, también aparece en la página de la salida.' },
  { q: '¿Cuánto tiempo me guardan el cupo?', a: 'El cupo queda apartado 48 horas (o hasta la salida, si es antes). Si no se confirma el pago en ese tiempo, se libera para otra persona.' },
  { q: '¿Qué pasa si llueve?', a: 'Si el clima hace inseguro el plan, movemos la salida o la cancelamos y te devolvemos el 100 %.' },
  { q: '¿Puedo ir con un amigo?', a: 'Sí. Cada persona aparta su propio cupo. Igual el grupo está pensado para que conozcas gente nueva.' },
];

export default function AyudaPage() {
  return (
    <>
      <PageHeader title="Preguntas y reembolsos" />
      <div className="wrap max-w-3xl py-10 lg:py-14">
        <Faq items={[...FAQ, ...MORE]} />
        <section className="panel mt-12 p-6" aria-labelledby="reembolso">
          <h2 id="reembolso" className="title text-[1.4rem]">
            Política de reembolso
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-2">
            <li>100 % si cancelas con 72 horas o más de anticipación.</li>
            <li>50 % si cancelas entre 72 y 24 horas antes.</li>
            <li>Con menos de 24 horas no hay devolución, pero puedes ceder tu cupo sin costo.</li>
            <li>100 % si la salida no se realiza (por clima, seguridad o porque no se llegó al mínimo de personas).</li>
          </ul>
          <p className="mt-4 text-ink-2">La devolución la hace el anfitrión al mismo medio de pago, con el acompañamiento de AiTrava.</p>
        </section>
        <p className="mt-10 text-ink-2">
          ¿Otra pregunta?{' '}
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="link">
            Escríbenos al {whatsappDisplay()}
          </a>{' '}
          o a{' '}
          <a href={`mailto:${CONTACT.email}`} className="link">
            {CONTACT.email}
          </a>
          .
        </p>
      </div>
    </>
  );
}
