import { momentos, ui } from '../content.es';

/** G: ir a un momento por número. */
export class GotoOverlay {
  readonly el: HTMLElement;
  private input: HTMLInputElement;

  constructor(root: HTMLElement, onGo: (n: number) => void) {
    this.el = document.createElement('div');
    this.el.className = 'overlay';
    this.el.innerHTML = `<div class="goto-box">
      <h2 class="qx-titulo">${ui.irAMomento}</h2>
      <input type="text" inputmode="numeric" maxlength="2" aria-label="${ui.irAMomento}" />
      <p>${ui.irAMomentoAyuda} (1–${momentos.length})</p>
    </div>`;
    this.input = this.el.querySelector('input')!;
    this.input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        const n = parseInt(this.input.value, 10);
        this.close();
        if (!Number.isNaN(n)) onGo(n);
      } else if (e.key === 'Escape' || e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        this.close();
      }
    });
    this.el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (e.target === this.el) this.close();
    });
    root.appendChild(this.el);
  }

  get isOpen(): boolean {
    return this.el.classList.contains('open');
  }

  open(): void {
    this.el.classList.add('open');
    this.input.value = '';
    this.input.focus();
  }

  close(): void {
    this.el.classList.remove('open');
    this.input.blur();
  }
}

/** Esc: vista general con los 13 momentos. */
export class Overview {
  readonly el: HTMLElement;
  private buttons: HTMLButtonElement[] = [];

  constructor(root: HTMLElement, onGo: (n: number) => void) {
    this.el = document.createElement('div');
    this.el.className = 'overlay';
    const box = document.createElement('div');
    box.className = 'overview';
    box.innerHTML = `<h2 class="qx-titulo">${ui.vistaGeneral}</h2><p>${ui.vistaGeneralAyuda}</p>`;
    const grid = document.createElement('div');
    grid.className = 'overview-grid';
    for (const m of momentos) {
      const b = document.createElement('button');
      b.innerHTML = `<b>${m.n}</b><span class="qx-subtitulo">${m.titulo}</span>`;
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        this.close();
        onGo(m.n);
      });
      grid.appendChild(b);
      this.buttons.push(b);
    }
    box.appendChild(grid);
    this.el.appendChild(box);
    this.el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (e.target === this.el) this.close();
    });
    root.appendChild(this.el);
  }

  get isOpen(): boolean {
    return this.el.classList.contains('open');
  }

  toggle(current: number): void {
    if (this.isOpen) this.close();
    else this.open(current);
  }

  open(current: number): void {
    this.buttons.forEach((b, i) => b.classList.toggle('on', i === current - 1));
    this.el.classList.add('open');
    this.buttons[Math.max(0, current - 1)]?.focus();
  }

  close(): void {
    this.el.classList.remove('open');
  }
}

/** Aviso breve dentro del escenario (p. ej. ventana emergente bloqueada). */
export function toast(root: HTMLElement, msg: string): void {
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position: 'absolute',
    left: '50%',
    top: '40px',
    transform: 'translateX(-50%)',
    padding: '14px 22px',
    borderRadius: '12px',
    background: 'var(--qx-azul-noche)',
    border: '1px solid var(--qx-turquesa)',
    fontSize: '20px',
    zIndex: '20',
    transition: 'opacity .5s',
  } as CSSStyleDeclaration);
  root.appendChild(t);
  setTimeout(() => (t.style.opacity = '0'), 3500);
  setTimeout(() => t.remove(), 4200);
}
