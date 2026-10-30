import type { MetadataRoute } from 'next';

/** Lo privado (reservas, encuestas, panel) no se indexa. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/equipo', '/reserva/', '/encuesta/'] },
  };
}
