import type { Metadata } from 'next';
import { API_URL } from '@/lib/api';
import { formatCOP, formatLongDate, formatTime } from '@/lib/format';
import type { Salida } from '@/lib/types';

/** Vista previa del enlace (WhatsApp, Instagram): título, fecha y precio reales. Si el API no responde, título genérico. */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_URL}/api/salidas/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return { title: 'Salida' };
    const s = (await res.json()) as Salida;
    const description = `${formatLongDate(s.startsAt)}, ${formatTime(s.startsAt)} · ${s.place.name} · ${formatCOP(s.price)} por persona. Grupo de hasta ${s.capacity}: ve solo, sal acompañado.`;
    return { title: s.title, description, openGraph: { title: s.title, description } };
  } catch {
    return { title: 'Salida' };
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
