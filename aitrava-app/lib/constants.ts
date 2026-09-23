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

/**
 * Modelo de ingresos: tarifa fija por viaje (dentro del tope del cliente)
 * + comisión que nos dejan los aliados de transporte, alojamiento y experiencias.
 */
export const COMMISSION_FIXED = 50_000;
export const DEPOSIT_RATE = 0.2;
export const MAX_REROLLS = 2;
export const depositFor = (total: number) => Math.round((total * DEPOSIT_RATE) / 10_000) * 10_000;

/** Degradados para las "postales" de destino (no dependemos de fotos externas). */
export const POSTCARD_GRADIENTS = [
  'linear-gradient(135deg,#ffb300 0%,#ff6b3d 55%,#7a2e8e 100%)',
  'linear-gradient(135deg,#00b4d8 0%,#0077b6 50%,#03045e 100%)',
  'linear-gradient(135deg,#95d5b2 0%,#2d6a4f 60%,#081c15 100%)',
  'linear-gradient(135deg,#ffd700 0%,#e76f51 60%,#6a040f 100%)',
  'linear-gradient(135deg,#caf0f8 0%,#48cae4 45%,#023e8a 100%)',
];
