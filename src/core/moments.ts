import { gsap } from 'gsap';
import { motion } from '../tokens';

export type Dir = 'forward' | 'reverse' | 'idle';

export interface MomentState {
  /** momentos completados: 0 = negro inicial, 13 = cierre */
  current: number;
  total: number;
  animating: boolean;
  dir: Dir;
  auto: boolean;
}

/**
 * Sistema de momentos.
 * timelines[k] lleva la escena del momento k al momento k+1 (k = 0 es el negro inicial).
 * Avanzar reproduce la timeline; retroceder la reproduce al revés (sin saltos).
 * Todas las timelines son continuas: nunca hay cortes entre momentos.
 */
export class MomentController {
  current = 0;
  auto = false;
  private pending = 0;
  private autoCall: gsap.core.Tween | null = null;
  private listeners: ((s: MomentState) => void)[] = [];
  private active: gsap.core.Timeline | null = null;
  private dir: Dir = 'idle';
  /** multiplicador global de velocidad (prefers-reduced-motion lo sube) */
  speed = 1;

  constructor(private readonly timelines: gsap.core.Timeline[]) {
    timelines.forEach((tl, i) => {
      tl.pause();
      tl.eventCallback('onComplete', () => this.finished(i, 'forward'));
      tl.eventCallback('onReverseComplete', () => this.finished(i, 'reverse'));
    });
  }

  get total(): number {
    return this.timelines.length;
  }

  onChange(fn: (s: MomentState) => void): void {
    this.listeners.push(fn);
    fn(this.state());
  }

  state(): MomentState {
    return { current: this.current, total: this.total, animating: !!this.active, dir: this.dir, auto: this.auto };
  }

  private emit(): void {
    const s = this.state();
    this.listeners.forEach((fn) => fn(s));
  }

  next(): void {
    this.cancelAuto();
    if (this.active && this.dir === 'forward') {
      // Ya va hacia adelante: se apura y encadena el siguiente al terminar.
      this.active.timeScale(3 * this.speed);
      this.pending = Math.min(this.pending + 1, 1);
      return;
    }
    if (this.active && this.dir === 'reverse') {
      // Iba hacia atrás: se da la vuelta desde donde está.
      this.pending = 0;
      this.current++;
      this.run(this.timelines[this.current - 1], 'forward');
      return;
    }
    if (this.current >= this.total) return;
    this.current++;
    this.run(this.timelines[this.current - 1], 'forward');
  }

  prev(): void {
    this.cancelAuto();
    this.pending = 0;
    if (this.active && this.dir === 'forward') {
      this.current--;
      this.run(this.timelines[this.current], 'reverse');
      return;
    }
    if (this.active && this.dir === 'reverse') {
      this.active.timeScale(3 * this.speed);
      return;
    }
    if (this.current <= 0) return;
    this.current--;
    this.run(this.timelines[this.current], 'reverse');
  }

  /** Salto directo a un momento (0..total). Recorre las timelines en orden para mantener la continuidad. */
  goTo(n: number): void {
    this.cancelAuto();
    this.pending = 0;
    n = Math.max(0, Math.min(this.total, Math.round(n)));
    if (this.active) {
      const i = this.timelines.indexOf(this.active);
      if (this.dir === 'forward') this.active.progress(1).pause();
      else this.active.progress(0).pause();
      this.current = this.dir === 'forward' ? i + 1 : i;
      this.active = null;
      this.dir = 'idle';
    }
    if (n === this.current) {
      this.emit();
      return;
    }
    // Llega al momento anterior al destino al instante y reproduce la última transición,
    // para que el salto también se vea como una consecuencia y no como un corte.
    if (n > this.current) {
      for (let i = this.current; i < n - 1; i++) this.timelines[i].progress(1).pause();
      this.current = n;
      this.run(this.timelines[n - 1], 'forward');
    } else {
      for (let i = this.current - 1; i > n; i--) this.timelines[i].progress(0).pause();
      this.current = n;
      this.run(this.timelines[n], 'reverse');
    }
  }

  setAuto(on: boolean): void {
    this.auto = on;
    this.cancelAuto();
    if (on && !this.active) this.scheduleAuto();
    this.emit();
  }

  private run(tl: gsap.core.Timeline, dir: 'forward' | 'reverse'): void {
    this.active = tl;
    this.dir = dir;
    tl.timeScale(this.speed);
    if (dir === 'forward') tl.play();
    else tl.reverse();
    this.emit();
  }

  private finished(i: number, dir: 'forward' | 'reverse'): void {
    if (this.timelines[i] !== this.active) return;
    this.active = null;
    this.dir = 'idle';
    this.emit();
    if (dir === 'forward' && this.pending > 0) {
      this.pending--;
      this.next();
      return;
    }
    if (this.auto) this.scheduleAuto();
  }

  private scheduleAuto(): void {
    if (this.current >= this.total) return;
    this.autoCall = gsap.delayedCall(motion.auto, () => {
      this.autoCall = null;
      this.next();
      // next() cancela el auto programado pero conserva el modo.
    });
  }

  private cancelAuto(): void {
    this.autoCall?.kill();
    this.autoCall = null;
  }
}
