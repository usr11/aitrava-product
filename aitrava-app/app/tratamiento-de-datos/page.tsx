import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Tratamiento de datos personales' };

export default function TratamientoPage() {
  return (
    <LegalPage title="Política de tratamiento de datos personales" updated="19 de octubre de 2026">
      <p>Documento preliminar elaborado como referencia frente a la Ley 1581 de 2012 y sus decretos reglamentarios.</p>
      <h2>Responsable del proyecto</h2>
      <p>
        Equipo del proyecto universitario AITRAVA (Sebastián Jiménez, Juan Pablo Zambrano, Heiner Rincón y Alejandro Lozada). Contacto:
        aitrava.25@gmail.com. <strong>[Revisión jurídica pendiente: no existe aún una persona jurídica responsable.]</strong>
      </p>
      <h2>Finalidades</h2>
      <ul>
        <li>Crear y administrar tu cuenta y verificar tu correo.</li>
        <li>Prestar las funciones de planeación, ahorro, organización y acompañamiento del viaje.</li>
        <li>Procesar y verificar el pago del AITRAVA Pass y emitir comprobantes.</li>
        <li>Atender solicitudes enviadas por contacto, WhatsApp o correo.</li>
        <li>Generar estadísticas agregadas para la validación académica del producto.</li>
      </ul>
      <h2>Datos recolectados</h2>
      <p>Identificación y contacto (nombre, apellido, correo), información de tus viajes, documentos que decidas subir, registros de uso y estado de pagos. No solicitamos datos sensibles ni financieros.</p>
      <h2>Autorización</h2>
      <p>Al crear tu cuenta marcas la casilla de autorización. Guardamos la fecha en que la diste. Puedes revocarla eliminando tu cuenta o escribiéndonos.</p>
      <h2>Derechos del titular</h2>
      <ul>
        <li>Conocer, actualizar y rectificar tus datos.</li>
        <li>Solicitar prueba de la autorización.</li>
        <li>Ser informado del uso que se da a tus datos.</li>
        <li>Revocar la autorización y solicitar la supresión de tus datos.</li>
        <li>Presentar quejas ante la Superintendencia de Industria y Comercio.</li>
      </ul>
      <h2>Seguridad</h2>
      <p>Contraseñas cifradas, acceso a viajes y documentos solo con sesión, archivos privados sin enlaces públicos, validación de archivos y acceso administrativo restringido a los integrantes autorizados del equipo.</p>
      <h2>Conservación</h2>
      <p>Conservamos tus datos mientras tengas una cuenta activa o mientras dure el proyecto académico. Los registros de pagos aprobados se conservan sin datos personales adicionales con fines contables.</p>
      <h2>Contacto</h2>
      <p>aitrava.25@gmail.com</p>
    </LegalPage>
  );
}
