/**
 * Bloqueo de scroll compartido (ventanas emergentes, menú). Usa un contador para que, aunque se abran
 * y cierren varias capas en cualquier orden, el scroll de la página siempre vuelva al final.
 */
let locks = 0;

export function lockScroll() {
  locks += 1;
  if (locks === 1) document.documentElement.style.overflow = 'hidden';
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks = Math.max(0, locks - 1);
    if (locks === 0) document.documentElement.style.overflow = '';
  };
}
