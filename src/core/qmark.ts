import * as THREE from 'three';
import qLogoUrl from '../../assets/logo/quovix-q.webp';
import { color } from '../tokens';

/**
 * La "Q" original (archivo de /assets) sobre un plano.
 * El fondo negro del archivo se vuelve transparente en el shader, así la Q flota sobre la escena.
 * uReveal forma la Q con un barrido suave; uOpacity la desvanece.
 */
export class QMark extends THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> {
  /** Tamaño del plano (unidades de mundo). */
  static readonly SIZE = 7;

  /** Caja del cuerpo redondeado de la Q, medida sobre el archivo original (1932 px). */
  static readonly BODY = {
    cx: (255 + 1660) / 2 / 1932 - 0.5,
    cy: 0.5 - (295 + 1410) / 2 / 1932,
    w: (1660 - 255) / 1932,
    h: (1410 - 295) / 1932,
    stroke: (539 - 255) / 1932,
  };

  constructor() {
    const tex = new THREE.TextureLoader().load(qLogoUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uMap: { value: tex },
        uReveal: { value: 0 },
        uOpacity: { value: 1 },
        uGlow: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap;
        uniform float uReveal;
        uniform float uOpacity;
        uniform float uGlow;
        varying vec2 vUv;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        void main() {
          vec4 c = texture2D(uMap, vUv);
          // Llave de luminancia: el negro del archivo se vuelve transparente.
          float lum = max(c.r, max(c.g, c.b));
          float a = smoothstep(0.06, 0.22, lum);
          // Formación: barrido diagonal suave con grano fino.
          float d = (vUv.x * 0.7 + (1.0 - vUv.y) * 0.3);
          float n = hash(floor(vUv * 180.0)) * 0.08;
          float edge = uReveal * 1.35 - 0.12;
          float m = 1.0 - smoothstep(edge - 0.12, edge, d + n);
          vec3 col = c.rgb / max(lum, 0.001) * min(lum * 1.08, 1.0);
          // Borde de formación iluminado en turquesa.
          float rim = smoothstep(edge - 0.12, edge - 0.04, d + n) * m;
          col += vec3(0.36, 0.8, 0.88) * rim * 1.2 + uGlow * 0.15;
          gl_FragColor = vec4(col, a * m * uOpacity);
          #include <colorspace_fragment>
        }
      `,
    });
    super(new THREE.PlaneGeometry(QMark.SIZE, QMark.SIZE), mat);
  }

  get reveal(): number {
    return this.material.uniforms.uReveal.value;
  }
  set reveal(v: number) {
    this.material.uniforms.uReveal.value = v;
  }
  get opacity(): number {
    return this.material.uniforms.uOpacity.value;
  }
  set opacity(v: number) {
    this.material.uniforms.uOpacity.value = v;
    this.visible = v > 0.001;
  }
}

/**
 * Marco de luz: un rectángulo redondeado dibujado con SDF, con el degradado de la Q
 * (blanco → turquesa). Sirve de puente: empieza con la forma del cuerpo de la Q
 * y se estira hasta ser el marco del teléfono.
 */
export class LightFrame extends THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> {
  static readonly PLANE = 14;
  /** Propiedades animables (unidades de mundo). */
  readonly shape = { w: 5, h: 4, r: 1.8, t: 1, opacity: 0, glow: 0.4, fill: 0 };

  constructor() {
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uSize: { value: new THREE.Vector2(5, 4) },
        uRadius: { value: 1.8 },
        uThick: { value: 1 },
        uOpacity: { value: 0 },
        uGlow: { value: 0.4 },
        uFill: { value: 0 },
        uPlane: { value: LightFrame.PLANE },
        uA: { value: new THREE.Color(color.blanco) },
        uB: { value: new THREE.Color(color.turquesa) },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        uniform vec2 uSize;
        uniform float uRadius, uThick, uOpacity, uGlow, uFill, uPlane;
        uniform vec3 uA, uB;
        varying vec2 vUv;
        float sdRound(vec2 p, vec2 b, float r) {
          vec2 q = abs(p) - b + r;
          return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
        }
        void main() {
          vec2 p = (vUv - 0.5) * uPlane;
          vec2 hs = uSize * 0.5;
          float r = min(uRadius, min(hs.x, hs.y));
          float d = sdRound(p, hs, r);
          float aa = fwidth(d) * 1.2;
          // anillo: del borde exterior hacia adentro, grosor uThick
          float ring = smoothstep(aa, -aa, d) * smoothstep(-uThick - aa, -uThick + aa, d);
          float inside = smoothstep(aa, -aa, d) * uFill;
          float glow = exp(-max(d, 0.0) * 3.0) * uGlow * step(0.0, d);
          float gx = clamp((p.x + hs.x) / max(uSize.x, 0.001), 0.0, 1.0);
          vec3 col = mix(uA, uB, smoothstep(0.1, 1.0, gx));
          float a = max(max(ring, inside), glow * 0.5) * uOpacity;
          gl_FragColor = vec4(col, a);
          #include <colorspace_fragment>
        }
      `,
    });
    super(new THREE.PlaneGeometry(LightFrame.PLANE, LightFrame.PLANE), mat);
  }

  /** Copia `shape` a los uniforms (llamar cada frame). */
  sync(): void {
    const u = this.material.uniforms;
    const s = this.shape;
    u.uSize.value.set(s.w, s.h);
    u.uRadius.value = s.r;
    u.uThick.value = s.t;
    u.uOpacity.value = s.opacity;
    u.uGlow.value = s.glow;
    u.uFill.value = s.fill;
    this.visible = s.opacity > 0.001;
  }
}
