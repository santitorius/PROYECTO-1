import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import type { Scene3D } from './scene';
import type { QMark, LightFrame } from './qmark';
import { PX_WORLD } from './phone';
import { transparentQ } from './logo';

/**
 * Versión 2D de respaldo (sin WebGL): cada objeto WebGL de la escena tiene un "espejo" DOM
 * que copia su posición, visibilidad y apariencia. Las timelines no cambian.
 */
function mirror(s: Scene3D, follow: THREE.Object3D, el: HTMLElement, sync: () => void): CSS3DObject {
  el.style.pointerEvents = 'none';
  const o = new CSS3DObject(el);
  o.matrixAutoUpdate = false;
  s.cssScene.add(o);
  const scale = new THREE.Matrix4().makeScale(PX_WORLD, PX_WORLD, PX_WORLD);
  s.onTick(() => {
    let vis = true;
    for (let n: THREE.Object3D | null = follow; n; n = n.parent) if (!n.visible) vis = false;
    o.visible = vis;
    if (!vis) return;
    follow.updateWorldMatrix(true, false);
    o.matrix.copy(follow.matrixWorld).multiply(scale);
    sync();
  });
  return o;
}

export function mirrorQ(s: Scene3D, q: QMark): void {
  const img = document.createElement('img');
  img.className = 'm2d-q';
  transparentQ().then((src) => (img.src = src));
  mirror(s, q, img, () => {
    const r = q.reveal;
    img.style.opacity = String(q.opacity);
    // la Q se forma con un barrido diagonal, como en WebGL
    const edge = r * 135 - 12;
    img.style.setProperty('mask-image', `linear-gradient(105deg, #000 ${edge - 12}%, transparent ${edge}%)`);
    img.style.setProperty('-webkit-mask-image', `linear-gradient(105deg, #000 ${edge - 12}%, transparent ${edge}%)`);
  });
}

export function mirrorFrame(s: Scene3D, f: LightFrame): void {
  const el = document.createElement('div');
  el.className = 'm2d-frame';
  mirror(s, f, el, () => {
    const k = f.shape;
    const px = (v: number) => `${v / PX_WORLD}px`;
    el.style.width = px(k.w);
    el.style.height = px(k.h);
    el.style.borderRadius = px(Math.min(k.r, k.w / 2, k.h / 2));
    el.style.borderWidth = px(k.t);
    el.style.opacity = String(k.opacity);
    el.style.background = `rgba(93,203,225,${k.fill})`;
    el.style.boxShadow = `0 0 ${40 * k.glow}px rgba(93,203,225,${0.6 * k.glow})`;
  });
}

/** La línea de luz: en 2D se ve la chispa que viaja. */
export function mirrorSpark(s: Scene3D, spark: THREE.Object3D): void {
  const el = document.createElement('div');
  el.className = 'dot-glow';
  mirror(s, spark, el, () => {});
}

/** Los puntos de clientes del momento 5. */
export function mirrorDots(s: Scene3D, dots: THREE.Sprite[], lines: THREE.Mesh[]): void {
  for (const d of dots) {
    const el = document.createElement('div');
    el.className = 'm2d-dot';
    const m = d.material as THREE.SpriteMaterial;
    mirror(s, d, el, () => {
      el.style.opacity = String(m.opacity);
      const c = `#${m.color.getHexString()}`;
      el.style.background = c;
      el.style.boxShadow = `0 0 18px 8px ${c}88`;
    });
  }
  for (const l of lines) {
    const el = document.createElement('div');
    el.className = 'm2d-line';
    const g = l.geometry as THREE.BoxGeometry;
    const { width, height } = g.parameters;
    el.style.width = `${width / PX_WORLD}px`;
    el.style.height = `${Math.max(height, 0.03) / PX_WORLD}px`;
    const m = l.material as THREE.MeshBasicMaterial;
    mirror(s, l, el, () => (el.style.opacity = String(m.opacity)));
  }
}
