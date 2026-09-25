import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import qLogoUrl from '../../assets/logo/quovix-q.webp';
import type { Scene3D } from '../core/scene';
import { PX_WORLD } from '../core/phone';
import { color } from '../tokens';

/* ------------------------------------------------------------------ */
/* DOM flotante en la escena (burbujas, cuaderno, tarjetas, rótulos).  */
/* ------------------------------------------------------------------ */

export interface FloatOpts {
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  /** escala sobre el tamaño de pantalla (1 = mismo tamaño que un px del teléfono) */
  s?: number;
  interactive?: boolean;
}

/** Elemento DOM real colocado en el espacio 3D. Su opacidad se anima con `el.style.opacity`. */
export class Floating {
  readonly obj: CSS3DObject;
  readonly home = new THREE.Vector3();
  /** amplitud de la deriva en reposo (unidades de mundo) */
  drift = 0;
  private seed = Math.random() * 10;
  private offset = new THREE.Vector3();

  constructor(
    ctx: Scene3D,
    readonly el: HTMLElement,
    o: FloatOpts = {},
  ) {
    el.classList.add('qx-float');
    if (!o.interactive) el.style.pointerEvents = 'none';
    el.style.opacity = '0';
    this.obj = new CSS3DObject(el);
    this.obj.position.set(o.x ?? 0, o.y ?? 0, o.z ?? 0);
    this.obj.rotation.set(o.rx ?? 0, o.ry ?? 0, o.rz ?? 0);
    this.obj.scale.setScalar((o.s ?? 1) * PX_WORLD);
    this.home.copy(this.obj.position);
    ctx.cssScene.add(this.obj);
    ctx.onTick((t) => {
      const on = parseFloat(el.style.opacity || '0') > 0.001;
      this.obj.visible = on;
      if (!on || !this.drift || ctx.reducedMotion) return;
      // Deriva lenta: las timelines animan `home`, la deriva se suma encima.
      this.offset.set(Math.sin(t * 0.5 + this.seed) * this.drift, Math.cos(t * 0.37 + this.seed * 2) * this.drift, 0);
      this.obj.position.copy(this.home).add(this.offset);
    });
  }

  /** Posición animable (con deriva) */
  get pos(): THREE.Vector3 {
    return this.drift ? this.home : this.obj.position;
  }
}

/* ------------------------------------------------------------------ */
/* Elemento que vuela de un punto a otro (un monto, un mensaje).       */
/* ------------------------------------------------------------------ */

export type WorldFn = () => THREE.Vector3;

export class Flyer {
  readonly f: Floating;
  private a = new THREE.Vector3();
  private b = new THREE.Vector3();
  private c = new THREE.Vector3();
  readonly p = { t: 0 };

  constructor(ctx: Scene3D, el: HTMLElement, s = 1) {
    this.f = new Floating(ctx, el, { s });
  }

  /**
   * Agrega el vuelo a la timeline. Los extremos se calculan al empezar (posiciones reales del DOM).
   * `arc` levanta la curva hacia la cámara; `sFrom`/`sTo` escalan el elemento.
   */
  fly(
    tl: gsap.core.Timeline,
    at: gsap.Position,
    from: WorldFn,
    to: WorldFn,
    o: { dur?: number; arc?: number; sFrom?: number; sTo?: number; stay?: boolean; ease?: string; prep?: () => void } = {},
  ): void {
    const dur = o.dur ?? 1.1;
    const s0 = (o.sFrom ?? 1) * PX_WORLD;
    const s1 = (o.sTo ?? o.sFrom ?? 1) * PX_WORLD;
    const el = this.f.el;
    const obj = this.f.obj;
    tl.fromTo(
      this.p,
      { t: 0 },
      {
        t: 1,
        duration: dur,
        ease: o.ease ?? 'power2.inOut',
        immediateRender: false,
        onStart: () => {
          o.prep?.();
          this.a.copy(from());
          this.b.copy(to());
          this.c
            .copy(this.a)
            .lerp(this.b, 0.5)
            .add(new THREE.Vector3(0, (o.arc ?? 1) * 0.6, (o.arc ?? 1) * 1.6));
        },
        onUpdate: () => {
          const t = this.p.t;
          const u = 1 - t;
          obj.position.set(
            u * u * this.a.x + 2 * u * t * this.c.x + t * t * this.b.x,
            u * u * this.a.y + 2 * u * t * this.c.y + t * t * this.b.y,
            u * u * this.a.z + 2 * u * t * this.c.z + t * t * this.b.z,
          );
          obj.scale.setScalar(s0 + (s1 - s0) * t);
          const vis = o.stay ? t > 0 : t > 0 && t < 1;
          el.style.opacity = vis ? String(Math.min(1, Math.min(t, o.stay ? 1 : 1 - t) * 8)) : '0';
        },
      },
      at,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Línea de luz turquesa que viaja entre dos puntos.                   */
/* ------------------------------------------------------------------ */

export class LightBeam extends THREE.Mesh<THREE.TubeGeometry, THREE.ShaderMaterial> {
  readonly p = { head: 0 };
  private curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(), new THREE.Vector3(0, 1, 2), new THREE.Vector3(1, 0, 0));
  private spark: THREE.Sprite;
  get sparkObj(): THREE.Object3D {
    return this.spark;
  }

  constructor(scene: THREE.Scene) {
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uHead: { value: 0 }, uColor: { value: new THREE.Color(color.turquesa) } },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        uniform float uHead; uniform vec3 uColor; varying vec2 vUv;
        void main() {
          float d = uHead - vUv.x;                    // distancia detrás de la cabeza
          float tail = smoothstep(0.55, 0.0, d) * step(0.0, d);
          float core = 1.0 - abs(vUv.y - 0.5) * 2.0;  // más brillante en el centro del tubo
          float a = tail * (0.35 + core * 0.65);
          gl_FragColor = vec4(mix(uColor, vec3(1.0), tail * 0.5) * a, a);
        }
      `,
    });
    super(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(), 2, 0.03, 3), mat);
    this.renderOrder = 10;
    this.visible = false;
    this.spark = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowTexture(), color: color.turquesa, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }),
    );
    this.spark.scale.setScalar(1.2);
    this.spark.renderOrder = 11;
    this.spark.visible = false;
    scene.add(this, this.spark);
  }

  private build(a: THREE.Vector3, b: THREE.Vector3, lift: number): void {
    const mid = a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, lift * 0.8, lift * 2.2));
    this.curve = new THREE.QuadraticBezierCurve3(a.clone(), mid, b.clone());
    this.geometry.dispose();
    this.geometry = new THREE.TubeGeometry(this.curve, 64, 0.045, 8);
  }

  /** Agrega el viaje de la luz a la timeline. */
  travel(tl: gsap.core.Timeline, at: gsap.Position, from: WorldFn, to: WorldFn, dur = 1.1, lift = 1.2): void {
    tl.fromTo(
      this.p,
      { head: 0 },
      {
        head: 1.6,
        duration: dur,
        ease: 'power1.inOut',
        immediateRender: false,
        onStart: () => this.build(from(), to(), lift),
        onUpdate: () => {
          const h = this.p.head;
          this.material.uniforms.uHead.value = h;
          const on = h > 0.001 && h < 1.599;
          this.visible = on;
          this.spark.visible = on && h <= 1.02;
          if (this.spark.visible) this.spark.position.copy(this.curve.getPoint(Math.min(h, 1)));
        },
      },
      at,
    );
  }
}

let glowTex: THREE.Texture | null = null;
export function glowTexture(): THREE.Texture {
  if (glowTex) return glowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(0.18, 'rgba(255,255,255,0.85)');
  r.addColorStop(0.45, 'rgba(255,255,255,0.18)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}

/* ------------------------------------------------------------------ */
/* Momento 5: clientes como puntos sobre una línea de semanas.         */
/* ------------------------------------------------------------------ */

interface DotData {
  x: number;
  y: number;
  z: number;
  /** cada cuántas semanas viene */
  cada: number;
  /** semana a partir de la cual deja de venir (Infinity = sigue viniendo) */
  deja: number;
  /** semana en que se apaga (Infinity = nunca) */
  apaga: number;
  fase: number;
}

export class ClientDots extends THREE.Group {
  readonly p = { week: 0, show: 0 };
  readonly dots: THREE.Sprite[] = [];
  readonly data: DotData[] = [];
  readonly carlosIndex: number;
  private axis: THREE.Mesh;
  private head: THREE.Mesh;
  /** eje, marcas de semana y cabezal (para la versión 2D) */
  readonly lines: THREE.Mesh[] = [];
  readonly weeks: number;
  readonly width = 12;

  constructor(weeks: number) {
    super();
    this.weeks = weeks;
    const rnd = mulberry(7);
    const rows = 3;
    const cols = 8;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const x = -this.width / 2 + (c + 0.5) * (this.width / cols) + (rnd() - 0.5) * 0.7;
        const y = 1.1 + r * 1.25 + (rnd() - 0.5) * 0.4;
        const z = (rnd() - 0.5) * 1.6;
        const cada = 1 + Math.floor(rnd() * 3);
        this.data.push({ x, y, z, cada, deja: Infinity, apaga: Infinity, fase: Math.floor(rnd() * cada) });
      }
    // Los que dejan de venir (se apagan uno por uno). Carlos es el último.
    const perdidos = [3, 17, 9, 20];
    perdidos.forEach((i, k) => Object.assign(this.data[i], { cada: 1, fase: 0, deja: 1 + k, apaga: 2.6 + k }));
    this.carlosIndex = 12;
    // Carlos vino en la semana 1 y no volvió: se apaga el último.
    Object.assign(this.data[this.carlosIndex], { cada: 3, fase: 0, deja: 0.9, apaga: 6.4, x: 0.6, y: 2.4, z: 0.6 });

    const tex = glowTexture();
    this.data.forEach((d) => {
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: tex, color: color.turquesa, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }),
      );
      s.position.set(d.x, d.y, d.z);
      s.scale.setScalar(0.9);
      this.add(s);
      this.dots.push(s);
    });

    this.axis = new THREE.Mesh(
      new THREE.BoxGeometry(this.width, 0.03, 0.03),
      new THREE.MeshBasicMaterial({ color: color.turquesa, transparent: true, opacity: 0 }),
    );
    this.add(this.axis);
    for (let i = 0; i <= weeks; i++) {
      const tick = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.3, 0.03), this.axis.material);
      tick.position.x = -this.width / 2 + (i / weeks) * this.width;
      this.add(tick);
      this.lines.push(tick);
    }
    this.head = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 4.6, 0.05),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }),
    );
    this.head.position.y = 2.2;
    this.add(this.head);
    this.lines.push(this.axis, this.head);
    this.visible = false;
  }

  /** Se llama cada frame: todo depende de `week` y `show`, así funciona igual hacia atrás. */
  update(): void {
    const { week, show } = this.p;
    this.visible = show > 0.001;
    if (!this.visible) return;
    (this.axis.material as THREE.MeshBasicMaterial).opacity = 0.5 * show;
    const hx = -this.width / 2 + (week / this.weeks) * this.width;
    this.head.position.x = hx;
    (this.head.material as THREE.MeshBasicMaterial).opacity = week > 0.01 && week < this.weeks - 0.01 ? 0.5 * show : 0;
    this.data.forEach((d, i) => {
      const s = this.dots[i];
      const m = s.material as THREE.SpriteMaterial;
      // semanas en que vino: fase, fase+cada, ... (antes de dejar de venir)
      let pulse = 0;
      for (let w = d.fase + 0.5; w < Math.min(week + 0.5, d.deja + 0.5); w += d.cada) pulse = Math.max(pulse, 1 - Math.min(1, Math.abs(week - w) * 2.5));
      const lost = week > d.apaga;
      const fade = lost ? Math.max(0.12, 1 - (week - d.apaga) * 1.4) : 1;
      m.opacity = show * (0.35 + 0.65 * fade);
      m.color.set(lost ? '#5b6670' : color.turquesa);
      s.scale.setScalar((0.8 + pulse * 0.6) * (i === this.carlosIndex ? 1.25 : 1));
    });
  }

  weekX(w: number): number {
    return -this.width / 2 + (w / this.weeks) * this.width;
  }
}

/* ------------------------------------------------------------------ */
/* Momento 13: la silueta se deshace en partículas que forman la Q.    */
/* ------------------------------------------------------------------ */

export class ParticleMorph extends THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial> {
  readonly p = { mix: 0, alpha: 0 };
  private ready = false;

  constructor(
    count: number,
    from: (i: number, out: THREE.Vector3) => void,
    private readonly target: { x: number; y: number; size: number },
  ) {
    const g = new THREE.BufferGeometry();
    const a = new Float32Array(count * 3);
    const b = new Float32Array(count * 3);
    const r = new Float32Array(count);
    const v = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      from(i, v);
      a.set([v.x, v.y, v.z], i * 3);
      b.set([target.x, target.y, 0], i * 3);
      r[i] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(a, 3));
    g.setAttribute('aTo', new THREE.BufferAttribute(b, 3));
    g.setAttribute('aRnd', new THREE.BufferAttribute(r, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uMix: { value: 0 },
        uAlpha: { value: 0 },
        uA: { value: new THREE.Color(color.blanco) },
        uB: { value: new THREE.Color(color.turquesa) },
        uPx: { value: 1 },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aTo; attribute float aRnd;
        uniform float uMix; uniform float uPx;
        varying float vT; varying float vR;
        void main() {
          float t = smoothstep(aRnd * 0.45, aRnd * 0.45 + 0.55, uMix);
          vec3 p = mix(position, aTo, t);
          // remolino suave en el trayecto
          float s = sin(t * 3.14159);
          p += vec3(sin(aRnd * 40.0) * s * 1.6, cos(aRnd * 31.0) * s * 1.2, s * 1.5);
          vT = t; vR = aRnd;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (2.2 + aRnd * 2.0) * uPx * (22.0 / -mv.z);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uAlpha; uniform vec3 uA; uniform vec3 uB;
        varying float vT; varying float vR;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d) * uAlpha;
          gl_FragColor = vec4(mix(uB, uA, vR * 0.6) * a, a);
        }
      `,
    });
    super(g, mat);
    this.visible = false;
    this.frustumCulled = false;
    this.loadTargets();
  }

  /** Toma los puntos de destino de la imagen original de la Q. */
  private loadTargets(): void {
    const img = new Image();
    img.onload = () => {
      const n = 160;
      const c = document.createElement('canvas');
      c.width = c.height = n;
      const g = c.getContext('2d')!;
      g.drawImage(img, 0, 0, n, n);
      const px = g.getImageData(0, 0, n, n).data;
      const pts: [number, number][] = [];
      for (let y = 0; y < n; y++)
        for (let x = 0; x < n; x++) {
          const i = (y * n + x) * 4;
          if (Math.max(px[i], px[i + 1], px[i + 2]) > 90) pts.push([x / n - 0.5, 0.5 - y / n]);
        }
      const to = this.geometry.getAttribute('aTo') as THREE.BufferAttribute;
      const { x, y, size } = this.target;
      for (let i = 0; i < to.count; i++) {
        const p = pts[Math.floor(Math.random() * pts.length)] ?? [0, 0];
        to.setXYZ(i, x + p[0] * size + (Math.random() - 0.5) * 0.04, y + p[1] * size + (Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.1);
      }
      to.needsUpdate = true;
      this.ready = true;
    };
    img.src = qLogoUrl;
  }

  update(pxRatio: number): void {
    this.material.uniforms.uMix.value = this.p.mix;
    this.material.uniforms.uAlpha.value = this.ready ? this.p.alpha : 0;
    this.material.uniforms.uPx.value = pxRatio;
    this.visible = this.p.alpha > 0.001;
  }
}

function mulberry(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Helper: `gsap` a la opacidad de un elemento DOM flotante. */
export const fade = (tl: gsap.core.Timeline, el: HTMLElement | HTMLElement[], o: number, at: gsap.Position, dur = 0.6) =>
  tl.to(el, { opacity: o, duration: dur, ease: 'power1.inOut' }, at);
