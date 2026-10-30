/** Datos públicos. Se cambian por variables de entorno (el WhatsApp Business está pendiente, roadmap D6). */
export const CONTACT = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'aitrava.25@gmail.com',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '573117452985',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://www.instagram.com/aitrava26',
};

export const whatsappDisplay = () => {
  const d = CONTACT.whatsappNumber.replace(/\D/g, '');
  return d.length === 12 ? `+${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}` : `+${d}`;
};

export const whatsappLink = (text = 'Hola, vengo de la página de AiTrava y quiero saber de las próximas salidas.') =>
  `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(text)}`;

export const TEAM = [
  { name: 'Sebastián Jiménez', area: 'Ingeniería de Sistemas' },
  { name: 'Juan Pablo Zambrano', area: 'Ingeniería de Sistemas' },
  { name: 'Heiner Rincón', area: 'Ingeniería de Sistemas' },
  { name: 'Alejandro Lozada', area: 'Comunicación' },
];
