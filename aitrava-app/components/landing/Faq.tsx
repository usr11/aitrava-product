import { Icon } from '../Icon';

export type QA = { q: string; a: React.ReactNode };

export function Faq({ items }: { items: QA[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((it) => (
        <details key={it.q} className="group">
          <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 py-4 text-[1.1rem] font-bold [&::-webkit-details-marker]:hidden">
            {it.q}
            <Icon name="chevronDown" className="shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <div className="max-w-2xl pb-5 text-ink-2">{it.a}</div>
        </details>
      ))}
    </div>
  );
}
