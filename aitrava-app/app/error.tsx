'use client';

import Link from 'next/link';
import { Icon } from '@/components/Icon';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-app flex min-h-[60dvh] flex-col items-center justify-center py-16 text-center">
      <span className="grid size-16 place-items-center rounded-3xl bg-bad-bg text-bad">
        <Icon name="alert" size={30} />
      </span>
      <p className="eyebrow mt-6 text-bad">Error 500</p>
      <h1 className="h-display mt-2 text-4xl text-navy">Algo se desvió en el camino</h1>
      <p className="mt-3 max-w-md text-text-2">Tuvimos un problema mostrando esta pantalla. Intenta de nuevo en un momento.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button onClick={reset} className="btn btn-navy">Intentar de nuevo</button>
        <Link href="/" className="btn btn-outline">Ir al inicio</Link>
      </div>
    </div>
  );
}
