import { h } from './dom';

/** Varias pantallas en un mismo teléfono (p. ej. WhatsApp y la app Quovix) con fundido entre ellas. */
export function createStack(layers: Record<string, HTMLElement>, first: string) {
  const root = h('div', { class: 'stack' });
  for (const [name, el] of Object.entries(layers)) {
    const wrap = h('div', { class: 'layer', 'data-layer': name }, el);
    root.appendChild(wrap);
  }
  let current = '';
  function show(name: string): void {
    current = name;
    root.querySelectorAll<HTMLElement>('.layer').forEach((l) => l.classList.toggle('on', l.dataset.layer === name));
  }
  show(first);
  return {
    el: root,
    show,
    get current() {
      return current;
    },
  };
}
