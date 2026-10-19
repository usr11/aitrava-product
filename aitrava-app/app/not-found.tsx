import Link from 'next/link';
import { Icon } from '@/components/Icon';

export default function NotFound() {
  return (
    <div className="container-app flex min-h-[60dvh] flex-col items-center justify-center py-16 text-center">
      <span className="grid size-16 place-items-center rounded-3xl bg-sky text-blue">
        <Icon name="compass" size={30} />
      </span>
      <p className="eyebrow mt-6 text-blue">Error 404</p>
      <h1 className="h-display mt-2 text-4xl text-navy">Esta ruta no está en el mapa</h1>
      <p className="mt-3 max-w-md text-text-2">La página que buscas no existe o cambió de lugar.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn btn-navy">Volver al inicio</Link>
        <Link href="/mis-viajes" className="btn btn-outline">Mis viajes</Link>
      </div>
    </div>
  );
}
