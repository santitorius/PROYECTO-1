import qLogoUrl from '../../assets/logo/quovix-q.webp';

/**
 * El archivo original de la Q trae fondo negro. Para usarla dentro de las pantallas DOM
 * se genera una vez una versión con fondo transparente (misma imagen, sin redibujar).
 */
let cache: Promise<string> | null = null;

export function transparentQ(): Promise<string> {
  cache ??= new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const size = 256;
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const g = c.getContext('2d')!;
      g.drawImage(img, 0, 0, size, size);
      const d = g.getImageData(0, 0, size, size);
      const px = d.data;
      for (let i = 0; i < px.length; i += 4) {
        const lum = Math.max(px[i], px[i + 1], px[i + 2]) / 255;
        const a = Math.min(1, Math.max(0, (lum - 0.06) / 0.16));
        if (lum > 0) {
          const k = Math.min(1, lum * 1.08) / lum;
          px[i] = Math.min(255, px[i] * k);
          px[i + 1] = Math.min(255, px[i + 1] * k);
          px[i + 2] = Math.min(255, px[i + 2] * k);
        }
        px[i + 3] = Math.round(a * 255);
      }
      g.putImageData(d, 0, 0);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => resolve(qLogoUrl);
    img.src = qLogoUrl;
  });
  return cache;
}

/** Crea un <img> con la Q transparente. */
export function qImg(className: string): HTMLImageElement {
  const el = document.createElement('img');
  el.className = className;
  el.alt = '';
  el.draggable = false;
  transparentQ().then((src) => (el.src = src));
  return el;
}
