/** Datos públicos oficiales (especificación §60, §62, §100). Se pueden cambiar por variables de entorno. */
export const CONTACT = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'aitrava.25@gmail.com',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '573117452985',
  whatsappDisplay: '+57 311 745 2985',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://www.instagram.com/aitrava26',
};

export const whatsappLink = (text = 'Hola, vengo desde AITRAVA y quisiera recibir información.') =>
  `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(text)}`;

/** Redes futuras: se muestran solo si tienen URL (no inventamos redes). */
export const FUTURE_SOCIAL: { name: string; url?: string }[] = [
  { name: 'TikTok', url: process.env.NEXT_PUBLIC_TIKTOK_URL },
  { name: 'Facebook', url: process.env.NEXT_PUBLIC_FACEBOOK_URL },
  { name: 'YouTube', url: process.env.NEXT_PUBLIC_YOUTUBE_URL },
  { name: 'LinkedIn', url: process.env.NEXT_PUBLIC_LINKEDIN_URL },
];

export const TEAM = [
  { name: 'Sebastián Jiménez', area: 'Ingeniería de Sistemas' },
  { name: 'Juan Pablo Zambrano', area: 'Ingeniería de Sistemas' },
  { name: 'Heiner Rincón', area: 'Ingeniería de Sistemas' },
  { name: 'Alejandro Lozada', area: 'Comunicación' },
];
