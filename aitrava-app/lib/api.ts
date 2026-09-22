export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const TOKEN_KEY = 'aitrava_token';

export const tokenStore = {
  get: () => (typeof window === 'undefined' ? null : safe(() => localStorage.getItem(TOKEN_KEY))),
  set: (t: string) => safe(() => localStorage.setItem(TOKEN_KEY, t)),
  clear: () => safe(() => localStorage.removeItem(TOKEN_KEY)),
};

function safe<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** fetch al backend con el token de sesión. Lanza ApiError con el mensaje del servidor. */
export async function api<T = unknown>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  const token = tokenStore.get();
  const res = await fetch(`${API_URL}/api${path}`, {
    ...rest,
    method: rest.method ?? (json !== undefined ? 'POST' : 'GET'),
    headers: {
      ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
    throw new ApiError(msg ?? 'Algo salió mal, intenta de nuevo', res.status);
  }
  return data as T;
}
