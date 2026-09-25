# PENDIENTES

Todo lo que falta confirmar o entregar. En pantalla, cada uno se ve como `[PENDIENTE: ...]`.

## Datos y textos
- [ ] **Ubicación de Barbería El Patio**: Piantini o Zona Colonial. (`negocio.ubicacion` en `src/content.es.ts`)
- [ ] **Contacto real** para el cierre y el botón "Agenda tu demo por WhatsApp" (número de WhatsApp o enlace wa.me). (`marca.contacto`)
- [ ] **Minutos devueltos por función**: los valores de `momentos[].minutos` son estimaciones ilustrativas de la demo (total 122 min). Confirmar o ajustar.
- [ ] Si se quiere citar algún dato de mercado: `[PENDIENTE: dato verificado + fuente]`. Por ahora no se muestra ninguno.

## Marca
- [ ] **Edmondsans** (títulos): no está en `/assets/fonts`. Se usa **Nunito Sans 900** en mayúsculas con espaciado amplio mientras tanto.
- [ ] **Avenir Black / Avenir Book** (subtítulos / texto): no están en `/assets/fonts`. Se usa **Nunito Sans 900 / 400**.
  - Cuando lleguen los archivos (`.woff2` de preferencia, con licencia de uso web/embebido): copiarlos a `assets/fonts/`, declarar los `@font-face` en `src/styles/fonts.css` y ponerlos primero en `font` dentro de `src/tokens.ts`.
- [ ] **Logo**: no había archivos en `/assets`. Se usaron los originales que llegaron con el encargo:
  - `assets/logo/quovix-q.webp`: la Q enviada (degradado blanco a turquesa sobre negro).
  - `assets/logo/quovix-ai-wordmark.svg`: wordmark "QUOVIX AI" extraído en vector, sin redibujar, del PDF de pantallas (`reference/quovix_pantallas_cliente.pdf`).
  - Si existen los archivos maestros (SVG de la Q y del wordmark), reemplazarlos con el mismo nombre.
- [ ] Colores: los tokens son aproximados (`src/tokens.ts`). Confirmar valores exactos con el manual de marca.

## Técnicos (se resuelven en las etapas siguientes)
- [ ] Etapa 2: pantallas reales del negocio y del cliente en DOM (hoy hay una pantalla de bloqueo de prueba).
- [ ] Etapa 3: contenido y consecuencia de los momentos 2 a 13 (hoy tienen solo cámara, teléfonos y frases).
- [ ] Etapa 4: versión 2D de respaldo sin WebGL (hoy solo avisa), pulido y README completo.
