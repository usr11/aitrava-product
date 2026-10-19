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
  const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
  if (res.status === 401 && typeof window !== 'undefined') window.dispatchEvent(new Event('aitrava:unauthorized'));
  throw new ApiError(
    msg ?? (res.status >= 500 ? 'Tuvimos un problema en el servidor. Intenta de nuevo.' : 'Algo salió mal, intenta de nuevo'),
    res.status,
    data?.code,
    data ?? undefined,
  );
}

/** fetch al backend con el token de sesión. Lanza ApiError con el mensaje del servidor. */
export async function api<T = unknown>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      ...rest,
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
  }
  if (!res.ok) return fail(res);
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Sube un archivo (multipart). */
export async function upload<T = unknown>(path: string, form: FormData): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api${path}`, { method: 'POST', headers: authHeader(), body: form });
  } catch {
    throw new ApiError('No hay conexión. Revisa tu internet e intenta de nuevo.', 0, 'OFFLINE');
  }
  if (!res.ok) return fail(res);
  return res.json() as Promise<T>;
}

/**
 * Descarga un archivo privado con la sesión y lo devuelve como blob.
 * Así los documentos de la Bóveda nunca tienen una URL pública.
 */
export async function apiBlob(path: string): Promise<Blob> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api${path}`, { headers: authHeader() });
  } catch {
    throw new ApiError('No hay conexión. Revisa tu internet e intenta de nuevo.', 0, 'OFFLINE');
  }
  if (!res.ok) return fail(res);
  return res.blob();
}

export function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
