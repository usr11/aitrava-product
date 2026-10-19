# AiTrava · instrucciones para el agente

## ⚠️ Obligatorio: lee `docs/ROADMAP.md` SIEMPRE
- **Al inicio de cada sesión**, antes de responder o de tocar código, lee `docs/ROADMAP.md` completo. Es la fuente de verdad del plan, el alcance, las decisiones y el progreso.
- **Trabaja en el paso siguiente sin marcar** del "Plan de trabajo" (sección 8). Los pasos van en orden lineal: no te saltes ninguno ni trabajes varios a la vez, salvo que el usuario lo pida.
- **Al terminar un paso:** márcalo `[x]`, pon la fecha y el nombre de quien lo hizo, actualiza la tabla de progreso (sección 0.1) y agrega una línea en el "Registro de cambios" (sección 11).
- Si algo del roadmap cambia (una decisión, el alcance, el modelo de datos), **edita primero el roadmap** y después el código.

## Contexto
- Es un prototipo (PMV) para una materia de innovación. Desde el 2026-10-19 es **AITRAVA 3.0 · "Tu viaje vive aquí"**: centro de control digital del viaje + **plan de ahorro inteligente**. La especificación completa está en `docs/AITRAVA 3.docx`. Lo que importa es que funcione, se vea bien, sea responsive (móvil primero) y cumpla la rúbrica. No lo sobre-ingenierices.
- **Nunca inventes datos** (ventas, visitas, alianzas, ahorros, reviews). Lo de ejemplo se marca DEMO. AITRAVA **no custodia dinero** y ningún pago simulado cuenta como venta.
- Estructura: `aitrava-app/` (Next.js 16 + Tailwind 4), `aitrava-api/` (NestJS 11 + Prisma). Solo Postgres corre en Docker (`docker-compose.yml`). Se usa pnpm.
- **Diseño 3.0:** fondo blanco, azul oscuro, azules secundarios y amarillo del logo como acento (tokens en `aitrava-app/app/globals.css`, ver sección 5 del roadmap). `design/` es la referencia de la landing anterior (v2).
- Todo el texto de la interfaz va en español de Colombia.
- La IA es solo soporte (nada de chat de IA). Usa **Groq** (`groq-sdk`); la clave va solo en `aitrava-api/.env`; nunca la escribas en código ni en docs. Lo mismo para SMTP, Wompi y JWT.
- Modelo de negocio: **Freemium + AITRAVA Pass de $39.900 por viaje** (pago único por Wompi, configurable en `aitrava-api/src/common/config.ts`). El plan de ahorro es gratis. No agregues planes ni cobros extra sin que el equipo lo decida en el roadmap.
- `aitrava-app/AGENTS.md`: Next 16 trae cambios, así que consulta la documentación en `node_modules/next/dist/docs/` antes de usar APIs de Next.
