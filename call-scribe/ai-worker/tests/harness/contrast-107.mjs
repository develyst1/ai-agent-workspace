// Contrast ratios (WCAG 2.x) for the text/background pairs of call-scribe-front, computed from the
// oklch values in the front's globals.css (path passed as argv[2]). Throwaway check, no dependencies.
//   node contrast-107.mjs <path to call-scribe-front/src/app/globals.css>
import fs from "node:fs";

const css = fs.readFileSync(process.argv[2], "utf8");
const root = /:root\s*{([^}]*)}/.exec(css)?.[1] ?? "";
const tokens = {};
for (const m of root.matchAll(/--([\w-]+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/g)) {
  tokens[m[1]] = { L: +m[2], C: +m[3], h: +m[4] };
}

function toSrgb({ L, C, h }) {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l_ = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
  return lin.map((v) => Math.min(1, Math.max(0, v))); // linear, clipped to gamut
}
const luminance = (t) => {
  const [r, g, b] = toSrgb(t);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (fg, bg) => {
  const [a, b] = [luminance(tokens[fg]), luminance(tokens[bg])].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
};

// [foreground, background, what, minimum]
const pairs = [
  ["ink", "paper", "body text on the page", 4.5],
  ["ink", "surface", "text in cards, inputs, list rows", 4.5],
  ["ink-soft", "paper", "secondary text on the page (log out, loading line)", 4.5],
  ["ink-soft", "surface", "secondary text in list rows (date)", 4.5],
  ["danger", "paper", "error text on the page", 4.5],
  ["danger", "surface", "error text on a card", 4.5],
  ["accent-ink", "accent", "button label on the accent", 4.5],
  ["accent", "paper", "focus ring against the page (UI boundary)", 3],
  ["control-line", "surface", "input and button border against the field (UI boundary)", 3],
  ["control-line", "paper", "button border against the page (UI boundary)", 3],
  ["disabled-ink", "disabled-bg", "disabled button label (exempt, noted)", 4.5],
];
let fail = 0;
for (const [fg, bg, what, min] of pairs) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok && !what.includes("exempt")) fail++;
  console.log(`${r.toFixed(2).padStart(6)}:1  min ${min}  ${ok ? "ok  " : "LOW "}  ${fg} on ${bg} — ${what}`);
}
console.log(fail ? `RESULT: ${fail} pair(s) below minimum` : "RESULT: all non-exempt pairs at or above minimum");
process.exit(fail ? 1 : 0);
