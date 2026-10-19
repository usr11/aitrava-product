'use client';

import { useState } from 'react';
import { Alert, Field } from '@/components/ui';
import { api } from '@/lib/api';
import { track } from '@/lib/track';

/** El mensaje se guarda en la base de datos y el equipo lo lee en /admin/mensajes. */
export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setState('sending');
    try {
      await api('/contact', { json: form });
      track('contact_sent');
      setState('sent');
    } catch (err) {
      setError((err as Error).message);
      setState('idle');
    }
  };

  if (state === 'sent') {
    return (
      <div className="card p-6 sm:p-8">
        <Alert tone="ok">
          <strong>Recibimos tu mensaje.</strong> Te responderemos a {form.email} lo antes posible.
        </Alert>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="card space-y-4 p-6 sm:p-8">
      <h2 className="text-xl font-extrabold text-navy">Envíanos un mensaje</h2>
      <Field label="Nombre" htmlFor="c-name">
        <input id="c-name" className="input" required minLength={2} maxLength={80} value={form.name} onChange={set('name')} autoComplete="name" />
      </Field>
      <Field label="Correo" htmlFor="c-email">
        <input id="c-email" type="email" className="input" required value={form.email} onChange={set('email')} autoComplete="email" />
      </Field>
      <Field label="Asunto" htmlFor="c-subject">
        <input id="c-subject" className="input" required minLength={2} maxLength={120} value={form.subject} onChange={set('subject')} />
      </Field>
      <Field label="Mensaje" htmlFor="c-message">
        <textarea id="c-message" className="input min-h-32" required minLength={5} maxLength={2000} value={form.message} onChange={set('message')} />
      </Field>
      {error && <Alert tone="bad">{error}</Alert>}
      <button className="btn btn-navy w-full" disabled={state === 'sending'}>
        {state === 'sending' ? 'Enviando…' : 'Enviar mensaje'}
      </button>
      <p className="text-xs text-text-2">Usamos tus datos solo para responderte. Ver la Política de privacidad.</p>
    </form>
  );
}
