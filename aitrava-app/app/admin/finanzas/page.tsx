'use client';

import Link from 'next/link';
import { AdminTitle, Metric, Table } from '@/components/admin/kit';
import { Alert, ErrorState, LoadingState } from '@/components/ui';
import { formatCOP, formatPct } from '@/lib/format';
import { useApi } from '@/lib/useSalidas';

type Finance = {
  paidBookings: number;
  gmv: number;
  commissionAccrued: number;
  commissionCollected: number;
  costs: Record<'pauta' | 'kit' | 'horas' | 'fijos' | 'formalizacion' | 'otros' | 'variable' | 'fixed' | 'total', number>;
  result: number;
  unit: {
    ticket: number | null;
    commissionPerBooking: number | null;
    cac: number | null;
    contribution: number | null;
    repurchaseRate: number | null;
    avgCoordinatorHours: number | null;
  };
  byMonth: { month: string; bookings: number; gmv: number; commission: number; costs: number }[];
  note: string;
};

const money = (v: number | null) => (v == null ? '—' : formatCOP(v));
const MONTH = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export default function Finanzas() {
  const { data: f, error, loading, reload } = useApi<Finance>('/admin/finance');
  return (
    <>
      <AdminTitle
        title="Finanzas reales"
        text="Con los datos de campo, no con supuestos. El valor reservado es del anfitrión; el ingreso de AiTrava es la comisión."
        action={
          <Link href="/admin/modelo" className="btn btn-line btn-sm">
            Comparar con el modelo
          </Link>
        }
      />
      {loading && !f && <LoadingState />}
      {error && <ErrorState text={error} onRetry={reload} />}
      {f && (
        <>
          <Alert>{f.note}</Alert>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Reservas pagadas" value={String(f.paidBookings)} />
            <Metric label="Valor reservado (del anfitrión)" value={formatCOP(f.gmv)} />
            <Metric label="Comisión causada" value={formatCOP(f.commissionAccrued)} hint={`Cobrada: ${formatCOP(f.commissionCollected)}`} />
            <Metric label="Resultado (comisión − costos)" value={formatCOP(f.result)} ok={f.paidBookings ? f.result >= 0 : null} target="≥ $0" />
          </div>

          <h2 className="title mt-10 text-[1.4rem]">Unidad económica real (por reserva)</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Metric label="Ticket promedio" value={money(f.unit.ticket)} hint="Modelo: $104.000" />
            <Metric label="Comisión por reserva" value={money(f.unit.commissionPerBooking)} hint="Modelo: $20.800" />
            <Metric label="CAC" value={money(f.unit.cac)} target="≤ $10.400" ok={f.unit.cac == null ? null : f.unit.cac <= 10_400} />
            <Metric label="Contribución (comisión − pauta − kit − horas)" value={money(f.unit.contribution)} target="≥ $0" ok={f.unit.contribution == null ? null : f.unit.contribution >= 0} />
            <Metric label="Recompra (personas con 2+ reservas)" value={formatPct(f.unit.repurchaseRate)} target="≥ 25 %" ok={f.unit.repurchaseRate == null ? null : f.unit.repurchaseRate >= 0.25} />
            <Metric
              label="Horas del equipo por salida"
              value={f.unit.avgCoordinatorHours == null ? '—' : `${f.unit.avgCoordinatorHours.toLocaleString('es-CO', { maximumFractionDigits: 1 })} h`}
              target="≤ 3 h"
              ok={f.unit.avgCoordinatorHours == null ? null : f.unit.avgCoordinatorHours <= 3}
            />
          </div>

          <h2 className="title mt-10 text-[1.4rem]">Costos</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {(['pauta', 'kit', 'horas', 'fijos', 'formalizacion', 'otros'] as const).map((k) => (
              <Metric key={k} label={k[0].toUpperCase() + k.slice(1)} value={formatCOP(f.costs[k])} />
            ))}
          </div>

          <h2 className="title mt-10 text-[1.4rem]">Por mes</h2>
          <div className="mt-4">
            {f.byMonth.length ? (
              <Table>
                <thead>
                  <tr>
                    <th>Mes</th>
                    <th className="text-right">Reservas</th>
                    <th className="text-right">Valor reservado</th>
                    <th className="text-right">Comisión</th>
                    <th className="text-right">Costos</th>
                    <th className="text-right">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {f.byMonth.map((m) => (
                    <tr key={m.month}>
                      <td>{MONTH.format(new Date(`${m.month}-15T00:00:00Z`))}</td>
                      <td className="tnum text-right">{m.bookings}</td>
                      <td className="tnum text-right">{formatCOP(m.gmv)}</td>
                      <td className="tnum text-right">{formatCOP(m.commission)}</td>
                      <td className="tnum text-right">{formatCOP(m.costs)}</td>
                      <td className={`tnum text-right font-semibold ${m.commission - m.costs < 0 ? 'text-flare-ink' : 'text-forest'}`}>{formatCOP(m.commission - m.costs)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-ink-3">Sin datos suficientes.</p>
            )}
          </div>
        </>
      )}
    </>
  );
}
