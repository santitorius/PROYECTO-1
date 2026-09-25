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

export class Scene3D {
  readonly scene = new THREE.Scene();
  readonly cssScene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  readonly cssRenderer: CSS3DRenderer;
  readonly cam: CamState = { x: 0, y: 0, z: 26, tx: 0, ty: 0, tz: 0, float: 1 };
  private readonly target = new THREE.Vector3();
  private last = performance.now();
  private elapsed = 0;
  private readonly tickers: ((t: number, dt: number) => void)[] = [];
  reducedMotion = false;

  constructor(webglEl: HTMLElement, cssEl: HTMLElement, stage: Stage) {
    this.camera = new THREE.PerspectiveCamera(35, S.width / S.height, 0.1, 400);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    webglEl.appendChild(this.renderer.domElement);

    this.cssRenderer = new CSS3DRenderer();
    this.cssRenderer.setSize(S.width, S.height);
    cssEl.appendChild(this.cssRenderer.domElement);

    // Reflejos suaves para el metal del teléfono (se calcula una sola vez).
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(-6, 8, 10);
    const rim = new THREE.DirectionalLight(0x5dcbe1, 2.2);
    rim.position.set(8, 2, -6);
    this.scene.add(key, rim, new THREE.AmbientLight(0x0f2233, 0.6));

    const resize = (scale: number) => {
      // El canvas vive dentro del escenario escalado: renderizamos a la resolución real en pantalla.
      const pr = Math.min(window.devicePixelRatio * scale, 2);
      this.renderer.setPixelRatio(Math.max(pr, 0.5));
      this.renderer.setSize(S.width, S.height, false);
    };
    stage.onResize(resize);
    resize(stage.scale);

    this.renderer.setAnimationLoop(() => this.frame());
  }

  onTick(fn: (t: number, dt: number) => void): void {
    this.tickers.push(fn);
  }

  private frame(): void {
    const now = performance.now();
    const dt = Math.min((now - this.last) / 1000, 0.1);
    this.last = now;
    this.elapsed += dt;
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

    this.renderer.render(this.scene, this.camera);
    this.cssRenderer.render(this.cssScene, this.camera);
  }
}

export function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}
