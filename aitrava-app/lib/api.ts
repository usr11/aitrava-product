export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const TOKEN_KEY = 'aitrava_token';

function safe<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}

export const tokenStore = {
  get: () => (typeof window === 'undefined' ? null : safe(() => localStorage.getItem(TOKEN_KEY))),
  set: (t: string) => safe(() => localStorage.setItem(TOKEN_KEY, t)),
  clear: () => safe(() => localStorage.removeItem(TOKEN_KEY)),
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public data?: Record<string, unknown>,
  ) {
    super(message);
  }
}

const authHeader = (): Record<string, string> => {
  const token = tokenStore.get();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function fail(res: Response): Promise<never> {
  const data = await res.json().catch(() => null);
  if (res.status === 429) {
    throw new ApiError(data?.message ?? 'Demasiados intentos. Espera unos minutos.', 429, 'RATE_LIMIT');
  }
  const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
  if (res.status === 401 && typeof window !== 'undefined') window.dispatchEvent(new Event('aitrava:unauthorized'));
  throw new ApiError(
    msg ?? (res.status >= 500 ? 'Tuvimos un problema en el servidor. Intenta de nuevo.' : 'Algo salió mal, intenta de nuevo'),
    res.status,
    data?.code,
    data ?? undefined,
  );
}

/**
 * fetch al backend (con el token del equipo si hay sesión). Lanza ApiError con el mensaje del servidor.
 * Corta a los 15 s para que una red lenta no deje la pantalla colgada.
 */
export async function api<T = unknown>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  let res: Response;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15_000);
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      ...rest,
      signal: rest.signal ?? ctrl.signal,
      method: rest.method ?? (json !== undefined ? 'POST' : 'GET'),
      headers: {
        ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...authHeader(),
        ...headers,
      },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new ApiError('No hay conexión. Revisa tu internet e intenta de nuevo.', 0, 'OFFLINE');
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) return fail(res);
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
