'use client';

import { Logo } from './Logo';

/**
 * Sobre digital dibujado en SVG (bordes limpios, sin clip-path).
 * Al abrirlo: la solapa gira hacia atrás y la carta sube.
 */
export function Envelope({ opening, onOpen }: { opening: boolean; onOpen: () => void }) {
  return (
    <div className="mx-auto w-full max-w-md [perspective:1200px]">
      <button
        onClick={onOpen}
        disabled={opening}
        aria-label="Abrir el sobre"
        className={`group relative block aspect-[8/5] w-full transition-transform duration-500 ${
          opening ? 'scale-[1.02]' : 'hover:-translate-y-1'
        }`}
      >
        {/* Cuerpo del sobre (parte de atrás) */}
        <svg viewBox="0 0 400 250" className="absolute inset-0 size-full drop-shadow-[0_25px_45px_rgba(0,0,0,0.55)]" aria-hidden>
          <defs>
            <linearGradient id="env-back" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f3c623" />
              <stop offset="100%" stopColor="#d99e00" />
            </linearGradient>
            <linearGradient id="env-front" x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="100%" stopColor="#e9ab00" />
            </linearGradient>
            <linearGradient id="env-flap" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffe14d" />
              <stop offset="100%" stopColor="#f0b90b" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="400" height="250" rx="18" fill="url(#env-back)" />
        </svg>

        {/* Carta: escondida detrás de la cara del sobre; al abrir sube y asoma por arriba */}
        <div
          className="pointer-events-none absolute inset-x-8 top-6 bottom-8 rounded-lg bg-light-bg shadow-[0_10px_24px_rgba(0,0,0,0.3)]"
          style={{
            transform: opening ? 'translateY(-62%)' : 'translateY(6%)',
            // El z-index cambia junto con el movimiento: primero se abre la solapa y después la carta pasa al frente.
            zIndex: opening ? 4 : 0,
            transition: opening
              ? 'transform 700ms ease-out 400ms, z-index 0s 400ms'
              : 'transform 300ms ease-out',
          }}
        >
          <div className="flex h-full flex-col items-center justify-center gap-1 px-6 text-center">
            <p className="eyebrow text-[10px] text-ink/50">Tu destino</p>
            <p className="display text-6xl text-gold-text">???</p>
          </div>
        </div>

        {/* Cara delantera completa, con los dobleces dibujados encima */}
        <svg viewBox="0 0 400 250" className="absolute inset-0 size-full" aria-hidden>
          <rect x="0" y="0" width="400" height="250" rx="18" fill="url(#env-front)" />
          {/* Dobleces: líneas suaves, no bordes duros */}
          <path d="M6 14 L200 150 L394 14" fill="none" stroke="rgba(0,0,0,0.13)" strokeWidth="1.5" />
          <path d="M6 238 L166 140 M394 238 L234 140" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" />
          {/* Estampilla */}
          <g opacity="0.55">
            <rect x="315" y="150" width="52" height="60" rx="4" fill="none" stroke="#1a1c20" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="341" y="187" textAnchor="middle" fontSize="26" fontWeight="700" fill="#1a1c20" fontFamily="monospace">
              ?
            </text>
          </g>
          <text x="36" y="196" fontSize="11" letterSpacing="3" fill="rgba(26,28,32,0.55)" fontFamily="monospace">
            AITRAVA · SOBRE SELLADO
          </text>
        </svg>

        {/* Solapa: gira hacia atrás al abrir */}
        <div
          className="absolute inset-x-0 top-0 h-[64%] origin-top transition-transform duration-500 ease-in [transform-style:preserve-3d]"
          style={{ transform: opening ? 'rotateX(-158deg)' : 'rotateX(0deg)', zIndex: opening ? 0 : 3 }}
        >
          <svg viewBox="0 0 400 160" className="size-full" preserveAspectRatio="none" aria-hidden>
            <path d="M0 18 A18 18 0 0 1 18 0 L382 0 A18 18 0 0 1 400 18 L212 148 A20 20 0 0 1 188 148 Z" fill="url(#env-flap)" />
            <path d="M0 18 L200 156 L400 18" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Sello de cera con el logo */}
        <span
          className={`absolute top-[58%] left-1/2 z-10 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink shadow-[0_6px_18px_rgba(0,0,0,0.45)] ring-4 ring-[#f0b90b]/70 transition-all duration-300 ${
            opening ? 'scale-0 opacity-0' : 'group-hover:scale-105'
          }`}
        >
          <Logo size={34} showName={false} />
        </span>
      </button>
    </div>
  );
}
