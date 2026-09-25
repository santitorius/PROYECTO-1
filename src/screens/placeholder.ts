import wordmarkUrl from '../../assets/logo/quovix-ai-wordmark.svg';
import { qImg } from '../core/logo';
import { marca, pantallaBloqueo as L } from '../content.es';

/**
 * Pantallas provisionales de la etapa 1 (sirven para probar la escena y la interactividad).
 * En la etapa 2 se reemplazan por la Agenda, el chat, etc.
 */
export function lockScreen(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'scr scr-bg lock';
  el.innerHTML = `<div class="island"></div>
    <div class="date">${L.fecha}</div>
    <div class="time">${L.hora}</div>
    <img class="wordmark" src="${wordmarkUrl}" alt="Quovix AI" draggable="false" />
    <div class="tag">Negocios</div>
    <button class="test" type="button">${L.aviso}</button>`;
  const b = el.querySelector<HTMLButtonElement>('.test')!;
  b.addEventListener('click', () => {
    const ok = b.classList.toggle('ok');
    b.textContent = ok ? L.tocado : L.aviso;
  });
  return el;
}

export function clientSplash(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'scr scr-bg splash';
  // "Tu cita perfecta, en segundos." solo vive dentro de la app del cliente.
  const [a, b, c] = marca.esloganAppCliente.replace('.', '').split(/\s(?=perfecta|en)/i);
  el.innerHTML = `<div class="island"></div>
    <h1>${a}<br><em>${b}</em><br>${c}.</h1>`;
  el.prepend(qImg('q'));
  return el;
}
