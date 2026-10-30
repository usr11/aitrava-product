'use client';

import Link from 'next/link';
import { Icon } from '@/components/Icon';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="wrap flex min-h-[60dvh] flex-col items-start justify-center py-16">
      <span className="grid size-14 place-items-center rounded-full bg-flare-bg text-flare-ink">
        <Icon name="alert" size={28} />
      </span>
      <h1 className="display mt-6 text-[2.4rem]">No pudimos mostrar esta pantalla</h1>
      <p className="lede mt-3 text-ink-2">Puede ser la conexión. Intenta de nuevo; si sigue pasando, escríbenos por WhatsApp.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button onClick={reset} className="btn btn-pine">
          Intentar de nuevo
        </button>
        <Link href="/" className="btn btn-line">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
