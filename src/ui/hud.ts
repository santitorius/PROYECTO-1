import { ui } from '../content.es';
import type { MomentState } from '../core/moments';

/** Valores animables del HUD (las timelines los tweenean, así también retroceden). */
export const hudState = {
  minutos: 0,
  contador: 0, // opacidad del contador
  muestra: 0, // opacidad del aviso "Datos de ejemplo"
};

const CLOCK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/><path d="M4 4l2 2" opacity=".5"/></svg>`;

export class Hud {
  private dots: HTMLElement[] = [];
  private progress: HTMLElement;
  private counterEl: HTMLElement;
  private counterNum: HTMLElement;
  private sampleEl: HTMLElement;
  private autoEl: HTMLElement;
  private last = { minutos: -1, contador: -1, muestra: -1 };

  constructor(root: HTMLElement, total: number) {
    const progress = (this.progress = document.createElement('div'));
    progress.className = 'progress';
    for (let i = 0; i < total; i++) {
      const d = document.createElement('i');
      progress.appendChild(d);
      this.dots.push(d);
    }

    this.counterEl = document.createElement('div');
    this.counterEl.className = 'counter';
    this.counterEl.style.color = 'var(--qx-turquesa)';
    this.counterEl.innerHTML = `${CLOCK_ICON}<b>0</b><span style="color:var(--qx-texto-suave)">${ui.minutosDevueltos}</span>`;
    this.counterNum = this.counterEl.querySelector('b')!;

    this.sampleEl = document.createElement('div');
    this.sampleEl.className = 'sample-badge';
    this.sampleEl.textContent = ui.datosDeEjemplo;

    this.autoEl = document.createElement('div');
    this.autoEl.className = 'auto-badge';
    this.autoEl.textContent = ui.modoAuto;

    root.append(progress, this.counterEl, this.sampleEl, this.autoEl);
  }

  update(s: MomentState): void {
    this.dots.forEach((d, i) => {
      d.classList.toggle('on', i === s.current - 1);
      d.classList.toggle('done', i < s.current - 1);
    });
    this.autoEl.classList.toggle('on', s.auto);
    // En el negro inicial no se ve nada, ni siquiera el progreso.
    this.progress.style.opacity = s.current === 0 && !s.animating ? '0' : '1';
  }

  /** Se llama cada frame; solo toca el DOM si algo cambió. */
  tick(): void {
    const m = Math.round(hudState.minutos);
    if (m !== this.last.minutos) {
      this.counterNum.textContent = String(m);
      this.last.minutos = m;
    }
    if (hudState.contador !== this.last.contador) {
      this.counterEl.style.opacity = String(hudState.contador);
      this.last.contador = hudState.contador;
    }
    if (hudState.muestra !== this.last.muestra) {
      this.sampleEl.style.opacity = String(hudState.muestra);
      this.last.muestra = hudState.muestra;
    }
  }
}
