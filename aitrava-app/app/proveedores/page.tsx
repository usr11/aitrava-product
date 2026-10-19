import type { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import { ProviderDisclaimer, ProvidersList } from './list';

export const metadata: Metadata = {
  title: 'Ecosistema de viaje',
  description: 'Servicios y proveedores que pueden formar parte de tu viaje.',
};

export default function ProveedoresPage() {
  return (
    <>
      <PageHeader
        eyebrow="Ecosistema de viaje"
        title="Servicios y proveedores que pueden formar parte de tu viaje"
        text="Aerolíneas, hoteles, restaurantes, experiencias, transporte y seguros: los compres donde los compres, los puedes organizar en AITRAVA."
      >
        <div className="mt-6">
          <ProviderDisclaimer />
        </div>
      </PageHeader>
      <div className="container-app py-10">
        <ProvidersList />
      </div>
    </>
  );
}
