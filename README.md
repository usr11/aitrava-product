# AITRAVA · Tu viaje vive aquí

Centro de control digital del viaje + **plan de ahorro inteligente**. PMV para la materia de Innovación (proyecto universitario en desarrollo).

> **Antes de trabajar, lee [`docs/ROADMAP.md`](docs/ROADMAP.md).** Ahí están el plan, el progreso y las decisiones. La especificación completa es `docs/AITRAVA 3.docx`.

| Carpeta | Qué es | URL local |
| :-- | :-- | :-- |
| `aitrava-app/` | Frontend: Next.js 16 + Tailwind 4 (móvil primero) | http://localhost:3000 |
| `aitrava-api/` | Backend: NestJS 11 + Prisma 6 | http://localhost:4000/api |
| `docker-compose.yml` | Postgres 16 (lo único en Docker) | `localhost:5432` |
| `docs/ROADMAP.md` | Plan de trabajo con checks | — |
| `docs/DESPLIEGUE.md` | Publicar en Railway (API + BD) y Cloudflare (app) | — |

## Qué hace

- **Crear un viaje** en 5 pasos: *Sé a dónde voy*, *Ayúdame a elegir* o *Destino sorpresa*.
- **Plan de ahorro inteligente** (gratis): cuota semanal, quincenal o mensual calculada para tener la plata de cada parte del viaje (vuelo, alojamiento, actividades, seguro, gastos en destino) en la fecha en que se paga. Avisa si vas atrasado, recalcula y propone opciones si no te alcanza. AITRAVA **no guarda dinero**: el usuario registra sus aportes.
- **Mi Viaje**: cuenta regresiva, % preparado, checklist, próxima actividad, itinerario, reservas (también las compradas fuera), presupuesto y gastos.
- **Bóveda**: archivos privados (PDF/imagen, 5 MB) que solo ve su dueño; QR en grande.
- **Modo Viaje** (Pass): ahora/siguiente/después, cómo llegar (Google Maps), explora cerca (OpenStreetMap), cambiar planes.
- **AITRAVA Pass**: $39.900 por viaje vía Wompi, verificación por webhook firmado o por un admin, comprobante PDF.
- **Admin** (`/admin`): KPIs reales, embudo de 10 pasos, usuarios, viajes, pagos, finanzas (costos y margen), analítica, proveedores, mensajes, feedback, iteraciones y exportación CSV.

## Levantar todo

Requisitos: Docker, Node 22+ y pnpm.

```bash
docker compose up -d                       # 1. Base de datos

cd aitrava-api                             # 2. API (terminal 1)
cp .env.example .env                       #    solo la primera vez
pnpm install
pnpm prisma migrate dev                    #    crea las tablas
pnpm db:seed                               #    destinos, proveedores DEMO y cuentas
pnpm db:demo                               #    caso DEMO: España (en curso) y Japón 2027 (ahorro)
pnpm start:dev

cd aitrava-app                             # 3. App (terminal 2)
cp .env.example .env.local
pnpm install
pnpm dev -H 0.0.0.0                        #    -H 0.0.0.0 para abrirla desde el celular en la misma red
```

**¿El puerto 5432 ya está ocupado por otro Postgres?** (error `P1000: Authentication failed`): levanta la BD en otro puerto con `AITRAVA_DB_PORT=5433 docker compose up -d` y cambia el puerto en `DATABASE_URL` de `aitrava-api/.env` a `5433`.

Desde el celular: `http://<IP-de-tu-PC>:3000` y `NEXT_PUBLIC_API_URL="http://<IP-de-tu-PC>:4000"` en `aitrava-app/.env.local`.

**Correos en local:** sin `SMTP_*` no se envía nada; la pantalla "Verifica tu correo" muestra un enlace marcado *Solo en desarrollo* para poder probar (en producción no aparece).

## Cuentas de prueba (clave `aitrava123`, solo en local)

| Correo | Rol |
| :-- | :-- |
| `admin@aitrava.co` | Admin de respaldo (en producción solo existe si se define `ADMIN_PASSWORD`) |
| `demo@aitrava.co` | Cuenta **DEMO** para la presentación. Sus datos no cuentan en las métricas |

Los integrantes del equipo se vuelven admin poniendo sus correos en `ADMIN_EMAILS` (o desde `/admin/usuarios`).

## Comandos útiles (en `aitrava-api/`)

| Comando | Qué hace |
| :-- | :-- |
| `pnpm db:seed` | Recarga destinos, proveedores y cuentas (no borra nada) |
| `pnpm db:demo` | Rehace los viajes DEMO (correr antes de presentar) |
| `pnpm db:reset` | ⚠️ **Borra todos los datos** y vuelve a crear las tablas |
| `pnpm db:studio` | Abre Prisma Studio |

## Seguridad (resumen)

- Contraseñas con bcrypt; sesiones JWT; correo verificado obligatorio para viajes y pagos; límite de intentos en login, registro, recuperación y contacto.
- Cada consulta de viaje, documento o gasto se filtra por el dueño (equivalente a RLS). El rol admin se comprueba en la BD.
- La Bóveda valida el tipo real del archivo (no solo la extensión) y nunca expone URLs públicas.
- AITRAVA no tiene formularios de tarjeta: el pago ocurre en Wompi. Un pago solo cuenta como venta con estado `approved`.
- Las claves (JWT, SMTP, Wompi, Groq) van solo en `.env` o en las variables de Railway. Nunca en git.
