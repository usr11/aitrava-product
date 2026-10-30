import type { Metadata } from 'next';
import { Upcoming } from '@/components/landing/Upcoming';
import { PageHeader } from '@/components/PageHeader';
import { WaitlistForm } from '@/components/salidas/WaitlistForm';

export const metadata: Metadata = {
  title: 'Próximas salidas',
  description: 'Salidas en grupos de 6 a 10 personas a la naturaleza y la cultura de Cali, con cupos en vivo.',
};

export default function SalidasPage() {
  return (
    <>
      <PageHeader title="Próximas salidas" text="Grupos pequeños, un anfitrión local y alguien del equipo contigo. Apartas tu cupo sin crear cuenta." />
      <div className="wrap py-10 lg:py-14">
        <Upcoming />
      </div>
      <section id="lista" className="border-t border-line bg-card" aria-labelledby="lista-titulo">
        <div className="wrap grid gap-8 py-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 id="lista-titulo" className="title text-[1.8rem]">
              ¿Ninguna fecha te sirve?
            </h2>
            <p className="mt-3 text-ink-2">Te avisamos por WhatsApp cuando abramos la próxima.</p>
          </div>
          <WaitlistForm />
        </div>
      </section>
    </>
  );
}
