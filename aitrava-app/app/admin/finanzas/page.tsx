'use client';

import { useState } from 'react';
import { RevenueChart } from '@/components/admin/charts';
import { AdminTitle, ExportButton, MetricCard, RangePicker, rangeQuery, useAdminData, useRange } from '@/components/admin/common';
import { Alert, ErrorState, Field, LoadingState, MoneyInput } from '@/components/ui';
import { api } from '@/lib/api';
import { formatCOP, formatDate, todayISO } from '@/lib/format';

type Cost = { id: string; category: string; kind: string; amount: number; description: string | null; date: string };
type F = {
  revenue: number; sales: number; avgTicket: number; pendingCount: number; pendingAmount: number; declinedCount: number;
  variableCosts: number; fixedCosts: number; contributionMargin: number; operatingResult: number; costs: Cost[];
  monthly: { month: string; revenue: number; sales: number }[];
};
const CATS = [['pasarela', 'Pasarela'], ['tecnologia', 'Tecnología'], ['hosting', 'Hosting'], ['herramientas', 'Herramientas'], ['marketing', 'Marketing'], ['operacion', 'Operación'], ['otros', 'Otros']];

export default function FinanzasPage() {
  const { range, setRange } = useRange('mes');
  const { data, error, reload } = useAdminData<F>(`/admin/finance${rangeQuery(range)}`);
  const [c, setC] = useState({ category: 'pasarela', kind: 'variable', amount: null as number | null, description: '', date: todayISO() });
  const [err, setErr] = useState('');

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    try {
      await api('/admin/costs', { json: { ...c, date: `${c.date}T12:00:00.000Z`, description: c.description || undefined } });
      setC({ ...c, amount: null, description: '' });
      reload();
    } catch (x) {
      setErr((x as Error).message);
    }
  };

  return (
    <>
      <AdminTitle title="Finanzas" text="Ingreso = solo AITRAVA Pass aprobados. El presupuesto de los viajes nunca es ingreso." action={<ExportButton entity="finanzas" label="Exportar costos" />} />
      <RangePicker range={range} onChange={setRange} />
      {error ? <ErrorState text={error} onRetry={reload} /> : !data ? <LoadingState label="Cargando…" /> : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <MetricCard label="Ingresos confirmados" value={formatCOP(data.revenue)} />
            <MetricCard label="Número de ventas" value={data.sales} />
            <MetricCard label="Ticket promedio" value={formatCOP(data.avgTicket)} />
            <MetricCard label="Pagos pendientes" value={data.pendingCount} hint={formatCOP(data.pendingAmount)} />
            <MetricCard label="Pagos rechazados" value={data.declinedCount} />
          </div>
          <section className="card p-5">
            <h2 className="font-extrabold text-navy">Margen</h2>
            <dl className="mt-3 divide-y divide-line text-sm">
              {[
                ['Ingresos', data.revenue],
                ['− Costos variables', -data.variableCosts],
                ['= Margen de contribución', data.contributionMargin],
                ['− Costos fijos', -data.fixedCosts],
                ['= Resultado operativo estimado', data.operatingResult],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between py-2.5">
                  <dt className={String(k).startsWith('=') ? 'font-bold text-navy' : 'text-text-2'}>{k}</dt>
                  <dd className={`num font-semibold ${Number(v) < 0 ? 'text-bad' : 'text-navy'}`}>{formatCOP(Number(v))}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="card p-5">
            <h2 className="mb-4 font-extrabold text-navy">Ingresos por mes</h2>
            <RevenueChart data={data.monthly} />
          </section>
          <section className="card p-5">
            <h2 className="font-extrabold text-navy">Registrar costo</h2>
            <form onSubmit={add} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Field label="Categoría" htmlFor="c-cat">
                <select id="c-cat" className="input" value={c.category} onChange={(e) => setC({ ...c, category: e.target.value })}>
                  {CATS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </Field>
              <Field label="Tipo" htmlFor="c-kind">
                <select id="c-kind" className="input" value={c.kind} onChange={(e) => setC({ ...c, kind: e.target.value })}>
                  <option value="variable">Variable</option>
                  <option value="fijo">Fijo</option>
                </select>
              </Field>
              <Field label="Valor" htmlFor="c-amount"><MoneyInput id="c-amount" value={c.amount} onChange={(v) => setC({ ...c, amount: v })} required /></Field>
              <Field label="Fecha" htmlFor="c-date"><input id="c-date" type="date" className="input" value={c.date} onChange={(e) => setC({ ...c, date: e.target.value })} /></Field>
              <Field label="Descripción" htmlFor="c-desc"><input id="c-desc" className="input" value={c.description} onChange={(e) => setC({ ...c, description: e.target.value })} /></Field>
              <button className="btn btn-navy sm:col-span-2 lg:col-span-5" disabled={!c.amount}>Agregar costo</button>
            </form>
            {err && <div className="mt-3"><Alert tone="bad">{err}</Alert></div>}
            <ul className="mt-5 divide-y divide-line text-sm">
              {data.costs.map((x) => (
                <li key={x.id} className="flex items-center gap-3 py-2.5">
                  <span className="flex-1 text-navy">{CATS.find((k) => k[0] === x.category)?.[1]} · {x.kind}{x.description ? ` · ${x.description}` : ''}</span>
                  <span className="text-text-2">{formatDate(x.date)}</span>
                  <span className="num font-semibold text-navy">{formatCOP(x.amount)}</span>
                  <button className="btn btn-ghost btn-sm text-bad" onClick={() => confirm('¿Eliminar este costo?') && api(`/admin/costs/${x.id}`, { method: 'DELETE' }).then(reload)}>Eliminar</button>
                </li>
              ))}
              {!data.costs.length && <li className="py-3 text-text-3">Sin costos registrados en este rango.</li>}
            </ul>
          </section>
        </div>
      )}
    </>
  );
}
