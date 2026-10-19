import type { IconName } from '@/components/Icon';
import type { BudgetCategory, Frequency, PaymentStatus } from './types';

/** Categorías de reservas (lo comprado dentro o fuera de AITRAVA). */
export const BOOKING_CATEGORIES: { key: string; label: string; plural: string; icon: IconName }[] = [
  { key: 'vuelo', label: 'Vuelo', plural: 'Vuelos', icon: 'plane' },
  { key: 'alojamiento', label: 'Alojamiento', plural: 'Alojamiento', icon: 'bed' },
  { key: 'actividad', label: 'Actividad', plural: 'Actividades', icon: 'ticket' },
  { key: 'transporte', label: 'Transporte', plural: 'Transporte', icon: 'bus' },
  { key: 'restaurante', label: 'Restaurante', plural: 'Restaurantes', icon: 'utensils' },
  { key: 'seguro', label: 'Seguro', plural: 'Seguros', icon: 'shield' },
  { key: 'otro', label: 'Otro', plural: 'Otros', icon: 'folder' },
];
export const bookingCat = (k: string) => BOOKING_CATEGORIES.find((c) => c.key === k) ?? BOOKING_CATEGORIES[6];

/** Módulos de reservas por página (/viajes/[id]/transporte, etc.). */
export const MODULE_PAGES: Record<string, { title: string; categories: string[]; empty: string; icon: IconName }> = {
  transporte: { title: 'Transporte', categories: ['vuelo', 'transporte'], empty: 'Agrega tus vuelos, buses, trenes o traslados.', icon: 'plane' },
  alojamiento: { title: 'Alojamiento', categories: ['alojamiento'], empty: 'Agrega tu hotel, hostal o Airbnb.', icon: 'bed' },
  actividades: { title: 'Actividades', categories: ['actividad', 'seguro', 'otro'], empty: 'Entradas, tours, seguro y lo que quieras tener a mano.', icon: 'ticket' },
  restaurantes: { title: 'Restaurantes', categories: ['restaurante'], empty: 'Guarda tus reservas de restaurantes.', icon: 'utensils' },
};

export const ITEM_TYPES: { key: string; label: string; icon: IconName }[] = [
  { key: 'actividad', label: 'Actividad', icon: 'ticket' },
  { key: 'comida', label: 'Comida', icon: 'coffee' },
  { key: 'restaurante', label: 'Restaurante', icon: 'utensils' },
  { key: 'transporte', label: 'Transporte', icon: 'bus' },
  { key: 'alojamiento', label: 'Alojamiento', icon: 'bed' },
  { key: 'libre', label: 'Tiempo libre', icon: 'sun' },
  { key: 'otro', label: 'Otro', icon: 'pin' },
];
export const itemType = (k: string) => ITEM_TYPES.find((t) => t.key === k) ?? ITEM_TYPES[6];

export const BUDGET_CATEGORIES: { key: BudgetCategory; label: string; icon: IconName }[] = [
  { key: 'transporte', label: 'Transporte', icon: 'plane' },
  { key: 'alojamiento', label: 'Alojamiento', icon: 'bed' },
  { key: 'actividades', label: 'Actividades', icon: 'ticket' },
  { key: 'comida', label: 'Comida', icon: 'utensils' },
  { key: 'seguros', label: 'Seguros', icon: 'shield' },
  { key: 'otros', label: 'Otros', icon: 'bag' },
];
export const budgetCat = (k: string) => BUDGET_CATEGORIES.find((c) => c.key === k) ?? BUDGET_CATEGORIES[5];

/** Reparto sugerido (el mismo del backend, src/savings/plan.ts). */
export const DEFAULT_SPLIT: Record<BudgetCategory, number> = {
  transporte: 0.35,
  alojamiento: 0.3,
  actividades: 0.1,
  comida: 0.15,
  seguros: 0.03,
  otros: 0.07,
};

export const VAULT_CATEGORIES: { key: string; label: string; icon: IconName }[] = [
  { key: 'vuelos', label: 'Vuelos', icon: 'plane' },
  { key: 'alojamiento', label: 'Alojamiento', icon: 'bed' },
  { key: 'actividades', label: 'Actividades', icon: 'ticket' },
  { key: 'transporte', label: 'Transporte', icon: 'bus' },
  { key: 'seguros', label: 'Seguros', icon: 'shield' },
  { key: 'restaurantes', label: 'Restaurantes', icon: 'utensils' },
  { key: 'otros', label: 'Otros', icon: 'folder' },
];
export const vaultCat = (k: string) => VAULT_CATEGORIES.find((c) => c.key === k) ?? VAULT_CATEGORIES[6];
/** Categoría de reserva → categoría sugerida en la Bóveda. */
export const BOOKING_TO_VAULT: Record<string, string> = {
  vuelo: 'vuelos',
  alojamiento: 'alojamiento',
  actividad: 'actividades',
  transporte: 'transporte',
  seguro: 'seguros',
  restaurante: 'restaurantes',
  otro: 'otros',
};

export const FREQUENCIES: { key: Frequency; label: string; detail: string }[] = [
  { key: 'WEEKLY', label: 'Semanal', detail: 'Cada viernes' },
  { key: 'BIWEEKLY', label: 'Quincenal', detail: 'El 15 y el último día del mes' },
  { key: 'MONTHLY', label: 'Mensual', detail: 'Cada fin de mes' },
];
export const PER_PERIOD: Record<Frequency, string> = { WEEKLY: 'por semana', BIWEEKLY: 'por quincena', MONTHLY: 'al mes' };

export const LIKES = [
  { id: 'playa', label: 'Playa', emoji: '🏖️' },
  { id: 'montana', label: 'Montaña', emoji: '⛰️' },
  { id: 'cultura', label: 'Cultura', emoji: '🏛️' },
  { id: 'comida', label: 'Comida', emoji: '🍲' },
  { id: 'naturaleza', label: 'Naturaleza', emoji: '🌿' },
  { id: 'aventura', label: 'Aventura', emoji: '🧗' },
  { id: 'fiesta', label: 'Vida nocturna', emoji: '🎉' },
  { id: 'pueblo', label: 'Pueblos', emoji: '🏘️' },
  { id: 'cafe', label: 'Café', emoji: '☕' },
  { id: 'silencio', label: 'Desconexión', emoji: '🧘' },
] as const;

export const AVOID = [
  { id: 'avion', label: 'Volar' },
  { id: 'calor', label: 'Mucho calor' },
  { id: 'frio', label: 'Frío' },
  { id: 'caminatas', label: 'Caminatas largas' },
  { id: 'ruido', label: 'Ruido y rumba' },
] as const;

export const TRAVEL_STYLES = [
  { id: 'economico', label: 'Económico', text: 'Rendir cada peso' },
  { id: 'equilibrado', label: 'Equilibrado', text: 'Comodidad sin excesos' },
  { id: 'comodo', label: 'Cómodo', text: 'Darse gusto' },
] as const;

export const PROVIDER_CATEGORIES: { key: string; label: string; icon: IconName }[] = [
  { key: 'aerolineas', label: 'Aerolíneas', icon: 'plane' },
  { key: 'hoteles', label: 'Hoteles', icon: 'bed' },
  { key: 'restaurantes', label: 'Restaurantes', icon: 'utensils' },
  { key: 'experiencias', label: 'Experiencias', icon: 'ticket' },
  { key: 'transporte', label: 'Transporte', icon: 'bus' },
  { key: 'seguros', label: 'Seguros', icon: 'shield' },
  { key: 'otros', label: 'Otros', icon: 'folder' },
];

export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; tone: 'ok' | 'warn' | 'bad' | 'muted' }> = {
  created: { label: 'Creado', tone: 'muted' },
  redirected: { label: 'Enviado a Wompi', tone: 'muted' },
  pending: { label: 'Pendiente', tone: 'warn' },
  pending_verification: { label: 'En verificación', tone: 'warn' },
  approved: { label: 'Aprobado', tone: 'ok' },
  declined: { label: 'Rechazado', tone: 'bad' },
  cancelled: { label: 'Cancelado', tone: 'muted' },
  error: { label: 'Error', tone: 'bad' },
  unknown: { label: 'Desconocido', tone: 'muted' },
};

export const ORIGINS = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Manizales', 'Santa Marta', 'Cúcuta'];

export const COUNTRIES = [
  'Colombia',
  'España',
  'México',
  'Estados Unidos',
  'Perú',
  'Argentina',
  'Brasil',
  'Chile',
  'Ecuador',
  'Panamá',
  'República Dominicana',
  'Italia',
  'Francia',
  'Portugal',
  'Japón',
];
