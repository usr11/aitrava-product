export const VIBES = [
  { id: 'playa', label: 'Playa', emoji: '🏖️' },
  { id: 'montana', label: 'Montaña', emoji: '⛰️' },
  { id: 'comida', label: 'Comida', emoji: '🍲' },
  { id: 'fiesta', label: 'Fiesta', emoji: '🎉' },
  { id: 'cultura', label: 'Cultura', emoji: '🏛️' },
  { id: 'naturaleza', label: 'Naturaleza', emoji: '🌿' },
  { id: 'silencio', label: 'Silencio', emoji: '🤫' },
  { id: 'aventura', label: 'Aventura', emoji: '🧗' },
  { id: 'cafe', label: 'Café', emoji: '☕' },
  { id: 'pueblo', label: 'Pueblos', emoji: '🏘️' },
] as const;

export const AVOID = [
  { id: 'avion', label: 'Volar' },
  { id: 'calor', label: 'Mucho calor' },
  { id: 'frio', label: 'Frío' },
  { id: 'caminatas', label: 'Caminatas largas' },
  { id: 'ruido', label: 'Rumba y ruido' },
] as const;

export const TRAVELERS = [
  { pax: 'PAX 01', value: 1, title: 'Solo', text: 'Para desconectarte y conocer gente en el camino.' },
  { pax: 'PAX 02', value: 2, title: 'En pareja', text: 'Un plan que nadie tiene que organizar.' },
  { pax: 'PAX 03+', value: 3, title: 'Con amigos', text: 'Adiós al chat de 200 mensajes.' },
  { pax: 'PAX 04+', value: 4, title: 'En familia', text: 'Planes para todas las edades.' },
] as const;

export const ORIGINS = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Pereira', 'Cartagena'];

export const CLUE_LABELS: Record<string, string> = {
  empacar: 'Qué empacar',
  clima: 'El clima',
  comida: 'Un sabor típico',
  musica: 'Lo que vas a oír',
  cultura: 'Un dato curioso',
};

export const PLANS = [
  {
    id: 'basico',
    name: 'Básico',
    feeRate: 0.08,
    addOn: 0,
    tagline: 'Todo lo esencial',
    perks: ['Viaje sorpresa completo', '5 pistas antes de salir', 'Soporte por chat'],
  },
  {
    id: 'plus',
    name: 'Plus',
    feeRate: 0.12,
    addOn: 0,
    tagline: 'El más elegido',
    perks: ['Todo lo del Básico', 'Pistas personalizadas con IA', '1 re-sorteo extra gratis', 'Soporte humano 24/7'],
  },
  {
    id: 'dorado',
    name: 'Sobre Dorado',
    feeRate: 0.15,
    addOn: 89_000,
    tagline: 'Para regalar o celebrar',
    perks: ['Todo lo del Plus', 'Experiencia exclusiva de un aliado', 'Sobre físico enviado a tu casa', 'Cambio de fechas gratis'],
  },
] as const;

export const EXTRA_CLUE_PRICE = 9_900;
export const REROLL_PRICE = 19_900;
export const DEPOSIT_AMOUNT = 50_000;

/** Degradados para las "postales" de destino (no dependemos de fotos externas). */
export const POSTCARD_GRADIENTS = [
  'linear-gradient(135deg,#ffb300 0%,#ff6b3d 55%,#7a2e8e 100%)',
  'linear-gradient(135deg,#00b4d8 0%,#0077b6 50%,#03045e 100%)',
  'linear-gradient(135deg,#95d5b2 0%,#2d6a4f 60%,#081c15 100%)',
  'linear-gradient(135deg,#ffd700 0%,#e76f51 60%,#6a040f 100%)',
  'linear-gradient(135deg,#caf0f8 0%,#48cae4 45%,#023e8a 100%)',
];
