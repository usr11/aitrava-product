# AiTrava · instrucciones para el agente

## ⚠️ Obligatorio: lee `docs/ROADMAP.md` SIEMPRE
- **Al inicio de cada sesión**, antes de responder o de tocar código, lee `docs/ROADMAP.md` completo. Es la fuente de verdad del plan, el alcance, las decisiones y el progreso.
- **Trabaja en el paso siguiente sin marcar** del "Plan de trabajo" (sección 8). Los pasos van en orden lineal: no te saltes ninguno ni trabajes varios a la vez, salvo que el usuario lo pida.
- **Al terminar un paso:** márcalo `[x]`, pon la fecha y el nombre de quien lo hizo, actualiza la tabla de progreso (sección 0.1) y agrega una línea en el "Registro de cambios" (sección 11).
- Si algo del roadmap cambia (una decisión, el alcance, el modelo de datos), **edita primero el roadmap** y después el código.

## Contexto
- Es un prototipo (PMV) para una materia de innovación. Desde el 2026-10-29 es la **v4 · "Ve solo, sal acompañado"**: salidas en grupos pequeños (6–10 personas) a la naturaleza y la cultura de Cali, para personas de 20–35 años que no tienen con quién ir. La propuesta completa está en `docs/AiTrava-final.md` y el modelo financiero en `docs/modelo.py`. Lo que importa es que funcione, se vea bien, sea responsive (móvil primero) y cumpla la rúbrica de la junta (C1–C5). No lo sobre-ingenierices.
- **Nunca inventes datos** (ventas, asistentes, anfitriones, reseñas, fotos). Lo de ejemplo se marca DEMO; los precios sin fuente, "estimado". **AiTrava no custodia dinero**: el viajero le paga al anfitrión. Solo cuentan como venta los pagos verificados de compradores V1–V5 en salidas que no son simulacro.
- Estructura: `aitrava-app/` (Next.js 16 + Tailwind 4), `aitrava-api/` (NestJS 11 + Prisma). Solo Postgres corre en Docker (`docker-compose.yml`). Se usa pnpm.
- **Diseño v4:** paleta `#04261E` (pine), `#084A24` (forest), `#F2EDD5` (paper), `#F26716` (ember, acción), `#E7390D` (flare, solo urgencia); tipografía Archivo (ancho variable). Tokens en `aitrava-app/app/globals.css`, ver sección 5 del roadmap.
- Todo el texto de la interfaz va en español de Colombia.
- **Sin IA en el PMV** (llega en el mes 6+ con volumen). Las claves (SMTP, JWT) van solo en `aitrava-api/.env`; nunca en código ni en docs.
- Modelo de negocio: **comisión del 20 % (piso 16 %) al anfitrión por cada reserva originada**, configurable por salida; cargo de servicio opcional en `serviceFee` (0 por defecto). No agregues planes ni cobros extra sin que el equipo lo decida en el roadmap.
- `aitrava-app/AGENTS.md`: Next 16 trae cambios, así que consulta la documentación en `node_modules/next/dist/docs/` antes de usar APIs de Next.
