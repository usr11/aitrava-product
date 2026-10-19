import type { MetadataRoute } from 'next';

/** Lo privado no se indexa (especificación §108). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/mis-viajes', '/viajes/', '/checkout/', '/pago/', '/comprobante/', '/mi-cuenta', '/verificar-correo', '/restablecer-contrasena'],
    },
  };
}
