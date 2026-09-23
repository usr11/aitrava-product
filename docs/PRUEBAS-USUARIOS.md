# Guía de pruebas con usuarios (pasos 32, 35 y 36)

Objetivo: tener **evidencia real** de que la gente entiende, quiere y usaría AiTrava, y **usarla para cambiar algo** (criterios 2 y 3 de la rúbrica). Cada prueba dura unos 15 minutos.

## Antes de empezar (una sola vez)

1. Borrar los datos de prueba para que el dashboard quede limpio: `cd aitrava-api && pnpm db:reset` (**borra todo**; después corre el seed solo).
2. Decidir el modo:
   - **Pruebas guiadas en persona:** `DEMO_MODE="true"` (pistas cada 30 s), para que la persona viva todo el flujo en 15 minutos.
   - **Usuarios reales que la usan solos** (campaña): `DEMO_MODE="false"`.
3. Levantar todo con `pnpm dev -H 0.0.0.0` y abrir la app **en el celular de la persona** (ver el README, sección "Desde el celular").
4. Tener abierta la hoja de notas (plantilla abajo).

## A quién buscar

5–8 personas **del segmento**: 18–30 años, que hayan viajado por placer en el último año o quieran hacerlo. Mezclar: 2 que viajen solas, 2 en pareja, 2 con amigos. **No** usar a los del equipo.

## Guion (15 min)

**1. Contexto (1 min).** "Estamos probando una app, no a ti. Piensa en voz alta: di lo que ves, lo que esperas y lo que te confunde. No te voy a ayudar a menos que te bloquees."

**2. Preguntas previas (2 min)**
- ¿Cuándo fue tu último viaje de placer? ¿Quién lo planeó y cuánto tiempo les tomó?
- ¿Qué es lo más molesto de planear un viaje?
- ¿Te irías de viaje sin saber el destino? ¿Qué te daría miedo?

**3. Tareas (8 min).** Dar una a la vez y **no explicar la interfaz**.
1. "Arma un viaje sorpresa para este puente con un presupuesto que te sirva de verdad."
2. "Resérvalo." *(Aclarar: no se cobra nada.)*
3. "Comparte el viaje con alguien con quien irías." *(Anotar si entiende para qué sirve.)*
4. "Intenta adivinar a dónde vas." *(Usar "Adelantar el tiempo" si hace falta.)*
5. "Abre el sobre." → luego responde la encuesta NPS de la app.

**Qué observar (anotar sin interrumpir):** en qué paso duda o se devuelve, qué lee en voz alta, si mira el desglose del presupuesto y la tarifa fija, si re-sortea (señal de desconfianza), su reacción al abrir el sobre (cara, comentario).

**4. Preguntas finales (4 min)**
- Del 1 al 10, ¿qué tan confiado te sentirías pagando esto de verdad? ¿Qué te falta para ponerle un 10?
- ¿Te parece justo que nuestra tarifa sean $50.000 fijos incluidos en tu presupuesto? ¿Pagarías **el abono del 20 % hoy para apartar** un viaje así? *(Si dice que sí → es la conversión más fuerte que podemos mostrar.)*
- ¿Se lo regalarías a alguien? ¿A quién y para qué ocasión?
- ¿Qué le quitarías y qué le agregarías?
- ¿Te podemos escribir cuando esté lista de verdad? *(Anotar su contacto → lista de espera.)*

## Plantilla de notas (una fila por persona)

| # | Edad / con quién viaja | Se trabó en… | Cita textual | Confianza 1–10 | ¿Apartaría con el 20 %? | ¿Regalaría? | Idea / queja principal |
| :-: | :-- | :-- | :-- | :-: | :-: | :-: | :-- |
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |
| 4 | | | | | | | |
| 5 | | | | | | | |

## Después de la ronda: convertirlo en iteración

1. Buscar **patrones**: algo que le pasó a 3 o más personas es un hallazgo; algo que le pasó a una sola es una anécdota.
2. Revisar `/admin`: en qué paso del quiz abandonan (gráfica de pasos), la conversión de viaje generado a reserva, el NPS y cuántos compartieron.
3. Elegir **2–3 cambios máximo** y registrarlos en `/admin/iteraciones` con la plantilla del roadmap (hipótesis → métrica → decisión → cambio). Ejemplos de cambios típicos:
   - Si dudan en el paso de presupuesto → mostrar ejemplos ("con $1.500.000 p/p te puede tocar Cartagena o Salento").
   - Si no confían en pagar → agregar garantía o testimonios en el pago.
   - Si nadie comparte → cambiar el texto del botón o mostrarlo antes.
   - Si la tarifa fija les parece alta → probar $35.000 y medir otra vez.
4. Hacer el cambio (pedírselo al agente citando el hallazgo), marcar el paso en el roadmap y hacer otra ronda. **Comparar las métricas antes y después**: eso es lo que da puntos.

## Evidencia que hay que guardar para la presentación

- Capturas de `/admin` después de cada ronda (con fecha).
- 5 o más citas textuales con permiso (nombre de pila y edad).
- Fotos o video corto (con permiso) de alguien abriendo el sobre: es el momento "wow".
- El CSV de eventos (`/admin` → Exportar) de cada ronda.
