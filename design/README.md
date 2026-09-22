# Diseño · referencia de la landing

Esta carpeta es una copia del diseño de `../AiTrava-landing`, traída el 2026-09-21, para tenerlo siempre a mano. Es **solo referencia**: la app no importa nada de aquí. Se copian o adaptan las piezas a `aitrava-app/`.

| Carpeta | Qué hay | Para qué sirve |
| :-- | :-- | :-- |
| `landing/canvas/` | Diseño original de Claude Design (`Main.dc.html` escritorio, `Mobile.dc.html` móvil, `HeroSobre.dc.html` alternativa clara con sobre, `aitrava-landing.html` exportado completo, `canvas.json`) | Abrir en el navegador para ver el look & feel |
| `landing/styles/global.css` | Tokens de color, tipografías, utilidades (`.display`, `.eyebrow`, `.lead`), grano de fondo | Base de `aitrava-app/app/globals.css` |
| `landing/data/site.ts` | Copy oficial, pasos, lógica de presupuesto (`splitBudget`, `formatCOP`), tipos de viajero, pistas | Reusar textos y lógica |
| `landing/components/*.astro` | Componentes de la landing | Traducir a React: `Clues` → pantalla de pistas, `DepartureBoard` → "generando", `Budget` → wizard, `Travelers` → selector PAX, `Icon` → set de íconos SVG |
| `landing/assets/` | Logo (`aitrava-mark.jpg`), favicon, apple-touch-icon, og-image | Copiar a `aitrava-app/public/` |
| `landing/docs/` | Paleta (`desgin.txt`), Business Model Canvas (`AiTrava.pdf`), ícono, `astro.config.mjs` (config de fuentes) | Contexto de negocio y fuentes |

**Fuentes (Google Fonts):** Big Shoulders 800/900 (`--font-display`), Familjen Grotesk 400–700 (`--font-body`), IBM Plex Mono 400/600 (`--font-mono`). En Next se cargan con `next/font/google`.
