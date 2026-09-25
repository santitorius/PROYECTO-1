import { createNegocioApp } from './screens/negocio';
import { createClienteApp } from './screens/cliente';
import { createWhatsApp } from './screens/whatsapp';
import { conversacionAgente, ui } from './content.es';

/**
 * Vista de revisión de pantallas (#pantallas): los tres teléfonos en plano, a tamaño real y tocables.
 * Sirve para revisar diseño y textos sin la escena 3D.
 */
export function startPreview(stage: HTMLElement): void {
  stage.classList.add('preview');
  const negocio = createNegocioApp();
  const cliente = createClienteApp();
  const wa = createWhatsApp();
  const conv = conversacionAgente.map((m) => ({ de: m.de === 'cliente' ? ('yo' as const) : ('otro' as const), texto: m.texto }));
  let n = 0;
  const step = () => {
    n = (n + 1) % (conv.length + 1);
    wa.set(conv.slice(0, n), n < conv.length && conv[n].de === 'otro' ? 'otro' : null);
  };

  const wrap = document.createElement('div');
  wrap.className = 'preview-row';
  const col = (title: string, el: HTMLElement, extra?: HTMLElement) => {
    const c = document.createElement('div');
    c.className = 'preview-col';
    const t = document.createElement('div');
    t.className = 'preview-title qx-titulo';
    t.textContent = title;
    const scr = document.createElement('div');
    scr.className = 'screen';
    scr.appendChild(el);
    c.append(t, scr);
    if (extra) c.appendChild(extra);
    return c;
  };
  const btn = (label: string, fn: () => void) => {
    const b = document.createElement('button');
    b.className = 'preview-btn';
    b.textContent = label;
    b.onclick = fn;
    return b;
  };
  const tools = (...b: HTMLElement[]) => {
    const d = document.createElement('div');
    d.className = 'preview-tools';
    d.append(...b);
    return d;
  };
  wrap.append(
    col('Quovix AI | Negocios', negocio.el, tools(btn('Reiniciar', () => negocio.reset()))),
    col('WhatsApp del cliente', wa.el, tools(btn('Siguiente mensaje', step))),
    col('Quovix (cliente)', cliente.el, tools(btn('Reiniciar', () => cliente.reset()))),
  );
  const badge = document.createElement('div');
  badge.className = 'sample-badge';
  badge.style.opacity = '1';
  badge.textContent = ui.datosDeEjemplo;
  stage.append(wrap, badge);
  (window as unknown as { quovix: unknown }).quovix = { negocio, cliente, wa };
}
