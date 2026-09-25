# Quovix · Presentación en vivo

Presentación para dueños de barberías, salones, uñas y spas de Santo Domingo.
Una sola escena 3D continua (three.js + GSAP) donde cada momento nace del anterior,
con las pantallas de los teléfonos hechas en HTML/CSS real y tocables.
Duración pensada: 5 a 7 minutos. Cierre: agendar una demo por WhatsApp.

> «No vendemos tecnología, devolvemos tiempo.»

---

## 1. Abrirla sin instalar nada

El archivo **`entrega/quovix-presentacion.html`** es la presentación completa en un solo archivo
(fuentes, logo, fotos y código adentro). Se abre con **doble clic** en Chrome, Edge, Safari o Firefox
y **no necesita internet**.

- Recomendado: Chrome o Edge actualizados, en pantalla completa (tecla **F**).
- Si el equipo no tiene WebGL (proyectores o PCs viejas), se abre sola la **versión 2D**:
  los mismos 13 momentos, las mismas pantallas tocables, sin los efectos de luz y partículas.

## 2. Cómo presentarla

1. Abre el archivo y pulsa **F** (pantalla completa) en la pantalla que ve el público.
2. Pulsa **P**: se abre una **ventana aparte con tus notas**, el momento actual, el que sigue,
   un cronómetro y los minutos devueltos. Arrástrala a la laptop.
   Si el navegador la bloquea, permite ventanas emergentes para este archivo.
3. Empieza en negro. Avanza con **→**, **espacio**, **clic** o el **clicker** (PageDown).

| Tecla | Acción |
|---|---|
| → · espacio · clic · PageDown · Enter | Siguiente momento |
| ← · PageUp · Retroceso | Retroceder (la animación corre al revés, sin saltos) |
| P | Modo presentador (ventana aparte con notas) |
| G | Ir a un momento por número |
| F | Pantalla completa |
| A | Modo automático: avanza solo cada 6 s (para eventos) |
| Esc | Vista general de los 13 momentos |
| Inicio / Fin | Negro inicial / cierre |

**Pulsar mientras algo se anima** apura esa animación y luego sigue. **Retroceder a mitad** de una
animación la da vuelta desde donde está.

### Las pausas son interactivas

Al terminar cada momento, la escena queda quieta y **las pantallas se pueden tocar** (cambiar de día en
la agenda, filtrar clientes, abrir chats, ver finanzas, reservar en la app del cliente, etc.).
Tocar las pantallas **no avanza** la presentación. Tres botones reales **sí** disparan la consecuencia,
igual que la flecha:

| Pausa en | Toca en la pantalla | Consecuencia |
|---|---|---|
| 3 · Agenda | «Escribir» en el aviso de WhatsApp de Luis | El chat sale del teléfono y se vuelve el teléfono del cliente |
| 6 · Cliente en riesgo | «Enviar mensaje por WhatsApp» | El mensaje viaja a Carlos, responde y su cita vuelve a la agenda |
| 7 · Cobrar | «Cobrar RD$600» y el método (efectivo, tarjeta o transferencia) | El monto vuela a Ventas con el método elegido |

### Los 13 momentos

| # | Momento | Pasa al siguiente con… |
|---|---|---|
| 1 | Apertura: se forma la Q | El cuerpo de la Q se vuelve el marco del teléfono |
| 2 | El problema: chats sin responder, cuaderno, un cliente que se va · eslogan | Las burbujas son absorbidas y el teléfono se enciende |
| 3 | Agenda de Barbería El Patio (8 de 12, 67 %) | «Escribir»: el chat sale del teléfono |
| 4 | Agente de WhatsApp (6 mensajes) | Luz del cliente a la agenda: aparece la cita del sábado |
| 5 | El tiempo pasa: los clientes que no vuelven se apagan | La cámara entra al punto de Carlos |
| 6 | Cliente en riesgo: Carlos, 7 semanas | «Enviar»: Carlos responde y vuelve a la agenda |
| 7 | Cobrar | «Cobrar RD$600»: el monto vuela a Ventas |
| 8 | Ventas y finanzas hasta el Neto | Se separan las porciones del equipo |
| 9 | Equipo e insumos | El teléfono gira: aparece la app del cliente |
| 10 | App del cliente | Destello hacia el Asistente IA |
| 11 | Asistente IA y bot de soporte | Los teléfonos se apagan |
| 12 | Próximamente: pago en línea (silueta, no se toca) | La silueta se vuelve partículas |
| 13 | Planes y cierre · minutos devueltos · botón de WhatsApp | Fin: la Q queda flotando |

## 3. Editar textos y datos

**Todo el texto y todos los datos están en `src/content.es.ts`.** Después de editar, vuelve a
generar el archivo (ver sección 4).

- `momentos`: título, frases en escena, **notas del orador** y minutos devueltos de cada momento.
- `marca`: eslogan, contacto. `cierreFinal.enlace`: el enlace real de WhatsApp del botón final
  (por ejemplo `https://wa.me/1809XXXXXXX?text=Quiero%20una%20demo`).
- `negocio`, `servicios`, `agenda`, `clientesNegocio`, `reporteSemanal`, `equipoPagos`, `insumos`…:
  los datos de ejemplo. Las cifras están cuadradas entre sí (ver comentarios en el archivo).
- `conversacionAgente`, `mensajeCarlos`, `respuestaCarlos`: los chats.
- `pendiente('...')` muestra un marcador visible `[PENDIENTE: ...]`. La lista está en **`PENDIENTES.md`**.

Colores, fuentes y tiempos de animación: **`src/tokens.ts`**.
Logo y fotos: **`assets/`** (reemplaza los archivos manteniendo el nombre).

## 4. Generar los archivos

Requiere Node 20.19 o superior (o 22.12+).

```bash
npm install
npm run dev            # para editar: http://localhost:5173 (se recarga al guardar)
npm run build:single   # entrega/quovix-presentacion.html  → un solo archivo, sin internet
npm run build          # dist/ → sitio estático para publicar
npm run build:all      # los dos
```

### Publicar en internet (opcional)

`dist/` es un sitio estático con rutas relativas; sirve en cualquier hosting:

- **Vercel**: importa el repositorio · Build command `npm run build` · Output `dist`.
- **Netlify**: Build command `npm run build` · Publish directory `dist` (o arrastra la carpeta `dist` a app.netlify.com/drop).
- **Cloudflare Pages**: Build command `npm run build` · Build output `dist`.

## 5. Vistas útiles

Agrega al final de la dirección del archivo:

- `#pantallas`: las tres pantallas (negocio, WhatsApp, cliente) en plano, a tamaño real, para revisar diseño y textos.
- `#2d`: fuerza la versión 2D de respaldo (para probarla en un equipo con WebGL).

## 6. Rendimiento y accesibilidad

- Escenario fijo de 1920×1080 que se escala a cualquier pantalla con barras negras.
- Resolución adaptativa: si la laptop no llega a unos 50 fps, baja la resolución del 3D sola y la sube cuando sobra.
- Un solo modelo de teléfono hecho por código; sin modelos ni videos pesados. Archivo único ≈ 1.1 MB.
- **Movimiento reducido** (`prefers-reduced-motion`): mismas escenas, transiciones más cortas, sin flotación ni derivas.
- Sin WebGL: versión 2D automática con los mismos momentos.

## 7. Estructura

```
src/
  content.es.ts        todo el texto y los datos
  tokens.ts            colores, fuentes, medidas y tiempos
  main.ts              arranque, teclado, clics, conexión de botones reales
  core/                escenario 16:9, escena 3D, teléfono, Q, sistema de momentos, versión 2D
  moments/             los 13 momentos (timelines GSAP) y efectos (luz, vuelos, puntos, partículas)
  screens/             apps en DOM real: negocio, cliente, WhatsApp
  ui/                  HUD, modo presentador, ir a, vista general
  styles/              estilos base, pantallas, apps y escena
assets/                logo (Q y wordmark originales), fotos, fuentes
reference/             capturas y PDFs de referencia de diseño
entrega/               el HTML único listo para presentar
```

Cada momento es una timeline de GSAP que lleva la escena del momento anterior al siguiente.
Las pantallas cambian por **estados completos** en cada paso, así avanzar, retroceder o saltar
siempre deja exactamente lo mismo en pantalla.

## 8. Reglas de contenido de la demo

- El pago en línea **no** aparece funcionando: solo como «Próximamente». Los cobros de la demo son
  efectivo, tarjeta y transferencia registrados a mano. No hay línea de «Comisión de la plataforma».
- No se dice «sin comisiones», no se muestran precios ni porcentajes de planes, ni cifras de mercado
  ni competidores.
- Todos los datos son de ejemplo (aviso «Datos de ejemplo» en pantalla).

## 9. Si algo falla

- **No se abre la ventana del presentador** → permite ventanas emergentes para el archivo y pulsa P otra vez.
- **Se ve la versión 2D en un equipo moderno** → activa la aceleración por hardware del navegador.
- **Letras distintas a las de la marca** → faltan Edmondsans y Avenir (ver `PENDIENTES.md`).
