import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetForm } from './form';

export const metadata: Metadata = { title: 'Nueva contraseña', robots: { index: false } };

export default function ResetPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
