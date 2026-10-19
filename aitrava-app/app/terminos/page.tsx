import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Términos y condiciones' };

export default function TerminosPage() {
  return (
    <LegalPage title="Términos y condiciones" updated="19 de octubre de 2026">
      <h2>1. Qué es AITRAVA</h2>
      <p>
        AITRAVA es un prototipo (producto mínimo viable) desarrollado por un equipo de estudiantes universitarios. Permite organizar viajes:
        planear, llevar un plan de ahorro, registrar reservas propias, guardar documentos, consultar el itinerario y usar herramientas durante el
        viaje. <strong>[Revisión jurídica pendiente: identificación del responsable cuando exista una persona jurídica.]</strong>
      </p>
      <h2>2. Cuenta</h2>
      <ul>
        <li>Para usar las funciones de viaje debes crear una cuenta con datos verdaderos y verificar tu correo.</li>
        <li>Eres responsable de mantener tu contraseña en secreto. No compartas tu cuenta.</li>
        <li>Puedes eliminar tu cuenta en cualquier momento desde “Mi cuenta”.</li>
      </ul>
      <h2>3. Lo que AITRAVA no hace</h2>
      <ul>
        <li>
          <strong>No vende vuelos, hoteles ni servicios turísticos.</strong> Las reservas que agregas son tuyas y las gestionas con cada
          proveedor.
        </li>
        <li>
          <strong>No custodia dinero.</strong> El plan de ahorro es una herramienta de planeación: tus ahorros quedan en tu propia cuenta y los
          aportes que registras son declarados por ti.
        </li>
        <li>No garantiza precios, disponibilidad ni ahorros. Las fechas sugeridas de pago son referencias generales.</li>
        <li>
          Las rutas de “Cómo llegar” las calcula un proveedor externo de mapas (Google Maps). Los tiempos y distancias que mostramos en la app son
          aproximados.
        </li>
      </ul>
      <h2>4. AITRAVA Pass</h2>
      <ul>
        <li>Es un pago único por un viaje específico que activa funciones adicionales para ese viaje. No es una suscripción.</li>
        <li>El pago se procesa en el checkout externo de Wompi. AITRAVA no recibe ni guarda datos de tarjetas ni claves bancarias.</li>
        <li>El Pass se activa solo cuando el pago está confirmado. El comprobante corresponde únicamente al Pass y no es una factura electrónica.</li>
        <li>
          <strong>[Revisión jurídica pendiente: política de retracto, reembolsos y garantías conforme al Estatuto del Consumidor.]</strong>
        </li>
      </ul>
      <h2>5. Contenido que subes</h2>
      <p>
        Los documentos de tu Bóveda son tuyos. Nos autorizas a almacenarlos solo para mostrártelos. No subas documentos que no necesites para tu
        viaje ni datos financieros (claves, números de tarjeta).
      </p>
      <h2>6. Proveedores mostrados</h2>
      <p>
        Las marcas que aparecen en “Proveedores” se muestran con fines demostrativos. Su aparición no implica una alianza, convenio o relación
        comercial vigente con AITRAVA.
      </p>
      <h2>7. Disponibilidad</h2>
      <p>Al ser un prototipo, el servicio puede cambiar, tener fallas o interrumpirse. Haremos lo posible por avisar los cambios importantes.</p>
      <h2>8. Contacto</h2>
      <p>Escríbenos a aitrava.25@gmail.com.</p>
    </LegalPage>
  );
}
