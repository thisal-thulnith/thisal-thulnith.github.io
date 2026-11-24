// A small terminal for people who like poking around. Press "/" anywhere.

import { site, projects, skills, awards, experience, education } from "./content.js";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export function createTerminal({ els, openCase, onClose }) {
  const past = [];
  let hIdx = -1;
  let welcomed = false;
  let lastFocus = null;

  function print(html, cls) {
    const d = document.createElement("div");
    if (cls) d.className = cls;
    d.innerHTML = html;
    els.out.appendChild(d);
    els.out.scrollTop = els.out.scrollHeight;
    return d;
  }
  const dim = (s) => `<span class="dim">${s}</span>`;
  const hi = (s) => `<span class="hi">${s}</span>`;
  const pad = (s, n) => s + " ".repeat(Math.max(1, n - s.length));

  const commands = {
    help() {
      print(
        [
          "Commands:",
          `  ${pad("whoami", 18)}${dim("who I am")}`,
          `  ${pad("projects", 18)}${dim("list my work (also: ls)")}`,
          `  ${pad("open <project>", 18)}${dim("open a case study, e.g. open zorum")}`,
          `  ${pad("stack", 18)}${dim("tools I use")}`,
          `  ${pad("experience", 18)}${dim("where I've worked and studied")}`,
          `  ${pad("awards", 18)}${dim("competitions")}`,
          `  ${pad("contact", 18)}${dim("how to reach me")}`,
          `  ${pad("neofetch", 18)}${dim("the summary, terminal style")}`,
          `  ${pad("clear", 18)}${dim("clear the screen")}`,
          `  ${pad("exit", 18)}${dim("close (or press Esc)")}`,
        ].join("\n")
      );
    },
    whoami() {
      print(`${esc(site.name)} — ${esc(site.role)}, ${esc(site.location)}.\n${esc(site.tagline.replace(/\*/g, ""))} ${esc(site.intro)}`);
    },
    projects() {
      print(
        projects
          .map((p) => `  ${hi(pad(p.id, 14))}${esc(pad(p.title, 30))}${dim(esc(p.status))}`)
          .join("\n") + `\n\n${dim("Type")} open &lt;id&gt; ${dim("to read one.")}`
      );
    },
    ls() { commands.projects(); },
    open(arg) {
      const id = (arg || "").trim().toLowerCase();
      const p = projects.find((x) => x.id === id || x.title.toLowerCase() === id || x.title.toLowerCase().startsWith(id));
      if (!id || !p) return print(`open: which one? ${dim("Try:")} ${projects.map((x) => x.id).join(", ")}`);
      print(`Opening ${esc(p.title)}…`, "dim");
      close();
      setTimeout(() => openCase(p.id), 120);
    },
    stack() {
      print(skills.map((s) => `  ${hi(pad(s.group, 20))}${esc(s.items.join(", "))}`).join("\n"));
    },
    experience() {
      print(
        experience.map((e) => `  ${esc(e.period)}  ${esc(e.role)}, ${esc(e.org)}`).concat(
          education.map((e) => `  ${esc(e.period)}  ${esc(e.title)}, ${esc(e.org)}${e.state ? ` (${esc(e.state)})` : ""}`)
        ).join("\n")
      );
    },
    awards() {
      print(awards.map((a) => `  ${hi(pad(a.place, 9))}${esc(a.title)}`).join("\n"));
    },
    contact() {
      print(
        [
          `  ${pad("email", 10)}<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>`,
          `  ${pad("linkedin", 10)}<a href="${esc(site.links.linkedin)}" target="_blank" rel="noopener">${esc(site.links.linkedin.replace("https://www.", ""))}</a>`,
          `  ${pad("github", 10)}<a href="${esc(site.links.github)}" target="_blank" rel="noopener">${esc(site.links.github.replace("https://", ""))}</a>`,
        ].join("\n")
      );
    },
    neofetch() {
      const live = projects.filter((p) => /live|production/i.test(p.status)).map((p) => p.title).join(" · ");
      const art = [
        "                 ",
        "  T H I S A L    ",
        "  T H U L N I T H",
        "                 ",
        "                 ",
        "                 ",
        "                 ",
        "                 ",
      ];
      const info = [
        `${hi("thisal")}@portfolio`,
        dim("────────────────────"),
        `${pad("role", 10)}${esc(site.role)}`,
        `${pad("focus", 10)}${esc(site.focus)}`,
        `${pad("based", 10)}${esc(site.location)}`,
        `${pad("stack", 10)}Python · LangGraph · FastAPI · PyTorch`,
        `${pad("live", 10)}${esc(live)}`,
        `${pad("status", 10)}${esc(site.status)}`,
      ];
      print(art.map((a, i) => `${a}   ${info[i] || ""}`).join("\n"));
    },
    clear() { els.out.innerHTML = ""; },
    exit() { close(); },
    sudo(arg) {
      if (/hire/i.test(arg || "")) {
        print(`Permission granted. ${hi("Good choice.")}\nWrite to <a href="mailto:${esc(site.email)}?subject=Let's%20work%20together">${esc(site.email)}</a>`);
      } else print("Nice try. This incident will be reported.");
    },
    echo(arg) { print(esc(arg || "")); },
    date() { print(new Date().toString()); },
    rm() { print("Let's not."); },
    hello() { print(`Hello. I'm ${esc(site.first)}, an ${esc(site.role)}. Type ${hi("help")} to look around.`); },
    hi() { commands.hello(); },
  };
  commands.cv = commands.experience;
  commands.about = commands.whoami;

  async function run(raw) {
    const line = raw.trim();
    print(esc(line), "cmd");
    if (!line) return;
    past.unshift(line);
    hIdx = -1;
    const [cmd, ...rest] = line.split(/\s+/);
    const fn = commands[cmd.toLowerCase()];
    if (fn) await fn(rest.join(" "));
    else print(`command not found: ${esc(cmd)}. ${dim("Type")} help ${dim("to see what works.")}`);
  }

  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = els.input.value;
    els.input.value = "";
    run(v);
  });
  els.input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (hIdx < past.length - 1) els.input.value = past[++hIdx];
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      hIdx = Math.max(-1, hIdx - 1);
      els.input.value = hIdx === -1 ? "" : past[hIdx];
    } else if (e.key === "Tab") {
      e.preventDefault();
      const v = els.input.value;
      const parts = v.split(" ");
      const pool = parts.length > 1 && parts[0] === "open" ? projects.map((p) => p.id) : Object.keys(commands);
      const m = pool.filter((c) => c.startsWith(parts[parts.length - 1]));
      if (m.length === 1) { parts[parts.length - 1] = m[0]; els.input.value = parts.join(" ") + (parts.length === 1 ? " " : ""); }
      else if (m.length > 1) print(m.join("  "), "dim");
    } else if (e.key === "Escape") {
      close();
    }
  });
  els.root.addEventListener("mousedown", (e) => { if (e.target === els.root) close(); });
  els.close.addEventListener("click", close);
  els.root.addEventListener("click", (e) => {
    if (e.target.closest(".term-out") && !window.getSelection().toString()) els.input.focus();
  });

  function open() {
    lastFocus = document.activeElement;
    els.root.hidden = false;
    if (!welcomed) {
      welcomed = true;
      print(`${hi("thisal.os")} ${dim("— type")} help ${dim("to start, or")} neofetch ${dim("for the summary.")}`);
    }
    setTimeout(() => els.input.focus(), 30);
  }
  function close() {
    if (els.root.hidden) return;
    els.root.hidden = true;
    onClose && onClose();
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  return { open, close, get isOpen() { return !els.root.hidden; } };
}
