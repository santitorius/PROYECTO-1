/**
 * TODO el texto y los datos de la presentación viven aquí.
 * Edita este archivo para cambiar frases, notas del orador o datos de ejemplo.
 * Cualquier dato sin confirmar se escribe como pendiente('...') para que se vea en pantalla
 * y quede listado en PENDIENTES.md.
 */

export const pendiente = (que: string): string => `[PENDIENTE: ${que}]`;

export const marca = {
  empresa: 'Quovix AI',
  appCliente: 'Quovix',
  appNegocio: 'Quovix AI | Negocios',
  eslogan: 'No vendemos tecnología, devolvemos tiempo.',
  /** SOLO dentro de la pantalla de la app del cliente */
  esloganAppCliente: 'Tu cita perfecta, en segundos.',
  contacto: pendiente('contacto real'),
  whatsappDemo: pendiente('contacto real'),
};

export const ui = {
  datosDeEjemplo: 'Datos de ejemplo',
  minutosDevueltos: 'minutos devueltos',
  minutosDevueltosTotal: 'minutos devueltos en esta demo',
  irAMomento: 'Ir al momento',
  irAMomentoAyuda: 'Escribe el número y pulsa Enter',
  vistaGeneral: 'Vista general',
  vistaGeneralAyuda: 'Elige un momento · Esc para cerrar',
  modoAuto: 'Modo automático',
  sinWebGL: 'Este equipo no soporta 3D. Se muestra la versión 2D.',
  presentador: {
    titulo: 'Modo presentador',
    ahora: 'Ahora',
    siguiente: 'Sigue',
    notas: 'Notas',
    tiempo: 'Tiempo',
    anterior: '← Anterior',
    proximo: 'Siguiente →',
    fin: 'Fin de la presentación',
    inicio: 'Inicio · pantalla en negro',
    bloqueado: 'El navegador bloqueó la ventana del presentador. Permite ventanas emergentes para este archivo.',
  },
  atajos: '→ / espacio / clic: avanzar · ←: retroceder · P: presentador · G: ir a · F: pantalla completa · A: automático · Esc: vista general',
};

export interface Momento {
  n: number;
  titulo: string;
  /** frases que aparecen en escena (fuera de los teléfonos) */
  frases: string[];
  /** minutos devueltos que suma este momento (estimaciones ilustrativas de la demo) */
  minutos: number;
  notas: string;
}

export const momentos: Momento[] = [
  {
    n: 1,
    titulo: 'Apertura',
    frases: ['Mientras tú cortas, tu WhatsApp pierde citas.'],
    minutos: 0,
    notas:
      'Silencio dos segundos. Deja que la Q se forme. Lee la frase despacio. Pregunta: "¿Cuántos mensajes tienes sin contestar ahora mismo?"',
  },
  {
    n: 2,
    titulo: 'El problema',
    frases: ['Cada chat sin responder es una cita que se va.', marca.eslogan],
    minutos: 0,
    notas:
      'Señala las burbujas: son clientes que escribieron mientras estabas trabajando. El cuaderno no avisa, no recuerda, no cobra. Cierra con el eslogan.',
  },
  {
    n: 3,
    titulo: 'Agenda',
    frases: ['Tu día completo, en una pantalla.'],
    minutos: 0,
    notas:
      'Barbería El Patio. 8 de 12 huecos ocupados. Muestra la próxima cita y el botón de cobrar. Puedes tocar otro día en la agenda.',
  },
  {
    n: 4,
    titulo: 'Agente de WhatsApp',
    frases: ['Respondió mientras tú cortabas.'],
    minutos: 12,
    notas:
      'El cliente escribe como escribe la gente aquí. El agente responde, ofrece horas reales y confirma. Tú no tocaste el teléfono.',
  },
  {
    n: 5,
    titulo: 'El tiempo pasa',
    frases: ['Algunos clientes dejan de venir. Nadie se da cuenta.'],
    minutos: 0,
    notas: 'Cada punto es un cliente. Los que no vuelven se apagan. Mira a Carlos.',
  },
  {
    n: 6,
    titulo: 'Cliente en riesgo',
    frases: ['Carlos lleva 7 semanas sin venir. Escríbele hoy.'],
    minutos: 8,
    notas:
      'El mensaje ya está redactado. Un toque y se envía por WhatsApp. Toca "Enviar mensaje por WhatsApp" en vivo.',
  },
  {
    n: 7,
    titulo: 'Cobrar',
    frases: ['Cobras con un toque. Queda registrado.'],
    minutos: 2,
    notas: 'Toca "Cobrar RD$600". Efectivo, tarjeta o transferencia: se registra a mano, sin cuadernos.',
  },
  {
    n: 8,
    titulo: 'Ventas y finanzas',
    frases: ['Tu semana, cuadrada sola.'],
    minutos: 45,
    notas: 'Del total a los métodos de pago y al neto. El reporte se descarga en PDF.',
  },
  {
    n: 9,
    titulo: 'Equipo e insumos',
    frases: ['Cada quien sabe lo que se ganó.'],
    minutos: 30,
    notas: 'Marcos, Luis y Andy con su regla de pago del 40%. Los insumos y lo que queda en inventario.',
  },
  {
    n: 10,
    titulo: 'App del cliente',
    frases: [],
    minutos: 15,
    notas:
      'Esto es lo que ve tu cliente. Entra con un código por WhatsApp, sin contraseñas. Reserva, repite y acumula puntos.',
  },
  {
    n: 11,
    titulo: 'Asistente IA',
    frases: ['Te avisa antes de que lo notes.'],
    minutos: 10,
    notas: 'El asistente mira tus números y te propone qué hacer. Si necesitas ayuda, el bot de soporte crea un ticket.',
  },
  {
    n: 12,
    titulo: 'Próximamente',
    frases: ['Próximamente: pago en línea'],
    minutos: 0,
    notas: 'Solo se menciona. No está disponible todavía. No prometas fecha.',
  },
  {
    n: 13,
    titulo: 'Planes y cierre',
    frases: ['Hablemos de un plan según el tamaño de tu negocio.', marca.eslogan],
    minutos: 0,
    notas: 'Pregunta cuántas sillas o profesionales tienen. Invita a agendar la demo por WhatsApp.',
  },
];

export const cierre = {
  boton: 'Agenda tu demo por WhatsApp',
  contacto: marca.contacto,
};

/* ---------------- Datos de demostración (ficticios) ---------------- */

export const negocio = {
  nombre: 'Barbería El Patio',
  ubicacion: pendiente('Piantini o Zona Colonial'),
  equipo: ['Marcos G.', 'Luis P.', 'Andy R.'],
};

export const servicios = [
  { nombre: 'Corte de cabello', precio: 600, minutos: 40 },
  { nombre: 'Corte + barba', precio: 850 },
  { nombre: 'Barba', precio: 350 },
  { nombre: 'Cejas', precio: 150 },
  { nombre: 'Corte niño', precio: 400 },
  { nombre: 'Tinte', precio: 1200 },
];

export const clientes = [
  { nombre: 'Luis Duarte', segmento: 'Nuevo' },
  { nombre: 'Junior Martínez', segmento: 'VIP' },
  { nombre: 'Wilson Reyes', segmento: 'Habitual' },
  { nombre: 'Carlos Peña', segmento: 'En riesgo' },
] as const;

export const promos = [
  { titulo: '20%', detalle: 'En corte.' },
  { titulo: '2x1', detalle: 'En cejas al reservar corte + barba.' },
];

export const agendaHoy = {
  ocupados: 8,
  huecos: 12,
};

export const reporteSemanal = {
  ingresos: 38400,
  insumos: 2900,
  pagoEquipo: 15360,
  neto: 20140,
  porMetodo: { efectivo: 17400, tarjeta: 12600, transferencia: 8400 },
};

export const equipoPagos = {
  regla: 0.4,
  profesionales: [
    { nombre: 'Marcos G.', servicios: 31, generado: 17800, aPagar: 7120 },
    { nombre: 'Luis P.', servicios: 24, generado: 12600, aPagar: 5040 },
    { nombre: 'Andy R.', servicios: 12, generado: 8000, aPagar: 3200 },
  ],
};

export const clienteEnRiesgo = {
  nombre: 'Carlos Peña',
  frecuencia: 'Corte cada 3 semanas',
  semanasSinVenir: 7,
  gastoHistorico: 5400,
  riesgo: 'Alto',
};

export const conversacionAgente: { de: 'cliente' | 'agente'; texto: string }[] = [
  { de: 'cliente', texto: 'Klk, ¿tienen chance mañana pa un corte y barba?' },
  {
    de: 'agente',
    texto: '¡Hola, Luis! Sí. Mañana sábado tengo 10:00 a. m., 2:30 p. m. y 5:30 p. m. con Marcos. ¿Cuál te sirve?',
  },
  { de: 'cliente', texto: '2:30' },
  {
    de: 'agente',
    texto: 'Listo: sábado 2:30 p. m., Corte + barba con Marcos, RD$850. Te aviso 2 horas antes. ¿Confirmo?',
  },
  { de: 'cliente', texto: 'Dale' },
  { de: 'agente', texto: 'Confirmada ✅ Si necesitas cambiarla, escríbeme hasta 3 horas antes sin costo.' },
];

export const formatoRD = (n: number): string => 'RD$' + n.toLocaleString('en-US');

/* =====================================================================
 * PANTALLAS · datos y textos de las apps (etapa 2)
 * ===================================================================== */

export type Metodo = 'efectivo' | 'tarjeta' | 'transferencia';
export const metodos: { id: Metodo; nombre: string }[] = [
  { id: 'efectivo', nombre: 'Efectivo' },
  { id: 'tarjeta', nombre: 'Tarjeta' },
  { id: 'transferencia', nombre: 'Transferencia' },
];

/** Hora que marca la barra de estado de los teléfonos (hoy, 3:05 p. m.). */
export const horaTelefono = '3:05';
export const minutoActual = 15 * 60 + 5;

export interface Cita {
  id: string;
  hora: string;
  min: number;
  cliente: string;
  servicio: string;
  precio: number;
  pro: string;
  estado: 'pendiente' | 'cobrada' | 'no-vino';
  metodo?: Metodo;
  origen: 'Agente IA' | 'Reserva app' | 'En el local';
}

export interface Dia {
  id: string;
  corto: string;
  num: number;
  largo: string;
  cerrado?: boolean;
  huecos: number;
  citas: Cita[];
}

const c = (
  id: string,
  hora: string,
  cliente: string,
  servicio: string,
  precio: number,
  pro: string,
  estado: Cita['estado'] = 'pendiente',
  metodo?: Metodo,
  origen: Cita['origen'] = 'Reserva app',
  min = 40,
): Cita => ({ id, hora, min, cliente, servicio, precio, pro, estado, metodo, origen });

/** Agenda de la semana. Hoy: 8 de 12 huecos (67 %). */
export const agenda: Dia[] = [
  {
    id: 'vie25',
    corto: 'Hoy',
    num: 25,
    largo: 'Hoy 25 sep',
    huecos: 12,
    citas: [
      c('a1', '9:00 a. m.', 'Junior Martínez', 'Corte + barba', 850, 'Marcos G.', 'cobrada', 'tarjeta', 'Agente IA', 60),
      c('a2', '10:00 a. m.', 'Pedro Almonte', 'Corte de cabello', 600, 'Luis P.', 'cobrada', 'efectivo'),
      c('a3', '11:00 a. m.', 'Miguel Santana', 'Barba', 350, 'Andy R.', 'cobrada', 'transferencia', 'En el local', 20),
      c('a4', '12:30 p. m.', 'Samuel Díaz', 'Corte niño', 400, 'Marcos G.', 'cobrada', 'efectivo', 'Agente IA', 30),
      c('a5', '2:00 p. m.', 'Ramón Castillo', 'Tinte', 1200, 'Luis P.', 'cobrada', 'tarjeta', 'Reserva app', 60),
      c('a6', '3:30 p. m.', 'Wilson Reyes', 'Corte de cabello', 600, 'Marcos G.', 'pendiente', undefined, 'Agente IA'),
      c('a7', '4:30 p. m.', 'Kelvin Rosario', 'Corte + barba', 850, 'Andy R.', 'pendiente', undefined, 'Reserva app', 60),
      c('a8', '6:00 p. m.', 'José Peralta', 'Cejas', 150, 'Luis P.', 'pendiente', undefined, 'Agente IA', 15),
    ],
  },
  {
    id: 'sab26',
    corto: 'Sáb',
    num: 26,
    largo: 'Sábado 26 sep',
    huecos: 12,
    citas: [
      c('b1', '9:00 a. m.', 'Wilson Reyes', 'Barba', 350, 'Luis P.'),
      c('b2', '11:00 a. m.', 'Junior Martínez', 'Corte de cabello', 600, 'Marcos G.', 'pendiente', undefined, 'Agente IA'),
      c('b3', '12:00 p. m.', 'Pedro Almonte', 'Corte niño', 400, 'Andy R.'),
      c('b4', '1:00 p. m.', 'Kelvin Rosario', 'Corte de cabello', 600, 'Marcos G.'),
      c('b5', '3:30 p. m.', 'Ramón Castillo', 'Corte + barba', 850, 'Luis P.', 'pendiente', undefined, 'Agente IA', 60),
      c('b6', '4:30 p. m.', 'Miguel Santana', 'Corte de cabello', 600, 'Marcos G.'),
      c('b7', '6:30 p. m.', 'José Peralta', 'Corte + barba', 850, 'Andy R.', 'pendiente', undefined, 'Agente IA', 60),
    ],
  },
  { id: 'dom27', corto: 'Dom', num: 27, largo: 'Domingo 27 sep', cerrado: true, huecos: 0, citas: [] },
  {
    id: 'lun28',
    corto: 'Lun',
    num: 28,
    largo: 'Lunes 28 sep',
    huecos: 12,
    citas: [
      c('d1', '10:00 a. m.', 'Samuel Díaz', 'Corte niño', 400, 'Andy R.'),
      c('d2', '11:30 a. m.', 'Junior Martínez', 'Barba', 350, 'Marcos G.', 'pendiente', undefined, 'Agente IA', 20),
      c('d3', '1:00 p. m.', 'Pedro Almonte', 'Corte de cabello', 600, 'Luis P.'),
      c('d4', '5:00 p. m.', 'Kelvin Rosario', 'Cejas', 150, 'Andy R.', 'pendiente', undefined, 'Agente IA', 15),
      c('d5', '6:00 p. m.', 'Ramón Castillo', 'Corte de cabello', 600, 'Luis P.'),
    ],
  },
  {
    id: 'mar29',
    corto: 'Mar',
    num: 29,
    largo: 'Martes 29 sep',
    huecos: 12,
    citas: [
      c('e1', '10:00 a. m.', 'Miguel Santana', 'Corte de cabello', 600, 'Marcos G.'),
      c('e2', '11:00 a. m.', 'José Peralta', 'Barba', 350, 'Andy R.', 'pendiente', undefined, 'Agente IA', 20),
      c('e3', '1:30 p. m.', 'Wilson Reyes', 'Corte de cabello', 600, 'Marcos G.', 'pendiente', undefined, 'Agente IA'),
      c('e4', '3:00 p. m.', 'Pedro Almonte', 'Cejas', 150, 'Luis P.', 'pendiente', undefined, 'Reserva app', 15),
      c('e5', '4:00 p. m.', 'Samuel Díaz', 'Corte niño', 400, 'Andy R.'),
      c('e6', '6:00 p. m.', 'Kelvin Rosario', 'Corte + barba', 850, 'Luis P.', 'pendiente', undefined, 'Agente IA', 60),
    ],
  },
  {
    id: 'mie30',
    corto: 'Mié',
    num: 30,
    largo: 'Miércoles 30 sep',
    huecos: 12,
    citas: [
      c('f1', '9:30 a. m.', 'Ramón Castillo', 'Barba', 350, 'Luis P.', 'pendiente', undefined, 'Agente IA', 20),
      c('f2', '11:00 a. m.', 'Junior Martínez', 'Corte + barba', 850, 'Marcos G.', 'pendiente', undefined, 'Agente IA', 60),
      c('f3', '2:00 p. m.', 'Kelvin Rosario', 'Corte de cabello', 600, 'Andy R.'),
      c('f4', '3:00 p. m.', 'Pedro Almonte', 'Corte de cabello', 600, 'Marcos G.'),
      c('f5', '4:30 p. m.', 'José Peralta', 'Corte niño', 400, 'Luis P.'),
      c('f6', '5:30 p. m.', 'Miguel Santana', 'Cejas', 150, 'Andy R.', 'pendiente', undefined, 'Agente IA', 15),
      c('f7', '6:30 p. m.', 'Samuel Díaz', 'Corte de cabello', 600, 'Marcos G.'),
    ],
  },
  {
    id: 'jue1',
    corto: 'Jue',
    num: 1,
    largo: 'Jueves 1 oct',
    huecos: 12,
    citas: [
      c('g1', '10:00 a. m.', 'Wilson Reyes', 'Corte + barba', 850, 'Marcos G.', 'pendiente', undefined, 'Agente IA', 60),
      c('g2', '12:00 p. m.', 'Kelvin Rosario', 'Barba', 350, 'Andy R.', 'pendiente', undefined, 'Reserva app', 20),
      c('g3', '2:30 p. m.', 'Pedro Almonte', 'Corte de cabello', 600, 'Luis P.'),
      c('g4', '4:00 p. m.', 'Junior Martínez', 'Corte de cabello', 600, 'Marcos G.', 'pendiente', undefined, 'Agente IA'),
      c('g5', '5:30 p. m.', 'Ramón Castillo', 'Tinte', 1200, 'Luis P.', 'pendiente', undefined, 'Reserva app', 60),
    ],
  },
];

/** La cita que agenda el agente de WhatsApp (momento 4). */
export const citaNuevaAgente: Cita = c(
  'b-luis',
  '2:30 p. m.',
  'Luis Duarte',
  'Corte + barba',
  850,
  'Marcos G.',
  'pendiente',
  undefined,
  'Agente IA',
  60,
);
export const citaNuevaAgenteDia = 'sab26';

/** La cita que agenda Carlos al responder (momento 6). */
export const citaCarlos: Cita = c('d-carlos', '4:00 p. m.', 'Carlos Peña', 'Corte de cabello', 600, 'Marcos G.', 'pendiente', undefined, 'Agente IA');
export const citaCarlosDia = 'lun28';

export const appNegocio = {
  marca: 'Negocios',
  nuevaCita: '+ Cita',
  tabs: { agenda: 'Agenda', ventas: 'Ventas', clientes: 'Clientes', chats: 'Chats', negocio: 'Negocio' },
  agenda: {
    sigueAhora: 'Sigue ahora',
    enMinutos: (m: number) => (m <= 0 ? 'Ahora' : m < 60 ? `En ${m} min` : `En ${Math.floor(m / 60)} h ${m % 60 ? (m % 60) + ' min' : ''}`.trim()),
    cobrar: 'Cobrar',
    escribir: 'Escribir',
    noVino: 'No vino',
    cobrada: 'Cobrada',
    marcadoNoVino: 'No vino',
    citas: 'Citas',
    esperado: 'Esperado',
    cobrado: 'Cobrado',
    libres: 'Libres',
    ocupacion: 'Ocupación',
    huecosLibres: (n: number) => `${n} huecos libres`,
    filtros: ['Todas', 'Pendientes', 'Cobradas'] as const,
    cerrado: 'Cerrado',
    cerradoDetalle: 'Los domingos no abrimos. Nadie puede reservar este día.',
    todoCobrado: 'Todo cobrado por hoy.',
    sinPendientes: 'No quedan citas pendientes.',
    conPro: 'con',
    nueva: 'Nueva',
    elegirMetodo: '¿Cómo pagó?',
    cobradoOk: (m: string) => `Cobrado en ${m.toLowerCase()} ✓`,
    cancelar: 'Cancelar',
  },
  ventas: {
    titulo: 'Ventas y finanzas',
    subtitulo: 'Ingresos, gastos y pagos del periodo',
    hoy: 'Hoy',
    finanzas: 'Finanzas',
    cobradoHoy: 'Cobrado hoy',
    serviciosCobrados: (n: number, esperado: string) => `${n} servicios cobrados · ${esperado} esperado`,
    cobrosDeHoy: 'Cobros de hoy',
    semana: 'Semana',
    mes: 'Mes',
    semanaRango: '14 al 20 sep 2026',
    semanaNota: 'Semana pasada',
    mesRango: 'Septiembre 2026',
    mesNota: 'Del 1 al 25 de septiembre',
    resultado: 'Resultado del periodo',
    ingresos: 'Ingresos',
    insumos: 'Insumos comprados',
    pagoEquipo: 'Pago al equipo',
    neto: 'Neto',
    porMetodo: 'Ingresos por método',
    porDia: 'Ingresos por día',
    equipo: 'Equipo',
    aPagarTotal: (m: string) => `A pagar en total: ${m}`,
    servicios: 'servicios',
    generados: 'generados',
    aPagar: 'A pagar',
    pagado: 'Pagado',
    pendiente: 'Pendiente',
    regla: (p: number) => `Regla: ${Math.round(p * 100)} % de lo generado`,
    marcarPagado: 'Marcar pagado',
    yaPagado: 'Pagado ✓',
    reglaPago: 'Regla de pago',
    insumosTitulo: 'Insumos',
    compras: (n: number) => `en ${n} compras del periodo`,
    inventario: 'Valor del inventario actual',
    verInsumos: 'Ver insumos →',
    ocultarInsumos: 'Ocultar insumos ↑',
    masVendidos: 'Servicios más vendidos',
    descargarPdf: 'Descargar PDF',
    pdfNota: 'Informe del periodo con ingresos, equipo, insumos y servicios.',
    pdfListo: 'PDF listo: Reporte semanal 14–20 sep',
  },
  clientes: {
    titulo: 'Clientes',
    resumen: (n: number, vip: number, riesgo: number) => `${n} clientes · ${vip} VIP · ${riesgo} en riesgo`,
    buscar: 'Busca por nombre o teléfono…',
    filtros: ['Todos', 'VIP', 'Habitual', 'Nuevo', 'En riesgo'] as const,
    ultima: 'Última',
    primera: 'Primera cita',
    visitas: 'Visitas',
    favorito: 'Favorito',
    nuevaCita: 'Nueva cita',
    chat: 'Chat',
    alertaTitulo: 'Cliente en riesgo',
    alerta: (n: string, s: number) => `${n} lleva ${s} semanas sin venir. Escríbele hoy.`,
    venia: 'Venía',
    gasto: 'Gasto histórico',
    riesgo: 'Riesgo',
    mensajeListo: 'Mensaje listo para enviar',
    enviar: 'Enviar mensaje por WhatsApp',
    enviado: 'Enviado ✓ · Esperando respuesta',
    respondio: 'Respondió y reservó ✓',
    sinResultados: 'No hay clientes en este filtro.',
  },
  chats: {
    titulo: 'Chats',
    subtitulo: 'Responde rápido: cada chat es una cita que se salva.',
    agente: 'Atendido por el agente Quovix AI',
    escribe: 'Escribe un mensaje',
    volver: 'Chats',
    nota: 'El botón «Escribir» de la agenda abre el chat del cliente.',
  },
  negocio: {
    titulo: 'Mi negocio',
    miLocal: 'Mi local',
    verificado: 'Verificado',
    aceptarReservas: 'Aceptar reservas',
    aceptarReservasNota: 'Visible en la app del cliente',
    ajustes: 'Ajustes del negocio',
    items: [
      { t: 'Servicios y precios', d: '6 activos' },
      { t: 'Equipo', d: '3 personas · 3 activas' },
      { t: 'Horario', d: 'LUN a SÁB · 9:00 a. m. a 8:00 p. m.' },
      { t: 'Promociones', d: '2 activas' },
      { t: 'Insumos', d: 'Al día' },
    ],
    asistente: { t: 'Asistente IA', d: 'Analiza tu negocio' },
    soporte: { t: 'Soporte', d: 'Reporta una falla o sugiere algo' },
    cerrarSesion: 'Cerrar sesión',
  },
  asistente: {
    nombre: 'Asistente IA',
    mensaje: 'Tus martes bajaron. Tienes 6 huecos libres. ¿Lanzo una promo?',
    detalle: 'Martes 29 sep: 6 de 12 huecos ocupados. La semana pasada el martes fue tu día más flojo (RD$3,200).',
    si: 'Lanzar promo',
    no: 'Ahora no',
    lanzada: 'Listo: 20% en corte este martes. Ya aparece en la app del cliente.',
    ok: 'Entendido. Te aviso si cambia.',
  },
  soporte: {
    titulo: 'Soporte',
    saludo: 'Hola 👋 ¿En qué te ayudo?',
    opciones: ['No me llegan las reservas', 'Cambiar el horario', 'Otra cosa'],
    sugerencia:
      'Revisa que «Aceptar reservas» esté activo en Negocio. Si está activo y siguen sin llegar, lo revisamos nosotros.',
    resuelto: '¿Se resolvió?',
    si: 'Sí, gracias',
    ticket: 'No, crear ticket',
    ticketCreado: (n: string) => `Ticket ${n} creado. Te escribimos por WhatsApp.`,
    numeroTicket: '#QX-1042',
    gracias: '¡Perfecto! Aquí estoy si necesitas algo.',
    horario: 'Cambia tu horario en Negocio → Horario. Los clientes lo ven al momento.',
    otra: 'Cuéntame qué pasa y creo un ticket para el equipo.',
    cerrar: 'Cerrar',
  },
};

export interface ClienteNegocio {
  nombre: string;
  segmento: 'VIP' | 'Habitual' | 'Nuevo' | 'En riesgo';
  ultima?: string;
  primera?: string;
  visitas: number;
  gasto: number;
  favorito: string;
}

export const clientesNegocio: ClienteNegocio[] = [
  { nombre: 'Carlos Peña', segmento: 'En riesgo', ultima: '7 ago', visitas: 9, gasto: 5400, favorito: 'Corte de cabello' },
  { nombre: 'Junior Martínez', segmento: 'VIP', ultima: 'Hoy', visitas: 26, gasto: 21400, favorito: 'Corte + barba' },
  { nombre: 'Wilson Reyes', segmento: 'Habitual', ultima: '11 sep', visitas: 14, gasto: 8400, favorito: 'Corte de cabello' },
  { nombre: 'Luis Duarte', segmento: 'Nuevo', primera: 'Sáb 26 sep', visitas: 0, gasto: 0, favorito: 'Corte + barba' },
  { nombre: 'Ramón Castillo', segmento: 'VIP', ultima: 'Hoy', visitas: 19, gasto: 16800, favorito: 'Tinte' },
  { nombre: 'Pedro Almonte', segmento: 'Habitual', ultima: 'Hoy', visitas: 11, gasto: 6200, favorito: 'Corte de cabello' },
  { nombre: 'Kelvin Rosario', segmento: 'Habitual', ultima: '12 sep', visitas: 8, gasto: 5900, favorito: 'Corte + barba' },
  { nombre: 'Miguel Santana', segmento: 'Habitual', ultima: 'Hoy', visitas: 7, gasto: 2800, favorito: 'Barba' },
  { nombre: 'Samuel Díaz', segmento: 'Nuevo', ultima: 'Hoy', visitas: 2, gasto: 800, favorito: 'Corte niño' },
  { nombre: 'José Peralta', segmento: 'Nuevo', primera: 'Hoy', visitas: 0, gasto: 0, favorito: 'Cejas' },
];

/** Mensaje ya redactado para Carlos (momento 6). */
export const mensajeCarlos =
  '¡Hola, Carlos! Hace rato no te vemos por El Patio. Marcos tiene espacio el lunes. ¿Te separo tu corte?';
export const respuestaCarlos = 'Dale, el lunes a las 4 me sirve 👍';
export const confirmacionCarlos = 'Listo: lunes 28, 4:00 p. m., Corte de cabello con Marcos. ¡Te esperamos!';

export const chatsNegocio = [
  { nombre: 'Luis Duarte', ultimo: 'Agente: Confirmada ✅ Si necesitas cambiarla…', hace: 'ahora', agente: true },
  { nombre: 'Junior Martínez', ultimo: 'Tú: ¡Gracias, Junior! Nos vemos el sábado.', hace: 'hace 2 h', agente: false },
  { nombre: 'Kelvin Rosario', ultimo: 'Agente: Te espero a las 4:30 p. m. con Andy.', hace: 'hace 3 h', agente: true },
  { nombre: 'José Peralta', ultimo: 'Agente: Listo, cejas hoy a las 6:00 p. m.', hace: 'hace 5 h', agente: true },
];

export const reporteDias = [
  { d: 'Lun', v: 4800 },
  { d: 'Mar', v: 3200 },
  { d: 'Mié', v: 5600 },
  { d: 'Jue', v: 6400 },
  { d: 'Vie', v: 8200 },
  { d: 'Sáb', v: 10200 },
  { d: 'Dom', v: 0, cerrado: true },
];

export const reporteMes = {
  ingresos: 142600,
  insumos: 9800,
  pagoEquipo: 57040,
  neto: 75760,
  porMetodo: { efectivo: 64300, tarjeta: 46900, transferencia: 31400 },
  profesionales: [
    { nombre: 'Marcos G.', servicios: 115, generado: 66100, aPagar: 26440 },
    { nombre: 'Luis P.', servicios: 89, generado: 46700, aPagar: 18680 },
    { nombre: 'Andy R.', servicios: 45, generado: 29800, aPagar: 11920 },
  ],
};

export const insumos = {
  compras: [
    { nombre: 'Navajas desechables (caja de 100)', monto: 650, stock: '180 u.' },
    { nombre: 'Cera y pomada (6 u.)', monto: 900, stock: '9 u.' },
    { nombre: 'Talco y after shave', monto: 450, stock: '5 u.' },
    { nombre: 'Toallas y capas', monto: 900, stock: '24 u.' },
  ],
  inventario: 6850,
};

/** Suman 67 servicios y RD$38,400, igual que el reporte semanal. */
export const serviciosVendidos = [
  { nombre: 'Corte de cabello', n: 24 },
  { nombre: 'Corte + barba', n: 17 },
  { nombre: 'Barba', n: 9 },
  { nombre: 'Cejas', n: 8 },
  { nombre: 'Corte niño', n: 7 },
  { nombre: 'Tinte', n: 2 },
];

/* ---------------- App del cliente (Quovix) ---------------- */

export const appCliente = {
  subtituloBienvenida: 'Los mejores salones, barberías y spas de Santo Domingo. Reserva en segundos y gana puntos en cada visita.',
  crearCuenta: 'Crear cuenta',
  yaTengoCuenta: 'Ya tengo cuenta',
  tuNumero: 'Tu número',
  tuNumeroNota: 'Te enviaremos un código por WhatsApp para entrar. Sin contraseñas.',
  prefijo: '+1',
  numero: '809-555-0147',
  continuar: 'Continuar',
  codigo: 'Código de verificación',
  codigoNota: 'Enviado por WhatsApp al +1 809 555 0147',
  codigoDigitos: '4821',
  reenviar: 'Reenviar código',
  entrar: 'Entrar',
  comoTeLlamas: '¿Cómo te llamas?',
  comoTeLlamasNota: 'Así te saludamos y aparecerá en tus reservas.',
  nombre: 'Carlos Peña',
  ciudad: 'Santo Domingo | Hoy',
  hola: (n: string) => `Hola, ${n}`,
  queTeHacemos: '¿Qué te hacemos hoy?',
  buscar: 'Busca aquí',
  vuelveARegresar: 'Vuelve a regresar',
  categorias: 'Categorías',
  cats: ['Barbería', 'Salón de belleza', 'Uñas', 'Spa'],
  promosSemana: 'Promos de la semana',
  destacados: 'Destacados cerca de ti',
  desde: (m: string) => `Desde ${m}`,
  tabs: { explorar: 'Explorar', citas: 'Citas', chats: 'Chats', perfil: 'Perfil' },
  misCitas: 'Mis citas',
  proximas: 'Próximas',
  historial: 'Historial',
  repetir: 'Repetir',
  verDetalle: 'Ver',
  reservar: 'Reservar',
  eligeServicio: 'Elige el servicio',
  eligeHora: 'Elige la hora',
  confirmar: 'Confirmar cita',
  pagasEnElLocal: 'Pagas en el local: efectivo, tarjeta o transferencia.',
  reservada: '¡Reservada!',
  reservadaNota: 'Te avisamos por WhatsApp 24 h y 2 h antes.',
  verMisCitas: 'Ver mis citas',
  tusPuntos: 'Tus puntos',
  puntos: 108,
  puntosMeta: 500,
  puntosNota: (faltan: number) => `A ${faltan} pts de canjear RD$500 de descuento`,
  puntosRegla: 'Ganas 1 punto por cada RD$50. Al llegar a 500 pts: RD$500 de descuento.',
  movimientos: 'Movimientos',
  perfilMenu: ['Notificaciones', 'Mis favoritos', 'Puntos y recompensas', 'Ayuda y contacto', 'Cerrar sesión'],
  chatsTitulo: 'Chats',
  chatsNota: 'Cuando reservas, el chat con el negocio se abre aquí para coordinar tu cita.',
  valoracion: '4.8',
  abiertoHoy: 'Abierto hoy · hasta 8:00 p. m.',
};

export const citasCliente = {
  proxima: {
    negocio: 'Barbería El Patio',
    fecha: 'Lun 28 sep',
    hora: '4:00 p. m.',
    servicio: 'Corte de cabello',
    pro: 'Marcos G.',
  },
  historial: [
    { negocio: 'Barbería El Patio', fecha: '7 ago', servicio: 'Corte de cabello' },
    { negocio: 'Barbería El Patio', fecha: '17 jul', servicio: 'Corte de cabello' },
    { negocio: 'Barbería El Patio', fecha: '26 jun', servicio: 'Corte de cabello' },
  ],
  movimientos: [
    { t: 'Corte de cabello · El Patio', f: '7 ago', pts: 12 },
    { t: 'Corte de cabello · El Patio', f: '17 jul', pts: 12 },
    { t: 'Corte de cabello · El Patio', f: '26 jun', pts: 12 },
  ],
};

export const negociosCliente = [
  { nombre: 'Barbería El Patio', cat: 'Barbería', foto: 'barberia', zona: negocio.ubicacion, desde: 150 },
  { nombre: 'Studio Aura', cat: 'Salón de belleza', foto: 'salon', zona: 'Naco', desde: 500 },
  { nombre: 'Nails Bar', cat: 'Uñas', foto: 'unas', zona: 'Bella Vista', desde: 450 },
  { nombre: 'Casa Spa Zen', cat: 'Spa', foto: 'spa', zona: 'Gazcue', desde: 1800 },
];

export const promosCliente = [
  { grande: '20%', negocio: 'Barbería El Patio', detalle: 'En corte.' },
  { grande: '2x1', negocio: 'Barbería El Patio', detalle: 'En cejas al reservar corte + barba.' },
];

/** Horas libres que ve el cliente al reservar en la app (sábado, después de la cita de Luis). */
export const reservaCliente = {
  dia: 'Sáb 26 sep',
  horas: ['10:00 a. m.', '12:30 p. m.', '5:30 p. m.'],
  pro: 'Marcos G.',
};

/* ---------------- WhatsApp (teléfono del cliente) ---------------- */
export const whatsapp = {
  negocio: 'Barbería El Patio',
  iniciales: 'EP',
  estado: 'en línea',
  escribiendo: 'escribiendo…',
  hoy: 'Hoy',
  escribe: 'Mensaje',
};
