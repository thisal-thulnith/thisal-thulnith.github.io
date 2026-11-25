// The contact page: the offer and the proof, every way to reach me as large rows, and a small form that
// opens a ready-written message in the visitor's own email app. Nothing typed here leaves the page.

import { site } from "./content.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pad2 = (n) => String(n).padStart(2, "0");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Content ----------
function render() {
  const page = site.contactPage;
  $("#cp-label").textContent = page.label;
  $("#cp-h1").textContent = page.title;
  $("#cp-sub").textContent = page.text;
  $("#cp-proof").innerHTML = site.proofs.map((p) => `<li><strong>${esc(p.value)}</strong><span>${esc(p.label)}</span></li>`).join("");
  $("#cp-mail").href = `mailto:${site.email}`;
  $("#cp-avail").textContent = site.status;
  // Every way to reach me: what it is, the address, and where it goes.
  const ways = [
    { name: "Email", detail: site.email, href: `mailto:${site.email}` },
    { name: "LinkedIn", detail: site.links.linkedin.replace(/^https?:\/\/(www\.)?/, ""), href: site.links.linkedin },
    { name: "GitHub", detail: site.links.github.replace(/^https?:\/\//, ""), href: site.links.github },
  ];
  $("#cp-ways").innerHTML = ways.map((w, i) => `
    <li><a href="${esc(w.href)}"${w.href.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>
      <span>${pad2(i + 1)}</span><b>${esc(w.name)}</b><i>${esc(w.detail)}</i><em aria-hidden="true">↗</em>
    </a></li>`).join("");
  $("#cp-reasons").innerHTML = page.reasons.map((r, i) => `<button type="button" data-i="${i}" aria-pressed="${i === 0}">${esc(r)}</button>`).join("");
  $("#cp-fields").textContent = site.fields.join(", ");
  $("#cp-loc").textContent = site.location;
  $("#cp-how").textContent = site.availability;
  $("#cp-year").textContent = new Date().getFullYear();
}

// The time where I am, so a visitor knows when a reply is likely.
function setupClock() {
  const el = $("#cp-time");
  const tick = () => {
    try {
      el.textContent = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: site.timezone }).format(new Date());
    } catch {
      el.textContent = "";
    }
  };
  tick();
  setInterval(tick, 30000);
}

// ---------- The message ----------
function setupForm() {
  const page = site.contactPage, reasons = $$("#cp-reasons button");
  let reason = 0;
  reasons.forEach((b, i) => b.addEventListener("click", () => {
    reason = i;
    reasons.forEach((x, j) => x.setAttribute("aria-pressed", String(j === i)));
  }));
  // The message is built here and handed to the visitor's own email app. Nothing is sent from this page.
  $("#cp-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#cp-name").value.trim(), text = $("#cp-text").value.trim();
    const subject = `${page.reasons[reason]}${name ? `, from ${name}` : ""}`;
    const body = `${text || ""}${name ? `\n\n${name}` : ""}`;
    location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  $("#cp-copy").addEventListener("click", async (e) => {
    const b = e.currentTarget;
    try {
      await navigator.clipboard.writeText(site.email);
      b.textContent = "Copied";
    } catch {
      b.textContent = site.email;
    }
    setTimeout(() => { b.textContent = "Copy my email"; }, 2200);
  });
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

// ---------- The 3D sphere (or nothing, if it cannot start) ----------
async function startScene() {
  const stub = { setDim() {}, setBeforeFrame() {}, whenFirstFrame(cb) { cb(); } };
  try {
    const mod = await import("./contact-scene.js");
    return mod.createContactScene({ canvas: $("#cscene") });
  } catch (err) {
    console.warn("3D unavailable:", err);
    document.documentElement.classList.add("no-webgl");
    return stub;
  }
}

function setupScroll(scene) {
  const bar = $("#scrollbar"), rows = $$(".cp-sec");
  function update() {
    const vh = innerHeight, docH = document.documentElement.scrollHeight - vh;
    bar.style.transform = `scaleX(${docH > 0 ? clamp(scrollY / docH, 0, 1) : 0})`;
    // The sphere dims once the opening screen has scrolled away.
    scene.setDim(1 - 0.84 * clamp(scrollY / (vh * 0.7), 0, 1));
    // Each part rises into place the first time it is well into view.
    rows.forEach((el) => { if (!el.classList.contains("in") && el.getBoundingClientRect().top < vh * 0.84) el.classList.add("in"); });
  }
  if (reduceMotion) rows.forEach((el) => el.classList.add("in"));
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  onScroll = update;
  update();
}

// ---------- Start ----------
async function boot() {
  render();
  setupClock();
  setupForm();
  startLenis();
  const scene = await startScene();
  if (scene.live) {
    ownLoop = false;
    scene.setBeforeFrame((t) => { if (lenis) lenis.raf(t); });
  }
  setupScroll(scene);
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  const show = () => document.body.classList.remove("is-loading");
  Promise.all([fonts, new Promise((res) => scene.whenFirstFrame(res))]).then(show);
  setTimeout(show, 3000); // never wait on a slow network for more than this
}
boot();
