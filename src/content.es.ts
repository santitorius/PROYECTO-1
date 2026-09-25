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

/** Pantalla de bloqueo del teléfono (etapa 1, se reemplaza por las pantallas reales en la etapa 2) */
export const pantallaBloqueo = {
  hora: '9:41',
  fecha: 'viernes, 25 de septiembre',
  aviso: 'Toca para probar la pantalla',
  tocado: 'Pantalla interactiva ✓',
};

export const formatoRD = (n: number): string => 'RD$' + n.toLocaleString('en-US');
