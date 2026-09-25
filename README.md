# Quovix · Presentación en vivo

Presentación controlada por el presentador, en una sola escena 3D continua (three.js + GSAP),
con las pantallas de los teléfonos hechas en HTML/CSS real.

> Estado: **Etapa 3** (los 13 momentos con sus consecuencias, adelante y atrás).
> El README completo llega en la Etapa 4.

## Correr

```bash
npm install
npm run dev            # desarrollo: http://localhost:5173
npm run build          # dist/: sitio estático (Vercel, Netlify, Cloudflare Pages)
npm run build:single   # dist-single/index.html: un solo archivo, abre con doble clic sin internet
```

## Controles

| Tecla | Acción |
|---|---|
| → · espacio · clic · PageDown | Siguiente momento |
| ← · PageUp | Retroceder (la animación corre al revés) |
| P | Modo presentador (ventana aparte con notas y cronómetro) |
| G | Ir a un momento por número |
| F | Pantalla completa |
| A | Modo automático (avanza cada 6 s) |
| Esc | Vista general |
| Inicio / Fin | Negro inicial / cierre |

Los clics dentro de las pantallas de los teléfonos son interacción y no avanzan la presentación.
Tres botones reales sí disparan la consecuencia (el momento siguiente), igual que la flecha:

| Pausa en | Botón en la pantalla | Consecuencia |
|---|---|---|
| 3 · Agenda | «Escribir» del aviso de WhatsApp de Luis | El chat sale del teléfono y se vuelve el teléfono del cliente |
| 6 · Cliente en riesgo | «Enviar mensaje por WhatsApp» | El mensaje viaja a Carlos, responde y su cita vuelve a la agenda |
| 7 · Cobrar | «Cobrar RD$600» y el método (efectivo, tarjeta o transferencia) | El monto vuela a Ventas con el método elegido |

## Revisar las pantallas sin 3D

Abre el archivo con `#pantallas` al final de la dirección (por ejemplo `index.html#pantallas`):
se ven la app del negocio, el WhatsApp del cliente y la app Quovix en plano, a tamaño real y tocables.

## Dónde editar

- Textos, notas del orador y datos de ejemplo: `src/content.es.ts`
- Colores, fuentes y tiempos: `src/tokens.ts`
- Momentos (timelines): `src/moments/index.ts`
- Pantallas: `src/screens/` (negocio, cliente, whatsapp) y estilos en `src/styles/app.css`
- Lo que falta: `PENDIENTES.md`
