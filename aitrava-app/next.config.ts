import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // En Cloudflare Workers no hay optimizador de imágenes por defecto; solo usamos el logo.
  images: { unoptimized: true },
};

export default nextConfig;
