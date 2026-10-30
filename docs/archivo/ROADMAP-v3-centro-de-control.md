# AITRAVA 3.0 · Roadmap del producto

> **Documento vivo.** Lo leen el equipo y el agente (Claude Code) **antes de trabajar, siempre**.
> El trabajo es **lineal**: se toma el siguiente paso sin marcar del **Plan de trabajo (sección 8)**. Al terminarlo se marca `[x]` con la fecha y quién lo hizo, se actualiza la tabla de progreso (0.1) y se anota en el **Registro de cambios** (sección 11).
> Si una decisión cambia, se edita aquí primero y después el código.

**Última actualización:** 2026-10-19 · **Paso actual:** 67 (el equipo configura SMTP, `ADMIN_EMAILS` y `APP_URL` en Railway).

> **Cambio total de modelo (2026-10-19).** AiTrava dejó de ser "viajes sorpresa con pistas" y pasa a ser **AITRAVA 3.0: el centro de control digital del viaje, con un plan de ahorro inteligente**. La especificación completa del equipo está en **`docs/AITRAVA 3.docx`** (182 secciones). Este roadmap la resume y la aterriza. El roadmap anterior (pasos 01–47) está archivado tal cual en **`docs/archivo/ROADMAP-v2-viajes-sorpresa.md`**.

---

## 0. Cómo usar este documento

| Si eres… | Haz esto |
| :-- | :-- |
| **Compañero del equipo** | Haz `git pull`, busca en la sección 8 el **primer paso sin marcar** y avisa en el grupo que lo tomas. Al terminar: márcalo `[x]`, rellena `✅ fecha · nombre`, actualiza la tabla 0.1, anota en la sección 11, haz commit y push. |
| **Agente (Claude Code)** | Lee todo este archivo. Trabaja **solo en el primer paso sin marcar** (o en el que el usuario pida). Al terminar, haz lo mismo que un compañero. Ante la duda sobre un detalle, la fuente es `docs/AITRAVA 3.docx`. No agregues cosas fuera del alcance (sección 3) sin preguntar. |

**Reglas de oro (de la especificación):**
1. **Nada inventado.** Ni ventas, ni visitas, ni alianzas, ni ahorros comprobados, ni reviews. Si no hay datos se muestra `0` o "Sin datos suficientes". Lo de ejemplo se marca **DEMO**.
2. **AITRAVA no custodia dinero.** El plan de ahorro es una herramienta de planeación: el usuario guarda la plata en su propia cuenta y registra su avance.
3. **Ningún pago simulado cuenta como venta.** Solo cuenta un pago con estado `approved`.
4. **Móvil primero.** En escritorio "organizo mi viaje"; en el celular "estoy viviendo mi viaje".

### 0.1 Progreso

| Etapa | Pasos | Hechos | Estado |
| :-- | :-: | :-: | :-: |
| A–G · Versión 2 (viajes sorpresa) — archivada | 01–47 | 37/47 | 🗄️ |
| H · AITRAVA 3.0: backend | 48–55 | 8/8 | ✅ |
| I · AITRAVA 3.0: frontend | 56–65 | 10/10 | ✅ |
| J · Cierre técnico y puesta en producción | 66–69 | 1/4 | 🟡 |
| K · Validación con usuarios y presentación | 70–76 | 0/7 | ⬜ |
| **Total 3.0** | 48–76 | **19/29** | |

Estados: ⬜ sin empezar · 🟡 en curso · ✅ terminada · 🗄️ archivada

---

## 1. Qué es AITRAVA 3.0

**"AITRAVA — Tu viaje vive aquí."** Asistente inteligente de viajes.

AITRAVA es **el centro de control digital del viaje**: convierte cada viaje en un espacio ("**Mi Viaje**") que acompaña al viajero **antes y durante** la experiencia. Permite planear, centralizar, organizar, guardar, acompañar, guiar y adaptar el viaje desde un mismo producto.

- **Problema:** el vuelo está en la app de la aerolínea, el hotel en Booking, el tour en un correo, el seguro en un PDF, el presupuesto en Excel y las direcciones en Maps. El viaje existe, pero está fragmentado. Y antes de eso, **muchos viajes no pasan porque la plata no se planea**.
- **Diferencial:** "Una plataforma conoce tu vuelo, otra tu hotel, otra un restaurante. **AITRAVA conoce TU VIAJE.**" No nos diferenciamos por tener más componentes, sino por **conectarlos alrededor del viaje del usuario**, incluso si los compró en otro lado.
- **Pilar principal pedido por el equipo: el ahorro.** El viaje empieza el día que se planea: AITRAVA arma un **plan de ahorro inteligente** desde hoy hasta la fecha del viaje (ver 1.1).
- **Segmento:** jóvenes nativos digitales (18–30 años) que viajan solos, en pareja, con amigos o en familia, y que necesitan organizar la plata y la logística sin estrés.
- **La IA no es la protagonista.** No hay chat abierto con IA. Si se usa, es tecnología de soporte (por ejemplo, sugerir un itinerario base).
- **Ciclo del producto:** ANTES (planear + ahorrar) → DURANTE (Modo Viaje) → DESPUÉS (futuro). El PMV se concentra en **antes + durante**.

### 1.1 Plan de ahorro inteligente (pilar)

"Ahorra desde que lo planeas hasta que te subes al avión."

1. **Meta:** el costo del viaje sale del presupuesto (o de lo que ya se cargó en reservas). El usuario dice cuánto tiene ahorrado.
2. **Hitos de pago:** cada parte del viaje tiene una fecha en la que normalmente hay que pagarla (vuelo ~60 días antes, alojamiento ~30, actividades ~15, seguro ~7, gastos en destino el día del viaje). Si el usuario cargó una reserva con su fecha y costo, se usa ese dato real.
3. **Cuota inteligente:** con la frecuencia que elija (**semanal, quincenal o mensual**, alineada con el día de pago), el plan calcula la **cuota mínima constante que alcanza para pagar cada cosa a tiempo**, no solo para el total al final. Muestra el calendario: "con tu cuota del 15 de noviembre ya tienes el vuelo".
4. **Capacidad real:** si el usuario dice cuánto puede ahorrar al mes y no le alcanza, el plan propone opciones concretas: mover el viaje a la fecha más cercana en la que sí alcanza, bajar el presupuesto en X o subir la cuota.
5. **Seguimiento:** el usuario registra sus aportes (declarados). El plan muestra si va al día, adelantado o atrasado y **recalcula** la cuota que falta.
6. **Sin custodia:** la plata queda en la cuenta del usuario (por ejemplo, un bolsillo de su banco). AITRAVA nunca dice "tu dinero está guardado aquí".

El plan de ahorro es **gratis**: es lo que trae al usuario desde meses antes del viaje y lo deja listo para activar el Pass cuando se acerca la fecha.

---

## 2. Cómo cumplimos la rúbrica (mapa criterio → qué construimos)

| # | Criterio | Qué lo demuestra en el producto | Evidencia |
| :-: | :-- | :-- | :-- |
| 1 | **Diferenciadores difíciles de copiar** | (a) **Mi Viaje** centraliza todo, aunque se haya comprado fuera (reservas externas). (b) **Plan de ahorro inteligente por hitos** que conecta la plata con cada parte del viaje. (c) **Modo Viaje**: "¿qué tengo que hacer ahora, dónde está mi reserva y cómo llego?". (d) Datos propios de cómo planea y gasta el viajero. | Demo en vivo con el caso **España (DEMO)**. |
| 2 | **Prototipo funcional, iterativo, validado** | Flujo real: registro → verificación de correo → crear viaje → plan de ahorro → reserva externa → documento en la Bóveda → itinerario → presupuesto → checkout → Wompi. Feedback + iteraciones en `/admin`. | `/admin/analytics`, iteraciones y testimonios. |
| 3 | **Respuesta del público y conversiones** | Eventos propios (sección 6.2) + Meta Pixel. Embudo de validación de 10 etapas en `/admin`. | Gráfica del embudo con datos reales. |
| 4 | **Modelo innovador** | **Freemium + AITRAVA Pass por viaje ($39.900, sin suscripción)**. El ahorro gratis crea el hábito meses antes; el Pass se ofrece en contexto cuando el viaje se acerca. Pago real por Wompi y finanzas reales (ingresos − costos = margen). | `/admin/finanzas` con ingresos confirmados. |
| 5 | **Presentación** | Caso demo España marcado DEMO, separado de los datos reales. | Ensayo cronometrado. |

---

## 3. Alcance

### ✅ Sí entra (PMV)
- Web app **responsive y móvil primero** (360 → 1440 px), fondo blanco, azul oscuro, azul secundario y amarillo del logo.
- **Auth real:** registro con nombre, apellido, correo, contraseña, términos y autorización de datos; **verificación de correo real** (SMTP), reenvío con espera de 60 s, inicio de sesión, recuperar contraseña y cerrar sesión. Roles `USER` y `ADMIN` (admin solo por `ADMIN_EMAILS` en el servidor o desde el panel admin).
- **Crear viaje** en 5 pasos con 3 modos: *Sé a dónde voy*, *Ayúdame a elegir*, *Destino sorpresa* (los dos últimos sugieren destinos del catálogo; no es un chat de IA).
- **Mi Viaje** (`/viajes/[id]`): cuenta regresiva, % preparado, checklist, próxima actividad y módulos (itinerario, transporte, alojamiento, actividades, restaurantes, presupuesto, Bóveda, meta de ahorro).
- **Reservas externas** (lo compraste donde lo compraste, agrégalo) e **itinerario** con línea de tiempo.
- **Bóveda** con archivos privados (PDF/JPG/PNG/WEBP, máx. 5 MB) que solo ve su dueño.
- **Presupuesto** por categoría (presupuesto / estimado / gastado / disponible) y **registro de gastos**.
- **Plan de ahorro inteligente** (sección 1.1).
- **Modo Viaje** (ahora / siguiente / después), **Cómo llegar** (abre Google Maps con la ruta real; no inventamos rutas), **Explora cerca** (lugares reales de OpenStreetMap) y **Cambiar mis planes** (replan determinístico).
- **AITRAVA Pass** ($39.900 por viaje), checkout con redirección a **Wompi**, estados de pago, verificación (webhook firmado si hay credenciales; si no, verificación manual del admin) y **comprobante PDF** solo si el pago está aprobado.
- Páginas públicas: inicio, destinos (inspiración), proveedores (con disclaimer), nosotros, contacto (mensajes guardados en la BD), ayuda, términos, privacidad, tratamiento de datos. Footer, WhatsApp flotante e Instagram.
- **Admin** (`/admin`): dashboard con KPIs reales, embudo, usuarios, viajes, pagos (verificar), finanzas (costos, margen, rangos), analítica, proveedores (CRUD con estados), mensajes, feedback e iteraciones. Exportación CSV.
- **Caso demo "España"** marcado DEMO y excluido de las métricas.

### ❌ No entra (o queda como FUTURO, sin presentarlo como real)
- Billetera, recaudo de ahorros o saldos (requiere aliados y análisis legal).
- Factura electrónica (AITRAVA no está constituida: se usa "Comprobante de pago").
- Reservas reales con proveedores, precios en vivo, notificaciones push, offline completo, cámara/escáner, app nativa, chat de IA.
- Conexión con bancos.

### Etiquetas internas
`IMPLEMENTADO` · `DEMO` · `FUTURO`. Lo FUTURO nunca se muestra como si funcionara.

---

## 4. Stack y estructura

**Decisión (2026-10-19):** se **conserva** el stack actual en vez de migrar a Supabase/Vercel (la especificación lo permite en §89 y §134: "no destruir lo que funciona"). Equivalencias:

| La especificación pide | Lo hacemos con |
| :-- | :-- |
| Supabase Auth | JWT + bcrypt en NestJS, verificación y recuperación por correo con **nodemailer (SMTP)** |
| RLS | Todas las consultas filtran por `userId` del token en el backend; los guards de admin protegen `/api/admin/*` |
| Supabase Storage privado | Archivos en Postgres (`bytea`), servidos solo por un endpoint autenticado; el frontend los abre como `blob:` (no hay URL pública) |
| Vercel | App en Cloudflare Workers (OpenNext) y API + Postgres en Railway (ya desplegados, ver `docs/DESPLIEGUE.md`) |
| Mapas | Google Maps (enlace de direcciones, sin clave), OpenStreetMap/Overpass para "Explora cerca" y Nominatim para ubicar direcciones |

| Capa | Tecnología |
| :-- | :-- |
| Frontend | Next.js 16 (App Router) + Tailwind 4 + TypeScript → `aitrava-app/` |
| Backend | NestJS 11 + Prisma 6.19 → `aitrava-api/` |
| BD | PostgreSQL 16 (Docker en local, Railway en producción) |
| Correo | nodemailer (SMTP: Gmail con clave de aplicación de `aitrava.25@gmail.com`, o cualquier proveedor) |
| PDF | `pdfkit` en el backend |
| Gráficas | `recharts` (solo admin) |
| IA (soporte, opcional) | Groq (`groq-sdk`), clave solo en `aitrava-api/.env` |

### Variables de entorno
```bash
# aitrava-api/.env  (solo nombres en git; los valores van en .env o en Railway)
DATABASE_URL=
JWT_SECRET=
APP_URL=                    # URL de la app (enlaces de los correos y CORS)
ADMIN_EMAILS=               # correos (separados por coma) que reciben rol admin al verificar
ADMIN_EMAIL= / ADMIN_PASSWORD=  # admin de respaldo creado por el seed (solo local si se dejan vacíos)
SMTP_HOST= SMTP_PORT= SMTP_USER= SMTP_PASS= MAIL_FROM=
PASS_PRICE_COP=39900
PAYMENT_URL=https://checkout.nequi.wompi.co/l/PgimzF
WOMPI_EVENTS_SECRET=        # para verificar el webhook; vacío = verificación manual
GROQ_API_KEY= GROQ_MODEL=

# aitrava-app/.env.local
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_WHATSAPP_NUMBER=573117452985
NEXT_PUBLIC_CONTACT_EMAIL=aitrava.25@gmail.com
NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/aitrava26
```
El precio del Pass, el link de pago y los límites del plan gratis **viven en el backend** (`src/common/config.ts`) y la app los lee de `GET /api/config`: nunca se duplican en componentes.

---

## 5. Diseño

**Dirección visual 3.0:** fondo **blanco**, mucho espacio, fotografía de viaje, **azul oscuro profundo** como color principal, azules secundarios, **amarillo del logo como acento**, grises suaves, cards blancas con sombras suaves y bordes redondeados. Nada de morado ni estética genérica de "AI startup". *(Los dos mockups oficiales que menciona la especificación no venían dentro del .docx; si el equipo los tiene, guardarlos en `design/v3/` y ajustar.)*

| Token (`app/globals.css`) | Valor | Uso |
| :-- | :-- | :-- |
| `--color-navy` | `#0B1F3A` | Títulos, header, footer, botón principal oscuro |
| `--color-blue` | `#1E5BD8` | Enlaces, acciones secundarias, gráficas |
| `--color-sky` | `#EAF1FF` | Fondos suaves de módulos |
| `--color-yellow` | `#FFC800` | Acento del logo, CTA "Crear mi viaje", progreso |
| `--color-bg` / `--color-surface` | `#FFFFFF` / `#F6F8FB` | Fondo / secciones |
| `--color-text` / `--color-text-2` | `#0B1F3A` / `#5B6B82` | Texto |
| `--color-ok` / `--color-warn` / `--color-bad` | `#14A06B` / `#E89B0C` / `#D64545` | Estados |

- **Tipografía:** *Plus Jakarta Sans* (títulos 800, cuerpo 400–600). Etiquetas pequeñas en mayúsculas con `letter-spacing`.
- **Logo:** `public/brand/aitrava-mark.jpg` (el oficial vigente), con `object-contain`, sin recolorear.
- **Móvil:** header `[logo] … [avatar]`; con sesión, barra inferior `[Inicio] [Mi Viaje] [Explorar] [Bóveda] [Perfil]` con safe-area. Botones ≥ 48 px. Sin scroll horizontal.
- **Escritorio:** navbar `Inicio · Destinos · Planear viaje · Mis viajes · Proveedores · Nosotros · Ayuda` + `Iniciar sesión / Crear cuenta` o avatar.
- **Estados:** vacíos ("Tu próximo viaje empieza aquí"), cargando (skeletons), errores (404, sin conexión, sesión expirada, ubicación denegada, archivo inválido, pago desconocido/rechazado, correo sin verificar).

---

## 6. Pantallas, API y eventos

### 6.1 Rutas de la app
| Ruta | Qué muestra |
| :-- | :-- |
| `/` | Hero "Tu viaje vive aquí", beneficios (todo en un lugar, reservas de otros lados, guía durante el viaje, **ahorra para tu viaje**, tranquilidad), cómo funciona, plan de ahorro, destinos de inspiración, Pass. |
| `/registro`, `/iniciar-sesion`, `/verificar-correo`, `/recuperar-contrasena`, `/restablecer-contrasena` | Auth real. |
| `/planear` | Wizard de 5 pasos: modo + destino · fechas · viajeros · presupuesto (y ahorro) · preferencias. |
| `/destinos` | Destinos de inspiración (sin precios ni disponibilidad inventados). |
| `/mis-viajes` | Lista de viajes con progreso de preparación y de ahorro. |
| `/viajes/[id]` | **Mi Viaje** (corazón del producto). |
| `/viajes/[id]/itinerario` · `/transporte` · `/alojamiento` · `/actividades` · `/restaurantes` | Línea de tiempo y reservas por categoría. |
| `/viajes/[id]/presupuesto` | Restante, gastado, total, categorías y "+ Registrar gasto". |
| `/viajes/[id]/boveda` | Documentos y reservas con filtros y búsqueda. |
| `/viajes/[id]/meta` | **Plan de ahorro inteligente.** |
| `/viajes/[id]/modo-viaje` | Ahora / siguiente / después, acciones rápidas, cómo llegar, explora cerca, cambiar plan. *(Pass)* |
| `/checkout/[tripId]`, `/pago/resultado`, `/comprobante/[paymentId]` | Pass, Wompi y comprobante. |
| `/mi-cuenta` | Datos, pagos, cerrar sesión, eliminar cuenta. |
| `/proveedores`, `/nosotros`, `/contacto`, `/ayuda`, `/terminos`, `/privacidad`, `/tratamiento-de-datos` | Públicas. |
| `/admin` + `/usuarios` `/viajes` `/pagos` `/finanzas` `/analytics` `/proveedores` `/mensajes` `/feedback` `/iteraciones` | Panel admin (solo `ADMIN`). |

### 6.2 Eventos de analítica
`landing_view, signup_started, signup_completed, email_verified, login, trip_creation_started, trip_created, external_booking_added, vault_opened, document_uploaded, itinerary_viewed, budget_viewed, savings_goal_created, savings_contribution_added, travel_mode_opened, directions_clicked, nearby_explore_opened, checkout_viewed, payment_cta_clicked, wompi_redirected, payment_pending, payment_approved, payment_declined, receipt_downloaded`.
Se guardan con `name`, `userId?`, `tripId?`, `anonId?`, `props` (sin datos sensibles ni documentos) y fecha. **Los eventos de usuarios o viajes DEMO no cuentan en las métricas.**

**Embudo de validación:** visita → registro iniciado → registrado → correo verificado → viaje creado → reserva/documento agregado → checkout → pago iniciado → pago confirmado → Modo Viaje usado.

---

## 7. Modelo de negocio (criterio 4)

**Decisión (2026-10-19): FREEMIUM + AITRAVA PASS POR VIAJE.** Reemplaza la tarifa fija de $50.000 y la comisión de aliados de la versión 2.

| Plan | Precio | Incluye |
| :-- | :-- | :-- |
| **AITRAVA Free** | $0 | Crear viajes, Mi Viaje, itinerario, reservas externas, presupuesto y gastos, **plan de ahorro inteligente completo**, Bóveda con hasta **3 documentos** por viaje (límite en `FREE_LIMITS`). |
| **AITRAVA Pass** | **$39.900 COP por viaje** (pago único, no suscripción) | Bóveda ilimitada, **Modo Viaje**, Cómo llegar, Explora cerca, Cambiar mis planes y las funciones premium futuras de ese viaje. |

- **El precio es una hipótesis** a validar (configurable con `PASS_PRICE_COP`).
- **Paywall en contexto, nunca de entrada:** "Tu viaje comienza en 12 días. Activa Modo Viaje y lleva contigo rutas, Bóveda completa y acompañamiento."
- **Pago:** link de Wompi (`PAYMENT_URL`). AITRAVA **no pide datos de tarjeta**. No se muestra el nombre del titular de Nequi Negocios: "Pago seguro procesado mediante Wompi".
- **Estados:** `created, redirected, pending, pending_verification, approved, declined, cancelled, error, unknown`. Volver a la app **no** significa que pagó. El Pass se activa solo con `approved` (webhook con firma válida o verificación del admin).
- **Finanzas:** ingreso = Passes aprobados. Margen de contribución = ingresos − costos variables (pasarela…); resultado operativo = margen − costos fijos. El presupuesto del viaje **nunca** es ingreso de AITRAVA.
- **Futuro (no se presenta como real):** alianzas con proveedores (comisiones), aliado financiero para un ahorro programado real.

---

## 8. Plan de trabajo (lineal, con checks)

> Siempre se hace el **primer paso sin marcar**. Al terminarlo: `- [ ]` → `- [x]` y `✅ fecha · nombre`. Si un paso se bloquea: `⛔ motivo`.

### Versión 2 (archivada)
Pasos 01–47 en `docs/archivo/ROADMAP-v2-viajes-sorpresa.md`. Se conservan de esa versión: el stack, el despliegue (Railway + Cloudflare), el tracking de eventos, feedback, iteraciones, el botón de WhatsApp y el panel admin como base. Se retiran: pistas, adivinanzas, sobre digital, modo regalo, links para compartir, factura y la tarifa de $50.000. Los pasos abiertos de la v2 (30, 32–37, 39–41) se reemplazan por la etapa K.

### Etapa H · AITRAVA 3.0: backend
- [x] **48** · Roadmap 3.0, `CLAUDE.md` y archivo del roadmap anterior — ✅ 2026-10-19 · Claude (agente)
- [x] **49** · Nuevo modelo de datos (Prisma) y migración: `User` (nombre, apellido, verificación, recuperación, consentimientos, `isDemo`), `Trip`, `ItineraryItem`, `Booking` (reservas externas), `VaultDocument`, `Expense`, `SavingsPlan`, `SavingsContribution`, `Payment`, `Pass`, `Provider`, `AdminCost`, `ContactMessage`, `Event` (con `tripId`). Seed: destinos de inspiración, proveedores DEMO y el caso **España (DEMO)** — ✅ 2026-10-19 · Claude (agente)
- [x] **50** · Auth real: registro con consentimientos, correo de verificación (nodemailer), reenvío con espera de 60 s, recuperar/restablecer contraseña, límite de intentos, `ADMIN_EMAILS`, eliminar cuenta — ✅ 2026-10-19 · Claude (agente)
- [x] **51** · API de viajes: CRUD, resumen de Mi Viaje (% preparado, checklist, próxima actividad), itinerario (con replan), reservas externas, presupuesto por categoría y gastos, sugerencias de destino (*Ayúdame a elegir* / *Sorpresa*) — ✅ 2026-10-19 · Claude (agente)
- [x] **52** · Bóveda: subir, listar, descargar y borrar archivos privados (tipo y tamaño validados, límite Free) — ✅ 2026-10-19 · Claude (agente)
- [x] **53** · **Plan de ahorro inteligente:** cálculo por hitos, frecuencia, capacidad mensual, sugerencias, aportes y recálculo — ✅ 2026-10-19 · Claude (agente)
- [x] **54** · AITRAVA Pass: `GET /api/config`, pagos y estados, redirección a Wompi, webhook firmado, verificación manual, activación del Pass y comprobante PDF — ✅ 2026-10-19 · Claude (agente)
- [x] **55** · Analítica y API admin: eventos 3.0, KPIs reales, embudo, usuarios (cambiar rol), viajes, pagos, finanzas (costos y margen por rango), proveedores CRUD, mensajes de contacto y exportación CSV — ✅ 2026-10-19 · Claude (agente)

✔ **Chequeo H:** con curl se puede registrar, verificar, crear un viaje con plan de ahorro, subir un archivo, pedir checkout y ver el pago en admin; un usuario no puede leer nada de otro.

### Etapa I · AITRAVA 3.0: frontend (móvil primero)
- [x] **56** · Sistema de diseño claro (tokens, tipografía, botones, cards, inputs) + Navbar, MobileNavbar, Footer, WhatsApp flotante, estados (vacío, cargando, error) — ✅ 2026-10-19 · Claude (agente)
- [x] **57** · Inicio + páginas públicas: destinos, proveedores (con disclaimer), nosotros, contacto, ayuda, términos, privacidad, tratamiento de datos, 404 — ✅ 2026-10-19 · Claude (agente)
- [x] **58** · Auth: registro, iniciar sesión, verificar correo, recuperar y restablecer contraseña, mi cuenta — ✅ 2026-10-19 · Claude (agente)
- [x] **59** · `/planear` (5 pasos, 3 modos) y `/mis-viajes` — ✅ 2026-10-19 · Claude (agente)
- [x] **60** · Mi Viaje y módulos: itinerario, transporte, alojamiento, actividades, restaurantes, reservas externas, presupuesto y gastos — ✅ 2026-10-19 · Claude (agente)
- [x] **61** · Bóveda (filtros, búsqueda, visor de PDF/imagen, QR grande) — ✅ 2026-10-19 · Claude (agente)
- [x] **62** · Meta de viaje: **plan de ahorro inteligente** (calendario de cuotas, hitos, capacidad, aportes, estado) — ✅ 2026-10-19 · Claude (agente)
- [x] **63** · Modo Viaje: ahora/siguiente/después, acciones rápidas, Cómo llegar, Explora cerca, Cambiar mis planes, permiso de ubicación — ✅ 2026-10-19 · Claude (agente)
- [x] **64** · Pass: paywall en contexto, `/checkout/[tripId]`, `/pago/resultado`, `/comprobante/[paymentId]` — ✅ 2026-10-19 · Claude (agente)
- [x] **65** · Admin: dashboard, usuarios, viajes, pagos, finanzas, analítica, proveedores, mensajes, feedback, iteraciones (responsive, menú en drawer en móvil) — ✅ 2026-10-19 · Claude (agente)

✔ **Chequeo I:** una persona hace desde su celular el caso de uso real (§124 de la especificación): se registra, verifica, crea un viaje, arma su plan de ahorro, agrega una reserva, sube un documento, arma el itinerario, mira el presupuesto, llega al checkout y abre Wompi; y todo queda en `/admin`.

### Etapa J · Cierre técnico y producción
- [x] **66** · QA: build y lint de ambos proyectos, recorrido a 360/390/430/768/1024/1440 px, README, `.env.example` y `docs/DESPLIEGUE.md` actualizados — ✅ 2026-10-19 · Claude (agente)
- [ ] **67** · **(Equipo)** Configurar en Railway: `SMTP_*` y `MAIL_FROM` (clave de aplicación de Gmail de `aitrava.25@gmail.com`), `ADMIN_EMAILS` con los 4 correos del equipo, `APP_URL` con la URL de Cloudflare, `PASS_PRICE_COP` y `PAYMENT_URL` — ✅ ___
- [ ] **68** · **(Equipo)** Wompi: configurar la URL de eventos `…/api/payments/wompi/events` y `WOMPI_EVENTS_SECRET`; mientras tanto, verificar pagos a mano desde `/admin/pagos` — ✅ ___
- [ ] **69** · Antes de abrir a usuarios reales: conectar los CTA de la landing con `utm_source=landing` — ✅ ___

### Etapa K · Validación con usuarios y presentación
- [ ] **70** · Iteración v1: 5–8 pruebas guiadas (actualizar `docs/PRUEBAS-USUARIOS.md` al modelo 3.0) y registrarlas en `/admin/iteraciones` — ✅ ___
- [ ] **71** · Aplicar 2–3 cambios de la v1 con base en datos — ✅ ___
- [ ] **72** · Campaña (Instagram + grupos universitarios) hacia la app desplegada — ✅ ___
- [ ] **73** · Iteraciones v2 y v3 con el embudo y el precio del Pass como hipótesis — ✅ ___
- [ ] **74** · Testimonios, capturas y tabla de métricas final — ✅ ___
- [ ] **75** · Actualizar `docs/PRESENTACION.md` al modelo 3.0 y armar las diapositivas — ✅ ___
- [ ] **76** · Video de la demo (plan B) y ensayo cronometrado ×2 — ✅ ___

**Metas de validación (ajustar con datos):**

| Métrica | Meta | Real |
| :-- | :-: | :-: |
| Visitas | 300 | |
| Registros / correos verificados | 80 / 60 | |
| Viajes creados | 50 | |
| Planes de ahorro creados | 30 | |
| Reservas o documentos agregados | 30 | |
| Checkouts / clics a Wompi | 15 / 8 | |
| Pagos aprobados (Pass) | 3 | |
| Iteraciones documentadas | 3 | |

### 8.1 Notas de implementación (lo que ya existe)

- **Migración `20261019153600_aitrava_3`:** borra viajes, pistas, apuestas y el catálogo de la v2; **conserva los usuarios** (el nombre se parte en nombre/apellido, quedan sin verificar), eventos, feedback e iteraciones. Corre sola al desplegar (`pnpm start` → `db:deploy`). Probada sobre una BD con usuarios de la v2.
- **Configuración de negocio:** `aitrava-api/src/common/config.ts` (precio del Pass, link de pago, límite Free de 3 documentos, tipos y tamaño de archivo). La app la lee de `GET /api/config`.
- **Plan de ahorro inteligente:** `aitrava-api/src/savings/plan.ts` (funciones puras). Hitos: transporte 60 días antes, alojamiento 30, actividades 15, seguro 7, gastos en destino 1 día antes; si hay una reserva con costo, ese hito se necesita desde ya. Días de pago: viernes (semanal), 15 y fin de mes (quincenal), fin de mes (mensual). Cuota por tramos no crecientes; estado al día/adelantado/atrasado contra el plan original; si no cabe en la capacidad mensual propone: fecha más cercana en que sí cabe, presupuesto máximo con las fechas actuales y cuánto más ahorrar al mes.
- **Auth:** JWT + bcrypt; `VerifiedGuard` exige correo verificado para viajes y pagos; `AdminGuard` confirma el rol en la BD. Correos con nodemailer (`src/mail/mail.service.ts`): sin SMTP no finge el envío y, solo fuera de producción, devuelve el enlace para probar. Los admins pueden verificar a mano en `/admin/usuarios`.
- **Bóveda:** archivos en Postgres (`bytea`), máx. 5 MB, tipo comprobado por los primeros bytes; descarga solo con sesión (`GET /api/trips/:id/documents/:docId/file`) y la app los abre como `blob:`.
- **Pagos:** estados de la especificación + `pending_verification`. Al volver de Wompi el usuario dice qué pasó ("ya pagué" → en verificación); el Pass se activa solo con el webhook firmado (`POST /api/payments/wompi/events`, se asocia por id de transacción, referencia o correo + valor) o con la aprobación de un admin en `/admin/pagos`. Comprobante PDF con `pdfkit` solo si está aprobado.
- **Mapas:** "Cómo llegar" abre Google Maps con la ruta (a pie, transporte público, carro). "Explora cerca" usa `GET /api/nearby` (Overpass y, si falla, Photon; ambos OpenStreetMap, con caché de 10 min) y un mapa Leaflet que se carga solo al elegir "Mapa". Las direcciones se ubican con Nominatim al guardar una actividad. Distancias y tiempos a pie son aproximados y se dice.
- **Demo:** `pnpm db:demo` crea para `demo@aitrava.co` el viaje **España (DEMO)** en curso (día 3 de 7, con reservas, QR, PDFs de ejemplo, gastos y plan cumplido) y **Japón (DEMO)** con la meta al 35 % y atrasada (muestra el recálculo). Lo DEMO tiene el Pass incluido sin pago y se excluye de métricas. Las cuentas y eventos del equipo (admins) también se excluyen.
- **Fotos:** `aitrava-app/public/img/` (Wikimedia Commons, créditos en `img/destinos/creditos.json`). Los mockups oficiales no venían en el .docx (D4).
- **Probado (2026-10-19):** 45 chequeos del API con curl (registro, verificación, aislamiento entre usuarios, límites de la Bóveda, archivo falso rechazado, checkout, aprobación, comprobante, webhook con firma buena y mala, métricas, CSV, recuperación de contraseña). En Chrome: wizard → viaje con plan de ahorro → aporte → reserva externa → documento en la Bóveda y visor; registro anónimo → verificación → retoma el borrador; Modo Viaje con lugares cercanos; sin scroll horizontal a 360, 390, 430, 768, 1024 y 1440 px. Builds y lint de ambos proyectos pasan.

---

## 9. Guion de la presentación (borrador)
1. **Problema** (30 s): el viaje está regado en 10 apps y la plata no se planea.
2. **Solución** (30 s): "Tu viaje vive aquí" + plan de ahorro inteligente.
3. **Demo** (2–3 min, celular): caso **España (DEMO)** → plan de ahorro por hitos → Mi Viaje → Bóveda con QR → Modo Viaje (cómo llegar, explora cerca) → Pass y Wompi.
4. **Diferencial** (45 s): conectamos el viaje alrededor del usuario, aunque compre fuera.
5. **Evidencia** (1 min): embudo real de `/admin`.
6. **Iteraciones** (45 s).
7. **Modelo** (45 s): freemium + Pass por viaje, finanzas reales.
8. **Cierre** (15 s): "AITRAVA — Tu viaje vive aquí."

---

## 10. Decisiones

### Tomadas
- **(2026-10-19) Cambio total al modelo AITRAVA 3.0** según `docs/AITRAVA 3.docx`, con el **ahorro como pilar** (plan de ahorro inteligente gratis, sección 1.1).
- **(2026-10-19) Se conserva el stack** Next + Nest + Prisma + Postgres, Railway + Cloudflare (equivalencias en la sección 4).
- **(2026-10-19) Modelo:** Free + Pass de $39.900 por viaje. Sin suscripción, sin otros cobros.
- **(2026-10-19) Sin custodia de dinero** y sin facturación electrónica.
- **(2026-10-19) Fase de prueba: verificar el correo es opcional.** Con `EMAIL_VERIFICATION_REQUIRED=false` (valor por defecto) el usuario entra y usa la app sin verificar; el correo se sigue enviando si hay SMTP y la verificación se puede hacer después. Para operación real se pone en `true`. El rol admin **siempre** exige correo verificado.
- La IA queda como soporte opcional (Groq), nunca como chat.
- Los proveedores que se muestran son **DEMO** (sin convenio) y llevan el disclaimer de la especificación.

### Pendientes (responder aquí)
- **D2 · Fecha de entrega y duración de la presentación.** → ___
- **D4 · Mockups oficiales y logo PNG** de la especificación: no venían dentro del .docx. Si existen, guardarlos en `design/v3/`. → ___
- **D5 · Datos de la v2 en producción.** ⚠️ Al desplegar la 3.0, la migración `aitrava_3` **borra los viajes sorpresa de la v2** (no tienen equivalente en el modelo nuevo) y conserva las cuentas. Confirmar en el equipo antes del `git push`; si quieren guardar algo, exportar antes desde el `/admin` de la v2. → ___

---

## 11. Registro de cambios

| Fecha | Quién | Qué |
| :-- | :-- | :-- |
| 2026-09-21 → 2026-10-15 | Equipo + Claude | Versión 2 (viajes sorpresa): ver el registro en `docs/archivo/ROADMAP-v2-viajes-sorpresa.md`. |
| 2026-10-19 | Juan Pablo + Claude (agente) | **Cambio total a AITRAVA 3.0** ("Tu viaje vive aquí") según `docs/AITRAVA 3.docx`, con el **plan de ahorro inteligente** como pilar. Roadmap reescrito; el anterior se archivó. |
| 2026-10-19 | Claude (agente) | Pasos 48–66: nuevo modelo de datos y migración (conserva usuarios), auth real con verificación de correo, Mi Viaje con itinerario, reservas externas, presupuesto y gastos, Bóveda privada, plan de ahorro inteligente por hitos, Modo Viaje (cómo llegar, explora cerca, cambiar planes), AITRAVA Pass con Wompi y comprobante PDF, panel admin completo con finanzas y exportación, páginas públicas y legales, diseño claro móvil primero. README, `.env.example` y `docs/DESPLIEGUE.md` actualizados. Se quitó la v2 (pistas, sobre, regalo, factura, tarifa de $50.000). |
| 2026-10-19 | Claude (agente) | Verificación de correo opcional en fase de prueba (`EMAIL_VERIFICATION_REQUIRED`), arreglos de scroll en celulares, guía PDF de pruebas (`docs/AITRAVA-guia-de-pruebas.pdf`) y revisión de despliegue. |
