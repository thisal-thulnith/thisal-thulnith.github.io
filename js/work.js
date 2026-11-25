// The work page: every project told as a short story in three parts: the idea, how it works, the result.
// The words for the three parts scroll past on one side. On the other side a small card stays in view: a
// three-sided block that turns one face for each part (a drawing or the project's photo, the steps, the
// key number). "View case study" opens the same case study the home page uses.

import { site, projects } from "./content.js";
import { setupCase, findImage } from "./case.js";
import { sketch, diagramWide } from "./covers.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (t) => t * t * (3 - 2 * t);
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
  // The opening screen lists every project; a row jumps to its story.
  $("#wp-index").innerHTML = projects.map((p, i) => `
    <li style="--i:${i}"><a href="#p-${p.id}"><span>${pad2(i + 1)}</span><b>${esc(p.title)}</b><i>${esc(p.kind)}</i></a></li>`).join("");
  // A small marker at the side of the screen shows which project you are at.
  $("#wp-side").innerHTML = projects.map((p, i) => `<li><button type="button" data-i="${i}" aria-label="${esc(p.title)}"></button></li>`).join("");
  // One story for each project: the card on the left, the three parts on the right.
  $("#wp-list").innerHTML = projects.map((p, i) => `
    <section class="ps" id="p-${p.id}" data-i="${i}" aria-labelledby="ps-${p.id}">
      <div class="ps-media">
        <div class="ps-stage">
          <button class="prism" type="button" data-id="${p.id}" aria-label="${esc(p.title)}: view case study">
            <span class="prism-body">
              <span class="face face-idea"><em>The idea</em><span class="face-art">${sketch(p)}</span></span>
              <span class="face face-how"><em>How it works</em><span class="face-art">${diagramWide(p)}</span></span>
              <span class="face face-result"><em>The result</em><strong>${esc(p.metric.value)}</strong><small>${esc(p.metric.label)}</small></span>
            </span>
          </button>
          <ol class="ps-dots" aria-hidden="true"><li></li><li></li><li></li></ol>
        </div>
      </div>
      <div class="ps-story">
        <div class="ps-beat">
          <div class="ps-inline" aria-hidden="true">${sketch(p)}</div>
          <p class="ps-kicker"><span>${pad2(i + 1)}</span>${esc(p.kind)}<i>${esc(p.status)}</i></p>
          <h2 class="ps-title" id="ps-${p.id}">${esc(p.title)}</h2>
          <p class="ps-lead">${esc(p.summary)}</p>
        </div>
        <div class="ps-beat">
          <p class="ps-label">How it works</p>
          <ol class="ps-steps">${p.flow.map((step, j) => `<li><span>${pad2(j + 1)}</span>${esc(step)}</li>`).join("")}</ol>
        </div>
        <div class="ps-beat">
          <p class="ps-label">The result</p>
          <p class="ps-result"><strong>${esc(p.metric.value)}</strong> ${esc(p.metric.label)}</p>
          <ol class="ps-built">${p.built.slice(0, 3).map((line) => `<li>${esc(line)}</li>`).join("")}</ol>
          <dl class="ps-facts">
            <div><dt>Role</dt><dd>${esc(p.role)}</dd></div>
            <div><dt>Built with</dt><dd>${esc(p.stack.slice(0, 5).join(", "))}</dd></div>
          </dl>
          <div class="ps-actions">
            <button class="btn btn-lg" type="button" data-id="${p.id}">View case study <span aria-hidden="true">↗</span></button>
            ${p.link ? `<a class="wp-link" href="${esc(p.link.url)}" target="_blank" rel="noopener">${esc(p.link.label)} ↗</a>` : ""}
          </div>
        </div>
      </div>
    </section>`).join("");
  $("#wp-end-kicker").textContent = page.end.kicker;
  $("#wp-end-title").textContent = page.end.title;
  $("#wp-end-text").textContent = page.end.text;
  $("#wp-end-proof").innerHTML = proof;
  $("#wp-hire").textContent = site.hire.cta;
  // A project's photo takes the place of the drawing on the first face of its card (see findImage in case.js).
  projects.forEach((p) => findImage(p).then((src) => {
    if (!src) return;
    const face = $(`#p-${p.id} .face-idea`), inline = $(`#p-${p.id} .ps-inline`);
    $(".face-art", face).innerHTML = `<img src="${esc(src)}" alt="">`;
    face.classList.add("has-image");
    // On a phone there is no card: the photo sits above the project's name instead.
    inline.innerHTML = `<img src="${esc(src)}" alt="">`;
    inline.classList.add("has-image");
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
  if (lenis) lenis.scrollTo(el, { duration: 1.4 });
  else el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
};
const lockScroll = (lock) => {
  if (lenis) lock ? lenis.stop() : lenis.start();
  document.documentElement.style.overflow = lock ? "hidden" : "";
};

// ---------- The 3D behind the page (or nothing, if it cannot start) ----------
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

// ---------- The stories ----------
function setupStories(scene) {
  const bar = $("#scrollbar"), marks = $$("#wp-side button");
  const list = $$(".ps").map((el) => ({
    el, body: $(".prism-body", el), prism: $(".prism", el), beats: $$(".ps-beat", el), dots: $$(".ps-dots li", el),
    lean: { x: 0, y: 0 }, last: "", part: -1,
  }));
  let current = -2;
  function update() {
    const vh = innerHeight, mid = vh / 2, docH = document.documentElement.scrollHeight - vh;
    bar.style.transform = `scaleX(${docH > 0 ? clamp(scrollY / docH, 0, 1) : 0})`;
    let now = -1;
    list.forEach((s, k) => {
      const r = s.el.getBoundingClientRect();
      if (r.top < mid && r.bottom > mid) now = k;
      if (r.bottom < -100 || r.top > vh + 100) return;
      // Where the middle of the screen is among the three parts: 0 at the first, 1 at the second, 2 at the third.
      const c = s.beats.map((b) => { const q = b.getBoundingClientRect(); return q.top + q.height / 2; });
      const b = mid <= c[0] ? 0 : mid >= c[2] ? 2 : mid < c[1] ? (mid - c[0]) / (c[1] - c[0]) : 1 + (mid - c[1]) / (c[2] - c[1]);
      // The card rests on a face while its part is being read, and turns to the next in between.
      const i = Math.min(Math.floor(b), 1), f = b - i, t = smooth(clamp((f - 0.28) / 0.44, 0, 1));
      const turn = reduceMotion ? Math.round(b) * 120 : (i + t) * 120;
      const back = reduceMotion ? 0 : Math.sin(t * Math.PI) * 46; // it steps back a little as it turns
      const next = `${(-turn + s.lean.x * 6).toFixed(2)}|${(-s.lean.y * 5).toFixed(2)}|${back.toFixed(1)}`;
      if (next !== s.last) {
        s.last = next;
        const [ry, rx, z] = next.split("|");
        s.body.style.setProperty("--turn", `${ry}deg`);
        s.body.style.setProperty("--tip", `${rx}deg`);
        s.body.style.setProperty("--back", `${z}px`);
      }
      const part = Math.round(b);
      if (part !== s.part) {
        s.part = part;
        s.beats.forEach((el, j) => el.classList.toggle("on", j === part));
        s.dots.forEach((el, j) => el.classList.toggle("on", j === part));
      }
    });
    if (now !== current) {
      current = now;
      marks.forEach((b, k) => b.classList.toggle("on", k === now));
      document.body.classList.toggle("wp-walking", now >= 0);
      scene.set(Math.max(now, 0));
    }
  }
  // The card leans toward the mouse while it is over it.
  list.forEach((s) => {
    s.prism.addEventListener("pointermove", (e) => {
      const r = s.prism.getBoundingClientRect();
      s.lean.x = clamp((e.clientX - r.left) / r.width - 0.5, -0.5, 0.5) * 2;
      s.lean.y = clamp((e.clientY - r.top) / r.height - 0.5, -0.5, 0.5) * 2;
      update();
    });
    s.prism.addEventListener("pointerleave", () => { s.lean.x = s.lean.y = 0; update(); });
  });
  // The index on the opening screen and the marker at the side both scroll to a project.
  $$("#wp-index a").forEach((a) => a.addEventListener("click", (e) => {
    const target = document.getElementById(a.getAttribute("href").slice(1));
    if (!target) return;
    e.preventDefault();
    scrollToEl(target);
  }));
  marks.forEach((b, k) => b.addEventListener("click", () => scrollToEl(list[k].el)));
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
  setupStories(scene);
  setupCase({ lock: lockScroll, hire: () => { location.href = site.hire.href; } });
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  const show = () => document.body.classList.remove("is-loading");
  Promise.all([fonts, new Promise((res) => scene.whenFirstFrame(res))]).then(show);
  setTimeout(show, 3000); // never wait on a slow network for more than this
}
boot();
