import Image from 'next/image';

export function Logo({ size = 36, showName = true }: { size?: number; showName?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Image
        src="/brand/aitrava-mark.jpg"
        alt={showName ? '' : 'AiTrava'}
        width={size * 2}
        height={size * 2}
        style={{ width: size, height: size, borderRadius: size * 0.25 }}
        priority
      />
      {showName && (
        <span className="font-display font-extrabold leading-none tracking-wide" style={{ fontSize: size * 0.7 }}>
          AiTrava
        </span>
      )}
    </span>
  );
}
