// The 3D behind the contact page: a sphere of points that breathes, swells toward the mouse, and sends
// rings outward, like a signal going out. It turns slowly on its own.

import * as THREE from "three";

const TAU = Math.PI * 2;
const damp = (v, to, rate, dt) => v + (to - v) * (1 - Math.exp(-rate * dt));

const VERT = /* glsl */ `
  // aInfo: what the point is (0 on the sphere, 1 on a ring going out), and two random numbers.
  attribute vec3 aInfo;
  uniform float uTime, uSize, uPull, uDim;
  uniform vec3 uMouse;
  varying float vAlpha, vAccent;
  void main() {
    vec3 n = normalize(position);
    vec3 p;
    float a;
    if (aInfo.x < 0.5) {
      // The sphere: slow waves run over it, and the side facing the mouse swells toward it.
      float wave = 0.05 * sin(dot(n, vec3(1.3, 0.7, 0.4)) * 6.0 + uTime * 1.1) + 0.035 * sin(n.y * 9.0 - uTime * 0.8);
      float toward = smoothstep(0.45, 1.0, dot(normalize(mat3(modelMatrix) * n), uMouse));
      p = n * 2.0 * (1.0 + wave + toward * 0.2 * uPull);
      a = 0.35 + 0.5 * aInfo.z + toward * 0.4 * uPull;
      vAccent = toward * uPull * 0.8;
    } else {
      // A ring: it starts at the sphere, grows, and fades as it goes.
      float life = fract(uTime * 0.11 + aInfo.y);
      p = vec3(position.x, 0.0, position.z) * (2.15 + 2.6 * life);
      p.y = 0.06 * sin(position.x * 8.0 + uTime);
      a = (1.0 - life) * (1.0 - life) * 0.9;
      vAccent = 1.0;
    }
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vAlpha = a * uDim * clamp(1.4 + (mv.z + 9.0) * 0.2, 0.15, 1.0);
    gl_PointSize = uSize * (0.7 + 0.6 * aInfo.z) / -mv.z;
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

export function createContactScene({ canvas }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const small = (canvas.clientWidth || innerWidth) < 700;
  const N = small ? 26000 : 60000, RINGS = Math.floor(N * 0.14);
  const pos = new Float32Array(N * 3), info = new Float32Array(N * 3);
  let seed = 11;
  const r = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < N; i++) {
    if (i < RINGS) {
      // Three rings, each a circle of points one unit across; the shader grows them.
      const a = r() * TAU;
      pos.set([Math.cos(a), 0, Math.sin(a)], i * 3);
      info.set([1, Math.floor(r() * 3) / 3, r()], i * 3);
    } else {
      // Evenly spread over the sphere.
      const k = i - RINGS, y = 1 - (2 * (k + 0.5)) / (N - RINGS), rad = Math.sqrt(1 - y * y), a = k * 2.399963;
      pos.set([Math.cos(a) * rad, y, Math.sin(a) * rad], i * 3);
      info.set([0, r(), r()], i * 3);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aInfo", new THREE.BufferAttribute(info, 3));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);
  const uniforms = {
    uTime: { value: 0 }, uSize: { value: 20 }, uPull: { value: 0 }, uDim: { value: 1 }, uMouse: { value: new THREE.Vector3(0, 0, 1) },
    uColor: { value: new THREE.Color(0xeeece6) }, uAccent: { value: new THREE.Color(0xff5a24) },
  };
  const cloud = new THREE.Points(geo, new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthTest: false, depthWrite: false }));
  cloud.rotation.z = 0.32;
  scene.add(cloud);

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

  const pointer = { x: 0.4, y: -0.2, t: -10 };
  window.addEventListener("pointermove", (e) => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = (e.clientY / innerHeight) * 2 - 1;
    pointer.t = performance.now() / 1000;
  }, { passive: true });

  const clock = new THREE.Clock();
  let before = null, frames = 0, onFirst = null, dim = 1, time = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (before) before(now === undefined ? performance.now() : now);
    const dt = Math.min(clock.getDelta(), 0.1);
    if (document.hidden) return;
    time += dt;
    uniforms.uTime.value = time;
    uniforms.uDim.value = damp(uniforms.uDim.value, dim, 4, dt);
    // The sphere sits to the right of the words on a wide screen, and above them on a phone.
    cloud.position.set(narrow ? 0 : 2.5, narrow ? 1.9 : 0.1, 0);
    cloud.scale.setScalar(narrow ? 0.62 : 1);
    cloud.rotation.y += dt * 0.12;
    cloud.rotation.x = damp(cloud.rotation.x, pointer.y * 0.18, 3, dt);
    // Where the mouse is, as a direction from the middle of the sphere toward the viewer.
    uniforms.uMouse.value.set(pointer.x * 1.4 - (narrow ? 0 : 0.6), -pointer.y * 1.1 - (narrow ? 0.5 : 0), 0.9).normalize();
    uniforms.uPull.value = damp(uniforms.uPull.value, performance.now() / 1000 - pointer.t < 2.5 ? 1 : 0.25, 3, dt);
    renderer.render(scene, camera);
    frames++;
    if (frames === 2 && onFirst) onFirst();
  }
  frame();

  return {
    live: true,
    // 0..1: how bright the sphere is. It dims as the page is scrolled, so the words below it stay easy to read.
    setDim(d) { dim = d; },
    setBeforeFrame(fn) { before = fn; },
    whenFirstFrame(cb) { if (frames >= 2) cb(); else onFirst = cb; },
  };
}
