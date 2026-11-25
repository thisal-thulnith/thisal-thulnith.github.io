// The case study: one tall page inside a sheet that slides up over whatever page is showing.
// Its parts rise into place as they are scrolled to, a line across the top shows how far down you are,
// and the steps of "how it works" light up one after another. The home page and the work page both use it.

import { site, projects } from "./content.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pad2 = (n) => String(n).padStart(2, "0");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// The page says how to stop its own scrolling while the sheet is open, and what "Work with me" does.
let hooks = { lock() {}, hire() {} };
let seen = null;

function openSheet(el) {
  el._lastFocus = document.activeElement;
  el.hidden = false;
  hooks.lock(true);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("open")));
  setTimeout(() => $(".sheet-panel", el).focus({ preventScroll: true }), 50);
}

export function closeSheet(el = $("#case")) {
  if (el.hidden) return;
  el.classList.remove("open");
  hooks.lock(false);
  setTimeout(() => { el.hidden = true; }, 750);
  el._lastFocus?.focus?.({ preventScroll: true });
}

function caseScroll() {
  const panel = $("#case .sheet-panel"), room = panel.scrollHeight - panel.clientHeight;
  $("#cs-bar").style.transform = `scaleX(${room > 0 ? clamp(panel.scrollTop / room, 0, 1) : 0})`;
  const flow = $(".cs-flow", panel);
  if (!flow) return;
  const box = flow.getBoundingClientRect(), top = panel.getBoundingClientRect().top;
  const p = clamp((top + panel.clientHeight * 0.62 - box.top) / Math.max(box.height, 1), 0, 1);
  flow.style.setProperty("--p", p.toFixed(3));
  const steps = $$("li", flow);
  steps.forEach((li, j) => li.classList.toggle("on", p >= (j + 0.35) / steps.length));
}

export function openCase(id) {
  const i = projects.findIndex((p) => p.id === id);
  if (i < 0) return;
  const p = projects[i], next = projects[(i + 1) % projects.length];
  const body = $("#case-body"), sheet = $("#case"), panel = $(".sheet-panel", sheet);
  body.innerHTML = `
    <header class="cs-hero">
      <p class="cs-kicker"><span>${pad2(i + 1)} / ${pad2(projects.length)}</span>${esc(p.kind)}</p>
      <h2 class="cs-title" id="case-title">${esc(p.title)}</h2>
      <p class="cs-lead">${esc(p.summary)}</p>
      <dl class="cs-facts">
        <div><dt>Role</dt><dd>${esc(p.role)}</dd></div>
        <div><dt>Status</dt><dd>${esc(p.status)}</dd></div>
        ${p.link ? `<div><dt>Link</dt><dd><a href="${esc(p.link.url)}" target="_blank" rel="noopener">${esc(p.link.label)} ↗</a></dd></div>` : ""}
      </dl>
    </header>
    ${p.image ? `<figure class="cs-shot" data-cs><img src="${esc(p.image)}" alt=""></figure>` : ""}
    <section class="cs-sec" data-cs>
      <h3>The result</h3>
      <p class="cs-big"><strong>${esc(p.metric.value)}</strong><span>${esc(p.metric.label)}</span></p>
    </section>
    <section class="cs-sec">
      <h3 data-cs>How it works</h3>
      <ol class="cs-flow">${p.flow.map((step, j) => `<li><span>${pad2(j + 1)}</span><b>${esc(step)}</b></li>`).join("")}</ol>
    </section>
    <section class="cs-sec">
      <h3 data-cs>What I built</h3>
      <ol class="cs-built">${p.built.map((line, j) => `<li data-cs><span>${pad2(j + 1)}</span><p>${esc(line)}</p></li>`).join("")}</ol>
    </section>
    <section class="cs-sec" data-cs>
      <h3>Built with</h3>
      <p class="cs-stack">${p.stack.map(esc).join(" <i>/</i> ")}</p>
    </section>
    <footer class="cs-end">
      <button class="cs-next" type="button" data-go="${next.id}"><span>Next project</span><strong>${esc(next.title)} →</strong></button>
      <a class="btn btn-lg" href="#contact" data-hire>${esc(site.hire.cta)} <span aria-hidden="true">↗</span></a>
    </footer>`;
  $("[data-go]", body).addEventListener("click", (e) => openCase(e.currentTarget.dataset.go));
  // "Work with me" closes the case study and goes where the page says.
  $("[data-hire]", body).addEventListener("click", (e) => {
    e.preventDefault();
    closeSheet(sheet);
    setTimeout(() => hooks.hire(), 120);
  });
  panel.scrollTop = 0;
  if (seen) seen.disconnect();
  if ("IntersectionObserver" in window && !reduceMotion) {
    seen = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); seen.unobserve(en.target); }
    }), { root: panel, threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    $$("[data-cs]", body).forEach((el) => seen.observe(el));
  } else {
    $$("[data-cs]", body).forEach((el) => el.classList.add("in"));
  }
  caseScroll();
  if (sheet.hidden) openSheet(sheet);
}

// Call once per page. `lock(true/false)` stops and restarts the page's own scrolling; `hire()` is what
// the "Work with me" button at the end of a case study does.
export function setupCase(pageHooks) {
  hooks = { ...hooks, ...pageHooks };
  const sheet = $("#case");
  sheet.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeSheet(sheet); });
  $(".sheet-panel", sheet).addEventListener("scroll", caseScroll, { passive: true });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(sheet); });
  // Any button that names a project opens its case study.
  document.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-id]");
    if (b) openCase(b.dataset.id);
  });
}
