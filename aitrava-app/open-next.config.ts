import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// Sin caché incremental: la app no usa ISR (todo se carga desde el API en el navegador).
export default defineCloudflareConfig({});
