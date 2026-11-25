// The work page: every project, each in a wide section of its own. Its words are on one side; on the other
// is its cover: a frame built in layers (a drawing of the idea, the steps of how it works, and the key
// number on a tag in front), which tilts in 3D as it passes and leans toward the mouse, so the layers slide
// over each other. A project's photo, once it has one, fills the frame instead of the drawing.
// A faint 3D path runs behind the page. "View case study" opens the same case study the home page uses.

import { site, projects } from "./content.js";
import { setupCase, findImage } from "./case.js";
import { sketch } from "./covers.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pad2 = (n) => String(n).padStart(2, "0");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const n = projects.length;

// ---------- Content ----------
function render() {
  const page = site.workPage, proof = site.proofs.map((p) => `<li><strong>${esc(p.value)}</strong><span>${esc(p.label)}</span></li>`).join("");
  $("#wp-label").textContent = page.label;
  $("#wp-h1").textContent = page.title;
  $("#wp-sub").textContent = page.text;
  $("#wp-proof").innerHTML = proof;
  $("#wp-hire-top").textContent = site.hire.cta;
  // The opening screen lists every project; a row jumps to its section.
  $("#wp-index").innerHTML = projects.map((p, i) => `
    <li style="--i:${i}"><a href="#p-${p.id}"><span>${pad2(i + 1)}</span><b>${esc(p.title)}</b><i>${esc(p.kind)}</i></a></li>`).join("");
  // A small marker at the side of the screen shows which project you are at.
  $("#wp-side").innerHTML = projects.map((p, i) => `<li><button type="button" data-i="${i}" aria-label="${esc(p.title)}"></button></li>`).join("");
  // One section for each project.
  $("#wp-list").innerHTML = projects.map((p, i) => `
    <section class="wp-proj" id="p-${p.id}" data-i="${i}" data-no="${pad2(i + 1)}" aria-labelledby="wp-${p.id}">
      <div class="wp-text">
        <p class="wp-kicker"><span>${pad2(i + 1)}</span>${esc(p.kind)}<i>${esc(p.status)}</i></p>
        <h2 class="wp-title" id="wp-${p.id}"><span>${esc(p.title)}</span></h2>
        <p class="wp-pitch">${esc(p.summary)}</p>
        <dl class="wp-facts">
          <div><dt>Result</dt><dd><strong>${esc(p.metric.value)}</strong>${esc(p.metric.label)}</dd></div>
          <div><dt>Role</dt><dd>${esc(p.role)}</dd></div>
          <div><dt>Built with</dt><dd>${esc(p.stack.slice(0, 5).join(", "))}</dd></div>
        </dl>
        <div class="wp-actions">
          <button class="btn btn-lg" type="button" data-id="${p.id}">View case study <span aria-hidden="true">↗</span></button>
          ${p.link ? `<a class="wp-link" href="${esc(p.link.url)}" target="_blank" rel="noopener">${esc(p.link.label)} ↗</a>` : ""}
        </div>
      </div>
      <div class="wp-visual">
        <button class="wp-frame" type="button" data-id="${p.id}" aria-label="${esc(p.title)}: view case study">
          <span class="cv-bg"></span>
          <span class="cv-art">${sketch(p)}</span>
          <span class="cv-flow">${p.flow.map((step) => `<i>${esc(step)}</i>`).join("")}</span>
          <span class="cv-tag"><strong>${esc(p.metric.value)}</strong>${esc(p.metric.label)}</span>
          <span class="cv-open">View case study ↗</span>
        </button>
      </div>
    </section>`).join("");
  $("#wp-end-kicker").textContent = page.end.kicker;
  $("#wp-end-title").textContent = page.end.title;
  $("#wp-end-text").textContent = page.end.text;
  $("#wp-end-proof").innerHTML = proof;
  $("#wp-hire").textContent = site.hire.cta;
  // A project's photo fills its frame in place of the drawing (see findImage in case.js).
  projects.forEach((p) => findImage(p).then((src) => {
    if (!src) return;
    const frame = $(`#p-${p.id} .wp-frame`);
    $(".cv-bg", frame).innerHTML = `<img src="${esc(src)}" alt="">`;
    frame.classList.add("has-image");
  }));
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
const scrollToEl = (el) => {
  if (lenis) lenis.scrollTo(el, { duration: 1.4, offset: -20 });
  else el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
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

// ---------- The sections ----------
function setupSections(scene) {
  const list = $$(".wp-proj"), bar = $("#scrollbar"), marks = $$("#wp-side button");
  const frames = list.map((el) => $(".wp-frame", el));
  const lean = list.map(() => ({ x: 0, y: 0 })); // how far each frame leans toward the mouse
  const last = list.map(() => "");
  let current = -2;
  function update() {
    const vh = innerHeight, docH = document.documentElement.scrollHeight - vh;
    bar.style.transform = `scaleX(${docH > 0 ? clamp(scrollY / docH, 0, 1) : 0})`;
    let at = -1, now = -1;
    list.forEach((el, k) => {
      const r = el.getBoundingClientRect();
      // q: where the section is. 1 = a screen below the middle, 0 = in the middle, -1 = a screen above.
      const q = (r.top + r.height / 2 - vh / 2) / vh;
      if (k === 0 && q > 0) at = -clamp(q, 0, 1);
      if (q <= 0.5 && q > -0.5) at = k - q; // the 3D path is at this project while its section is nearest the middle
      if (r.top < vh * 0.5 && r.bottom > vh * 0.5) now = k; // the project across the middle of the screen
      if (r.bottom < -80 || r.top > vh + 80) return;
      // Its words rise into place the first time the section is well into view.
      if (!el.classList.contains("in") && r.top < vh * 0.82) el.classList.add("in");
      // The frame tips back as it comes up, faces you in the middle, and tips forward as it leaves. It is
      // turned a little toward its words; the big number behind the section drifts the other way.
      const c = clamp(q, -1, 1), side = k % 2 ? -1 : 1, still = reduceMotion ? 0 : 1;
      const next = [
        (still * (1.5 + c * 14) - lean[k].y * 7).toFixed(2),
        (still * side * (6 + Math.abs(c) * 8) + lean[k].x * 9).toFixed(2),
        (still * c * 40).toFixed(1),
        (still * c * -28).toFixed(1),
        (still * c * -90).toFixed(1),
      ].join("|");
      if (next === last[k]) return;
      last[k] = next;
      const [rx, ry, ty, py, gy] = next.split("|"), f = frames[k];
      f.style.setProperty("--rx", `${rx}deg`);
      f.style.setProperty("--ry", `${ry}deg`);
      f.style.setProperty("--ty", `${ty}px`);
      f.style.setProperty("--py", `${py}px`);
      el.style.setProperty("--gy", `${gy}px`);
    });
    scene.set(at);
    if (now !== current) {
      current = now;
      marks.forEach((b, k) => b.classList.toggle("on", k === now));
      document.body.classList.toggle("wp-walking", now >= 0);
    }
  }
  // The frame leans toward the mouse while it is over it.
  frames.forEach((f, k) => {
    f.addEventListener("pointermove", (e) => {
      const r = f.getBoundingClientRect();
      lean[k].x = clamp((e.clientX - r.left) / r.width - 0.5, -0.5, 0.5) * 2;
      lean[k].y = clamp((e.clientY - r.top) / r.height - 0.5, -0.5, 0.5) * 2;
      update();
    });
    f.addEventListener("pointerleave", () => { lean[k].x = lean[k].y = 0; update(); });
  });
  if (reduceMotion) list.forEach((el) => el.classList.add("in"));
  // The index on the opening screen and the marker at the side both scroll to a project.
  $$("#wp-index a").forEach((a) => a.addEventListener("click", (e) => {
    const target = document.getElementById(a.getAttribute("href").slice(1));
    if (!target) return;
    e.preventDefault();
    scrollToEl(target);
  }));
  marks.forEach((b, k) => b.addEventListener("click", () => scrollToEl(list[k])));
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
  setupSections(scene);
  setupCase({ lock: lockScroll, hire: () => { location.href = site.hire.href; } });
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  const show = () => document.body.classList.remove("is-loading");
  Promise.all([fonts, new Promise((res) => scene.whenFirstFrame(res))]).then(show);
  setTimeout(show, 3000); // never wait on a slow network for more than this
}
boot();
