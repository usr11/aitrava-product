import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoadingState } from '@/components/ui';
import { Wizard } from './wizard';

export const metadata: Metadata = {
  title: 'Planear viaje',
  description: 'Crea tu viaje en 5 pasos y arma tu plan de ahorro hasta la fecha de salida.',
};

export default function PlanearPage() {
  return (
    <Suspense
      fallback={
        <div className="container-app py-10">
          <LoadingState label="Cargando…" />
        </div>
      }
    >
      <Wizard />
    </Suspense>
  );
}
