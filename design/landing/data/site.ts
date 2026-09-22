export const site = {
	name: 'AiTrava',
	tagline: 'Menos planear, más viajar.',
	description:
		'Viajes sorpresa personalizados. Tú pones el presupuesto y las fechas; nuestra IA arma transporte, alojamiento y planes locales. El destino lo descubres cuando toca.',
	social: {
		instagram: 'https://www.instagram.com/aitravaagency/',
		facebook: 'https://www.facebook.com/share/19eZt6jGaa/?mibextid=wwXIfr',
	},
	// TODO: reemplazar cuando las apps estén publicadas.
	stores: {
		appStore: '#descargar',
		googlePlay: '#descargar',
	},
} as const;

export const navLinks = [
	{ href: '#como-funciona', label: 'Cómo funciona' },
	{ href: '#presupuesto', label: 'Presupuesto' },
	{ href: '#pistas', label: 'Pistas' },
	{ href: '#para-quien', label: 'Para quién' },
] as const;

export const steps = [
	{
		icon: 'sliders',
		title: 'Cuéntanos lo básico',
		text: 'Presupuesto, fechas, desde dónde sales y qué te mueve: playa, montaña, comida, fiesta o silencio.',
	},
	{
		icon: 'sparkle',
		title: 'La IA arma tu viaje',
		text: 'Cruza tus gustos con transporte, alojamiento y actividades locales, y reserva todo dentro de tu tope.',
	},
	{
		icon: 'lock',
		title: 'Desbloquea pistas',
		text: 'Mientras llega el día, la app te suelta pistas: qué empacar, el clima, un sabor típico. ¿Lo adivinas?',
	},
	{
		icon: 'pin',
		title: 'Revelación y a volar',
		text: 'Abres el sobre digital, ves tu destino y todo ya está listo en la app. Solo lleva la maleta.',
	},
] as const;

/**
 * Simulador de presupuesto (viaje nacional en Colombia, 2 noches).
 * Valores por defecto estimados a partir de precios de mercado de viajes sorpresa nacionales (~$1.800.000 COP p/p).
 * `share` es la proporción del tope que va a cada rubro; deben sumar 1.
 */
export const budget = {
	nights: 2,
	min: 800_000,
	max: 8_000_000,
	step: 100_000,
	defaultTotal: 2_800_000,
	travelerOptions: [1, 2, 3, 4],
	defaultTravelers: 2,
	items: [
		{ icon: 'plane', label: 'Transporte', share: 0.39 },
		{ icon: 'home', label: 'Alojamiento', share: 0.32 },
		{ icon: 'mountain', label: 'Experiencias locales', share: 0.29 },
	],
} as const;

/** Reparte el total por rubro, redondeado a miles; el último rubro absorbe el redondeo para que la suma cuadre. */
export const splitBudget = (total: number, shares: readonly number[]) => {
	const amounts = shares.map((share) => Math.round((total * share) / 10_000) * 10_000);
	amounts[amounts.length - 1] = total - amounts.slice(0, -1).reduce((sum, value) => sum + value, 0);
	return amounts;
};

export const clueTopics = ['Qué empacar', 'El clima', 'Un plato típico', 'Una canción local'] as const;

export const travelers = [
	{ pax: 'PAX 01', title: 'Solo', text: 'Para desconectarte de todo y conocer gente nueva en el camino.', tone: 'light' },
	{ pax: 'PAX 02', title: 'En pareja', text: 'Un aniversario que no se parece a ningún otro. Nadie tiene que planearlo.', tone: 'yellow' },
	{ pax: 'PAX 03+', title: 'Con amigos', text: 'Se acabó el chat de 200 mensajes para decidir a dónde ir.', tone: 'dark' },
	{ pax: 'PAX 04+', title: 'En familia', text: 'Planes para todas las edades, sin que alguien cargue con toda la logística.', tone: 'light' },
] as const;

export const trustPoints = [
	{
		icon: 'headset',
		title: 'Automático, pero con humanos',
		text: 'Si algo cambia en el camino, una persona real te responde rápido.',
	},
	{
		icon: 'card',
		title: 'Un solo pago, todo reservado',
		text: 'Vuelos, hospedaje y actividades en una misma reserva, con pago centralizado.',
	},
	{
		icon: 'shield',
		title: 'Aliados verificados',
		text: 'Trabajamos con proveedores de transporte, alojamiento y agencias locales de confianza.',
	},
] as const;

export const formatCOP = (value: number) =>
	`$${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value)}`;
