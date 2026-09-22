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
  signup: 'CompleteRegistration',
  quiz_complete: 'Lead',
  checkout_view: 'InitiateCheckout',
  reservation: 'Purchase',
};

export function track(name: string, props: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  api('/events', { json: { name, anonId: getAnonId(), props } }).catch(() => {});
  try {
    const std = PIXEL_STANDARD[name];
    if (std) window.fbq?.('track', std, props);
    else window.fbq?.('trackCustom', name, props);
  } catch {}
}

/** Guarda ref y utm_source de la URL para usarlos al registrarse. */
export function captureAttribution() {
  try {
    const q = new URLSearchParams(window.location.search);
    const ref = q.get('ref');
    const utm = q.get('utm_source');
    if (ref) localStorage.setItem('aitrava_ref', ref);
    if (utm) localStorage.setItem('aitrava_utm', utm);
  } catch {}
}

export function getAttribution() {
  try {
    return {
      ref: localStorage.getItem('aitrava_ref') ?? undefined,
      utmSource: localStorage.getItem('aitrava_utm') ?? undefined,
    };
  } catch {
    return {};
  }
}

/** Solo Meta Pixel (para eventos que el backend ya registra en la BD). */
export function pixel(standardEvent: string, props: Record<string, unknown> = {}) {
  try {
    window.fbq?.('track', standardEvent, props);
  } catch {}
}
