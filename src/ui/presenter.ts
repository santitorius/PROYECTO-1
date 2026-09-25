import { momentos, ui } from '../content.es';
import { color, font } from '../tokens';
import type { MomentState } from '../core/moments';

/**
 * Modo presentador: ventana aparte (para la laptop) con notas del orador,
 * momento actual, el que sigue y cronómetro. No necesita archivos extra: se escribe
 * desde esta misma página, así funciona también en el HTML único sin internet.
 */
export class Presenter {
  private win: Window | null = null;
  private startedAt = 0;
  private timer = 0;
  private last: MomentState | null = null;

  constructor(
    private readonly onKey: (e: KeyboardEvent) => void,
    private readonly onBlocked: (msg: string) => void,
  ) {}

  toggle(): void {
    if (this.win && !this.win.closed) {
      this.win.close();
      this.win = null;
      return;
    }
    this.open();
  }

  private open(): void {
    const w = window.open('', 'quovix-presentador', 'width=980,height=640');
    if (!w) {
      this.onBlocked(ui.presentador.bloqueado);
      return;
    }
    this.win = w;
    const P = ui.presentador;
    w.document.open();
    w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${P.titulo} · Quovix</title>
<style>
  *{box-sizing:border-box} body{margin:0;background:${color.fondo};color:#fff;font-family:${font.texto};display:grid;grid-template-columns:1.4fr 1fr;grid-template-rows:auto 1fr auto;gap:18px;padding:22px;height:100vh}
  header{grid-column:1/-1;display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid ${color.linea};padding-bottom:12px}
  h1{margin:0;font:900 30px ${font.titulo};letter-spacing:.08em;text-transform:uppercase}
  h1 small{color:${color.turquesa};margin-right:12px}
  .t{font:900 34px ${font.subtitulo};color:${color.turquesa};font-variant-numeric:tabular-nums}
  .lbl{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:${color.textoTenue};margin-bottom:8px}
  .notes{font-size:24px;line-height:1.45;overflow:auto}
  .side{display:flex;flex-direction:column;gap:18px}
  .card{border:1px solid ${color.linea};border-radius:14px;padding:14px 16px;background:${color.azulNoche}}
  .next{font:900 22px ${font.subtitulo}}
  .min{font:900 28px ${font.subtitulo};color:${color.turquesa}}
  footer{grid-column:1/-1;display:flex;gap:12px;justify-content:space-between;align-items:center}
  button{font:900 18px ${font.subtitulo};padding:14px 22px;border-radius:12px;border:1px solid ${color.turquesa};background:transparent;color:#fff;cursor:pointer}
  button.pri{background:${color.turquesa};color:${color.fondo}}
  .help{font-size:12px;color:${color.textoTenue}}
  .state{font-size:13px;color:${color.turquesa};letter-spacing:.1em;text-transform:uppercase}
</style></head><body>
<header><h1><small id="n"></small><span id="title"></span></h1><div class="t" id="clock">00:00</div></header>
<section><div class="lbl">${P.notas}</div><div class="notes" id="notes"></div></section>
<aside class="side">
  <div class="card"><div class="lbl">${P.siguiente}</div><div class="next" id="next"></div></div>
  <div class="card"><div class="lbl">${ui.minutosDevueltos}</div><div class="min" id="min">0</div></div>
  <div class="state" id="state"></div>
</aside>
<footer><button id="prev">${P.anterior}</button><span class="help">${ui.atajos}</span><button class="pri" id="fwd">${P.proximo}</button></footer>
</body></html>`);
    w.document.close();
    // Mismas fuentes embebidas que el escenario.
    const faces: string[] = [];
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const r of Array.from(sheet.cssRules)) if (r instanceof CSSFontFaceRule) faces.push(r.cssText);
      } catch {
        /* hoja externa sin acceso */
      }
    }
    const st = w.document.createElement('style');
    st.textContent = faces.join('\n');
    w.document.head.appendChild(st);
    w.document.addEventListener('keydown', (e) => this.onKey(e));
    w.document.getElementById('prev')!.addEventListener('click', () =>
      this.onKey(new KeyboardEvent('keydown', { key: 'ArrowLeft' })),
    );
    w.document.getElementById('fwd')!.addEventListener('click', () =>
      this.onKey(new KeyboardEvent('keydown', { key: 'ArrowRight' })),
    );
    if (!this.startedAt) this.startedAt = performance.now();
    window.clearInterval(this.timer);
    this.timer = window.setInterval(() => this.tickClock(), 500);
    if (this.last) this.update(this.last);
  }

  /** El cronómetro arranca al pasar del negro inicial. */
  markStart(): void {
    if (!this.startedAt) this.startedAt = performance.now();
  }

  private tickClock(): void {
    const w = this.win;
    if (!w || w.closed) {
      window.clearInterval(this.timer);
      return;
    }
    const s = Math.floor((performance.now() - this.startedAt) / 1000);
    w.document.getElementById('clock')!.textContent =
      String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  update(s: MomentState, minutos = 0): void {
    this.last = s;
    const w = this.win;
    if (!w || w.closed) return;
    const d = w.document;
    const m = momentos[s.current - 1];
    const nx = momentos[s.current];
    d.getElementById('n')!.textContent = s.current ? `${s.current}/${s.total}` : '';
    d.getElementById('title')!.textContent = m ? m.titulo : ui.presentador.inicio;
    d.getElementById('notes')!.textContent = m ? m.notas : momentos[0].notas;
    d.getElementById('next')!.textContent = nx ? `${nx.n}. ${nx.titulo}` : ui.presentador.fin;
    d.getElementById('state')!.textContent = [s.animating ? '…' : '', s.auto ? ui.modoAuto : '']
      .filter(Boolean)
      .join(' · ');
    this.setMinutes(minutos);
  }

  setMinutes(m: number): void {
    const w = this.win;
    if (!w || w.closed) return;
    const el = w.document.getElementById('min');
    if (el) el.textContent = String(Math.round(m));
  }
}
