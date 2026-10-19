'use client';

import { DailyChart, FunnelChart } from '@/components/admin/charts';
import { AdminTitle, DAILY_SERIES, MetricCard, RangePicker, rangeQuery, useAdminData, useRange, type Metrics } from '@/components/admin/common';
import { ErrorState, LoadingState } from '@/components/ui';
import { formatCOP } from '@/lib/format';

export default function AdminDashboard() {
  const { range, setRange } = useRange();
  const { data, error, reload } = useAdminData<Metrics>(`/admin/metrics${rangeQuery(range)}`);
  const k = data?.kpis;
  return (
    <>
      <AdminTitle title="Dashboard" text="Datos reales. No incluye cuentas DEMO ni del equipo." />
      <RangePicker range={range} onChange={setRange} />
      {error ? (
        <ErrorState text={error} onRetry={reload} />
      ) : !k ? (
        <LoadingState label="Cargando métricas…" />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard label="Ingresos confirmados" value={formatCOP(k.revenue)} icon="wallet" />
            <MetricCard label="Pagos aprobados" value={k.paymentsApproved} icon="card" />
            <MetricCard label="Usuarios registrados" value={k.users} icon="users" />
            <MetricCard label="Viajes creados" value={k.trips} icon="plane" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <MetricCard label="Visitas" value={k.visits} />
            <MetricCard label="Visitantes únicos" value={k.uniqueVisitors} />
            <MetricCard label="Correos verificados" value={k.verified} />
            <MetricCard label="Planes de ahorro" value={k.savingsPlans} />
            <MetricCard label="Bóvedas usadas" value={k.vaultsUsed} />
            <MetricCard label="Documentos / reservas" value={`${k.documents} / ${k.bookings}`} />
            <MetricCard label="Checkouts" value={k.checkouts} />
            <MetricCard label="Clics hacia Wompi" value={k.wompiClicks} />
            <MetricCard label="Pagos pendientes" value={k.paymentsPending} />
            <MetricCard label="Pagos rechazados" value={k.paymentsDeclined} />
            <MetricCard label="Pass activos" value={k.passesActive} />
            <MetricCard label="Usaron Modo Viaje" value={k.travelModeUsers} />
            <MetricCard label="Clics a WhatsApp" value={k.whatsappClicks} />
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <section className="card p-5">
              <h2 className="mb-4 font-extrabold text-navy">Embudo de validación</h2>
              <FunnelChart data={data.funnel} />
            </section>
            <section className="card p-5">
              <h2 className="mb-4 font-extrabold text-navy">Actividad diaria (personas únicas)</h2>
              <DailyChart data={data.daily} series={DAILY_SERIES} />
            </section>
          </div>
        </div>
      )}
    </>
  );
}
