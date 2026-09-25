import { stage as S } from '../tokens';

/**
 * Escenario fijo de 1920x1080. Se escala para caber en la ventana (proyector o laptop)
 * y deja barras negras si la proporción no coincide.
 */
export class Stage {
  readonly el: HTMLElement;
  scale = 1;
  private listeners: ((scale: number) => void)[] = [];

  constructor(el: HTMLElement) {
    this.el = el;
    window.addEventListener('resize', () => this.fit());
    this.fit();
  }

  onResize(fn: (scale: number) => void): void {
    this.listeners.push(fn);
  }

  fit(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.scale = Math.min(w / S.width, h / S.height);
    this.el.style.transform = `scale(${this.scale}) translate(-50%, -50%)`;
    this.listeners.forEach((fn) => fn(this.scale));
  }
}
