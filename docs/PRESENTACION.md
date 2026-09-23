# Presentación · contenido diapositiva por diapositiva (paso 39)

Pensada para **unos 7 minutos**; ajustar cuando se sepa el tiempo real (D2). Cada diapositiva cubre un criterio de la rúbrica, marcado con **[C1]–[C5]**. Los datos entre `{llaves}` se sacan de `/admin` el día anterior.

> Estilo: mismos colores y tipografías de la app (fondo #1A1C20, amarillo #FFD700, títulos en Big Shoulders). Poco texto y una idea por diapositiva.

---

**1 · Portada** (10 s)
- Logo AiTrava + "Menos planear, más viajar."
- Nombres del equipo.

**2 · El problema** (30 s)
- "Planear un viaje toma {X} horas y termina en un chat de 200 mensajes."
- 1 dato de las entrevistas: "{N} de {M} entrevistados dijeron que lo más molesto es decidir a dónde ir."
- Cita textual de un usuario.

**3 · La solución** (30 s)
- Tú pones presupuesto, fechas y gustos → la IA arma todo → el destino es sorpresa → pistas mientras llega el día → abres el sobre.
- Para quién: jóvenes de 18–30 años, nativos digitales y con poco tiempo.

**4 · Demo en vivo** (2 min) **[C2]**
Con el celular proyectado y la cuenta `demo@aitrava.co` (correr `pnpm db:demo` antes):
1. Mostrar el formulario rápido y generar un viaje nuevo (la IA responde en unos 2 s) → pase de abordaje con `???` y desglose transparente.
2. Ir a "Mis viajes" → viaje **Salento** (pistas a medias): cuenta regresiva, pistas, "Adivinar", "Compartir".
3. Abrir `/s/DEMO02` en otro celular: un "amigo" apuesta.
4. Viaje **Cartagena** (listo para abrir) → **abrir el sobre** → destino, por qué lo eligió la IA, itinerario, quién acertó.
- **Plan B:** video grabado del mismo recorrido (paso 40).

**5 · Qué nos hace difíciles de copiar** (45 s) **[C1]**
- **Motor de sorpresa:** algoritmo + IA sobre un catálogo curado; el destino se oculta en el servidor.
- **La espera como producto:** pistas, apuestas en grupo y el sobre digital. Nadie más gamifica la anticipación.
- **ADN viajero:** cada viaje, apuesta y calificación mejora la siguiente recomendación (datos propios que se acumulan).
- **Inventario opaco + red de aliados:** tarifas que solo se consiguen porque el cliente no elige.

**6 · Validación con usuarios** (1 min) **[C3]**
- Captura del embudo de `/admin`: visitantes {n} → registros {n} → viajes generados {n} → reservas {n}.
- NPS {n} · {n} personas apartaron con el abono del 20 % · {n} apuestas de amigos · {n} registros por referido.
- 2 citas textuales.

**7 · Lo que aprendimos y cambiamos** (45 s) **[C3]**
Línea de tiempo desde `/admin/iteraciones`:
- **v1 → v2:** "Vimos {dato} → cambiamos {cambio} → resultado {métrica antes/después}."
- **v2 → v3:** ídem.
- **Cambio de modelo:** empezamos con 3 planes y cobros por pistas extra; los usuarios {feedback} → pasamos a **una tarifa fija de $50.000 y a ganar del lado de los aliados**.

**8 · Modelo de negocio** (45 s) **[C4]**
- **Al viajero le cobramos poquísimo:** una tarifa fija de $50.000 por viaje, dentro de su presupuesto y a la vista en el checkout.
- **Ganamos del lado de los aliados:** transporte, alojamiento y experiencias nos pagan comisión por llevarles clientes y gestionarles la reserva (4–20 % según el rubro).
- **El inventario opaco lo hace posible:** como el cliente no elige, los aliados llenan cupos vacíos sin bajar su precio público.
- Mostrar el desglose real de un viaje de $2.800.000: ≈ $359.000 de ingreso (tabla de la sección 7 del roadmap).
- **El modo regalo abre un mercado nuevo:** quien paga no es quien viaja.
- **Referidos:** cada viaje trae amigos, así que adquirir clientes cuesta menos.
- Comparación en una tabla: agencia tradicional / Booking vs AiTrava (quién decide, cómo se cobra, qué pasa con la espera).

**9 · Próximos pasos + cierre** (20 s)
- Aliados piloto en 2 destinos, pagos reales y el Club Sorpresa (suscripción).
- "Menos planear, más viajar." + QR a la app o la landing.

---

## Checklist del día

- [ ] `pnpm db:demo` corrido esa mañana.
- [ ] `DEMO_MODE="true"` en `aitrava-api/.env` (para el botón "Adelantar el tiempo").
- [ ] API, app y DB levantadas; probar el login demo 10 minutos antes.
- [ ] Segundo celular listo con `/s/DEMO02` para el "amigo".
- [ ] Video de respaldo en el computador.
- [ ] Capturas de `/admin` actualizadas en las diapositivas 6 y 7.
- [ ] Ensayo cronometrado ×2 (paso 41).
