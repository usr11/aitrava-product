'use client';

import { useEffect, useState } from 'react';
import { Spinner } from '@/components/Spinner';
import { api } from '@/lib/api';

type Row = { id: string; name: string; email: string; role: string; referralCode: string; referredBy: string | null; utmSource: string | null; createdAt: string; _count: { trips: number } };

export default function AdminUsers() {
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    api<Row[]>('/admin/users').then(setRows).catch(() => setRows([]));
  }, []);
  if (!rows) return <Spinner full />;
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-line text-muted-2">
          <tr>
            {['Nombre', 'Correo', 'Viajes', 'Referido por', 'Fuente', 'Fecha'].map((h) => (
              <th key={h} className="eyebrow px-4 py-3 text-[10px] font-normal">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-line/60 last:border-0">
              <td className="px-4 py-3 font-semibold">{r.name}{r.role === 'ADMIN' && <span className="ml-2 text-xs text-primary">admin</span>}</td>
              <td className="px-4 py-3 text-muted">{r.email}</td>
              <td className="px-4 py-3 font-mono">{r._count.trips}</td>
              <td className="px-4 py-3 font-mono text-muted">{r.referredBy ?? '—'}</td>
              <td className="px-4 py-3 text-muted">{r.utmSource ?? 'directo'}</td>
              <td className="px-4 py-3 font-mono text-xs text-dim">{new Date(r.createdAt).toLocaleDateString('es-CO')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
