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
