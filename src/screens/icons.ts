/** Íconos de línea (SVG en línea, sin archivos externos). */
const svg = (d: string, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;

export const icon = {
  agenda: svg('<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  ventas: svg('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>'),
  clientes: svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5 6.5-5s5.7 1.5 6.5 5"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14.2c2.4.2 4.2 1.6 5 4.3"/>'),
  chats: svg('<path d="M4 18.5V12a8 8 0 1 1 4.2 7l-4.2 1z"/>'),
  negocio: svg('<path d="M6 4v16M12 4v16M18 4v16"/><circle cx="6" cy="14" r="2" fill="currentColor"/><circle cx="12" cy="8" r="2" fill="currentColor"/><circle cx="18" cy="15" r="2" fill="currentColor"/>'),
  explorar: svg('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>'),
  citas: svg('<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M9 15l2 2 4-4"/>'),
  perfil: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>'),
  chat: svg('<path d="M4 18.5V12a8 8 0 1 1 4.2 7l-4.2 1z"/>'),
  arrow: svg('<path d="M4 12h16M14 6l6 6-6 6"/>'),
  back: svg('<path d="M15 5l-7 7 7 7"/>'),
  chevron: svg('<path d="M9 5l7 7-7 7"/>'),
  pin: svg('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  bell: svg('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>'),
  send: svg('<path d="M4 12l16-8-6 16-2.5-6.5z"/>'),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  star: svg('<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z" fill="currentColor" stroke="none"/>'),
  spark: svg('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/>'),
  support: svg('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/><path d="M6 6l3.5 3.5M18 6l-3.5 3.5M6 18l3.5-3.5M18 18l-3.5-3.5"/>'),
  download: svg('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
  alert: svg('<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/>'),
  phone: svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
  more: svg('<circle cx="12" cy="5" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="19" r="1.3" fill="currentColor"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  signal: `<svg viewBox="0 0 64 16" fill="currentColor"><rect x="0" y="10" width="3.5" height="5" rx="1"/><rect x="5.5" y="7" width="3.5" height="8" rx="1"/><rect x="11" y="4" width="3.5" height="11" rx="1"/><rect x="16.5" y="1" width="3.5" height="14" rx="1"/><path d="M31 5.5a9 9 0 0 1 12 0l-1.5 1.6a6.8 6.8 0 0 0-9 0zM33.8 8.6a5 5 0 0 1 6.4 0L37 12z"/><rect x="48" y="3" width="13" height="10" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="49.8" y="4.8" width="8.5" height="6.4" rx="1.2"/><rect x="61.8" y="6.3" width="1.4" height="3.4" rx=".7"/></svg>`,
};
