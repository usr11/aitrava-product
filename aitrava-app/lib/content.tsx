import Link from 'next/link';
import type { QA } from '@/components/landing/Faq';

/** Reglas de seguridad que no se negocian (documento §2.5). */
export const SAFETY = [
  { title: 'Lugares públicos o controlados', text: 'Solo lugares públicos, operadores con Registro Nacional de Turismo (RNT) o espacios controlados.' },
  { title: 'Conoces al grupo antes', text: 'Te agregamos a un grupo de WhatsApp con los asistentes 24 horas antes, moderado por AiTrava.' },
  { title: 'Alguien del equipo va contigo', text: 'En cada salida hay mínimo una persona del equipo de AiTrava.' },
  { title: 'Reglas claras desde el inicio', text: 'Al reservar aceptas la regla de convivencia y el consentimiento informado.' },
  { title: 'Grupos solo de mujeres', text: 'Abrimos salidas solo para mujeres cuando hay interés.' },
  { title: 'Canal para reportar', text: 'Puedes reportar cualquier incidente por WhatsApp o correo, antes, durante o después de la salida.' },
  { title: 'Naturaleza con guía y póliza', text: 'En naturaleza vamos solo con guía con tarjeta profesional y RNT, y con póliza de accidentes por día incluida en el precio.' },
];

export const FAQ: QA[] = [
  {
    q: '¿De verdad puedo ir solo?',
    a: 'Sí, es la idea. La mayoría llega sin conocer a nadie. Los primeros 20 minutos usamos tarjetas rompehielos para que la conversación arranque sola.',
  },
  {
    q: '¿Cómo pago?',
    a: 'Depende de la salida y siempre te lo mostramos antes de pagar. Si tiene pago en línea, al comprar tu cupo pagas con Wompi, desde tu banco o con tarjeta. Si no, te escribimos por WhatsApp con los datos de pago del anfitrión. En esta página nunca te pedimos datos de tarjeta.',
  },
  {
    q: '¿Y si no puedo ir?',
    a: (
      <>
        Te devolvemos el 100 % si cancelas con 72 horas o más; el 50 % entre 72 y 24 horas; o puedes ceder tu cupo a otra persona sin costo. Si la salida
        no se realiza, te devolvemos todo. Detalles en{' '}
        <Link href="/ayuda" className="link">
          preguntas y reembolsos
        </Link>
        .
      </>
    ),
  },
  {
    q: '¿Y si no se llena el grupo?',
    a: 'Cada salida tiene un mínimo de personas. Si no se llega, la cancelamos con tiempo y te devolvemos el 100 %.',
  },
  {
    q: '¿Tengo que dejar el celular?',
    a: 'No. El reto del sobre sellado es voluntario. Si te animas, lo abres al final para tomar una sola foto del grupo.',
  },
  {
    q: '¿Qué tan seguro es?',
    a: (
      <>
        Vamos a lugares públicos o controlados, con anfitriones registrados, alguien del equipo presente y póliza en naturaleza. Lee las{' '}
        <Link href="/seguridad" className="link">
          reglas de seguridad
        </Link>
        .
      </>
    ),
  },
];

/** Quiénes somos, qué hacemos, diferenciador, misión y visión (texto del equipo, 2026-11-01). */
export const ABOUT = {
  who: [
    'AITRAVA es una plataforma que conecta personas que quieren vivir nuevas experiencias con anfitriones y negocios que tienen algo diferente por ofrecer.',
    'Ayudamos a las personas a descubrir y reservar planes sin depender de tener un grupo previamente organizado, mientras ayudamos a anfitriones locales a atraer nuevos clientes y comercializar sus experiencias.',
  ],
  what: {
    title: 'Descubre. Reserva. Vive.',
    text: [
      'En AITRAVA reunimos experiencias de anfitriones locales, facilitamos su descubrimiento y reserva y ayudamos a formar grupos de personas interesadas en vivirlas.',
      'Empezamos con experiencias locales sencillas para validar el modelo y progresivamente incorporaremos experiencias de naturaleza, cultura y turismo en diferentes regiones de Colombia.',
    ],
  },
  difference: {
    title: 'No necesitas tener el parche antes de hacer el plan.',
    text: 'AITRAVA no solo muestra lugares o recomienda qué hacer. Conecta la oferta de anfitriones con personas interesadas, facilita la reserva y ayuda a convertir una intención de hacer un plan en una experiencia que realmente sucede.',
  },
  mission:
    'Facilitar que más personas descubran y vivan experiencias memorables, conectándolas con anfitriones locales y simplificando el proceso de encontrar, reservar y compartir nuevos planes.',
  vision: [
    'Construir un ecosistema colombiano de experiencias y viajes que comience conectando personas con anfitriones y actividades locales y evolucione hacia una plataforma nacional desde la cual sea posible descubrir, planificar y comprar los diferentes componentes de un viaje en un solo lugar.',
    'A largo plazo, AITRAVA busca integrar experiencias de naturaleza y cultura en todo Colombia y, mediante alianzas comerciales con proveedores de transporte, alojamiento, gastronomía, actividades y otros servicios turísticos, facilitar que el viajero pueda construir y comprar su viaje directamente desde AITRAVA.',
  ],
};

export const HOST_WHATSAPP_TEXT = 'Hola, tengo una experiencia o negocio y quiero ser anfitrión en AITRAVA.';
