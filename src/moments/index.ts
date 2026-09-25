import * as THREE from 'three';
import { gsap } from 'gsap';
import {
  burbujasSinResponder,
  cierreFinal,
  citaCarlos,
  citaCarlosDia,
  citaNuevaAgente,
  citaNuevaAgenteDia,
  clienteQueSeVa,
  confirmacionCarlos,
  conversacionAgente,
  cuaderno,
  equipoPagos,
  formatoRD as RD,
  lineaTiempo,
  marca,
  mensajeCarlos,
  momentos,
  proximamente,
  respuestaCarlos,
  sinResponder,
  ui,
  type Metodo,
} from '../content.es';
import { motion } from '../tokens';
import type { Scene3D, CamState } from '../core/scene';
import { PHONE, type Phone } from '../core/phone';
import { QMark, LightFrame } from '../core/qmark';
import { hudState } from '../ui/hud';
import type { NegocioApp, DemoNegocio, Mensaje } from '../screens/negocio';
import { soporteCard } from '../screens/negocio';
import type { ClienteApp } from '../screens/cliente';
import { createWhatsApp, type WhatsAppScreen, type WaMensaje } from '../screens/whatsapp';
import { h, mount } from '../screens/dom';
import { Floating, Flyer, LightBeam, ClientDots, ParticleMorph, fade } from './fx';

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

/** Decisiones que toma el presentador en vivo (p. ej. con qué método cobró). */
export const demo = { metodo: 'efectivo' as Metodo };

const D = motion.transicion;
const E = motion.ease;
const m = momentos;

/** Minutos devueltos acumulados al terminar el momento n. */
const minutosHasta = (n: number) => m.slice(0, n).reduce((a, x) => a + x.minutos, 0);

/* ------------------------------------------------------------------ */
/* Utilidades de timeline                                              */
/* ------------------------------------------------------------------ */

function caption(ctx: Ctx, html: string, cls = 'bottom'): HTMLElement {
  const el = document.createElement('div');
  el.className = `caption qx-titulo ${cls}`;
  el.innerHTML = html;
  ctx.captions.appendChild(el);
  const centered = cls.includes('left') || cls.includes('right');
  gsap.set(el, { opacity: 0, y: 24, yPercent: centered ? -50 : 0, filter: 'blur(8px)' });
  return el;
}
const show = (tl: gsap.core.Timeline, el: HTMLElement, at: gsap.Position) =>
  tl.to(el, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: motion.easeSalida }, at);
const hide = (tl: gsap.core.Timeline, el: HTMLElement, at: gsap.Position) =>
  tl.to(el, { opacity: 0, y: -16, filter: 'blur(6px)', duration: 0.7, ease: 'power2.in' }, at);

function addMinutes(tl: gsap.core.Timeline, total: number, at: gsap.Position) {
  tl.to(hudState, { minutos: total, duration: 1.2, ease: 'power1.out' }, at);
}

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
  const pos = Object.fromEntries(Object.entries({ x, y, z }).filter(([, v]) => v !== undefined));
  const rot = Object.fromEntries(Object.entries({ x: rx, y: ry, z: rz }).filter(([, v]) => v !== undefined));
  if (Object.keys(pos).length) tl.to(p.position, { ...pos, duration: dur, ease: E }, at);
  if (Object.keys(rot).length) tl.to(p.rotation, { ...rot, duration: dur, ease: E }, at);
}
function cam(tl: gsap.core.Timeline, ctx: Ctx, to: Partial<CamState>, at: gsap.Position = 0, dur: number = D) {
  tl.to(ctx.s.cam, { ...to, duration: dur, ease: E }, at);
}

/** Calcula algo con el teléfono puesto en una pose (sin moverlo de verdad). */
function atPose<T>(p: Phone, to: Pose, fn: () => T): T {
  const pos = p.position.clone();
  const rot = p.rotation.clone();
  p.position.set(to.x ?? pos.x, to.y ?? pos.y, to.z ?? pos.z);
  p.rotation.set(to.rx ?? rot.x, to.ry ?? rot.y, to.rz ?? rot.z);
  p.updateMatrixWorld(true);
  const r = fn();
  p.position.copy(pos);
  p.rotation.copy(rot);
  p.updateMatrixWorld(true);
  return r;
}

/* ------------------------------------------------------------------ */
/* Estados de las pantallas.                                           */
/* Cada paso deja las apps en un estado COMPLETO; la reversa aplica el */
/* estado anterior. Así adelante, atrás y los saltos siempre coinciden. */
/* ------------------------------------------------------------------ */

interface World {
  n: DemoNegocio;
  /** retoques visuales después de aplicar el estado del negocio */
  nFx?: () => void;
  w: WaMensaje[];
  wTyping: null | 'yo' | 'otro';
  capa: 'quovix' | 'whatsapp';
  k: Parameters<ClienteApp['setDemo']>[0];
  kFx?: () => void;
  sup: number;
}
type Apply = (w: World) => void;
let world: World;
let applyWorld: Apply;
/**
 * Un paso de la timeline: cambia parte del "mundo" de pantallas. Cada paso guarda el mundo
 * COMPLETO; al retroceder se aplica el mundo anterior tal cual.
 */
function state(tl: gsap.core.Timeline, at: gsap.Position, patch: Partial<World>): void {
  const prev = world;
  const next: World = { ...prev, nFx: undefined, kFx: undefined, ...patch };
  world = next;
  tl.to({}, { duration: 0.001, onComplete: () => applyWorld(next), onReverseComplete: () => applyWorld(prev) }, at);
}

const toWa = (msgs: { de: string; texto: string }[]): WaMensaje[] =>
  msgs.map((x) => ({ de: x.de === 'cliente' ? 'yo' : 'otro', texto: x.texto }));

type CtxCaps = Ctx & Record<string, HTMLElement>;

/* ------------------------------------------------------------------ */
/* Construcción                                                        */
/* ------------------------------------------------------------------ */

export function buildTimelines(ctx: Ctx): gsap.core.Timeline[] {
  const { s, q, frame, negocio: P, cliente: C, apps } = ctx;
  const cx = ctx as CtxCaps;
  const N = apps.negocio;
  const K = apps.cliente;
  const W = apps.wa;
  const tls: gsap.core.Timeline[] = [];
  const T = () => {
    const tl = gsap.timeline({ paused: true });
    tls.push(tl);
    return tl;
  };

  // Estado base de las pantallas (negro inicial).
  world = { n: {}, w: [], wTyping: null, capa: 'quovix', k: { paso: 'bienvenida' }, sup: 0 };
  let lastK = '';
  applyWorld = (x) => {
    N.setDemo(x.n);
    x.nFx?.();
    apps.pantallaCliente.show(x.capa);
    W.set(x.w, x.wTyping);
    // La app del cliente solo se vuelve a armar si cambió (así no se reinicia el código escribiéndose).
    const k = JSON.stringify(x.k);
    if (k !== lastK) {
      K.setDemo(x.k);
      lastK = k;
    }
    x.kFx?.();
    sup(x.sup);
  };

  /* ---------- objetos de escena ---------- */
  const beam = new LightBeam(s.scene);

  // Momento 2: burbujas sin responder, cuaderno y el cliente que se va.
  const burbujaPos = [
    [6.9, 3.4, 0.4, 0.05],
    [7.9, 0.9, -1.2, -0.04],
    [6.5, -1.7, 1.0, 0.03],
    [-0.4, 4.5, -1.4, -0.05],
    [0.2, -4.3, 0.6, 0.04],
    [10.3, 4.1, -2.4, 0.06],
  ];
  const burbujas = burbujasSinResponder.map((b, i) => {
    const el = h('div', { class: 'burbuja' }, h('b', null, b.nombre), b.texto, h('small', null, h('span', null, b.hace), h('i', null, sinResponder)));
    const [x, y, z, rz] = burbujaPos[i];
    const f = new Floating(s, el, { x, y, z, rz });
    f.drift = 0.12;
    return f;
  });
  const bScale = burbujas[0].obj.scale.x;
  const cuadernoF = new Floating(
    s,
    h('div', { class: 'cuaderno' }, h('h4', null, cuaderno.titulo), cuaderno.lineas.map((l) => h('p', { class: l.tachada ? 'x' : '' }, l.t))),
    { x: 10.3, y: -2.3, z: -1, rz: -0.1, ry: -0.3, s: 0.95 },
  );
  cuadernoF.drift = 0.05;
  const cScale = cuadernoF.obj.scale.x;
  const seVa = new Floating(
    s,
    h(
      'div',
      { class: 'se-va' },
      h('div', {
        html: `<svg viewBox="0 0 100 120" fill="none" stroke="#5DCBE1" stroke-width="2.5"><circle cx="50" cy="34" r="20"/><path d="M12 118c3-30 18-46 38-46s35 16 38 46"/></svg>`,
      }),
      h('b', null, clienteQueSeVa.nombre),
      h('small', null, clienteQueSeVa.nota),
    ),
    { x: 10.9, y: 1.0, z: -2.2, s: 0.8 },
  );

  // Momento 4: la ventana de chat que sale del teléfono (copia real del WhatsApp del cliente).
  const waClon = createWhatsApp();
  waClon.set(toWa(conversacionAgente.slice(0, 1)));
  const chatFlyer = new Flyer(s, h('div', { class: 'screen-clone clon' }, waClon.el));

  // Momento 5: los clientes como puntos sobre la línea de semanas.
  const dots = new ClientDots(lineaTiempo.semanas);
  dots.position.set(0, -0.5, 0.4);
  s.scene.add(dots);
  const zoom = { v: 0 };
  s.onTick(() => {
    dots.update();
    // acercamiento a Carlos: su punto crece, el resto se apaga
    if (zoom.v > 0 && dots.visible) {
      dots.dots.forEach((d, i) => {
        const mat = d.material as THREE.SpriteMaterial;
        if (i === dots.carlosIndex) {
          d.scale.multiplyScalar(1 + zoom.v * 2.5);
          mat.color.set('#5dcbe1');
        } else mat.opacity *= 1 - zoom.v;
      });
    }
  });
  const carlosWorld = () => {
    dots.updateMatrixWorld(true);
    return dots.localToWorld(dots.dots[dots.carlosIndex].position.clone());
  };
  const semanaLabels = Array.from(
    { length: lineaTiempo.semanas },
    (_, i) =>
      new Floating(s, h('div', { class: 'rotulo sm' }, lineaTiempo.semana(i + 1)), {
        x: dots.position.x + dots.weekX(i + 0.5),
        y: dots.position.y - 0.45,
        z: dots.position.z,
        s: 0.9,
      }),
  );
  const cd = dots.data[dots.carlosIndex];
  const tagPos = { x: dots.position.x + cd.x + 2.4, y: dots.position.y + cd.y + 0.6, z: dots.position.z + cd.z };
  const carlosTag = new Floating(s, h('div', { class: 'rotulo carlos-tag' }, lineaTiempo.carlos, h('small', null, lineaTiempo.carlosActivo)), tagPos);
  const carlosTagLost = new Floating(s, h('div', { class: 'rotulo carlos-tag lost' }, lineaTiempo.carlos, h('small', null, lineaTiempo.carlosPerdido)), tagPos);

  // Momento 6: la tarjeta de Carlos que sale de su punto.
  const cardBox = h('div', { class: 'card-clone clon' });
  const cardFlyer = new Flyer(s, cardBox);
  // Momento 7: el mensaje que viaja y el punto de Carlos que vuelve.
  const msgFlyer = new Flyer(s, h('div', { class: 'burbuja me clon', style: 'background:#005c4b;width:320px' }, mensajeCarlos));
  const dotFlyer = new Flyer(s, h('div', { class: 'dot-glow' }));
  // Momento 8: el monto que se desprende del botón.
  const chipTxt = h('span');
  const chipFlyer = new Flyer(s, h('div', { class: 'chip-monto' }, chipTxt));
  // Momento 9: las porciones de cada profesional y sus tarjetas fuera del teléfono.
  const pros = equipoPagos.profesionales;
  const proFloats = pros.map(
    (p, i) =>
      new Floating(
        s,
        h(
          'div',
          { class: 'card pro pro-float' },
          h(
            'div',
            { class: 'top' },
            h('div', { class: 'av dark' }, p.nombre.split(' ').map((w) => w[0]).join('')),
            h('div', { class: 'grow' }, h('div', { class: 'who' }, p.nombre), h('div', { class: 'muted', style: 'font-size:13px' }, `${p.servicios} servicios · ${RD(p.generado)} generados`)),
          ),
          h('div', { class: 'rule' }, `Regla: ${Math.round(equipoPagos.regla * 100)} % de lo generado`),
          h(
            'div',
            { class: 'three' },
            h('div', null, h('b', { class: 'num' }, RD(p.aPagar)), h('small', null, 'A pagar')),
            h('div', null, h('b', { class: 'num' }, RD(p.generado)), h('small', null, 'Generado')),
            h('div', null, h('b', { class: 'num' }, String(p.servicios)), h('small', null, 'Servicios')),
          ),
        ),
        { x: 3.6, y: 3.1 - i * 2.9, z: 0, ry: -0.12, s: 1.05 },
      ),
  );
  const proChips = pros.map((p) => new Flyer(s, h('div', { class: 'chip-monto' }, RD(p.aPagar), h('small', null, p.nombre))));
  // Momento 11: el bot de soporte, fuera del teléfono.
  const soporteBox = h('div');
  const soporteF = new Floating(s, soporteBox, { x: 5.6, y: 0.2, z: 0, ry: -0.2, s: 1.05 });
  const sup = (k: number) => mount(soporteBox, soporteCard(k));
  sup(0);
  // Momento 12: rótulo bajo la silueta.
  const ghostX = 5.2;
  const fantasma = new Floating(s, h('div', { class: 'fantasma' }, h('b', null, proximamente.rotulo), h('span', null, proximamente.detalle)), {
    x: ghostX,
    y: -5.3,
    z: 0,
    s: 1.1,
  });
  // Momento 13: partículas de la silueta a la Q.
  const qFinal = { x: 0, y: 2.0, scale: 0.62 };
  const nPart = 2200;
  const particles = new ParticleMorph(
    nPart,
    (i, out) => {
      // puntos sobre el contorno de la silueta
      const per = 2 * (PHONE.w + PHONE.h);
      let t = (((i * 7919) % nPart) / nPart) * per;
      const jit = () => (Math.random() - 0.5) * 0.12;
      if (t < PHONE.w) out.set(ghostX - PHONE.w / 2 + t, PHONE.h / 2 + jit(), jit());
      else if ((t -= PHONE.w) < PHONE.h) out.set(ghostX + PHONE.w / 2 + jit(), PHONE.h / 2 - t, jit());
      else if ((t -= PHONE.h) < PHONE.w) out.set(ghostX + PHONE.w / 2 - t, -PHONE.h / 2 + jit(), jit());
      else out.set(ghostX - PHONE.w / 2 + jit(), -PHONE.h / 2 + (t - PHONE.w), jit());
    },
    { x: qFinal.x, y: qFinal.y, size: QMark.SIZE * qFinal.scale },
  );
  s.scene.add(particles);
  s.onTick(() => particles.update(s.renderer.getPixelRatio()));
  // Cierre: bloque final (DOM en la capa de frases).
  const finalNum = h('b', null, '0');
  const cta = h('button', { class: 'cta interactive', type: 'button' }, cierreFinal.boton, h('small', null, cierreFinal.contacto));
  const finalEl = h(
    'div',
    { class: 'final' },
    h('div', { class: 'plan' }, cierreFinal.plan),
    h('div', { class: 'esl' }, marca.eslogan),
    h('div', { class: 'row' }, h('div', { class: 'total' }, finalNum, ui.minutosDevueltosTotal), cta),
  );
  ctx.captions.appendChild(finalEl);
  s.onTick((t) => {
    finalNum.textContent = String(Math.round(hudState.minutos));
    // la Q queda flotando en reposo
    q.rotation.y = q.visible && !s.reducedMotion ? Math.sin(t * 0.35) * 0.12 : 0;
  });

  /* ================================================================ */
  /* 1 · Apertura: del vacío negro se forma la Q.                     */
  /* ================================================================ */
  {
    const tl = T();
    const c = caption(ctx, m[0].frases[0]);
    tl.to(q, { reveal: 1, duration: 2.4, ease: 'power2.out' }, 0.2);
    cam(tl, ctx, { z: 22 }, 0, 2.6);
    show(tl, c, 1.4);
    cx.c1 = c;
  }

  /* ================================================================ */
  /* 2 · El problema. Consecuencia de 1: el cuerpo de la Q se vuelve  */
  /*     el marco del teléfono. Chats sin responder, cuaderno, un     */
  /*     cliente que se va. Cierra con el eslogan.                    */
  /* ================================================================ */
  {
    const tl = T();
    hide(tl, cx.c1, 0);
    tl.to(frame.shape, { opacity: 1, duration: 0.5, ease: 'none' }, 0.1);
    tl.to(q, { opacity: 0, duration: 0.6, ease: 'power1.in' }, 0.35);
    tl.to(frame.position, { x: 2.6, y: 0, duration: 1.6, ease: E }, 0.5);
    tl.to(frame.shape, { w: PHONE.w, h: PHONE.h, r: PHONE.radius, t: 0.07, glow: 0.9, duration: 1.6, ease: E }, 0.5);
    tl.to(P, { opacity: 1, duration: 0.9, ease: 'power1.inOut' }, 1.5);
    tl.to(frame.shape, { opacity: 0.35, glow: 0.25, duration: 0.8 }, 2.0);
    tl.to(ctx.bg, { glow: 1, duration: 2.2, ease: 'none' }, 0.8);
    cam(tl, ctx, { z: 24, y: 0.2 }, 0.3, 2.2);

    const c = caption(ctx, m[1].frases[0], 'left');
    show(tl, c, 2.0);
    burbujas.forEach((b, i) => {
      const at = 2.3 + i * 0.35;
      tl.fromTo(b.obj.scale, { x: bScale * 0.6, y: bScale * 0.6 }, { x: bScale, y: bScale, duration: 0.6, ease: 'back.out(1.4)', immediateRender: false }, at);
      fade(tl, b.el, 1, at, 0.4);
    });
    fade(tl, cuadernoF.el, 1, 3.0, 0.8);
    tl.fromTo(cuadernoF.home, { y: -3.2 }, { y: -2.3, duration: 1, ease: 'power2.out', immediateRender: false }, 3.0);
    // el cliente aparece… y se desvanece sin que nadie lo note
    fade(tl, seVa.el, 1, 3.6, 0.8);
    tl.to(seVa.obj.position, { x: 12.6, z: -5, duration: 2.4, ease: 'power1.in' }, 4.6);
    tl.to(seVa.el, { opacity: 0, filter: 'blur(6px)', duration: 2.0, ease: 'power1.in' }, 5.0);
    const esl = caption(ctx, marca.eslogan, 'left');
    hide(tl, c, 6.6);
    show(tl, esl, 7.2);
    cx.c2 = esl;
  }

  /* ================================================================ */
  /* 3 · Agenda. Consecuencia de 2: las burbujas son absorbidas por   */
  /*     el teléfono, que se enciende con la Agenda. La cámara entra. */
  /* ================================================================ */
  {
    const tl = T();
    hide(tl, cx.c2, 0);
    state(tl, 0, { n: {} });
    burbujas.forEach((b, i) => {
      const at = 0.1 + i * 0.09;
      tl.to(b.home, { x: 2.6, y: 0, z: 0.3, duration: 0.9, ease: 'power3.in' }, at);
      tl.to(b.obj.scale, { x: bScale * 0.1, y: bScale * 0.1, duration: 0.9, ease: 'power3.in' }, at);
      tl.to(b.el, { opacity: 0, duration: 0.25, ease: 'none' }, at + 0.7);
    });
    tl.to(cuadernoF.home, { x: 2.6, y: 0, z: 0.3, duration: 1, ease: 'power3.in' }, 0.35);
    tl.to(cuadernoF.obj.scale, { x: cScale * 0.1, y: cScale * 0.1, duration: 1, ease: 'power3.in' }, 0.35);
    tl.to(cuadernoF.el, { opacity: 0, duration: 0.25 }, 1.1);
    // destello de encendido
    tl.to(frame.shape, { opacity: 1, glow: 1.2, duration: 0.25 }, 1.1);
    tl.to(P, { screenOn: 1, duration: 0.7, ease: 'power1.out' }, 1.2);
    tl.to(frame.shape, { opacity: 0, glow: 0.3, duration: 0.8 }, 1.4);
    tl.to([P.position, frame.position], { x: 0, duration: 1.8, ease: E }, 1.2);
    cam(tl, ctx, { z: 17.5, y: 0.1, float: 0.5 }, 1.1, 2.2);
    const c = caption(ctx, m[2].frases[0], 'left');
    show(tl, c, 2.6);
    tl.to(hudState, { muestra: 1, duration: 0.8 }, 2.4);
    // Llega un WhatsApp de Luis a la agenda: su botón "Escribir" es la consecuencia.
    state(tl, 3.6, { n: { aviso: true } });
    cx.c3 = c;
  }

  /* ================================================================ */
  /* 4 · Agente de WhatsApp. Consecuencia de 3: se toca "Escribir" y  */
  /*     el chat se expande hasta salir del teléfono: es el teléfono  */
  /*     del cliente. Al confirmar, una luz lleva la cita a la agenda.*/
  /* ================================================================ */
  const poseCliente4: Pose = { x: -3.4, y: 0, z: 0, ry: 0.14 };
  {
    const tl = T();
    hide(tl, cx.c3, 0);
    state(tl, 0, { n: { aviso: true }, nFx: () => N.q('[data-escribir-aviso]')?.classList.add('tap') });
    tl.set(C.position, { x: poseCliente4.x, y: 0, z: 0 }, 0);
    tl.set(C.rotation, { x: 0, y: poseCliente4.ry }, 0);
    chatFlyer.fly(
      tl,
      0.35,
      () => P.elWorld(N.q('[data-aviso]')),
      () => atPose(C, poseCliente4, () => C.screenToWorld(195, 422, 0.03)),
      { dur: 1.3, sFrom: 0.22, sTo: 1, arc: 1.4, ease: 'power3.inOut' },
    );
    tl.fromTo(chatFlyer.f.obj.rotation, { y: 0 }, { y: poseCliente4.ry!, duration: 1.3, ease: E, immediateRender: false }, 0.35);
    pose(tl, P, { x: 3.4, ry: -0.14 }, 0.2);
    cam(tl, ctx, { z: 21, y: 0, float: 1 }, 0);
    const conv = conversacionAgente;
    const chatN = (k: number, typing: null | 'cliente' | 'agente'): DemoNegocio['chat'] => ({
      nombre: 'Luis Duarte',
      msgs: conv.slice(0, k + 1).map((x) => ({ de: x.de, texto: x.texto }) as Mensaje),
      typing,
    });
    // el teléfono del cliente se arma alrededor del chat que llegó
    state(tl, 1.3, { capa: 'whatsapp', w: toWa(conv.slice(0, 1)), wTyping: 'otro', n: { chat: chatN(0, 'agente') } });
    tl.to(C, { opacity: 1, screenOn: 1, duration: 0.5 }, 1.35);
    // la conversación: el agente responde solo
    const t0 = 2.3;
    const step = 1.55;
    for (let k = 1; k < conv.length; k++) {
      const next = conv[k + 1]?.de ?? null;
      state(tl, t0 + (k - 1) * step, {
        w: toWa(conv.slice(0, k + 1)),
        wTyping: next === 'agente' ? 'otro' : next === 'cliente' ? 'yo' : null,
        n: { chat: chatN(k, next) },
      });
    }
    const c = caption(ctx, m[3].frases[0], 'top small');
    show(tl, c, t0 + 0.4);
    // Confirmada: la luz viaja del teléfono del cliente a la agenda y aparece la cita.
    const tConf = t0 + (conv.length - 2) * step + 0.8;
    beam.travel(tl, tConf, () => C.elWorld(W.lastEl()), () => P.screenToWorld(195, 420), 1.1, 1.6);
    state(tl, tConf + 0.9, {
      n: {
        dia: citaNuevaAgenteDia,
        extra: [[citaNuevaAgenteDia, citaNuevaAgente]],
        nuevas: [citaNuevaAgente.id],
        scroll: `[data-cita="${citaNuevaAgente.id}"]`,
      },
    });
    tl.to(hudState, { contador: 1, duration: 0.6 }, tConf + 0.6);
    addMinutes(tl, minutosHasta(4), tConf + 0.9);
    cx.c4 = c;
  }

  /* ================================================================ */
  /* 5 · El tiempo pasa: semanas sobre la agenda; los clientes que no */
  /*     vuelven se apagan uno por uno. Carlos se apaga.              */
  /* ================================================================ */
  const agendaLuis: DemoNegocio = { extra: [[citaNuevaAgenteDia, citaNuevaAgente]] };
  {
    const tl = T();
    hide(tl, cx.c4, 0);
    pose(tl, C, { x: -10, z: -4 }, 0, 1.6);
    tl.to(C, { opacity: 0, duration: 1 }, 0.3);
    state(tl, 0.2, { n: { ...agendaLuis } });
    pose(tl, P, { x: 0, y: -4.2, z: -1.2, rx: -1.3, ry: 0 }, 0.1, 2.2);
    cam(tl, ctx, { x: 0, y: 5.2, z: 19, ty: 0.6, tx: 0, float: 0.6 }, 0, 2.4);
    tl.to(dots.p, { show: 1, duration: 0.9 }, 1.2);
    semanaLabels.forEach((f, i) => fade(tl, f.el, 0.8, 1.3 + i * 0.05, 0.5));
    fade(tl, carlosTag.el, 1, 1.6, 0.6);
    const wDur = 5.2;
    tl.to(dots.p, { week: lineaTiempo.semanas, duration: wDur, ease: 'none' }, 2.0);
    // Carlos se apaga (en la semana 6.4 de 8)
    const tOff = 2.0 + wDur * (6.4 / lineaTiempo.semanas);
    fade(tl, carlosTag.el, 0, tOff, 0.4);
    fade(tl, carlosTagLost.el, 1, tOff + 0.2, 0.5);
    const c = caption(ctx, m[4].frases[0], 'top small');
    show(tl, c, 1.4);
    cx.c5 = c;
  }

  /* ================================================================ */
  /* 6 · Cliente en riesgo. Consecuencia de 5: la cámara se acerca al */
  /*     punto apagado de Carlos, que se abre en su tarjeta.          */
  /* ================================================================ */
  const poseRiesgo: Pose = { x: 2.7, y: 0, z: 0, rx: 0, ry: -0.08 };
  {
    const tl = T();
    hide(tl, cx.c5, 0);
    state(tl, 0, { n: { ...agendaLuis, tab: 'clientes', filtroCli: 'En riesgo' } });
    const cw = carlosWorld();
    cam(tl, ctx, { x: cw.x, y: cw.y + 0.3, z: cw.z + 6.5, tx: cw.x, ty: cw.y, float: 0.3 }, 0, 1.4);
    tl.to(zoom, { v: 1, duration: 1.2, ease: 'power2.in' }, 0.1);
    semanaLabels.forEach((f) => fade(tl, f.el, 0, 0.1, 0.5));
    fade(tl, carlosTagLost.el, 0, 0.3, 0.5);
    // el punto se abre en la tarjeta de Carlos y vuela a la pantalla
    cardFlyer.fly(tl, 1.1, carlosWorld, () => atPose(P, poseRiesgo, () => P.elWorld(N.q('[data-riesgo]'), 0.05)), {
      dur: 1.6,
      sFrom: 0.2,
      sTo: 1,
      arc: 0.4,
      ease: 'power2.inOut',
      prep: () => {
        const src = N.q('[data-riesgo]');
        cardBox.replaceChildren(src ? (src.cloneNode(true) as HTMLElement) : h('div'));
      },
    });
    tl.to(dots.p, { show: 0, duration: 0.6 }, 1.3);
    pose(tl, P, poseRiesgo, 1.0, 1.7);
    cam(tl, ctx, { x: 0, y: 0, z: 17, tx: 0.6, ty: 0, float: 0.6 }, 1.3, 1.6);
    const c = caption(ctx, m[5].frases[0], 'left');
    show(tl, c, 2.5);
    cx.c6 = c;
  }

  /* ================================================================ */
  /* 7 · Cobrar. Consecuencia de 6: el mensaje viaja al teléfono del  */
  /*     cliente, Carlos responde y su punto vuelve a la agenda con   */
  /*     una cita nueva. Luego, vuelta a la agenda de hoy.            */
  /* ================================================================ */
  const poseCliente7: Pose = { x: -3.6, y: 0, z: 0, ry: 0.14 };
  const agendaConCarlos: DemoNegocio = {
    extra: [
      [citaNuevaAgenteDia, citaNuevaAgente],
      [citaCarlosDia, citaCarlos],
    ],
  };
  const chatCarlos = [
    { de: 'otro' as const, texto: mensajeCarlos },
    { de: 'yo' as const, texto: respuestaCarlos },
    { de: 'otro' as const, texto: confirmacionCarlos },
  ];
  {
    const tl = T();
    hide(tl, cx.c6, 0);
    state(tl, 0, { n: { ...agendaLuis, tab: 'clientes', filtroCli: 'En riesgo', carlos: 'enviado' }, capa: 'whatsapp', w: [], wTyping: null });
    tl.set(C.position, { x: poseCliente7.x, y: -1.2, z: -1 }, 0);
    tl.set(C.rotation, { x: 0, y: poseCliente7.ry }, 0);
    tl.to(C, { opacity: 1, screenOn: 1, duration: 0.7 }, 0.1);
    pose(tl, C, poseCliente7, 0.1, 1.2);
    pose(tl, P, { x: 3.2, ry: -0.12 }, 0, 1.2);
    cam(tl, ctx, { z: 20.5, tx: 0, ty: 0, x: 0, y: 0, float: 0.8 }, 0, 1.4);
    msgFlyer.fly(tl, 1.0, () => P.elWorld(N.q('[data-draft]')), () => atPose(C, poseCliente7, () => C.screenToWorld(200, 190, 0.05)), { dur: 1.2, arc: 1.2 });
    state(tl, 2.1, { w: chatCarlos.slice(0, 1), wTyping: 'yo' });
    state(tl, 3.4, { w: chatCarlos.slice(0, 2), wTyping: null, n: { ...agendaLuis, tab: 'clientes', filtroCli: 'En riesgo', carlos: 'respondio' } });
    // su punto se enciende y vuelve a la agenda con la cita nueva
    beam.travel(tl, 3.7, () => C.elWorld(W.lastEl()), () => P.screenToWorld(195, 420), 1.1, 1.4);
    dotFlyer.fly(tl, 3.7, () => C.elWorld(W.lastEl(), 0.1), () => P.screenToWorld(195, 470, 0.1), { dur: 1.1, arc: 1.4 });
    state(tl, 4.8, {
      n: { ...agendaConCarlos, dia: citaCarlosDia, nuevas: [citaCarlos.id], carlos: 'respondio', scroll: `[data-cita="${citaCarlos.id}"]` },
      w: chatCarlos,
    });
    addMinutes(tl, minutosHasta(6), 4.9);
    // vuelta a la agenda de hoy: toca cobrar
    pose(tl, C, { x: -10, z: -4 }, 6.6, 1.6);
    tl.to(C, { opacity: 0, duration: 0.9 }, 6.9);
    pose(tl, P, { x: 0, ry: 0 }, 6.6, 1.8);
    cam(tl, ctx, { z: 17.5, tx: 0, float: 0.5 }, 6.6, 1.8);
    state(tl, 7.1, { n: { ...agendaConCarlos, carlos: 'respondio' } });
    const c = caption(ctx, m[6].frases[0], 'left');
    show(tl, c, 7.8);
    cx.c7 = c;
  }

  /* ================================================================ */
  /* 8 · Ventas y finanzas. Consecuencia de 7: el monto se desprende  */
  /*     del botón y vuela a la pestaña Ventas; cae en el total y se  */
  /*     descompone por método, hasta el Neto de la semana.           */
  /* ================================================================ */
  // El método de cobro lo elige el presentador en vivo: `cobradas` se lee al aplicar el estado.
  const cobradas: [string, Metodo][] = [['a6', 'efectivo']];
  Object.defineProperty(cobradas[0], 1, { get: () => demo.metodo, enumerable: true });
  const cobrada = (): DemoNegocio => ({ ...agendaConCarlos, carlos: 'respondio', cobradas });
  {
    const tl = T();
    hide(tl, cx.c7, 0);
    state(tl, 0, { n: { ...agendaConCarlos, carlos: 'respondio' }, nFx: () => N.q('.next-card [data-cobrar]')?.classList.add('tap') });
    chipFlyer.fly(tl, 0.15, () => P.elWorld(N.q('.next-card [data-cobrar]'), 0.08), () => P.elWorld(N.q('[data-tab=ventas]'), 0.08), {
      dur: 1.2,
      arc: 0.5,
      sFrom: 1.1,
      sTo: 0.7,
      prep: () => (chipTxt.textContent = RD(600)),
    });
    state(tl, 0.3, { n: cobrada() });
    state(tl, 1.35, { n: { ...cobrada(), tab: 'ventas', ventas: 'hoy', anim: 'ventas', countFrom: 3400 } });
    addMinutes(tl, minutosHasta(7), 1.4);
    pose(tl, P, { x: -2.8, ry: 0.1 }, 1.6, 1.6);
    cam(tl, ctx, { z: 18, tx: -0.4 }, 1.6, 1.6);
    state(tl, 3.6, { n: { ...cobrada(), tab: 'ventas', ventas: 'finanzas', periodo: 'semana', anim: 'finanzas' } });
    const c = caption(ctx, m[7].frases[0], 'right');
    show(tl, c, 3.2);
    addMinutes(tl, minutosHasta(8), 4.6);
    cx.c8 = c;
  }

  /* ================================================================ */
  /* 9 · Equipo e insumos. Consecuencia de 8: del total se separan    */
  /*     las porciones de cada profesional.                           */
  /* ================================================================ */
  const finanzas = (): DemoNegocio => ({ ...cobrada(), tab: 'ventas', ventas: 'finanzas', periodo: 'semana' });
  {
    const tl = T();
    hide(tl, cx.c8, 0);
    state(tl, 0, { n: finanzas(), nFx: () => N.q('[data-l=equipo]')?.classList.add('hl') });
    pose(tl, P, { x: -3.8, ry: 0.12 }, 0.2, 1.6);
    cam(tl, ctx, { z: 20, tx: 0, float: 0.8 }, 0.2, 1.6);
    proChips.forEach((chip, i) => {
      const at = 0.5 + i * 0.22;
      chip.fly(tl, at, () => P.elWorld(N.q('[data-l=equipo]'), 0.08), () => proFloats[i].obj.position.clone().add(new THREE.Vector3(-0.8, 0.9, 0.1)), {
        dur: 1.3,
        arc: 1,
        sFrom: 0.8,
        sTo: 1,
      });
      fade(tl, proFloats[i].el, 1, at + 1.0, 0.5);
      tl.fromTo(proFloats[i].obj.position, { x: 4.4 }, { x: 3.6, duration: 0.7, ease: 'power2.out', immediateRender: false }, at + 1.0);
    });
    state(tl, 2.6, { n: { ...finanzas(), insumos: true, scroll: '[data-insumos]' } });
    const c = caption(ctx, m[8].frases[0], 'top small');
    show(tl, c, 2.0);
    addMinutes(tl, minutosHasta(9), 2.4);
    cx.c9 = c;
  }

  /* ================================================================ */
  /* 10 · App del cliente. Consecuencia de 9: el teléfono del negocio */
  /*      se aleja y gira; detrás aparece el del cliente en su app.   */
  /* ================================================================ */
  {
    const tl = T();
    hide(tl, cx.c9, 0);
    proFloats.forEach((f, i) => fade(tl, f.el, 0, 0.05 * i, 0.5));
    state(tl, 0, { capa: 'quovix', k: { paso: 'bienvenida' } });
    pose(tl, P, { x: 5.8, z: -6, ry: -2.2 }, 0.1, 2.3);
    tl.to(P, { opacity: 0.25, duration: 1.6 }, 0.7);
    tl.set(C.position, { x: 0, y: 0, z: -6 }, 0);
    tl.set(C.rotation, { x: 0, y: 0 }, 0);
    tl.to(C, { opacity: 1, screenOn: 1, duration: 1.0 }, 0.6);
    pose(tl, C, { z: 0 }, 0.5, 2.0);
    cam(tl, ctx, { z: 17.5, tx: 0, float: 0.5 }, 0.2, 2.2);
    // Entrada por código de WhatsApp → inicio → Mis citas
    state(tl, 3.4, { k: { paso: 'numero' } });
    state(tl, 4.6, { k: { paso: 'codigo', animar: true } });
    state(tl, 6.6, { k: { paso: 'nombre', animar: true } });
    state(tl, 8.4, { k: { paso: 'app' } });
    state(tl, 10.8, { k: { paso: 'app', scroll: 1 }, kFx: () => K.scrollBody(560) });
    state(tl, 12.8, { k: { paso: 'app', tab: 'citas' } });
    addMinutes(tl, minutosHasta(10), 9.0);
    tl.to({}, { duration: 0.6 }, 13.2);
  }

  /* ================================================================ */
  /* 11 · Asistente IA. Consecuencia de 10: un destello sale del      */
  /*      teléfono del cliente hacia la burbuja en la app del negocio.*/
  /* ================================================================ */
  {
    const tl = T();
    state(tl, 0, { n: { ...cobrada(), burbuja: [true, false] }, sup: 0 });
    pose(tl, C, { x: -5.6, ry: 0.24 }, 0, 1.8);
    pose(tl, P, { x: 0, z: 0, ry: 0, rx: 0 }, 0, 1.8);
    tl.to(P, { opacity: 1, duration: 1.2 }, 0.2);
    cam(tl, ctx, { z: 21, tx: 0, float: 0.9 }, 0, 1.8);
    beam.travel(tl, 1.9, () => C.screenToWorld(195, 300), () => P.elWorld(N.q('[data-ai-ball]'), 0.05), 1.0, 1.4);
    state(tl, 2.8, { n: { ...cobrada(), burbuja: [true, true] }, nFx: () => N.q('[data-ai-ball]')?.classList.add('flash') });
    const c = caption(ctx, m[10].frases[0], 'top small');
    show(tl, c, 3.0);
    // Debajo: el bot de soporte sugiere y crea un ticket.
    fade(tl, soporteF.el, 1, 4.0, 0.6);
    tl.fromTo(soporteF.obj.position, { y: -0.8 }, { y: 0.2, duration: 0.8, ease: 'power2.out', immediateRender: false }, 4.0);
    [1, 2, 3, 4].forEach((k, i) => state(tl, 4.9 + i * 1.1, { sup: k }));
    addMinutes(tl, minutosHasta(11), 3.4);
    cx.c11 = c;
  }

  /* ================================================================ */
  /* 12 · Próximamente. Los teléfonos se ordenan en línea y se apagan;*/
  /*      queda una silueta en penumbra a la derecha.                 */
  /* ================================================================ */
  {
    const tl = T();
    hide(tl, cx.c11, 0);
    fade(tl, soporteF.el, 0, 0, 0.6);
    state(tl, 0, { sup: 4 });
    pose(tl, C, { x: -5.2, y: 0, z: 0, ry: 0 }, 0.1, 1.6);
    pose(tl, P, { x: 0, y: 0, z: 0, ry: 0 }, 0.1, 1.6);
    tl.to([C, P], { screenOn: 0, duration: 0.9 }, 1.1);
    tl.to([C, P], { opacity: 0.09, duration: 1.2 }, 1.5);
    tl.set(frame.position, { x: ghostX, y: 0, z: 0 }, 0);
    tl.set(frame.shape, { w: PHONE.w, h: PHONE.h, r: PHONE.radius, t: 0.05, glow: 0.3, fill: 0.04 }, 0);
    tl.to(frame.shape, { opacity: 0.45, duration: 1.4 }, 1.4);
    fade(tl, fantasma.el, 1, 2.2, 0.9);
    cam(tl, ctx, { z: 22.5, tx: 0, float: 0.8 }, 0, 1.8);
  }

  /* ================================================================ */
  /* 13 · Planes y cierre. La silueta se disuelve en partículas que   */
  /*      se reagrupan formando la Q.                                 */
  /* ================================================================ */
  {
    const tl = T();
    fade(tl, fantasma.el, 0, 0, 0.5);
    tl.to([C, P], { opacity: 0, duration: 1.0 }, 0);
    tl.to(particles.p, { alpha: 1, duration: 0.4 }, 0.2);
    tl.to(frame.shape, { opacity: 0, duration: 0.6 }, 0.3);
    tl.to(particles.p, { mix: 1, duration: 2.6, ease: 'power2.inOut' }, 0.3);
    tl.set(q.position, { x: qFinal.x, y: qFinal.y, z: 0 }, 0);
    tl.set(q.scale, { x: qFinal.scale, y: qFinal.scale, z: 1 }, 0);
    tl.set(q, { reveal: 1 }, 0);
    tl.fromTo(q, { opacity: 0 }, { opacity: 1, duration: 0.9, immediateRender: false }, 2.5);
    tl.to(particles.p, { alpha: 0, duration: 0.8 }, 2.8);
    cam(tl, ctx, { z: 24, y: 0, ty: 0, tx: 0, x: 0, float: 1 }, 0, 2);
    tl.to(hudState, { muestra: 0, contador: 0, duration: 0.6 }, 0.4);
    // autoAlpha: mientras no se ve, tampoco recibe clics.
    tl.fromTo(finalEl, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1.2, ease: motion.easeSalida, immediateRender: false }, 3.0);
  }

  return tls;
}

/* ------------------------------------------------------------------ */
/* Estado inicial: vacío negro.                                        */
/* ------------------------------------------------------------------ */
export function initialState(ctx: Ctx): void {
  const B = QMark.BODY;
  const S = QMark.SIZE;
  ctx.q.position.set(0, 0.6, 0);
  ctx.q.scale.set(1, 1, 1);
  ctx.q.reveal = 0;
  ctx.q.opacity = 1;
  // El marco de luz nace con la forma exacta del cuerpo de la Q.
  ctx.frame.position.set(ctx.q.position.x + B.cx * S, ctx.q.position.y + B.cy * S, 0.01);
  Object.assign(ctx.frame.shape, { w: B.w * S, h: B.h * S, r: B.h * S * 0.42, t: B.stroke * S, opacity: 0, glow: 0.5, fill: 0 });
  ctx.negocio.position.set(2.6, 0, 0);
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
  ctx.apps.negocio.setDemo({});
  ctx.apps.cliente.setDemo({ paso: 'bienvenida' });
  ctx.apps.wa.set([]);
  ctx.apps.pantallaCliente.show('quovix');
}
