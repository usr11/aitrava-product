import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Política de privacidad' };

export default function PrivacidadPage() {
  return (
    <LegalPage title="Política de privacidad" updated="19 de octubre de 2026">
      <h2>Qué datos recolectamos</h2>
      <ul>
        <li><strong>Cuenta:</strong> nombre, apellido, correo y contraseña (guardada cifrada con un algoritmo de un solo sentido; nadie del equipo puede verla).</li>
        <li><strong>Viajes:</strong> destino, fechas, viajeros, presupuesto, preferencias, itinerario, reservas, gastos y tu plan de ahorro (montos declarados por ti).</li>
        <li><strong>Documentos:</strong> los archivos que subes a la Bóveda.</li>
        <li><strong>Uso de la app (analítica):</strong> páginas visitadas y acciones (por ejemplo “creó un viaje”), con un identificador anónimo del navegador. No incluye el contenido de tus documentos ni datos de pago.</li>
        <li><strong>Pagos:</strong> referencia, valor y estado del pago del Pass. Los datos de tarjeta o cuenta los maneja Wompi; AITRAVA no los recibe.</li>
        <li><strong>Ubicación:</strong> solo si la permites en Modo Viaje, para calcular distancias y lugares cercanos. No la guardamos en nuestros servidores.</li>
      </ul>
      <h2>Para qué los usamos</h2>
      <ul>
        <li>Prestarte el servicio: mostrarte tu viaje, calcular tu plan de ahorro y tu presupuesto.</li>
        <li>Verificar tu correo, recuperar tu contraseña y contactarte sobre tu cuenta.</li>
        <li>Confirmar pagos y emitir comprobantes.</li>
        <li>Medir y mejorar el producto (proyecto académico) con datos agregados.</li>
      </ul>
      <h2>Autenticación y documentos</h2>
      <p>
        Tus viajes y documentos solo se pueden consultar con tu sesión. Los archivos de la Bóveda se guardan en un almacenamiento privado y no
        tienen enlaces públicos. Validamos el tipo y el tamaño de cada archivo.
      </p>
      <h2>Proveedores tecnológicos</h2>
      <ul>
        <li>Railway (servidor y base de datos) y Cloudflare (aplicación web).</li>
        <li>Wompi (procesamiento de pagos).</li>
        <li>Proveedor de correo SMTP (correos de verificación y recuperación).</li>
        <li>Google Maps y OpenStreetMap (rutas, mapas y lugares cercanos).</li>
        <li>Meta Pixel (medición de campañas), si está activo.</li>
      </ul>
      <h2 id="cookies">Cookies y almacenamiento local</h2>
      <p>
        Usamos el almacenamiento local del navegador para mantener tu sesión y un identificador anónimo de analítica. Si está activo el Meta
        Pixel, Meta puede usar cookies propias para medir campañas. <strong>[Revisión jurídica pendiente: aviso y consentimiento de cookies no esenciales.]</strong>
      </p>
      <h2>Tus derechos</h2>
      <p>
        Puedes conocer, actualizar, rectificar y eliminar tus datos, y revocar la autorización. Desde “Mi cuenta” puedes editar tu nombre y
        eliminar tu cuenta con todos tus viajes y documentos. Para cualquier otra solicitud escríbenos.
      </p>
      <h2>Contacto</h2>
      <p>aitrava.25@gmail.com</p>
    </LegalPage>
  );
}
