import type { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import { DestinationsGrid } from './grid';

export const metadata: Metadata = {
  title: 'Destinos',
  description: 'Ideas de destinos en Colombia y el mundo para empezar a planear y ahorrar tu próximo viaje.',
};

export default function DestinosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Inspiración"
        title="¿A dónde quieres ir?"
        text="Elige un destino para empezar tu viaje o deja que te ayudemos a elegir. Es contenido de inspiración: no mostramos precios ni disponibilidad."
      />
      <div className="container-app py-10">
        <DestinationsGrid />
      </div>
    </>
  );
}
