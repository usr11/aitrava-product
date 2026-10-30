import { Mark } from './Logo';

export function AuthCard({ title, text, children }: { title: string; text?: string; children: React.ReactNode }) {
  return (
    <div className="wrap flex min-h-[70dvh] items-center justify-center py-10">
      <div className="panel w-full max-w-md p-6 sm:p-8">
        <Mark size={40} />
        <h1 className="title mt-4 text-[1.8rem]">{title}</h1>
        {text && <p className="mt-2 text-ink-2">{text}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
