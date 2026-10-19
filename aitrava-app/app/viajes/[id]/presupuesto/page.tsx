'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { ExpenseForm } from '@/components/trip/forms';
import { Alert, ConfirmDialog, MoneyInput, ProgressBar, SectionTitle, Sheet } from '@/components/ui';
import { api } from '@/lib/api';
import { BUDGET_CATEGORIES, budgetCat } from '@/lib/catalog';
import { formatCOP, formatDate } from '@/lib/format';
import { track } from '@/lib/track';
import { useLoadedTrip } from '@/lib/trip-context';
import type { BudgetCategory, Expense } from '@/lib/types';

export default function PresupuestoPage() {
  const { trip, mutate } = useLoadedTrip();
  const b = trip.budget;
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState<Expense | null>(null);
  useEffect(() => {
    track('budget_viewed', {}, trip.id);
  }, [trip.id]);

  const over = b.remaining < 0;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SectionTitle eyebrow="Presupuesto" title="Tu plata del viaje" />

      <section className="card overflow-hidden">
        <div className={`p-5 ${over ? 'bg-bad-bg' : 'bg-navy text-white'}`}>
          <p className={`eyebrow ${over ? 'text-bad' : 'text-yellow'}`}>Presupuesto restante</p>
          <p className={`num mt-1 text-4xl font-extrabold ${over ? 'text-bad' : ''}`}>{formatCOP(b.remaining)}</p>
          <div className="mt-3">
            <ProgressBar value={b.total ? (b.spent / b.total) * 100 : 0} tone="yellow" label="Gastado del presupuesto" />
          </div>
        </div>
        <dl className="grid grid-cols-3 divide-x divide-line text-center">
          <div className="p-4">
            <dt className="text-xs text-text-2">Gastado</dt>
            <dd className="num mt-0.5 font-extrabold text-navy">{formatCOP(b.spent)}</dd>
          </div>
          <div className="p-4">
            <dt className="text-xs text-text-2">Estimado</dt>
            <dd className="num mt-0.5 font-extrabold text-navy">{formatCOP(b.estimated)}</dd>
          </div>
          <div className="p-4">
            <dt className="text-xs text-text-2">Total</dt>
            <dd className="num mt-0.5 font-extrabold text-navy">{formatCOP(b.total)}</dd>
          </div>
        </dl>
      </section>

      <button onClick={() => setAdding(true)} className="btn btn-primary btn-lg w-full">
        <Icon name="plus" size={20} /> Registrar gasto
      </button>

      {b.unassigned < 0 && (
        <Alert tone="warn">Lo que tienes planeado supera tu presupuesto en {formatCOP(-b.unassigned)}.</Alert>
      )}

      <section className="card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-navy">Por categoría</h2>
          {!trip.isDemo && (
            <button onClick={() => setEditing(true)} className="btn btn-ghost btn-sm">
              <Icon name="edit" size={16} /> Ajustar
            </button>
          )}
        </div>
        {!b.detailed && <p className="mt-1 text-sm text-text-2">Usamos un reparto sugerido. Ajústalo cuando quieras.</p>}
        <ul className="mt-4 space-y-5">
          {b.categories.map((c) => {
            const cat = budgetCat(c.key);
            const used = Math.max(c.spent, c.estimated);
            return (
              <li key={c.key}>
                <div className="flex items-center gap-3">
                  <Icon name={cat.icon} size={18} className="text-text-2" />
                  <span className="flex-1 font-semibold text-navy">{cat.label}</span>
                  <span className="num text-sm text-text-2">
                    {formatCOP(used)} / {formatCOP(c.budget)}
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={c.budget ? (used / c.budget) * 100 : used ? 100 : 0} tone={used > c.budget ? 'navy' : 'blue'} size="sm" label={cat.label} />
                </div>
                <p className="mt-1 text-xs text-text-3">
                  Estimado {formatCOP(c.estimated)} · gastado {formatCOP(c.spent)}
                  {used > c.budget && <span className="font-semibold text-bad"> · te pasaste {formatCOP(used - c.budget)}</span>}
                </p>
              </li>
            );
          })}
        </ul>
        <p className="mt-5 text-xs text-text-2">
          <strong>Estimado:</strong> reservas y actividades con costo. <strong>Gastado:</strong> reservas marcadas como pagadas + gastos que registras. Nunca
          los mezclamos.
        </p>
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-extrabold text-navy">Gastos registrados</h2>
        {!trip.expenses.length ? (
          <p className="mt-2 text-text-2">Durante el viaje, registra aquí lo que gastas y mira cuánto te queda.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {trip.expenses.map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-3">
                <span className="grid size-10 place-items-center rounded-xl bg-surface text-text-2">
                  <Icon name={budgetCat(e.category).icon} size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-navy">{e.description || budgetCat(e.category).label}</p>
                  <p className="text-xs text-text-2">{formatDate(e.date, { day: 'numeric', month: 'short' })}</p>
                </div>
                <span className="num font-bold text-navy">{formatCOP(e.amount)}</span>
                <button onClick={() => setRemoving(e)} className="btn btn-ghost size-10 p-0 text-bad" aria-label="Eliminar gasto">
                  <Icon name="trash" size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ExpenseForm open={adding} onClose={() => setAdding(false)} />
      <BudgetEditor open={editing} onClose={() => setEditing(false)} />
      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        title="¿Eliminar este gasto?"
        onConfirm={() => mutate(() => api(`/trips/${trip.id}/expenses/${removing!.id}`, { method: 'DELETE' }))}
      />
    </div>
  );
}

function BudgetEditor({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { trip, mutate } = useLoadedTrip();
  const [vals, setVals] = useState<Record<BudgetCategory, number>>({} as Record<BudgetCategory, number>);
  const [error, setError] = useState('');
  useEffect(() => {
    if (open) setVals(Object.fromEntries(trip.budget.categories.map((c) => [c.key, c.budget])) as Record<BudgetCategory, number>);
  }, [open, trip]);
  const sum = Object.values(vals).reduce((s, v) => s + (v || 0), 0);

  const save = async () => {
    setError('');
    try {
      await mutate(() => api(`/trips/${trip.id}`, { method: 'PATCH', json: { budgetByCategory: vals, budgetAmount: sum } }));
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Ajustar presupuesto">
      <ul className="space-y-3">
        {BUDGET_CATEGORIES.map((c) => (
          <li key={c.key} className="flex items-center gap-3">
            <span className="w-28 shrink-0 font-semibold text-navy">{c.label}</span>
            <MoneyInput value={vals[c.key] ?? 0} onChange={(v) => setVals({ ...vals, [c.key]: v ?? 0 })} />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-text-2">
        Nuevo total: <strong className="num text-navy">{formatCOP(sum)}</strong>
        {sum !== trip.budgetAmount && ` (antes ${formatCOP(trip.budgetAmount)})`}
      </p>
      {error && (
        <div className="mt-3">
          <Alert tone="bad">{error}</Alert>
        </div>
      )}
      <button onClick={save} className="btn btn-navy mt-4 w-full" disabled={sum < 50_000}>
        Guardar
      </button>
    </Sheet>
  );
}
