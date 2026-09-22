export function Spinner({ full = false, label = 'Cargando…' }: { full?: boolean; label?: string }) {
  const dots = (
    <div className="flex items-center gap-1.5" role="status" aria-label={label}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="flap flap-anim h-9 w-7 text-lg" style={{ animationDelay: `${i * 0.2}s` }}>
          ?
        </span>
      ))}
    </div>
  );
  return full ? <div className="grid min-h-[60dvh] place-items-center">{dots}</div> : dots;
}
