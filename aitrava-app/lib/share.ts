import { track } from './track';

/** Web Share API en móvil; si no existe, copia el link. Devuelve true si se copió. */
export async function shareLink(url: string, text: string, where: string) {
  track('share', { where });
  if (navigator.share) {
    try {
      await navigator.share({ title: 'AiTrava', text, url });
      return false;
    } catch {
      return false;
    }
  }
  await navigator.clipboard?.writeText(`${text} ${url}`);
  return true;
}
