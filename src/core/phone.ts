import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import type { Scene3D } from './scene';

/** Medidas del teléfono en unidades de mundo. La pantalla DOM mide 390x844 px. */
export const PHONE = {
  w: 4.3,
  h: 9.0,
  d: 0.34,
  radius: 0.62,
  bezel: 0.13,
  screenPx: { w: 390, h: 844 },
} as const;

const SCREEN_W = PHONE.w - PHONE.bezel * 2;
const SCREEN_H = PHONE.h - PHONE.bezel * 2;
const PX = SCREEN_W / PHONE.screenPx.w; // unidades de mundo por px de pantalla

function roundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

/** Posición (px) del centro de un elemento dentro de la pantalla, descontando scroll. */
export function localPos(el: HTMLElement, root: HTMLElement): { x: number; y: number } {
  if (!root.contains(el) || !el.offsetParent) return { x: PHONE.screenPx.w / 2, y: PHONE.screenPx.h / 2 };
  let x = el.offsetWidth / 2;
  let y = el.offsetHeight / 2;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    const p = n.offsetParent as HTMLElement | null;
    for (let a: HTMLElement | null = n.parentElement; a && a !== p; a = a.parentElement) {
      x -= a.scrollLeft;
      y -= a.scrollTop;
    }
    if (!p) break;
    if (p !== root) {
      x -= p.scrollLeft;
      y -= p.scrollTop;
    }
    n = p;
  }
  return { x, y };
}

/** Unidades de mundo por px de pantalla (para objetos DOM flotantes del mismo tamaño). */
export const PX_WORLD = PX;

let glassTex: THREE.Texture | null = null;
function glassTexture(): THREE.Texture {
  if (glassTex) return glassTex;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#030406';
  g.fillRect(0, 0, 128, 256);
  const lg = g.createLinearGradient(0, 0, 128, 200);
  lg.addColorStop(0, 'rgba(255,255,255,0.09)');
  lg.addColorStop(0.45, 'rgba(255,255,255,0.025)');
  lg.addColorStop(0.46, 'rgba(255,255,255,0)');
  g.fillStyle = lg;
  g.fillRect(0, 0, 128, 256);
  glassTex = new THREE.CanvasTexture(c);
  glassTex.colorSpace = THREE.SRGBColorSpace;
  return glassTex;
}

/**
 * Teléfono construido por código: cuerpo de bordes redondeados con marco metálico fino,
 * cristal negro y una pantalla HTML/CSS real (CSS3DObject) pegada al cristal.
 */
export class Phone extends THREE.Group {
  readonly screenEl: HTMLDivElement;
  readonly css: CSS3DObject;
  private readonly bodyMat: THREE.MeshPhysicalMaterial;
  private readonly glassMat: THREE.MeshBasicMaterial;
  private readonly anchor = new THREE.Object3D();
  private _opacity = 1;
  private _screenOn = 1;

  constructor(
    readonly name: string,
    content: HTMLElement,
    ctx: Scene3D,
  ) {
    super();

    this.bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x0c1119,
      metalness: 0.85,
      roughness: 0.32,
      clearcoat: 0.6,
      clearcoatRoughness: 0.25,
      transparent: true,
    });
    const body = new THREE.Mesh(new RoundedBoxGeometry(PHONE.w, PHONE.h, PHONE.d, 6, PHONE.radius), this.bodyMat);
    this.add(body);

    // Cristal apagado: negro con un reflejo diagonal muy tenue (sin brillos que distraigan).
    this.glassMat = new THREE.MeshBasicMaterial({ map: glassTexture(), transparent: true });
    const glassGeo = new THREE.ShapeGeometry(roundedRectShape(SCREEN_W, SCREEN_H, PHONE.radius - PHONE.bezel), 12);
    // UV 0..1 sobre el cristal (ShapeGeometry las da en unidades de mundo).
    const pos = glassGeo.attributes.position;
    const uv = glassGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(i, pos.getX(i) / SCREEN_W + 0.5, pos.getY(i) / SCREEN_H + 0.5);
    }
    const glass = new THREE.Mesh(glassGeo, this.glassMat);
    glass.position.z = PHONE.d / 2 + 0.002;
    this.add(glass);

    // Botones laterales, finos.
    const btnMat = this.bodyMat;
    const btnGeo = new RoundedBoxGeometry(0.06, 1, 0.14, 2, 0.03);
    const b1 = new THREE.Mesh(btnGeo, btnMat);
    b1.position.set(PHONE.w / 2 + 0.02, 1.9, 0);
    const b2 = b1.clone();
    b2.position.set(-PHONE.w / 2 - 0.02, 2.2, 0);
    b2.scale.y = 0.6;
    const b3 = b2.clone();
    b3.position.y = 1.3;
    this.add(b1, b2, b3);

    // Pantalla DOM real.
    this.screenEl = document.createElement('div');
    this.screenEl.className = 'screen';
    this.screenEl.dataset.phone = name;
    this.screenEl.appendChild(content);
    this.css = new CSS3DObject(this.screenEl);
    ctx.cssScene.add(this.css);

    this.anchor.position.z = PHONE.d / 2 + 0.004;
    this.add(this.anchor);

    const p = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const normal = new THREE.Vector3();
    const toCam = new THREE.Vector3();
    ctx.onTick(() => {
      this.updateWorldMatrix(true, true);
      this.anchor.matrixWorld.decompose(p, q, s);
      this.css.position.copy(p);
      this.css.quaternion.copy(q);
      this.css.scale.set(s.x * PX, s.y * PX, s.z * PX);
      // La pantalla DOM solo se ve de frente (backface-visibility falla con opacidad < 1).
      normal.set(0, 0, 1).applyQuaternion(q);
      toCam.copy(ctx.camera.position).sub(p);
      const facing = normal.dot(toCam) > 0;
      const on = facing && this.visible && this._opacity > 0.001 && this._screenOn > 0.001;
      // visibility (no display:none) para que la pantalla siga midiendo y guardando su scroll.
      const v = on ? '' : 'hidden';
      if (this.screenEl.style.visibility !== v) this.screenEl.style.visibility = v;
    });

    this.applyOpacity();
  }

  /** Punto de la pantalla (px de 390x844) en coordenadas de mundo. */
  screenToWorld(px: number, py: number, lift = 0.02): THREE.Vector3 {
    this.updateWorldMatrix(true, false);
    return this.localToWorld(new THREE.Vector3((px - PHONE.screenPx.w / 2) * PX, (PHONE.screenPx.h / 2 - py) * PX, PHONE.d / 2 + lift));
  }

  /** Centro de un elemento de la pantalla en coordenadas de mundo (sirve aunque haya scroll). */
  elWorld(el: Element | null, lift = 0.02): THREE.Vector3 {
    if (!el) return this.screenToWorld(PHONE.screenPx.w / 2, PHONE.screenPx.h / 2, lift);
    const { x, y } = localPos(el as HTMLElement, this.screenEl);
    return this.screenToWorld(x, y, lift);
  }

  /** Opacidad global del teléfono (cuerpo + pantalla). */
  get opacity(): number {
    return this._opacity;
  }
  set opacity(v: number) {
    this._opacity = v;
    this.applyOpacity();
  }

  /** 0 = pantalla apagada (cristal negro), 1 = encendida. */
  get screenOn(): number {
    return this._screenOn;
  }
  set screenOn(v: number) {
    this._screenOn = v;
    this.applyOpacity();
  }

  private applyOpacity(): void {
    const o = this._opacity;
    this.bodyMat.opacity = o;
    this.glassMat.opacity = o;
    // Los reflejos no se atenúan con la opacidad: se bajan a mano para la silueta en penumbra.
    this.bodyMat.envMapIntensity = o * o;
    this.bodyMat.depthWrite = o > 0.99;
    this.glassMat.depthWrite = o > 0.99;
    this.visible = o > 0.001;
    this.screenEl.style.opacity = String(o * this._screenOn);
  }
}
