import Link from 'next/link';

/** Posiciones de la ronda: 7 puntos alrededor del sol (el grupo alrededor de la experiencia). */
export const RING = Array.from({ length: 7 }, (_, i) => {
  const a = (-90 + (360 / 7) * i) * (Math.PI / 180);
  return { x: 32 + 20 * Math.cos(a), y: 32 + 20 * Math.sin(a) };
});

/** Ícono de AiTrava. `tone="paper"` para fondos verdes. */
export function Mark({ size = 32, tone = 'pine', className = '' }: { size?: number; tone?: 'pine' | 'paper'; className?: string }) {
  const dot = tone === 'pine' ? 'var(--color-pine)' : 'var(--color-paper)';
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden className={className}>
      <circle cx="32" cy="32" r="8.5" fill="var(--color-ember)" />
      {RING.map((p, i) => (
        <circle key={i} cx={p.x.toFixed(2)} cy={p.y.toFixed(2)} r="4.4" fill={dot} />
      ))}
    </svg>
  );
}

export function Logo({ tone = 'pine', className = '' }: { tone?: 'pine' | 'paper'; className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 rounded-lg ${className}`} aria-label="AiTrava, ir al inicio">
      <Mark size={30} tone={tone} />
      <span className={`display text-[1.45rem] leading-none ${tone === 'pine' ? 'text-pine' : 'text-paper'}`}>aitrava</span>
    </Link>
  );
}
