import { horaTelefono, whatsapp as T } from '../content.es';
import { h, mount } from './dom';
import { icon } from './icons';

export interface WaMensaje {
  /** 'yo' = el dueño del teléfono (el cliente); 'otro' = el negocio */
  de: 'yo' | 'otro';
  texto: string;
  hora?: string;
}

/**
 * Chat de WhatsApp en el teléfono del cliente (momentos 4 y 6).
 * Estado declarativo: set(mensajes, escribiendo) deja la pantalla exacta, así la presentación
 * puede avanzar o retroceder mensaje por mensaje.
 */
export function createWhatsApp(contacto = T.negocio, iniciales = T.iniciales) {
  const root = h('div', { class: 'app wa' });
  const list = h('div', { class: 'msgs' });
  let estado = T.estado;
  const sub = h('small', null, estado);
  root.append(
    h('div', { class: 'sb' }, h('span', null, horaTelefono), h('span', { class: 'sig', html: icon.signal })),
    h(
      'div',
      { class: 'wa-head' },
      h('span', { class: 'back', html: icon.back }),
      h('div', { class: 'av' }, iniciales),
      h('div', { class: 'grow' }, h('b', null, contacto), sub),
      h('div', { class: 'r', html: icon.phone + icon.more }),
    ),
    list,
    h('div', { class: 'composer' }, h('div', { class: 'in' }, T.escribe), h('span', { class: 'send', html: icon.send })),
  );

  let last: WaMensaje[] = [];

  function set(msgs: WaMensaje[], typing: null | 'yo' | 'otro' = null): void {
    const prev = last;
    last = msgs;
    mount(
      list,
      h('div', { class: 'day' }, T.hoy),
      msgs.map((m, i) => {
        const el = h('div', { class: `msg ${m.de === 'yo' ? 'me' : ''}`, 'data-i': i }, m.texto, h('span', { class: 'meta' }, m.hora ?? horaTelefono));
        // Solo el mensaje nuevo se anima; los anteriores quedan quietos.
        if (i < prev.length && prev[i].texto === m.texto) el.style.animation = 'none';
        return el;
      }),
      typing ? h('div', { class: `typing ${typing === 'yo' ? 'me' : ''}` }, h('i'), h('i'), h('i')) : null,
    );
    sub.textContent = typing === 'otro' ? T.escribiendo : estado;
    list.scrollTop = list.scrollHeight;
  }

  set([]);

  return {
    el: root,
    set,
    setEstado(s: string) {
      estado = s;
      sub.textContent = s;
    },
    /** Último mensaje (para lanzar la línea de luz desde él). */
    lastEl: () => list.querySelector<HTMLElement>('.msg:last-of-type'),
    q: <E extends HTMLElement = HTMLElement>(sel: string) => root.querySelector<E>(sel),
  };
}

export type WhatsAppScreen = ReturnType<typeof createWhatsApp>;
