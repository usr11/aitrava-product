# AiTrava · Roadmap del producto (v4 · "Ve solo, sal acompañado")

> **Documento vivo.** Lo leen el equipo y el agente (Claude Code) **antes de trabajar, siempre**.
> El trabajo es **lineal**: se toma el siguiente paso sin marcar del **Plan de trabajo (sección 8)**. Al terminarlo se marca `[x]` con la fecha y quién lo hizo, se actualiza la tabla de progreso (0.1) y se anota en el **Registro de cambios** (sección 11).
> Si una decisión cambia, se edita aquí primero y después el código.

**Última actualización:** 2026-10-29 · **Paso actual:** 92 (el equipo configura Railway y el número real de WhatsApp Business).

> **Cambio total de modelo (2026-10-29).** La junta del 2026-10-28 evaluó AITRAVA 3.0 (centro de control del viaje + plan de ahorro + Pass de $39.900) con 1.3/5.0: "no tiene valor", no era específico y no sabíamos para quién era. El equipo se definió por un modelo nuevo, descrito en **`docs/AiTrava-final.md`** (propuesta para la junta JD2) y **`docs/modelo.py`** (modelo financiero a 12 meses). Este roadmap los aterriza en el producto. El roadmap 3.0 quedó archivado tal cual en **`docs/archivo/ROADMAP-v3-centro-de-control.md`** y el de la v2 en `docs/archivo/ROADMAP-v2-viajes-sorpresa.md`.

---

## 0. Cómo usar este documento

| Si eres… | Haz esto |
| :-- | :-- |
| **Compañero del equipo** | Haz `git pull`, busca en la sección 8 el **primer paso sin marcar** y avisa en el grupo que lo tomas. Al terminar: márcalo `[x]`, rellena `✅ fecha · nombre`, actualiza la tabla 0.1, anota en la sección 11, haz commit y push. |
| **Agente (Claude Code)** | Lee todo este archivo. Trabaja **solo en el primer paso sin marcar** (o en el que el usuario pida). Al terminar, haz lo mismo que un compañero. Ante la duda, la fuente es `docs/AiTrava-final.md`. No agregues cosas fuera del alcance (sección 3) sin preguntar. |

**Reglas de oro:**
1. **Nada inventado.** Ni ventas, ni asistentes, ni anfitriones con convenio, ni reseñas, ni fotos de salidas que no pasaron. Si no hay datos se muestra `0` o "Sin datos suficientes". Precios y supuestos sin fuente llevan la marca **estimado** (`[EST]` del documento); lo que falta verificar, **por verificar** (`[VERIFY]`).
2. **AiTrava no custodia dinero.** El viajero le paga directo al anfitrión (Nequi, Bre-B o transferencia) con la referencia `AITRAVA-Cxx`. AiTrava cobra al anfitrión una comisión por cada reserva que origina.
3. **Solo cuentan compradores del perfil (V1–V5).** Las reservas de amigos o familia del equipo y las de simulacros se registran aparte y **no cuentan** como venta.
4. **Móvil primero.** El viajero llega desde un reel o un grupo de WhatsApp en el celular: en menos de un minuto debe ver la salida, el precio, los cupos y apartar el suyo.

### 0.1 Progreso

| Etapa | Pasos | Hechos | Estado |
| :-- | :-: | :-: | :-: |
| A–G · v2 (viajes sorpresa) — archivada | 01–47 | 37/47 | 🗄️ |
| H–K · v3 (centro de control) — archivada | 48–76 | 19/29 | 🗄️ |
| L · v4: producto y plataforma | 77–91 | 15/15 | ✅ |
| M · v4: puesta en producción | 92–94 | 0/3 | ⬜ |
| N · v4: campo (TC0, TC1, TC2) y junta | 95–104 | 0/10 | ⬜ |
| **Total v4** | 77–104 | **15/28** | |

Estados: ⬜ sin empezar · 🟡 en curso · ✅ terminada · 🗄️ archivada

---

## 1. Qué es AiTrava (v4)

**"Ve solo, sal acompañado."** Salidas en grupos pequeños (6 a 10 personas) a la naturaleza y la cultura de Cali y sus alrededores, para gente que quiere salir de la rutina, no tiene con quién ir y está cansada de las pantallas. AiTrava arma el grupo, cura el plan con un anfitrión local y rompe el hielo. El viajero solo tiene que llegar.

| | |
| :-- | :-- |
| **Cliente** | Personas de 20 a 35 años en Cali que quieren hacer algo distinto el fin de semana y no logran cuadrar plan con sus amigos. |
| **Problema** | "Quiero salir, pero mis amigos cancelan, no sé qué existe y me da pereza organizar con desconocidos." |
| **Solución** | Un grupo curado de desconocidos con la misma intención, una experiencia real con un anfitrión local y un ritual que conecta (tarjetas rompehielos y celular en un sobre sellado). |
| **Diferencial** | ChatGPT te recomienda un plan; AiTrava te arma el grupo y te conecta con quien lo hace posible. El producto es **el grupo curado y el ritual**, no la actividad (ataca la desintermediación). |
| **Cómo gana dinero** | Comisión del **20 %** (piso 16 %) sobre cada reserva que origina, cobrada al anfitrión hasta 3 días después de la salida. |
| **Ticket promedio** | $104.000 `[EST]` (mezcla 50/35/15 de 3 líneas). Ingreso por reserva: $20.800. |

**Los dos ganchos** (se prueban con A/B en la landing; el test TC0 decide cuál lidera):
- **A · Tribu Cero:** "¿Tus amigos cancelaron otra vez? Ve solo, sal acompañado."
- **B · Reset 180°:** "3 horas sin celular, en la naturaleza, con personas en tu misma pausa."

**Rol de la IA (honesto):** hoy la curaduría y el armado de grupos se hacen a mano (concierge por WhatsApp). La IA llega en el mes 6+ cuando haya volumen. **El producto no tiene IA en el PMV**, y no se presenta como si la tuviera.

**Seguridad (no se negocia, se muestra en `/seguridad`):** solo lugares públicos, operadores con RNT o espacios controlados · grupo de WhatsApp moderado 24 h antes · mínimo un integrante del equipo en cada salida · regla de conducta y consentimiento informado al reservar · opción de grupo solo mujeres · canal de reporte de incidentes · en naturaleza, guía con tarjeta profesional y RNT, y póliza diaria incluida en el precio.

---

## 2. Cómo cumplimos la rúbrica de la junta (criterio → qué construimos)

| # | Criterio (peso) | Qué lo demuestra en el producto | Dónde se ve |
| :-: | :-- | :-- | :-- |
| C1 | **PMV y entrega de valor (35 %)** | Landing con salidas reales → reserva en < 1 min → WhatsApp con la referencia → la salida (lista de asistentes, ritual, reto del celular) → **encuesta de cierre de 5 preguntas**. Métricas de valor contra metas fijadas antes de salir (§4.3 del documento). Simulacros marcados como tales. | `/admin` (Valor entregado), `/admin/salidas/[id]` |
| C2 | **Go to market (15 %)** | A/B de ganchos con `?v=A/B`, canal medido en la URL (`?c=GRP`, `?c=IG`, `utm_source`), embudo atraer → persuadir → convertir → retener, **CAC por canal** con la pauta registrada, y el **registro de ajustes** con las reglas de §5.6. | `/admin` (Embudo, A/B, Canales), `/admin/ajustes` |
| C3 | **Venta o intento real de pago (20 %)** | **Escalera de evidencia** por reserva: interés (lista de espera) → intención + acepta precio y condiciones (reserva) → pago reportado → pago verificado. Validación **V1–V5** por comprador; amigos/familia y simulacros no cuentan. | `/admin/reservas`, `/admin` (Evidencia) |
| C4 | **Modelo financiero (20 %)** | `modelo.py` portado a TypeScript con pruebas que reproducen las cifras del documento: 3 escenarios, unidad económica, punto de equilibrio y sensibilidad; supuestos editables, **real vs. modelo** con los datos de campo y exportación CSV para Excel. | `/admin/modelo`, `/admin/finanzas` |
| C5 | **Actividades de clase (10 %)** | "Show me the money" y modelo financiero en la misma pantalla. | `/admin/modelo` |

---

## 3. Alcance

### ✅ Sí entra (PMV)
- **Landing móvil primero** con dos variantes del gancho (A/B, asignación 50/50 persistente o forzada con `?v=`), canal en la URL, próximas salidas con **cupos en vivo**, cómo funciona, el ritual, seguridad, lugares por línea y preguntas frecuentes.
- **Salidas** (`/salidas`, `/salidas/[slug]`): lugar, fecha, punto de encuentro, duración, precio, cupos, anfitrión, qué incluye, solo mujeres (opcional).
- **Reserva sin crear cuenta** (≤ 1 min): nombre, WhatsApp, pregunta filtro ("¿Qué te motivó a buscar esta experiencia?"), ¿estás en Cali?, ¿conoces a alguien del equipo?, ¿vienes solo?, reto del celular (opcional), cómo nos conociste, mayor de edad, regla de conducta + consentimiento + tratamiento de datos, y **aceptación explícita del precio, la fecha y la política de reembolso**. El cupo queda **apartado 48 h** mientras se confirma el pago.
- **Página privada de la reserva** (`/reserva/[código]` con enlace secreto): estado, botón de WhatsApp con la referencia, datos de pago del anfitrión (solo cuando el equipo confirma el cupo), "Ya pagué", cancelar, política de reembolso.
- **Lista de espera** (TC0) con la línea preferida, para cuando no hay salida que le sirva.
- **Postulación de anfitriones** (`/anfitriones`) para el lado oferta (TC1-A).
- **Encuesta de cierre** (`/encuesta/[código]`, 5 preguntas, una sola vez por asistente).
- Páginas: seguridad, nosotros, ayuda (preguntas y reembolso), términos, privacidad, tratamiento de datos, 404.
- **Admin (solo el equipo)**: tablero de evidencia (C1–C3) con metas, embudo, A/B, canales y CAC; salidas (CRUD, lista de asistentes, asistencia, reto completado, enlaces de encuesta, comisión); reservas (estados, V1–V5, escalera de evidencia); anfitriones (TC1-A); lugares; lista de espera; pauta y costos; finanzas reales; **modelo financiero**; registro de ajustes. Exportación CSV.

### ❌ No entra
- Cuentas de viajero, pagos en línea o pasarela (el viajero le paga al anfitrión; AiTrava no recauda).
- Chat o asistente de IA (mes 6+, con volumen).
- Fotos de salidas que no han pasado o de lugares sin licencia: los lugares se muestran con tipografía y color, sin fotos de stock.
- PNN Farallones (excluido del lanzamiento, ver documento §3).

---

## 4. Stack y estructura

Se conserva el stack de la v3 (funciona y está desplegado):

| Capa | Tecnología |
| :-- | :-- |
| Frontend | Next.js 16 (App Router) + Tailwind 4 + TypeScript → `aitrava-app/` (Cloudflare Workers con OpenNext) |
| Backend | NestJS 11 + Prisma 6.19 → `aitrava-api/` (Railway) |
| BD | PostgreSQL 16 (Docker en local, Railway en producción) |
| Correo | nodemailer (SMTP), solo para las cuentas del equipo |
| Gráficas | `recharts` (solo admin) |
| Pruebas | Jest (unitarias del modelo financiero, cupos, perfil) + e2e con Supertest contra Postgres real (concurrencia de cupos, aislamiento de reservas, validaciones) |

### Variables de entorno
```bash
# aitrava-api/.env  (solo nombres en git; los valores van en .env o en Railway)
DATABASE_URL=
JWT_SECRET=
APP_URL=                    # URL de la app (CORS y enlaces de los correos)
ADMIN_EMAILS=               # correos del equipo: son los únicos que pueden crear cuenta
ADMIN_EMAIL= / ADMIN_PASSWORD=  # admin de respaldo del seed
SMTP_HOST= SMTP_PORT= SMTP_USER= SMTP_PASS= MAIL_FROM=
COMMISSION_RATE=0.20        # comisión por defecto de una salida nueva
HOLD_HOURS=48               # horas que se aparta un cupo sin pago

# aitrava-app/.env.local
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_WHATSAPP_NUMBER=   # WhatsApp Business de AiTrava (pendiente, paso 92)
NEXT_PUBLIC_CONTACT_EMAIL=aitrava.25@gmail.com
NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/aitrava26
```
La configuración de negocio (comisión, horas de apartado, metas, política de reembolso) **vive en el backend** (`aitrava-api/src/common/config.ts`) y la app la lee de `GET /api/config`.

---

## 5. Diseño (v4)

**Dirección:** señalética de sendero y tiquete de salida. Una sola cosa memorable: **el medidor de cupos con puntos** (cada punto es una persona del grupo), que es también el ícono. Todo lo demás es sobrio y legible al sol, en el celular.

| Token (`app/globals.css`) | Valor | Uso |
| :-- | :-- | :-- |
| `--color-pine` | `#04261E` | Campo dominante: hero, footer, texto principal |
| `--color-forest` | `#084A24` | Enlaces, estados "confirmado", acentos de datos |
| `--color-paper` | `#F2EDD5` | Fondo de página (papel) y texto sobre verde |
| `--color-ember` | `#F26716` | Acción principal (botón con texto `pine`: contraste 5,2:1) |
| `--color-flare` | `#E7390D` | Solo urgencia y alertas ("quedan 2 cupos"); nunca texto pequeño |

- **Tipografía:** una sola familia, **Archivo** variable (eje de ancho 62–125, local en `app/fonts/`). Titulares en ancho 125 y peso 800 (letrero de parque), cuerpo en ancho 100, datos en ancho 87 con números tabulares. Sin mayúsculas sostenidas en etiquetas.
- **Ícono:** ronda de 7 puntos crema alrededor de un sol `ember` sobre `pine` (`app/icon.svg`, `public/brand/*`). Wordmark "aitrava" en minúscula, ancho expandido.
- **Móvil:** botones ≥ 48 px, la acción principal siempre visible (barra fija con "Reservar mi cupo" en el detalle de la salida), sin scroll horizontal de 360 a 1440 px, foco visible y `prefers-reduced-motion` respetado.

---

## 6. Pantallas, API y eventos

### 6.1 Rutas de la app
| Ruta | Qué muestra |
| :-- | :-- |
| `/` | Hero con el gancho (A/B) y la próxima salida con cupos, salidas, cómo funciona, ritual, seguridad, lugares, preguntas, lista de espera. |
| `/salidas`, `/salidas/[slug]` | Salidas abiertas y detalle con la reserva. |
| `/lugares` | Catálogo por línea (Urbano, Naturaleza cerca, Escapada), con precios de referencia estimados. |
| `/reserva/[código]` | Estado privado de la reserva (enlace con token). |
| `/encuesta/[código]` | Encuesta de cierre. |
| `/anfitriones` | Postulación de anfitriones. |
| `/seguridad`, `/nosotros`, `/ayuda`, `/terminos`, `/privacidad`, `/tratamiento-de-datos` | Públicas. |
| `/equipo/ingresar` (+ registro, verificar, recuperar, restablecer) | Acceso del equipo. |
| `/admin` + `/salidas` (`/salidas/[id]`) `/reservas` `/anfitriones` `/espera` `/lugares` `/costos` `/finanzas` `/modelo` `/ajustes` `/equipo` | Panel del equipo. |

### 6.2 API pública
`GET /api/health` · `GET /api/config` · `GET /api/places` · `GET /api/salidas` · `GET /api/salidas/:slug` · `POST /api/salidas/:slug/reservations` · `GET /api/reservations/:code?token=` · `POST /api/reservations/:code/payment` · `POST /api/reservations/:code/cancel` · `GET|POST /api/surveys/:code` · `POST /api/waitlist` · `POST /api/hosts/apply` · `POST /api/events`. Panel: `/api/admin/*` (solo rol ADMIN).

### 6.3 Eventos de analítica
`landing_view, hook_cta_clicked, salida_viewed, reserve_started, reservation_created (servidor), whatsapp_clicked, payment_reported (servidor), waitlist_joined (servidor), host_applied (servidor), survey_completed (servidor)`. Cada evento guarda la **variante** (A/B) y el **canal**. Lo del equipo y lo DEMO no cuenta.

**Embudo:** visita → clic en el gancho → ve una salida → empieza la reserva → reserva creada → WhatsApp abierto → cupo confirmado → pago reportado → pago verificado → asistió → encuesta.

---

## 7. Modelo de negocio y financiero (C4)

**Decisión (2026-10-29): comisión por reserva originada.** Reemplaza el Freemium + Pass de $39.900 de la v3.

- **Ingreso:** comisión sobre el valor de cada reserva **pagada y realizada** que AiTrava origina. Se pide 20 %; el piso es 16 %. Se configura por salida (`commissionRate`). El anfitrión paga la comisión hasta 3 días después de la salida y el equipo lo marca en `/admin/salidas/[id]`.
- **Palanca opcional:** cargo de servicio de $5.000 al viajero (se prueba en el mes 3; por defecto `serviceFee = 0`).
- **Líneas y precios de referencia `[EST]`:** Urbano $65.000 (cupo 8) · Naturaleza cerca $110.000 (cupo 8) · Escapada $220.000 (cupo 10). Mezcla 50/35/15 → ticket $104.000.
- **Política de reembolso** (se acepta al reservar): 100 % si cancelas con ≥ 72 h; 50 % entre 72 y 24 h; o cedes el cupo sin costo. 100 % si la salida no se realiza.
- **Modelo financiero:** `aitrava-api/src/model/model.ts` reproduce `docs/modelo.py` (12 meses, Pesimista/Base/Optimista, unidad económica, punto de equilibrio ≈ 42 reservas/mes, sensibilidad). Las pruebas comprueban las cifras del documento (resultado base a 12 meses $2.383.915, caja mínima −$1.049.758 en el mes 4, etc.).
- **Real vs. modelo:** `/admin/finanzas` calcula con datos reales: reservas pagadas, valor reservado, comisión causada y cobrada, pauta por canal (CAC real), costos y resultado.
- **Decisión de viabilidad (fijada):** se sigue si después de 4 salidas reales: (1) contribución por reserva ≥ $0, (2) CAC ≤ $10.400 y (3) recompra o intención de volver ≥ 25 %. Falla una → se pivota esa palanca; fallan dos → se replantea el modelo. El tablero lo muestra.

---

## 8. Plan de trabajo (lineal, con checks)

> Siempre se hace el **primer paso sin marcar**. Al terminarlo: `- [ ]` → `- [x]` y `✅ fecha · nombre`. Si un paso se bloquea: `⛔ motivo`.

### v2 y v3 (archivadas)
Pasos 01–76 en `docs/archivo/`. De la v3 se conservan: el stack, el despliegue (Railway + Cloudflare), la autenticación (ahora solo para el equipo), el tracking de eventos, el botón de WhatsApp y el panel admin como base. Se retiran: viajes, itinerario, reservas externas, Bóveda, presupuesto, plan de ahorro, Modo Viaje, AITRAVA Pass, Wompi, comprobante PDF, proveedores, destinos y cuentas de viajero. Los pasos abiertos de la v3 (67–76) se reemplazan por las etapas M y N.

### Etapa L · v4: producto y plataforma
- [x] **77** · Roadmap v4, `CLAUDE.md` y archivo del roadmap 3.0 — ✅ 2026-10-29 · Claude (agente)
- [x] **78** · Modelo de datos y migración: `Place`, `Host`, `Salida`, `Reservation`, `SurveyResponse`, `WaitlistEntry`, `AdminCost` (con canal), `Iteration` (ajustes), `Event` (variante y canal), `User` (equipo). Seed con los 14 lugares del documento y un caso **DEMO** marcado — ✅ 2026-10-29 · Claude (agente)
- [x] **79** · API pública: salidas con cupos en vivo, reserva **atómica** (bloqueo de fila, sin sobreventa), apartado de 48 h con vencimiento, idempotencia por WhatsApp, página privada con token, "ya pagué", cancelar, lista de espera, postulación de anfitriones y encuesta — ✅ 2026-10-29 · Claude (agente)
- [x] **80** · API admin: salidas, reservas (estados, V1–V5, escalera), anfitriones, lugares, lista de espera, costos y pauta, ajustes, métricas (embudo, A/B, canales, valor entregado, viabilidad), finanzas reales y CSV — ✅ 2026-10-29 · Claude (agente)
- [x] **81** · Modelo financiero en TypeScript (escenarios, unidad económica, equilibrio, sensibilidad) con pruebas contra las cifras de `docs/modelo.py` — ✅ 2026-10-29 · Claude (agente)
- [x] **82** · Robustez: filtro global de errores (sin trazas al cliente, errores de Prisma traducidos), apagado ordenado, healthcheck, límites de intentos, honeypot anti-spam, validación estricta, tiempos de espera de transacción — ✅ 2026-10-29 · Claude (agente)
- [x] **83** · Pruebas: unitarias + e2e contra Postgres (concurrencia de cupos, idempotencia, aislamiento por token, admin protegido, validaciones, vencimiento) — ✅ 2026-10-29 · Claude (agente)
- [x] **84** · Sistema de diseño v4 (paleta, Archivo, ícono, medidor de cupos), shell, navbar, footer, WhatsApp flotante y estados — ✅ 2026-10-29 · Claude (agente)
- [x] **85** · Landing con A/B y canal, salidas y detalle con reserva — ✅ 2026-10-29 · Claude (agente)
- [x] **86** · Página privada de la reserva, encuesta, lista de espera y anfitriones — ✅ 2026-10-29 · Claude (agente)
- [x] **87** · Páginas públicas: lugares, seguridad, nosotros, ayuda, legales, 404 — ✅ 2026-10-29 · Claude (agente)
- [x] **88** · Acceso del equipo (solo correos de `ADMIN_EMAILS`) — ✅ 2026-10-29 · Claude (agente)
- [x] **89** · Admin: tablero de evidencia, salidas, reservas, anfitriones, lugares, espera, costos, finanzas, ajustes, usuarios — ✅ 2026-10-29 · Claude (agente)
- [x] **90** · Admin: modelo financiero interactivo y exportación — ✅ 2026-10-29 · Claude (agente)
- [x] **91** · QA: builds (Next y Cloudflare/OpenNext), lint, 14 pruebas unitarias + 31 e2e, recorrido en el navegador a 360, 375 y ~1024 px sin scroll horizontal, README, `.env.example` y `docs/DESPLIEGUE.md` — ✅ 2026-10-29 · Claude (agente)

### Etapa M · Puesta en producción
- [ ] **92** · **(Equipo)** Crear el WhatsApp Business y poner el número en `NEXT_PUBLIC_WHATSAPP_NUMBER` (Cloudflare). Configurar en Railway `ADMIN_EMAILS`, `APP_URL`, `SMTP_*` — ✅ ___
- [ ] **93** · **(Equipo)** Confirmar D5 (borrar los datos de la v3 en producción) y desplegar la v4 — ✅ ___
- [ ] **94** · Crear en `/admin/salidas` la primera salida real (lugar, anfitrión, fecha, precio, cupos y datos de pago del anfitrión) — ✅ ___

### Etapa N · Campo y junta
- [ ] **95** · TC0: 2 anuncios de $20.000 + reparto en grupos con `?v=A` / `?v=B` y `?c=IG` / `?c=GRP`; registrar la pauta en `/admin/costos` — ✅ ___
- [ ] **96** · TC1-A: contactar 15 anfitriones y registrarlos en `/admin/anfitriones` (meta ≥ 3 aceptan ≥ 16 %) — ✅ ___
- [ ] **97** · Simulacro del PMV (salida marcada como simulacro, 4–6 personas, ritual y encuesta) — ✅ ___
- [ ] **98** · TC2: preventa de la primera salida (meta ≥ 5 pagos V1–V5, conversión ≥ 25 %, CAC ≤ $10.400) — ✅ ___
- [ ] **99** · TC1-B: salida real + encuesta + entrevista al anfitrión (clientes nuevos confirmados) — ✅ ___
- [ ] **100** · Ronda 2: segunda salida con los cambios de la encuesta, anotados en `/admin/ajustes` — ✅ ___
- [ ] **101** · Recalcular el modelo con los datos reales de las primeras salidas (`/admin/modelo` → "Usar datos reales") — ✅ ___
- [ ] **102** · Exportar el modelo a Excel para la entrega de clase (C5) — ✅ ___
- [ ] **103** · Actualizar `docs/PRESENTACION.md` y `docs/PRUEBAS-USUARIOS.md` al modelo v4 — ✅ ___
- [ ] **104** · Ensayo cronometrado ×2 y video de respaldo — ✅ ___

**Metas de validación (del documento, fijadas antes de salir):**

| Métrica | Meta | Real |
| :-- | :-: | :-: |
| TC0: clics por variante / diferencia | ≥ 60 / ≥ 5 pp | |
| TC1-A: anfitriones que aceptan ≥ 16 % | ≥ 3 de 15 | |
| TC2: pagos de compradores V1–V5 | ≥ 5 | |
| Conversión conversación → pago | ≥ 25 % | |
| CAC | ≤ $10.400 | |
| Llegaron solos y salieron con ≥ 1 contacto | ≥ 70 % | |
| "¿Volverías?" (sí) | ≥ 60 % | |
| NPS | ≥ 40 | |
| Reto del celular completado | ≥ 50 % | |
| Anfitrión confirma clientes nuevos | ≥ 4 de 5 | |

### 8.1 Notas de implementación

- **Migración `20261029000000_aitrava_4`:** borra las tablas de la v3 (viajes, Bóveda, ahorro, pagos, Pass, proveedores, destinos, mensajes, feedback) y **conserva** usuarios, eventos e iteraciones. Corre sola al desplegar (`pnpm start` → `db:deploy`).
- **Cupos sin sobreventa:** `POST /api/salidas/:slug/reservations` corre en una transacción que bloquea la fila de la salida (`SELECT … FOR UPDATE`), cuenta los cupos ocupados y recién ahí inserta. Ocupan cupo: `requested` (si no venció el apartado), `confirmed`, `payment_reported`, `paid`, `attended`. Un apartado vencido libera el cupo en el acto (el conteo lo ignora) y un barrido cada 10 min lo pasa a `expired`. Probado con 30 reservas simultáneas sobre 8 cupos.
- **Idempotencia:** si el mismo WhatsApp ya tiene una reserva activa en esa salida, se devuelve esa misma (no se duplica ni se cobra dos veces el cupo).
- **Reserva privada:** el enlace lleva un token aleatorio de 32 bytes; en la BD solo se guarda su hash. Sin token válido la API responde 404.
- **Código de referencia:** `AITRAVA-C01`, `C02`… sale de una secuencia de la BD (seguro con concurrencia).
- **Perfil V1–V5:** V1 mayor de edad · V2 está en Cali · V3 no es amigo ni familia del equipo · V4 llegó por un canal de AiTrava · V5 su respuesta al filtro muestra intención (lo marca el equipo). Solo los V1–V5 de salidas que no son simulacro cuentan en la evidencia de venta.
- **A/B:** la app asigna A o B al azar la primera vez y lo recuerda; `?v=A` o `?v=B` lo fuerza. El canal sale de `?c=` o `utm_source`. Ambos viajan con cada evento y con la reserva.
- **Fechas:** se guardan en UTC y se muestran en `America/Bogota`.
- **Pruebas:** `pnpm test` (modelo financiero contra las cifras de `modelo.py` y reglas puras) y `pnpm test:e2e` (Postgres real, esquema efímero `e2e_<timestamp>` en la BD `aitrava_test`, se borra al terminar). Se retiraron `@nestjs/config` (ESM, rompía Jest; ahora `process.loadEnvFile`), `groq-sdk`, `pdfkit`, `qrcode` y `zod`; `@nestjs/jwt` quedó en v11 (CommonJS).
- **Probado en el navegador (2026-10-29):** landing A y B, detalle de salida, validaciones del formulario, reserva completa en móvil hasta la página privada, confirmación desde el panel y datos de pago visibles para el viajero, tablero y modelo financiero (las cifras coinciden con el documento).

---

## 9. Guion de la presentación (borrador)
1. **Lo que aprendimos** (30 s): la junta nos dijo que la v3 no tenía valor. Planificar viajes ya lo hace ChatGPT gratis.
2. **Para quién** (30 s): 20–35 años en Cali, sin con quién ir, cansados de pantallas.
3. **Demo en el celular** (2 min): reel → landing (A/B) → salida con cupos → reserva en 1 min → WhatsApp con la referencia → encuesta.
4. **Evidencia** (1 min): tablero de `/admin` con la escalera de evidencia y las metas.
5. **Modelo** (1 min): comisión del 20 %, unidad económica, equilibrio en el mes 5, sensibilidad.
6. **Decisión** (30 s): las tres condiciones de viabilidad y qué hacemos si fallan.
7. **Cierre** (15 s): "Ve solo, sal acompañado."

---

## 10. Decisiones

### Tomadas
- **(2026-10-29) Cambio total al modelo v4** según `docs/AiTrava-final.md` y `docs/modelo.py`.
- **(2026-10-29) Comisión al anfitrión (20 %, piso 16 %)**; sin Pass, sin suscripciones, sin pasarela. AiTrava no recauda dinero del viajero.
- **(2026-10-29) Reserva sin cuenta:** el viajero no crea usuario (fricción mínima); entra a su reserva con un enlace privado. Las cuentas quedan solo para el equipo.
- **(2026-10-29) Sin IA en el PMV** (se retira la dependencia de Groq).
- **(2026-10-29) Nueva identidad visual** (paleta del equipo, Archivo, ícono de la ronda).
- Se conserva el stack Next + Nest + Prisma + Postgres, Railway + Cloudflare.

### Pendientes (responder aquí)
- **D2 · Fecha de la próxima junta y duración.** → ___
- **D5 · Datos de la v3 en producción.** ⚠️ La migración `aitrava_4` borra viajes, Bóveda, planes de ahorro y pagos de la v3 (conserva cuentas y eventos). Confirmar en el equipo antes del despliegue; si quieren algo, exportarlo antes desde el `/admin` de la v3. → ___
- **D6 · Número de WhatsApp Business.** Mientras no exista, la app usa `NEXT_PUBLIC_WHATSAPP_NUMBER` o el número de la v3. → ___

---

## 11. Registro de cambios

| Fecha | Quién | Qué |
| :-- | :-- | :-- |
| 2026-09-21 → 2026-10-15 | Equipo + Claude | v2 (viajes sorpresa): ver `docs/archivo/ROADMAP-v2-viajes-sorpresa.md`. |
| 2026-10-19 | Equipo + Claude | v3 (centro de control + ahorro): ver `docs/archivo/ROADMAP-v3-centro-de-control.md`. |
| 2026-10-28 | Junta | Evaluación de la v3: 1.3/5.0 ("no tiene valor", no es específico). |
| 2026-10-29 | Juan Pablo + Claude (agente) | **Cambio total a la v4 "Ve solo, sal acompañado"** según `docs/AiTrava-final.md` y `docs/modelo.py`. Roadmap reescrito; el 3.0 se archivó. |
| 2026-10-29 | Claude (agente) | Pasos 78–91: nuevo modelo de datos y migración, reservas atómicas sin cuenta con apartado de 48 h, lista de espera, anfitriones, encuesta, panel de evidencia (embudo, A/B, canales, CAC, V1–V5, escalera, valor entregado, viabilidad), modelo financiero portado con pruebas, nueva identidad visual (paleta del equipo, Archivo, ícono), pruebas unitarias y e2e (concurrencia), robustez de producción. Se retiró todo lo de la v3. |
