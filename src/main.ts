import './styles/fonts.css';
import './styles/base.css';
import './styles/screens.css';
import './styles/app.css';
import './styles/scene.css';
import { gsap } from 'gsap';
import { applyTokens } from './tokens';
import { ui } from './content.es';
import { Stage } from './core/stage';
import { Scene3D, webglAvailable } from './core/scene';
import { Phone } from './core/phone';
import { QMark, LightFrame } from './core/qmark';
import { MomentController } from './core/moments';
import { buildTimelines, initialState, demo, type Ctx } from './moments';
import { Hud, hudState } from './ui/hud';
import { Presenter } from './ui/presenter';
import { GotoOverlay, Overview, toast } from './ui/overlays';
import { createNegocioApp } from './screens/negocio';
import { createClienteApp } from './screens/cliente';
import { createWhatsApp } from './screens/whatsapp';
import { createStack } from './screens/stack';
import { startPreview } from './preview';

applyTokens();

const $ = (id: string) => document.getElementById(id)!;
const stageEl = $('stage');
const stage = new Stage(stageEl);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

if (location.hash === '#pantallas') {
  startPreview(stageEl);
} else if (!webglAvailable()) {
  // [Etapa 4] versión 2D completa con los mismos momentos.
  toast(stageEl, ui.sinWebGL);
} else {
  start();
}

function start(): void {
  const s = new Scene3D($('webgl'), $('css3d'), stage);
  s.reducedMotion = reduced.matches;

  const q = new QMark();
  const frame = new LightFrame();
  s.scene.add(q, frame);

  // Pantallas reales (DOM): la app del negocio y, en el teléfono del cliente, WhatsApp y la app Quovix.
  // Los botones reales disparan la consecuencia (el siguiente momento) cuando corresponde.
  let moments!: MomentController;
  const enPausa = (n: number) => moments && moments.current === n && !moments.state().animating;
  const appNegocio = createNegocioApp({
    escribir: (cita) => {
      if (cita === null && enPausa(3)) return moments.next(), true;
    },
    enviarCarlos: () => {
      if (enPausa(6)) return moments.next(), true;
    },
    cobrar: (cita, metodo) => {
      if (cita.id === 'a6' && enPausa(7)) {
        demo.metodo = metodo;
        return moments.next(), true;
      }
    },
  });
  const appCliente = createClienteApp();
  const wa = createWhatsApp();
  const pantallaCliente = createStack({ whatsapp: wa.el, quovix: appCliente.el }, 'quovix');
  const negocio = new Phone('negocio', appNegocio.el, s);
  const cliente = new Phone('cliente', pantallaCliente.el, s);
  s.scene.add(negocio, cliente);

  const bgEl = $('bg');
  const ctx: Ctx = {
    s,
    q,
    frame,
    negocio,
    cliente,
    apps: { negocio: appNegocio, cliente: appCliente, wa, pantallaCliente },
    captions: $('captions'),
    bg: { glow: 0 },
  };
  initialState(ctx);

  const hud = new Hud($('hud'), 13);
  let lastGlow = -1;
  s.onTick(() => {
    frame.sync();
    hud.tick();
    if (ctx.bg.glow !== lastGlow) {
      bgEl.style.opacity = String(ctx.bg.glow);
      lastGlow = ctx.bg.glow;
    }
  });

  moments = new MomentController(buildTimelines(ctx));
  const applySpeed = () => {
    s.reducedMotion = reduced.matches;
    // Movimiento reducido: mismas escenas, transiciones más cortas y sin flotación.
    moments.speed = reduced.matches ? 2.5 : 1;
  };
  reduced.addEventListener('change', applySpeed);
  applySpeed();

  const presenter = new Presenter(handleKey, (msg) => toast(stageEl, msg));
  const gotoBox = new GotoOverlay(stageEl, (n) => moments.goTo(n));
  const overview = new Overview(stageEl, (n) => moments.goTo(n));

  moments.onChange((st) => {
    hud.update(st);
    presenter.update(st, hudState.minutos);
    if (st.current > 0) presenter.markStart();
  });
  gsap.ticker.add(() => presenter.setMinutes(hudState.minutos));

  function handleKey(e: KeyboardEvent): void {
    if (gotoBox.isOpen) return;
    const k = e.key;
    if (overview.isOpen && k !== 'Escape') return;
    switch (k) {
      case 'ArrowRight':
      case 'PageDown': // clickers de presentación
      case ' ':
      case 'Enter':
        e.preventDefault?.();
        moments.next();
        break;
      case 'ArrowLeft':
      case 'PageUp':
      case 'Backspace':
        e.preventDefault?.();
        moments.prev();
        break;
      case 'p':
      case 'P':
        presenter.toggle();
        break;
      case 'g':
      case 'G':
        e.preventDefault?.();
        overview.close();
        gotoBox.open();
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      case 'a':
      case 'A':
        moments.setAuto(!moments.auto);
        break;
      case 'Escape':
        overview.toggle(moments.current);
        break;
      case 'Home':
        moments.goTo(0);
        break;
      case 'End':
        moments.goTo(moments.total);
        break;
    }
  }

  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    handleKey(e);
  });

  // Tocar un botón de la pantalla no debe robar el foco (así espacio/Enter siguen avanzando).
  stageEl.addEventListener('mousedown', (e) => {
    if ((e.target as HTMLElement).closest('.screen')) e.preventDefault();
  });

  // Clic en el escenario = siguiente. Los clics dentro de las pantallas son interacción, no avanzan.
  stageEl.addEventListener('click', (e) => {
    // composedPath() se fija al empezar el evento: sirve aunque la pantalla ya haya redibujado el botón.
    const dentro = e
      .composedPath()
      .some((n) => n instanceof HTMLElement && n.matches('.screen, .interactive, .overlay'));
    if (dentro) return;
    moments.next();
  });

  // Acceso para depurar desde la consola.
  (window as unknown as { quovix: unknown }).quovix = { moments, ctx };
}

function toggleFullscreen(): void {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.().catch(() => {});
}
