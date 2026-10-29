import {
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  ExtrudeGeometry,
  Fog,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  QuadraticBezierCurve3,
  RingGeometry,
  Scene,
  Shape,
  ShaderMaterial,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  MeshBasicMaterial,
  DoubleSide,
} from 'three';

interface GeoData {
  w: number;
  h: number;
  origin: [number, number];
  rings: [number, number][][][];
  places: { s: string; n: string; p: [number, number]; t: string }[];
}

export interface SceneOptions {
  /** Slugs to draw as live routes. */
  routes: string[];
  /** Single-route mode: frame this route and fly along it. */
  focus?: string;
  onReady?: () => void;
}

const AMBER = new Color('#f2a93b');
const S = 0.1; // map px -> world units

const toWorld = (data: GeoData, [x, y]: [number, number]) => new Vector3((x - data.w / 2) * S, 0, (y - data.h / 2) * S);

/** Comet-style light trail travelling along the tube's length (uv.x). */
const trailMaterial = (offset: number, bright: number, base = 0.16) =>
  new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uOffset: { value: offset }, uColor: { value: AMBER }, uBright: { value: bright }, uBase: { value: base } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform float uOffset; uniform vec3 uColor; uniform float uBright; uniform float uBase;
      varying vec2 vUv;
      void main() {
        float head = fract(uTime * 0.18 + uOffset) * 1.4 - 0.2;
        float d = head - vUv.x;
        float comet = smoothstep(0.32, 0.0, d) * step(0.0, d);
        float a = (uBase + comet * 1.4) * uBright;
        gl_FragColor = vec4(uColor * (0.7 + comet), a);
      }
    `,
  });

export async function mount(canvas: HTMLCanvasElement, geoUrl: string, opts: SceneOptions) {
  const data: GeoData = await fetch(geoUrl).then((r) => r.json());
  const lowPower = window.matchMedia('(max-width: 700px)').matches;

  const renderer = new WebGLRenderer({ canvas, antialias: !lowPower, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.25 : 1.5));
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  scene.fog = new Fog(0x0b0b0c, 130, 300);

  const camera = new PerspectiveCamera(32, 1, 1, 400);

  scene.add(new AmbientLight(0xb8bcc6, 0.9));
  const key = new DirectionalLight(0xffd9a0, 1.6);
  key.position.set(60, 80, 40);
  scene.add(key);
  const rim = new DirectionalLight(0x6f7a90, 0.7);
  rim.position.set(-80, 30, -60);
  scene.add(rim);

  const world = new Group();
  scene.add(world);

  // Landmass: each polygon's outer ring becomes an extruded slab.
  const shapes: Shape[] = [];
  const edgePts: number[] = [];
  const top = 1.6;
  for (const poly of data.rings) {
    const [outer, ...holes] = poly;
    const shape = new Shape(outer.map(([x, y]) => new Vector2((x - data.w / 2) * S, -(y - data.h / 2) * S)));
    for (const h of holes) {
      const hole = new Shape(h.map(([x, y]) => new Vector2((x - data.w / 2) * S, -(y - data.h / 2) * S)));
      shape.holes.push(hole);
    }
    shapes.push(shape);
    for (let i = 0; i < outer.length - 1; i++) {
      const a = toWorld(data, outer[i]);
      const b = toWorld(data, outer[i + 1]);
      edgePts.push(a.x, top + 0.02, a.z, b.x, top + 0.02, b.z);
    }
  }
  const land = new ExtrudeGeometry(shapes, { depth: top, bevelEnabled: false, curveSegments: 1 });
  land.rotateX(-Math.PI / 2);
  world.add(new Mesh(land, new MeshStandardMaterial({ color: 0x2a2c32, roughness: 0.8, metalness: 0.3 })));

  const edges = new BufferGeometry();
  edges.setAttribute('position', new BufferAttribute(new Float32Array(edgePts), 3));
  world.add(new LineSegments(edges, new LineBasicMaterial({ color: 0x8a8e98 })));

  // Survey grid on the "ground".
  const gridPts: number[] = [];
  const span = 140;
  for (let i = -span; i <= span; i += 7.5) gridPts.push(i, -0.01, -span, i, -0.01, span, -span, -0.01, i, span, -0.01, i);
  const grid = new BufferGeometry();
  grid.setAttribute('position', new BufferAttribute(new Float32Array(gridPts), 3));
  world.add(new LineSegments(grid, new LineBasicMaterial({ color: 0x1f2125, transparent: true, opacity: 0.8 })));

  // Every destination as a faint survey point.
  const placePts = new Float32Array(data.places.length * 3);
  data.places.forEach((pl, i) => {
    const v = toWorld(data, pl.p);
    placePts.set([v.x, top + 0.25, v.z], i * 3);
  });
  const placesGeo = new BufferGeometry();
  placesGeo.setAttribute('position', new BufferAttribute(placePts, 3));
  world.add(new Points(placesGeo, new PointsMaterial({ color: 0xc8cad0, size: lowPower ? 0.7 : 0.6, sizeAttenuation: true })));

  // Norwich beacon.
  const o = toWorld(data, data.origin);
  o.y = top;
  const beamMat = new MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.55, blending: AdditiveBlending, depthWrite: false });
  const beam = new Mesh(new CylinderGeometry(0.12, 0.12, 14, 8, 1, true), beamMat);
  beam.position.set(o.x, top + 7, o.z);
  world.add(beam);
  const ringMat = new MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.8, side: DoubleSide, blending: AdditiveBlending, depthWrite: false });
  const ring = new Mesh(new RingGeometry(0.9, 1.05, 48), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(o.x, top + 0.05, o.z);
  world.add(ring);

  // Routes.
  const trails: ShaderMaterial[] = [];
  let focusCurve: QuadraticBezierCurve3 | null = null;
  const routeSet = new Set(opts.routes);
  const routePlaces = data.places.filter((p) => routeSet.has(p.s));
  routePlaces.forEach((pl, i) => {
    const d = toWorld(data, pl.p);
    d.y = top;
    const dist = o.distanceTo(d);
    const mid = o.clone().lerp(d, 0.5);
    mid.y = top + Math.max(3, dist * 0.32);
    const curve = new QuadraticBezierCurve3(o.clone(), mid, d);
    const isFocus = opts.focus === pl.s;
    const bright = opts.focus ? (isFocus ? 1.25 : 0.35) : 1;
    const mat = trailMaterial(i * 0.137, bright, isFocus ? 0.55 : 0.16);
    trails.push(mat);
    world.add(new Mesh(new TubeGeometry(curve, 96, isFocus ? 0.32 : 0.12, 8, false), mat));
    const tick = new Mesh(new CylinderGeometry(0.06, 0.06, 1.6, 4), new MeshBasicMaterial({ color: isFocus ? AMBER : 0xe8e6e1 }));
    tick.position.set(d.x, top + 0.8, d.z);
    world.add(tick);
    if (isFocus) focusCurve = curve;
  });

  // Camera framing.
  const target = new Vector3(0, 0, 4);
  let radius = 150;
  let elev = 1.02; // radians above the horizon
  let yaw = -0.18;
  if (focusCurve) {
    const fc = focusCurve as QuadraticBezierCurve3;
    target.copy(fc.v0).lerp(fc.v2, 0.5);
    radius = Math.min(150, Math.max(55, fc.v0.distanceTo(fc.v2) * 2.1));
    elev = 0.82;
  }
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointer = (e: PointerEvent) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener('pointermove', onPointer, { passive: true });

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Portrait screens need more distance to fit the island's height.
    camera.fov = camera.aspect < 1 ? 44 : 32;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); });
  io.observe(canvas);

  const t0 = performance.now();
  let raf = 0;
  let intro = 0;
  const loop = () => {
    cancelAnimationFrame(raf);
    if (!visible || document.hidden) return;
    raf = requestAnimationFrame(loop);
    const t = (performance.now() - t0) / 1000;
    intro = Math.min(1, t / 2.4);
    const ease = 1 - Math.pow(1 - intro, 3);
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    const y = yaw + Math.sin(t * 0.07) * 0.12 + pointer.x * 0.12;
    const e = elev - 0.25 * (1 - ease) + pointer.y * 0.05;
    const r = radius * (1.25 - 0.25 * ease);
    camera.position.set(target.x + r * Math.cos(e) * Math.sin(y), target.y + r * Math.sin(e), target.z + r * Math.cos(e) * Math.cos(y));
    camera.lookAt(target);
    for (const m of trails) m.uniforms.uTime.value = t;
    const pulse = (t * 0.6) % 1;
    ring.scale.setScalar(1 + pulse * 2.4);
    ringMat.opacity = 0.8 * (1 - pulse);
    renderer.render(scene, camera);
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) loop(); });
  loop();
  opts.onReady?.();

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    window.removeEventListener('pointermove', onPointer);
    renderer.dispose();
  };
}
