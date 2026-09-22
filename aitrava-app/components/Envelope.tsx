'use client';

import { Logo } from './Logo';

/** Sobre digital: al abrirse la solapa gira y la carta sube. */
export function Envelope({ opening, onOpen }: { opening: boolean; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      disabled={opening}
      className={`group relative mx-auto block aspect-[3/2] w-full max-w-md ${opening ? '' : 'animate-wiggle'}`}
      aria-label="Abrir el sobre"
      style={{ perspective: 800 }}
    >
      {/* Carta */}
      <div
        className="absolute inset-x-6 top-4 bottom-4 rounded-xl bg-light-bg shadow-lg transition-transform duration-700 ease-out"
        style={{ transform: opening ? 'translateY(-55%)' : 'none', transitionDelay: opening ? '0.45s' : '0s' }}
      >
        <p className="display pt-5 text-center text-4xl text-gold-text">???</p>
      </div>
      {/* Cuerpo */}
      <div className="absolute inset-0 rounded-2xl bg-secondary" style={{ clipPath: 'polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%)' }} />
      <div className="absolute inset-0 rounded-2xl bg-primary" style={{ clipPath: 'polygon(0 100%, 50% 50%, 100% 100%)' }} />
      {/* Solapa */}
      <div
        className="absolute inset-x-0 top-0 h-[58%] origin-top bg-[#e6c200] transition-transform duration-500"
        style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)', transform: opening ? 'rotateX(180deg)' : 'none', zIndex: opening ? 0 : 2 }}
      />
      {/* Sello */}
      {!opening && (
        <span className="absolute top-[42%] left-1/2 z-10 grid size-16 -translate-x-1/2 place-items-center rounded-full bg-ink shadow-xl ring-4 ring-primary/60">
          <Logo size={34} showName={false} />
        </span>
      )}
    </button>
  );
}
