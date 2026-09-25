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

## Pantallas (etapa 2)
- [ ] **Fotos de categorías y negocios** (`assets/fotos/`): salen del PDF de pantallas que enviaste. Confirmar que se tienen los derechos de uso; si no, reemplazarlas con fotos propias del mismo nombre.
- [ ] Los **logos de negocios del PDF** ("Barber Logo Maker", "Nails Studio") son de plantilla: no se usaron. Se muestran iniciales.
- [ ] **Número del cliente** en la app: se usa uno ficticio (`+1 809-555-0147`). El del PDF parecía un número real y no se usó.
- [ ] Negocios de ejemplo en la app del cliente (Studio Aura, Nails Bar, Casa Spa Zen) con zonas inventadas (Naco, Bella Vista, Gazcue).
- [ ] Se quitaron de las pantallas, por las reglas de la demo: "Paga en línea", "Métodos de pago / tarjetas guardadas", "2x puntos pagando en línea", "Comisión de la plataforma", "En línea" como método de cobro y "Cobros y banco".

## Escena (etapa 3)
- [ ] Botón final «Agenda tu demo por WhatsApp»: muestra `[PENDIENTE: contacto real]` y no abre nada hasta tener el número.
- [ ] Textos nuevos para revisar: chats sin responder del momento 2, cuaderno de citas, mensaje a Carlos y su respuesta («Dale, el lunes a las 4 me sirve 👍»), guion del bot de soporte. Todos en `src/content.es.ts`.

## Técnicos (se resuelven en las etapas siguientes)
- [ ] Etapa 4: versión 2D de respaldo sin WebGL (hoy solo avisa), pulido y README completo.
