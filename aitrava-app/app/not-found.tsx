import Link from 'next/link';
import { Mark } from '@/components/Logo';

export default function NotFound() {
  return (
    <div className="wrap flex min-h-[60dvh] flex-col items-start justify-center py-16">
      <Mark size={56} />
      <h1 className="display mt-6 text-[2.6rem] sm:text-[3.4rem]">Este sendero no existe</h1>
      <p className="lede mt-3 text-ink-2">La página que buscas se movió o el enlace está incompleto.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/salidas" className="btn btn-ember">
          Ver las próximas salidas
        </Link>
        <Link href="/" className="btn btn-line">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
