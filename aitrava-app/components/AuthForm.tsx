'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { getAnonId, getAttribution, pixel } from '@/lib/track';
import type { User } from '@/lib/types';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const { signIn, user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [next, setNext] = useState('/crear');
  const [referred, setReferred] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setNext(q.get('next') ?? (mode === 'login' ? '/mis-viajes' : '/crear'));
    setReferred(!!getAttribution().ref);
  }, [mode]);

  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const payload =
        mode === 'register'
          ? { ...form, anonId: getAnonId(), ...getAttribution() }
          : { email: form.email, password: form.password, anonId: getAnonId() };
      const res = await api<{ token: string; user: User }>(`/auth/${mode === 'register' ? 'register' : 'login'}`, { json: payload });
      signIn(res.token, res.user);
      if (mode === 'register') pixel('CompleteRegistration');
      router.replace(next);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });
  const q = next !== '/crear' && next !== '/mis-viajes' ? `?next=${encodeURIComponent(next)}` : '';

  return (
    <div className="container-app grid min-h-[75dvh] place-items-center py-10">
      <form onSubmit={submit} className="card animate-fade-up w-full max-w-md p-6 sm:p-8">
        <p className="eyebrow text-secondary">{mode === 'register' ? 'Tu primer viaje sorpresa' : 'Qué bueno verte'}</p>
        <h1 className="display mt-3 text-5xl">{mode === 'register' ? 'Crea tu cuenta' : 'Entrar'}</h1>
        {referred && mode === 'register' && (
          <p className="mt-4 rounded-xl bg-primary/15 px-4 py-3 text-sm text-primary">Llegaste por invitación de un amigo 🎁 ¡Bienvenido a AiTrava!</p>
        )}
        <div className="mt-6 space-y-4">
          {mode === 'register' && (
            <label className="block">
              <span className="field-label">Nombre</span>
              <input className="input" required minLength={2} autoComplete="name" value={form.name} onChange={set('name')} placeholder="¿Cómo te llamas?" />
            </label>
          )}
          <label className="block">
            <span className="field-label">Correo</span>
            <input className="input" type="email" required autoComplete="email" value={form.email} onChange={set('email')} placeholder="tu@correo.com" />
          </label>
          <label className="block">
            <span className="field-label">Contraseña</span>
            <input
              className="input"
              type="password"
              required
              minLength={mode === 'register' ? 6 : 1}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              value={form.password}
              onChange={set('password')}
              placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••'}
            />
          </label>
        </div>
        {error && <p className="mt-4 text-sm text-bad" role="alert">{error}</p>}
        <button className="btn btn-primary btn-lg mt-6 w-full" disabled={busy}>
          {busy ? 'Un momento…' : mode === 'register' ? 'Crear cuenta y seguir' : 'Entrar'}
        </button>
        <p className="mt-5 text-center text-sm text-muted">
          {mode === 'register' ? (
            <>¿Ya tienes cuenta? <Link href={`/login${q}`} className="font-semibold text-primary">Entra aquí</Link></>
          ) : (
            <>¿Primera vez? <Link href={`/registro${q}`} className="font-semibold text-primary">Crea tu cuenta</Link></>
          )}
        </p>
      </form>
    </div>
  );
}
