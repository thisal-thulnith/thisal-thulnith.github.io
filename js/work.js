// The work page: every project, one at a time. Scrolling walks a 3D path; each project has a station on it,
// and its words come forward as its station comes round to the front. "View case study" opens the same
// case study the home page uses.

import { site, projects, pitches } from "./content.js";
import { setupCase } from "./case.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (t) => t * t * (3 - 2 * t);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pad2 = (n) => String(n).padStart(2, "0");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const STEP = 78; // how much scrolling each project takes, in screen heights (svh)
const n = projects.length;
const stops = n - 0.5; // the last project holds for a shorter stretch before the page moves on

// ---------- Content ----------
function render() {
  const page = site.workPage, proof = site.proofs.map((p) => `<li><strong>${esc(p.value)}</strong><span>${esc(p.label)}</span></li>`).join("");
  $("#wp-label").textContent = page.label;
  $("#wp-h1").textContent = page.title;
  $("#wp-sub").textContent = page.text;
  $("#wp-proof").innerHTML = proof;
  $("#wp-hire-top").textContent = site.hire.cta;
  $("#wp-items").innerHTML = projects.map((p, i) => `
    <article class="wp-item" data-i="${i}" aria-labelledby="wp-${p.id}">
      <p class="wp-kicker"><span>${pad2(i + 1)}</span>${esc(p.kind)}<i>${esc(p.status)}</i></p>
      <h2 class="wp-title" id="wp-${p.id}">${esc(p.title)}</h2>
      <p class="wp-pitch">${esc(pitches[p.id] || p.short)}</p>
      <div class="wp-facts">
        <p class="wp-metric"><strong>${esc(p.metric.value)}</strong><span>${esc(p.metric.label)}</span></p>
        <p class="wp-stack">${esc(p.stack.slice(0, 5).join(" · "))}</p>
      </div>
      <button class="btn btn-lg" type="button" data-id="${p.id}">View case study <span aria-hidden="true">↗</span></button>
    </article>`).join("");
  $("#wp-rail").innerHTML = projects.map((p, i) => `<li><button type="button" data-i="${i}" aria-label="${esc(p.title)}"><span>${pad2(i + 1)}</span><b>${esc(p.title)}</b></button></li>`).join("");
  $("#walk").style.height = `${100 + n * STEP}svh`;
  $("#wp-end-kicker").textContent = page.end.kicker;
  $("#wp-end-title").textContent = page.end.title;
  $("#wp-end-text").textContent = page.end.text;
  $("#wp-end-proof").innerHTML = proof;
  $("#wp-hire").textContent = site.hire.cta;
}

// ---------- Smooth scrolling ----------
let lenis = null, ownLoop = true, onScroll = null;
async function startLenis() {
  if (reduceMotion) return;
  try {
    const { default: Lenis } = await import("lenis");
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenis.on("scroll", () => { if (onScroll) onScroll(); });
    const raf = (t) => { if (ownLoop) { lenis.raf(t); requestAnimationFrame(raf); } };
    requestAnimationFrame(raf);
  } catch {
    lenis = null;
  }
}
const scrollToY = (y) => {
  if (lenis) lenis.scrollTo(y, { duration: 1.4 });
  else window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
};
const lockScroll = (lock) => {
  if (lenis) lock ? lenis.stop() : lenis.start();
  document.documentElement.style.overflow = lock ? "hidden" : "";
};

// ---------- The 3D path (or nothing, if it cannot start) ----------
async function startScene() {
  const stub = { set() {}, setBeforeFrame() {}, whenFirstFrame(cb) { cb(); } };
  try {
    const mod = await import("./work-scene.js");
    return mod.createWorkScene({ canvas: $("#wscene"), count: n });
  } catch (err) {
    console.warn("3D unavailable:", err);
    document.documentElement.classList.add("no-webgl");
    return stub;
  }
}

// ---------- The walk ----------
function setupWalk(scene) {
  const walk = $("#walk"), items = $$(".wp-item"), railButtons = $$("#wp-rail button"), bar = $("#scrollbar");
  const look = items.map(() => "");
  let current = -1;
  function update() {
    const vh = innerHeight, r = walk.getBoundingClientRect(), span = Math.max(walk.offsetHeight - vh, 1);
    const docH = document.documentElement.scrollHeight - vh;
    bar.style.transform = `scaleX(${docH > 0 ? clamp(scrollY / docH, 0, 1) : 0})`;
    // Before the walk is reached the path leads up to the first project; then each project rests for the
    // first part of its stretch, and the path turns to the next one.
    const u = clamp(-r.top / span, 0, 1) * stops, i = Math.min(Math.floor(u), n - 1), f = u - i;
    const at = r.top > 0 ? -clamp(r.top / vh, 0, 1) : i + (i < n - 1 ? smooth(clamp((f - 0.34) / 0.66, 0, 1)) : 0);
    scene.set(at);
    // The words for a project come forward out of the distance as its station arrives, and leave past you.
    items.forEach((el, k) => {
      const d = k - at, a = Math.round((1 - smooth(clamp(Math.abs(d) / 0.5, 0, 1))) * 50) / 50;
      const next = a <= 0 ? "" : `${(d * 90).toFixed(1)}|${(-d * (d > 0 ? 420 : 260)).toFixed(1)}|${a}`;
      if (next === look[k]) return;
      look[k] = next;
      el.style.visibility = next ? "" : "hidden";
      if (!next) return;
      const [y, z, o] = next.split("|");
      el.style.setProperty("--y", `${reduceMotion ? 0 : y}px`);
      el.style.setProperty("--z", `${reduceMotion ? 0 : z}px`);
      el.style.setProperty("--a", o);
    });
    const now = clamp(Math.round(at), 0, n - 1);
    if (now !== current) {
      current = now;
      items.forEach((el, k) => el.classList.toggle("on", k === now));
      railButtons.forEach((b, k) => b.classList.toggle("on", k === now));
      $("#wp-count").textContent = `${pad2(now + 1)} / ${pad2(n)}`;
    }
  }
  railButtons.forEach((b, k) => b.addEventListener("click", () => {
    const top = walk.getBoundingClientRect().top + scrollY;
    scrollToY(top + ((k + 0.15) / stops) * (walk.offsetHeight - innerHeight));
  }));
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  onScroll = update;
  update();
}

// ---------- Start ----------
async function boot() {
  render();
  startLenis();
  const scene = await startScene();
  // One frame loop for both: the scroll moves first, then the 3D is drawn from that same position.
  if (scene.live) {
    ownLoop = false;
    scene.setBeforeFrame((t) => { if (lenis) lenis.raf(t); });
  }
  setupWalk(scene);
  setupCase({ lock: lockScroll, hire: () => { location.href = "index.html#contact"; } });
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  const show = () => document.body.classList.remove("is-loading");
  Promise.all([fonts, new Promise((res) => scene.whenFirstFrame(res))]).then(show);
  setTimeout(show, 3000); // never wait on a slow network for more than this
}
boot();
