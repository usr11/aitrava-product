'use client';

import { DailyChart, FunnelChart } from '@/components/admin/charts';
import { AdminTitle, DAILY_SERIES, ExportButton, RangePicker, rangeQuery, useAdminData, useRange, type Metrics } from '@/components/admin/common';
import { ErrorState, LoadingState } from '@/components/ui';

export default function AnalyticsPage() {
  const { range, setRange } = useRange();
  const { data, error, reload } = useAdminData<Metrics>(`/admin/metrics${rangeQuery(range)}`);
  return (
    <>
      <AdminTitle title="Analítica" text="Eventos propios (sin datos sensibles). Excluye DEMO y equipo." action={<ExportButton entity="analytics" label="Exportar eventos" />} />
      <RangePicker range={range} onChange={setRange} />
      {error ? (
        <ErrorState text={error} onRetry={reload} />
      ) : !data ? (
        <LoadingState label="Cargando…" />
      ) : (
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-4 font-extrabold text-navy">Embudo y conversión por etapa</h2>
            <FunnelChart data={data.funnel} />
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="text-text-2">
                  <tr>
                    <th className="py-2">Etapa</th>
                    <th className="py-2 text-right">Personas</th>
                    <th className="py-2 text-right">% del anterior</th>
                    <th className="py-2 text-right">% del total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.funnel.map((f) => (
                    <tr key={f.key}>
                      <td className="py-2 font-semibold text-navy">{f.label}</td>
                      <td className="num py-2 text-right">{f.value}</td>
                      <td className="num py-2 text-right">{f.fromPrevious} %</td>
                      <td className="num py-2 text-right">{f.fromStart} %</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="card p-5">
            <h2 className="mb-4 font-extrabold text-navy">Serie diaria</h2>
            <DailyChart data={data.daily} series={DAILY_SERIES} />
          </section>
          <section className="card p-5">
            <h2 className="mb-4 font-extrabold text-navy">Eventos</h2>
            {!data.events.length ? (
              <p className="text-sm text-text-3">Sin datos suficientes.</p>
            ) : (
              <ul className="divide-y divide-line text-sm">
                {data.events.map((e) => (
                  <li key={e.name} className="flex justify-between gap-3 py-2">
                    <code className="text-navy">{e.name}</code>
                    <span className="num text-text-2">
                      {e.total} veces · {e.people} personas
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}
