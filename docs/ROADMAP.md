# AiTrava · Roadmap del producto

> **Documento vivo.** Lo leen el equipo (3 personas) y el agente (Claude Code) **antes de trabajar, siempre**.
> El trabajo es **lineal**: se toma el siguiente paso sin marcar del **Plan de trabajo (sección 8)**. Al terminarlo se marca `[x]` con la fecha y quién lo hizo, se actualiza la tabla de progreso (0.1) y se anota en el **Registro de cambios** (sección 11).
> Si una decisión cambia, se edita aquí primero y después el código.

**Última actualización:** 2026-09-21 · **Paso actual:** 32 (pruebas con usuarios). El 30 y el 34 esperan el despliegue (D1)

---

## 0. Cómo usar este documento

| Si eres… | Haz esto |
| :-- | :-- |
| **Compañero del equipo** | Haz `git pull`, busca en la sección 8 el **primer paso sin marcar** y avisa en el grupo que lo tomas. Al terminar: márcalo `[x]`, rellena `✅ fecha · nombre`, actualiza la tabla 0.1, anota en la sección 11, haz commit y push. |
| **Agente (Claude Code)** | Lee todo este archivo. Trabaja **solo en el primer paso sin marcar** (o en el que el usuario pida). Al terminar, haz lo mismo que un compañero: marcar, tabla 0.1 y registro. No agregues cosas fuera del alcance (sección 3) sin preguntar. |

**Regla de oro:** es un prototipo para una materia de **innovación**. Nadie califica cómo está hecho el código. Se califica que **funcione, se vea bien, genere evidencia con usuarios reales y muestre lo innovador**. Si algo no aporta a la rúbrica, no se hace.

### 0.1 Progreso

| Etapa | Pasos | Hechos | Estado |
| :-- | :-: | :-: | :-: |
| A · Base del proyecto | 01–06 | 6/6 | ✅ |
| B · Backend núcleo | 07–14 | 8/8 | ✅ |
| C · Flujo principal (frontend) | 15–24 | 10/10 | ✅ |
| D · Crecimiento y métricas | 25–30 | 5/6 | 🟡 |
| E · Validación con usuarios e iteraciones | 31–37 | 1/7 | 🟡 |
| F · Presentación | 38–41 | 1/4 | 🟡 |
| **Total** | | **31/41** | |

Estados: ⬜ sin empezar · 🟡 en curso · ✅ terminada

---

## 1. Qué es AiTrava (resumen)

**Viajes sorpresa personalizados. "Menos planear, más viajar."**
El usuario pone presupuesto, fechas, desde dónde sale y qué le gusta. La IA arma transporte, alojamiento y planes locales **sin revelarle el destino**. Mientras llega el día, la app suelta **pistas diarias** (qué empacar, el clima, un plato típico, una canción) y el usuario y sus acompañantes **intentan adivinar**. El día de la revelación abre un **sobre digital** y ve el destino y el itinerario completo.

- **Segmento:** jóvenes nativos digitales (18–30 años), con poco tiempo, que buscan experiencias diferentes y sin estrés. Viajan solos, en pareja, con amigos o en familia.
- **Propuesta de valor:** reducir al máximo el estrés de planear y convertir la espera en parte del viaje.
- **Relación con clientes:** automatización con soporte humano rápido, presupuesto transparente y gamificación para crear expectativa.
- **Ingresos (según el canvas):** comisiones por reserva, experiencias exclusivas y suscripción premium opcional.
- **Landing ya hecha:** `../AiTrava-landing` (Astro, con Meta Pixel). **Copia de su diseño en `design/`** (ver `design/README.md`).

---

## 2. Cómo cumplimos la rúbrica (mapa criterio → qué construimos)

Esta tabla es **la razón de ser de cada feature**. Si una feature no aparece aquí, probablemente no hace falta.

| # | Criterio de la rúbrica | Qué lo demuestra en el producto | Evidencia para la presentación |
| :-: | :-- | :-- | :-- |
| 1 | **Diferenciadores e innovación difíciles de copiar** | (a) **Motor de sorpresa:** IA + catálogo curado que elige el destino a partir del "ADN viajero" y lo esconde. (b) **Gamificación de la espera:** pistas por día + adivinanza en grupo + sobre digital. (c) **ADN viajero:** cada viaje, pista, adivinanza y calificación alimenta el perfil, y eso mejora la siguiente recomendación (efecto de red de datos). (d) **Inventario opaco:** los aliados venden cupos sin bajar su precio público porque el cliente no sabe a dónde va. | Demo en vivo del flujo completo. Diapositiva de "barreras de imitación": datos propios, red de aliados, mecánica de juego y marca. |
| 2 | **Prototipo funcional e iterativo, validado con usuarios** | App web completa y responsive: registro → quiz → viaje generado → reserva (simulada) → pistas → adivinanza → revelación → feedback. **Widget de feedback** en todas las pantallas, **encuesta NPS** después de la revelación y **registro de iteraciones** (v1 → v2 → v3). | `/admin/iteraciones`, línea de tiempo de versiones con el cambio de cada una, capturas y testimonios de las pruebas con usuarios. |
| 3 | **Respuesta sostenida del público y conversiones que orientaron cambios** | **Tracking propio de eventos** en la BD (embudo completo) + Meta Pixel. **Dashboard `/admin`** con el embudo, las tasas de conversión, el NPS, los gustos más elegidos y los referidos. Campañas en Instagram/Meta que llevan de la landing a la app. Cada cambio del modelo queda ligado a un dato. | Gráfica del embudo, tabla semanal de métricas y 3+ aprendizajes del tipo "vimos X → cambiamos Y → resultó Z". |
| 4 | **Modelo altamente innovador que redefine cómo se crea/captura valor** | **Una sola comisión por viaje (10 %), incluida dentro del tope del cliente**: el cliente nunca paga de más y ve exactamente cuánto gana AiTrava. El margen crece por el **inventario opaco**: como el destino es secreto, los aliados dan tarifas más bajas sin quemar su precio público. El **modo regalo** abre un mercado nuevo (quien paga no es quien viaja). Todo visible en el checkout. | Diapositiva del modelo: de dónde viene cada peso. Comparación con una agencia tradicional o con Booking. |
| 5 | **Presentación estructurada, fluida y en tiempo** | **Modo demo** (las pistas se desbloquean cada 30 s), datos semilla realistas y cuenta demo lista. Guion (sección 9). | Ensayo cronometrado. |

---

## 3. Alcance

### ✅ Sí entra (MVP)
- App web **responsive, pensada primero para móvil** (en el celular debe sentirse como una app).
- Registro e inicio de sesión simple (email + contraseña).
- Wizard "Crear mi viaje" con desglose del presupuesto en vivo.
- Generación del viaje con **IA (Groq)** sobre un **catálogo curado de destinos en Colombia**. Si no hay API key, usa un algoritmo por puntaje como respaldo, así la demo nunca falla.
- Boarding pass con destino `???`, desglose y reserva **simulada** (checkout falso, comisión única del 10 %).
- Pistas que se desbloquean por fecha, adivinanza (propia y de amigos) y revelación animada.
- Link para compartir el viaje: los amigos adivinan y hay un CTA para que creen el suyo (referido).
- Modo regalo.
- Feedback (widget + NPS) y tracking de eventos.
- Panel admin: métricas, embudo, feedback, iteraciones y usuarios.
- Modo demo.

### ❌ No entra (no perder tiempo en esto)
- Pagos reales, reservas reales con proveedores, integraciones con aerolíneas u hoteles.
- Apps nativas, notificaciones push, emails transaccionales.
- Tests exhaustivos, CI/CD, microservicios, caché, colas, arquitectura "escalable".
- Internacionalización (todo en español de Colombia).
- Recuperar contraseña, OAuth, roles complejos.

---

## 4. Stack y estructura

| Capa | Tecnología | Notas |
| :-- | :-- | :-- |
| Frontend | **Next.js 16** (App Router) + **Tailwind 4** + TypeScript | `aitrava-app/` (ya creada). Leer `aitrava-app/AGENTS.md`: Next 16 trae cambios. |
| Backend | **NestJS 11** + TypeScript | `aitrava-api/` (ya creada). |
| ORM | **Prisma** | `aitrava-api/prisma/` |
| Base de datos | **PostgreSQL 16 en Docker** (lo **único** en Docker) | `docker-compose.yml` en la raíz. |
| IA | **Groq** (`groq-sdk`, gratis) | Modelo `openai/gpt-oss-120b` en modo JSON (~1,5 s por viaje); se cambia con `GROQ_MODEL`. Si no hay key o falla, usa el motor por puntaje. |
| Gráficas | `recharts` | Solo en `/admin`. |
| Animaciones | CSS (+ `framer-motion` opcional) | Sobre digital y tablero de salidas. |
| Paquetes | **pnpm** | |

```text
aitrava/
├── docker-compose.yml        # Solo Postgres
├── CLAUDE.md                 # Instrucciones para el agente → apunta aquí
├── docs/ROADMAP.md           # ESTE archivo
├── design/                   # Copia del diseño de la landing (referencia)
├── aitrava-api/              # NestJS  → http://localhost:4000
│   ├── prisma/schema.prisma
│   ├── prisma/seed.ts
│   └── src/ auth/ users/ trips/ destinations/ ai/ events/ feedback/ admin/ prisma/
└── aitrava-app/              # Next.js → http://localhost:3000
    ├── app/                  # Rutas (sección 6)
    ├── components/
    ├── lib/api.ts            # fetch al backend + token
    ├── lib/track.ts          # track('evento', props)
    └── public/brand/         # Logo
```

### Levantar el proyecto
```bash
docker compose up -d                                  # Postgres
cd aitrava-api && pnpm i && pnpm prisma migrate dev && pnpm db:seed && pnpm start:dev
cd aitrava-app && pnpm i && pnpm dev
# Probar desde el celular en la misma red: pnpm dev -H 0.0.0.0 → http://<IP-del-PC>:3000
```

### Variables de entorno
```bash
# aitrava-api/.env
DATABASE_URL="postgresql://aitrava:aitrava@localhost:5432/aitrava"
JWT_SECRET="cambia-esto"
GROQ_API_KEY=""                 # vacío = usa el motor por puntaje sin IA
GROQ_MODEL="openai/gpt-oss-120b"
DEMO_MODE="true"                # pistas cada 30 s en vez de cada día
APP_URL="http://localhost:3000" # CORS
PORT=4000

# aitrava-app/.env.local
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_META_PIXEL_ID="1257792940757500"   # el mismo de la landing
```

---

## 5. Diseño (estilos de la landing)

**La app debe verse como hermana de la landing.** Concepto visual: **tablero de salidas de aeropuerto + pase de abordaje**, y el destino siempre aparece como `???`.
**Toda la referencia está en `design/`**: tokens, copy, componentes y los diseños originales de Claude Design (abre `design/landing/canvas/aitrava-landing.html` en el navegador).

### Tokens (de `design/landing/styles/global.css` → `aitrava-app/app/globals.css` como `@theme` de Tailwind 4)

| Token | Valor | Uso |
| :-- | :-- | :-- |
| `--bg` | `#1A1C20` | Fondo principal (tema oscuro por defecto) |
| `--surface` | `#25282E` | Tarjetas |
| `--board` / `--flap` | `#111316` / `#23262B` | Tablero de salidas |
| `--line` / `--line-strong` | `#2E3137` / `#3A3E45` | Bordes |
| `--primary` | `#FFD700` | CTA principal, pista nueva |
| `--secondary` | `#FFB300` | Hover, íconos, rutas |
| `--text` / `--muted` | `#F8F9FA` / `#B9BEC6` | Texto |
| `--ink` | `#1A1C20` | Texto sobre amarillo |
| Radio de las píldoras | `999px` | Botones y chips |

### Tipografías (`next/font/google`)
- **Display:** Big Shoulders 800–900, en MAYÚSCULAS, `line-height .88` → títulos.
- **Cuerpo:** Familjen Grotesk 400–700.
- **Mono:** IBM Plex Mono 400/600, `letter-spacing .16em`, en mayúsculas → etiquetas tipo "eyebrow", códigos de vuelo, contadores.

### Piezas a reutilizar (`design/landing/components/`)
- `Clues.astro` → **es casi literalmente la pantalla de pistas**: cuenta regresiva, tarjeta amarilla "Pista nueva", tarjetas bloqueadas y botón "Adivinar".
- `DepartureBoard.astro` → animación de "generando tu viaje".
- `Budget.astro` + `splitBudget` en `data/site.ts` → desglose del presupuesto (39 / 32 / 29 %).
- `Travelers.astro` → tarjetas PAX 01 / 02 / 03+ / 04+.
- `Icon.astro` → set de íconos SVG (pasar a un componente React).
- Logo y favicon en `design/landing/assets/`.

### Responsive
- **Diseñar primero para móvil (390 px)** y luego escalar a escritorio.
- Móvil: barra de navegación inferior (Inicio · Mis viajes · Crear · Perfil). Escritorio: header arriba.
- Botones de mínimo 44 px de alto y nada de scroll horizontal.
- Revisar en las DevTools (iPhone 12/13) y en un celular real antes de cerrar cada etapa.

### Claude Design
La landing se diseñó en claude.ai/design (los archivos `.dc.html` en `design/landing/canvas/`). **Decisión:** construir directo con estos estilos, sin diseñar aparte. Si una pantalla queda fea, se puede generar en Claude Design, exportar a `design/app/` y pedirle al agente que la implemente.

---

## 6. Pantallas y flujo

```text
Landing ──CTA──▶ /registro ─▶ /crear (wizard) ─▶ /crear/generando ─▶ /viaje/[id] (boarding pass ???)
                                                                          │
                                         /viaje/[id]/pago (comisión única, simulado) ◀┘
                                                   │
                         /viaje/[id]/pistas (cuenta regresiva + pistas + adivinar) ──compartir──▶ /s/[code] (amigos adivinan → CTA "crea el tuyo")
                                                   │
                         /viaje/[id]/revelacion (sobre digital + itinerario) ─▶ encuesta NPS
```

| Ruta | Qué muestra | Eventos |
| :-- | :-- | :-- |
| `/` | Hero corto con el tagline, CTA "Crear mi viaje sorpresa" y cómo funciona en 4 pasos. Si hay sesión, va a "Mis viajes". | `page_view`, `cta_click` |
| `/registro`, `/login` | Formulario simple. Acepta `?ref=CODIGO` y `?utm_*`. | `signup` |
| `/crear` | Wizard de 5 pasos con barra de progreso: **1.** Origen y fechas · **2.** Presupuesto y viajeros (slider + desglose en vivo, tarjetas PAX) · **3.** Qué te mueve (chips: playa, montaña, comida, fiesta, cultura, naturaleza, silencio, aventura) · **4.** Cosas a evitar (avión, frío, caminatas largas…) · **5.** ¿Para ti o es un regalo? | `quiz_start`, `quiz_step`, `quiz_complete` |
| `/crear/generando` | Tablero de salidas animado mientras responde la IA. | — |
| `/viaje/[id]` | **Boarding pass**: origen → `???`, fechas, PAX, desglose en COP, 3 "pistas de ambiente" (sin revelar el lugar) y CTA "Reservar mi sorpresa". Botón "Re-sortear" (2 gratis por viaje). | `trip_generated`, `trip_reroll` |
| `/viaje/[id]/pago` | Resumen con la comisión del 10 % incluida y checkout **simulado**. Aviso: *"Prototipo: no se hace ningún cobro"*. Opción "Apartar con $50.000". | `checkout_view`, `reservation` |
| `/viaje/[id]/pistas` | Cuenta regresiva, progreso, pista nueva en amarillo, anteriores y bloqueadas. **Adivinar**, **Compartir con mis acompañantes** y (en modo demo) "Adelantar el tiempo". | `clue_view`, `guess`, `share` |
| `/viaje/[id]/revelacion` | Animación del **sobre digital** → destino, foto, por qué lo eligió la IA e itinerario día por día. Muestra si adivinaste. Luego la encuesta NPS con 2 preguntas. | `reveal`, `nps_submit` |
| `/s/[code]` | Página pública del viaje de un amigo: pistas desbloqueadas, adivinar (solo el nombre) y CTA "Quiero mi viaje sorpresa" → `/registro?ref=`. | `share_view`, `friend_guess`, `referral_click` |
| `/regalo/[code]` | Lo que ve quien recibe un viaje regalado: mensaje, cuenta regresiva y pistas. | `gift_open` |
| `/mis-viajes` | Viajes del usuario con su estado. | — |
| `/admin` | **Dashboard**: KPIs (usuarios, viajes, reservas, conversión, NPS), embudo, eventos por día, top de gustos, top de destinos, tasa de acierto y referidos. | — |
| `/admin/feedback` | Comentarios, NPS y respuestas del widget. | — |
| `/admin/iteraciones` | **Registro de aprendizajes** (CRUD): versión, fecha, hipótesis, métrica, resultado, decisión, cambio. | — |
| Global | **Widget de feedback** flotante (1–5 caritas + texto) y banner del modo demo. | `feedback_submit` |

---

## 7. Modelo de negocio dentro del producto (criterio 4)

**Decisión (2026-09-21):** una sola **comisión por viaje del 10 %**, incluida dentro del presupuesto que pone el cliente. No hay planes, ni pistas pagas, ni cobro por re-sortear.

| Cómo ganamos | Detalle |
| :-- | :-- |
| **Comisión por viaje (10 %)** | Sale del tope del cliente y se muestra desglosada en el checkout ("Así ganamos"). Ejemplo: en un viaje de $2.800.000 son $280.000. |
| **Margen por inventario opaco** | Como el cliente no elige el hotel ni el vuelo, los aliados nos dan tarifas más bajas para llenar cupos vacíos sin bajar su precio público. La diferencia amplía nuestro margen sin cobrarle más al cliente. |
| **Abono para apartar ($50.000)** | No es otro cobro: adelanta la caja y mide la intención de compra real. |

**Lo que amplía el mercado (sin cobros extra):**
- **Modo regalo:** quien paga no es quien viaja. Abre el mercado de cumpleaños, aniversarios y amor y amistad.
- **Links para compartir y referidos:** cada viaje trae a los amigos que apuestan. El costo de adquisición baja.
- **Futuro:** suscripción "Club Sorpresa" (1 escapada por trimestre) y B2B (integraciones sorpresa para empresas).

**Por qué es innovador:** una agencia tradicional cobra por reservar lo que el cliente ya eligió. AiTrava convierte **la incertidumbre en el producto**: el cliente paga por no tener que decidir, y esa misma sorpresa es la que nos deja negociar mejores tarifas. Todo con una comisión transparente y dentro del tope.

---

## 8. Plan de trabajo (lineal, con checks)

> **Cómo se usa:** siempre se hace el **primer paso sin marcar**. Al terminarlo: `- [ ]` → `- [x]` y se rellena `✅ fecha · nombre`, por ejemplo `✅ 2026-09-22 · Juan Pablo`.
> Cada etapa termina con un **✔ Chequeo**: no se pasa a la siguiente etapa hasta que se cumpla.
> Si un paso se bloquea, se escribe `⛔ motivo` al lado y se avisa en el grupo.

### Etapa A · Base del proyecto
- [x] **01** · `docker-compose.yml` en la raíz con Postgres 16 (usuario, clave y BD `aitrava`, puerto 5432, volumen con nombre) y `docker compose up -d` funcionando — ✅ 2026-09-21 · Claude (agente)
- [x] **02** · Instalar Prisma en `aitrava-api`, escribir `schema.prisma` (modelos al final de esta etapa) y correr la primera migración — ✅ 2026-09-21 · Claude (agente)
- [x] **03** · Nest: `PrismaModule`/`PrismaService`, CORS con `APP_URL`, prefijo `/api`, `ValidationPipe`, puerto 4000 y `.env.example` — ✅ 2026-09-21 · Claude (agente)
- [x] **04** · Next: tokens de la landing en `globals.css` (`@theme`), fuentes con `next/font`, logo y favicon en `public/brand/`, grano de fondo y `.env.example` — ✅ 2026-09-21 · Claude (agente)
- [x] **05** · Next: layout base con header en escritorio, navegación inferior en móvil, componentes `Button`, `Card`, `Chip`, `Icon` (portados de la landing) y una página `/` provisional — ✅ 2026-09-21 · Claude (agente)
- [x] **06** · `README.md` en la raíz con cómo levantar todo — ✅ 2026-09-21 · Claude (agente)

✔ **Chequeo A:** `docker compose up -d`, el API responde en `:4000/api` y la app en `:3000` ya se ve con los colores y fuentes de la landing, también en móvil.

<details>
<summary><b>Modelos de Prisma (guía; se puede simplificar)</b></summary>

```prisma
enum Role { USER ADMIN }
enum TripStatus { GENERATED RESERVED REVEALED COMPLETED }

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String
  passwordHash String
  role         Role     @default(USER)
  referralCode String   @unique
  referredBy   String?  // referralCode de quien lo invitó
  utmSource    String?
  travelDna    Json?    // gustos acumulados (ADN viajero)
  createdAt    DateTime @default(now())
  trips        Trip[]
}

model Destination {
  id          String   @id @default(cuid())
  name        String   // "Santa Marta"
  region      String
  tags        String[] // ["playa","fiesta","naturaleza"]
  avoidTags   String[] // ["avion","calor"] → para filtrar
  minBudgetPP Int      // COP por persona, 2 noches
  imageUrl    String
  description String
  clueBank    Json     // pistas base por tipo: empacar, clima, comida, musica, cultura
  itinerary   Json     // plan base por día
  trips       Trip[]
}

model Trip {
  id            String      @id @default(cuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  status        TripStatus  @default(GENERATED)
  originCity    String
  startDate     DateTime
  endDate       DateTime
  travelers     Int
  budgetTotal   Int
  preferences   Json        // respuestas del wizard
  destinationId String
  destination   Destination @relation(fields: [destinationId], references: [id])
  aiReason      String?     // por qué la IA eligió este destino (se muestra en la revelación)
  itinerary     Json
  breakdown     Json        // { transporte, alojamiento, experiencias, tarifa }
  plan          String?     // basico | plus | dorado
  isGift        Boolean     @default(false)
  giftTo        String?
  giftMessage   String?
  shareCode     String      @unique
  revealAt      DateTime
  rerolls       Int         @default(0)
  createdAt     DateTime    @default(now())
  clues         Clue[]
  guesses       Guess[]
}

model Clue {
  id       String   @id @default(cuid())
  tripId   String
  trip     Trip     @relation(fields: [tripId], references: [id])
  order    Int
  type     String   // empacar | clima | comida | musica | cultura
  text     String
  unlockAt DateTime
  paid     Boolean  @default(false)
}

model Guess {
  id          String   @id @default(cuid())
  tripId      String
  trip        Trip     @relation(fields: [tripId], references: [id])
  guesserName String
  isOwner     Boolean
  destination String
  correct     Boolean
  createdAt   DateTime @default(now())
}

model Event {
  id        String   @id @default(cuid())
  name      String
  userId    String?
  anonId    String?
  props     Json?
  createdAt DateTime @default(now())
  @@index([name, createdAt])
}

model Feedback {
  id        String   @id @default(cuid())
  userId    String?
  tripId    String?
  kind      String   // widget | nps
  score     Int?
  comment   String?
  page      String?
  createdAt DateTime @default(now())
}

model Iteration {
  id         String   @id @default(cuid())
  version    String   // v1, v2, v3
  date       DateTime
  hypothesis String
  metric     String
  result     String
  decision   String
  change     String
  createdAt  DateTime @default(now())
}
```
</details>

### Etapa B · Backend núcleo
- [x] **07** · Auth: `POST /api/auth/register` y `/login` (bcrypt + JWT), `GET /api/auth/me`, guard JWT y guard de admin. El registro guarda `referredBy` y `utmSource` — ✅ 2026-09-21 · Claude (agente)
- [x] **08** · Seed (`prisma/seed.ts`): 12–15 destinos colombianos con tags, precio, imagen (Unsplash), banco de pistas e itinerario base. Por ejemplo: Santa Marta, Cartagena, San Andrés, Salento, Villa de Leyva, Guatapé, Minca, Barichara, San Gil, Palomino, Jardín, Tatacoa, Capurganá, Leticia y Popayán. También una cuenta demo (`demo@aitrava.co`), una cuenta admin (`admin@aitrava.co`) y 3 iteraciones de ejemplo — ✅ 2026-09-21 · Claude (agente)
- [x] **09** · Motor de recomendación **sin IA** (`ai/`): filtra por presupuesto por persona y cosas a evitar, puntúa por coincidencia de tags con los gustos + ADN viajero y arma el itinerario y las pistas desde el `clueBank` — ✅ 2026-09-21 · Claude (agente)
- [x] **10** · Motor **con IA** (Groq): si hay `GROQ_API_KEY`, se le pasan a la IA el top 5 del paso 09 y el perfil. Se le pide JSON `{destinationId, reason, itinerary[], clues[5]}` con pistas personalizadas que **no mencionen el nombre del lugar**. Si falla, se usa el paso 09 — ✅ 2026-09-21 · Claude (agente)
- [x] **11** · `POST /api/trips/generate`: usa el motor, calcula el desglose (39/32/29 + tarifa), crea las pistas con `unlockAt` y el `shareCode`, y actualiza el ADN viajero — ✅ 2026-09-21 · Claude (agente)
- [x] **12** · `GET /api/trips` y `GET /api/trips/:id`: **nunca** devuelven el destino ni las pistas bloqueadas antes de `revealAt` (se oculta en el backend). `POST /api/trips/:id/reroll` — ✅ 2026-09-21 · Claude (agente)
- [x] **13** · `POST /api/trips/:id/reserve` (plan, simulado → `RESERVED`), `/extra-clue`, `/reveal`, `/guess`. Públicos: `GET /api/share/:code` y `POST /api/share/:code/guess` — ✅ 2026-09-21 · Claude (agente)
- [x] **14** · `POST /api/events` (público, con `anonId`), `POST /api/feedback` y modo demo (`DEMO_MODE=true`: pistas cada 30 s y `revealAt` a 3 min de reservar) — ✅ 2026-09-21 · Claude (agente)

✔ **Chequeo B:** con curl o Postman se puede registrar, generar un viaje, reservarlo, ver las pistas desbloquearse en modo demo, adivinar y revelar, y el destino **no** aparece en las respuestas antes de tiempo.

### Etapa C · Flujo principal (frontend, móvil primero)
- [x] **15** · `lib/api.ts` (fetch con token en localStorage), `lib/track.ts` (manda el evento al backend y a `fbq`, con `anonId` en localStorage) y el Meta Pixel en el layout — ✅ 2026-09-21 · Claude (agente)
- [x] **16** · `/` definitiva, `/registro` y `/login` (guardando `?ref` y `?utm_*`) — ✅ 2026-09-21 · Claude (agente)
- [x] **17** · Wizard `/crear` · pasos 1–2 (origen, fechas, presupuesto con desglose en vivo y viajeros PAX) — ✅ 2026-09-21 · Claude (agente)
- [x] **18** · Wizard `/crear` · pasos 3–5 (gustos, cosas a evitar, para mí o regalo) — ✅ 2026-09-21 · Claude (agente)
- [x] **19** · `/crear/generando` con el tablero de salidas animado — ✅ 2026-09-21 · Claude (agente)
- [x] **20** · `/viaje/[id]`: boarding pass con `???` y re-sortear — ✅ 2026-09-21 · Claude (agente)
- [x] **21** · `/viaje/[id]/pago`: checkout simulado con comisión única (antes eran 3 planes, cambiado el 2026-09-21) — ✅ 2026-09-21 · Claude (agente)
- [x] **22** · `/viaje/[id]/pistas`: cuenta regresiva, pistas, adivinar, compartir (Web Share API; si no existe, copiar el link) y botón de demo "Adelantar el tiempo" (la pista extra paga se quitó) — ✅ 2026-09-21 · Claude (agente)
- [x] **23** · `/viaje/[id]/revelacion`: animación del sobre, destino, razón de la IA, itinerario, "¿adivinaste?" y encuesta NPS — ✅ 2026-09-21 · Claude (agente)
- [x] **24** · `/mis-viajes` + revisión responsive completa a 390 px, 768 px y 1440 px — ✅ 2026-09-21 · Claude (agente)

✔ **Chequeo C:** una persona que no conoce la app completa el flujo entero **desde su celular** sin ayuda.

### Etapa D · Crecimiento y métricas
- [x] **25** · `/s/[code]`: página pública donde los amigos adivinan, con CTA de referido — ✅ 2026-09-21 · Claude (agente)
- [x] **26** · Modo regalo: `/regalo/[code]` con mensaje, cuenta regresiva y pistas — ✅ 2026-09-21 · Claude (agente)
- [x] **27** · Widget de feedback global + banner del modo demo — ✅ 2026-09-21 · Claude (agente)
- [x] **28** · API admin: `GET /api/admin/metrics` (KPIs, embudo por usuario o anonId único, serie diaria, top de gustos, top de destinos, tasa de acierto, referidos y NPS), `GET /api/admin/feedback`, CRUD `/api/admin/iterations` y `GET /api/admin/export.csv` — ✅ 2026-09-21 · Claude (agente)
- [x] **29** · `/admin` (KPIs + gráficas en recharts), `/admin/feedback` y `/admin/iteraciones` — ✅ 2026-09-21 · Claude (agente)
- [ ] **30** · Conectar la landing: los CTA de `AiTrava-landing` apuntan a la app con `utm_source=landing` — ⛔ necesita la URL pública de la app (D1) — ✅ ___

✔ **Chequeo D:** después de hacer el flujo con 2 cuentas y un amigo que adivina, el dashboard muestra el embudo, el NPS y el referido correctamente.

### Etapa E · Validación con usuarios e iteraciones
- [x] **31** · Poner la app al alcance de usuarios reales. Por ahora: desde el PC con `pnpm dev -H 0.0.0.0` en la misma red (instrucciones en el README). **El despliegue público se decide después (D1).** — ✅ 2026-09-21 · Claude (agente)
- [ ] **32** · **Iteración v1:** 5–8 pruebas guiadas con personas del segmento (18–30 años), siguiendo **`docs/PRUEBAS-USUARIOS.md`**. Observar dónde se traban, recoger citas y registrar todo en `/admin/iteraciones` — ✅ ___
- [ ] **33** · Aplicar los cambios de la v1 (2–3 ajustes con base en los datos) — ✅ ___
- [ ] **34** · Campaña en Instagram/Meta + historias + grupos universitarios, que lleve a la app (requiere D1) — ✅ ___
- [ ] **35** · **Iteración v2:** analizar el embudo, aplicar cambios (copy, % de comisión, número de pistas, quitar un paso…) y registrar hipótesis → resultado — ✅ ___
- [ ] **36** · **Iteración v3:** repetir y comparar las métricas antes y después — ✅ ___
- [ ] **37** · Recolectar 5+ testimonios, capturas y la tabla de métricas final (rellenar la columna "Real" de abajo) — ✅ ___

✔ **Chequeo E:** hay 3 iteraciones documentadas, cada una con su dato → decisión → resultado.

**Metas de validación (ajustarlas cuando haya datos):**

| Métrica | Meta | Real |
| :-- | :-: | :-: |
| Visitas a la app | 300 | |
| Registros | 80 | |
| Quiz completado / registros | ≥ 60 % | |
| Viajes generados | 50 | |
| Reservas simuladas (intención de compra) | 15 | |
| "Apartar con $50.000" o lista de espera con pago | 3 | |
| Adivinanzas de amigos (viralidad) | 30 | |
| Registros por referido | 10 | |
| NPS | ≥ 40 | |
| Iteraciones documentadas | 3 | |

**Plantilla de aprendizaje (una por cambio, va en `/admin/iteraciones`):**
> **v2 · fecha** — *Hipótesis:* "El paso de restricciones hace que la gente abandone". *Métrica:* abandono en `quiz_step=4` = 45 %. *Decisión:* hacerlo opcional. *Resultado:* el abandono bajó a 18 %.

### Etapa F · Presentación
- [x] **38** · Datos de la demo: `pnpm db:demo` (en `aitrava-api/`) deja a `demo@aitrava.co` con un viaje listo para abrir (Cartagena, 2 amigos apostaron) y otro con pistas a medias (Salento). Correrlo justo antes de presentar — ✅ 2026-09-21 · Claude (agente)
- [ ] **39** · Diapositivas con capturas del dashboard real. Contenido diapositiva por diapositiva en **`docs/PRESENTACION.md`** — ✅ ___
- [ ] **40** · Grabar un video de la demo como plan B — ✅ ___
- [ ] **41** · Ensayo cronometrado ×2 — ✅ ___

✔ **Chequeo F:** la presentación cabe en el tiempo y la demo funciona de principio a fin.

### 8.1 Notas de implementación (lo que ya existe)

- **Cuentas:** `admin@aitrava.co` y `demo@aitrava.co`, clave `aitrava123` (las crea el seed). `pnpm db:demo` le prepara viajes de ejemplo a la cuenta demo.
- **Modelo de ingresos en el código:** comisión del 10 % en `aitrava-api/src/engine/types.ts` (`COMMISSION_RATE`) y en `aitrava-app/lib/constants.ts`. Máximo 2 re-sorteos gratis por viaje (`MAX_REROLLS`).
- **Destinos:** 15 en `aitrava-api/prisma/destinations.ts` (tags, precio, cosas a evitar, banco de pistas e itinerario). Para agregar o editar uno: se cambia el archivo y se corre `pnpm db:seed`. `imageUrl` está vacío y la app muestra una postal con degradado; se puede poner una URL de foto real.
- **Motor:** `aitrava-api/src/engine/engine.service.ts`. Filtra por presupuesto, cosas a evitar y origen; puntúa por gustos + ADN viajero (+ algo de azar). **La IA no es necesaria para elegir el destino**: eso lo hace el algoritmo. Si hay `GROQ_API_KEY`, la IA elige entre el top 5 y escribe pistas, razón e itinerario personalizados (~1,5 s); si falla o no hay key, usa el banco de pistas del catálogo. Probado con la key real el 2026-09-21.
- **Modo demo:** `DEMO_MODE=true` → pistas cada 30 s, revelación a los 3 min de reservar y botón "⏩ Adelantar el tiempo" en la pantalla de pistas (para la presentación). **Para usuarios reales poner `DEMO_MODE=false`.**
- **Eventos del embudo.** Los registra el backend: `signup`, `trip_generated`, `trip_reroll`, `reservation`, `guess`, `friend_guess`, `reveal`, `nps_submit`, `feedback_submit`. Los registra el frontend (`lib/track.ts`, también al Meta Pixel): `page_view`, `cta_click`, `quiz_start`, `quiz_step`, `quiz_complete`, `checkout_view`, `share`, `share_view`, `gift_open`, `referral_click`, `clue_view`. Al registrarse, los eventos anónimos pasan a ser del usuario.
- **El wizard se puede llenar sin cuenta.** El registro se pide al final (mejor conversión) y el borrador se guarda en `sessionStorage`.
- **Antes de las pruebas con usuarios reales:** borrar los datos de prueba con `pnpm db:reset` (en `aitrava-api/`, **borra todo**) para que el dashboard muestre solo datos reales.
- **Probado:** flujo completo en Chrome headless a 390 px y 1440 px (registro → wizard → generar → re-sortear → pagar → pistas → apostar → amigo/regalo apuesta → adelantar → abrir sobre → NPS → admin). Los builds de producción de ambos proyectos compilan y el lint pasa.

---

## 9. Guion de la presentación

*Ajustar los tiempos al límite que ponga el profe (pendiente D2).*

1. **Problema** (30 s): planear un viaje estresa. Un dato de las encuestas o entrevistas.
2. **Solución** (30 s): AiTrava en una frase y el público objetivo.
3. **Demo en vivo** (2–3 min, celular proyectado): wizard → generando → boarding pass `???` → reservar → pistas (en modo demo se desbloquean) → un amigo adivina desde otro celular → revelación.
4. **Innovación y barreras de imitación** (45 s): motor de sorpresa, gamificación de la espera, ADN viajero e inventario opaco.
5. **Evidencia** (1 min): dashboard real con embudo, conversiones, NPS y testimonios.
6. **Iteraciones** (45 s): v1 → v2 → v3, "vimos X → cambiamos Y".
7. **Modelo de negocio** (45 s): comisión única del 10 % dentro del tope, margen por inventario opaco y modo regalo.
8. **Cierre** (15 s): siguiente paso y el tagline.

---

## 10. Decisiones

### Tomadas
- Next + Nest + Prisma + Postgres. **Solo la BD corre en Docker.**
- Prototipo simple: ni pagos reales ni reservas reales.
- Destinos solo en Colombia, presupuesto en COP.
- La IA elige sobre un **catálogo curado** (no inventa destinos) y hay un respaldo sin IA.
- El destino se oculta **en el backend**.
- Equipo de 3 personas con **trabajo lineal**: un paso a la vez, en orden.
- Sin diseño previo en Claude Design: se construye directo con los estilos de la landing (`design/`).
- **Modelo de ingresos: comisión única del 10 % por viaje.** Sin planes, sin pistas pagas, re-sorteos gratis (máx. 2).
- **IA: Groq** con `openai/gpt-oss-120b`. El algoritmo por puntaje sigue como respaldo.

### Pendientes (responder aquí)
- **D1 · Despliegue público** → *se decide después*. Hace falta antes del paso 34 (campaña). Opción sugerida: Vercel + Render + Neon. → ___
- **D2 · Fecha de entrega y duración de la presentación.** → ___
- ~~**D3 · Clave de IA**~~ → **Resuelta:** se usa Groq (gratis). La clave está en `aitrava-api/.env`, que no se sube a git; cada compañero crea la suya en console.groq.com o la pide por privado.

---

## 11. Registro de cambios

| Fecha | Quién | Qué |
| :-- | :-- | :-- |
| 2026-09-21 | Juan Pablo + Claude | Se crea el roadmap. |
| 2026-09-21 | Juan Pablo + Claude | El plan de trabajo pasa a ser lineal y con checks (41 pasos). El diseño de la landing se copia a `design/`. El despliegue se pospone. |
| 2026-09-21 | Claude (agente) | Pasos 01–29 hechos: Docker + Prisma, API completa (auth, motor IA/puntaje, viajes, pistas, apuestas, compartir, feedback, métricas, iteraciones), app completa y responsive (wizard, boarding pass, pago simulado con planes, pistas, sobre, regalo, compartir, perfil con referidos, widget de feedback, NPS, panel admin). Extra: botón "Adelantar el tiempo" en modo demo. Prisma se fijó en la versión 6.19. El paso 30 queda bloqueado por D1. |
| 2026-09-21 | Claude (agente) | Cambio de modelo de negocio: se quitan los 3 planes, la pista extra paga y el re-sorteo pago; queda una comisión única del 10 % dentro del tope (migración `comision_unica`). IA migrada de Claude a Groq (`openai/gpt-oss-120b`, probado). Pasos 31 y 38 hechos (`pnpm db:demo`). Nuevas guías: `docs/PRUEBAS-USUARIOS.md` y `docs/PRESENTACION.md`. |
