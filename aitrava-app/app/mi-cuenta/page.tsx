'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { RequireAuth } from '@/components/RequireAuth';
import { Alert, DemoBadge, Field, Sheet, Tone } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { PAYMENT_STATUS } from '@/lib/catalog';
import { formatCOP, formatDate } from '@/lib/format';
import type { Payment, User } from '@/lib/types';

export default function MiCuentaPage() {
  return (
    <RequireAuth verified={false}>
      <Account />
    </RequireAuth>
  );
}

function Account() {
  const { user, signOut, refresh } = useAuth();
  const router = useRouter();
  const [names, setNames] = useState({ firstName: user!.firstName, lastName: user!.lastName });
  const [saved, setSaved] = useState(false);
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [del, setDel] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api<Payment[]>('/payments/mine').then(setPayments).catch(() => setPayments([]));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await api<User>('/auth/me', { method: 'PATCH', json: names });
    await refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const remove = async () => {
    setError('');
    try {
      await api('/auth/me', { method: 'DELETE', json: { password } });
      signOut();
      router.push('/');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="container-app max-w-3xl py-8 lg:py-12">
      <p className="eyebrow text-blue">Mi cuenta</p>
      <h1 className="h-display mt-2 text-4xl text-navy">
        Hola, {user!.firstName} {user!.isDemo && <DemoBadge className="align-middle" />}
      </h1>

      <section className="card mt-8 p-5 sm:p-6">
        <h2 className="text-lg font-extrabold text-navy">Tus datos</h2>
        <form onSubmit={save} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre" htmlFor="a-first">
              <input id="a-first" className="input" value={names.firstName} onChange={(e) => setNames({ ...names, firstName: e.target.value })} minLength={2} required />
            </Field>
            <Field label="Apellido" htmlFor="a-last">
              <input id="a-last" className="input" value={names.lastName} onChange={(e) => setNames({ ...names, lastName: e.target.value })} minLength={2} required />
            </Field>
          </div>
          <div>
            <p className="label">Correo</p>
            <p className="flex flex-wrap items-center gap-2 text-text-2">
              {user!.email}
              {user!.emailVerified ? <Tone tone="ok">Verificado</Tone> : <Tone tone="warn">Sin verificar</Tone>}
            </p>
            {!user!.emailVerified && (
              <Link href="/verificar-correo" className="mt-2 inline-block text-sm font-semibold text-blue">
                Verificar mi correo
              </Link>
            )}
          </div>
          <button className="btn btn-navy btn-sm">{saved ? 'Guardado ✓' : 'Guardar cambios'}</button>
        </form>
      </section>

      <section className="card mt-5 p-5 sm:p-6">
        <h2 className="text-lg font-extrabold text-navy">Pagos y comprobantes</h2>
        {!payments ? (
          <div className="skeleton mt-4 h-16" />
        ) : !payments.length ? (
          <p className="mt-2 text-text-2">Todavía no tienes pagos. El AITRAVA Pass se activa desde cada viaje.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-navy">AITRAVA Pass · {p.trip?.title}</p>
                  <p className="text-sm text-text-2">
                    {p.reference} · {formatDate(p.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })} · {formatCOP(p.amount)}
                  </p>
                </div>
                <Tone tone={PAYMENT_STATUS[p.status].tone}>{PAYMENT_STATUS[p.status].label}</Tone>
                {p.status === 'approved' ? (
                  <Link href={`/comprobante/${p.id}`} className="btn btn-outline btn-sm">
                    <Icon name="receipt" size={16} /> Comprobante
                  </Link>
                ) : ['created', 'redirected', 'pending', 'pending_verification'].includes(p.status) ? (
                  <Link href={`/pago/resultado?id=${p.id}`} className="btn btn-ghost btn-sm">
                    Ver estado
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => {
            signOut();
            router.push('/');
          }}
          className="btn btn-outline"
        >
          <Icon name="logout" size={18} /> Cerrar sesión
        </button>
        <button onClick={() => setDel(true)} className="btn btn-ghost text-bad sm:ml-auto">
          Eliminar mi cuenta
        </button>
      </section>

      <Sheet open={del} onClose={() => setDel(false)} title="Eliminar mi cuenta">
        <p className="text-text-2">Se borrarán tus viajes, tu plan de ahorro, tus documentos de la Bóveda y tus datos. Esta acción no se puede deshacer.</p>
        <div className="mt-4">
          <Field label="Escribe tu contraseña para confirmar" htmlFor="d-pass">
            <input id="d-pass" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </Field>
        </div>
        {error && (
          <div className="mt-3">
            <Alert tone="bad">{error}</Alert>
          </div>
        )}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button onClick={() => setDel(false)} className="btn btn-outline">
            Cancelar
          </button>
          <button onClick={remove} disabled={!password} className="btn btn-danger">
            Eliminar definitivamente
          </button>
        </div>
      </Sheet>
    </div>
  );
}
