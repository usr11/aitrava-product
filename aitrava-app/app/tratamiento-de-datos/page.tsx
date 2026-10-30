import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Tratamiento de datos personales' };

export default function TratamientoPage() {
  return (
    <LegalPage title="Autorización de tratamiento de datos" updated="29 de octubre de 2026">
      <p>
        De acuerdo con la Ley 1581 de 2012 y sus decretos reglamentarios, al apartar un cupo, unirte a la lista de espera, postularte como anfitrión o
        responder la encuesta, autorizas a AiTrava a tratar tus datos personales con estas finalidades:
      </p>
      <ul>
        <li>Contactarte por WhatsApp para confirmar tu cupo, coordinar la salida y avisarte de próximas salidas.</li>
        <li>Compartir con el anfitrión de tu salida lo necesario para atenderte.</li>
        <li>Analizar de forma agregada el funcionamiento del proyecto.</li>
      </ul>
      <h2>Tus derechos</h2>
      <p>
        Puedes conocer, actualizar, rectificar y suprimir tus datos, y revocar esta autorización, escribiendo a aitrava.25@gmail.com. Responderemos en
        los plazos de la ley.
      </p>
      <h2>Responsable</h2>
      <p>
        Equipo AiTrava, proyecto universitario en Cali. <strong>[Revisión jurídica pendiente: datos del responsable cuando exista una persona jurídica.]</strong>
      </p>
    </LegalPage>
  );
}
