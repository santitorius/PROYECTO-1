import { gsap } from 'gsap';
import { momentos } from '../content.es';
import { motion } from '../tokens';
import type { Scene3D } from '../core/scene';
import type { Phone } from '../core/phone';
import { PHONE } from '../core/phone';
import { QMark, LightFrame } from '../core/qmark';
import { hudState } from '../ui/hud';
import type { NegocioApp } from '../screens/negocio';
import type { ClienteApp } from '../screens/cliente';
import type { WhatsAppScreen } from '../screens/whatsapp';

export interface Apps {
  negocio: NegocioApp;
  cliente: ClienteApp;
  wa: WhatsAppScreen;
  pantallaCliente: { show(name: string): void; readonly current: string };
}

export interface Ctx {
  s: Scene3D;
  q: QMark;
  frame: LightFrame;
  negocio: Phone;
  cliente: Phone;
  apps: Apps;
  captions: HTMLElement;
  bg: { glow: number };
}

const D = motion.transicion;
const E = motion.ease;

/** Minutos devueltos acumulados al terminar el momento n. */
const minutosHasta = (n: number) => momentos.slice(0, n).reduce((a, m) => a + m.minutos, 0);

function caption(ctx: Ctx, html: string, cls = 'bottom'): HTMLElement {
  const el = document.createElement('div');
  el.className = `caption qx-titulo ${cls}`;
  el.innerHTML = html;
  ctx.captions.appendChild(el);
  gsap.set(el, { opacity: 0, y: 24, yPercent: cls.includes('left') ? -50 : 0, filter: 'blur(8px)' });
  return el;
}

const showCaption = (tl: gsap.core.Timeline, el: HTMLElement, at: gsap.Position) =>
  tl.to(el, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: motion.easeSalida }, at);
const hideCaption = (tl: gsap.core.Timeline, el: HTMLElement, at: gsap.Position) =>
  tl.to(el, { opacity: 0, y: -16, filter: 'blur(6px)', duration: 0.7, ease: 'power2.in' }, at);

/** Suma de minutos devueltos, visible y reversible. */
function addMinutes(tl: gsap.core.Timeline, n: number, at: gsap.Position) {
  const total = minutosHasta(n);
  tl.to(hudState, { minutos: total, duration: 1.2, ease: 'power1.out' }, at);
}

/**
 * Pose del teléfono y de la cámara. Los valores son absolutos: así la timeline
 * funciona igual hacia adelante, hacia atrás o al saltar con G.
 */
interface Pose {
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
}
function pose(tl: gsap.core.Timeline, p: Phone, to: Pose, at: gsap.Position = 0, dur: number = D) {
  const { x, y, z, rx, ry, rz } = to;
  const pos: gsap.TweenVars = {};
  if (x !== undefined) pos.x = x;
  if (y !== undefined) pos.y = y;
  if (z !== undefined) pos.z = z;
  const rot: gsap.TweenVars = {};
  if (rx !== undefined) rot.x = rx;
  if (ry !== undefined) rot.y = ry;
  if (rz !== undefined) rot.z = rz;
  if (Object.keys(pos).length) tl.to(p.position, { ...pos, duration: dur, ease: E }, at);
  if (Object.keys(rot).length) tl.to(p.rotation, { ...rot, duration: dur, ease: E }, at);
}
function camera(tl: gsap.core.Timeline, ctx: Ctx, to: Partial<Scene3D['cam']>, at: gsap.Position = 0, dur: number = D) {
  tl.to(ctx.s.cam, { ...to, duration: dur, ease: E }, at);
}

/* ------------------------------------------------------------------ */
/* Estado inicial: vacío negro.                                        */
/* ------------------------------------------------------------------ */
export function initialState(ctx: Ctx): void {
  const B = QMark.BODY;
  const S = QMark.SIZE;
  ctx.q.position.set(0, 0.6, 0);
  ctx.q.reveal = 0;
  ctx.q.opacity = 1;
  // El marco de luz nace con la forma exacta del cuerpo de la Q.
  ctx.frame.position.set(ctx.q.position.x + B.cx * S, ctx.q.position.y + B.cy * S, 0.01);
  Object.assign(ctx.frame.shape, { w: B.w * S, h: B.h * S, r: B.h * S * 0.42, t: B.stroke * S, opacity: 0, glow: 0.5 });
  ctx.negocio.position.set(0, 0, 0);
  ctx.negocio.rotation.set(0, 0, 0);
  ctx.negocio.opacity = 0;
  ctx.negocio.screenOn = 0;
  ctx.cliente.position.set(-7.5, -0.2, -2);
  ctx.cliente.rotation.set(0, 0.28, 0);
  ctx.cliente.opacity = 0;
  ctx.cliente.screenOn = 0;
  Object.assign(ctx.s.cam, { x: 0, y: 0, z: 26, tx: 0, ty: 0, tz: 0, float: 1 });
  ctx.bg.glow = 0;
  hudState.minutos = 0;
  hudState.contador = 0;
  hudState.muestra = 0;
}

/* ------------------------------------------------------------------ */
/* Timelines: timelines[k] lleva del momento k al k+1.                 */
/* Etapa 1: 1 completo; 2–13 con su esqueleto de cámara y teléfonos.   */
/* En la etapa 3 cada uno recibe su contenido y su consecuencia.       */
/* ------------------------------------------------------------------ */
export function buildTimelines(ctx: Ctx): gsap.core.Timeline[] {
  const m = momentos;
  const tls: gsap.core.Timeline[] = [];
  const T = () => {
    const tl = gsap.timeline({ paused: true });
    tls.push(tl);
    return tl;
  };

  // 1 · Apertura: del vacío negro se forma la Q.
  {
    const tl = T();
    const c = caption(ctx, m[0].frases[0]);
    tl.to(ctx.q, { reveal: 1, duration: 2.4, ease: 'power2.out' }, 0.2);
    camera(tl, ctx, { z: 22 }, 0, 2.6);
    showCaption(tl, c, 1.4);
    (ctx as CtxWithCaps).caps = { c1: c };
  }

  // 2 · El problema. Consecuencia de 1: el cuerpo de la Q se vuelve el marco del teléfono.
  {
    const tl = T();
    const caps = (ctx as CtxWithCaps).caps;
    hideCaption(tl, caps.c1, 0);
    // el marco de luz aparece exactamente sobre el cuerpo de la Q, la Q se retira
    tl.to(ctx.frame.shape, { opacity: 1, duration: 0.5, ease: 'none' }, 0.1);
    tl.to(ctx.q, { opacity: 0, duration: 0.6, ease: 'power1.in' }, 0.35);
    // se estira hasta ser el marco del teléfono
    tl.to(ctx.frame.position, { x: 0, y: 0, duration: 1.6, ease: E }, 0.5);
    tl.to(
      ctx.frame.shape,
      { w: PHONE.w, h: PHONE.h, r: PHONE.radius, t: 0.07, glow: 0.9, duration: 1.6, ease: E },
      0.5,
    );
    tl.to(ctx.negocio, { opacity: 1, duration: 0.9, ease: 'power1.inOut' }, 1.5);
    tl.to(ctx.frame.shape, { opacity: 0.35, glow: 0.25, duration: 0.8 }, 2.0);
    tl.to(ctx.bg, { glow: 1, duration: 2.2, ease: 'none' }, 0.8);
    camera(tl, ctx, { z: 24, y: 0.2 }, 0.3, 2.2);
    const c = caption(ctx, m[1].frases[0], 'left');
    showCaption(tl, c, 2.0);
    (ctx as CtxWithCaps).caps.c2 = c;
  }

  // 3 · Agenda: el teléfono se enciende; la cámara entra hacia la pantalla.
  {
    const tl = T();
    const caps = (ctx as CtxWithCaps).caps;
    hideCaption(tl, caps.c2, 0);
    tl.to(ctx.negocio, { screenOn: 1, duration: 0.8, ease: 'power1.out' }, 0.3);
    tl.to(ctx.frame.shape, { opacity: 0, duration: 0.8 }, 0.3);
    camera(tl, ctx, { z: 17.5, y: 0.1, float: 0.5 }, 0.2, 2.2);
    tl.to(hudState, { muestra: 1, duration: 0.8 }, 1.2);
  }

  // 4 · Agente de WhatsApp: aparece el teléfono del cliente a la izquierda.
  {
    const tl = T();
    pose(tl, ctx.negocio, { x: 3.3, ry: -0.12 }, 0);
    pose(tl, ctx.cliente, { x: -3.3, z: 0, ry: 0.12 }, 0.2);
    tl.to(ctx.cliente, { opacity: 1, duration: 0.9 }, 0.2);
    tl.to(ctx.cliente, { screenOn: 1, duration: 0.8 }, 0.9);
    camera(tl, ctx, { z: 21, y: 0, float: 1 }, 0);
    const c = caption(ctx, m[3].frases[0], 'top small');
    showCaption(tl, c, 1.4);
    tl.to(hudState, { contador: 1, duration: 0.6 }, 1.4);
    addMinutes(tl, 4, 1.6);
    (ctx as CtxWithCaps).caps.c4 = c;
  }

  // 5 · El tiempo pasa.
  {
    const tl = T();
    hideCaption(tl, (ctx as CtxWithCaps).caps.c4, 0);
    pose(tl, ctx.cliente, { x: -9, z: -3 }, 0);
    tl.to(ctx.cliente, { opacity: 0, duration: 1 }, 0.4);
    pose(tl, ctx.negocio, { x: 0, y: 0, rx: -1.05, ry: 0, z: -1 }, 0.2, 2.2);
    camera(tl, ctx, { z: 20, y: 6, ty: -1 }, 0, 2.4);
    const c = caption(ctx, m[4].frases[0], 'top small');
    showCaption(tl, c, 1.6);
    (ctx as CtxWithCaps).caps.c5 = c;
  }

  // 6 · Cliente en riesgo.
  {
    const tl = T();
    hideCaption(tl, (ctx as CtxWithCaps).caps.c5, 0);
    pose(tl, ctx.negocio, { rx: 0, z: 0, x: 2.6, ry: -0.08 }, 0);
    camera(tl, ctx, { z: 17, y: 0, ty: 0, tx: 0.6 }, 0);
    const c = caption(ctx, m[5].frases[0], 'left');
    showCaption(tl, c, 1.2);
    addMinutes(tl, 6, 1.6);
    (ctx as CtxWithCaps).caps.c6 = c;
  }

  // 7 · Cobrar.
  {
    const tl = T();
    hideCaption(tl, (ctx as CtxWithCaps).caps.c6, 0);
    pose(tl, ctx.negocio, { x: 0, ry: 0 }, 0);
    camera(tl, ctx, { z: 17.5, tx: 0 }, 0);
    addMinutes(tl, 7, 1.2);
  }

  // 8 · Ventas y finanzas.
  {
    const tl = T();
    pose(tl, ctx.negocio, { x: -2.8, ry: 0.1 }, 0);
    camera(tl, ctx, { z: 18, tx: -0.4 }, 0);
    const c = caption(ctx, m[7].frases[0], 'left');
    tl.set(c, { left: 1060 }, 0);
    showCaption(tl, c, 1.2);
    addMinutes(tl, 8, 1.4);
    (ctx as CtxWithCaps).caps.c8 = c;
  }

  // 9 · Equipo e insumos.
  {
    const tl = T();
    hideCaption(tl, (ctx as CtxWithCaps).caps.c8, 0);
    pose(tl, ctx.negocio, { x: 2.8, ry: -0.1 }, 0);
    camera(tl, ctx, { z: 18, tx: 0.4 }, 0);
    const c = caption(ctx, m[8].frases[0], 'left');
    showCaption(tl, c, 1.2);
    addMinutes(tl, 9, 1.4);
    (ctx as CtxWithCaps).caps.c9 = c;
  }

  // 10 · App del cliente: el teléfono del negocio se aleja y gira; detrás aparece el del cliente.
  {
    const tl = T();
    hideCaption(tl, (ctx as CtxWithCaps).caps.c9, 0);
    pose(tl, ctx.negocio, { x: 5.5, z: -6, ry: -2.2 }, 0, 2.2);
    tl.to(ctx.negocio, { opacity: 0.25, duration: 1.4 }, 0.6);
    tl.set(ctx.cliente.position, { x: 0, y: 0, z: -5 }, 0);
    tl.set(ctx.cliente.rotation, { y: 0 }, 0);
    tl.to(ctx.cliente, { opacity: 1, screenOn: 1, duration: 1.0 }, 0.6);
    pose(tl, ctx.cliente, { z: 0 }, 0.4, 2.0);
    camera(tl, ctx, { z: 17.5, tx: 0 }, 0, 2.2);
    addMinutes(tl, 10, 1.6);
  }

  // 11 · Asistente IA.
  {
    const tl = T();
    pose(tl, ctx.cliente, { x: -3.3, ry: 0.12 }, 0);
    pose(tl, ctx.negocio, { x: 3.3, z: 0, ry: -0.12 }, 0);
    tl.to(ctx.negocio, { opacity: 1, duration: 1.2 }, 0.2);
    camera(tl, ctx, { z: 21 }, 0);
    const c = caption(ctx, m[10].frases[0], 'top small');
    showCaption(tl, c, 1.4);
    addMinutes(tl, 11, 1.6);
    (ctx as CtxWithCaps).caps.c11 = c;
  }

  // 12 · Próximamente: los teléfonos se ordenan, se apagan y queda una silueta en penumbra.
  {
    const tl = T();
    hideCaption(tl, (ctx as CtxWithCaps).caps.c11, 0);
    pose(tl, ctx.cliente, { x: -5.2, ry: 0 }, 0);
    pose(tl, ctx.negocio, { x: -0.6, ry: 0 }, 0);
    tl.to([ctx.cliente, ctx.negocio], { screenOn: 0, duration: 1 }, 0.6);
    tl.to([ctx.cliente, ctx.negocio], { opacity: 0.18, duration: 1.2 }, 1.0);
    tl.set(ctx.frame.position, { x: 5, y: 0, z: 0 }, 0);
    tl.set(ctx.frame.shape, { w: PHONE.w, h: PHONE.h, r: PHONE.radius, t: 0.05, glow: 0.3 }, 0);
    tl.to(ctx.frame.shape, { opacity: 0.35, duration: 1.4 }, 1.0);
    camera(tl, ctx, { z: 22, tx: 0 }, 0);
    const c = caption(ctx, m[11].frases[0], 'bottom small');
    showCaption(tl, c, 1.6);
    (ctx as CtxWithCaps).caps.c12 = c;
  }

  // 13 · Planes y cierre: la silueta vuelve a ser la Q.
  {
    const tl = T();
    hideCaption(tl, (ctx as CtxWithCaps).caps.c12, 0);
    tl.to([ctx.cliente, ctx.negocio], { opacity: 0, duration: 1.0 }, 0);
    tl.to(ctx.frame.shape, { opacity: 0, duration: 0.8 }, 0.2);
    tl.to(ctx.frame.position, { x: 0, duration: 1.4, ease: E }, 0);
    tl.set(ctx.q, { reveal: 1 }, 0);
    tl.fromTo(ctx.q, { opacity: 0 }, { opacity: 1, duration: 1.4, immediateRender: false }, 0.6);
    tl.to(ctx.q.position, { y: 1.4, duration: 1.8, ease: E }, 0.4);
    camera(tl, ctx, { z: 24, y: 0, ty: 0, tx: 0, float: 1 }, 0);
    const c = caption(ctx, m[12].frases[0], 'bottom');
    tl.set(c, { bottom: 190 }, 0);
    showCaption(tl, c, 1.4);
    tl.to(hudState, { muestra: 0, duration: 0.6 }, 0.4);
  }

  return tls;
}

type CtxWithCaps = Ctx & { caps: Record<string, HTMLElement> };
