import { PageHeader } from './PageHeader';
import { Alert } from './ui';

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <PageHeader eyebrow="Legal" title={title} text={`Última actualización: ${updated}`} />
      <div className="container-app max-w-3xl py-10 lg:py-14">
        <Alert tone="warn">
          <strong>Documento preliminar.</strong> AITRAVA es un proyecto universitario en desarrollo y no es una empresa legalmente constituida.
          Este texto es una base para el prototipo (PMV), no constituye asesoría jurídica y debe ser revisado por un abogado antes de cualquier
          operación comercial pública.
        </Alert>
        <div className="legal mt-8 space-y-6 text-text-2 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-navy [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-navy">
          {children}
        </div>
      </div>
    </>
  );
}
