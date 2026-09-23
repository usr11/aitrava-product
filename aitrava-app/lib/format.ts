export const formatCOP = (value: number) =>
  `$${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value)}`;

export const formatDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) =>
  new Intl.DateTimeFormat('es-CO', { timeZone: 'UTC', ...opts }).format(new Date(iso));

export const nightsBetween = (a: string, b: string) =>
  Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000));

/** Reparte el total por rubro igual que el backend (39/32/29 del neto tras la tarifa fija). */
export const splitBudget = (total: number, comisionFija = 50_000) => {
  const round = (n: number) => Math.round(n / 10_000) * 10_000;
  const comision = comisionFija;
  const net = total - comision;
  const transporte = round(net * 0.39);
  const alojamiento = round(net * 0.32);
  return { transporte, alojamiento, experiencias: net - transporte - alojamiento, comision };
};

/** Código tipo vuelo a partir del id del viaje: AT-4821 */
export const flightCode = (id: string) => {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 9000;
  return `AT-${1000 + h}`;
};
