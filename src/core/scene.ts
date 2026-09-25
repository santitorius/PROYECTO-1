import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { stage as S } from '../tokens';
import type { Stage } from './stage';

/** Estado de cámara que animan las timelines (posición + punto al que mira). */
export interface CamState {
  x: number;
  y: number;
  z: number;
  tx: number;
  ty: number;
  tz: number;
  /** amplitud de la flotación en reposo (0 = quieta) */
  float: number;
}

/**
 * Escena única. Con WebGL: teléfonos, luz y partículas en WebGL + pantallas DOM con CSS3DRenderer.
 * Sin WebGL (versión 2D de respaldo): la misma escena y los mismos momentos, solo con DOM/CSS 3D.
 */
export class Scene3D {
  readonly scene = new THREE.Scene();
  readonly cssScene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer | null = null;
  readonly cssRenderer: CSS3DRenderer;
  readonly cam: CamState = { x: 0, y: 0, z: 26, tx: 0, ty: 0, tz: 0, float: 1 };
  readonly gl: boolean;
  private readonly target = new THREE.Vector3();
  private last = performance.now();
  private elapsed = 0;
  private readonly tickers: ((t: number, dt: number) => void)[] = [];
  reducedMotion = false;
  /** resolución adaptativa: baja si la laptop no llega a ~50 fps */
  private dprScale = 1;
  private stageScale = 1;
  private slowFrames = 0;
  private fastFrames = 0;

  constructor(webglEl: HTMLElement, cssEl: HTMLElement, stage: Stage, useGL = true) {
    this.camera = new THREE.PerspectiveCamera(35, S.width / S.height, 0.1, 400);
    this.gl = useGL;

    if (useGL) {
      const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      r.setClearColor(0x000000, 0);
      r.outputColorSpace = THREE.SRGBColorSpace;
      r.toneMapping = THREE.ACESFilmicToneMapping;
      webglEl.appendChild(r.domElement);
      // Reflejos suaves para el metal del teléfono (se calcula una sola vez).
      const pmrem = new THREE.PMREMGenerator(r);
      this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
      this.renderer = r;
    }

    this.cssRenderer = new CSS3DRenderer();
    this.cssRenderer.setSize(S.width, S.height);
    cssEl.appendChild(this.cssRenderer.domElement);

    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(-6, 8, 10);
    const rim = new THREE.DirectionalLight(0x5dcbe1, 2.2);
    rim.position.set(8, 2, -6);
    this.scene.add(key, rim, new THREE.AmbientLight(0x0f2233, 0.6));

    stage.onResize((scale) => {
      this.stageScale = scale;
      this.applyPixelRatio();
    });
    this.stageScale = stage.scale;
    this.applyPixelRatio();

    const loop = () => {
      this.frame();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /** El canvas vive dentro del escenario escalado: se renderiza a la resolución real en pantalla. */
  private applyPixelRatio(): void {
    if (!this.renderer) return;
    const pr = Math.min(window.devicePixelRatio * this.stageScale, 1.75) * this.dprScale;
    this.renderer.setPixelRatio(Math.max(pr, 0.5));
    this.renderer.setSize(S.width, S.height, false);
  }

  onTick(fn: (t: number, dt: number) => void): void {
    this.tickers.push(fn);
  }

  get pixelRatio(): number {
    return this.renderer?.getPixelRatio() ?? 1;
  }

  private frame(): void {
    const now = performance.now();
    const raw = (now - this.last) / 1000;
    const dt = Math.min(raw, 0.1);
    this.last = now;
    this.elapsed += dt;
    this.adapt(raw);
    const t = this.elapsed;
    for (const fn of this.tickers) fn(t, dt);

    const c = this.cam;
    const amp = this.reducedMotion ? 0 : c.float;
    // Flotación leve en reposo: lenta, sin rebotes.
    const fx = Math.sin(t * 0.21) * 0.35 * amp;
    const fy = Math.sin(t * 0.17 + 1.3) * 0.22 * amp;
    this.camera.position.set(c.x + fx, c.y + fy, c.z);
    this.target.set(c.tx + fx * 0.3, c.ty + fy * 0.3, c.tz);
    this.camera.lookAt(this.target);

    this.renderer?.render(this.scene, this.camera);
    this.cssRenderer.render(this.cssScene, this.camera);
  }

  /** Si los cuadros tardan (>22 ms) varios segundos seguidos, baja la resolución; si sobra, la sube. */
  private adapt(raw: number): void {
    if (!this.renderer || raw > 0.25 || document.hidden) return;
    if (raw > 0.022) {
      this.slowFrames++;
      this.fastFrames = 0;
    } else if (raw < 0.0125) {
      this.fastFrames++;
      this.slowFrames = Math.max(0, this.slowFrames - 1);
    }
    if (this.slowFrames > 90 && this.dprScale > 0.6) {
      this.dprScale = Math.max(0.6, this.dprScale - 0.15);
      this.slowFrames = 0;
      this.applyPixelRatio();
    } else if (this.fastFrames > 600 && this.dprScale < 1) {
      this.dprScale = Math.min(1, this.dprScale + 0.1);
      this.fastFrames = 0;
      this.applyPixelRatio();
    }
  }
}

export function webglAvailable(): boolean {
  if (location.hash === '#2d') return false;
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}
