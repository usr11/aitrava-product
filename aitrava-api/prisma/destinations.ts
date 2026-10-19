/**
 * Destinos de Colombia para "Ayúdame a elegir" y "Destino sorpresa".
 * minBudgetPP es una referencia aproximada por persona (2 noches, COP) que solo se usa para
 * ordenar sugerencias: nunca se muestra como precio. avoidTags: avion | calor | frio | caminatas | ruido.
 */
export const destinations = [
  {
    slug: 'santa-marta',
    name: 'Santa Marta',
    region: 'Magdalena · Caribe',
    tags: ['playa', 'naturaleza', 'fiesta', 'aventura'],
    avoidTags: ['avion', 'calor', 'ruido'],
    minBudgetPP: 1_200_000,
    description:
      'La ciudad más antigua de Colombia, entre la Sierra Nevada y el mar. Playas escondidas, Tayrona a la vuelta y atardeceres naranjas.',
    itinerary: [
      {
        title: 'Llegada y atardecer',
        items: [
          'Check-in en hotel boutique del centro histórico',
          'Caminata por la bahía',
          'Cena de mariscos en el Parque de los Novios',
        ],
      },
      {
        title: 'Día de parque natural',
        items: [
          'Salida temprano al Tayrona',
          'Sendero a Cabo San Juan',
          'Almuerzo en la playa',
          'Regreso y noche libre',
        ],
      },
      {
        title: 'Mar y despedida',
        items: ['Lancha a Playa Cristal', 'Snorkel', 'Regreso a casa'],
      },
    ],
  },
  {
    slug: 'cartagena',
    name: 'Cartagena',
    region: 'Bolívar · Caribe',
    tags: ['playa', 'cultura', 'fiesta', 'comida'],
    avoidTags: ['avion', 'calor', 'ruido'],
    minBudgetPP: 1_500_000,
    description:
      'Murallas, balcones con flores, islas de agua turquesa y noches de salsa en Getsemaní.',
    itinerary: [
      {
        title: 'Ciudad amurallada',
        items: [
          'Check-in en Getsemaní',
          'Caminata por el centro histórico al atardecer',
          'Cena y salsa',
        ],
      },
      {
        title: 'Islas',
        items: [
          'Lancha a Islas del Rosario',
          'Día de playa y snorkel',
          'Noche en la muralla',
        ],
      },
      {
        title: 'Sabores y regreso',
        items: ['Tour gastronómico en Bazurto', 'Café en San Diego', 'Regreso'],
      },
    ],
  },
  {
    slug: 'san-andres',
    name: 'San Andrés',
    region: 'Archipiélago · Caribe',
    tags: ['playa', 'aventura', 'fiesta'],
    avoidTags: ['avion', 'calor'],
    minBudgetPP: 2_200_000,
    description:
      'El mar de siete colores. Buceo, cayos y una cultura raizal que mezcla inglés, creole y español.',
    itinerary: [
      {
        title: 'Llegada al paraíso',
        items: [
          'Check-in frente al mar',
          'Vuelta a la isla en carrito de golf',
          'Atardecer en West View',
        ],
      },
      {
        title: 'Cayos',
        items: [
          'Johnny Cay y Acuario',
          'Snorkel con mantarrayas',
          'Noche de reggae',
        ],
      },
      {
        title: 'Buceo y regreso',
        items: ['Bautizo de buceo', 'Almuerzo raizal', 'Vuelo de regreso'],
      },
    ],
  },
  {
    slug: 'salento',
    name: 'Salento',
    region: 'Quindío · Eje Cafetero',
    tags: ['montana', 'cafe', 'naturaleza', 'pueblo'],
    avoidTags: ['frio', 'caminatas'],
    minBudgetPP: 900_000,
    description:
      'Casas de colores, fincas cafeteras y palmas de cera de 60 metros en el Valle de Cocora.',
    itinerary: [
      {
        title: 'Pueblo de colores',
        items: [
          'Check-in en finca cafetera',
          'Calle Real y mirador',
          'Partida de tejo',
        ],
      },
      {
        title: 'Valle de palmas',
        items: [
          'Caminata por el Valle de Cocora',
          'Almuerzo de trucha',
          'Tour del café al atardecer',
        ],
      },
      {
        title: 'Café y regreso',
        items: ['Taller de catación', 'Compras de artesanías', 'Regreso'],
      },
    ],
  },
  {
    slug: 'villa-de-leyva',
    name: 'Villa de Leyva',
    region: 'Boyacá · Andes',
    tags: ['cultura', 'pueblo', 'silencio', 'comida'],
    avoidTags: ['frio'],
    minBudgetPP: 600_000,
    description:
      'Una de las plazas empedradas más grandes de Sudamérica, fósiles, viñedos y cielos llenos de estrellas.',
    itinerary: [
      {
        title: 'Plaza y calma',
        items: [
          'Check-in en casona colonial',
          'Atardecer en la plaza mayor',
          'Cena de cocina boyacense',
        ],
      },
      {
        title: 'Desierto y fósiles',
        items: [
          'El Fósil y Pozos Azules',
          'Almuerzo campestre',
          'Cata en viñedo',
        ],
      },
      {
        title: 'Mañana lenta',
        items: ['Mercado de los sábados', 'Postres del convento', 'Regreso'],
      },
    ],
  },
  {
    slug: 'guatape',
    name: 'Guatapé',
    region: 'Antioquia · Andes',
    tags: ['aventura', 'pueblo', 'naturaleza'],
    avoidTags: [],
    minBudgetPP: 700_000,
    description:
      'Zócalos de colores, una represa llena de islas y una roca de 740 escalones con la mejor vista del país.',
    itinerary: [
      {
        title: 'Pueblo de zócalos',
        items: [
          'Check-in con vista al embalse',
          'Recorrido por la calle de los zócalos',
          'Cena frente al agua',
        ],
      },
      {
        title: 'La roca y el agua',
        items: [
          'Subida a la piedra',
          'Paseo en lancha por las islas',
          'Kayak al atardecer',
        ],
      },
      {
        title: 'Adrenalina',
        items: ['Tirolesa o jet ski', 'Almuerzo típico', 'Regreso'],
      },
    ],
  },
  {
    slug: 'minca',
    name: 'Minca',
    region: 'Magdalena · Sierra Nevada',
    tags: ['naturaleza', 'montana', 'silencio', 'cafe', 'aventura'],
    avoidTags: ['avion', 'caminatas'],
    minBudgetPP: 1_000_000,
    description:
      'Un pueblo escondido en la selva de la Sierra Nevada: cascadas, café, pájaros y hamacas gigantes.',
    itinerary: [
      {
        title: 'Entre la selva',
        items: [
          'Check-in en ecolodge',
          'Caminata a cascada',
          'Noche de hamacas y estrellas',
        ],
      },
      {
        title: 'Café y aves',
        items: [
          'Avistamiento de aves al amanecer',
          'Tour por finca de cacao y café',
          'Tarde de río',
        ],
      },
      { title: 'Despedida', items: ['Mirador en la montaña', 'Regreso'] },
    ],
  },
  {
    slug: 'barichara',
    name: 'Barichara',
    region: 'Santander · Andes',
    tags: ['pueblo', 'silencio', 'cultura', 'comida'],
    avoidTags: [],
    minBudgetPP: 750_000,
    description:
      'Dicen que es el pueblo más lindo de Colombia: tapia pisada, calles de piedra amarilla y el Camino Real.',
    itinerary: [
      {
        title: 'Pueblo de piedra',
        items: [
          'Check-in en casa de tapia',
          'Mirador al atardecer',
          'Cena de cocina santandereana',
        ],
      },
      {
        title: 'Camino Real',
        items: [
          'Caminata a Guane',
          'Almuerzo en pueblo vecino',
          'Taller de papel artesanal',
        ],
      },
      { title: 'Calma', items: ['Desayuno lento', 'Regreso'] },
    ],
  },
  {
    slug: 'san-gil',
    name: 'San Gil',
    region: 'Santander · Andes',
    tags: ['aventura', 'naturaleza', 'fiesta'],
    avoidTags: ['caminatas'],
    minBudgetPP: 800_000,
    description:
      'La capital de la aventura: rafting, parapente sobre un cañón y cascadas para nadar.',
    itinerary: [
      {
        title: 'Llegada',
        items: [
          'Check-in en hostal boutique',
          'Parque El Gallineral',
          'Noche en el parque principal',
        ],
      },
      {
        title: 'Adrenalina',
        items: ['Rafting en río', 'Almuerzo típico', 'Parapente al atardecer'],
      },
      { title: 'Cascadas', items: ['Cascadas de Juan Curí', 'Regreso'] },
    ],
  },
  {
    slug: 'palomino',
    name: 'Palomino',
    region: 'La Guajira · Caribe',
    tags: ['playa', 'silencio', 'naturaleza'],
    avoidTags: ['avion', 'calor'],
    minBudgetPP: 1_100_000,
    description:
      'Donde el río baja de la Sierra y se encuentra con el mar. Hamacas, tubing y playas casi vacías.',
    itinerary: [
      {
        title: 'Desconexión',
        items: [
          'Check-in en cabaña frente al mar',
          'Hamaca y atardecer',
          'Cena a la luz de velas',
        ],
      },
      {
        title: 'Río al mar',
        items: [
          'Tubing por el río',
          'Almuerzo en la playa',
          'Yoga al atardecer',
        ],
      },
      { title: 'Adiós', items: ['Caminata por la playa', 'Regreso'] },
    ],
  },
  {
    slug: 'jardin',
    name: 'Jardín',
    region: 'Antioquia · Suroeste',
    tags: ['pueblo', 'cafe', 'montana', 'naturaleza'],
    avoidTags: [],
    minBudgetPP: 850_000,
    description:
      'Un pueblo paisa de balcones de colores, basílica neogótica, cascadas y gallitos de roca.',
    itinerary: [
      {
        title: 'Plaza de colores',
        items: ['Check-in', 'Tinto en la plaza', 'Cena típica'],
      },
      {
        title: 'Montaña',
        items: [
          'Garrucha sobre el cañón',
          'Cueva del Esplendor',
          'Tour de café',
        ],
      },
      {
        title: 'Aves y regreso',
        items: ['Avistamiento de gallito de roca', 'Regreso'],
      },
    ],
  },
  {
    slug: 'tatacoa',
    name: 'Desierto de la Tatacoa',
    region: 'Huila · Andes',
    tags: ['silencio', 'aventura', 'naturaleza'],
    avoidTags: ['calor'],
    minBudgetPP: 650_000,
    description:
      'Un desierto rojo y gris en el corazón del país con uno de los mejores cielos para ver estrellas.',
    itinerary: [
      {
        title: 'Rojo y gris',
        items: [
          'Check-in en glamping',
          'Caminata por el laberinto rojo',
          'Noche de observación astronómica',
        ],
      },
      {
        title: 'Desierto',
        items: [
          'Piscina natural',
          'Recorrido por el desierto gris',
          'Asado huilense',
        ],
      },
      { title: 'Regreso', items: ['Amanecer en el desierto', 'Regreso'] },
    ],
  },
  {
    slug: 'capurgana',
    name: 'Capurganá',
    region: 'Chocó · Caribe',
    tags: ['playa', 'aventura', 'naturaleza', 'silencio'],
    avoidTags: ['avion', 'calor', 'caminatas'],
    minBudgetPP: 1_900_000,
    description:
      'Un pueblo sin carros entre la selva y el mar, en la frontera. Caminas de una playa a otra… de otro país.',
    itinerary: [
      {
        title: 'Llegada en lancha',
        items: [
          'Lancha al pueblo',
          'Check-in en cabaña',
          'Atardecer en el muelle',
        ],
      },
      {
        title: 'De país en país',
        items: [
          'Caminata por la selva hasta la frontera',
          'Almuerzo en la playa vecina',
          'Snorkel',
        ],
      },
      { title: 'Regreso', items: ['Mañana de playa', 'Regreso'] },
    ],
  },
  {
    slug: 'leticia',
    name: 'Leticia',
    region: 'Amazonas',
    tags: ['naturaleza', 'aventura', 'cultura'],
    avoidTags: ['avion', 'calor'],
    minBudgetPP: 2_400_000,
    description:
      'La puerta al Amazonas: delfines rosados, comunidades indígenas y la triple frontera.',
    itinerary: [
      {
        title: 'Selva',
        items: [
          'Llegada y check-in',
          'Parque Santander al atardecer (loros)',
          'Cena de pescado amazónico',
        ],
      },
      {
        title: 'Río',
        items: [
          'Navegación por el río',
          'Delfines rosados',
          'Visita a comunidad indígena',
        ],
      },
      {
        title: 'Triple frontera',
        items: ['Caminata por la frontera', 'Regreso'],
      },
    ],
  },
  {
    slug: 'popayan',
    name: 'Popayán',
    region: 'Cauca · Andes',
    tags: ['cultura', 'comida', 'silencio'],
    avoidTags: ['frio'],
    minBudgetPP: 950_000,
    description:
      'La Ciudad Blanca: arquitectura colonial, Ciudad Creativa de la Gastronomía y termales cerca.',
    itinerary: [
      {
        title: 'Ciudad Blanca',
        items: [
          'Check-in en casona colonial',
          'Recorrido por el centro histórico',
          'Cena de cocina caucana',
        ],
      },
      {
        title: 'Sabores',
        items: ['Tour gastronómico', 'Morro de Tulcán', 'Termales cercanos'],
      },
      {
        title: 'Regreso',
        items: ['Desayuno con empanadas de pipián', 'Regreso'],
      },
    ],
  },
];
