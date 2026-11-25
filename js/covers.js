// The diagram shown beside the work list: a thin-line drawing of how a project works,
// built from the project's own `flow` steps in content.js, with its key number underneath.

const ON = "#EDEBE6";
const MUTED = "#8D8D92";
const LINE = "#27272B";
const ACCENT = "#FF4F1A";
const FONT = "Geist, system-ui, sans-serif";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export function diagram(p) {
  const steps = p.flow;
  const x = 52, top = 118, bottom = 338;
  const gap = steps.length > 1 ? (bottom - top) / (steps.length - 1) : 0;
  const nodes = steps
    .map((label, i) => {
      const y = top + i * gap;
      const hot = i === 1;
      return `<circle cx="${x}" cy="${y}" r="5" fill="${hot ? ACCENT : "#0B0B0C"}" stroke="${hot ? ACCENT : ON}" stroke-width="1.2"/>
        <text x="${x + 22}" y="${y + 4.5}" font-size="14.5" fill="${hot ? ON : "#C4C2BC"}">${esc(label)}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid meet" font-family="${FONT}" aria-hidden="true">
    <text x="28" y="40" font-size="12.5" fill="${MUTED}">${esc(p.kind)}</text>
    <text x="372" y="40" font-size="12.5" fill="${MUTED}" text-anchor="end">${esc(p.status)}</text>
    <line x1="28" y1="58" x2="372" y2="58" stroke="${LINE}"/>
    <line x1="${x}" y1="${top}" x2="${x}" y2="${top + gap * (steps.length - 1)}" stroke="${ON}" stroke-opacity=".35"/>
    <circle r="3" fill="${ACCENT}"><animateMotion dur="${2.4 + steps.length * 0.4}s" repeatCount="indefinite" path="M${x} ${top} V${top + gap * (steps.length - 1)}"/></circle>
    ${nodes}
    <line x1="28" y1="392" x2="372" y2="392" stroke="${LINE}"/>
    <text x="28" y="446" font-size="46" fill="${ON}" letter-spacing="-2">${esc(p.metric.value)}</text>
    <text x="28" y="472" font-size="12.5" fill="${MUTED}">${esc(p.metric.label)}</text>
  </svg>`;
}

// The wide version, used as the "screen" at the top of each project card:
// the steps run left to right with a dot travelling along them.
export function diagramWide(p) {
  const steps = p.flow, n = steps.length;
  const W = 440, H = 210, y = 108, x0 = 34, x1 = W - 34, BG = "#0B0B0C";
  const gap = n > 1 ? (x1 - x0) / (n - 1) : 0;
  const dur = (2.4 + n * 0.6).toFixed(1);
  const nodes = steps
    .map((label, i) => {
      const x = x0 + i * gap, up = i % 2 === 0, f = n > 1 ? i / (n - 1) : 0;
      const first = i === 0, last = n > 1 && i === n - 1;
      // Each stop lights up as the moving dot reaches it, so the drawing reads as one request going through.
      const before = Math.max(f - 0.05, 0), after = Math.min(f + 0.16, 1);
      const keys = first ? [0, after, 1] : last ? [0, before, 1] : [0, before, f, after, 1];
      const vals = first ? [ACCENT, BG, BG] : last ? [BG, BG, ACCENT] : [BG, BG, ACCENT, BG, BG];
      return `<line x1="${x}" y1="${up ? y - 9 : y + 9}" x2="${x}" y2="${up ? y - 26 : y + 26}" stroke="${LINE}"/>
        <circle cx="${x}" cy="${y}" r="5.5" fill="${BG}" stroke="${ON}" stroke-width="1.2"><animate attributeName="fill" dur="${dur}s" repeatCount="indefinite" keyTimes="${keys.join(";")}" values="${vals.join(";")}"/></circle>
        <text x="${first ? x - 6 : last ? x + 6 : x}" y="${up ? y - 34 : y + 44}" text-anchor="${first ? "start" : last ? "end" : "middle"}" font-size="12" fill="#D6D4CE">${esc(label)}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" font-family="${FONT}" aria-hidden="true">
    <line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${ON}" stroke-opacity=".35"/>
    ${nodes}
    <circle r="3.2" fill="${ACCENT}"><animateMotion dur="${dur}s" repeatCount="indefinite" path="M${x0} ${y} H${x1}"/></circle>
  </svg>`;
}

// The first frame of a project's storyboard: a small line drawing of the idea.
// One drawing per project id; a project without one simply shows its sentence.
const ringOf7 = Array.from({ length: 7 }, (_, k) => {
  const a = (k / 7) * Math.PI * 2 - Math.PI / 2;
  return [(100 + Math.cos(a) * 62).toFixed(1), (55 + Math.sin(a) * 38).toFixed(1)];
});
const SKETCH = {
  // One supervisor and its seven analysts.
  stocknetwork: `${ringOf7.map(([x, y]) => `<line x1="100" y1="55" x2="${x}" y2="${y}" stroke-opacity=".3"/>`).join("")}
    ${ringOf7.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5"/>`).join("")}
    <circle cx="100" cy="55" r="9" stroke="${ACCENT}"/><circle cx="100" cy="55" r="2.6" fill="${ACCENT}" stroke="none"/>`,
  // A customer's message, and the agent's answer.
  zorum: `<rect x="20" y="12" width="98" height="36" rx="8"/><path d="M34 48l-9 11 17-11"/>
    <line x1="34" y1="25" x2="96" y2="25" stroke-opacity=".45"/><line x1="34" y1="36" x2="74" y2="36" stroke-opacity=".45"/>
    <g stroke="${ACCENT}"><rect x="82" y="60" width="98" height="36" rx="8"/><path d="M166 96l9 11-17-11"/><path d="M96 78l7 7 13-14"/></g>
    <line x1="128" y1="78" x2="166" y2="78" stroke-opacity=".45"/>`,
  // Sound goes in, text comes out.
  whisper: `${[10, 22, 38, 18, 46, 28, 14, 34, 20, 8].map((h, k) => `<line x1="${20 + k * 8.5}" y1="${55 - h / 2}" x2="${20 + k * 8.5}" y2="${55 + h / 2}"/>`).join("")}
    <path d="M110 55h17m-6-6 6 6-6 6" stroke="${ACCENT}"/>
    <line x1="140" y1="41" x2="184" y2="41"/><line x1="140" y1="55" x2="176" y2="55"/><line x1="140" y1="69" x2="166" y2="69"/>`,
  // A calendar with one slot taken.
  buffsalon: `<rect x="48" y="16" width="104" height="82" rx="6"/><line x1="48" y1="36" x2="152" y2="36"/>
    <line x1="72" y1="9" x2="72" y2="23"/><line x1="128" y1="9" x2="128" y2="23"/>
    ${[0, 1, 2, 3].map((cx) => [0, 1, 2].map((cy) => (cx === 2 && cy === 1
      ? `<rect x="${60 + cx * 21}" y="${45 + cy * 16}" width="15" height="10" rx="2" fill="${ACCENT}" stroke="${ACCENT}"/>`
      : `<rect x="${60 + cx * 21}" y="${45 + cy * 16}" width="15" height="10" rx="2" stroke-opacity=".4"/>`)).join("")).join("")}`,
  // The same agent in a browser and on a phone.
  sales: `<rect x="16" y="18" width="108" height="74" rx="6"/><line x1="16" y1="33" x2="124" y2="33"/>
    <circle cx="26" cy="25.5" r="1.7"/><circle cx="33" cy="25.5" r="1.7"/>
    <rect x="142" y="22" width="42" height="76" rx="8"/><line x1="156" y1="90" x2="170" y2="90"/>
    <g stroke="${ACCENT}"><rect x="62" y="58" width="50" height="20" rx="6"/><rect x="149" y="50" width="28" height="15" rx="5"/></g>
    <line x1="28" y1="48" x2="70" y2="48" stroke-opacity=".4"/><line x1="149" y1="38" x2="168" y2="38" stroke-opacity=".4"/>`,
  // A pile of documents becomes one answer.
  construction: `<rect x="22" y="28" width="58" height="70" rx="3" stroke-opacity=".3"/><rect x="31" y="20" width="58" height="70" rx="3" stroke-opacity=".55"/>
    <rect x="40" y="12" width="58" height="70" rx="3" fill="#08080A"/>
    <line x1="50" y1="28" x2="88" y2="28" stroke-opacity=".45"/><line x1="50" y1="40" x2="88" y2="40" stroke-opacity=".45"/><line x1="50" y1="52" x2="76" y2="52" stroke-opacity=".45"/>
    <path d="M108 55h14m-6-6 6 6-6 6" stroke="${ACCENT}"/>
    <g stroke="${ACCENT}"><rect x="132" y="36" width="52" height="38" rx="8"/><path d="M144 74l-7 10 15-10"/></g>
    <line x1="143" y1="50" x2="173" y2="50" stroke-opacity=".5"/><line x1="143" y1="61" x2="162" y2="61" stroke-opacity=".5"/>`,
};
export function sketch(p) {
  const d = SKETCH[p.id];
  if (!d) return "";
  return `<svg class="sketch" viewBox="0 0 200 110" preserveAspectRatio="xMidYMid meet" fill="none" stroke="${ON}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
}
