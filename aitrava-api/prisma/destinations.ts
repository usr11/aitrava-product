/**
 * Catálogo curado de destinos (Colombia). Precios de referencia por persona para 2 noches, en COP,
 * incluyendo transporte desde el interior. avoidTags: avion | calor | frio | caminatas | ruido.
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
    clueBank: [
      {
        type: 'empacar',
        text: 'Vestido de baño, bloqueador y unos tenis que aguanten un sendero entre selva y mar.',
      },
      {
        type: 'clima',
        text: 'Harás 32 °C a la sombra, pero en las tardes baja una brisa que viene de la montaña.',
      },
      {
        type: 'comida',
        text: 'Prepárate para un pescado frito con patacón y arroz de coco frente al mar.',
      },
      {
        type: 'musica',
        text: 'Allá nació uno de los futbolistas más famosos del país… y también suena mucho vallenato.',
      },
      {
        type: 'cultura',
        text: 'Es la ciudad más antigua que sigue en pie en el país. Fundada en 1525.',
      },
    ],
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
    clueBank: [
      {
        type: 'empacar',
        text: 'Ropa fresca y clara, sombrero y algo elegante para una noche especial.',
      },
      {
        type: 'clima',
        text: 'Húmedo y caliente todo el año. El mejor momento para caminar es cuando cae el sol.',
      },
      {
        type: 'comida',
        text: 'Vas a probar posta negra, arepa de huevo y una limonada de coco que no vas a olvidar.',
      },
      {
        type: 'musica',
        text: 'La champeta suena en cada esquina y la salsa se baila hasta tarde.',
      },
      {
        type: 'cultura',
        text: 'Una ciudad rodeada de murallas de piedra que protegían contra piratas.',
      },
    ],
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
    clueBank: [
      {
        type: 'empacar',
        text: 'Careta de snorkel si tienes, sandalias y el documento de identidad a la mano.',
      },
      {
        type: 'clima',
        text: 'Sol casi todo el día y un viento que te despeina rico. El agua está tibia.',
      },
      {
        type: 'comida',
        text: 'Rondón: una sopa de coco con pescado, caracol y bola de plátano.',
      },
      {
        type: 'musica',
        text: 'Escucharás reggae, calypso y gente hablando en creole.',
      },
      {
        type: 'cultura',
        text: 'Vas a necesitar una tarjeta especial para entrar a tu destino.',
      },
    ],
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
    clueBank: [
      {
        type: 'empacar',
        text: 'Una chaqueta impermeable y botas que se puedan embarrar.',
      },
      {
        type: 'clima',
        text: 'Mañanas frescas, tardes con neblina y quizá un aguacero corto.',
      },
      {
        type: 'comida',
        text: 'Trucha con patacón gigante y un café que sabe distinto porque lo tomas donde lo cultivan.',
      },
      {
        type: 'musica',
        text: 'En la plaza verás gente jugando tejo mientras suena música de carrilera.',
      },
      {
        type: 'cultura',
        text: 'Verás el árbol nacional de Colombia… y es más alto que un edificio de 20 pisos.',
      },
    ],
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
    clueBank: [
      {
        type: 'empacar',
        text: 'Zapatos cómodos para piedra, un saco para la noche y ganas de caminar despacio.',
      },
      {
        type: 'clima',
        text: 'Días soleados y secos; en la noche refresca y el cielo se llena de estrellas.',
      },
      {
        type: 'comida',
        text: 'Vas a probar vino de altura y un postre con arequipe hecho por monjas.',
      },
      {
        type: 'musica',
        text: 'Si tienes suerte, te toca un festival de cometas o de luces.',
      },
      {
        type: 'cultura',
        text: 'Cerca de allí encontraron el fósil de un reptil marino de 120 millones de años.',
      },
    ],
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
    clueBank: [
      {
        type: 'empacar',
        text: 'Buenas piernas: vas a subir más de 700 escalones. Lleva agua.',
      },
      {
        type: 'clima',
        text: 'Templado y agradable, con lluvias rápidas en la tarde.',
      },
      {
        type: 'comida',
        text: 'Bandeja paisa frente al agua y una trucha en salsa de coco.',
      },
      {
        type: 'musica',
        text: 'Música popular en los balcones y parlantes en las lanchas.',
      },
      {
        type: 'cultura',
        text: 'Las fachadas del pueblo cuentan historias con figuras en relieve pintadas a mano.',
      },
    ],
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
    clueBank: [
      {
        type: 'empacar',
        text: 'Repelente, linterna y ropa que se pueda mojar.',
      },
      {
        type: 'clima',
        text: 'Caluroso abajo, fresco arriba. Llueve de repente y escampa rápido.',
      },
      {
        type: 'comida',
        text: 'Cacao recién tostado y un café orgánico cultivado entre la selva.',
      },
      {
        type: 'musica',
        text: 'Lo que más vas a oír son pájaros: hay cientos de especies.',
      },
      {
        type: 'cultura',
        text: 'Desde allí, en un día despejado, se ven a la vez montañas nevadas y el mar.',
      },
    ],
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
    clueBank: [
      {
        type: 'empacar',
        text: 'Sombrero, bloqueador y una libreta: es un lugar para escribir y no hacer nada.',
      },
      {
        type: 'clima',
        text: 'Seco y soleado, las tardes son doradas y las noches tibias.',
      },
      { type: 'comida', text: 'Te van a ofrecer hormigas… y te van a gustar.' },
      {
        type: 'musica',
        text: 'Silencio, campanas de iglesia y algún tiple a lo lejos.',
      },
      {
        type: 'cultura',
        text: 'Las casas están hechas con tierra pisada, una técnica de hace siglos.',
      },
    ],
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
    clueBank: [
      {
        type: 'empacar',
        text: 'Ropa que se pueda mojar, zapatos acuáticos y valentía.',
      },
      { type: 'clima', text: 'Caliente de día; perfecto para tirarse al río.' },
      {
        type: 'comida',
        text: 'Carne oreada, pepitoria y una arepa de maíz pelado.',
      },
      {
        type: 'musica',
        text: 'En las noches, parranda con música de carrilera y cerveza fría.',
      },
      {
        type: 'cultura',
        text: 'Vas a volar sobre uno de los cañones más profundos del continente.',
      },
    ],
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
    clueBank: [
      {
        type: 'empacar',
        text: 'Lo mínimo: vestido de baño, un libro y cero afán.',
      },
      {
        type: 'clima',
        text: 'Calor rico, brisa de mar y lluvias cortas en la tarde.',
      },
      {
        type: 'comida',
        text: 'Pescado del día y jugos de frutas que no sabías que existían.',
      },
      { type: 'musica', text: 'Olas, un tambor lejano y reggae en el hostal.' },
      {
        type: 'cultura',
        text: 'Bajarás un río flotando en un neumático hasta llegar al mar.',
      },
    ],
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
    clueBank: [
      {
        type: 'empacar',
        text: 'Botas de caminar y algo abrigado para la noche.',
      },
      {
        type: 'clima',
        text: 'Templado; en las tardes baja una neblina que envuelve la plaza.',
      },
      {
        type: 'comida',
        text: 'Trucha, dulces de la región y un tinto en la plaza viendo pasar caballos.',
      },
      {
        type: 'musica',
        text: 'Música de despecho en las sillas de colores de la plaza.',
      },
      {
        type: 'cultura',
        text: 'Verás un pájaro naranja brillante que parece de mentiras.',
      },
    ],
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
    clueBank: [
      {
        type: 'empacar',
        text: 'Gorra, mucha agua y una chaqueta liviana para la madrugada.',
      },
      {
        type: 'clima',
        text: 'De día pasa los 35 °C; de noche el cielo se abre por completo.',
      },
      { type: 'comida', text: 'Asado huilense y dulces de leche de cabra.' },
      {
        type: 'musica',
        text: 'San Juanero, y un silencio que casi se escucha.',
      },
      {
        type: 'cultura',
        text: 'Verás planetas por un telescopio en medio de la nada.',
      },
    ],
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
    clueBank: [
      {
        type: 'empacar',
        text: 'Morral pequeño, bolsa seca y efectivo: allá no todo acepta tarjeta.',
      },
      {
        type: 'clima',
        text: 'Caliente, húmedo y con aguaceros tropicales que refrescan.',
      },
      {
        type: 'comida',
        text: 'Langosta al ajillo y coco recién bajado de la palma.',
      },
      { type: 'musica', text: 'Chirimía, olas y ni un solo pito de carro.' },
      {
        type: 'cultura',
        text: 'Podrás almorzar en otro país y volver caminando.',
      },
    ],
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
    clueBank: [
      {
        type: 'empacar',
        text: 'Manga larga, repelente fuerte y botas de caucho.',
      },
      {
        type: 'clima',
        text: 'Húmedo, caliente y con lluvias intensas que duran poco.',
      },
      {
        type: 'comida',
        text: 'Pirarucú, uno de los peces de agua dulce más grandes del mundo.',
      },
      {
        type: 'musica',
        text: 'Al atardecer, miles de loros hacen un concierto en el parque.',
      },
      { type: 'cultura', text: 'Estarás a minutos de dos países más.' },
    ],
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
    clueBank: [
      { type: 'empacar', text: 'Un saco, zapatos cómodos y mucho apetito.' },
      { type: 'clima', text: 'Primaveral: días templados y noches frescas.' },
      {
        type: 'comida',
        text: 'Empanadas de pipián con salsa de maní y un salpicón de guanábana.',
      },
      {
        type: 'musica',
        text: 'Procesiones con música de chirimía en Semana Santa.',
      },
      {
        type: 'cultura',
        text: 'Todas las fachadas del centro son del mismo color.',
      },
    ],
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
