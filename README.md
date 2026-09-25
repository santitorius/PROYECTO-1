# Quovix · Presentación en vivo

Presentación controlada por el presentador, en una sola escena 3D continua (three.js + GSAP),
con las pantallas de los teléfonos hechas en HTML/CSS real.

> Estado: **Etapa 1** (escenario, tokens, escena base, sistema de momentos y modo presentador).
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

## Dónde editar

- Textos, notas del orador y datos de ejemplo: `src/content.es.ts`
- Colores, fuentes y tiempos: `src/tokens.ts`
- Momentos (timelines): `src/moments/index.ts`
- Lo que falta: `PENDIENTES.md`
