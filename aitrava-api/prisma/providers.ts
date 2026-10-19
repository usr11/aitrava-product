/**
 * Proveedores que se muestran en /proveedores ("Ecosistema de viaje").
 * IMPORTANTE: AITRAVA NO tiene convenios con estas marcas. Todas van con status `demo`
 * y la app muestra el disclaimer. Solo un proveedor `active` (con acuerdo real, cargado
 * desde /admin/proveedores) podría presentarse como aliado.
 */
export const providers = [
  { name: 'Avianca', category: 'aerolineas', country: 'Colombia', websiteUrl: 'https://www.avianca.com', description: 'Aerolínea con rutas nacionales e internacionales.' },
  { name: 'LATAM Airlines', category: 'aerolineas', country: 'Chile', websiteUrl: 'https://www.latamairlines.com', description: 'Vuelos por Latinoamérica y hacia Europa y Estados Unidos.' },
  { name: 'Wingo', category: 'aerolineas', country: 'Colombia', websiteUrl: 'https://www.wingo.com', description: 'Aerolínea de bajo costo con rutas nacionales y al Caribe.' },
  { name: 'Booking.com', category: 'hoteles', country: 'Países Bajos', websiteUrl: 'https://www.booking.com', description: 'Plataforma de reservas de alojamiento.' },
  { name: 'Airbnb', category: 'hoteles', country: 'Estados Unidos', websiteUrl: 'https://www.airbnb.com', description: 'Alojamientos de anfitriones locales.' },
  { name: 'Hoteles Estelar', category: 'hoteles', country: 'Colombia', websiteUrl: 'https://www.estelarhoteles.com', description: 'Cadena hotelera colombiana.' },
  { name: 'OpenTable', category: 'restaurantes', country: 'Estados Unidos', websiteUrl: 'https://www.opentable.com', description: 'Reservas de restaurantes.' },
  { name: 'TheFork', category: 'restaurantes', country: 'Francia', websiteUrl: 'https://www.thefork.com', description: 'Reservas de restaurantes en Europa.' },
  { name: 'Civitatis', category: 'experiencias', country: 'España', websiteUrl: 'https://www.civitatis.com', description: 'Tours y actividades en español.' },
  { name: 'GetYourGuide', category: 'experiencias', country: 'Alemania', websiteUrl: 'https://www.getyourguide.com', description: 'Experiencias, entradas y tours.' },
  { name: 'Uber', category: 'transporte', country: 'Estados Unidos', websiteUrl: 'https://www.uber.com', description: 'Viajes en carro por app.' },
  { name: 'Renfe', category: 'transporte', country: 'España', websiteUrl: 'https://www.renfe.com', description: 'Trenes en España.' },
  { name: 'Expreso Bolivariano', category: 'transporte', country: 'Colombia', websiteUrl: 'https://www.bolivariano.com.co', description: 'Transporte terrestre intermunicipal.' },
  { name: 'Assist Card', category: 'seguros', country: 'Argentina', websiteUrl: 'https://www.assistcard.com', description: 'Asistencia y seguro de viaje.' },
  { name: 'Universal Assistance', category: 'seguros', country: 'Argentina', websiteUrl: 'https://www.universal-assistance.com', description: 'Asistencia al viajero.' },
];
