// The 3D on this page is one cloud of fine points that stays behind the whole site
// and rearranges itself as you scroll. It takes six forms:
//
//   0. Systems that think     one supervisor (the orange core) and its seven agents
//   1. Machines that move     a drone sensing the ground below it
//   2. Solutions that matter  the real world, with one point reaching out across it
//   3. Work                   six project panels in a ring that turns one step per project
//   4. Story                  a path that winds upward and draws itself as the chapters go by
//   5. Agents again           for the contact section
//
// The points are placed in code and moved on the graphics card; there are no model files.

import * as THREE from "three";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
// Small deterministic random so the forms look the same on every visit.
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

// ---------- The six forms ----------
// Each fills a Float32Array of x,y,z. The first `A` points are the orange ones.
function buildForms(N, A, hubs = 7) {
  const r = rng(5);
  const TAU = Math.PI * 2;
  const v = [0, 0, 0];
  const onSphere = (rad) => {
    const u = r() * 2 - 1, a = r() * TAU, s = Math.sqrt(1 - u * u);
    v[0] = Math.cos(a) * s * rad; v[1] = u * rad; v[2] = Math.sin(a) * s * rad;
  };
  const rot = (p, ax, ay) => {
    const y = p[1] * Math.cos(ax) - p[2] * Math.sin(ax), z0 = p[1] * Math.sin(ax) + p[2] * Math.cos(ax);
    const x = p[0] * Math.cos(ay) + z0 * Math.sin(ay);
    p[2] = -p[0] * Math.sin(ay) + z0 * Math.cos(ay);
    p[0] = x; p[1] = y;
  };
  const make = (fn) => {
    const out = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) out.set(fn(i) || v, i * 3);
    return out;
  };

  // 0. Agents. Left flat here; the shader spins it and tips it toward the viewer.
  const agents = make((i) => {
    const u = r();
    if (i < A) {
      onSphere(0.5 * Math.cbrt(r())); // the supervisor's core
    } else if (u < 0.2) {
      onSphere(0.62); // its shell
    } else if (u < 0.58) {
      const a = (Math.floor(r() * 7) / 7) * TAU; // seven agents
      onSphere(0.21);
      v[0] += Math.cos(a) * 1.95; v[2] += Math.sin(a) * 1.95;
    } else if (u < 0.72) {
      const a = (Math.floor(r() * 7) / 7) * TAU, d = 0.66 + r() * 1.08; // the lines between them
      v[0] = Math.cos(a) * d + (r() - 0.5) * 0.012; v[1] = (r() - 0.5) * 0.012; v[2] = Math.sin(a) * d + (r() - 0.5) * 0.012;
    } else if (u < 0.9) {
      const a = r() * TAU; // the ring they sit on
      v[0] = Math.cos(a) * 1.95; v[1] = (r() - 0.5) * 0.012; v[2] = Math.sin(a) * 1.95;
    } else {
      const a = r() * TAU, d = 2.5 + (r() - 0.5) * 0.05; // a faint outer ring
      v[0] = Math.cos(a) * d; v[1] = (r() - 0.5) * 0.02; v[2] = Math.sin(a) * d;
    }
  });

  // 1. Digital products. A browser window and a phone, drawn by their outlines and a few lines of content.
  const onRect = (cx, cy, w, h, z) => {
    const t = r() * 2 * (w + h);
    let x, y;
    if (t < w) { x = t - w / 2; y = h / 2; }
    else if (t < 2 * w) { x = t - w - w / 2; y = -h / 2; }
    else if (t < 2 * w + h) { x = -w / 2; y = t - 2 * w - h / 2; }
    else { x = w / 2; y = t - 2 * w - h - h / 2; }
    v[0] = cx + x; v[1] = cy + y; v[2] = z;
  };
  const webRows = [2.5, 1.9, 2.7, 1.5], appRows = [0.72, 0.5, 0.78, 0.42];
  const devices = make((i) => {
    const u = r();
    if (i < A) {
      // the one orange button on each screen
      if (r() < 0.62) { v[0] = -2.1 + r() * 0.95; v[1] = -0.78 + r() * 0.28; v[2] = 0; }
      else { v[0] = 1.2 + r() * 0.74; v[1] = -1.02 + r() * 0.2; v[2] = 0.4; }
    } else if (u < 0.3) {
      onRect(-0.6, 0.1, 3.6, 2.4, 0);
    } else if (u < 0.37) {
      v[0] = -2.4 + r() * 3.6; v[1] = 0.98; v[2] = 0;
    } else if (u < 0.6) {
      const k = Math.floor(r() * 4);
      v[0] = -2.1 + r() * webRows[k]; v[1] = 0.55 - k * 0.3 + (r() - 0.5) * 0.05; v[2] = 0;
    } else if (u < 0.84) {
      onRect(1.57, -0.3, 1.08, 2.15, 0.4);
    } else {
      const k = Math.floor(r() * 4);
      v[0] = 1.2 + r() * appRows[k]; v[1] = 0.45 - k * 0.3 + (r() - 0.5) * 0.05; v[2] = 0.4;
    }
    rot(v, -0.08, -0.4);
  });

  // 2. Robotics. A quadcopter, with a ring on the ground where it is looking.
  const boxPoint = (w, h, d, edge) => {
    const sizes = [w, h, d];
    const p = [(r() - 0.5) * w, (r() - 0.5) * h, (r() - 0.5) * d];
    const k = Math.floor(r() * 3);
    p[k] = (r() < 0.5 ? -0.5 : 0.5) * sizes[k];
    if (edge) { const k2 = (k + 1 + Math.floor(r() * 2)) % 3; p[k2] = (r() < 0.5 ? -0.5 : 0.5) * sizes[k2]; }
    return p;
  };
  // Left unturned here: the shader spins the rotors and sweeps the cone, then turns the whole drone to its angle.
  const drone = make((i) => {
    const u = r();
    const k = Math.floor(r() * 4), sx = k & 1 ? 1 : -1, sz = k & 2 ? 1 : -1;
    if (i < A) {
      if (r() < 0.4) { onSphere(0.17 * Math.cbrt(r())); v[1] -= 0.24; } // the sensor under the body
      else { const a = r() * TAU; v[0] = Math.cos(a) * 1.1; v[1] = -1.8; v[2] = Math.sin(a) * 1.1; } // what it sees
    } else if (u < 0.2) {
      const p = boxPoint(0.95, 0.24, 0.95, r() < 0.5);
      v[0] = p[0]; v[1] = p[1]; v[2] = p[2];
    } else if (u < 0.36) {
      const d = 0.45 + r() * 1.0; // the four arms
      v[0] = sx * d; v[1] = (r() - 0.5) * 0.02; v[2] = sz * d;
    } else if (u < 0.86) {
      // the four rotors: a guard ring, and two blades that the shader spins
      if (r() < 0.45) { const a = r() * TAU; v[0] = sx * 1.45 + Math.cos(a) * 0.7; v[2] = sz * 1.45 + Math.sin(a) * 0.7; }
      else { const d = (r() * 2 - 1) * 0.64; v[0] = sx * 1.45 + d; v[2] = sz * 1.45 + (r() - 0.5) * 0.1 * (1 - Math.abs(d) / 0.8); }
      v[1] = 0.1;
    } else {
      const a = r() * TAU, t = r(); // the cone it senses through
      v[0] = Math.cos(a) * 1.1 * t; v[1] = -0.3 - 1.5 * t; v[2] = Math.sin(a) * 1.1 * t;
    }
  });

  // 4. Dust.
  const dust = make(() => {
    v[0] = (r() - 0.5) * 17; v[1] = (r() - 0.5) * 9.5; v[2] = -5 + r() * 6.5;
  });

  // 5. Globe: lines of latitude and longitude, one orange point, and arcs going out from it.
  const onGlobe = (lat, lon, rad) => [Math.cos(lat) * Math.sin(lon) * rad, Math.sin(lat) * rad, Math.cos(lat) * Math.cos(lon) * rad];
  const home = [0.32, 0.45];
  const ends = [[0.75, -0.7], [-0.25, 1.9], [0.55, 2.6], [-0.5, -0.4]];
  const globe = make((i) => {
    if (i < A) {
      if (r() < 0.45) {
        const p = onGlobe(home[0], home[1], 2.02);
        onSphere(0.07 * Math.cbrt(r()));
        return [p[0] + v[0], p[1] + v[1], p[2] + v[2]];
      }
      const e = ends[Math.floor(r() * ends.length)], s = r();
      return onGlobe(lerp(home[0], e[0], s), lerp(home[1], e[1], s), 2.02 + Math.sin(s * Math.PI) * 0.4);
    }
    if (r() < 0.5) return onGlobe(((Math.floor(r() * 17) - 8) * Math.PI) / 18, r() * TAU, 2);
    return onGlobe((r() - 0.5) * Math.PI, (Math.floor(r() * 24) / 24) * TAU, 2);
  });

  // Work: a tree. A trunk climbs the screen and seven branches leave it to alternate sides: one for each
  // project, and one more left open. A frame hangs on the tip of each branch: that is where a board opens.
  // The page gives the sizes in pixels, so a point is stored as (across, up, kind * 8 + k + depth):
  //   kind 0, the frame on branch k: across and up run -1..1 over the frame;
  //   kind 1, branch k with its twigs and leaves: across is how far along the branch (0 at the trunk, 1 at
  //           the tip), up is how far off its line, in half frame heights;
  //   kind 2, the trunk with its twigs and leaves: across is how far off the centre line (half frame
  //           heights), up is the height, counted in branches;
  //   kind 3, the bud on the growing end of branch k (k = 7 is the top of the trunk).
  // depth (0..1) spreads the points front to back.
  const LIMBS = 7;
  const TWIGS = [[0.18, 1, 0.24, 0.1], [0.3, -1, 0.16, 0.09], [0.4, 1, 0.2, 0.1], [0.5, -1, 0.13, 0.08], [0.6, 1, 0.16, 0.08], [0.7, -1, 0.1, 0.06], [0.78, 1, 0.1, 0.05]]; // on a branch: where, which side, how long, how much it leans
  // A pointed leaf from (bx, by) along (ax, ay), with a rib down its middle. `ratio` is how many pixels one
  // unit across is, over how many one unit up is, so the leaf comes out leaf-shaped on screen.
  const leaf = (bx, by, ax, ay, ratio) => {
    const a = r(), w = r() < 0.16 ? 0 : Math.pow(Math.sin(Math.PI * a), 0.7) * (r() * 2 - 1) * 0.24;
    v[0] = bx + ax * a - (ay / ratio) * w; v[1] = by + ay * a + ax * ratio * w;
  };
  const reel = make((i) => {
    const code = (kind, k, dep) => kind * 8 + k + Math.min(Math.max(dep, 0.04), 0.96);
    if (i < A) {
      if (r() < 0.55) {
        // Orange corners on every frame.
        const k = Math.floor(r() * LIMBS), sx = r() < 0.5 ? -1 : 1, sy = r() < 0.5 ? -1 : 1, t = r();
        if (r() < 0.5) { v[0] = sx * (1 - t * 0.085); v[1] = sy; } else { v[0] = sx; v[1] = sy * (1 - t * 0.17); }
        v[0] += (r() - 0.5) * 0.003; v[1] += (r() - 0.5) * 0.006;
        v[2] = code(0, k, 0.8 + r() * 0.03);
      } else {
        // A bud on the growing end of each branch, and one on top of the trunk.
        const k = Math.floor(r() * (LIMBS + 1));
        onSphere(0.034 * Math.cbrt(r()));
        v[2] = code(3, k, 0.5 + v[2] * 4);
      }
      return;
    }
    const u = r();
    if (u < 0.22) {
      // A frame: its outline at three depths, so it has sides, and a little loose grain around it.
      const k = Math.floor(r() * LIMBS), f = r() * 2 - 1, sgn = r() < 0.5 ? -1 : 1, layer = r();
      if (r() < 0.66) { v[0] = f; v[1] = sgn; } else { v[0] = sgn; v[1] = f; }
      let dep = layer < 0.46 ? 0.1 : layer < 0.76 ? 0.42 : 0.8;
      if (r() < 0.2) { v[0] += (r() + r() - 1) * 0.022; v[1] += (r() + r() - 1) * 0.04; dep = 0.06 + r() * 0.86; }
      else { v[0] += (r() - 0.5) * 0.002; v[1] += (r() - 0.5) * 0.004; }
      v[2] = code(0, k, dep);
    } else if (u < 0.5) {
      // The trunk: round, with ridges of bark running up it. Wide at the root, thinner as it climbs.
      const h = -1.5 + r() * (LIMBS + 1.3);
      const wide = (0.1 - 0.0072 * (h + 1.5)) * (h < -0.8 ? 1 + (-0.8 - h) * 1.8 : 1);
      const ridge = Math.floor(r() * 16);
      const th = r() < 0.72 ? (ridge / 16) * TAU + 0.25 * Math.sin(h * 6 + ridge * 1.9) + (r() - 0.5) * 0.1 : r() * TAU;
      v[0] = wide * Math.sin(th) * (1 + 0.06 * Math.sin(h * 23 + ridge)); v[1] = h;
      v[2] = code(2, 0, 0.5 + 0.45 * Math.cos(th));
    } else if (u < 0.58) {
      // Twigs on the trunk, on the side away from the nearest branch, with two leaves each.
      const j = Math.floor(r() * (LIMBS + 1)), h0 = j === 0 ? -0.75 : j - 0.75, dir = j === 0 ? 1 : (j - 1) % 2 ? 1 : -1, q = r();
      if (q < 0.4) { const e = r(); v[0] = dir * (0.05 + e * 0.32); v[1] = h0 + Math.pow(e, 1.4) * 0.17; }
      else { const e = q < 0.72 ? 1 : 0.6; leaf(dir * (0.05 + e * 0.32), h0 + Math.pow(e, 1.4) * 0.17, dir * (q < 0.72 ? 0.1 : -0.04), 0.055, 0.58); }
      v[2] = code(2, 0, 0.3 + r() * 0.4);
    } else {
      // A branch: a round limb that thins toward its tip, twigs along it, and three leaves on each twig.
      const k = Math.floor(r() * LIMBS), q = r();
      let dep = 0.3 + r() * 0.4;
      if (q < 0.3) {
        const t = r(), th = (Math.floor(r() * 6) / 6) * TAU + t * 5 + (r() - 0.5) * 0.3;
        v[0] = t; v[1] = (0.05 * (1 - 0.82 * t) + 0.006) * Math.sin(th); dep = 0.5 + 0.4 * Math.cos(th);
      } else {
        const [t0, dir, len, lean] = TWIGS[Math.floor(r() * TWIGS.length)];
        if (q < 0.5) { const e = r(); v[0] = t0 + e * lean; v[1] = dir * (0.03 + Math.pow(e, 1.3) * len); }
        else {
          const n = Math.floor(r() * 3), e = [0.5, 0.78, 1][n];
          leaf(t0 + e * lean, dir * (0.03 + Math.pow(e, 1.3) * len), 0.075 * (n % 2 ? -0.6 : 1), dir * 0.085, 0.7);
        }
      }
      v[2] = code(1, k, dep);
    }
  });

  // Track record: a ladder. Two rails and a rung for every step, climbed as you scroll. The orange marker is now.
  const LH = 4.4, LW = 0.8, RUNG_N = 9;
  const story = make((i) => {
    if (i < A) { onSphere(0.17 * Math.cbrt(r())); v[1] += LH / 2 + 0.1; return; }
    const z = (r() < 0.5 ? -1 : 1) * 0.09 + (r() - 0.5) * 0.02;
    if (r() < 0.52) {
      v[0] = (r() < 0.5 ? -1 : 1) * LW + (r() - 0.5) * 0.03; v[1] = -LH / 2 + r() * LH; v[2] = z; // a rail
    } else {
      const k = Math.floor(r() * RUNG_N); // a rung
      v[0] = (r() * 2 - 1) * LW; v[1] = -LH / 2 + 0.3 + (k / (RUNG_N - 1)) * (LH - 0.6) + (r() - 0.5) * 0.03; v[2] = z;
    }
  });

  // Education: a graduate's cap. The base is the foundation year, the board on top is the degree,
  // and the orange tassel is where things stand now.
  const cap = make((i) => {
    if (i < A) { const t = r(); v[0] = 1.1 + (r() - 0.5) * 0.16 * (0.3 + t); v[1] = -0.3 - t * 0.5; v[2] = 0.5 + (r() - 0.5) * 0.16 * (0.3 + t); return; }
    const u = r();
    if (u < 0.44) { // the board: a flat square, heavier along its edges
      const h = 1.05;
      let x = (r() * 2 - 1) * h, z = (r() * 2 - 1) * h;
      if (r() < 0.4) { if (r() < 0.5) x = (r() < 0.5 ? -1 : 1) * h; else z = (r() < 0.5 ? -1 : 1) * h; }
      v[0] = x; v[1] = 0.4 + r() * 0.1; v[2] = z;
    } else if (u < 0.9) { // the cap under it, with a firm lower edge
      const t = r() < 0.18 ? 1 : r(), a = r() * TAU, rad = 0.7 - 0.08 * t;
      v[0] = Math.cos(a) * rad; v[1] = 0.35 - t * 1.25; v[2] = Math.sin(a) * rad;
    } else if (u < 0.93) { onSphere(0.1); v[1] += 0.6; } // the button on top
    else { // the tassel's cord: across the board, then down over the edge
      const t = r();
      if (t < 0.5) { const q = t / 0.5; v[0] = 1.1 * q; v[1] = 0.53; v[2] = 0.5 * q; }
      else { v[0] = 1.1; v[1] = 0.53 - ((t - 0.5) / 0.5) * 0.85; v[2] = 0.5; }
    }
  });

  // Awards: a trophy. The orange ball above it is first place.
  const trophy = make((i) => {
    if (i < A) { onSphere(0.19 * Math.cbrt(r())); v[1] += 1.8; return; }
    const u = r(), a = r() * TAU;
    let rad, y;
    if (u < 0.5) { // the bowl, with a firm rim
      const t = r() < 0.16 ? 1 : r();
      y = -0.6 + t * 1.75; rad = 0.14 + 0.92 * Math.pow(Math.sin((t * Math.PI) / 2), 0.75);
    } else if (u < 0.62) { // the stem, with a knot halfway up
      const t = r();
      y = -1.6 + t; rad = 0.09 + 0.12 * Math.exp(-Math.pow((t - 0.5) / 0.12, 2));
    } else if (u < 0.82) { // the base: two steps
      const top = r() < 0.45, R1 = top ? 0.5 : 0.82, y0 = top ? -1.75 : -2.0, h = top ? 0.15 : 0.25;
      if (r() < 0.5) { rad = R1; y = y0 + r() * h; } else { rad = R1 * Math.sqrt(r()); y = y0 + h; }
    } else { // the two handles
      const side = r() < 0.5 ? -1 : 1, t = -2.04 + r() * 3.77;
      v[0] = side * (0.88 + Math.cos(t) * 0.6) + (r() - 0.5) * 0.04; v[1] = 0.35 + Math.sin(t) * 0.62 + (r() - 0.5) * 0.04; v[2] = (r() - 0.5) * 0.05;
      return;
    }
    v[0] = Math.cos(a) * rad; v[1] = y; v[2] = Math.sin(a) * rad;
  });

  // Skills: a stack. One layer for each skill area, first at the top. Scrolling pulls the current layer out
  // to the side and lights it; the orange marker rides on that layer.
  const SG = Math.min(0.5, 3.2 / Math.max(hubs - 1, 1)), STOP = (SG * (hubs - 1)) / 2;
  const stack = make((i) => {
    if (i < A) { onSphere(0.13 * Math.cbrt(r())); v[0] += 1.78; v[1] += STOP; return; }
    const k = Math.floor(r() * hubs), h = 1.08;
    let x = (r() * 2 - 1) * h, z = (r() * 2 - 1) * h;
    if (r() < 0.62) { if (r() < 0.5) x = (r() < 0.5 ? -1 : 1) * h; else z = (r() < 0.5 ? -1 : 1) * h; } // mostly the outline
    v[0] = x; v[1] = STOP - k * SG + (r() - 0.5) * 0.025; v[2] = z;
  });

  const rnd = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) rnd.set([r(), r(), r(), i < A ? 1 : 0], i * 4);
  return { agents, devices, drone, dust, globe, story, reel, cap, trophy, stack, stackTop: STOP, stackGap: SG, rnd };
}

const VERT = /* glsl */ `
  uniform float uTime, uMorph, uSize, uScan, uPush, uIntro, uAlpha, uGrow, uTurn, uPortrait, uPhoto, uRec, uLayer, uStackTop, uStackGap, uTour, uAsk, uFace, uScanY, uBurst, uHover, uSprout;
  uniform vec3 uMouse, uReelAt, uTree;
  uniform vec4 uReel;
  // Kept to twelve: this is close to the most a browser allows once three.js adds its own.
  attribute vec3 aP0, aP1, aP2, aP3, aP4, aP6, aP7, aP8, aP9, aP10;
  attribute vec4 aPort, aRnd; // aPort: where the point sits in the portrait, and in w how bright the photo is there
  varying float vAlpha, vAccent;

  vec3 spinY(vec3 p, float a) { return vec3(p.x * cos(a) + p.z * sin(a), p.y, -p.x * sin(a) + p.z * cos(a)); }
  // Tip a form toward the viewer.
  vec3 tip(vec3 p, float t) { return vec3(p.x, p.y * cos(t) - p.z * sin(t), p.y * sin(t) + p.z * cos(t)); }
  // The work tree: where branch k is at t (0 at the trunk, 1 at its tip, where the project's frame hangs).
  // A branch leaves the trunk low and behind, climbs out to one side and arrives level. Sides alternate.
  // uReel: half a frame's width, half its height, how far a frame's middle is from the trunk, and the climb
  // from one branch to the next. uTree: how far below its tip a branch starts, how far back the trunk stands.
  // The trunk is not quite straight: how far it leans at height h (in branches), in half frame heights.
  float bend(float h) { return 0.07 * sin(h * 1.25 + 0.4) + 0.03 * sin(h * 2.9 + 1.7); }
  vec3 branchAt(float k, float t) {
    float s = mod(k, 2.0) < 0.5 ? 1.0 : -1.0, len = uReel.z - uReel.x, m = 1.0 - t;
    vec2 q = m * m * vec2(bend(k - uTree.x / uReel.w) * uReel.y, k * uReel.w - uTree.x) + 2.0 * t * m * vec2(s * 0.45 * len, k * uReel.w) + t * t * vec2(s * len, k * uReel.w);
    return vec3(q, -uTree.y * m * m);
  }

  void main() {
    // How far the scroll is through each stop of the tour, 0..1.
    float t0 = clamp(uTour, 0.0, 1.0), t1 = clamp(uTour - 1.0, 0.0, 1.0), t2 = clamp(uTour - 2.0, 0.0, 1.0);

    // 0. Agents: spin around the supervisor, tipped toward the viewer.
    vec3 p0 = spinY(aP0, uTime * 0.22);
    p0 = vec3(p0.x, p0.y * 0.9 - p0.z * 0.44, p0.y * 0.44 + p0.z * 0.9);

    // 1. Robotics: the rotors spin, the drone hovers, and the cone it senses through sweeps the ground as you scroll.
    vec3 dr = aP1;
    vec2 rotor = vec2(sign(dr.x), sign(dr.z)) * 1.45, blade = dr.xz - rotor;
    if (abs(dr.y - 0.1) < 0.003 && dot(blade, blade) < 0.56) {
      float ra = uTime * 13.0 * sign(dr.x) * sign(dr.z);
      dr.xz = rotor + vec2(blade.x * cos(ra) - blade.y * sin(ra), blade.x * sin(ra) + blade.y * cos(ra));
    }
    // What it sees: rings spreading out on the ground.
    if (aRnd.w > 0.5 && dr.y < -1.7) dr.xz *= 0.2 + 0.8 * fract(uTime * 0.45 + aRnd.x);
    dr.x += (t1 - 0.5) * 1.5 * clamp((-0.3 - dr.y) / 1.5, 0.0, 1.0);
    vec3 p1 = spinY(tip(dr, 0.42), 0.55) + vec3(0.0, 0.1 * sin(uTime * 1.3), 0.03 * sin(uTime * 0.7));
    // 2. The real world: the globe turns.
    vec3 p2 = spinY(aP2, uTime * 0.14);
    p2 = vec3(p2.x, p2.y * 0.97 - p2.z * 0.24, p2.y * 0.24 + p2.z * 0.97);
    // After the tour the same points spell two phrases. uAsk: 0 the globe, 1 the first phrase, 2 the second.
    // Between the two they fly apart: that gap is the point of the sentence.
    float aseg = clamp(floor(uAsk), 0.0, 1.0);
    float af = clamp((uAsk - aseg) * 1.7 - aRnd.y * 0.7, 0.0, 1.0);
    af = af * af * (3.0 - 2.0 * af);
    vec3 ripple = vec3(0.0, 0.03 * sin(aP9.x * 2.2 + uTime * 1.1), 0.05 * sin(aP9.x * 1.6 - uTime * 0.8));
    p2 = mix(aseg < 0.5 ? p2 : aP9 + ripple, aseg < 0.5 ? aP9 + ripple : aP10 + ripple, af);
    p2 += sin(af * 3.14159) * (aseg < 0.5 ? 0.5 : 1.15) * vec3(sin(aRnd.x * 40.0 + uTime), cos(aRnd.y * 40.0 + uTime * 0.8), sin(aRnd.z * 40.0 + uTime * 0.6));

    // 3. Work: a tree. A trunk climbs the screen and a branch leaves it for each project, to alternate sides.
    // Scrolling climbs from one branch to the next (uTurn), and the tree grows just ahead of the climb: the
    // trunk rises, the next branch reaches out, and the project's frame opens from the tip of the branch.
    // aP3 is (across, up, kind * 8 + k + depth), see buildForms. The sizes come from the page, in the
    // cloud's own units, so the frames land on the boards made of text; uReelAt is where the view is.
    float kind = floor(aP3.z / 8.0 + 0.0001), kk = floor(aP3.z - kind * 8.0 + 0.0001), dep = fract(aP3.z);
    float sideK = mod(kk, 2.0) < 0.5 ? 1.0 : -1.0;
    // How high the tree has grown, counted in branches. It grows in as the section arrives (uSprout).
    float grownTo = uTurn - (1.0 - uSprout) * 1.2;
    // Branch kk: how far out it has grown. Its frame: how far it has opened. It opens once the branch has
    // arrived and closes again as the scroll moves on.
    float outK = clamp((grownTo - kk + 0.9) / 0.5, 0.0, 1.0);
    float gIn = clamp((grownTo - kk + 0.4) / 0.4, 0.0, 1.0), gOut = clamp((uTurn - kk) / 0.45, 0.0, 1.0);
    float openK = gIn * gIn * (3.0 - 2.0 * gIn) * (1.0 - gOut * gOut * (3.0 - 2.0 * gOut));
    vec3 p3;
    float grownR;
    if (kind < 0.5) {
      // A frame, hinged on the tip of its branch: it swings open from there and grows to full size.
      vec3 tipK = vec3(sideK * (uReel.z - uReel.x), kk * uReel.w, 0.0);
      vec3 q = vec3((sideK + aP3.x) * uReel.x, aP3.y * uReel.y, (dep - 0.1) * uReel.y * (0.3 + 0.26 * uHover * openK));
      float sw = sideK * (1.0 - openK) * 0.7;
      q = vec3(q.x * cos(sw) + q.z * sin(sw), q.y, -q.x * sin(sw) + q.z * cos(sw)) * (0.6 + 0.4 * openK);
      p3 = tipK + q;
      grownR = openK;
    } else if (kind < 1.5) {
      // A branch, with its twigs and leaves.
      float off = aP3.y;
      if (abs(off) > 0.06) off = sign(off) * (0.06 + (abs(off) - 0.06) * uTree.z);
      // Twigs and leaves stir a little.
      off += 0.014 * sin(uTime * 1.4 + kk * 2.1 + aP3.x * 9.0) * smoothstep(0.05, 0.2, abs(aP3.y));
      vec3 c = branchAt(kk, aP3.x), c2 = branchAt(kk, aP3.x + 0.02);
      vec2 nrm = sideK * normalize(vec2(c.y - c2.y, c2.x - c.x) + 0.00001);
      p3 = c + vec3(nrm * off * uReel.y, (dep - 0.5) * 0.1 * uReel.y);
      grownR = 1.0 - smoothstep(outK * 1.08 - 0.04, outK * 1.08, aP3.x);
    } else if (kind < 2.5) {
      // The trunk, with its twigs.
      float off = aP3.x;
      if (abs(off) > 0.1) off = sign(off) * (0.1 + (abs(off) - 0.1) * uTree.z);
      off += 0.01 * sin(uTime * 1.2 + aP3.y * 5.0) * smoothstep(0.14, 0.3, abs(aP3.x));
      p3 = vec3((off + bend(aP3.y)) * uReel.y, aP3.y * uReel.w, -uTree.y + (dep - 0.5) * 0.18 * uReel.y);
      grownR = 1.0 - smoothstep(grownTo + 0.44, grownTo + 0.5, aP3.y);
    } else {
      // A bud on the growing end of a branch, or on top of the trunk.
      vec3 seat = kk > 6.5 ? vec3(bend(grownTo + 0.5) * uReel.y, (grownTo + 0.5) * uReel.w, -uTree.y) : branchAt(kk, outK);
      p3 = seat + vec3(aP3.xy * uReel.y, (dep - 0.5) * 0.1 * uReel.y);
      grownR = kk > 6.5 ? 1.0 : step(0.02, outK);
    }
    p3 += uReelAt;
    // 4. Track record: a form for each part. Experience is a ladder, education a graduate's cap,
    // awards a trophy, skills a stack of layers. uRec says which one is showing.
    float sw4 = 0.55 + 0.35 * sin(uTime * 0.25);
    // The stack: which layer a point is on, and how close that layer is to the one on screen.
    float layerOn = 1.0 - smoothstep(0.25, 0.75, abs(floor((uStackTop - aP8.y) / uStackGap + 0.5) - uLayer));
    vec3 stackP = aP8 + mix(vec3(layerOn * 0.45, 0.0, 0.0), vec3(0.0, -uLayer * uStackGap, 0.0), aRnd.w);
    vec3 q0 = tip(spinY(aP4, sw4), 0.284);
    vec3 q1 = tip(spinY(aP6, sw4 * 1.5 - 0.3), 0.5);
    vec3 q2 = tip(spinY(aP7, uTime * 0.3), 0.2);
    vec3 q3 = tip(spinY(stackP, 0.72 + 0.14 * sin(uTime * 0.3)), 0.52);
    float rseg = clamp(floor(uRec), 0.0, 2.0);
    float rf = clamp((uRec - rseg) * 1.7 - aRnd.z * 0.7, 0.0, 1.0);
    rf = rf * rf * (3.0 - 2.0 * rf);
    vec3 p4 = mix(rseg < 0.5 ? q0 : (rseg < 1.5 ? q1 : q2), rseg < 0.5 ? q1 : (rseg < 1.5 ? q2 : q3), rf);
    p4 += sin(rf * 3.14159) * 0.4 * vec3(sin(aRnd.x * 40.0 + uTime), cos(aRnd.y * 40.0 + uTime * 0.8), sin(aRnd.z * 40.0 + uTime * 0.6));
    vec3 p5 = p0;

    float seg = clamp(floor(uMorph), 0.0, 4.0);
    float f = clamp((uMorph - seg) * 1.7 - aRnd.x * 0.7, 0.0, 1.0);
    f = f * f * (3.0 - 2.0 * f);
    vec3 a = seg < 0.5 ? p0 : (seg < 1.5 ? p1 : (seg < 2.5 ? p2 : (seg < 3.5 ? p3 : p4)));
    vec3 b = seg < 0.5 ? p1 : (seg < 1.5 ? p2 : (seg < 2.5 ? p3 : (seg < 3.5 ? p4 : p5)));
    vec3 pos = mix(a, b, f);

    // On the way between two forms the points drift, so it reads as one cloud re-forming.
    float mid = sin(f * 3.14159);
    pos += mid * 0.55 * vec3(sin(aRnd.y * 40.0 + uTime), cos(aRnd.z * 40.0 + uTime * 0.8), sin(aRnd.x * 40.0 + uTime * 0.6));
    pos += 0.008 * vec3(sin(uTime * 1.3 + aRnd.y * 50.0), cos(uTime * 1.1 + aRnd.z * 50.0), sin(uTime + aRnd.x * 50.0));

    // At the top of the page the points draw the portrait. Scrolling lets it dissolve into the first form.
    float pv = clamp(uPortrait * 1.7 - aRnd.y * 0.7, 0.0, 1.0);
    pv = pv * pv * (3.0 - 2.0 * pv);
    // The portrait never sits quite still: every point drifts a little and a slow ripple runs through its depth,
    // so the face looks made of live grain. Now and then a band sweeps up it, lifting the points it passes.
    float scan = pv * (1.0 - smoothstep(0.0, 0.07, abs(aPort.y - uScanY)));
    vec3 face = aPort.xyz;
    face.xy += 0.006 * vec2(sin(uTime * 1.7 + aRnd.y * 60.0), cos(uTime * 1.3 + aRnd.z * 60.0));
    face.z += 0.05 * sin(aPort.y * 1.8 - uTime * 0.9) + 0.04 * sin(uTime * 2.1 + aRnd.x * 60.0) + scan * 0.2;
    pos = mix(pos, face, pv);

    // When the page opens the first form gathers out of the dust.
    float iv = clamp(uIntro * 1.7 - aRnd.z * 0.7, 0.0, 1.0);
    iv = iv * iv * (3.0 - 2.0 * iv);
    pos = mix((aRnd.xyz * 2.0 - 1.0) * vec3(4.6, 3.0, 2.2), pos, iv);

    // The pointer pushes nearby points aside.
    vec3 away = pos - uMouse;
    // Press and hold: the cloud loosens. Let go and it settles back.
    pos += uBurst * (0.25 + 0.75 * aRnd.x) * 0.9 * vec3(sin(aRnd.y * 40.0 + uTime * 1.4), cos(aRnd.z * 40.0 + uTime * 1.1), sin(aRnd.x * 40.0 + uTime * 0.9));
    pos += normalize(away + 0.0001) * smoothstep(0.85, 0.0, length(away)) * 0.3 * uPush * mix(1.0, 0.45, pv);

    // The story path draws itself upward as the chapters go by.
    float storyW = clamp(1.0 - abs(uMorph - 4.0), 0.0, 1.0);
    // The ladder is climbed and the cap lights from its base to its board; in the stack only the current layer is bright.
    float ladW = clamp(1.0 - uRec, 0.0, 1.0), capW = clamp(1.0 - abs(uRec - 1.0), 0.0, 1.0), wheelW = clamp(uRec - 2.0, 0.0, 1.0);
    float grown = ladW * step((aP4.y + 2.3) / 4.6, uGrow + 0.02) + capW * max(step((aP6.y + 1.0) / 2.0, uGrow + 0.02), aRnd.w) + (1.0 - ladW - capW);
    grown *= mix(1.0, max(0.26 + 0.74 * layerOn, aRnd.w), wheelW);
    float lit = mix(1.0, 0.14 + 0.86 * grown, storyW);
    // The tree shows only as far as it has grown, and a frame only while it is open. The branch being
    // visited is brighter than the ones already passed.
    float workW = clamp(1.0 - abs(uMorph - 3.0), 0.0, 1.0);
    float nearK = 1.0 - smoothstep(0.2, 0.9, abs(kk - uTurn));
    float litR = grownR * (kind < 0.5 ? 1.0 : kind < 1.5 ? 0.55 + 0.45 * nearK : kind < 2.5 ? 0.9 : 1.0);
    // The trunk is drawn with larger points than the leaves, so the tree has weight.
    float heavy3 = workW * step(1.5, kind) * step(kind, 2.5) * 0.45;
    lit *= mix(1.0, litR, workW);
    // Tour, stop 1: the supervisor brings its agents online one at a time, and signals run out to the ones that are on.
    float agW = (clamp(1.0 - uMorph, 0.0, 1.0) + clamp(uMorph - 4.0, 0.0, 1.0)) * (1.0 - pv);
    float agD = length(aP0.xz);
    float agK = mod(floor(atan(aP0.z, aP0.x) / 6.2832 * 7.0 + 7.5), 7.0);
    float agOn = smoothstep(agK, agK + 0.6, t0 * 7.0);
    lit *= mix(1.0, 0.3 + 0.7 * agOn, agW * smoothstep(0.64, 0.7, agD) * step(agD, 2.3));
    float sig = agW * agOn * step(abs(aP0.y), 0.02) * step(agD, 1.76) * step(0.66, agD)
      * (1.0 - smoothstep(0.0, 0.15, abs(agD - (0.7 + 1.06 * fract(uTime * 0.4 + agK * 0.37)))));
    // Tour, stop 3: arcs reach out across the globe from one point as you scroll.
    float globeW = clamp(1.0 - abs(uMorph - 2.0), 0.0, 1.0) * (1.0 - clamp(uAsk, 0.0, 1.0));
    float reach = acos(clamp(dot(normalize(aP2), vec3(0.4128, 0.3146, 0.8546)), -1.0, 1.0));
    lit *= mix(1.0, max(1.0 - aRnd.w, step(reach, 0.12 + t2 * 2.9)), globeW);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    // In the portrait the size of a point carries the light of the photo: bright parts are large dots, dark parts small.
    float sz = mix(0.75 + aRnd.y * 0.9, (0.34 + 1.1 * aPort.w) * (0.9 + 0.2 * aRnd.y) * uFace, pv);
    gl_PointSize = uSize * sz * (1.0 + scan * 0.5 + sig * 1.2 + heavy3) / -mv.z;
    vAlpha = clamp(1.25 + (mv.z + 9.0) * 0.22, 0.2, 1.0) * lit * uAlpha * (0.35 + 0.65 * iv) * mix(1.0, (0.36 + 0.64 * aPort.w) * (0.82 + 0.18 * sin(uTime * 3.1 + aRnd.x * 90.0)), pv) * (1.0 - uPhoto * pv);
    vAccent = max(max(aRnd.w * (1.0 - pv), scan * 0.7), sig * 0.9);
  }
`;
const FRAG = /* glsl */ `
  uniform vec3 uColor, uAccent;
  varying float vAlpha, vAccent;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(mix(uColor, uAccent, vAccent), smoothstep(0.5, 0.18, d) * vAlpha * mix(0.82, 1.0, vAccent));
  }
`;

// The photo itself, drawn flat, as it was given. It lies exactly over the area the points cover.
const PHOTO_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const PHOTO_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uTime, uAmt, uGlitch, uPush, uAspect;
  uniform vec2 uMouse, uVel;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vec2 uv = vUv;
    // Under the pointer the picture gives: it is dragged a little the way the mouse is going,
    // and a ripple runs out across it.
    vec2 fromM = (uv - uMouse) * vec2(uAspect, 1.0);
    float d = length(fromM);
    float near = smoothstep(0.28, 0.0, d) * uPush;
    uv -= uVel * near * 0.05;
    uv += (fromM / (d + 0.0001)) * vec2(1.0 / uAspect, 1.0) * sin(d * 42.0 - uTime * 6.0) * 0.0035 * smoothstep(0.42, 0.02, d) * uPush;
    // The slow glitch: every so often the picture is cut into bands that slide sideways and ease back,
    // and its colours part a little while they do.
    float g = clamp(uGlitch + near * 0.25, 0.0, 1.0);
    float beatN = uTime * 1.6, tick = floor(beatN), ph = fract(beatN);
    float row = floor(uv.y * mix(6.0, 18.0, hash(vec2(tick, 7.0))));
    float pick = step(1.0 - 0.55 * g, hash(vec2(row, tick)));
    float slide = (hash(vec2(row * 1.7, tick + 3.0)) - 0.5) * 0.065 * pick * g * sin(ph * 3.14159);
    uv.x += slide;
    float split = 0.0004 + abs(slide) * 0.22 + 0.008 * near + 0.0015 * g;
    vec4 cr = texture2D(uMap, uv + vec2(split, 0.0)), cg = texture2D(uMap, uv), cb = texture2D(uMap, uv - vec2(split, 0.0));
    vec3 col = vec3(cr.r, cg.g, cb.b);
    // Noise: fine grain that never sits still, a little stronger under the pointer, and faint scan lines.
    col += (hash(vUv * 900.0 + fract(uTime) * 40.0) - 0.5) * (0.13 + 0.1 * near);
    col *= 0.96 + 0.04 * sin(vUv.y * 640.0);
    col += 0.05 * near;
    // As it leaves, the picture breaks up in small squares, a few at a time, so it reads as turning into the points.
    float cell = 0.6 * hash(floor(vUv * vec2(86.0 * uAspect, 86.0))) + 0.4 * hash(floor(vUv * vec2(9.0 * uAspect, 22.0)) + 5.0);
    float keep = smoothstep((1.0 - uAmt) * 1.2 - 0.14, (1.0 - uAmt) * 1.2 - 0.02, cell);
    gl_FragColor = vec4(col, max(cg.a, max(cr.a, cb.a)) * keep * smoothstep(0.0, 0.25, uAmt));
  }
`;

export function createScene({ canvas, hubs = 7 }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const CAM_Z = 9;
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, CAM_Z);

  const small = (canvas.clientWidth || innerWidth) < 700;
  const N = small ? 56000 : 120000;
  const A = Math.floor(N * 0.04);
  const forms = buildForms(N, A, hubs);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(forms.agents, 3));
  ["agents", "drone", "globe", "reel", "story"].forEach((name, i) => geo.setAttribute(`aP${i}`, new THREE.BufferAttribute(forms[name], 3)));
  ["cap", "trophy", "stack"].forEach((name, i) => geo.setAttribute(`aP${6 + i}`, new THREE.BufferAttribute(forms[name], 3)));
  // The two phrases. Until setWords() has drawn them they are the globe, so nothing jumps.
  geo.setAttribute("aP9", new THREE.BufferAttribute(forms.globe.slice(), 3));
  geo.setAttribute("aP10", new THREE.BufferAttribute(forms.globe.slice(), 3));
  geo.setAttribute("aRnd", new THREE.BufferAttribute(forms.rnd, 4));
  const port = new Float32Array(N * 4).fill(1);
  for (let i = 0; i < N; i++) port.set(forms.agents.subarray(i * 3, i * 3 + 3), i * 4);
  geo.setAttribute("aPort", new THREE.BufferAttribute(port, 4));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);
  const uniforms = {
    uTime: { value: 0 }, uMorph: { value: 0 }, uSize: { value: 20 }, uScan: { value: -1 }, uPush: { value: 0 },
    uIntro: { value: 0 }, uAlpha: { value: 1 }, uGrow: { value: 0 }, uTurn: { value: 0 }, uRec: { value: 0 }, uLayer: { value: 0 }, uStackTop: { value: 1.5 }, uStackGap: { value: 0.5 }, uTour: { value: 0 }, uAsk: { value: 0 }, uFace: { value: 1 }, uScanY: { value: 99 }, uBurst: { value: 0 }, uPortrait: { value: 0 }, uPhoto: { value: 0 }, uHover: { value: 0 }, uSprout: { value: 1 },
    uReel: { value: new THREE.Vector4(3.2, 1.7, 4, 2.6) }, uReelAt: { value: new THREE.Vector3() }, uTree: { value: new THREE.Vector3(0.9, 0.9, 1) },
    uMouse: { value: new THREE.Vector3(99, 99, 0) },
    uColor: { value: new THREE.Color(0xeeece6) }, uAccent: { value: new THREE.Color(0xff5a24) },
  };
  uniforms.uStackTop.value = forms.stackTop;
  uniforms.uStackGap.value = forms.stackGap;
  const cloud = new THREE.Points(geo, new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthTest: false, depthWrite: false }));
  cloud.frustumCulled = false;
  scene.add(cloud);

  // The photo sits inside the cloud, so it follows every move the points make.
  const photoU = {
    uMap: { value: null }, uDepth: { value: null }, uTime: uniforms.uTime, uAmt: { value: 0 }, uGlitch: { value: 0 },
    uPush: { value: 0 }, uAspect: { value: 1 }, uMouse: { value: new THREE.Vector2(9, 9) }, uVel: { value: new THREE.Vector2() },
  };
  const photo = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 1, 1),
    new THREE.ShaderMaterial({ uniforms: photoU, vertexShader: PHOTO_VERT, fragmentShader: PHOTO_FRAG, transparent: true, depthTest: false, depthWrite: false })
  );
  photo.visible = false;
  photo.renderOrder = -1;
  photo.frustumCulled = false;
  cloud.add(photo);

  // ---------- Portrait ----------
  // The photo is read in the browser. The wall behind the person is removed by finding the light,
  // colourless pixels connected to the top and side edges; what is left is turned into points.
  let portraitReady = false, hasPhoto = false, photoAmt = 0, portW = 3.2, gridH = 500;
  const photoBox = { x0: -2, w: 4 };
  function loadPortrait(url, onCutout) {
    const img = new Image();
    img.onload = () => {
      const W = N > 100000 ? 520 : 400, H = Math.round((W * img.height) / img.width);
      const cv = document.createElement("canvas");
      cv.width = W; cv.height = H;
      const cx = cv.getContext("2d", { willReadFrequently: true });
      cx.drawImage(img, 0, 0, W, H);
      const d = cx.getImageData(0, 0, W, H).data;
      const lum = new Float32Array(W * H), light = new Uint8Array(W * H);
      for (let i = 0; i < W * H; i++) {
        const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
        lum[i] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        light[i] = lum[i] > 0.72 && Math.max(r, g, b) - Math.min(r, g, b) < 48 ? 1 : 0;
      }
      const flood = (seeds, pass) => {
        const seen = new Uint8Array(W * H), stack = seeds;
        while (stack.length) {
          const i = stack.pop();
          if (seen[i] || !pass(i)) continue;
          seen[i] = 1;
          const x = i % W, y = (i - x) / W;
          if (x > 0) stack.push(i - 1);
          if (x < W - 1) stack.push(i + 1);
          if (y > 0) stack.push(i - W);
          if (y < H - 1) stack.push(i + W);
        }
        return seen;
      };
      // The person: everything dark or coloured that is connected to the face.
      const body = flood([Math.floor(H * 0.28) * W + Math.floor(W / 2)], (i) => !light[i]);
      // The wall: light pixels reachable from the top and the sides (not the bottom, so the white T-shirt stays).
      const edge = [];
      for (let x = 0; x < W; x++) edge.push(x);
      for (let y = 0; y < H; y++) edge.push(y * W, y * W + W - 1);
      const wall = flood(edge, (i) => !!light[i]);
      const pix = [];
      for (let y = 0; y < H; y++) {
        let a = -1, b = -1;
        for (let x = 0; x < W; x++) if (body[y * W + x]) { if (a < 0) a = x; b = x; }
        for (let x = 0; x < W; x++) {
          const i = y * W + x;
          if (body[i] || (light[i] && !wall[i] && x > a && x < b)) pix.push(i);
        }
      }
      if (pix.length < 800) return; // could not find a person: keep the 3D form

      // A clean cut-out of the photo: the mask is scaled up softly and the photo drawn through it.
      const mask = document.createElement("canvas");
      mask.width = W; mask.height = H;
      const mc = mask.getContext("2d"), md = mc.createImageData(W, H);
      for (const i of pix) md.data[i * 4 + 3] = 255;
      mc.putImageData(md, 0, 0);
      const out = document.createElement("canvas");
      out.width = Math.min(img.width, 1024);
      out.height = Math.round((out.width * img.height) / img.width);
      const oc = out.getContext("2d");
      oc.filter = "blur(1.5px)";
      oc.drawImage(mask, 0, 0, out.width, out.height);
      oc.filter = "none";
      oc.globalCompositeOperation = "source-in";
      oc.drawImage(img, 0, 0, out.width, out.height);
      if (onCutout) { try { onCutout(out.toDataURL("image/webp", 0.92)); } catch { /* the page can do without it */ } }
      // Depth: how far each pixel is from the edge of the figure. The middle of the head and body
      // comes forward, the outline stays back, so the particle portrait is a rounded relief, not a flat sheet.
      const depth = new Float32Array(W * H);
      const inFg = new Uint8Array(W * H);
      for (const i of pix) { inFg[i] = 1; depth[i] = 1e6; }
      for (let y = 1; y < H; y++) for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        if (inFg[i]) depth[i] = Math.min(depth[i], depth[i - 1] + 1, depth[i - W] + 1, depth[i - W - 1] + 1.4, depth[i - W + 1] + 1.4);
      }
      let far = 1;
      for (let y = H - 2; y >= 0; y--) for (let x = W - 2; x > 0; x--) {
        const i = y * W + x;
        if (!inFg[i]) continue;
        depth[i] = Math.min(depth[i], depth[i + 1] + 1, depth[i + W] + 1, depth[i + W + 1] + 1.4, depth[i + W - 1] + 1.4);
        if (depth[i] < 1e5 && depth[i] > far) far = depth[i];
      }
      for (const i of pix) depth[i] = 0.85 * Math.sqrt(Math.min(depth[i], far) / far) - 0.25;

      let minX = W, maxX = 0;
      for (const i of pix) { const x = i % W; if (x < minX) minX = x; if (x > maxX) maxX = x; }
      const midX = (minX + maxX) / 2, S = 5.3 / H;
      portW = (maxX - minX) * S;
      // Hand the cut-out and its relief to the photo sheet, laid over exactly the area the points cover.
      const relief = new Uint8Array(W * H);
      for (const i of pix) relief[i] = Math.round(clamp((depth[i] + 0.25) / 0.85, 0, 1) * 255);
      const reliefTex = new THREE.DataTexture(relief, W, H, THREE.RedFormat, THREE.UnsignedByteType);
      reliefTex.magFilter = reliefTex.minFilter = THREE.LinearFilter;
      reliefTex.needsUpdate = true;
      photoU.uDepth.value = reliefTex;
      photoU.uMap.value = new THREE.CanvasTexture(out);
      photoU.uAspect.value = W / H;
      photo.scale.set(W * S, H * S, 1);
      photo.position.set((W / 2 - midX) * S, 0, 0);
      photoBox.x0 = -midX * S;
      photoBox.w = W * S;
      photo.visible = true;
      hasPhoto = true;
      // Contrast. The head and the body are stretched separately: next to a white shirt a face would
      // otherwise come out dim, and the face is the part that has to read.
      const range = (list) => {
        const srt = Float32Array.from(list, (i) => lum[i]).sort(), low = srt[Math.floor(srt.length * 0.02)];
        return [low, Math.max(srt[Math.floor(srt.length * 0.985)] - low, 0.05)];
      };
      const [lo, span] = range(pix);
      const headPix = pix.filter((i) => i < Math.floor(H * 0.45) * W);
      const [hlo, hspan] = headPix.length > 400 ? range(headPix) : [lo, span];
      const tone = (i) => {
        const head = Math.pow(clamp((lum[i] - hlo) / hspan, 0, 1), 0.62);
        const body = 0.85 * Math.pow(clamp((lum[i] - lo) / span, 0, 1), 0.9);
        const m = clamp((Math.floor(i / W) / H - 0.4) / 0.1, 0, 1);
        return 0.12 + 0.88 * (head + (body - head) * m * m * (3 - 2 * m));
      };
      // One point for each cell of a regular grid over the figure, as fine as the number of points allows.
      // (Scattering the points at random blurs the edges of a face; a grid keeps them.)
      const cell = Math.sqrt(pix.length / (N * 0.98));
      gridH = H / cell;
      const pos = geo.getAttribute("aPort");
      let k = 0;
      for (let gy = 0; gy * cell < H && k < N; gy++) for (let gx = 0; gx * cell < W && k < N; gx++) {
        const fx = (gx + 0.5) * cell, fy = (gy + 0.5) * cell;
        const i = Math.min(H - 1, Math.floor(fy)) * W + Math.min(W - 1, Math.floor(fx));
        if (!inFg[i]) continue;
        const t = tone(i);
        pos.setXYZ(k, (fx + (Math.random() - 0.5) * cell * 0.5 - midX) * S, (H / 2 - fy + (Math.random() - 0.5) * cell * 0.5) * S, depth[i] + (t - 0.5) * 0.1);
        pos.setW(k, t);
        k++;
      }
      // Any points left over go on the head, between the grid's own points.
      for (; k < N; k++) {
        let i, x, y, tries = 0;
        do { i = pix[Math.floor(Math.random() * pix.length)]; x = i % W; y = (i - x) / W; } while (y > H * 0.42 && ++tries < 20);
        const t = tone(i);
        pos.setXYZ(k, (x + Math.random() - midX) * S, (H / 2 - y - Math.random()) * S, depth[i] + (t - 0.5) * 0.1);
        pos.setW(k, t);
      }
      pos.needsUpdate = true;
      portraitReady = true;
    };
    img.src = url;
  }

  // ---------- Words ----------
  // Two short phrases drawn in points. The last character of each takes the orange points,
  // so the orange question mark of the first becomes the orange full stop of the second.
  function setWords(first, second) {
    const put = (text, name) => {
      const CW = 1000, CH = 300;
      const cv = document.createElement("canvas");
      cv.width = CW; cv.height = CH;
      const cx = cv.getContext("2d", { willReadFrequently: true });
      const font = (px) => `500 ${px}px Geist, system-ui, sans-serif`;
      cx.font = font(200);
      const px = Math.min(200, (200 * (CW - 60)) / cx.measureText(text).width);
      cx.font = font(px);
      cx.textBaseline = "middle";
      const head = text.slice(0, -1), x0 = (CW - cx.measureText(text).width) / 2;
      cx.fillStyle = "#f00";
      cx.fillText(head, x0, CH / 2);
      cx.fillStyle = "#0f0";
      cx.fillText(text.slice(-1), x0 + cx.measureText(head).width, CH / 2);
      const d = cx.getImageData(0, 0, CW, CH).data, body = [], end = [];
      for (let i = 0; i < CW * CH; i++) if (d[i * 4 + 3] > 128) (d[i * 4 + 1] > d[i * 4] ? end : body).push(i);
      if (!body.length) return;
      const S = 5.4 / CW, attr = geo.getAttribute(name);
      for (let k = 0; k < N; k++) {
        const list = k < A && end.length ? end : body;
        const i = list[Math.floor(Math.random() * list.length)], x = i % CW, y = (i - x) / CW;
        attr.setXYZ(k, (x + Math.random() - CW / 2) * S, (CH / 2 - y - Math.random()) * S, (Math.random() - 0.5) * 0.16);
      }
      attr.needsUpdate = true;
    };
    put(first, "aP9");
    put(second, "aP10");
  }

  // ---------- Layout ----------
  let worldW = 8, worldH = 5, narrow = false;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    worldH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * CAM_Z;
    worldW = worldH * camera.aspect;
    narrow = camera.aspect < 0.85;
    uniforms.uSize.value = h * dpr * (narrow ? 0.0085 : 0.0105);
  }
  resize();
  window.addEventListener("resize", resize);

  // ---------- Pointer ----------
  const pointer = { x: 0, y: 0, sx: 0, sy: 0, t: -10, v: 0 };
  const ray = new THREE.Vector3(), local = new THREE.Vector3();
  window.addEventListener("pointermove", (e) => {
    const nx = (e.clientX / innerWidth) * 2 - 1, ny = -((e.clientY / innerHeight) * 2 - 1);
    pointer.v = Math.min(pointer.v + Math.hypot(nx - pointer.x, ny - pointer.y) * 5, 2); // how fast it is moving
    pointer.x = nx;
    pointer.y = ny;
    pointer.t = time;
  }, { passive: true });

  let hold = 0;
  window.addEventListener("pointerdown", (e) => { if (e.pointerType === "mouse" && e.button === 0 && !e.target.closest("a, button, input, [role=dialog]")) hold = 1; });
  ["pointerup", "pointercancel", "blur"].forEach((ev) => window.addEventListener(ev, () => { hold = 0; }));

  // ---------- What the page drives ----------
  // c: which form, 0..5 (halves are in-between). hero: 1 at the very top of the page, 0 once the tour starts.
  const view = { c: 0, hero: 1, photo: 1, sway: 0, dim: 1, side: 1, scale: 1, rec: 0, layer: 0, ask: 0, wide: 0, tour: 0, face: 0, floor: 0 };
  let time = 0, morph = 0, intro = 0, started = false, spin = 0;
  const clock = new THREE.Clock();
  let frames = 0, onFirstFrame = null;

  let beforeFrame = null;
  // The work tree, as the page describes it, in pixels: a frame's width and height, how far its middle is from
  // the trunk (d), the climb from one branch to the next (s), how far below its tip a branch starts (drop),
  // how far back the trunk stands (t), where the view is (x across, cy up), how far the section's centre is
  // below the centre of the screen (y), how far back the view has stepped (z), and how much of the tree has
  // grown in as the section arrives (grow, 0..1).
  const reel = { w: 900, h: 500, d: 700, s: 420, drop: 140, t: 140, x: 0, cy: 0, y: 0, z: 0, hover: 0, grow: 1 };
  let onPose = null;
  const photoVel = { x: 0, y: 0 };
  function frame(now) {
    requestAnimationFrame(frame);
    if (beforeFrame) beforeFrame(now === undefined ? performance.now() : now);
    const raw = clock.getDelta();
    if (document.hidden) return;
    const dt = Math.min(raw, 0.05), slow = Math.min(raw, 0.5);
    time += dt;
    intro = Math.min(1, intro + (started ? slow / 2.4 : 0));
    pointer.sx = damp(pointer.sx, clamp(pointer.x, -1, 1), 3, slow);
    pointer.sy = damp(pointer.sy, clamp(pointer.y, -1, 1), 3, slow);
    // These follow the scroll closely. The scroll itself is already eased, so easing them a lot as well
    // would leave the 3D trailing behind the page.
    morph = damp(morph, clamp(view.c, 0, 5), 5, slow);

    // A form sits to the right of the text (above it on a phone). Dust fills the whole screen.
    const formW = 1;
    const fit = narrow ? (worldW * 0.9) / 5.2 : Math.min((worldH * 0.8) / 5.2, (worldW * 0.56) / 5.2);
    const h = view.hero;
    const sideX = narrow ? 0 : worldW * lerp(0.21, 0.235, h) * view.side;
    // How much the cloud is the work tree right now. The tree is placed by the page, from the middle of the screen.
    const reelW = clamp(1 - Math.abs(morph - 3), 0, 1);
    const sideY = narrow ? worldH * lerp(0.19, -0.1, h) * (1 - reelW) : 0;
    // With a photo, the top of the page is the portrait: large, standing on the bottom edge, to the right of the text.
    // The two phrases are set wide across the middle of their window.
    // The portrait comes back at the end of the page, smaller, to the right of the contact words.
    const fw = portraitReady ? view.face : 0;
    const pw = portraitReady ? Math.max(h, fw) : 0;
    const normalS = fit * lerp(1, narrow ? 0.8 : 1.12, h) * view.scale;
    const heroS = narrow ? Math.min((worldW * 1.02) / portW, (worldH * 0.5) / 5.3) : Math.min((worldH * 0.94) / 5.3, (worldW * 0.66) / portW);
    const wideS = Math.min((worldW * (narrow ? 0.96 : 0.8)) / 5.4, (worldH * 0.5) / 1.4);
    // On a phone the page passes `floor`, the height of the footer in pixels: the portrait stands centred on its top edge.
    const stood = view.floor > 0, floorW = (view.floor / Math.max(canvas.clientHeight, 1)) * worldH;
    const faceS = stood ? Math.min((worldH * 0.38) / 5.3, (worldW * 0.92) / portW) : Math.min((worldH * 0.64) / 5.3, (worldW * 0.42) / portW);
    const portS = fw > 0 ? faceS : heroS;
    const heroX = fw > 0 ? (stood ? 0 : worldW * 0.27) : narrow ? 0 : worldW * 0.235;
    const heroY = (fw > 0 && stood ? -worldH * 0.5 + floorW : -worldH * 0.53) + 2.65 * portS;
    cloud.position.x = damp(cloud.position.x, lerp(sideX, heroX, pw) * formW, 5, slow);
    cloud.position.y = damp(cloud.position.y, lerp(lerp(sideY, 0, view.wide), heroY, pw) * formW, 5, slow);
    cloud.scale.setScalar(damp(cloud.scale.x, lerp(1, lerp(lerp(normalS, wideS, view.wide), portS, pw), formW), 5, slow));
    // Portrait dots are sized to the spacing of their grid on screen, whatever the window size.
    uniforms.uFace.value = (1.25 * (5.3 / gridH) * cloud.scale.x * (renderer.domElement.height / worldH) * CAM_Z) / (uniforms.uSize.value * 1.44);
    const sweep = (time % 9) / 2.4;
    uniforms.uScanY.value = sweep < 1 ? lerp(-3, 3, sweep) : 99;
    uniforms.uAsk.value = damp(uniforms.uAsk.value, view.ask, 6, slow);
    uniforms.uBurst.value = damp(uniforms.uBurst.value, hold, hold ? 2.4 : 5, slow);
    spin = Math.max(0, spin - dt * 0.9);
    // The object turns with the scroll, so moving the page moves the 3D.
    // The tree follows the mouse less than the other forms, so the text on its boards stays easy to read.
    // While the photo is showing nothing tilts: the picture stays flat, as it was given.
    const still = 1 - photoAmt;
    cloud.rotation.y = damp(cloud.rotation.y, pointer.sx * 0.22 * lerp(1, 0.42, reelW) * still + spin * 2.2 + view.sway * 0.9, 4, slow);
    cloud.rotation.x = damp(cloud.rotation.x, -pointer.sy * 0.14 * lerp(1, 0.45, reelW) * still, 4, slow);
    if (onPose) onPose(cloud.rotation.x, cloud.rotation.y);
    // The page sizes the reel in pixels. Turn that into the cloud's own units and cancel the cloud's own offset,
    // so the frames made of points sit exactly on the boards made of text.
    const unit = canvas.clientHeight / worldH, inv = 1 / (unit * cloud.scale.x);
    uniforms.uReel.value.set(reel.w * 0.5 * inv, reel.h * 0.5 * inv, reel.d * inv, reel.s * inv);
    // Where a branch is short (a phone) its twigs and leaves shrink, so they stay off the board.
    uniforms.uTree.value.set(reel.drop * inv, reel.t * inv, clamp((0.6 * (reel.d - reel.w * 0.5)) / (0.37 * reel.h * 0.5), 0.2, 1));
    uniforms.uReelAt.value.set(-reel.x * inv - cloud.position.x / cloud.scale.x, (-reel.y / unit - cloud.position.y) / cloud.scale.x - reel.cy * inv, reel.z * inv);
    uniforms.uHover.value = damp(uniforms.uHover.value, reel.hover, 5, slow);
    uniforms.uSprout.value = reel.grow;

    // Pointer in the cloud's own space, on the plane facing the camera.
    ray.set(pointer.x, pointer.y, 0.5).unproject(camera).sub(camera.position).normalize();
    local.copy(camera.position).addScaledVector(ray, -camera.position.z / ray.z);
    cloud.worldToLocal(local);
    uniforms.uMouse.value.copy(local);
    uniforms.uPush.value = damp(uniforms.uPush.value, time - pointer.t < 2.5 ? formW : 0, 4, slow);

    const globeW = clamp(morph - 3, 0, 1);
    uniforms.uAlpha.value = damp(uniforms.uAlpha.value, view.dim, 5, slow);
    uniforms.uTime.value = time;
    uniforms.uMorph.value = morph;
    uniforms.uRec.value = damp(uniforms.uRec.value, view.rec, 5, slow);
    uniforms.uLayer.value = damp(uniforms.uLayer.value, view.layer, 6, slow);
    uniforms.uTour.value = damp(uniforms.uTour.value, view.tour, 8, slow);
    uniforms.uIntro.value = intro;
    // While the real photo is on screen the particle copy stays hidden; it takes over as the photo fades.
    // The real photo shows while the page is at the top. Scrolling fades it, with a glitch on the way,
    // and the points take over. A quick mouse move sets the glitch off as well, and so does a timer.
    // Press and hold breaks the photo up as well: the figure made of points is left, and it loosens while held.
    photoAmt = damp(photoAmt, hasPhoto && intro >= 1 ? view.photo * (1 - Math.min(uniforms.uBurst.value * 1.6, 1)) : 0, 3.5, slow);
    pointer.v = damp(pointer.v, 0, 6, slow);
    // The glitch is slow: it swells and fades over a couple of seconds, then the picture rests.
    const beat = time % 6.5, burst = beat < 1.9 ? Math.sin((beat / 1.9) * Math.PI) * 0.8 : 0;
    photoU.uAmt.value = photoAmt;
    photoU.uGlitch.value = Math.max(burst, Math.min(pointer.v * 0.3, 0.5), Math.sin(Math.PI * photoAmt) * 0.9);
    photoU.uPush.value = uniforms.uPush.value;
    // Where the pointer is on the picture, and how fast it is crossing it (smoothed).
    const mu = (local.x - photoBox.x0) / photoBox.w, mw = (local.y + 2.65) / 5.3, step = Math.max(dt, 0.004);
    photoVel.x = damp(photoVel.x, clamp((mu - photoU.uMouse.value.x) / step, -3, 3), 8, slow);
    photoVel.y = damp(photoVel.y, clamp((mw - photoU.uMouse.value.y) / step, -3, 3), 8, slow);
    photoU.uMouse.value.set(mu, mw);
    photoU.uVel.value.set(photoVel.x, photoVel.y);
    uniforms.uPhoto.value = photoAmt * 0.72;
    uniforms.uPortrait.value = damp(uniforms.uPortrait.value, pw, 4.5, slow);
    uniforms.uScan.value = ((time * 14) % 135) - 12;
    renderer.render(scene, camera);
    frames++;
    if (frames === 2 && onFirstFrame) onFirstFrame();
  }
  frame();

  return {
    start() { started = true; },
    // Give it a photo and the points draw that person at the top of the page.
    setPortrait: loadPortrait,
    // photo: 1 while the real photo shows at the very top, 0 once the points have taken over.
    setView(c, hero, photo = hero) { view.c = c; view.hero = hero; view.photo = photo; },
    burst() { spin = 1; },
    // 0..1: how much of the story path has been drawn.
    setGrow(g) { uniforms.uGrow.value = g; },
    // Which part of the track record is showing: 0 ladder, 1 cap, 2 trophy, 3 stack.
    setRecord(t) { view.rec = t; },
    // Which layer of the skills stack is pulled out: 0 is the top one, halves are in between.
    setLayer(k) { view.layer = k; },
    // How far through the tour the scroll is: 0..3, one whole number per stop.
    setTour(t) { view.tour = t; },
    // 0..1: how far the points have gathered back into the portrait for the contact section.
    setFace(f, floor = 0) { view.face = f; view.floor = floor; },
    // Something to run at the start of every frame, before the 3D is drawn (the smooth scroll).
    setBeforeFrame(fn) { beforeFrame = fn; },
    // Whether the photo has been read and turned into points.
    hasPortrait() { return portraitReady; },
    // Draw the two phrases the points spell after the tour.
    setWords,
    // 0 the globe, 1 the first phrase, 2 the second; in between the points are on their way.
    setAsk(a) { view.ask = a; },
    // 0..1: how far the cloud is laid out wide across the window, for the phrases.
    setWide(w) { view.wide = w; },
    // Which project's branch the view is on (0..5, halves are in between).
    setTurn(t) { uniforms.uTurn.value = t; },
    // The work tree's sizes and where the view is, from the page, in pixels (see `reel` above).
    setReel(o) { Object.assign(reel, o); },
    // Whether the mouse is over the board at the front.
    setReelHover(on) { reel.hover = on ? 1 : 0; },
    // Called every frame with the cloud's tilt, so the page can tilt its boards by the same amount.
    setOnPose(fn) { onPose = fn; },
    // What the page needs to copy the 3D camera: pixels per unit, the camera's distance, the canvas height.
    metrics() { return { unit: canvas.clientHeight / worldH, dist: CAM_Z, height: canvas.clientHeight }; },
    // -0.5..0.5: how far through the current step the scroll is.
    setSway(w) { view.sway = w; },
    // 0..1: how bright the cloud is. It goes dim behind sections that are mostly text.
    setDim(d) { view.dim = d; },
    // side: 1 = right of the text, -1 = left, 0 = centred. scale: 1 = normal size.
    setPose(side, scale) { view.side = side; view.scale = scale; },
    whenFirstFrame(cb) { if (frames >= 2) cb(); else onFirstFrame = cb; },
  };
}
