'use client';

import { AdminTitle, ExportButton, Table, prettyPhone, waLink } from '@/components/admin/kit';
import { ErrorState, LoadingState } from '@/components/ui';
import { LINES } from '@/lib/config';
import { formatDateTime } from '@/lib/format';
import type { Line } from '@/lib/types';
import { useApi } from '@/lib/useSalidas';

type Entry = { id: string; name: string; phone: string; line: Line | null; motivation: string | null; variant: string | null; channel: string | null; createdAt: string };

export default function Espera() {
  const { data, error, loading, reload } = useApi<Entry[]>('/admin/waitlist');
  const byLine = (l: Line) => data?.filter((e) => e.line === l).length ?? 0;
  return (
    <>
      <AdminTitle
        title="Lista de espera"
        text={`Interés (nivel 2 de la escalera). ${data ? `${data.length} personas · ${(Object.keys(LINES) as Line[]).map((l) => `${LINES[l].label}: ${byLine(l)}`).join(' · ')}` : ''}`}
        action={<ExportButton path="/admin/export/espera.csv" file="aitrava-lista-de-espera.csv" />}
      />
      {loading && !data && <LoadingState />}
      {error && <ErrorState text={error} onRetry={reload} />}
      {data && (
        <Table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>WhatsApp</th>
              <th>Línea</th>
              <th>Variante / canal</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {data.map((e) => (
              <tr key={e.id}>
                <td className="font-semibold">{e.name}</td>
                <td>
                  <a className="link tnum" target="_blank" rel="noopener noreferrer" href={waLink(e.phone, `Hola ${e.name.split(' ')[0]}, te escribimos de AiTrava: abrimos una salida que te puede interesar.`)}>
                    {prettyPhone(e.phone)}
                  </a>
                </td>
                <td>{e.line ? LINES[e.line].label : '—'}</td>
                <td>
                  {e.variant ?? '—'} / {e.channel ?? '—'}
                </td>
                <td className="text-ink-3">{formatDateTime(e.createdAt)}</td>
              </tr>
            ))}
            {!data.length && (
              <tr>
                <td colSpan={5} className="text-ink-3">
                  Nadie en la lista todavía.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </>
  );
}
