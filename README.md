# AiTrava · Ve solo, sal acompañado

Salidas en grupos pequeños (6 a 10 personas) a la naturaleza y la cultura de Cali, para personas de 20 a 35 años que quieren salir de la rutina y no tienen con quién ir. AiTrava arma el grupo, cura el plan con un anfitrión local y rompe el hielo; el viajero solo tiene que llegar. PMV para la materia de Innovación.

> **Antes de trabajar, lee [`docs/ROADMAP.md`](docs/ROADMAP.md).** Ahí están el plan, el progreso y las decisiones. La propuesta completa está en `docs/AiTrava-final.md` y el modelo financiero en `docs/modelo.py`.

| Carpeta | Qué es | URL local |
| :-- | :-- | :-- |
| `aitrava-app/` | Frontend: Next.js 16 + Tailwind 4 (móvil primero) | http://localhost:3000 |
| `aitrava-api/` | Backend: NestJS 11 + Prisma 6 | http://localhost:4000/api |
| `docker-compose.yml` | Postgres 16 (lo único en Docker) | `localhost:5432` |
| `docs/DESPLIEGUE.md` | Publicar en Railway (API + BD) y Cloudflare (app) | — |

## Qué hace

- **Landing con A/B de ganchos** (*Tribu Cero* / *Reset 180°*, `?v=A` o `?v=B`) y canal medido en la URL (`?c=IG`, `?c=GRP` o `utm_source`).
- **Salidas con cupos en vivo** y **reserva sin cuenta en menos de un minuto**: pregunta filtro, perfil V1–V5, reto del celular, aceptación del precio, la fecha, el reembolso y la regla de convivencia. El cupo queda apartado 48 h.
- **Página privada de la reserva** (enlace con token): estado, WhatsApp con la referencia `AITRAVA-Cxx`, datos de pago del anfitrión cuando el equipo confirma, "Ya pagué" y cancelación con la política de reembolso. **AiTrava no recibe el dinero**: el viajero le paga al anfitrión.
- **Lista de espera**, **postulación de anfitriones** y **encuesta de cierre** de 5 preguntas.
- **Panel del equipo** (`/admin`): tablero de evidencia contra las metas (escalera de venta C3, entrega de valor C1, A/B, embudo, canales y CAC, anfitriones TC1-A, decisión de viabilidad), salidas con lista de asistentes y cierre (comisión, horas, clientes nuevos), reservas, anfitriones, lugares, lista de espera, costos y pauta, finanzas reales, **modelo financiero interactivo** (port de `modelo.py`) y registro de ajustes. Exportación CSV.

## Levantar todo

Requisitos: Docker, Node 22+ y pnpm.

```bash
docker compose up -d                       # 1. Base de datos

cd aitrava-api                             # 2. API (terminal 1)
cp .env.example .env                       #    solo la primera vez
pnpm install
pnpm prisma migrate deploy                 #    crea las tablas
pnpm db:seed                               #    14 lugares, admin local y una salida DEMO
pnpm start:dev

cd aitrava-app                             # 3. App (terminal 2)
cp .env.example .env.local
pnpm install
pnpm dev -H 0.0.0.0                        #    -H 0.0.0.0 para abrirla desde el celular en la misma red
```

**¿El puerto 5432 ya está ocupado?** Levanta la BD en otro puerto con `AITRAVA_DB_PORT=5433 docker compose up -d` y cambia el puerto en `DATABASE_URL` de `aitrava-api/.env`.

Desde el celular: `http://<IP-de-tu-PC>:3000` y `NEXT_PUBLIC_API_URL="http://<IP-de-tu-PC>:4000"` en `aitrava-app/.env.local`.

## Cuenta del equipo en local

`admin@aitrava.co` con la clave `aitrava123` (la crea el seed solo fuera de producción). En producción, cada integrante crea su cuenta en `/equipo/registro` con un correo de `ADMIN_EMAILS` y la verifica. Los viajeros **no** tienen cuenta.

## Pruebas

En `aitrava-api/`:

| Comando | Qué prueba |
| :-- | :-- |
| `pnpm test` | Unitarias: el modelo financiero reproduce las cifras de `docs/modelo.py`; reglas de cupos, perfil V1–V5, reembolso, teléfonos y canales |
| `pnpm test:e2e` | De punta a punta contra Postgres real (en un esquema efímero de la BD `aitrava_test`): **30 reservas simultáneas sobre 8 cupos → entran exactamente 8**, un mismo WhatsApp no aparta dos cupos, reservas ajenas dan 404, datos de pago ocultos hasta confirmar, apartados vencidos, encuesta única, límites de intentos, permisos del panel, CSV sin fórmulas |

La BD de pruebas se crea una vez con `docker exec aitrava-db psql -U aitrava -c "CREATE DATABASE aitrava_test"`. Cada corrida usa su propio esquema y lo borra al terminar; nunca toca tus datos. Para otra URL: `TEST_DATABASE_URL=postgresql://…/algo_test pnpm test:e2e`.

En `aitrava-app/`: `pnpm lint`, `pnpm build` y `pnpm cf:build` (build de Cloudflare).

## Robustez y seguridad (resumen)

- **Sin sobreventa:** la reserva corre en una transacción que bloquea la fila de la salida (`SELECT … FOR UPDATE`). Lo mismo al reactivar una reserva desde el panel o al reportar un pago con el apartado vencido.
- **Idempotencia:** un WhatsApp con reserva activa en una salida no aparta otro cupo; el código `AITRAVA-Cxx` sale de una secuencia de la BD.
- **Reservas privadas:** el enlace lleva un token aleatorio; en la BD solo se guarda su hash. Sin token válido la respuesta es 404.
- **Errores:** filtro global (el cliente nunca ve trazas; los errores de Prisma se traducen), apagado ordenado, healthcheck que consulta la BD, tiempo máximo en transacciones y en las peticiones de la app.
- **Entradas:** validación estricta (campos desconocidos se rechazan), honeypot contra bots, límites de intentos por IP, CSV protegido contra fórmulas.
- Contraseñas con bcrypt y JWT para el equipo; el rol admin se confirma en la BD en cada llamada. Las claves van solo en `.env` o en Railway.
