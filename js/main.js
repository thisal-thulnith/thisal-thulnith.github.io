// Wires the page together: loading screen, content, the 3D cloud and how it follows the scroll,
// the tour, moving type, the work list with its pointer-following card, case studies and the terminal.

import { site, projects, services, pitches, experience, education, awards, skills } from "./content.js";
import { diagramWide } from "./covers.js";
import { createTerminal } from "./terminal.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (t) => t * t * (3 - 2 * t);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pad2 = (n) => String(n).padStart(2, "0");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine)").matches;

// ---------- Content ----------
// The track record, in four parts. Each has its own layout and its own 3D form, and the scroll moves through them.
const jobs = [...experience].reverse(); // oldest first: the bottom rung of the ladder
const school = [...education].reverse(); // oldest first: left to right
const stages = (el, k) => $$("li", el).forEach((li) => {
  const j = +li.dataset.rung;
  li.classList.toggle("hot", j === k);
  li.classList.toggle("done", j < k);
});
const REC = [
  {
    name: "Experience", cls: "ladder", n: jobs.length, w: 1,
    // Drawn with now at the top and the first job at the bottom, so scrolling climbs it.
    html: () => jobs.map((e, j) => `<li data-rung="${j}"><span class="r-when">${esc(e.period)}</span><span class="r-what">${esc(e.role)}</span><span class="r-where">${esc(e.org)}</span><span class="r-note">${esc(e.note || "")}</span></li>`).reverse().join(""),
    mark: stages,
    cap: (k) => [`${k + 1}/${jobs.length}`, jobs[k].org],
  },
  {
    name: "Education", cls: "r-edu", n: school.length, w: 1,
    html: () => school.map((e, j) => `<li data-rung="${j}" class="${e.done === false ? "open" : ""}"><span class="edu-line"><i></i></span><span class="r-when">${esc(e.period)}</span><span class="r-what">${esc(e.title)}</span><span class="r-where">${esc(e.org)}</span><span class="edu-state">${esc(e.state || "")}</span></li>`).join(""),
    mark: stages,
    cap: (k) => [`${k + 1}/${school.length}`, school[k].state || school[k].org],
  },
  {
    name: "Awards", cls: "r-awards", n: 1, w: 1.3,
    // The bar under each one gets shorter down the list: the first is the highest placing.
    html: () => awards.map((a, j) => `<li style="--i:${j};--w:${Math.max(100 - j * 17, 24)}%"><span class="aw-place">${esc(a.place)}</span><span class="r-what">${esc(a.title)}</span><span class="r-where">${esc(a.note || "")}</span><span class="aw-bar"><i></i></span></li>`).join(""),
    cap: () => [String(awards.length), "competition placings"],
  },
  {
    name: "Skills", cls: "r-skills", n: skills.length, w: 0.6,
    html: () => `<li class="sk-ticks">${skills.map(() => "<i></i>").join("")}</li><li class="sk-name"></li><li class="sk-items"></li>`,
    mark: (el, k) => {
      $$(".sk-ticks i", el).forEach((t, j) => t.classList.toggle("on", j === k));
      $(".sk-name", el).innerHTML = `<span>${esc(skills[k].group)}</span>`;
      $(".sk-items", el).innerHTML = skills[k].items.map((x, j) => `<span style="--i:${j}">${esc(x)}</span>`).join("");
    },
    cap: (k) => [String(skills[k].items.length), "tools and methods in this area"],
  },
];
// One frame per scroll stop: every job, every qualification, the awards, every skill area. `w` is how much scroll it takes.
const FRAMES = REC.flatMap((g, tab) => Array.from({ length: g.n }, (_, k) => ({ tab, k, w: g.w })));
const RTOTAL = FRAMES.reduce((sum, f) => sum + f.w, 0);
FRAMES.reduce((acc, f) => { f.at = acc / RTOTAL; f.end = (acc + f.w) / RTOTAL; return acc + f.w; }, 0);

// How much scrolling each stop takes, in screen heights (svh). Smaller means the page moves on sooner.
const HERO_LEN = 92, TOUR_STEP = 61, THINK_LEN = 200, WORK_STEP = 62, RECORD_STEP = 48;

// The picture for a project: its real screenshot if content.js names one, otherwise a drawing of how it works.
const visual = (p) => (p.image ? `<img src="${esc(p.image)}" alt="">` : diagramWide(p));

// ---------- Content ----------
function renderContent() {
  // The name is the brand: one span per letter so each can rise on its own.
  let k = 0;
  const title = $("#hero-title");
  title.setAttribute("aria-label", site.name);
  title.innerHTML = [site.first, site.last]
    .map((word) => `<span class="line" aria-hidden="true">${[...word].map((c) => `<span class="ch" style="--i:${k++}">${esc(c)}</span>`).join("")}</span>`)
    .join("");
  $("#hero-eyebrow").textContent = site.role;
  $("#hero-hook").textContent = site.title.join(" ");
  $("#hero-proof").textContent = site.proof;
  $("#hero-fields").innerHTML = site.fields.map((f) => `<span>${esc(f)}</span>`).join("");
  $("#hero-pillars").innerHTML = site.pillars
    .map((p, i) => `<li><a href="#" data-stop="${i}"><span>${pad2(i + 1)}</span><strong>${esc(p.title)}</strong><b aria-hidden="true">↓</b><em>${esc(p.sub)}</em></a></li>`)
    .join("");
  $("#hero-status").textContent = site.status;
  $("#hero-loc").textContent = site.location;

  // What I do: three pinned steps.
  $("#steps").innerHTML = services
    .map((s) => `<article class="step"><p class="step-num">${esc(s.label)}</p><h3>${esc(s.title)}</h3><p class="step-text">${esc(s.text)}</p></article>`)
    .join("");
  $("#progress").innerHTML = services.map(() => "<span></span>").join("");
  $("#tindex").innerHTML = services
    .map((s, i) => `<li><button type="button" data-stop="${i}"><span>${pad2(i + 1)}</span>${esc(s.title.replace(/\.$/, ""))}</button></li>`)
    .join("");
  $("#stage").style.height = `${100 + HERO_LEN + services.length * TOUR_STEP}svh`;

  // The brand line: one sentence to a row, repeated so the rows can slide.
  const brand = site.eyebrow.split(/(?<=[.!?])\s+/);
  const row = (text) => Array.from({ length: 6 }, () => `<span>${esc(text)}</span>`).join("");
  $("#band-text").textContent = site.eyebrow;
  $("#band-a").innerHTML = row(brand[0]);
  $("#band-b").innerHTML = row(brand[1] || brand[0]);

  // About: the statement one sentence to a line, two short paragraphs, the four areas, and where I am.
  $("#statement").innerHTML = site.about.title
    .split(/(?<=[.!?])\s+/)
    .map((line) => `<span class="s-line">${line.split(/\s+/).map((w) => `<span class="w">${esc(w)}</span>`).join(" ")}</span>`)
    .join(" ");
  $("#about-p").innerHTML = `<p class="lead">${esc(site.about.lead)}</p><p>${esc(site.about.body[0])}</p>`;
  $("#about-tags").innerHTML = site.about.tags.map((t, i) => `<li data-reveal style="--i:${i}"><span>${pad2(i + 1)}</span>${esc(t)}</li>`).join("");
  $("#about-loc").textContent = site.location;
  $("#about-status").textContent = site.status;

  // How I think: the line above the points, and the two phrases at the ends of the bar below them.
  $("#think").setAttribute("aria-label", `${site.think.lead} \u201c${site.think.from}\u201d and \u201c${site.think.to}\u201d`);
  $("#think").style.height = `${THINK_LEN}svh`;
  $("#think-label").textContent = site.think.label;
  $("#think-line").textContent = site.think.lead;
  $("#think-a").textContent = site.think.from;
  $("#think-b").textContent = site.think.to;

  // Work and story: the scroll picks which one is showing (see setupScroll).
  $("#wlist").innerHTML = projects.map((p, i) => `<li><button type="button" data-i="${i}"><span>${esc(p.title)}</span><span class="wl-metric">${esc(p.metric.value)}</span></button></li>`).join("");
  $("#work").style.height = `${100 + projects.length * WORK_STEP}svh`;
  // Track record: the four headings. Their rows are filled in as you scroll (see setupScroll).
  $("#rtabs").innerHTML = REC.map((g, i) => `<li><button type="button" data-i="${i}"><span>${esc(g.name)}</span></button></li>`).join("");
  $("#story").style.height = `${100 + RTOTAL * RECORD_STEP}svh`;

  $("#email-text").textContent = site.email;
  $("#email-text").href = `mailto:${site.email}`;
  $("#email-link").href = `mailto:${site.email}`;
  $("#email-cta").textContent = site.exploring.cta;
  $("#explore-label").textContent = site.exploring.label;
  $("#explore-title").textContent = site.exploring.title;
  $("#explore-text").textContent = site.exploring.text;
  $("#availability").textContent = site.availability;
  $("#linkedin-link").href = site.links.linkedin;
  $("#github-link").href = site.links.github;
  $("#year").textContent = new Date().getFullYear();

  // Headings marked data-lines rise word by word.
  $$("[data-lines]").forEach((el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w, i) => `<span class="wm"><span class="wi" style="--i:${i}">${esc(w)}</span></span>`).join(" ");
  });
}

// ---------- Loading screen: follows real loading, waits at 85 until the 3D is in ----------
function runLoader(ready) {
  const bar = $("#loader-bar"), num = $("#loader-num");
  const t0 = performance.now();
  let isReady = false;
  ready.then(() => { isReady = true; });
  return new Promise((res) => {
    const MIN = reduceMotion ? 200 : 1500;
    const timer = setInterval(() => {
      const f = clamp((performance.now() - t0) / MIN, 0, 1);
      const eased = 1 - Math.pow(1 - f, 3);
      const v = isReady ? eased * 100 : Math.min(eased * 100, 85);
      num.textContent = Math.round(v);
      bar.style.transform = `scaleX(${v / 100})`;
      if (v >= 100) { clearInterval(timer); res(); }
    }, 40);
  });
}

// ---------- 3D (or nothing, if it can't start) ----------
async function startScene() {
  const stub = { start() {}, setView() {}, setGrow() {}, setRecord() {}, setLayer() {}, setTour() {}, setFace() {}, hasPortrait() { return false; }, setAsk() {}, setWide() {}, setWords() {}, setTurn() {}, setSway() {}, setDim() {}, setPose() {}, burst() {}, whenFirstFrame(cb) { cb(); } };
  try {
    const mod = await import("./scene.js");
    if (!mod.webglAvailable()) throw new Error("no webgl");
    return mod.createScene({ canvas: $("#scene"), hubs: skills.length });
  } catch (err) {
    console.warn("3D disabled:", err);
    document.documentElement.classList.add("no-webgl");
    return stub;
  }
}

// ---------- Smooth scroll ----------
let lenis = null;
let lenisOwnLoop = true;
let onScrollFrame = null; // set by setupScroll: runs in the same frame the scroll position changes
async function startLenis() {
  if (reduceMotion) return;
  try {
    const { default: Lenis } = await import("lenis");
    // lerp is how much of the remaining distance is covered each frame. 0.1 eases a mouse wheel's steps
    // but lands in about a third of a second; lower values feel heavy, and the 3D lags further behind.
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenis.on("scroll", () => { if (onScrollFrame) onScrollFrame(); });
    // Until the 3D takes over the frame loop (see boot), the scroll runs its own.
    const raf = (t) => { if (lenisOwnLoop) { lenis.raf(t); requestAnimationFrame(raf); } };
    requestAnimationFrame(raf);
  } catch {
    lenis = null;
  }
}
function scrollToEl(target) {
  if (lenis) lenis.scrollTo(target, { duration: 1.5 });
  else if (typeof target === "number") window.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" });
  else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
}
function lockScroll(lock) {
  if (lenis) lock ? lenis.stop() : lenis.start();
  document.documentElement.style.overflow = lock ? "hidden" : "";
}

// ---------- Everything that follows the scroll position ----------
// Each section drives the 3D in its own way:
//   opening + "what I do"  the cloud takes three forms, one per step
//   the band and the numbers  the cloud loosens and goes dim, so the text leads
//   work    a ring of six panels turns one place per project
//   story   a path draws itself upward, one stretch per step
//   contact the agents gather again
function setupScroll(scene) {
  const nav = $("#nav"), bar = $("#scrollbar"), stage = $("#stage"), hero = $("#top"), contact = $("#contact");
  const steps = $$(".step"), ticks = $$("#progress span"), progressEl = $("#progress");
  const statement = $("#statement"), words = $$(".w", statement);
  const work = $("#work"), witems = $$("#wlist button"), wdetail = $("#wdetail");
  const storyEl = $("#story"), rtabs = $$("#rtabs button"), rrows = $("#rrows");
  const thinkEl = $("#think"), thinkA = $("#think-a"), thinkB = $("#think-b"), footerEl = $(".footer");
  const aboutEl = $("#about"), navLinks = $$(".nav-link"), navWrap = $(".nav-links");
  // Each dark window opens wider as it comes up the screen and narrows again as it leaves.
  const frames = [$(".stage-pin"), $(".pin-inner", thinkEl), $(".pin-inner", work), $(".pin-inner", storyEl), contact];
  const openOf = (top, bottom) => smooth(clamp(Math.min((1 - top / vh) / 0.85, bottom / vh), 0, 1));
  const setOpen = (el, v) => {
    const t = v.toFixed(3);
    if (el.dataset.open !== t) { el.dataset.open = t; el.style.setProperty("--open", t); }
  };
  let lastNav = -2;
  const n = services.length;
  const HERO = HERO_LEN / (HERO_LEN + n * TOUR_STEP);
  let vh = innerHeight, lastY = scrollY, lastStep = -2, lastW = -1, lastS = -1, lastOn = -1;
  const stopY = (i) => (stage.offsetHeight - vh) * (HERO + ((1 - HERO) * (i + 0.3)) / n);
  const topOf = (el) => el.getBoundingClientRect().top + scrollY;
  const pinned = (el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, p: clamp(-r.top / Math.max(el.offsetHeight - vh, 1), 0, 1) };
  };
  const hand = (f) => smooth(clamp((f - 0.5) / 0.5, 0, 1));
  // How far a shape turns as the scroll passes through one step. It starts and ends at rest, so the turn
  // never snaps back when one step hands over to the next.
  const swing = (f) => 0.42 * Math.sin(f * Math.PI * 2);
  // A longer hand-over for the project marker: it is on the move for most of each step, so scrolling always moves something.
  const glide = (f) => smooth(clamp((f - 0.3) / 0.7, 0, 1));
  // 0..1 that lingers around the middle: the skills stack rests on each layer before it moves to the next.
  const stick = (f) => 0.5 + 4 * (f - 0.5) ** 3;

  function showWork(i) {
    const p = projects[i];
    witems.forEach((b, j) => b.classList.toggle("on", j === i));
    $("#wcount").textContent = `${pad2(i + 1)} / ${pad2(projects.length)}`;
    $("#wvis").innerHTML = visual(p);
    $("#wvis").classList.toggle("drawn", !p.image);
    wdetail.innerHTML = `
      <p class="wd-kind">${esc(p.kind)} · ${esc(p.status)}</p>
      <p class="wd-text">${esc(pitches[p.id] || p.short)}</p>
      <p class="step-metric"><strong>${esc(p.metric.value)}</strong><span>${esc(p.metric.label)}</span></p>
      <button class="btn" type="button" data-id="${p.id}">View case study <span aria-hidden="true">↗</span></button>`;
  }
  let shownTab = -1;
  function showRecord(i) {
    const { tab, k } = FRAMES[i], part = REC[tab];
    rtabs.forEach((b, j) => b.classList.toggle("on", j === tab));
    $("#rcount").textContent = `${pad2(i + 1)} / ${pad2(FRAMES.length)}`;
    if (tab !== shownTab) {
      shownTab = tab;
      rrows.className = `rrows ${part.cls}`;
      rrows.innerHTML = part.html();
      scene.setRecord(tab);
    }
    if (part.mark) part.mark(rrows, k);
    const [big, small] = part.cap(k);
    $("#rcap").innerHTML = `<p class="step-metric"><strong>${esc(big)}</strong><span>${esc(small)}</span></p>`;
  }

  function update() {
    const y = scrollY;
    const docH = document.documentElement.scrollHeight - vh;
    bar.style.transform = `scaleX(${docH > 0 ? clamp(y / docH, 0, 1) : 0})`;

    // Opening, then "what I do".
    const st = stage.getBoundingClientRect();
    const p = clamp(-st.top / (stage.offsetHeight - vh), 0, 1);
    // The opening, in three parts: the photo breaks up, the figure made of points holds, then it lets go.
    const hp = clamp(p / HERO, 0, 1);
    const photoAmt = 1 - smooth(clamp((hp - 0.05) / 0.33, 0, 1));
    const heroAmt = 1 - smooth(clamp((hp - 0.58) / 0.42, 0, 1));
    const gone = clamp((hp - 0.3) / 0.5, 0, 1);
    hero.style.opacity = String(1 - gone);
    hero.style.transform = `translate3d(0, ${-gone * 60}px, 0)`;
    hero.style.pointerEvents = gone > 0.5 ? "none" : "";
    let c = 0, step = -1, sway = 0, dim = 1, side = 1, scale = 1, ask = 0, wide = 0, tour = 0, face = 0, floor = 0;
    if (p > HERO) {
      const u = ((p - HERO) / (1 - HERO)) * n;
      const i = Math.min(Math.floor(u), n - 1), f = u - i;
      c = i + (i < n - 1 ? hand(f) : 0);
      // Each shape finishes what it does before it hands over to the next one.
      tour = i + clamp(f / (i < n - 1 ? 0.55 : 0.8), 0, 1);
      step = f > 0.9 && i < n - 1 ? -1 : i;
      sway = swing(f);
      // The object swaps sides from one step to the next, and the text swaps with it.
      const here = i % 2 ? -1 : 1;
      side = i < n - 1 ? here - 2 * here * hand(f) : here;
    }

    // The band and the numbers: the cloud loosens and dims.
    const out = clamp((vh - st.bottom) / (vh * 0.7), 0, 1);
    if (out > 0) { c = 2; tour = n; dim = 1 - (innerWidth <= 720 ? 0.92 : 0.72) * smooth(out); sway = 0; side = 1 - smooth(out); scale = 1 + 0.3 * smooth(out); }

    // How I think: the points spell the first phrase as the window arrives, fly apart, and settle as the second.
    const tv = pinned(thinkEl);
    const tIn = clamp((vh * 0.9 - tv.top) / (vh * 0.7), 0, 1);
    if (tIn > 0) {
      const turn = smooth(clamp((tv.p - 0.14) / 0.6, 0, 1));
      c = 2; dim = 1; sway = 0; side = 0; scale = 1;
      wide = smooth(tIn);
      ask = tIn < 1 ? smooth(tIn) : 1 + turn;
      $("#think-bar").style.transform = `scaleX(${turn})`;
      thinkA.classList.toggle("on", turn < 0.5);
      thinkB.classList.toggle("on", turn >= 0.5);
    }

    // Work: the second phrase comes apart and grows into the project tree.
    const w = pinned(work);
    const wIn = clamp((vh * 0.85 - w.top) / (vh * 0.7), 0, 1);
    if (wIn > 0) {
      c = 2 + smooth(wIn);
      dim = Math.max(dim, 0.28 + 0.72 * smooth(wIn));
      side = smooth(wIn);
      scale += (0.95 - scale) * smooth(wIn);
      // On a phone the tree is drawn a little smaller, so its trunk stops clear of the first project name.
      if (innerWidth <= 720) scale *= 1 - 0.15 * smooth(wIn);
      wide *= 1 - smooth(wIn);
      $("#wbar").style.transform = `scaleX(${w.p})`;
      const u = w.p * projects.length, i = Math.min(Math.floor(u), projects.length - 1), f = u - i;
      scene.setTurn(i + (i < projects.length - 1 ? glide(f) : 0));
      sway = swing(f) * 0.5;
      if (i !== lastW) { showWork(i); lastW = i; }
    }

    // Track record: climb the ladder, light the cap, show the awards, go down the skills stack.
    const rv = pinned(storyEl);
    const sIn = clamp((vh * 0.85 - rv.top) / (vh * 0.7), 0, 1);
    if (sIn > 0) {
      c = 3 + smooth(sIn);
      dim = 1;
      let i = FRAMES.findIndex((fr) => rv.p < fr.end);
      if (i < 0) i = FRAMES.length - 1;
      const fr = FRAMES[i], f = clamp((rv.p - fr.at) / (fr.end - fr.at), 0, 1);
      // The ladder is narrow; the wider forms sit further out so they stay clear of the text.
      // Eased in with the window, so the shape crosses over steadily and does not jump sides.
      side += ((fr.tab === 0 ? -1 : -1.2) - side) * smooth(sIn);
      scale += ((fr.tab === 0 ? 1.05 : 0.95) - scale) * smooth(sIn);
      if (fr.tab === 0) scene.setGrow(clamp((fr.k + 0.25 + 0.75 * f) / jobs.length, 0, 1));
      // The cap's base is everything before the last qualification; its board is the last one.
      else if (fr.tab === 1) scene.setGrow(fr.k === school.length - 1 ? 0.84 + 0.16 * f : (0.78 * (fr.k + 0.4 + 0.6 * f)) / Math.max(school.length - 1, 1));
      else scene.setGrow(1);
      if (fr.tab === 3) scene.setLayer(fr.k + stick(f) - 0.5);
      sway = fr.tab === 3 ? 0 : swing(f) * 0.4;
      $("#rbar").style.transform = `scaleX(${rv.p})`;
      if (i !== lastS) { showRecord(i); lastS = i; }
    }

    const contactTop = contact.getBoundingClientRect().top;
    const g = clamp((vh * 0.6 - contactTop) / (vh * 0.5), 0, 1);
    // Contact: the agents come back huge, half off the screen, and dim behind the words.
    if (g > 0) {
      const sg = smooth(g), phone = innerWidth <= 720;
      c = 4 + sg; sway = 0;
      if (scene.hasPortrait && scene.hasPortrait()) {
        // As the contact window arrives the cloud fades out where it is, so nothing crosses the headline.
        // Once it cannot be seen it moves across, and over the last stretch of the page the points gather into
        // the portrait again: beside the words on a wide screen, under them on a phone, where it stands on
        // the footer's top edge.
        const fade = smooth(clamp((vh * 0.8 - contactTop) / (vh * 0.45), 0, 1));
        face = smooth(clamp(1 - (docH - y) / (vh * 0.3), 0, 1));
        dim = Math.max(1 - fade, face);
        if (fade >= 1) { side = 1; scale = 1; }
        floor = phone ? contact.getBoundingClientRect().bottom - footerEl.getBoundingClientRect().top : 0;
      } else {
        // No photo: the agents come back large and faint, off to the side.
        side = 1 + 0.2 * sg; scale = 0.92 + 0.85 * sg; dim = 1 - 0.76 * sg;
      }
    }
    const contactBottom = contact.getBoundingClientRect().bottom;
    setOpen(frames[0], openOf(st.top, st.bottom));
    setOpen(frames[1], openOf(tv.top, tv.bottom));
    setOpen(frames[2], openOf(w.top, w.bottom));
    setOpen(frames[3], openOf(rv.top, rv.bottom));
    setOpen(frames[4], openOf(contactTop, Math.max(contactBottom, vh)));

    // The menu marks the section that is in the middle of the screen.
    const ar = aboutEl.getBoundingClientRect(), mid = vh * 0.5;
    const here = ar.top < mid && ar.bottom > mid ? 0 : w.top < mid && w.bottom > mid ? 1 : rv.top < mid && rv.bottom > mid ? 2 : -1;
    if (here !== lastNav) {
      navLinks.forEach((a, i) => a.classList.toggle("current", i === here));
      navWrap.classList.toggle("has-current", here >= 0);
      lastNav = here;
    }
    scene.setView(c, heroAmt, photoAmt);
    scene.setAsk(ask);
    scene.setWide(wide);
    scene.setTour(tour);
    scene.setFace(face, floor);
    scene.setSway(sway);
    scene.setDim(dim);
    // In a narrower window the 3D is drawn smaller, so it stays clear of the text.
    scene.setPose(side, scale * (innerWidth < 1100 && innerWidth > 720 ? 0.8 : 1));

    if (step !== lastStep) {
      steps.forEach((el, i) => el.classList.toggle("active", i === step));
      ticks.forEach((el, i) => el.classList.toggle("on", i === step));
      if (step >= 0) $("#steps").classList.toggle("flip", step % 2 === 1);
      // The corner details of the tour: counter, index and what the 3D is showing.
      const pin = $(".stage-pin");
      if (step >= 0) {
        pin.classList.add("touring");
        $("#tcount").textContent = `${pad2(step + 1)} / ${pad2(n)}`;
        $("#tshown").textContent = services[step].shown || "";
        $$("#tindex button").forEach((b, i) => b.classList.toggle("on", i === step));
      } else if (p <= HERO) {
        pin.classList.remove("touring");
      }
      lastStep = step;
    }
    progressEl.classList.toggle("show", p > HERO && st.bottom > vh * 0.7);

    // Statement: words settle in one by one.
    const sr = statement.getBoundingClientRect();
    const on = Math.round(clamp((vh * 0.86 - sr.top) / (sr.height + vh * 0.25), 0, 1) * words.length);
    if (on !== lastOn) {
      words.forEach((el, i) => el.classList.toggle("on", i < on));
      lastOn = on;
    }

    // Nav hides on the way down and returns on the way up.
    if (Math.abs(y - lastY) > 6) {
      nav.classList.toggle("hide", y > lastY && y > 200);
      lastY = y;
    }
  }

  // Clicking a project name scrolls to it; the button under it opens the case study.
  witems.forEach((b, i) => b.addEventListener("click", () => scrollToEl(topOf(work) + ((i + 0.3) / projects.length) * (work.offsetHeight - vh))));
  document.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-id]");
    if (b) openCase(b.dataset.id);
  });

  showWork(0);
  showRecord(0);
  rtabs.forEach((b, tab) => b.addEventListener("click", () => {
    const fr = FRAMES.find((x) => x.tab === tab);
    scrollToEl(topOf(storyEl) + (fr.at + (fr.end - fr.at) * 0.3) * (storyEl.offsetHeight - vh));
  }));
  window.addEventListener("scroll", update, { passive: true });
  onScrollFrame = update;
  window.addEventListener("resize", () => { vh = innerHeight; update(); });
  update();
  return { stopY, jumpY: (name) => topOf(name === "work" ? work : storyEl) + 4 };
}

// ---------- The brand line: two rows that slide past each other as the page scrolls ----------
function setupMarquee() {
  const band = $("#band"), a = $("#band-a"), b = $("#band-b");
  let drift = 0, lastT = performance.now(), wa = 1, wb = 1;
  const measure = () => { wa = a.scrollWidth / 6 || 1; wb = b.scrollWidth / 6 || 1; };
  const wrap = (x, w) => ((x % w) + w) % w;
  measure();
  window.addEventListener("resize", measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  const loop = (t) => {
    const dt = Math.min((t - lastT) / 1000, 0.1);
    lastT = t;
    const r = band.getBoundingClientRect();
    if (r.bottom > -100 && r.top < innerHeight + 100) {
      // The scroll carries the rows; a slow drift keeps them alive when the page is still.
      if (!reduceMotion) drift += dt * 16;
      const travel = (innerHeight - r.top) * 0.6 + drift;
      a.style.transform = `translate3d(${-wrap(travel, wa)}px, 0, 0)`;
      b.style.transform = `translate3d(${wrap(travel, wb) - wb}px, 0, 0)`;
      // The first row turns from outline to solid as the band comes up the screen.
      band.style.setProperty("--fill", clamp((innerHeight * 0.92 - r.top) / (innerHeight * 0.55), 0, 1).toFixed(3));
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

// ---------- Reveal on scroll and counters ----------
function setupReveal() {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        io.unobserve(en.target);
        const num = en.target.querySelector?.("[data-count]");
        if (num) countUp(num);
      }),
    { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
  );
  $$("[data-reveal], [data-lines]").forEach((el) => {
    if (el.matches("li")) el.style.transitionDelay = `${[...el.parentNode.children].indexOf(el) * 70}ms`;
    io.observe(el);
  });
}
function countUp(el) {
  const to = +el.dataset.count, pre = el.dataset.prefix, suf = el.dataset.suffix;
  if (reduceMotion) return;
  const t0 = performance.now(), dur = 1500;
  const step = (t) => {
    const f = clamp((t - t0) / dur, 0, 1);
    el.textContent = `${pre}${Math.round(to * (1 - Math.pow(1 - f, 3)))}${suf}`;
    if (f < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ---------- Pointer: a dot that follows, and buttons that lean toward it ----------
function setupPointer() {
  if (!finePointer || reduceMotion) return;

  const dot = $("#cursor");
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, seen = false;
  window.addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; if (!seen) { x = tx; y = ty; seen = true; } }, { passive: true });
  const loop = () => {
    x += (tx - x) * 0.3; y += (ty - y) * 0.3;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    const hit = seen ? document.elementFromPoint(tx, ty) : null;
    dot.classList.toggle("grow", !!hit?.closest?.("a, button"));
    // On the opening screen, away from the links, the cursor says what pressing does.
    dot.classList.toggle("hint", !!hit?.closest?.("#stage") && !hit.closest("a, button") && scrollY < innerHeight * 0.2);
    requestAnimationFrame(loop);
  };
  loop();

  // Project cards tilt in 3D toward the pointer.
  $$(".card button").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `rotateY(${nx * 7}deg) rotateX(${-ny * 6}deg) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });

  $$("[data-magnetic]").forEach((m) => {
    m.addEventListener("mousemove", (e) => {
      const r = m.getBoundingClientRect();
      m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    });
    m.addEventListener("mouseleave", () => { m.style.transform = ""; });
  });
}

// ---------- Local time ----------
function setupClock() {
  let fmt;
  try {
    fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: site.timezone });
  } catch {
    return;
  }
  const tick = () => $$("[data-clock]").forEach((el) => (el.textContent = fmt.format(new Date())));
  tick();
  setInterval(tick, 15000);
}

// ---------- Case study sheet ----------
function openSheet(el) {
  el._lastFocus = document.activeElement;
  el.hidden = false;
  lockScroll(true);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("open")));
  setTimeout(() => $(".sheet-panel", el).focus({ preventScroll: true }), 50);
}
function closeSheet(el) {
  if (el.hidden) return;
  el.classList.remove("open");
  lockScroll(false);
  setTimeout(() => { el.hidden = true; }, 750);
  el._lastFocus?.focus?.({ preventScroll: true });
}
function openCase(id) {
  const i = projects.findIndex((p) => p.id === id);
  if (i < 0) return;
  const p = projects[i];
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  const body = $("#case-body");
  body.innerHTML = `
    <p class="case-status">${pad2(i + 1)} / ${pad2(projects.length)} · ${esc(p.kind)} · ${esc(p.status)}</p>
    <h2 class="case-title" id="case-title">${esc(p.title)}</h2>
    <p class="case-short">${esc(p.short)}</p>
    <div class="case-flow"><h3>How it works</h3><div class="case-visual">${visual(p)}</div></div>
    <div class="case-grid">
      <div>
        <h3>Overview</h3>
        <p class="case-summary">${esc(p.summary)}</p>
        <h3>What I built</h3>
        <ol class="case-built">${p.built.map((b) => `<li>${esc(b)}</li>`).join("")}</ol>
      </div>
      <div class="case-side">
        <div class="case-metric"><strong>${esc(p.metric.value)}</strong><span>${esc(p.metric.label)}</span></div>
        <div>
          <h3>Details</h3>
          <dl class="case-meta">
            <dt>Role</dt><dd>${esc(p.role)}</dd>
            <dt>Status</dt><dd>${esc(p.status)}</dd>
            ${p.link ? `<dt>Link</dt><dd><a href="${esc(p.link.url)}" target="_blank" rel="noopener">${esc(p.link.label)} ↗</a></dd>` : ""}
          </dl>
        </div>
        <div><h3>Stack</h3><p class="case-stack">${esc(p.stack.join(", "))}</p></div>
      </div>
    </div>
    <div class="case-nav">
      <button class="btn btn-ghost" type="button" data-go="${prev.id}">← ${esc(prev.title)}</button>
      <button class="btn btn-ghost" type="button" data-go="${next.id}">${esc(next.title)} →</button>
    </div>`;
  $$("[data-go]", body).forEach((b) =>
    b.addEventListener("click", () => {
      openCase(b.dataset.go);
      $("#case .sheet-panel").scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    })
  );
  const sheet = $("#case");
  if (sheet.hidden) openSheet(sheet);
}

// ---------- Links ----------
function setupLinks() {
  const sheet = $("#case");
  sheet.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeSheet(sheet); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(sheet); });
  $("#copy-email").addEventListener("click", async (e) => {
    const b = e.currentTarget;
    try {
      await navigator.clipboard.writeText(site.email);
      b.textContent = "Copied";
    } catch {
      b.textContent = site.email;
    }
    setTimeout(() => (b.textContent = "Copy email"), 2000);
  });
  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const target = id === "top" ? 0 : document.getElementById(id);
      if (target === null) return;
      e.preventDefault();
      scrollToEl(target);
    })
  );
}

// ---------- Go ----------
async function boot() {
  renderContent();
  setupClock();

  let markReady;
  const ready = new Promise((r) => (markReady = r));
  const loaderDone = runLoader(ready);
  setTimeout(markReady, 4000); // never wait on a slow network for more than this

  startLenis();
  const scene = await startScene();
  // One frame loop for both: the scroll moves first, then the 3D is drawn from that same position.
  if (scene.setBeforeFrame) {
    lenisOwnLoop = false;
    scene.setBeforeFrame((t) => { if (lenis) lenis.raf(t); });
  }
  // The photo is drawn by the points themselves, and so are the two phrases (once their font has arrived).
  if (scene.setPortrait) scene.setPortrait(site.portrait);
  const face = document.fonts && document.fonts.load ? document.fonts.load("500 200px Geist").catch(() => {}) : Promise.resolve();
  face.then(() => scene.setWords(site.think.from, site.think.to));
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.all([fonts, new Promise((res) => scene.whenFirstFrame(res))]).then(markReady);

  const tour = setupScroll(scene);
  setupMarquee();
  setupReveal();
  setupPointer();
  setupLinks();
  // Links that jump to a step of the story.
  $$("[data-stop], [data-jump]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToEl(a.dataset.jump ? tour.jumpY(a.dataset.jump) : tour.stopY(+a.dataset.stop));
    })
  );
  $("#top").addEventListener("pointerdown", (e) => { if (!e.target.closest("a, button")) scene.burst(); });

  const term = createTerminal({
    els: { root: $("#term"), out: $("#term-out"), form: $("#term-form"), input: $("#term-input"), close: $("#term-close") },
    openCase,
    onClose: () => lockScroll(false),
  });
  const openTerm = () => { lockScroll(true); term.open(); };
  $("#open-terminal").addEventListener("click", openTerm);
  document.addEventListener("keydown", (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((e.key === "/" || e.key === "`") && !typing && !term.isOpen) { e.preventDefault(); openTerm(); }
  });

  await loaderDone;
  await new Promise((r) => setTimeout(r, 200));
  $("#loader").classList.add("done");
  document.body.classList.remove("is-loading");
  setTimeout(() => { document.body.classList.add("ready"); scene.start(); }, 300);
  setTimeout(() => $("#loader").remove(), 1400);
}

boot();
