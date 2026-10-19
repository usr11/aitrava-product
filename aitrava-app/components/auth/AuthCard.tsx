import Link from 'next/link';
import { Logo } from '../Logo';

export function AuthCard({ title, text, children, footer }: { title: string; text?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100dvh-64px)] items-start justify-center bg-surface px-4 py-8 sm:items-center sm:py-12">
      <div className="w-full max-w-md">
        <div className="card p-6 sm:p-8">
          <Link href="/" className="inline-block" aria-label="AITRAVA, inicio">
            <Logo size={40} />
          </Link>
          <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">{title}</h1>
          {text && <p className="mt-2 text-text-2">{text}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-5 text-center text-sm text-text-2">{footer}</div>}
      </div>
    </div>
  );
}

export function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  invalid?: boolean;
}) {
  return (
    <input
      id={id}
      type="password"
      className="input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={autoComplete}
      required
      minLength={8}
      aria-invalid={invalid || undefined}
    />
  );
}

export const safeNext = (next: string | null) => (next && next.startsWith('/') && !next.startsWith('//') ? next : null);
