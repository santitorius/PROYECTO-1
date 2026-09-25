/** Utilidades mínimas para construir pantallas en DOM real, sin framework. */

export type Child = Node | string | number | null | undefined | false | Child[];
type Attrs = Record<string, string | number | boolean | EventListener | undefined>;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs | null = null,
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === false) continue;
      if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v as EventListener);
      else if (k === 'class') el.className = String(v);
      else if (k === 'html') el.innerHTML = String(v);
      else el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  append(el, children);
  return el;
}

function append(el: HTMLElement, children: Child[]): void {
  for (const c of (children as unknown[]).flat(Infinity) as Child[]) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

/** Reemplaza el contenido de un nodo. */
export function mount(el: HTMLElement, ...children: Child[]): void {
  el.replaceChildren();
  append(el, children);
}

export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-ZÁÉÍÓÚÑ]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

export function avatar(name: string, cls = ''): HTMLElement {
  return h('div', { class: `av ${cls}` }, initials(name));
}

/** Mensaje breve dentro de una pantalla. */
export function screenToast(root: HTMLElement, msg: string, ms = 2600): void {
  const t = h('div', { class: 'app-toast' }, msg);
  root.appendChild(t);
  requestAnimationFrame(() => t.classList.add('in'));
  setTimeout(() => t.classList.remove('in'), ms);
  setTimeout(() => t.remove(), ms + 400);
}
