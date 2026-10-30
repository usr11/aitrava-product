import type { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import { PlacesByLine } from './places';

export const metadata: Metadata = {
  title: 'Lugares',
  description: 'Naturaleza y cultura en Cali y sus alrededores: urbano, naturaleza cerca y escapadas de un día.',
};

export default function LugaresPage() {
  return (
    <>
      <PageHeader
        title="A dónde vamos"
        text="Catorce lugares en tres líneas. Los precios son de referencia y estimados: el valor final de cada salida se publica cuando cerramos la cotización con el anfitrión."
      />
      <PlacesByLine />
    </>
  );
}
