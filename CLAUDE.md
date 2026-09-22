# AiTrava · instrucciones para el agente

## ⚠️ Obligatorio: lee `docs/ROADMAP.md` SIEMPRE
- **Al inicio de cada sesión**, antes de responder o de tocar código, lee `docs/ROADMAP.md` completo. Es la fuente de verdad del plan, el alcance, las decisiones y el progreso.
- **Trabaja en el paso siguiente sin marcar** del "Plan de trabajo" (sección 8). Los pasos van en orden lineal: no te saltes ninguno ni trabajes varios a la vez, salvo que el usuario lo pida.
- **Al terminar un paso:** márcalo `[x]`, pon la fecha y el nombre de quien lo hizo, actualiza la tabla de progreso (sección 0.1) y agrega una línea en el "Registro de cambios" (sección 11).
- Si algo del roadmap cambia (una decisión, el alcance, el modelo de datos), **edita primero el roadmap** y después el código.

## Contexto
- Es un prototipo para una materia de innovación. Lo que importa es que funcione, se vea bien, sea responsive (móvil primero) y cumpla la rúbrica. No lo sobre-ingenierices.
- Estructura: `aitrava-app/` (Next.js 16 + Tailwind 4), `aitrava-api/` (NestJS 11 + Prisma). Solo Postgres corre en Docker (`docker-compose.yml`). Se usa pnpm.
- **Diseño:** la referencia está en `design/` (copia de la landing: tokens, copy, componentes, diseños de Claude Design). Lee `design/README.md`. La app tiene que verse como hermana de la landing.
- Todo el texto de la interfaz va en español de Colombia.
- La IA usa **Groq** (`groq-sdk`) en `aitrava-api/src/engine/engine.service.ts`. La clave va solo en `aitrava-api/.env`; nunca la escribas en código ni en docs.
- Modelo de negocio: **comisión única del 10 % por viaje**. No agregues planes ni cobros extra sin que el equipo lo decida en el roadmap.
- `aitrava-app/AGENTS.md`: Next 16 trae cambios, así que consulta la documentación en `node_modules/next/dist/docs/` antes de usar APIs de Next.
