/**
 * Repertorio de aliados por destino (transporte, alojamiento y experiencias).
 *
 * ⚠️ Son empresas y lugares **reales del mercado colombiano**, usados como referencia para que el
 * prototipo se sienta creíble. **No son aliados firmados todavía.** Antes de usarlos comercialmente
 * hay que confirmar precios y acuerdos con cada uno (y reemplazar los que no acepten).
 *
 * `rate` = comisión que nos deja el aliado por llevarle el cliente y gestionarle la reserva.
 * Rangos de mercado que usamos: transporte 4–6 %, alojamiento 10–15 %, experiencias 12–20 %.
 */
export type ProviderSeed = { name: string; detail: string; rate: number };

export type DestinationProviders = {
  transporte: ProviderSeed[];
  alojamiento: ProviderSeed[];
  experiencias: ProviderSeed[];
};

export const providers: Record<string, DestinationProviders> = {
  'santa-marta': {
    transporte: [
      {
        name: 'Avianca',
        detail: 'Vuelo directo a Simón Bolívar (SMR), ida y vuelta',
        rate: 0.05,
      },
      {
        name: 'Expreso Brasilia',
        detail: 'Bus cama nocturno hasta la terminal de Santa Marta',
        rate: 0.06,
      },
    ],
    alojamiento: [
      {
        name: 'Viajero Santa Marta Hostel',
        detail:
          'Habitación privada con piscina, a 3 cuadras del centro histórico',
        rate: 0.12,
      },
      {
        name: 'Masaya Santa Marta',
        detail: 'Casona colonial con terraza y desayuno incluido',
        rate: 0.13,
      },
    ],
    experiencias: [
      {
        name: 'Parque Tayrona',
        detail: 'Entrada + transporte y sendero guiado a Cabo San Juan',
        rate: 0.15,
      },
      {
        name: 'Playa Cristal en lancha',
        detail: 'Salida desde Taganga con almuerzo de pescado',
        rate: 0.18,
      },
      {
        name: 'Atardecer en Playa Blanca',
        detail: 'Tour de snorkel con equipo incluido',
        rate: 0.15,
      },
    ],
  },
  cartagena: {
    transporte: [
      {
        name: 'Wingo',
        detail: 'Vuelo directo a Rafael Núñez (CTG), ida y vuelta',
        rate: 0.05,
      },
      {
        name: 'Expreso Brasilia',
        detail: 'Bus cama directo a la terminal de Cartagena',
        rate: 0.06,
      },
    ],
    alojamiento: [
      {
        name: 'Viajero Cartagena Hostel',
        detail: 'Habitación privada en Getsemaní, con piscina y terraza',
        rate: 0.12,
      },
      {
        name: 'Hotel Movich Cartagena de Indias',
        detail: 'Habitación doble en el centro amurallado, con rooftop',
        rate: 0.14,
      },
    ],
    experiencias: [
      {
        name: 'Islas del Rosario',
        detail: 'Día completo en lancha con almuerzo en playa',
        rate: 0.18,
      },
      {
        name: 'Cartagena Connections',
        detail: 'Tour a pie por Getsemaní y el centro histórico',
        rate: 0.2,
      },
      {
        name: 'Mercado de Bazurto',
        detail: 'Recorrido gastronómico con guía local',
        rate: 0.2,
      },
    ],
  },
  'san-andres': {
    transporte: [
      {
        name: 'LATAM Colombia',
        detail: 'Vuelo directo a Gustavo Rojas Pinilla (ADZ), ida y vuelta',
        rate: 0.05,
      },
      {
        name: 'Avianca',
        detail: 'Vuelo directo a la isla + tarjeta de turismo',
        rate: 0.05,
      },
    ],
    alojamiento: [
      {
        name: 'Blue Almond Hostel',
        detail: 'Habitación privada frente al mar en San Luis',
        rate: 0.12,
      },
      {
        name: 'Hotel Casablanca',
        detail: 'Habitación doble en Spratt Bight, frente a la playa principal',
        rate: 0.13,
      },
    ],
    experiencias: [
      {
        name: 'Banda Dive Shop',
        detail: 'Bautizo de buceo con instructor certificado',
        rate: 0.18,
      },
      {
        name: 'Johnny Cay y Acuario',
        detail: 'Lancha, snorkel y almuerzo isleño',
        rate: 0.18,
      },
      {
        name: 'Vuelta a la isla',
        detail: 'Carrito de golf por West View y Hoyo Soplador',
        rate: 0.15,
      },
    ],
  },
  salento: {
    transporte: [
      {
        name: 'Expreso Bolivariano',
        detail: 'Bus directo Bogotá–Armenia + Willys a Salento',
        rate: 0.06,
      },
      {
        name: 'LATAM Colombia',
        detail: 'Vuelo a El Edén (AXM) + traslado compartido',
        rate: 0.05,
      },
    ],
    alojamiento: [
      {
        name: 'La Serrana Eco Farm',
        detail: 'Habitación privada en finca con vista al valle y desayuno',
        rate: 0.13,
      },
      {
        name: 'Hotel Salento Real',
        detail: 'Habitación doble a media cuadra de la Calle Real',
        rate: 0.12,
      },
    ],
    experiencias: [
      {
        name: 'Finca El Ocaso',
        detail: 'Tour de café de la semilla a la taza, con catación',
        rate: 0.18,
      },
      {
        name: 'Valle de Cocora',
        detail: 'Willys ida y vuelta + caminata guiada entre palmas de cera',
        rate: 0.15,
      },
      {
        name: 'Los Amigos Billar Bar',
        detail: 'Noche de tejo con guía local',
        rate: 0.2,
      },
    ],
  },
  'villa-de-leyva': {
    transporte: [
      {
        name: 'Autobuses Libertadores',
        detail: 'Bus Bogotá–Villa de Leyva, ida y vuelta',
        rate: 0.06,
      },
      {
        name: 'Transporte puerta a puerta',
        detail: 'Van compartida desde el norte de Bogotá',
        rate: 0.05,
      },
    ],
    alojamiento: [
      {
        name: 'Renacer Hostel',
        detail: 'Cabaña privada con jardín, a 10 minutos de la plaza',
        rate: 0.12,
      },
      {
        name: 'Hotel Plaza Mayor',
        detail: 'Habitación doble en casona colonial frente a la plaza',
        rate: 0.14,
      },
    ],
    experiencias: [
      {
        name: 'Viñedo Ain Karim',
        detail: 'Recorrido por los viñedos con cata de 4 vinos',
        rate: 0.18,
      },
      {
        name: 'Museo El Fósil',
        detail: 'Entrada al kronosaurio + Pozos Azules',
        rate: 0.15,
      },
      {
        name: 'Observación de estrellas',
        detail: 'Noche de astronomía con telescopio en el desierto',
        rate: 0.2,
      },
    ],
  },
  guatape: {
    transporte: [
      {
        name: 'Sotrasanvicente',
        detail: 'Bus desde la Terminal del Norte de Medellín, ida y vuelta',
        rate: 0.06,
      },
      {
        name: 'Traslado privado',
        detail: 'Camioneta desde el aeropuerto José María Córdova',
        rate: 0.05,
      },
    ],
    alojamiento: [
      {
        name: 'Lake View Hostel',
        detail: 'Habitación privada con vista al embalse',
        rate: 0.12,
      },
      {
        name: 'Bosko',
        detail: 'Domo geodésico con jacuzzi y vista al Peñol',
        rate: 0.15,
      },
    ],
    experiencias: [
      {
        name: 'Piedra del Peñol',
        detail: 'Entrada a los 740 escalones y mirador',
        rate: 0.15,
      },
      {
        name: 'Paseo en lancha por el embalse',
        detail: '2 horas entre islas con guía',
        rate: 0.18,
      },
      {
        name: 'Kayak al atardecer',
        detail: 'Alquiler con instructor en el malecón',
        rate: 0.2,
      },
    ],
  },
  minca: {
    transporte: [
      {
        name: 'Avianca',
        detail: 'Vuelo a Santa Marta (SMR) + 4x4 compartido a la montaña',
        rate: 0.05,
      },
      {
        name: 'Expreso Brasilia',
        detail: 'Bus a Santa Marta + colectivo 4x4 hasta Minca',
        rate: 0.06,
      },
    ],
    alojamiento: [
      {
        name: 'Casa Elemento',
        detail: 'Cabaña privada en la montaña, con las hamacas gigantes',
        rate: 0.13,
      },
      {
        name: 'Minca Ecohabs',
        detail: 'Ecohabitación entre la selva, con desayuno',
        rate: 0.14,
      },
    ],
    experiencias: [
      {
        name: 'Finca La Victoria',
        detail: 'Tour por el beneficiadero de café de 1892',
        rate: 0.18,
      },
      {
        name: 'Cascadas de Marinka',
        detail: 'Entrada + caminata guiada',
        rate: 0.15,
      },
      {
        name: 'Avistamiento de aves',
        detail: 'Salida al amanecer con guía local',
        rate: 0.2,
      },
    ],
  },
  barichara: {
    transporte: [
      {
        name: 'Berlinas del Fonce',
        detail: 'Bus Bogotá–San Gil + buseta a Barichara',
        rate: 0.06,
      },
      {
        name: 'Copetran',
        detail: 'Bus cama a San Gil, ida y vuelta',
        rate: 0.06,
      },
    ],
    alojamiento: [
      {
        name: 'La Nube Posada',
        detail: 'Habitación en casa de tapia pisada con patio interior',
        rate: 0.13,
      },
      {
        name: 'Color de Hormiga Posada',
        detail: 'Habitación doble con vista al cañón del Suárez',
        rate: 0.13,
      },
    ],
    experiencias: [
      {
        name: 'Camino Real a Guane',
        detail: 'Caminata guiada de 5 km por el sendero histórico',
        rate: 0.2,
      },
      {
        name: 'Taller de papel de fique',
        detail: 'Taller artesanal de hora y media',
        rate: 0.2,
      },
      {
        name: 'Cata de hormiga culona',
        detail: 'Degustación con productor local',
        rate: 0.18,
      },
    ],
  },
  'san-gil': {
    transporte: [
      {
        name: 'Copetran',
        detail: 'Bus cama Bogotá–San Gil, ida y vuelta',
        rate: 0.06,
      },
      {
        name: 'Berlinas del Fonce',
        detail: 'Bus directo a la terminal de San Gil',
        rate: 0.06,
      },
    ],
    alojamiento: [
      {
        name: "Sam's VIP Hostel",
        detail: 'Habitación privada con piscina, frente al parque principal',
        rate: 0.12,
      },
      {
        name: 'Hotel Boutique Waterfall',
        detail: 'Habitación doble a orillas del río Fonce',
        rate: 0.13,
      },
    ],
    experiencias: [
      {
        name: 'Colombia Rafting Expeditions',
        detail: 'Rafting nivel 3 en el río Fonce con equipo',
        rate: 0.18,
      },
      {
        name: 'Parapente en el Cañón del Chicamocha',
        detail: 'Vuelo tándem de 20 minutos',
        rate: 0.2,
      },
      {
        name: 'Cascadas de Juan Curí',
        detail: 'Entrada + rapel opcional',
        rate: 0.15,
      },
    ],
  },
  palomino: {
    transporte: [
      {
        name: 'Avianca',
        detail: 'Vuelo a Santa Marta (SMR) + shuttle a Palomino',
        rate: 0.05,
      },
      {
        name: 'Expreso Brasilia',
        detail: 'Bus a Santa Marta + colectivo por la Troncal del Caribe',
        rate: 0.06,
      },
    ],
    alojamiento: [
      {
        name: 'The Dreamer Palomino',
        detail: 'Cabaña privada con piscina, a 5 minutos de la playa',
        rate: 0.12,
      },
      {
        name: 'Aité Eco Hotel',
        detail: 'Bungalow frente al mar con desayuno',
        rate: 0.14,
      },
    ],
    experiencias: [
      {
        name: 'Tubing por el río Palomino',
        detail: 'Neumático, guía y caminata de subida',
        rate: 0.2,
      },
      {
        name: 'Clase de yoga al atardecer',
        detail: 'Sesión en la playa con profesor local',
        rate: 0.2,
      },
      {
        name: 'Cabalgata a la Sierra',
        detail: 'Paseo de 2 horas hasta un mirador',
        rate: 0.18,
      },
    ],
  },
  jardin: {
    transporte: [
      {
        name: 'Rápido Ochoa',
        detail: 'Bus Medellín–Jardín, ida y vuelta',
        rate: 0.06,
      },
      {
        name: 'Traslado privado',
        detail: 'Camioneta desde el aeropuerto de Rionegro',
        rate: 0.05,
      },
    ],
    alojamiento: [
      {
        name: 'Casa Passiflora',
        detail: 'Habitación privada en casa de balcones, cerca de la plaza',
        rate: 0.12,
      },
      {
        name: 'Hotel Hacienda Balandú',
        detail: 'Habitación doble con piscina y vista al valle',
        rate: 0.14,
      },
    ],
    experiencias: [
      {
        name: 'Cueva del Esplendor',
        detail: 'Cabalgata + caminata con guía hasta la cascada interior',
        rate: 0.2,
      },
      {
        name: 'Garrucha de Jardín',
        detail: 'Cable sobre el cañón hasta el mirador',
        rate: 0.15,
      },
      {
        name: 'Reserva del Gallito de Roca',
        detail: 'Avistamiento del ave al atardecer',
        rate: 0.2,
      },
    ],
  },
  tatacoa: {
    transporte: [
      {
        name: 'Coomotor',
        detail: 'Bus Bogotá–Neiva + jeep a Villavieja',
        rate: 0.06,
      },
      {
        name: 'Cootranshuila',
        detail: 'Bus a Neiva, ida y vuelta, con traslado al desierto',
        rate: 0.06,
      },
    ],
    alojamiento: [
      {
        name: 'Noches de Saturno',
        detail: 'Cabaña con piscina natural en pleno desierto',
        rate: 0.13,
      },
      {
        name: 'Bethel Bio Hotel',
        detail: 'Habitación doble con aire acondicionado en Villavieja',
        rate: 0.13,
      },
    ],
    experiencias: [
      {
        name: 'Observatorio Astronómico de la Tatacoa',
        detail: 'Noche de observación guiada con telescopio',
        rate: 0.2,
      },
      {
        name: 'Laberinto del Cuzco',
        detail: 'Caminata guiada por el desierto rojo al amanecer',
        rate: 0.18,
      },
      {
        name: 'Piscina Los Hoyos',
        detail: 'Entrada al balneario natural del desierto gris',
        rate: 0.15,
      },
    ],
  },
  capurgana: {
    transporte: [
      {
        name: 'San Germán Express',
        detail: 'Vuelo Medellín–Acandí + lancha a Capurganá',
        rate: 0.05,
      },
      {
        name: 'Lancha desde Necoclí',
        detail: 'Bus a Necoclí + lancha rápida a Capurganá',
        rate: 0.06,
      },
    ],
    alojamiento: [
      {
        name: 'Hotel Almar',
        detail: 'Cabaña frente al mar con desayuno incluido',
        rate: 0.13,
      },
      {
        name: 'Cabañas Darius',
        detail: 'Cabaña entre la selva, a dos pasos de la playa',
        rate: 0.12,
      },
    ],
    experiencias: [
      {
        name: 'Dive & Green',
        detail: 'Inmersión de buceo o salida de snorkel con guía',
        rate: 0.18,
      },
      {
        name: 'Caminata a Sapzurro y La Miel',
        detail: 'Sendero por la selva hasta la frontera con Panamá',
        rate: 0.2,
      },
      {
        name: 'El Cielo',
        detail: 'Caminata por el río hasta la cascada',
        rate: 0.2,
      },
    ],
  },
  leticia: {
    transporte: [
      {
        name: 'LATAM Colombia',
        detail: 'Vuelo directo a Alfredo Vásquez Cobo (LET), ida y vuelta',
        rate: 0.05,
      },
      {
        name: 'Avianca',
        detail: 'Vuelo a Leticia + tasa de ingreso al Amazonas',
        rate: 0.05,
      },
    ],
    alojamiento: [
      {
        name: 'Hotel Waira Suites',
        detail: 'Habitación doble con piscina, cerca del malecón',
        rate: 0.13,
      },
      {
        name: 'Amazon Bed & Breakfast',
        detail: 'Habitación privada con desayuno amazónico',
        rate: 0.12,
      },
    ],
    experiencias: [
      {
        name: 'Reserva Natural Tanimboca',
        detail: 'Canopy entre los árboles y caminata nocturna',
        rate: 0.2,
      },
      {
        name: 'Puerto Nariño y delfines rosados',
        detail: 'Navegación de día completo por el río Amazonas',
        rate: 0.18,
      },
      {
        name: 'Comunidad indígena Macedonia',
        detail: 'Visita guiada con artesanos locales',
        rate: 0.2,
      },
    ],
  },
  popayan: {
    transporte: [
      {
        name: 'Expreso Bolivariano',
        detail: 'Bus cama Bogotá–Popayán, ida y vuelta',
        rate: 0.06,
      },
      {
        name: 'Avianca',
        detail: 'Vuelo a Guillermo León Valencia (PPN) vía Bogotá',
        rate: 0.05,
      },
    ],
    alojamiento: [
      {
        name: 'Parklife Hostel',
        detail: 'Habitación privada en casona frente al Parque Caldas',
        rate: 0.12,
      },
      {
        name: 'Hotel Dann Monasterio',
        detail: 'Habitación doble en un convento del siglo XVII',
        rate: 0.14,
      },
    ],
    experiencias: [
      {
        name: 'Ruta gastronómica del pipián',
        detail: 'Recorrido con cocineras tradicionales',
        rate: 0.2,
      },
      {
        name: 'Termales de Coconuco',
        detail: 'Entrada + transporte a las aguas termales',
        rate: 0.18,
      },
      {
        name: 'Morro de Tulcán',
        detail: 'Caminata guiada al atardecer con vista a la ciudad',
        rate: 0.2,
      },
    ],
  },
};
