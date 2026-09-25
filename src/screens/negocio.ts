import wordmarkUrl from '../../assets/logo/quovix-ai-wordmark.svg';
import fotoBarberia from '../../assets/fotos/barberia.webp';
import {
  agenda as agendaBase,
  appNegocio as T,
  clientesNegocio,
  clienteEnRiesgo,
  chatsNegocio,
  conversacionAgente,
  equipoPagos,
  formatoRD as RD,
  horaTelefono,
  insumos,
  minutoActual,
  mensajeCarlos,
  metodos,
  negocio,
  reporteDias,
  reporteMes,
  reporteSemanal,
  serviciosVendidos,
  avisoWhatsApp,
  soporteGuion,
  type Cita,
  type Dia,
  type Metodo,
} from '../content.es';
import { h, mount, type Child, avatar, screenToast } from './dom';
import { icon } from './icons';
import { qImg } from '../core/logo';

type Tab = 'agenda' | 'ventas' | 'clientes' | 'chats' | 'negocio';
type Filtro = (typeof T.agenda.filtros)[number];
type FiltroCli = (typeof T.clientes.filtros)[number];
export type EstadoCarlos = 'listo' | 'enviado' | 'respondio';

export interface Mensaje {
  de: 'cliente' | 'agente' | 'negocio';
  texto: string;
}

/** Eventos que la presentación escucha (etapa 3: consecuencias). */
/** Si un evento devuelve `true`, la presentación se encarga (la app no aplica el cambio por su cuenta). */
export interface NegocioEventos {
  cobrar?: (cita: Cita, metodo: Metodo, boton: HTMLElement) => boolean | void;
  escribir?: (cita: Cita | null, boton: HTMLElement) => boolean | void;
  enviarCarlos?: (boton: HTMLElement) => boolean | void;
  asistente?: (accion: 'abrir' | 'lanzar' | 'descartar') => void;
  tab?: (tab: Tab) => void;
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

/**
 * App "Quovix AI | Negocios" en DOM real. Toda la interacción funciona dentro del teléfono.
 * Expone una API para que la presentación la lleve a cada estado (adelante y atrás).
 */
export function createNegocioApp(ev: NegocioEventos = {}) {
  const st = {
    tab: 'agenda' as Tab,
    dia: agendaBase[0].id,
    filtro: 'Todas' as Filtro,
    dias: clone(agendaBase) as Dia[],
    nuevas: new Set<string>(),
    ventas: 'hoy' as 'hoy' | 'finanzas',
    periodo: 'semana' as 'semana' | 'mes',
    insumosAbiertos: false,
    pagados: new Set<string>(),
    filtroCli: 'Todos' as FiltroCli,
    carlos: 'listo' as EstadoCarlos,
    chat: null as string | null,
    chatMsgs: new Map<string, Mensaje[]>([
      ['Luis Duarte', conversacionAgente.map((m) => ({ de: m.de, texto: m.texto }) as Mensaje)],
    ]),
    typing: null as null | 'cliente' | 'agente',
    burbuja: true,
    burbujaTexto: false,
    aviso: false,
    anim: '' as '' | 'ventas' | 'finanzas',
    countFrom: 0,
  };

  const root = h('div', { class: 'app negocio' });
  const sb = h('div', { class: 'sb' }, h('span', null, horaTelefono), h('span', { class: 'sig', html: icon.signal }));
  const body = h('div', { class: 'body' });
  const tabbar = h('div', { class: 'tabbar' });
  const conv = h('div', { class: 'conv' });
  const bubble = h('div', { class: 'ai-bubble' });
  const sheetWrap = h('div', { class: 'sheet-wrap' });
  const sheet = h('div', { class: 'sheet' });
  sheetWrap.appendChild(sheet);
  sheetWrap.addEventListener('click', (e) => {
    if (e.target === sheetWrap) closeSheet();
  });
  root.append(sb, body, tabbar, bubble, conv, sheetWrap);

  /* ---------------- utilidades de estado ---------------- */
  const dia = () => st.dias.find((d) => d.id === st.dia)!;
  const hoy = () => st.dias[0];
  const todas = () => st.dias.flatMap((d) => d.citas);
  const cobradasHoy = () => hoy().citas.filter((c) => c.estado === 'cobrada');
  const totalCobradoHoy = () => cobradasHoy().reduce((a, c) => a + c.precio, 0);
  const esperadoHoy = () => hoy().citas.filter((c) => c.estado !== 'no-vino').reduce((a, c) => a + c.precio, 0);
  const siguiente = () => hoy().citas.find((c) => c.estado === 'pendiente');
  const byTime = (a: Cita, b: Cita) => mins(a.hora) - mins(b.hora);

  function render(): void {
    const top = body.scrollTop;
    body.classList.toggle('anim-ventas', st.anim === 'ventas');
    body.classList.toggle('anim-finanzas', st.anim === 'finanzas');
    renderTabbar();
    if (st.tab === 'agenda') renderAgenda();
    else if (st.tab === 'ventas') renderVentas();
    else if (st.tab === 'clientes') renderClientes();
    else if (st.tab === 'chats') renderChats();
    else renderNegocio();
    renderBubble();
    body.scrollTop = top;
    st.anim = '';
  }

  function go(tab: Tab): void {
    if (st.tab !== tab) body.scrollTop = 0;
    st.tab = tab;
    closeChat();
    render();
    ev.tab?.(tab);
  }

  /* ---------------- barra de pestañas ---------------- */
  function renderTabbar(): void {
    const tabs: [Tab, string, string][] = [
      ['agenda', T.tabs.agenda, icon.agenda],
      ['ventas', T.tabs.ventas, icon.ventas],
      ['clientes', T.tabs.clientes, icon.clientes],
      ['chats', T.tabs.chats, icon.chats],
      ['negocio', T.tabs.negocio, icon.negocio],
    ];
    mount(
      tabbar,
      tabs.map(([id, label, ic]) =>
        h(
          'button',
          { class: st.tab === id ? 'on' : '', 'data-tab': id, onclick: () => go(id) },
          h('span', { html: ic }),
          label,
          id === 'clientes' && st.carlos === 'listo' ? h('span', { class: 'dot' }, '1') : null,
        ),
      ),
    );
  }

  /* ---------------- AGENDA ---------------- */
  function renderAgenda(): void {
    const d = dia();
    const esHoy = d.id === hoy().id;
    const next = esHoy ? siguiente() : undefined;
    const citas = [...d.citas].sort(byTime);
    const ocupados = d.citas.filter((c) => c.estado !== 'no-vino').length;
    const pct = d.huecos ? Math.round((ocupados / d.huecos) * 100) : 0;
    const esperado = d.citas.filter((c) => c.estado !== 'no-vino').reduce((a, c) => a + c.precio, 0);
    const cobrado = d.citas.filter((c) => c.estado === 'cobrada').reduce((a, c) => a + c.precio, 0);
    const visibles = citas.filter((c) =>
      st.filtro === 'Todas' ? true : st.filtro === 'Pendientes' ? c.estado === 'pendiente' : c.estado === 'cobrada',
    );

    mount(
      body,
      h(
        'div',
        { class: 'brandbar' },
        h('img', { src: wordmarkUrl, alt: 'Quovix AI' }),
        h('i'),
        T.marca,
      ),
      h(
        'div',
        { class: 'agenda-head' },
        h('div', { class: 'h-title' }, negocio.nombre),
        h('button', { class: 'btn-cita', onclick: () => screenToast(root, 'Nueva cita · elige cliente y hora') }, T.nuevaCita),
      ),
      h('div', { class: 'date-lbl' }, d.largo),
      h(
        'div',
        { class: 'days' },
        st.dias.map((x) =>
          h(
            'button',
            {
              class: [x.id === st.dia ? 'on' : '', x.cerrado ? 'closed' : ''].join(' '),
              'data-dia': x.id,
              onclick: () => selectDay(x.id),
            },
            h('small', null, x.corto),
            h('b', null, x.num),
          ),
        ),
      ),
      d.cerrado
        ? h('div', { class: 'card closed-card' }, h('b', null, T.agenda.cerrado), h('span', { class: 'muted' }, T.agenda.cerradoDetalle))
        : [
            esHoy && st.aviso ? avisoCard() : null,
            next ? nextCard(next) : null,
            h(
              'div',
              { class: 'card stats' },
              h(
                'div',
                { class: 'cols' },
                h('div', null, h('b', { class: 'num' }, ocupados), h('small', null, T.agenda.citas)),
                h('div', null, h('b', { class: 'num' }, RD(esperado)), h('small', null, T.agenda.esperado)),
                esHoy
                  ? h('div', null, h('b', { class: 'num', 'data-cobrado': '' }, RD(cobrado)), h('small', null, T.agenda.cobrado))
                  : h('div', null, h('b', { class: 'num' }, Math.max(0, d.huecos - ocupados)), h('small', null, T.agenda.libres)),
              ),
              h(
                'div',
                { class: 'occ' },
                h(
                  'div',
                  { class: 'top' },
                  h('span', null, h('b', null, `${T.agenda.ocupacion} · ${pct}%`), ` · ${ocupados} de ${d.huecos}`),
                  h('span', { class: 'muted' }, T.agenda.huecosLibres(Math.max(0, d.huecos - ocupados))),
                ),
                h(
                  'div',
                  { class: 'bars' },
                  Array.from({ length: d.huecos }, (_, i) => h('i', { class: i < ocupados ? 'on' : '' })),
                ),
              ),
            ),
            h(
              'div',
              { class: 'seg' },
              T.agenda.filtros.map((f) =>
                h('button', { class: st.filtro === f ? 'on' : '', onclick: () => ((st.filtro = f), render()) }, f),
              ),
            ),
            visibles.length
              ? visibles.map((c) => apptCard(c))
              : h('div', { class: 'empty' }, st.filtro === 'Pendientes' ? T.agenda.sinPendientes : T.agenda.todoCobrado),
          ],
    );
  }

  function avisoCard(): HTMLElement {
    const A = avisoWhatsApp;
    return h(
      'div',
      { class: 'card aviso', 'data-aviso': '' },
      h('div', { class: 'eyebrow wa-eyebrow' }, A.etiqueta),
      h('div', { class: 'row' }, avatar(A.nombre, 'sm'), h('div', { class: 'grow' }, h('b', null, A.nombre), h('div', { class: 'aviso-txt' }, A.texto))),
      h(
        'div',
        { class: 'act' },
        h(
          'button',
          {
            class: 'btn pri sm',
            'data-escribir-aviso': '',
            onclick: (e: Event) => {
              if (ev.escribir?.(null, e.currentTarget as HTMLElement) !== true) {
                st.aviso = false;
                render();
                openChat(A.nombre);
              }
            },
          },
          A.escribir,
        ),
        h('button', { class: 'btn soft sm', onclick: () => ((st.aviso = false), render()) }, A.despues),
      ),
    );
  }

  function nextCard(c: Cita): HTMLElement {
    return h(
      'div',
      { class: 'card next-card', 'data-cita': c.id },
      h(
        'div',
        { class: 'when' },
        h('span', { class: 'eyebrow' }, T.agenda.sigueAhora),
        h('b', null, `${c.hora} · ${c.min} min`),
      ),
      h(
        'div',
        { class: 'row' },
        avatar(c.cliente),
        h(
          'div',
          { class: 'grow' },
          h('div', { class: 'who' }, c.cliente),
          h('div', { class: 'svc' }, `${c.servicio} · ${T.agenda.conPro} ${c.pro}`),
          h('span', { class: 'pill' }, T.agenda.enMinutos(mins(c.hora) - minutoActual)),
        ),
      ),
      h(
        'div',
        { class: 'act' },
        h(
          'button',
          { class: 'btn pri', 'data-cobrar': c.id, onclick: (e: Event) => askCobrar(c, e.currentTarget as HTMLElement) },
          `${T.agenda.cobrar} ${RD(c.precio)}`,
        ),
        h('button', {
          class: 'round',
          html: icon.chat,
          'data-escribir': c.id,
          onclick: (e: Event) => escribir(c, e.currentTarget as HTMLElement),
        }),
      ),
    );
  }

  function apptCard(c: Cita): HTMLElement {
    const nueva = st.nuevas.has(c.id);
    const card = h(
      'div',
      { class: `card appt ${nueva ? 'nuevo' : ''} ${c.estado === 'no-vino' ? 'faded' : ''}`, 'data-cita': c.id },
      h(
        'div',
        { class: 'top' },
        h('div', { class: 't' }, h('b', null, c.hora), h('small', null, `${c.min} min`)),
        avatar(c.cliente, 'sm'),
        h(
          'div',
          { class: 'grow' },
          h('div', { class: 'who ell' }, c.cliente),
          h('div', { class: 'svc ell' }, `${c.servicio} · ${c.pro}`),
        ),
        h(
          'div',
          { class: 'price' },
          h('b', { class: 'num' }, RD(c.precio)),
          h('small', null, nueva ? T.agenda.nueva + ' · ' + c.origen : c.origen),
        ),
      ),
    );
    const act = h('div', { class: 'act' });
    if (c.estado === 'pendiente') {
      act.append(
        h(
          'button',
          { class: 'btn pri sm', 'data-cobrar': c.id, onclick: (e: Event) => askCobrar(c, e.currentTarget as HTMLElement) },
          T.agenda.cobrar,
        ),
        h(
          'button',
          { class: 'btn soft sm', 'data-escribir': c.id, onclick: (e: Event) => escribir(c, e.currentTarget as HTMLElement) },
          T.agenda.escribir,
        ),
        h('button', { class: 'btn soft sm', onclick: () => noVino(c) }, T.agenda.noVino),
      );
    } else if (c.estado === 'cobrada') {
      const m = metodos.find((x) => x.id === c.metodo)?.nombre ?? '';
      act.append(h('button', { class: 'btn done sm' }, `${T.agenda.cobrada} · ${m}`));
    } else {
      act.append(h('button', { class: 'btn soft sm', onclick: () => deshacerNoVino(c) }, T.agenda.marcadoNoVino));
    }
    card.appendChild(act);
    return card;
  }

  function selectDay(id: string): void {
    st.dia = id;
    render();
  }

  function askCobrar(c: Cita, boton: HTMLElement): void {
    openSheet(
      h('h3', null, `${T.agenda.cobrar} ${RD(c.precio)}`),
      h('div', { class: 'muted' }, `${c.cliente} · ${c.servicio}`),
      h('div', { class: 'eyebrow', style: 'margin-top:16px' }, T.agenda.elegirMetodo),
      h(
        'div',
        { class: 'opts' },
        metodos.map((m) =>
          h(
            'button',
            {
              class: 'btn soft',
              'data-metodo': m.id,
              onclick: () => {
                closeSheet();
                if (ev.cobrar?.(c, m.id, boton) !== true) cobrar(c.id, m.id);
              },
            },
            m.nombre,
          ),
        ),
      ),
      h('button', { class: 'btn', style: 'width:100%;color:#6b7682', onclick: closeSheet }, T.agenda.cancelar),
    );
  }

  function cobrar(id: string, metodo: Metodo): void {
    const c = todas().find((x) => x.id === id);
    if (!c) return;
    c.estado = 'cobrada';
    c.metodo = metodo;
    render();
    screenToast(root, T.agenda.cobradoOk(metodos.find((m) => m.id === metodo)!.nombre));
  }

  function descobrar(id: string): void {
    const c = todas().find((x) => x.id === id);
    if (!c) return;
    c.estado = 'pendiente';
    c.metodo = undefined;
    render();
  }

  function noVino(c: Cita): void {
    c.estado = 'no-vino';
    render();
  }
  function deshacerNoVino(c: Cita): void {
    c.estado = 'pendiente';
    render();
  }

  function escribir(c: Cita, boton: HTMLElement): void {
    if (ev.escribir?.(c, boton) !== true) openChat(c.cliente);
  }

  /* ---------------- VENTAS ---------------- */
  function renderVentas(): void {
    mount(
      body,
      h('div', { class: 'h-title' }, T.ventas.titulo),
      h('div', { class: 'h-sub' }, st.ventas === 'hoy' ? hoy().largo : T.ventas.subtitulo),
      h(
        'div',
        { class: 'seg' },
        h('button', { class: st.ventas === 'hoy' ? 'on' : '', onclick: () => ((st.ventas = 'hoy'), render()) }, T.ventas.hoy),
        h(
          'button',
          { class: st.ventas === 'finanzas' ? 'on' : '', 'data-finanzas': '', onclick: () => ((st.ventas = 'finanzas'), render()) },
          T.ventas.finanzas,
        ),
      ),
      st.ventas === 'hoy' ? ventasHoy() : finanzas(),
    );
  }

  function metodoCards(vals: Record<Metodo, number>, total: number): HTMLElement {
    return h(
      'div',
      { class: 'm-grid' },
      metodos.map((m, i) =>
        h(
          'div',
          { class: `card ${i === 2 ? 'wide' : ''}`, 'data-metodo': m.id },
          h('b', { class: 'num' }, RD(vals[m.id])),
          h('small', null, m.nombre),
          h('div', { class: 'bar' }, h('i', { style: `width:${total ? (vals[m.id] / total) * 100 : 0}%` })),
        ),
      ),
    );
  }

  function ventasHoy(): Child[] {
    const cobradas = cobradasHoy();
    const total = totalCobradoHoy();
    const vals = { efectivo: 0, tarjeta: 0, transferencia: 0 } as Record<Metodo, number>;
    cobradas.forEach((c) => (vals[c.metodo!] += c.precio));
    return [
      h(
        'div',
        { class: 'card grad', 'data-total-hoy': '' },
        h('div', { class: 'eyebrow' }, T.ventas.cobradoHoy),
        countUp(h('div', { class: 'big-total num' }, RD(total)), st.anim === 'ventas' ? st.countFrom : total, total),
        h('div', { style: 'font-size:13px' }, T.ventas.serviciosCobrados(cobradas.length, RD(esperadoHoy()))),
      ),
      metodoCards(vals, total),
      h('div', { class: 'sec' }, T.ventas.cobrosDeHoy),
      h(
        'div',
        { class: 'card list' },
        [...cobradas].reverse().map((c) =>
          h(
            'div',
            { class: 'it' },
            h('span', null, `${c.hora} · ${c.cliente}`, h('br'), h('small', { class: 'muted' }, `${c.servicio} · ${metodos.find((m) => m.id === c.metodo)!.nombre}`)),
            h('b', null, RD(c.precio)),
          ),
        ),
      ),
    ];
  }

  function finanzas(): Child[] {
    const semana = st.periodo === 'semana';
    const R = semana ? reporteSemanal : reporteMes;
    const pros = semana ? equipoPagos.profesionales : reporteMes.profesionales;
    const maxDia = Math.max(...reporteDias.map((d) => d.v));
    const minDia = Math.min(...reporteDias.filter((d) => !d.cerrado).map((d) => d.v));
    const totalSvc = serviciosVendidos.reduce((a, s) => a + s.n, 0);
    const maxSvc = Math.max(...serviciosVendidos.map((s) => s.n));
    const aPagar = pros.reduce((a, p) => a + p.aPagar, 0);

    return [
      h(
        'div',
        { class: 'seg' },
        h('button', { class: semana ? 'on' : '', onclick: () => ((st.periodo = 'semana'), render()) }, T.ventas.semana),
        h('button', { class: !semana ? 'on' : '', onclick: () => ((st.periodo = 'mes'), render()) }, T.ventas.mes),
      ),
      h(
        'div',
        { class: 'period' },
        h('button', { class: 'nav', html: icon.back, onclick: () => screenToast(root, semana ? '7 al 13 sep 2026' : 'Agosto 2026') }),
        h(
          'div',
          { class: 'mid' },
          h('b', null, semana ? T.ventas.semanaRango : T.ventas.mesRango),
          h('small', null, semana ? T.ventas.semanaNota : T.ventas.mesNota),
        ),
        h('button', { class: 'nav off', html: icon.chevron }),
      ),
      h(
        'div',
        { class: 'card grad lines', 'data-resultado': '' },
        h(
          'div',
          { class: 'res-head' },
          h('div', { class: 'eyebrow' }, T.ventas.resultado),
          h('button', { class: 'pdf-mini', 'data-pdf': '', onclick: () => screenToast(root, T.ventas.pdfListo), html: icon.download + '<span>PDF</span>' }),
        ),
        h('div', { class: 'l', 'data-l': 'ingresos' }, h('span', null, T.ventas.ingresos), h('b', { class: 'num' }, RD(R.ingresos))),
        h('div', { class: 'l', 'data-l': 'insumos' }, h('span', null, T.ventas.insumos), h('b', { class: 'num' }, '- ' + RD(R.insumos))),
        h('div', { class: 'l', 'data-l': 'equipo' }, h('span', null, T.ventas.pagoEquipo), h('b', { class: 'num' }, '- ' + RD(R.pagoEquipo))),
        h(
          'div',
          { class: 'net', 'data-l': 'neto' },
          h('span', { style: 'font-weight:900' }, T.ventas.neto),
          countUp(h('b', { class: 'num' }, RD(R.neto)), st.anim === 'finanzas' ? 0 : R.neto, R.neto, 1400),
        ),
      ),
      h('div', { class: 'sec' }, T.ventas.porMetodo, h('small', null, RD(R.ingresos))),
      metodoCards(R.porMetodo, R.ingresos),
      semana
        ? h(
            'div',
            { class: 'card', 'data-por-dia': '' },
            h('div', { class: 'eyebrow' }, T.ventas.porDia),
            h(
              'div',
              { class: 'daybars' },
              reporteDias.map((d) =>
                h(
                  'div',
                  null,
                  h('em', null, d.cerrado ? '' : `${Math.round(d.v / 100) / 10}k`),
                  h('i', {
                    class: d.cerrado ? 'off' : d.v === minDia ? 'low' : '',
                    style: `height:${d.cerrado ? 4 : Math.max(8, (d.v / maxDia) * 84)}px`,
                  }),
                  h('small', null, d.d),
                ),
              ),
            ),
          )
        : null,
      h('div', { class: 'sec' }, T.ventas.equipo, h('small', null, T.ventas.aPagarTotal(RD(aPagar)))),
      pros.map((p) => {
        const key = `${st.periodo}:${p.nombre}`;
        const pagado = st.pagados.has(key);
        return h(
          'div',
          { class: 'card pro', 'data-pro': p.nombre },
          h(
            'div',
            { class: 'top' },
            avatar(p.nombre, 'dark'),
            h(
              'div',
              { class: 'grow' },
              h('div', { class: 'who' }, p.nombre),
              h('div', { class: 'muted', style: 'font-size:12px' }, `${p.servicios} ${T.ventas.servicios} · ${RD(p.generado)} ${T.ventas.generados}`),
            ),
          ),
          h('div', { class: 'rule' }, T.ventas.regla(equipoPagos.regla)),
          h(
            'div',
            { class: 'three' },
            h('div', null, h('b', { class: 'num' }, RD(p.aPagar)), h('small', null, T.ventas.aPagar)),
            h('div', null, h('b', { class: 'num' }, pagado ? RD(p.aPagar) : '—'), h('small', null, T.ventas.pagado)),
            h('div', null, h('b', { class: 'num' }, pagado ? '—' : RD(p.aPagar)), h('small', null, T.ventas.pendiente)),
          ),
          h(
            'div',
            { class: 'act' },
            h(
              'button',
              {
                class: `btn ${pagado ? 'done' : 'pri'}`,
                onclick: () => {
                  if (pagado) st.pagados.delete(key);
                  else st.pagados.add(key);
                  render();
                },
              },
              pagado ? T.ventas.yaPagado : T.ventas.marcarPagado,
            ),
            h('button', { class: 'btn ink', onclick: () => screenToast(root, T.ventas.regla(equipoPagos.regla)) }, T.ventas.reglaPago),
          ),
        );
      }),
      h(
        'div',
        { class: 'card', 'data-insumos': '' },
        h('div', { class: 'eyebrow' }, T.ventas.insumosTitulo),
        h(
          'div',
          { style: 'display:flex;align-items:baseline;gap:8px;margin:6px 0 10px' },
          h('b', { class: 'num', style: 'font-size:26px' }, RD(R.insumos)),
          h('span', { class: 'muted', style: 'font-size:12px' }, T.ventas.compras(semana ? insumos.compras.length : 14)),
        ),
        st.insumosAbiertos
          ? h(
              'div',
              { class: 'list' },
              insumos.compras.map((i) =>
                h('div', { class: 'it' }, h('span', null, i.nombre, h('br'), h('small', { class: 'muted' }, `En inventario: ${i.stock}`)), h('b', null, RD(i.monto))),
              ),
            )
          : null,
        h('div', { class: 'list' }, h('div', { class: 'it' }, h('span', null, T.ventas.inventario), h('b', null, RD(insumos.inventario)))),
        h(
          'button',
          { class: 'link', onclick: () => ((st.insumosAbiertos = !st.insumosAbiertos), render()) },
          st.insumosAbiertos ? T.ventas.ocultarInsumos : T.ventas.verInsumos,
        ),
      ),
      semana
        ? h(
            'div',
            { class: 'card list topsvc' },
            h('div', { class: 'eyebrow', style: 'margin-bottom:4px' }, T.ventas.masVendidos),
            serviciosVendidos.map((s) =>
              h(
                'div',
                { class: 'it', style: 'display:block' },
                h('div', { style: 'display:flex;justify-content:space-between' }, h('span', null, s.nombre), h('b', null, `${s.n}`)),
                h('i', { style: `width:${(s.n / maxSvc) * 100}%` }),
              ),
            ),
            h('div', { class: 'muted', style: 'font-size:11px;margin-top:6px' }, `${totalSvc} ${T.ventas.servicios}`),
          )
        : null,
      h(
        'button',
        { class: 'btn pri pdf', 'data-pdf': '', onclick: () => screenToast(root, T.ventas.pdfListo) },
        T.ventas.descargarPdf,
        h('span', { class: 'ico', html: icon.download }),
      ),
      h('div', { class: 'foot-note' }, T.ventas.pdfNota),
    ];
  }

  /* ---------------- CLIENTES ---------------- */
  function renderClientes(): void {
    const lista = clientesNegocio.filter((c) => st.filtroCli === 'Todos' || c.segmento === st.filtroCli);
    const vip = clientesNegocio.filter((c) => c.segmento === 'VIP').length;
    const riesgo = clientesNegocio.filter((c) => c.segmento === 'En riesgo').length;
    const mostrarAlerta = st.filtroCli === 'Todos' || st.filtroCli === 'En riesgo';
    mount(
      body,
      h('div', { class: 'h-title' }, T.clientes.titulo),
      h('div', { class: 'h-sub' }, T.clientes.resumen(clientesNegocio.length, vip, riesgo)),
      h('div', { class: 'search' }, h('span', { html: icon.explorar }), T.clientes.buscar),
      h(
        'div',
        { class: 'chips' },
        T.clientes.filtros.map((f) =>
          h(
            'button',
            { class: `${st.filtroCli === f ? 'on' : ''} ${f === 'En riesgo' ? 'risk' : ''}`, 'data-filtro': f, onclick: () => filtrarClientes(f) },
            f,
          ),
        ),
      ),
      mostrarAlerta ? riskCard() : null,
      lista.length
        ? lista.map((c) =>
            h(
              'div',
              { class: 'card cli', 'data-cliente': c.nombre },
              h(
                'div',
                { class: 'top' },
                avatar(c.nombre),
                h(
                  'div',
                  { class: 'grow' },
                  h('div', { class: 'who' }, c.nombre, h('span', { class: `pill seg-${c.segmento.split(' ')[0]}` }, c.segmento)),
                  h('div', { class: 'sub' }, c.ultima ? `${T.clientes.ultima}: ${c.ultima}` : `${T.clientes.primera}: ${c.primera}`),
                ),
                c.gasto
                  ? h('div', { class: 'money' }, h('b', { class: 'num' }, RD(c.gasto)), h('small', null, T.clientes.gasto.split(' ')[0]))
                  : h('span', { class: 'pill acc' }, T.agenda.nueva),
              ),
              h(
                'div',
                { class: 'mid' },
                h('div', null, h('small', null, T.clientes.favorito), c.favorito),
                h('div', { style: 'text-align:right' }, h('small', null, T.clientes.visitas), String(c.visitas)),
              ),
              h(
                'div',
                { class: 'act' },
                h('button', { class: 'btn pri', onclick: () => screenToast(root, `${T.clientes.nuevaCita}: ${c.nombre}`) }, T.clientes.nuevaCita),
                h('button', { class: 'btn soft', onclick: () => openChat(c.nombre) }, T.clientes.chat),
              ),
            ),
          )
        : h('div', { class: 'empty' }, T.clientes.sinResultados),
    );
  }

  function riskCard(): HTMLElement {
    const R = clienteEnRiesgo;
    const btnLabel = st.carlos === 'listo' ? T.clientes.enviar : st.carlos === 'enviado' ? T.clientes.enviado : T.clientes.respondio;
    return h(
      'div',
      { class: 'card risk-card', 'data-riesgo': '' },
      h('div', { class: 'head', html: icon.alert + `<span>${T.clientes.alertaTitulo} · ${R.riesgo}</span>` }),
      h('div', { class: 'row', style: 'margin-bottom:10px' }, avatar(R.nombre), h('div', { class: 'say' }, T.clientes.alerta(R.nombre, R.semanasSinVenir))),
      h(
        'div',
        { class: 'facts' },
        h('div', null, h('b', null, 'Cada 3 sem.'), h('small', null, T.clientes.venia)),
        h('div', null, h('b', null, `${R.semanasSinVenir} sem.`), h('small', null, 'Sin venir')),
        h('div', null, h('b', { class: 'num' }, RD(R.gastoHistorico)), h('small', null, T.clientes.gasto)),
      ),
      h('div', { class: 'draft', 'data-draft': '' }, h('small', null, T.clientes.mensajeListo), mensajeCarlos),
      h(
        'button',
        {
          class: `btn wa ${st.carlos !== 'listo' ? 'sent' : ''}`,
          'data-enviar-carlos': '',
          onclick: (e: Event) => {
            if (st.carlos !== 'listo') return;
            if (ev.enviarCarlos?.(e.currentTarget as HTMLElement) !== true) setCarlos('enviado');
          },
        },
        btnLabel,
      ),
    );
  }

  function filtrarClientes(f: FiltroCli): void {
    st.filtroCli = f;
    render();
  }

  function setCarlos(s: EstadoCarlos): void {
    st.carlos = s;
    render();
  }

  /* ---------------- CHATS ---------------- */
  function renderChats(): void {
    mount(
      body,
      h('div', { class: 'h-title' }, T.chats.titulo),
      h('div', { class: 'h-sub' }, T.chats.subtitulo),
      chatsNegocio.map((c) =>
        h(
          'div',
          { class: 'card chat-row', 'data-chat': c.nombre, onclick: () => openChat(c.nombre), style: 'cursor:pointer' },
          avatar(c.nombre),
          h(
            'div',
            { class: 'grow' },
            h('div', { class: 'who' }, c.nombre, h('small', null, c.hace)),
            h('div', { class: 'last ell' }, c.ultimo),
            c.agente ? h('div', { class: 'ag' }, 'Agente IA') : null,
          ),
        ),
      ),
      h('div', { class: 'h-sub', style: 'margin-top:14px' }, T.chats.nota),
    );
  }

  function openChat(nombre: string): void {
    st.chat = nombre;
    renderConv();
    conv.classList.add('open');
  }

  function closeChat(): void {
    st.chat = null;
    conv.classList.remove('open');
  }

  function renderConv(): void {
    if (!st.chat) return;
    const msgs = st.chatMsgs.get(st.chat) ?? [];
    const list = h(
      'div',
      { class: 'msgs' },
      msgs.map((m) =>
        h(
          'div',
          { class: `msg ${m.de === 'cliente' ? '' : 'me'} ${m.de === 'agente' ? 'agent' : ''}`, 'data-tag': 'Agente IA' },
          m.texto,
        ),
      ),
      st.typing ? h('div', { class: `typing ${st.typing === 'cliente' ? '' : 'me'}` }, h('i'), h('i'), h('i')) : null,
    );
    mount(
      conv,
      h('div', { class: 'sb' }, h('span', null, horaTelefono), h('span', { class: 'sig', html: icon.signal })),
      h(
        'div',
        { class: 'ch' },
        h('button', { class: 'back', html: icon.back + `<span>${T.chats.volver}</span>`, onclick: () => closeChat() }),
        avatar(st.chat, 'sm'),
        h('div', { class: 'grow' }, h('b', null, st.chat), h('small', null, T.chats.agente)),
      ),
      list,
      h('div', { class: 'composer' }, h('div', { class: 'in' }, T.chats.escribe), h('button', { class: 'send', html: icon.send })),
    );
    list.scrollTop = list.scrollHeight;
  }

  function setChat(nombre: string, msgs: Mensaje[], typing: null | 'cliente' | 'agente' = null): void {
    st.chatMsgs.set(nombre, msgs);
    st.typing = typing;
    if (st.chat === nombre) renderConv();
  }

  /* ---------------- NEGOCIO ---------------- */
  function renderNegocio(): void {
    const reservas = (root.dataset.reservas ?? 'on') === 'on';
    mount(
      body,
      h('div', { class: 'h-title' }, T.negocio.titulo),
      h('div', { class: 'h-sub' }, `${negocio.nombre} · ${negocio.ubicacion}`),
      h('div', { class: 'sec' }, T.negocio.miLocal),
      h(
        'div',
        { class: 'card local' },
        h(
          'div',
          { class: 'top' },
          h('img', { src: fotoBarberia, alt: '' }),
          h('div', { class: 'grow' }, h('b', null, negocio.nombre), h('small', null, `Barbería · ${negocio.ubicacion}`)),
          h('span', { class: 'pill acc' }, T.negocio.verificado),
        ),
        h(
          'div',
          { class: 'tg' },
          h('div', null, h('b', null, T.negocio.aceptarReservas), h('small', null, T.negocio.aceptarReservasNota)),
          h('button', {
            class: `toggle ${reservas ? 'on' : ''}`,
            'aria-label': T.negocio.aceptarReservas,
            onclick: () => {
              root.dataset.reservas = reservas ? 'off' : 'on';
              render();
            },
          }),
        ),
      ),
      h('div', { class: 'sec' }, T.negocio.ajustes),
      h(
        'div',
        { class: 'card menu' },
        T.negocio.items.map((i) =>
          h('button', { class: 'it', onclick: () => screenToast(root, i.t) }, h('span', { class: 't' }, i.t), h('span', { class: 'd' }, i.d), h('span', { html: icon.chevron })),
        ),
        h(
          'button',
          { class: 'it', 'data-asistente': '', onclick: () => openAssistant() },
          h('span', { class: 'ic', html: icon.spark }),
          h('span', { class: 't' }, T.negocio.asistente.t, h('small', null, T.negocio.asistente.d)),
          h('span', { html: icon.chevron }),
        ),
        h(
          'button',
          { class: 'it', 'data-soporte': '', onclick: () => openSupport() },
          h('span', { class: 'ic', html: icon.support }),
          h('span', { class: 't' }, T.negocio.soporte.t, h('small', null, T.negocio.soporte.d)),
          h('span', { html: icon.chevron }),
        ),
        h('button', { class: 'it' }, h('span', { class: 't' }, T.negocio.cerrarSesion), h('span', { html: icon.chevron })),
      ),
    );
  }

  /* ---------------- ASISTENTE IA (bolita en el inicio) ---------------- */
  function renderBubble(): void {
    const show = st.burbuja && st.tab === 'agenda';
    bubble.style.display = show ? '' : 'none';
    if (!show) return;
    mount(
      bubble,
      st.burbujaTexto
        ? h('button', { class: 'say', onclick: () => openAssistant() }, h('b', null, T.asistente.nombre), T.asistente.mensaje)
        : null,
      h('button', { class: 'ball', 'aria-label': T.asistente.nombre, 'data-ai-ball': '', onclick: () => openAssistant() }, qImg(''), h('span', { class: 'badge' }, '1')),
    );
  }

  function openAssistant(): void {
    ev.asistente?.('abrir');
    const head = h('div', { class: 'ai-head' }, h('div', { class: 'ball' }, qImg('')), h('div', null, h('h3', null, T.asistente.nombre)));
    const area = h(
      'div',
      null,
      h('div', { class: 'ai-msg' }, T.asistente.mensaje),
      h('div', { class: 'ai-note' }, T.asistente.detalle),
      h(
        'div',
        { class: 'opts' },
        h(
          'button',
          {
            class: 'btn pri',
            'data-lanzar': '',
            onclick: () => {
              mount(area, h('div', { class: 'ai-msg' }, T.asistente.lanzada));
              st.burbujaTexto = false;
              renderBubble();
              ev.asistente?.('lanzar');
              setTimeout(closeSheet, 2200);
            },
          },
          T.asistente.si,
        ),
        h(
          'button',
          {
            class: 'btn soft',
            onclick: () => {
              mount(area, h('div', { class: 'ai-msg' }, T.asistente.ok));
              st.burbujaTexto = false;
              renderBubble();
              ev.asistente?.('descartar');
              setTimeout(closeSheet, 1400);
            },
          },
          T.asistente.no,
        ),
      ),
    );
    openSheet(head, area);
  }

  /* ---------------- SOPORTE (bot que sugiere y crea un ticket) ---------------- */
  function openSupport(): void {
    const S = T.soporte;
    const log = h('div', { class: 'bot' });
    const say = (txt: string | Node, me = false) => log.appendChild(h('div', { class: `m ${me ? 'me' : ''}` }, txt));
    const choices = (opts: [string, () => void][]) => {
      const box = h(
        'div',
        { class: 'choices' },
        opts.map(([t, fn]) =>
          h('button', { onclick: () => (box.remove(), say(t, true), setTimeout(fn, 450)) }, t),
        ),
      );
      log.appendChild(box);
    };
    say(S.saludo);
    choices([
      [
        S.opciones[0],
        () => {
          say(S.sugerencia);
          say(S.resuelto);
          choices([
            [S.si, () => say(S.gracias)],
            [S.ticket, () => say(h('div', { class: 'ticket', 'data-ticket': '' }, S.ticketCreado(S.numeroTicket)))],
          ]);
        },
      ],
      [S.opciones[1], () => say(S.horario)],
      [
        S.opciones[2],
        () => {
          say(S.otra);
          choices([[S.ticket, () => say(h('div', { class: 'ticket' }, S.ticketCreado(S.numeroTicket)))]]);
        },
      ],
    ]);
    openSheet(
      h('div', { class: 'ai-head' }, h('div', { class: 'ball', html: icon.support, style: 'color:#5dcbe1' }), h('h3', null, S.titulo)),
      log,
      h('button', { class: 'btn soft', style: 'width:100%', onclick: closeSheet }, S.cerrar),
    );
  }

  /* ---------------- hoja inferior ---------------- */
  function openSheet(...children: (Node | null)[]): void {
    mount(sheet, ...children);
    sheetWrap.classList.add('open');
  }
  function closeSheet(): void {
    sheetWrap.classList.remove('open');
  }

  render();

  /** API para la presentación. Cada método deja la app en un estado concreto (sirve para ir y volver). */
  return {
    el: root,
    go,
    selectDay,
    cobrar,
    descobrar,
    setFiltroAgenda: (f: Filtro) => ((st.filtro = f), render()),
    setVentas: (v: 'hoy' | 'finanzas', p: 'semana' | 'mes' = 'semana') => ((st.ventas = v), (st.periodo = p), render()),
    filtrarClientes,
    setCarlos,
    openChat,
    closeChat,
    setChat,
    openAssistant,
    openSupport,
    closeSheet,
    setBurbuja: (visible: boolean, texto = false) => ((st.burbuja = visible), (st.burbujaTexto = texto), renderBubble()),
    /** Agrega (o quita) una cita en un día: la cita del agente, la de Carlos. */
    addCita(diaId: string, cita: Cita, marcarNueva = true) {
      const d = st.dias.find((x) => x.id === diaId)!;
      if (!d.citas.some((c) => c.id === cita.id)) d.citas.push(clone(cita));
      if (marcarNueva) st.nuevas.add(cita.id);
      render();
      const el = root.querySelector<HTMLElement>(`[data-cita="${cita.id}"]`);
      el?.classList.add('nuevo-anim');
      return el;
    },
    removeCita(diaId: string, id: string) {
      const d = st.dias.find((x) => x.id === diaId)!;
      d.citas = d.citas.filter((c) => c.id !== id);
      st.nuevas.delete(id);
      render();
    },
    /** Vuelve al estado inicial de la demo. */
    reset() {
      st.dias = clone(agendaBase);
      st.nuevas.clear();
      st.pagados.clear();
      Object.assign(st, {
        tab: 'agenda',
        dia: agendaBase[0].id,
        filtro: 'Todas',
        ventas: 'hoy',
        periodo: 'semana',
        insumosAbiertos: false,
        filtroCli: 'Todos',
        carlos: 'listo',
        typing: null,
        burbuja: true,
        burbujaTexto: false,
      });
      closeChat();
      closeSheet();
      body.scrollTop = 0;
      render();
    },
    /** Estado completo de la demo (declarativo: sirve para ir y volver entre momentos). */
    setDemo(d: DemoNegocio = {}) {
      st.dias = clone(agendaBase);
      st.nuevas.clear();
      st.pagados.clear();
      for (const [diaId, cita] of d.extra ?? []) st.dias.find((x) => x.id === diaId)!.citas.push(clone(cita));
      for (const id of d.nuevas ?? []) st.nuevas.add(id);
      for (const [id, m] of d.cobradas ?? []) {
        const c = todas().find((x) => x.id === id);
        if (c) Object.assign(c, { estado: 'cobrada', metodo: m });
      }
      Object.assign(st, {
        tab: d.tab ?? 'agenda',
        dia: d.dia ?? agendaBase[0].id,
        filtro: 'Todas',
        ventas: d.ventas ?? 'hoy',
        periodo: d.periodo ?? 'semana',
        insumosAbiertos: d.insumos ?? false,
        filtroCli: d.filtroCli ?? 'Todos',
        carlos: d.carlos ?? 'listo',
        burbuja: d.burbuja?.[0] ?? true,
        burbujaTexto: d.burbuja?.[1] ?? false,
        aviso: d.aviso ?? false,
        anim: d.anim ?? '',
        countFrom: d.countFrom ?? 0,
        typing: d.chat?.typing ?? null,
      });
      if (d.chat) {
        st.chatMsgs.set(d.chat.nombre, d.chat.msgs);
        st.chat = d.chat.nombre;
        renderConv();
        conv.classList.add('open');
      } else closeChat();
      closeSheet();
      body.scrollTop = 0;
      render();
      if (d.scroll) {
        const el = typeof d.scroll === 'string' ? root.querySelector<HTMLElement>(d.scroll) : null;
        body.scrollTop = el ? el.offsetTop - 12 : Number(d.scroll) || 0;
      }
    },
    body,
    q: <E extends HTMLElement = HTMLElement>(sel: string) => root.querySelector<E>(sel),
    scrollTo(sel: string, offset = 12) {
      const el = root.querySelector<HTMLElement>(sel);
      if (el) body.scrollTo({ top: el.offsetTop - offset, behavior: 'smooth' });
    },
    get state() {
      return st;
    },
  };
}

export type NegocioApp = ReturnType<typeof createNegocioApp>;

export interface DemoNegocio {
  tab?: Tab;
  dia?: string;
  ventas?: 'hoy' | 'finanzas';
  periodo?: 'semana' | 'mes';
  insumos?: boolean;
  filtroCli?: FiltroCli;
  carlos?: EstadoCarlos;
  extra?: [string, Cita][];
  nuevas?: string[];
  cobradas?: [string, Metodo][];
  chat?: { nombre: string; msgs: Mensaje[]; typing?: null | 'cliente' | 'agente' } | null;
  burbuja?: [boolean, boolean];
  aviso?: boolean;
  scroll?: string | number;
  anim?: '' | 'ventas' | 'finanzas';
  countFrom?: number;
}

/** Cuenta un número de `from` a `to` (RD$) al aparecer el elemento. */
function countUp<E extends HTMLElement>(el: E, from: number, to: number, ms = 1100): E {
  if (from === to) return el;
  const t0 = performance.now();
  const tick = (now: number) => {
    const k = Math.min(1, (now - t0) / ms);
    const e = 1 - Math.pow(1 - k, 3);
    el.textContent = RD(Math.round((from + (to - from) * e) / 10) * 10);
    if (k < 1 && el.isConnected) requestAnimationFrame(tick);
    else el.textContent = RD(to);
  };
  el.textContent = RD(from);
  requestAnimationFrame(tick);
  return el;
}

/**
 * Tarjeta del bot de soporte (momento 11), fuera del teléfono. `paso` va de 0 a 4.
 * Mismo guion que la pestaña Negocio → Soporte.
 */
export function soporteCard(paso: number): HTMLElement {
  const S = T.soporte;
  const G = soporteGuion;
  const m = (t: string | Node, me = false, i = 0) => (i <= paso ? h('div', { class: `m ${me ? 'me' : ''}` }, t) : null);
  return h(
    'div',
    { class: 'card soporte-card' },
    h('div', { class: 'ai-head' }, h('div', { class: 'ball', html: icon.support, style: 'color:#5dcbe1' }), h('div', null, h('h3', null, S.titulo), h('small', { class: 'muted' }, G.sub))),
    h(
      'div',
      { class: 'bot' },
      m(S.saludo, false, 0),
      m(S.opciones[0], true, 1),
      m(S.sugerencia, false, 2),
      m(S.resuelto, false, 2),
      m(S.ticket, true, 3),
      paso >= 4 ? h('div', { class: 'ticket' }, S.ticketCreado(S.numeroTicket)) : null,
    ),
  );
}

function mins(hora: string): number {
  const m = hora.match(/(\d+):(\d+)\s*([ap])/i);
  if (!m) return 0;
  let hh = parseInt(m[1], 10) % 12;
  if (m[3].toLowerCase() === 'p') hh += 12;
  return hh * 60 + parseInt(m[2], 10);
}
