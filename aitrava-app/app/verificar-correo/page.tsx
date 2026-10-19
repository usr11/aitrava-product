import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyEmail } from './verify';

export const metadata: Metadata = { title: 'Verifica tu correo', robots: { index: false } };

export default function VerificarPage() {
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}
