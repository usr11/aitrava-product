import { PageHeader } from './PageHeader';
import { Alert } from './ui';

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <PageHeader title={title} text={`Última actualización: ${updated}`} />
      <div className="wrap max-w-3xl py-10 lg:py-14">
        <Alert tone="warn">
          <strong>Documento preliminar.</strong> AiTrava es un proyecto universitario y todavía no es una empresa constituida. Este texto es la
          base del prototipo, no es asesoría jurídica y lo debe revisar un abogado antes de operar comercialmente.
        </Alert>
        <div className="legal mt-8 space-y-5 text-ink-2">{children}</div>
      </div>
    </>
  );
}
