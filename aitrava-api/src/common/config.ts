/**
 * Configuración de negocio en UN solo lugar. La app la lee de GET /api/config,
 * así que el precio, el link de pago y los límites nunca se duplican en componentes.
 */

/** Precio del AITRAVA Pass por viaje (hipótesis a validar, no es un precio "científico"). */
export const passPrice = () => Number(process.env.PASS_PRICE_COP ?? 39_900);

/** Link de pago de Wompi (checkout externo). AITRAVA nunca pide datos de tarjeta. */
export const paymentUrl = () =>
  process.env.PAYMENT_URL ?? 'https://checkout.nequi.wompi.co/l/PgimzF';

export const appUrl = () =>
  (process.env.APP_URL ?? 'http://localhost:3000')
    .split(',')[0]
    .trim()
    .replace(/\/$/, '');

export const isProduction = () =>
  process.env.NODE_ENV === 'production' || !!process.env.RAILWAY_ENVIRONMENT;

/** Correos del equipo que reciben rol admin al verificar su correo (separados por coma). */
export const adminEmails = () =>
  (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

/**
 * Fase de prueba: verificar el correo es opcional (por defecto). Para operación real: EMAIL_VERIFICATION_REQUIRED=true.
 * El rol admin siempre exige correo verificado, esté como esté esta opción.
 */
export const emailVerificationRequired = () =>
  process.env.EMAIL_VERIFICATION_REQUIRED === 'true';

/** Límites del plan gratis. */
export const FREE_LIMITS = {
  vaultDocumentsPerTrip: 3,
};

/** Archivos de la Bóveda. */
export const UPLOAD = {
  maxBytes: 5 * 1024 * 1024,
  mimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
};

/** Qué desbloquea el Pass (también se muestra en el paywall). */
export const PASS_FEATURES = [
  'Bóveda completa (documentos ilimitados)',
  'Modo Viaje',
  'Cómo llegar a cada actividad',
  'Explora cerca de ti',
  'Cambiar mis planes',
  'Funciones premium futuras de este viaje',
];

export const publicConfig = () => ({
  passPriceCop: passPrice(),
  paymentUrl: paymentUrl(),
  freeLimits: FREE_LIMITS,
  upload: UPLOAD,
  passFeatures: PASS_FEATURES,
  mailEnabled: !!process.env.SMTP_HOST,
  emailVerificationRequired: emailVerificationRequired(),
});
