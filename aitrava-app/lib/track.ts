import { api } from './api';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const ANON_KEY = 'aitrava_anon';

/** Id anónimo por navegador: permite contar el embudo antes del registro. */
export function getAnonId() {
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

/** Eventos que también se mandan al Meta Pixel con su nombre estándar. */
const PIXEL_STANDARD: Record<string, string> = {
  signup_started: 'Lead',
  checkout_viewed: 'InitiateCheckout',
  payment_cta_clicked: 'AddPaymentInfo',
};

/**
 * Registra un evento propio (y en el Meta Pixel). Nunca se manda información sensible:
 * ni correos, ni documentos, ni datos de pago.
 */
export function track(name: string, props: Record<string, string | number | boolean | null> = {}, tripId?: string) {
  if (typeof window === 'undefined') return;
  api('/events', { json: { name, anonId: getAnonId(), tripId, props } }).catch(() => {});
  try {
    const std = PIXEL_STANDARD[name];
    if (std) window.fbq?.('track', std, props);
    else window.fbq?.('trackCustom', name, props);
  } catch {}
}

/** Guarda utm_source de la URL para usarlo al registrarse. */
export function captureAttribution() {
  try {
    const utm = new URLSearchParams(window.location.search).get('utm_source');
    if (utm) localStorage.setItem('aitrava_utm', utm.slice(0, 60));
  } catch {}
}

export function getUtmSource() {
  try {
    return localStorage.getItem('aitrava_utm') ?? undefined;
  } catch {
    return undefined;
  }
}

/** Solo Meta Pixel (para eventos que el backend ya registra en la BD). */
export function pixel(standardEvent: string, props: Record<string, unknown> = {}) {
  try {
    window.fbq?.('track', standardEvent, props);
  } catch {}
}
