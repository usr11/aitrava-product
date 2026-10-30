# Despliegue · Railway (API + BD) y Cloudflare (app)

Este repositorio es un **monorepo**: una sola repo de GitHub (`usr11/aitrava-product`) con dos proyectos. Cada plataforma construye **solo su carpeta**:

| Qué | Dónde | Carpeta del repo | Config en el repo |
| :-- | :-- | :-- | :-- |
| API NestJS + Postgres | **Railway** | `aitrava-api/` | `aitrava-api/railway.json` |
| App Next.js | **Cloudflare Workers** (con OpenNext) | `aitrava-app/` | `aitrava-app/wrangler.jsonc` + `open-next.config.ts` |

**Orden:** primero Railway, porque la app necesita la URL del API al construirse. Después Cloudflare.

---

## 0. Antes de empezar

1. Sube todo a GitHub: `git add -A && git commit -m "Config de despliegue" && git push`.
2. Genera dos secretos y guárdalos en un lugar seguro (no en el repo):
   ```bash
   openssl rand -hex 32     # → JWT_SECRET
   openssl rand -base64 12  # → ADMIN_PASSWORD (la clave del admin en producción)
   ```

---

## 1. Railway: API + base de datos

### 1.1 Crear el proyecto y la base de datos
1. Entra a **railway.com** con tu cuenta de GitHub → **New Project** → **Deploy from GitHub repo** → elige `aitrava-product`.
   - Si no aparece: **Configure GitHub App** y dale acceso al repo.
2. Railway crea un servicio que va a fallar al primer intento, porque aún no sabe que el código está en una subcarpeta. Es normal.
3. En el lienzo del proyecto: **+ Create** → **Database** → **PostgreSQL**. Queda un servicio llamado `Postgres`.

### 1.2 Decirle a Railway que el API está en `aitrava-api/` (monorepo)
Abre el servicio del API → **Settings**:
1. **Source → Root Directory:** `/aitrava-api`
2. **Config-as-code → Railway Config File:** `/aitrava-api/railway.json`
   *(Railway no busca este archivo dentro del Root Directory por su cuenta, así que hay que ponerle la ruta completa.)*
3. Opcional: renombra el servicio a `aitrava-api` (arriba, en el nombre).

Con esto Railway ya sabe (vía `railway.json`):
- **Build:** `pnpm run build` (el `postinstall` genera el cliente de Prisma).
- **Start:** `pnpm start` = `prisma migrate deploy` + seed + arranque. Crea las tablas, los lugares del catálogo y el admin de respaldo; se puede repetir sin problema. Va dentro del start (no en un pre-deploy) para que funcione **aunque Railway no lea `railway.json`**, porque `start` es lo que Railway corre por defecto.
- **Healthcheck:** `/api` (o `/api/health`), que también consulta la BD: si faltan las tablas, el deploy falla en vez de quedar "verde" sin tablas.
- **Watch paths:** solo redespliega cuando cambia algo en `aitrava-api/` (los cambios de la app no lo tocan).

### 1.3 Variables del API
En el servicio del API → **Variables** → **Raw Editor**, pega esto y reemplaza lo que va entre `< >`:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<el de openssl rand -hex 32>
APP_URL=<URL de la app en Cloudflare, p. ej. https://aitrava-app.xxx.workers.dev>
ADMIN_EMAILS=<correos de los 4 integrantes, separados por coma>
ADMIN_EMAIL=<correo del admin de respaldo>
ADMIN_PASSWORD=<la clave del admin de respaldo>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=aitrava.25@gmail.com
SMTP_PASS=<clave de aplicación de Google, no la clave normal>
MAIL_FROM=AiTrava <aitrava.25@gmail.com>
COMMISSION_RATE=0.20
HOLD_HOURS=48
```

- `${{Postgres.DATABASE_URL}}` se escribe tal cual: Railway lo reemplaza por la conexión interna a la BD.
- `PORT` **no** se pone: Railway lo asigna solo.
- `JWT_SECRET`: en producción debe tener **mínimo 32 caracteres** o el API no arranca (a propósito).
- `APP_URL`: los enlaces de los correos y de las encuestas apuntan aquí, y CORS solo acepta este origen.
- `ADMIN_EMAILS`: **solo estos correos pueden crear cuenta** (los viajeros no tienen cuenta). Cada integrante entra a `/equipo/registro`, verifica su correo y recibe el rol admin.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`: admin de respaldo; en producción solo se crea si pones `ADMIN_PASSWORD`.
- `SMTP_*`: para verificar las cuentas del equipo y recuperar contraseñas. Sin SMTP, un admin puede verificar a otro en `/admin/equipo`.
- `COMMISSION_RATE` y `HOLD_HOURS`: comisión por defecto de una salida nueva y horas que se aparta un cupo sin pago.
- `SEED_DEMO=true` (opcional): crea la salida DEMO en producción para la presentación. Lo DEMO no cuenta en las métricas.
- Ya no se usan (se pueden borrar): `PASS_PRICE_COP`, `PAYMENT_URL`, `WOMPI_EVENTS_SECRET`, `EMAIL_VERIFICATION_REQUIRED`, `DEMO_MODE`, `GROQ_*`.

> ⚠️ **Al desplegar la v4 por primera vez**, la migración `20261029000000_aitrava_4` **borra los datos de la v3** (viajes, Bóveda, planes de ahorro, pagos, Pass, proveedores, destinos, mensajes y feedback) y conserva las cuentas, los eventos y las iteraciones. Confirmen la decisión D5 del roadmap antes del `git push`.

Guarda (**Deploy** o **Apply changes**). Railway redespliega solo.

### 1.4 Dominio público
Servicio del API → **Settings → Networking → Generate Domain**.
- Si pide un puerto, pon el que aparece en los logs del deploy (línea `API → http://localhost:XXXX/api`); normalmente es `8080`.
- Te queda algo como `https://aitrava-api-production.up.railway.app`. **Cópialo.**

### 1.5 Verificar
- En el navegador: `https://<tu-dominio-railway>/api/health` → debe responder `{"ok":true,"name":"AiTrava API"}` (503 si la BD no contesta).
- `https://<tu-dominio-railway>/api/places` → los 14 lugares del catálogo.
- En **Deployments → View logs** deberías ver `All migrations have been successfully applied` y `Seed listo: 15 lugares…`.

---

## 2. Cloudflare: la app

### 2.1 Crear el Worker desde GitHub
1. Entra a **dash.cloudflare.com** → **Workers & Pages** → **Create** → **Import a repository** (o "Connect to Git") → **GitHub** → elige `aitrava-product`.
2. Configura así:

| Campo | Valor |
| :-- | :-- |
| **Project name** | `aitrava-app` *(tiene que ser igual al `name` de `aitrava-app/wrangler.jsonc`)* |
| **Production branch** | `main` |
| **Root directory** *(en "Advanced settings" / "Build configuration" / "Path")* | `aitrava-app` ← **el campo más importante: si queda vacío, el build falla** |
| **Build command** | `pnpm exec opennextjs-cloudflare build` |
| **Deploy command** | `pnpm exec opennextjs-cloudflare deploy` |
| **Non-production branch deploy command** *(si aparece)* | `pnpm exec opennextjs-cloudflare upload` |

3. En **Build variables** (en la misma pantalla o después en *Settings → Build → Variables and secrets*) agrega:

```env
NEXT_PUBLIC_API_URL=https://<tu-dominio-railway>
NEXT_PUBLIC_META_PIXEL_ID=1257792940757500
```

> ⚠️ Van en **Build variables**, no en las variables del Worker en runtime: Next las "hornea" en el código al construir. Si cambias la URL de Railway, hay que volver a construir (**Deployments → Retry build** o un push).
> ⚠️ `NEXT_PUBLIC_API_URL` va **sin** `/api` al final y sin `/` final.

4. **Save and Deploy.** Cloudflare instala con pnpm (lo detecta por `pnpm-lock.yaml` y el campo `packageManager`), usa Node 22 (`.nvmrc`) y despliega.

### 2.1.1 Cómo saber si el Root directory quedó bien
En los logs del build, antes del comando, tienen que aparecer **estas dos cosas**:

```
Detected the following tools from environment: nodejs, pnpm
Installing project dependencies: pnpm install --frozen-lockfile
```

Si en cambio ves `Detected the following tools from environment:` vacío, ninguna línea de instalación, y un error como
`pnpm: Cannot read properties of undefined (reading '/opt/buildhome/repo')` o
`ERR_PNPM_RECURSIVE_EXEC_NO_PACKAGE: No package found in this workspace`,
es que **se está construyendo en la raíz del repo** (ahí no hay `package.json`, porque esto es un monorepo).
Arreglo: **Settings → Build → Build configuration → Edit → Root directory = `aitrava-app`** y vuelve a lanzar el build con **Retry build**.

**Plan B** si tu panel no muestra el campo Root directory: déjalo vacío y usa estos comandos, que entran solos a la carpeta:

| Campo | Valor |
| :-- | :-- |
| **Build command** | `cd aitrava-app && pnpm install --frozen-lockfile && pnpm exec opennextjs-cloudflare build` |
| **Deploy command** | `cd aitrava-app && pnpm exec opennextjs-cloudflare deploy` |

**Plan C** (si el panel sigue dando problemas, para salir del paso): desplegar desde tu PC.
```bash
cd aitrava-app
npx wrangler login                                   # abre el navegador una vez
NEXT_PUBLIC_API_URL="https://<tu-dominio-railway>" pnpm deploy
```

### 2.2 Watch paths (monorepo)
**Settings → Build → Build watch paths → Include paths:** `aitrava-app/*`
Así los cambios del API no reconstruyen la app.

### 2.3 Verificar
- La URL queda como `https://aitrava-app.<tu-subdominio>.workers.dev`.
- Entra a `/equipo/ingresar` con el admin de respaldo (o crea tu cuenta del equipo en `/equipo/registro`) → `/admin` → crea una salida en "Abierta" y apártale un cupo desde la página pública. Si aparece en `/admin/reservas`, la app está hablando con Railway.
- Pruébala desde el celular con datos móviles (no con el wifi de la casa).

---

## 3. Después del primer despliegue

1. **WhatsApp Business (paso 92):** pon el número en la build variable `NEXT_PUBLIC_WHATSAPP_NUMBER` (formato `57XXXXXXXXXX`) y vuelve a construir.
2. **Primera salida real (paso 94):** créala en `/admin/salidas` con los datos de pago del anfitrión. Para la presentación puedes usar `SEED_DEMO=true` (salida DEMO, no cuenta en métricas).
3. **Enlaces de campaña (TC0):** `https://<app>/?v=A&c=IG`, `https://<app>/?v=B&c=GRP`, etc.
3. **Dominio propio (opcional):** Cloudflare → Worker → **Settings → Domains & Routes → Add custom domain** (p. ej. `app.aitrava.co`). Si lo cambias, no hay que tocar el API (CORS acepta cualquier origen).

## 4. Cómo se actualiza de ahora en adelante

Solo `git push` a `main`:
- ¿Cambió algo en `aitrava-api/`? → Railway redespliega el API (y corre migraciones y seed).
- ¿Cambió algo en `aitrava-app/`? → Cloudflare reconstruye la app.

## 5. Problemas comunes

| Síntoma | Causa probable | Solución |
| :-- | :-- | :-- |
| Railway: "No start command could be found" o build de la raíz | Falta el Root Directory | 1.2: Root Directory `/aitrava-api` y ruta del config file |
| Railway: `P1001 Can't reach database` | `DATABASE_URL` mal puesta | Usar `${{Postgres.DATABASE_URL}}` con el nombre exacto del servicio de BD |
| Railway: healthcheck falla | El API no arrancó o no hay tablas | Mira los logs de runtime: deben aparecer `All migrations have been successfully applied` y `Seed listo`; si no, casi siempre es `DATABASE_URL` |
| La BD de Railway quedó sin tablas (antes del arreglo del 2026-09-21) | La migración `comision_unica` tenía un nombre que la ponía antes de `init` | Ya está arreglado: con el próximo deploy, `pnpm start` limpia el intento fallido y crea todo. No hay que tocar la BD |
| En tu PC: `migrate` dice que falta la migración `20260921224604_comision_unica` | Tu BD local tiene el nombre viejo | `cd aitrava-api && pnpm db:reset` (borra los datos locales) |
| La app carga pero no hay datos / "Failed to fetch" | `NEXT_PUBLIC_API_URL` vacío o mal escrito | Revísalo en Build variables y haz **Retry build** |
| Cloudflare: "Worker name mismatch" | El nombre del proyecto ≠ `name` en `wrangler.jsonc` | Deben ser iguales (`aitrava-app`) |
| Cloudflare no encuentra `package.json` | Falta el Root directory | Root directory = `aitrava-app` |
| No llegan los correos del equipo | Faltan `SMTP_*` o la clave de aplicación es incorrecta | Revisar los logs (`No se pudo enviar…`); mientras tanto, verificar a mano en `/admin/equipo` |
| Los enlaces del correo abren `localhost` | `APP_URL` no está definida | Ponerla con la URL de Cloudflare |

## 6. Probar el build de Cloudflare en tu PC (opcional)

```bash
cd aitrava-app
pnpm preview     # construye con OpenNext y lo sirve en el runtime de Cloudflare (workerd)
```
