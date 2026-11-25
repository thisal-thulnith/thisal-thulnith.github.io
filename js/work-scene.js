// The 3D behind the work page: a path of points that climbs in a spiral, with a station on it for
// every project. Scrolling turns the spiral and lifts it, so each station comes round to the front in turn.
// The path is drawn only as far as you have come, and the station you are at is the bright one.

import * as THREE from "three";

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const damp = (v, to, rate, dt) => v + (to - v) * (1 - Math.exp(-rate * dt));

const VERT = /* glsl */ `
  // aInfo: what the point is (0 dust, 1 path, 2 a station's shell and ring, 3 a station's core),
  // where along the path it sits (counted in projects), and a random number.
  attribute vec3 aInfo;
  uniform float uAt, uTime, uSize;
  varying float vAlpha, vAccent;
  void main() {
    float kind = aInfo.x, at = aInfo.y;
    // How close this point's place on the path is to where you are, and whether you have reached it yet.
    float here = 1.0 - smoothstep(0.12, 0.8, abs(at - uAt));
    float reached = 1.0 - smoothstep(uAt + 0.1, uAt + 0.45, at);
    vec3 p = position;
    // Dust drifts a little, so the space is never still.
    if (kind < 0.5) p += 0.06 * vec3(sin(uTime * 0.5 + aInfo.z * 40.0), cos(uTime * 0.4 + aInfo.z * 70.0), sin(uTime * 0.3 + aInfo.z * 90.0));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float a = kind < 0.5 ? 0.16 + 0.3 * aInfo.z
      : kind < 1.5 ? 0.1 + 0.7 * reached
      : 0.16 + 0.84 * max(here, reached * 0.4);
    vAlpha = a * clamp(1.5 + (mv.z + 9.0) * 0.16, 0.12, 1.0);
    vAccent = kind > 2.5 ? max(here, reached * 0.55) : 0.0;
    float big = kind < 0.5 ? 0.55 + 0.7 * aInfo.z : kind < 1.5 ? 0.9 : 1.0 + 0.7 * here;
    gl_PointSize = uSize * big / -mv.z;
  }
`;
const FRAG = /* glsl */ `
  uniform vec3 uColor, uAccent;
  varying float vAlpha, vAccent;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(mix(uColor, uAccent, vAccent), smoothstep(0.5, 0.15, d) * vAlpha);
  }
`;

export function createWorkScene({ canvas, count }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const TURN = 0.58 * TAU; // how far round the spiral goes between two projects
  const RISE = 2.3; // how far it climbs between two projects
  const R = 2.4; // how wide the spiral is
  const small = (canvas.clientWidth || innerWidth) < 700;
  const N = small ? 42000 : 90000;
  const pos = new Float32Array(N * 3), info = new Float32Array(N * 3);
  let seed = 7;
  const r = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const onPath = (t, out, rad = R) => { out[0] = Math.cos(t * TURN) * rad; out[1] = t * RISE; out[2] = Math.sin(t * TURN) * rad; };
  const c = [0, 0, 0];
  for (let i = 0; i < N; i++) {
    const u = r();
    let x, y, z, kind, at;
    if (u < 0.3) {
      // Dust, all through the space the spiral climbs.
      const a = r() * TAU, rad = 0.6 + Math.sqrt(r()) * 6.2;
      x = Math.cos(a) * rad; z = Math.sin(a) * rad; y = -3.5 + r() * (count * RISE + 6);
      kind = 0; at = y / RISE;
    } else if (u < 0.68) {
      // The path: three strands side by side, with a little grain.
      at = -1.1 + r() * (count + 0.5);
      const strand = Math.floor(r() * 3) - 1, loose = r() < 0.25 ? 0.09 : 0.012;
      onPath(at, c, R + strand * 0.1);
      x = c[0] + (r() - 0.5) * loose; y = c[1] + (r() - 0.5) * loose + strand * 0.035; z = c[2] + (r() - 0.5) * loose;
      kind = 1;
    } else {
      // A station for each project: a shell, a ring round it, and a small core.
      const k = Math.floor(r() * count), q = r();
      onPath(k, c);
      at = k;
      if (q < 0.16) {
        const a = r() * TAU, b = Math.acos(r() * 2 - 1), rad = 0.1 * Math.cbrt(r());
        x = c[0] + Math.sin(b) * Math.cos(a) * rad; y = c[1] + Math.cos(b) * rad; z = c[2] + Math.sin(b) * Math.sin(a) * rad;
        kind = 3;
      } else if (q < 0.6) {
        const a = r() * TAU, b = Math.acos(r() * 2 - 1), rad = 0.34;
        x = c[0] + Math.sin(b) * Math.cos(a) * rad; y = c[1] + Math.cos(b) * rad; z = c[2] + Math.sin(b) * Math.sin(a) * rad;
        kind = 2;
      } else {
        // The ring stands across the path, like a gate you pass through.
        const a = r() * TAU, rad = 0.62 + (r() - 0.5) * 0.015, out = Math.cos(a) * rad, up = Math.sin(a) * rad;
        const dir = k * TURN;
        x = c[0] + Math.cos(dir) * out; y = c[1] + up; z = c[2] + Math.sin(dir) * out;
        kind = 2;
      }
    }
    pos.set([x, y, z], i * 3);
    info.set([kind, at, r()], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aInfo", new THREE.BufferAttribute(info, 3));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60);
  const uniforms = {
    uAt: { value: -1 }, uTime: { value: 0 }, uSize: { value: 20 },
    uColor: { value: new THREE.Color(0xeeece6) }, uAccent: { value: new THREE.Color(0xff5a24) },
  };
  const cloud = new THREE.Points(geo, new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthTest: false, depthWrite: false }));
  const lift = new THREE.Group(); // tilts with the mouse
  lift.add(cloud);
  scene.add(lift);

  let narrow = false;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    narrow = camera.aspect < 0.85;
    uniforms.uSize.value = h * dpr * (narrow ? 0.0085 : 0.0105);
  }
  resize();
  window.addEventListener("resize", resize);

  const pointer = { x: 0, y: 0 };
  window.addEventListener("pointermove", (e) => { pointer.x = (e.clientX / innerWidth) * 2 - 1; pointer.y = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });

  const clock = new THREE.Clock();
  let target = -1, at = -1, before = null, frames = 0, onFirst = null;
  function frame(now) {
    requestAnimationFrame(frame);
    if (before) before(now === undefined ? performance.now() : now);
    const dt = Math.min(clock.getDelta(), 0.1);
    if (document.hidden) return;
    at = damp(at, target, 7, dt);
    uniforms.uAt.value = at;
    uniforms.uTime.value += dt;
    // The station you are at comes round to the front: to the right of the words on a wide screen, above them on a phone.
    const face = narrow ? Math.PI / 2 : 0.92;
    cloud.rotation.y = at * TURN - face;
    cloud.position.y = -at * RISE + (narrow ? 1.55 : 0);
    const s = narrow ? 0.72 : 1;
    lift.scale.setScalar(s);
    lift.position.x = narrow ? 0 : 0.5;
    lift.rotation.y = damp(lift.rotation.y, pointer.x * 0.12, 3, dt);
    lift.rotation.x = damp(lift.rotation.x, pointer.y * 0.07 + 0.1, 3, dt);
    renderer.render(scene, camera);
    frames++;
    if (frames === 2 && onFirst) onFirst();
  }
  frame();

  return {
    live: true,
    // Which project you are at: 0 is the first, halves are in between, below 0 is before the path starts.
    set(t) { target = clamp(t, -1.2, count - 0.6); },
    setBeforeFrame(fn) { before = fn; },
    whenFirstFrame(cb) { if (frames >= 2) cb(); else onFirst = cb; },
  };
}
