import './styles/fonts.css';
import './styles/base.css';
import './styles/screens.css';
import { gsap } from 'gsap';
import { applyTokens } from './tokens';
import { ui } from './content.es';
import { Stage } from './core/stage';
import { Scene3D, webglAvailable } from './core/scene';
import { Phone } from './core/phone';
import { QMark, LightFrame } from './core/qmark';
import { MomentController } from './core/moments';
import { buildTimelines, initialState, type Ctx } from './moments';
import { Hud, hudState } from './ui/hud';
import { Presenter } from './ui/presenter';
import { GotoOverlay, Overview, toast } from './ui/overlays';
import { lockScreen, clientSplash } from './screens/placeholder';

applyTokens();

const $ = (id: string) => document.getElementById(id)!;
const stageEl = $('stage');
const stage = new Stage(stageEl);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!webglAvailable()) {
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

  const negocio = new Phone('negocio', lockScreen(), s);
  const cliente = new Phone('cliente', clientSplash(), s);
  s.scene.add(negocio, cliente);

  const bgEl = $('bg');
  const ctx: Ctx = { s, q, frame, negocio, cliente, captions: $('captions'), bg: { glow: 0 } };
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

  const moments = new MomentController(buildTimelines(ctx));
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

  // Clic en el escenario = siguiente. Los clics dentro de las pantallas son interacción, no avanzan.
  stageEl.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('.screen, .interactive, .overlay')) return;
    moments.next();
  });

  // Acceso para depurar desde la consola.
  (window as unknown as { quovix: unknown }).quovix = { moments, ctx };
}

function toggleFullscreen(): void {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.().catch(() => {});
}
