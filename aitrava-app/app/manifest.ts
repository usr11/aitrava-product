import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AiTrava · Ve solo, sal acompañado',
    short_name: 'AiTrava',
    description: 'Salidas en grupos pequeños a la naturaleza y la cultura de Cali.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f2edd5',
    theme_color: '#04261e',
    lang: 'es-CO',
    icons: [
      { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
