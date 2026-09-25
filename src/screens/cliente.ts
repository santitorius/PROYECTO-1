import fotoBarberia from '../../assets/fotos/barberia.webp';
import fotoPortada from '../../assets/fotos/portada.webp';
import fotoSalon from '../../assets/fotos/salon.webp';
import fotoUnas from '../../assets/fotos/unas.webp';
import fotoSpa from '../../assets/fotos/spa.webp';
import {
  appCliente as T,
  citasCliente,
  formatoRD as RD,
  horaTelefono,
  reservaCliente as R,
  marca,
  negociosCliente,
  promosCliente,
  servicios,
} from '../content.es';
import { h, mount, type Child, initials, screenToast } from './dom';
import { icon } from './icons';
import { qImg } from '../core/logo';

const fotos: Record<string, string> = { barberia: fotoBarberia, salon: fotoSalon, unas: fotoUnas, spa: fotoSpa };

type Paso = 'bienvenida' | 'numero' | 'codigo' | 'nombre' | 'app';
type Tab = 'explorar' | 'citas' | 'chats' | 'perfil';
type Vista = null | 'negocio' | 'puntos' | 'reservada';

export interface ClienteEventos {
  paso?: (p: Paso) => void;
  reservar?: () => void;
}

/**
 * App "Quovix" del cliente en DOM real: entrada por código de WhatsApp, inicio con categorías y promos,
 * "Vuelve a regresar", Mis citas, puntos y una reserva completa (se paga en el local).
 */
export function createClienteApp(ev: ClienteEventos = {}) {
  const nombre = T.nombre.split(' ')[0];
  const st = {
    paso: 'bienvenida' as Paso,
    tab: 'explorar' as Tab,
    vista: null as Vista,
    citasTab: 'proximas' as 'proximas' | 'historial',
    tieneProxima: true,
    cat: 0,
    svc: 0,
    hora: 1,
    codigo: 0,
    nombreTecleado: 0,
    reservas: [] as { servicio: string; hora: string }[],
  };
  const timers: number[] = [];
  const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
  const clearTimers = () => timers.splice(0).forEach((t) => clearTimeout(t));

  const root = h('div', { class: 'app cliente' });
  const sb = h('div', { class: 'sb' }, h('span', null, horaTelefono), h('span', { class: 'sig', html: icon.signal }));
  const stage = h('div', { style: 'position:absolute;inset:0' });
  root.append(stage);

  function render(): void {
    if (st.paso !== 'app') return renderPaso();
    const body = h('div', { class: 'body' });
    const tabbar = h(
      'div',
      { class: 'tabbar' },
      (
        [
          ['explorar', T.tabs.explorar, icon.explorar],
          ['citas', T.tabs.citas, icon.citas],
          ['chats', T.tabs.chats, icon.chat],
          ['perfil', T.tabs.perfil, icon.perfil],
        ] as [Tab, string, string][]
      ).map(([id, label, ic]) =>
        h('button', { class: st.tab === id ? 'on' : '', 'data-tab': id, onclick: () => go(id) }, h('span', { html: ic }), label),
      ),
    );
    mount(stage, h('div', { class: 'app-inner', style: 'position:absolute;inset:0;display:flex;flex-direction:column' }, sb, body), tabbar);
    if (st.vista === 'negocio') mount(body, ...vistaNegocio());
    else if (st.vista === 'reservada') mount(body, ...vistaReservada());
    else if (st.vista === 'puntos') mount(body, ...vistaPuntos());
    else if (st.tab === 'explorar') mount(body, ...explorar());
    else if (st.tab === 'citas') mount(body, ...citas());
    else if (st.tab === 'chats') mount(body, ...chats());
    else mount(body, ...perfil());
  }

  /* ---------------- Entrada: código por WhatsApp ---------------- */
  function renderPaso(): void {
    const p = st.paso;
    if (p === 'bienvenida') {
      const [a, b, c] = marca.esloganAppCliente.replace(/\.$/, '').split(/\s(?=perfecta|en\s)/i);
      mount(
        stage,
        h(
          'div',
          { class: 'cl-hero', style: `--hero:url(${fotoPortada})` },
          qImg('q'),
          h('h1', { 'data-eslogan': '' }, a, h('br'), h('em', null, b), h('br'), c + '.'),
          h('p', null, T.subtituloBienvenida),
          h('div', { class: 'dots' }, h('i'), h('i'), h('i')),
          h('button', { class: 'btn pri', 'data-crear': '', onclick: () => setPaso('numero') }, T.crearCuenta, h('span', { class: 'ico', html: icon.arrow })),
          h('button', { class: 'btn ink', onclick: () => setPaso('numero') }, T.yaTengoCuenta),
        ),
        sb,
      );
    } else if (p === 'numero') {
      mount(
        stage,
        sb,
        h(
          'div',
          { class: 'cl-step', style: 'top:50px' },
          h('div', { class: 'h-title' }, h('button', { html: icon.back, onclick: () => setPaso('bienvenida') }), T.tuNumero),
          h('div', { class: 'h-sub' }, T.tuNumeroNota),
          h('div', { class: 'phone-in' }, h('b', null, T.prefijo), h('div', { class: 'field' }, T.numero)),
          h('div', { class: 'grow' }),
          h('button', { class: 'btn pri', 'data-continuar': '', onclick: () => setPaso('codigo') }, T.continuar, h('span', { class: 'ico', html: icon.arrow })),
        ),
      );
    } else if (p === 'codigo') {
      const digits = T.codigoDigitos.split('');
      const boxes = digits.map((d, i) => h('i', { class: i < st.codigo ? 'on' : '' }, i < st.codigo ? d : ''));
      mount(
        stage,
        sb,
        h(
          'div',
          { class: 'cl-step', style: 'top:50px' },
          h('div', { class: 'h-title' }, h('button', { html: icon.back, onclick: () => setPaso('numero') }), T.codigo),
          h('div', { class: 'h-sub' }, T.codigoNota),
          h('div', { class: 'code' }, boxes),
          h('button', { class: 'a-link', style: 'text-align:left', onclick: () => autoCodigo() }, T.reenviar),
          h('div', { class: 'grow' }),
          h('button', { class: 'btn pri', 'data-entrar': '', onclick: () => setPaso('nombre') }, T.entrar, h('span', { class: 'ico', html: icon.arrow })),
        ),
      );
    } else if (p === 'nombre') {
      const txt = T.nombre.slice(0, st.nombreTecleado);
      mount(
        stage,
        sb,
        h(
          'div',
          { class: 'cl-step', style: 'top:50px' },
          h('div', { class: 'h-title' }, h('button', { html: icon.back, onclick: () => setPaso('codigo') }), T.comoTeLlamas),
          h('div', { class: 'h-sub' }, T.comoTeLlamasNota),
          h('div', { class: 'field name caret' }, txt),
          h('div', { class: 'grow' }),
          h('button', { class: 'btn pri', 'data-entrar': '', onclick: () => setPaso('app') }, T.entrar, h('span', { class: 'ico', html: icon.arrow })),
        ),
      );
    }
  }

  /** El código llega por WhatsApp y se completa solo, dígito a dígito. */
  function autoCodigo(): void {
    clearTimers();
    st.codigo = 0;
    renderPaso();
    for (let i = 1; i <= 4; i++)
      later(() => {
        st.codigo = i;
        if (st.paso === 'codigo') renderPaso();
      }, 350 + i * 260);
  }

  function autoNombre(): void {
    clearTimers();
    st.nombreTecleado = 0;
    renderPaso();
    for (let i = 1; i <= T.nombre.length; i++)
      later(() => {
        st.nombreTecleado = i;
        if (st.paso === 'nombre') renderPaso();
      }, 200 + i * 70);
  }

  function setPaso(p: Paso, animar = true): void {
    clearTimers();
    st.paso = p;
    ev.paso?.(p);
    if (p === 'codigo' && animar) return autoCodigo();
    if (p === 'codigo') st.codigo = 4;
    if (p === 'nombre' && animar) return autoNombre();
    if (p === 'nombre') st.nombreTecleado = T.nombre.length;
    render();
  }

  function go(tab: Tab): void {
    st.tab = tab;
    st.vista = null;
    render();
  }

  /* ---------------- Explorar ---------------- */
  function explorar(): Child[] {
    const patio = negociosCliente[0];
    return [
      h(
        'div',
        { class: 'cl-top' },
        qImg('q'),
        h(
          'div',
          { class: 'r' },
          h('button', { class: 'pts', 'data-pts': '', onclick: () => ((st.vista = 'puntos'), render()) }, `${T.puntos} pts`),
          h('span', { class: 'bellb', html: icon.bell }),
        ),
      ),
      h('div', { class: 'hello' }, h('small', null, T.ciudad), h('b', null, T.hola(nombre)), h('div', { class: 'h-title' }, T.queTeHacemos)),
      h('div', { class: 'search' }, h('span', { html: icon.explorar }), T.buscar),
      h('div', { class: 'sec' }, T.vuelveARegresar),
      h(
        'div',
        { class: 'back-chips', 'data-vuelve': '' },
        h(
          'button',
          { onclick: () => abrirNegocio(0) },
          h('span', { class: 'av sm' }, 'EP'),
          h('span', null, h('b', null, citasCliente.historial[0].servicio), h('small', null, patio.nombre)),
        ),
        h(
          'button',
          { onclick: () => screenToast(root, negociosCliente[2].nombre) },
          h('span', { class: 'av sm' }, 'NB'),
          h('span', null, h('b', null, 'Pedicure'), h('small', null, negociosCliente[2].nombre)),
        ),
      ),
      h('div', { class: 'sec' }, T.categorias),
      h(
        'div',
        { class: 'cats' },
        negociosCliente.map((n, i) =>
          h('button', { class: st.cat === i ? 'on' : '', onclick: () => ((st.cat = i), render()) }, h('img', { src: fotos[n.foto], alt: '' }), T.cats[i]),
        ),
      ),
      h('div', { class: 'sec' }, T.promosSemana),
      promosCliente.map((p) =>
        h(
          'button',
          { class: 'promo', onclick: () => abrirNegocio(0) },
          h('span', { class: 'g' }, p.grande),
          h('span', { class: 't' }, h('b', null, p.negocio), p.detalle),
          h('span', { html: icon.arrow }),
        ),
      ),
      h('div', { class: 'sec' }, T.destacados),
      h(
        'div',
        { class: 'biz-row' },
        [negociosCliente[st.cat], ...negociosCliente.filter((_, i) => i !== st.cat)].map((n) =>
          h(
            'button',
            { class: 'biz', onclick: () => abrirNegocio(negociosCliente.indexOf(n)) },
            h('div', { class: 'ph', style: `background-image:url(${fotos[n.foto]})` }, h('span', { class: 'tag' }, T.desde(RD(n.desde)))),
            h('b', null, n.nombre),
            h('small', null, `${n.cat} · ${n.zona}`),
          ),
        ),
      ),
    ];
  }

  function abrirNegocio(i: number): void {
    if (i !== 0) {
      screenToast(root, negociosCliente[i].nombre);
      return;
    }
    st.vista = 'negocio';
    render();
  }

  /* ---------------- Detalle del negocio + reserva ---------------- */
  function vistaNegocio(): Child[] {
    const n = negociosCliente[0];
    return [
      h('div', { class: 'cl-head' }, h('button', { html: icon.back, onclick: () => go('explorar') }), h('div', { class: 'h-title' }, n.nombre)),
      h('div', { class: 'h-sub', style: 'margin-top:4px' }, `${n.cat} · ${n.zona} · ${T.abiertoHoy}`),
      h(
        'div',
        { class: 'biz-detail' },
        h(
          'div',
          { class: 'ph', style: `background-image:url(${fotos[n.foto]})` },
          h('span', { class: 'rate' }, h('span', { html: icon.star }), T.valoracion),
        ),
      ),
      h('div', { class: 'sec' }, T.eligeServicio),
      servicios.slice(0, 4).map((s, i) =>
        h(
          'button',
          { class: `svc-opt ${st.svc === i ? 'on' : ''}`, onclick: () => ((st.svc = i), render()) },
          h('span', null, h('b', null, s.nombre), h('small', null, s.minutos ? `${s.minutos} min` : 'Con Marcos, Luis o Andy')),
          h('b', { class: 'num' }, RD(s.precio)),
        ),
      ),
      h('div', { class: 'sec' }, T.eligeHora),
      h(
        'div',
        { class: 'slots' },
        R.horas.map((t, i) => h('button', { class: st.hora === i ? 'on' : '', onclick: () => ((st.hora = i), render()) }, t)),
      ),
      h('div', { class: 'h-sub' }, T.pagasEnElLocal),
      h(
        'button',
        {
          class: 'btn pri',
          style: 'width:100%',
          'data-confirmar': '',
          onclick: () => {
            st.reservas.push({ servicio: servicios[st.svc].nombre, hora: R.horas[st.hora] });
            st.vista = 'reservada';
            render();
            ev.reservar?.();
          },
        },
        `${T.confirmar} · ${RD(servicios[st.svc].precio)}`,
      ),
    ];
  }

  function vistaReservada(): Child[] {
    const s = servicios[st.svc];
    return [
      h('div', { style: 'height:60px' }),
      h(
        'div',
        { class: 'card done-card' },
        h('div', { class: 'ok', html: icon.check }),
        h('b', null, T.reservada),
        h('div', { style: 'margin:8px 0 4px;font-weight:700' }, `${negociosCliente[0].nombre}`),
        h('div', { class: 'muted' }, `${s.nombre} · ${R.dia} · ${R.horas[st.hora]} · ${R.pro}`),
        h('div', { class: 'muted', style: 'margin-top:10px;font-size:12px' }, T.reservadaNota),
      ),
      h('button', { class: 'btn pri', style: 'width:100%', onclick: () => go('citas') }, T.verMisCitas),
    ];
  }

  /* ---------------- Mis citas ---------------- */
  function citas(): Child[] {
    const P = citasCliente.proxima;
    const prox = st.citasTab === 'proximas';
    return [
      h('div', { class: 'h-title', style: 'margin-top:14px' }, T.misCitas),
      h(
        'div',
        { class: 'tabs2' },
        h('button', { class: prox ? 'on' : '', onclick: () => ((st.citasTab = 'proximas'), render()) }, T.proximas),
        h('button', { class: !prox ? 'on' : '', onclick: () => ((st.citasTab = 'historial'), render()) }, T.historial),
      ),
      h('div', { class: 'hr' }),
      prox
        ? [
            ...st.reservas.map((r) =>
              h(
                'div',
                { class: 'card next-cl' },
                h('div', { class: 'eyebrow' }, negociosCliente[0].nombre),
                h('div', { class: 'when' }, `${R.dia} · ${r.hora}`),
                h('div', { class: 'svc' }, `${r.servicio} con ${R.pro}`),
              ),
            ),
            st.tieneProxima
              ? h(
                  'div',
                  { class: 'card next-cl', 'data-proxima': '' },
                  h('div', { class: 'eyebrow' }, P.negocio),
                  h('div', { class: 'when' }, `${P.fecha} · ${P.hora}`),
                  h('div', { class: 'svc' }, `${P.servicio} con ${P.pro}`),
                )
              : null,
          ]
        : citasCliente.historial.map((c) =>
            h(
              'div',
              { class: 'appt-cl' },
              h('div', null, h('b', null, c.negocio.replace('Barbería ', '') + ' ', h('em', null, c.fecha)), h('small', null, c.servicio)),
              h('div', { class: 'r' }, h('span', { onclick: () => abrirNegocio(0), style: 'cursor:pointer' }, T.repetir)),
            ),
          ),
    ];
  }

  /* ---------------- Chats ---------------- */
  function chats(): Child[] {
    return [
      h('div', { class: 'h-title', style: 'margin-top:14px' }, T.chatsTitulo),
      h('div', { class: 'h-sub' }, T.chatsNota),
      h(
        'div',
        { class: 'card chat-row' },
        h('div', { class: 'av' }, 'EP'),
        h(
          'div',
          { class: 'grow' },
          h('div', { class: 'who' }, negociosCliente[0].nombre, h('small', null, 'ahora')),
          h('div', { class: 'last ell' }, `¡Te esperamos el lunes, ${nombre}!`),
        ),
      ),
    ];
  }

  /* ---------------- Perfil y puntos ---------------- */
  function puntosCard(): HTMLElement {
    const faltan = T.puntosMeta - T.puntos;
    return h(
      'div',
      { class: 'card grad pts-card', 'data-puntos': '' },
      h('div', { class: 'eyebrow' }, T.tusPuntos),
      h('div', { class: 'big num' }, String(T.puntos), h('small', null, 'pts')),
      h('div', { class: 'prog' }, h('i', { style: `width:${(T.puntos / T.puntosMeta) * 100}%` })),
      h('div', { class: 'nota' }, T.puntosNota(faltan)),
    );
  }

  function perfil(): Child[] {
    return [
      h(
        'div',
        { class: 'profile-head' },
        h('div', { class: 'av' }, initials(T.nombre)),
        h('div', null, h('b', null, T.nombre), h('small', null, `${T.prefijo} ${T.numero} · Santo Domingo`)),
      ),
      h('button', { style: 'display:block;width:100%', onclick: () => ((st.vista = 'puntos'), render()) }, puntosCard()),
      h(
        'div',
        { class: 'card menu' },
        T.perfilMenu.map((t) =>
          h(
            'button',
            { class: 'it', onclick: () => (t === 'Puntos y recompensas' ? ((st.vista = 'puntos'), render()) : screenToast(root, t)) },
            h('span', { class: 't', style: 'font-weight:900;letter-spacing:.08em;text-transform:uppercase;font-size:13px' }, t),
            h('span', { html: icon.chevron }),
          ),
        ),
      ),
    ];
  }

  function vistaPuntos(): Child[] {
    return [
      h('div', { class: 'cl-head' }, h('button', { html: icon.back, onclick: () => go(st.tab) }), h('div', { class: 'h-title' }, 'Puntos y recompensas')),
      h('div', { style: 'height:14px' }),
      puntosCard(),
      h('div', { class: 'sec', style: 'color:#fff;font-size:15px;letter-spacing:0;text-transform:none' }, T.movimientos),
      h(
        'div',
        { class: 'card dark list' },
        citasCliente.movimientos.map((m) =>
          h('div', { class: 'it', style: 'border-color:rgba(255,255,255,.1)' }, h('span', null, m.t, h('br'), h('small', { style: 'opacity:.7' }, m.f)), h('b', null, `+${m.pts} pts`)),
        ),
      ),
      h('div', { class: 'h-sub' }, T.puntosRegla),
    ];
  }

  render();

  return {
    el: root,
    setPaso,
    go,
    abrirNegocio: () => abrirNegocio(0),
    setProxima: (v: boolean) => ((st.tieneProxima = v), render()),
    setCitasTab: (t: 'proximas' | 'historial') => ((st.citasTab = t), render()),
    verPuntos: () => ((st.vista = 'puntos'), render()),
    reset() {
      clearTimers();
      Object.assign(st, { reservas: [], paso: 'bienvenida', tab: 'explorar', vista: null, citasTab: 'proximas', tieneProxima: true, cat: 0, svc: 0, hora: 1, codigo: 0, nombreTecleado: 0 });
      render();
    },
    /** Estado completo (declarativo). `animar` reproduce el código y el nombre escribiéndose. */
    setDemo(d: { paso?: Paso; tab?: Tab; vista?: Vista; citasTab?: 'proximas' | 'historial'; proxima?: boolean; scroll?: number; animar?: boolean } = {}) {
      clearTimers();
      Object.assign(st, {
        tab: d.tab ?? 'explorar',
        vista: d.vista ?? null,
        citasTab: d.citasTab ?? 'proximas',
        tieneProxima: d.proxima ?? true,
        reservas: [],
        cat: 0,
        svc: 0,
        hora: 1,
      });
      setPaso(d.paso ?? 'app', d.animar ?? false);
      if (d.scroll) {
        const b = root.querySelector<HTMLElement>('.body');
        if (b) b.scrollTop = d.scroll;
      }
    },
    scrollBody(y: number) {
      const b = root.querySelector<HTMLElement>('.body');
      if (b) b.scrollTo({ top: y, behavior: 'smooth' });
    },
    q: <E extends HTMLElement = HTMLElement>(sel: string) => root.querySelector<E>(sel),
    get state() {
      return st;
    },
  };
}

export type ClienteApp = ReturnType<typeof createClienteApp>;
