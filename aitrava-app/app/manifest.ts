import type { MetadataRoute } from 'next';

/** Base para evolucionar a PWA (no hay modo offline todavía; no se promete). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AITRAVA · Tu viaje vive aquí',
    short_name: 'AITRAVA',
    description: 'Planea, ahorra y lleva contigo todo tu viaje en un solo lugar.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0b1f3a',
    lang: 'es-CO',
    icons: [
      { src: '/brand/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
