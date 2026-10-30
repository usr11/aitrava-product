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
    a: 'Apartas tu cupo en la página y te escribimos por WhatsApp. Cuando confirmamos el cupo te pasamos los datos de pago del anfitrión (Nequi, Bre-B o transferencia) y pagas directo a él con tu referencia AITRAVA-C. AiTrava no recibe tu dinero.',
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
