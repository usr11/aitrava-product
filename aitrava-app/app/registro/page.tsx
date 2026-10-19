import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RegisterForm } from './form';

export const metadata: Metadata = { title: 'Crear cuenta' };

export default function RegistroPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
