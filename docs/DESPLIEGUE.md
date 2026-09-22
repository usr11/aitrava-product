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
3. Ten a mano tu clave de Groq (console.groq.com → API Keys).

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
- **Pre-deploy:** `prisma migrate deploy` + seed (crea las tablas, los 15 destinos y las cuentas; se puede repetir sin problema).
- **Start:** `pnpm start:prod` · **Healthcheck:** `/api`.
- **Watch paths:** solo redespliega cuando cambia algo en `aitrava-api/` (los cambios de la app no lo tocan).

### 1.3 Variables del API
En el servicio del API → **Variables** → **Raw Editor**, pega esto y reemplaza lo que va entre `< >`:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<el de openssl rand -hex 32>
ADMIN_PASSWORD=<la clave del admin para producción>
GROQ_API_KEY=<tu clave de Groq>
GROQ_MODEL=openai/gpt-oss-120b
DEMO_MODE=true
```

- `${{Postgres.DATABASE_URL}}` se escribe tal cual: Railway lo reemplaza por la conexión interna a la BD. Si tu servicio de BD tiene otro nombre, cambia `Postgres` por ese nombre.
- `PORT` **no** se pone: Railway lo asigna solo y el API ya lo lee.
- `DEMO_MODE`: `true` para presentar y hacer pruebas guiadas (pistas cada 30 s); **`false` para la campaña con usuarios reales**.

Guarda (**Deploy** o **Apply changes**). Railway redespliega solo.

### 1.4 Dominio público
Servicio del API → **Settings → Networking → Generate Domain**.
- Si pide un puerto, pon el que aparece en los logs del deploy (línea `AiTrava API → http://localhost:XXXX/api`); normalmente es `8080`.
- Te queda algo como `https://aitrava-api-production.up.railway.app`. **Cópialo.**

### 1.5 Verificar
- En el navegador: `https://<tu-dominio-railway>/api` → debe responder `{"ok":true,"name":"AiTrava API"}`.
- `https://<tu-dominio-railway>/api/config` → `{"demoMode":true,"aiEnabled":true}`. Si `aiEnabled` es `false`, falta `GROQ_API_KEY`.
- En **Deployments → View logs** del último deploy deberías ver `All migrations have been successfully applied` y `Seed listo: 15 destinos…`.

---

## 2. Cloudflare: la app

### 2.1 Crear el Worker desde GitHub
1. Entra a **dash.cloudflare.com** → **Workers & Pages** → **Create** → **Import a repository** (o "Connect to Git") → **GitHub** → elige `aitrava-product`.
2. Configura así:

| Campo | Valor |
| :-- | :-- |
| **Project name** | `aitrava-app` *(tiene que ser igual al `name` de `aitrava-app/wrangler.jsonc`)* |
| **Production branch** | `main` |
| **Root directory** *(en "Advanced settings" / "Path")* | `aitrava-app` |
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

### 2.2 Watch paths (monorepo)
**Settings → Build → Build watch paths → Include paths:** `aitrava-app/*`
Así los cambios del API no reconstruyen la app.

### 2.3 Verificar
- La URL queda como `https://aitrava-app.<tu-subdominio>.workers.dev`.
- Crea una cuenta, arma un viaje y resérvalo. Si el viaje se genera, la app está hablando con Railway.
- Entra con `admin@aitrava.co` + tu `ADMIN_PASSWORD` → `/admin`.
- Pruébala desde el celular con datos móviles (no con el wifi de la casa).

---

## 3. Después del primer despliegue

1. **Preparar la demo en producción** (antes de presentar). Opción fácil, desde tu PC:
   - Railway → servicio `Postgres` → **Connect** → copia la **Public Network URL** (`postgresql://…proxy.rlwy.net:…`).
   - `cd aitrava-api && DATABASE_URL="<esa URL>" pnpm db:demo`
2. **Paso 30 del roadmap:** cambiar los botones de la landing (`AiTrava-landing/src/data/site.ts`) para que apunten a `https://aitrava-app.<subdominio>.workers.dev/crear?utm_source=landing`. Pídeselo al agente con la URL final.
3. **Dominio propio (opcional):** Cloudflare → Worker → **Settings → Domains & Routes → Add custom domain** (p. ej. `app.aitrava.co`). Si lo cambias, no hay que tocar el API (CORS acepta cualquier origen).
4. **Pruebas con usuarios reales / campaña (pasos 32–34):** pon `DEMO_MODE=false` en Railway cuando la gente la vaya a usar sola.

## 4. Cómo se actualiza de ahora en adelante

Solo `git push` a `main`:
- ¿Cambió algo en `aitrava-api/`? → Railway redespliega el API (y corre migraciones y seed).
- ¿Cambió algo en `aitrava-app/`? → Cloudflare reconstruye la app.

## 5. Problemas comunes

| Síntoma | Causa probable | Solución |
| :-- | :-- | :-- |
| Railway: "No start command could be found" o build de la raíz | Falta el Root Directory | 1.2: Root Directory `/aitrava-api` y ruta del config file |
| Railway: `P1001 Can't reach database` | `DATABASE_URL` mal puesta | Usar `${{Postgres.DATABASE_URL}}` con el nombre exacto del servicio de BD |
| Railway: healthcheck falla | El API no arrancó | Mira los logs de runtime; casi siempre es una variable faltante |
| La app carga pero no hay datos / "Failed to fetch" | `NEXT_PUBLIC_API_URL` vacío o mal escrito | Revísalo en Build variables y haz **Retry build** |
| Cloudflare: "Worker name mismatch" | El nombre del proyecto ≠ `name` en `wrangler.jsonc` | Deben ser iguales (`aitrava-app`) |
| Cloudflare no encuentra `package.json` | Falta el Root directory | Root directory = `aitrava-app` |
| `aiEnabled: false` | Falta `GROQ_API_KEY` en Railway | Agregarla y redeploy |

## 6. Probar el build de Cloudflare en tu PC (opcional)

```bash
cd aitrava-app
pnpm preview     # construye con OpenNext y lo sirve en el runtime de Cloudflare (workerd)
```
