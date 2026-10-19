'use client';

import { AdminTitle } from '@/components/admin/common';
import { Alert, LoadingState } from '@/components/ui';
import { useConfig } from '@/lib/config';
import { formatBytes, formatCOP } from '@/lib/format';
import { CONTACT } from '@/lib/site';

export default function ConfiguracionPage() {
  const c = useConfig();
  return (
    <>
      <AdminTitle title="Configuración" text="Valores actuales. Se cambian con variables de entorno en Railway (API) y Cloudflare (app)." />
      {!c ? <LoadingState label="Cargando…" /> : (
        <div className="space-y-4">
          <dl className="card divide-y divide-line px-5 text-sm">
            {[
              ['Precio del AITRAVA Pass (PASS_PRICE_COP)', `${formatCOP(c.passPriceCop)} COP`],
              ['Link de pago (PAYMENT_URL)', c.paymentUrl],
              ['Documentos gratis por viaje', String(c.freeLimits.vaultDocumentsPerTrip)],
              ['Tamaño máximo de archivo', formatBytes(c.upload.maxBytes)],
              ['Envío de correos (SMTP_*)', c.mailEnabled ? 'Activo' : 'Sin configurar'],
              ['Correo de contacto', CONTACT.email],
              ['WhatsApp', CONTACT.whatsappDisplay],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-wrap justify-between gap-2 py-3">
                <dt className="text-text-2">{k}</dt>
                <dd className="font-semibold break-all text-navy">{v}</dd>
              </div>
            ))}
          </dl>
          {!c.mailEnabled && <Alert tone="warn">Sin SMTP los usuarios no reciben el correo de verificación. Mientras tanto, puedes verificarlos a mano desde Usuarios.</Alert>}
        </div>
      )}
    </>
  );
}
