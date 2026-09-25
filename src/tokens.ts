/**
 * Tokens de marca. ÚNICO lugar para colores, fuentes y medidas del escenario.
 * Se publican como variables CSS (--qx-*) al arrancar; el código 3D los lee de aquí.
 */

export const color = {
  fondo: '#03040A',
  turquesa: '#5DCBE1',
  cianNegocios: '#00C4DA',
  azulNoche: '#0F2233',
  blanco: '#FFFFFF',
  // derivados
  blancoHielo: '#EAF4FE',
  texto: '#FFFFFF',
  textoSuave: 'rgba(255,255,255,0.62)',
  textoTenue: 'rgba(255,255,255,0.38)',
  linea: 'rgba(93,203,225,0.28)',
  alerta: '#FF6B6B',
} as const;

/**
 * Tipografía.
 * Edmondsans (títulos) y Avenir (subtítulos y texto) NO están en /assets/fonts.
 * Mientras falten se usa Nunito Sans 900/400 embebida (ver PENDIENTES.md).
 * Para activar las fuentes reales: copia los .woff2 a /assets/fonts,
 * declara los @font-face en src/styles/fonts.css y pon su nombre primero en cada pila.
 */
export const font = {
  titulo: `'Nunito Sans', system-ui, sans-serif`, // [PENDIENTE] Edmondsans
  subtitulo: `'Nunito Sans', system-ui, sans-serif`, // [PENDIENTE] Avenir Black
  texto: `'Nunito Sans', system-ui, sans-serif`, // [PENDIENTE] Avenir Book
  pesoTitulo: 900,
  pesoSubtitulo: 900,
  pesoTexto: 400,
  espaciadoTitulo: '0.14em',
} as const;

export const stage = {
  width: 1920,
  height: 1080,
} as const;

export const motion = {
  /** duración base de una transición entre momentos (s) — rango permitido 1.2 a 2.5 */
  transicion: 1.8,
  ease: 'power2.inOut',
  easeSalida: 'power3.out',
  /** segundos de espera en modo automático */
  auto: 6,
} as const;

export function applyTokens(root: HTMLElement = document.documentElement): void {
  const s = root.style;
  for (const [k, v] of Object.entries(color)) s.setProperty(`--qx-${kebab(k)}`, v);
  s.setProperty('--qx-font-titulo', font.titulo);
  s.setProperty('--qx-font-subtitulo', font.subtitulo);
  s.setProperty('--qx-font-texto', font.texto);
  s.setProperty('--qx-peso-titulo', String(font.pesoTitulo));
  s.setProperty('--qx-peso-subtitulo', String(font.pesoSubtitulo));
  s.setProperty('--qx-peso-texto', String(font.pesoTexto));
  s.setProperty('--qx-espaciado-titulo', font.espaciadoTitulo);
  s.setProperty('--qx-stage-w', `${stage.width}px`);
  s.setProperty('--qx-stage-h', `${stage.height}px`);
}

function kebab(s: string): string {
  return s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
}
