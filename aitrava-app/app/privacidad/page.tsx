import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Política de privacidad' };

export default function PrivacidadPage() {
  return (
    <LegalPage title="Política de privacidad" updated="29 de octubre de 2026">
      <h2>1. Qué datos recogemos</h2>
      <ul>
        <li>Al apartar un cupo: nombre, WhatsApp, correo (opcional) y tus respuestas al formulario (motivación, si vienes solo, si estás en Cali, cómo nos conociste).</li>
        <li>En la lista de espera: nombre, WhatsApp y el tipo de salida que prefieres.</li>
        <li>En la encuesta de cierre: tus respuestas sobre la salida.</li>
        <li>Datos de uso anónimos: páginas visitadas, la versión del mensaje que viste y el canal por el que llegaste. No guardamos tu nombre ni tu número en estos datos.</li>
      </ul>
      <h2>2. Para qué los usamos</h2>
      <ul>
        <li>Confirmar tu cupo, coordinar la salida y crear el grupo de WhatsApp de los asistentes.</li>
        <li>Armar grupos con intenciones parecidas y mejorar las próximas salidas.</li>
        <li>Medir, de forma agregada, si el proyecto funciona (por ejemplo, cuántas personas vuelven).</li>
      </ul>
      <h2>3. Con quién los compartimos</h2>
      <ul>
        <li>Con el anfitrión de tu salida: tu nombre y lo necesario para atenderte.</li>
        <li>No vendemos ni cedemos tus datos a terceros.</li>
      </ul>
      <h2>4. Seguridad</h2>
      <p>Tu reserva se abre con un enlace secreto; en nuestra base de datos solo guardamos una huella de ese enlace, no el enlace.</p>
      <h2>5. Tus derechos</h2>
      <p>Puedes conocer, actualizar, rectificar o pedir que borremos tus datos escribiendo a aitrava.25@gmail.com.</p>
    </LegalPage>
  );
}
