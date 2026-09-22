# AiTrava · App

Viajes sorpresa personalizados: "Menos planear, más viajar". Prototipo para la materia de Innovación.

> **Antes de trabajar, lee [`docs/ROADMAP.md`](docs/ROADMAP.md).** Ahí están el plan, el progreso y las decisiones.

| Carpeta | Qué es | URL local |
| :-- | :-- | :-- |
| `aitrava-app/` | Frontend: Next.js 16 + Tailwind 4 | http://localhost:3000 |
| `aitrava-api/` | Backend: NestJS 11 + Prisma | http://localhost:4000/api |
| `docker-compose.yml` | Postgres 16 (lo único en Docker) | `localhost:5432` |
| `design/` | Copia del diseño de la landing (referencia) | — |
| `docs/ROADMAP.md` | Plan de trabajo con checks | — |
| `docs/DESPLIEGUE.md` | Paso a paso para publicar (Railway + Cloudflare) | — |

## Levantar todo

Requisitos: Docker, Node 22+ y pnpm.

```bash
# 1. Base de datos
docker compose up -d

# 2. API (terminal 1)
cd aitrava-api
cp .env.example .env          # solo la primera vez
pnpm install
pnpm prisma migrate dev       # crea las tablas
pnpm db:seed                  # 15 destinos + cuentas demo/admin
pnpm start:dev

# 3. App (terminal 2)
cd aitrava-app
cp .env.example .env.local    # solo la primera vez
pnpm install
pnpm dev -H 0.0.0.0           # -H 0.0.0.0 permite abrirla desde el celular en la misma red
```

Desde el celular: `http://<IP-de-tu-PC>:3000`. Para ver tu IP: `hostname -I`. Si el celular no carga los datos, pon `NEXT_PUBLIC_API_URL="http://<IP-de-tu-PC>:4000"` en `aitrava-app/.env.local` y reinicia `pnpm dev`.

## Cuentas de prueba (clave `aitrava123`)

| Correo | Rol |
| :-- | :-- |
| `admin@aitrava.co` | Admin: ve `/admin` (métricas, iteraciones, feedback, usuarios) |
| `demo@aitrava.co` | Usuario demo para la presentación |

## Comandos útiles (en `aitrava-api/`)

| Comando | Qué hace |
| :-- | :-- |
| `pnpm db:seed` | Vuelve a cargar destinos y cuentas (no borra nada) |
| `pnpm db:reset` | ⚠️ **Borra todos los datos**, recrea las tablas y corre el seed |
| `pnpm db:demo` | Prepara la cuenta demo con 2 viajes de ejemplo (correr antes de presentar) |
| `pnpm db:studio` | Abre Prisma Studio para ver y editar la BD en el navegador |

## Modo demo e IA

- `DEMO_MODE="true"` en `aitrava-api/.env`: las pistas se desbloquean cada 30 s, el sobre se puede abrir a los 3 min de reservar y aparece el botón "⏩ Adelantar el tiempo". Para usuarios reales ponlo en `false`: las pistas se reparten hasta un día antes del viaje.
- `GROQ_API_KEY` (gratis en console.groq.com → API Keys): si está vacío, el destino lo elige el motor por puntaje y funciona igual. Con key, la IA elige entre los 5 mejores destinos y escribe pistas, razón e itinerario personalizados. El modelo se cambia con `GROQ_MODEL`. **Nunca subas la clave a git**: va solo en `aitrava-api/.env`.
