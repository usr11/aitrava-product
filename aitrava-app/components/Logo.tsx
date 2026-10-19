import Image from 'next/image';

/** Logo oficial (sin recolorear ni deformar) + nombre. */
export function Logo({ size = 36, showName = true, light = false }: { size?: number; showName?: boolean; light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Image
        src="/brand/aitrava-mark.jpg"
        alt={showName ? '' : 'AITRAVA'}
        width={size * 2}
        height={size * 2}
        className="object-contain"
        style={{ width: size, height: size, borderRadius: size * 0.24 }}
        priority
      />
      {showName && (
        <span
          className={`font-extrabold tracking-[0.06em] ${light ? 'text-white' : 'text-navy'}`}
          style={{ fontSize: Math.max(16, size * 0.52) }}
        >
          AITRAVA
        </span>
      )}
    </span>
  );
}
