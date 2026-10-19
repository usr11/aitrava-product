import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PaymentResult } from './result';

export const metadata: Metadata = { title: 'Estado del pago' };

export default function ResultadoPage() {
  return (
    <Suspense>
      <PaymentResult />
    </Suspense>
  );
}
