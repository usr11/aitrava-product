import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Términos y condiciones' };

export default function TerminosPage() {
  return (
    <LegalPage title="Términos y condiciones" updated="29 de octubre de 2026">
      <h2>1. Qué es AiTrava</h2>
      <p>
        AiTrava es un proyecto universitario en etapa de prueba que organiza salidas en grupos pequeños a lugares de naturaleza y cultura en Cali y sus
        alrededores. AiTrava arma el grupo, cura el plan con un anfitrión local y coordina la salida.{' '}
        <strong>[Revisión jurídica pendiente: identificación del responsable cuando exista una persona jurídica.]</strong>
      </p>
      <h2>2. Cómo funciona una reserva</h2>
      <ul>
        <li>Apartas un cupo con tu nombre y tu WhatsApp, sin crear cuenta. El cupo queda apartado hasta 48 horas mientras se confirma el pago.</li>
        <li>Al apartar aceptas el precio, la fecha, la política de reembolso, la regla de convivencia y el consentimiento informado.</li>
        <li>Según la salida, pagas en línea con Wompi al comprar tu cupo, o el equipo te confirma por WhatsApp y te comparte los datos de pago del anfitrión. En ambos casos tu pago queda asociado a tu referencia AITRAVA-C.</li>
        <li>Tu reserva se ve en un enlace privado. No lo compartas: quien lo tenga puede ver y cancelar tu reserva.</li>
      </ul>
      <h2>3. Pagos</h2>
      <ul>
        <li>
          <strong>Siempre ves cómo pagas antes de hacerlo.</strong> Los pagos en línea los procesa Wompi; AiTrava nunca te pide datos de tarjeta ni claves bancarias en esta página. <strong>[Pendiente del equipo: quién recibe los pagos en línea y cómo se liquida con el anfitrión (roadmap D7).]</strong>
        </li>
      </ul>
      <h2>4. Cancelaciones y reembolsos</h2>
      <ul>
        <li>100 % si cancelas con 72 horas o más de anticipación; 50 % entre 72 y 24 horas; sin devolución con menos de 24 horas, pero puedes ceder tu cupo sin costo.</li>
        <li>100 % si la salida no se realiza (clima, seguridad o no se llega al mínimo de personas).</li>
        <li>El reembolso lo hace el anfitrión al mismo medio de pago, con el acompañamiento de AiTrava.</li>
      </ul>
      <h2>5. Seguridad y conducta</h2>
      <p>
        Aplican las reglas de{' '}
        <Link href="/seguridad" className="link">
          seguridad y convivencia
        </Link>
        . El equipo o el anfitrión pueden pedir que se retire a quien las incumpla, sin reembolso.
      </p>
      <h2>6. Responsabilidad</h2>
      <ul>
        <li>La actividad la presta el anfitrión. En salidas de naturaleza se exige guía con tarjeta profesional y RNT, y póliza de accidentes por día.</li>
        <li>Debes informar condiciones de salud relevantes antes de la salida y seguir las indicaciones del guía.</li>
      </ul>
      <h2>7. Precios publicados</h2>
      <p>Los precios del catálogo de lugares son de referencia y estimados. El precio que aplica es el de la salida que reservas.</p>
      <h2>8. Contacto</h2>
      <p>Para cualquier duda o reclamo escríbenos por WhatsApp o a aitrava.25@gmail.com.</p>
    </LegalPage>
  );
}
