// TASK-003 evidence harness (Fern, 2026-10-05) — throwaway, NOT product code. Reads only.
// Runs the gate CLI (--json) for one desk, fetches /p/<desk> from a running console, and
// compares what the page shows against the JSON, cell by cell, in order.
// Usage: node task-003-compare.mjs <baseUrl> <workspacePath> <project>
import { execFileSync } from "node:child_process";
import path from "node:path";

const [base, ws, project] = process.argv.slice(2);
let out;
try {
  out = execFileSync(process.execPath, [path.join(ws, "check-hygiene.mjs"), project, "--json"], { cwd: ws }).toString();
} catch (e) {
  out = e.stdout.toString(); // exit 1 = FAIL, stdout is still the answer
}
const j = JSON.parse(out);
const html = await (await fetch(`${base}/p/${encodeURIComponent(project)}`)).text();

const decode = (s) =>
  s.replace(/<!-- -->/g, "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'");
// antd tables: header cells <th>, body cells <td>; take every <tbody> in order (File health, then Ball).
const bodies = [...html.matchAll(/<tbody[^>]*>([\s\S]*?)<\/tbody>/g)].map((m) => m[1]);
const rowsOf = (b) =>
  [...b.matchAll(/<tr[^>]*data-row-key[^>]*>([\s\S]*?)<\/tr>/g)].map((r) => [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => decode(c[1])));
const heads = [...html.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((m) => decode(m[1]));

const fmt = (n) => `${(n / 1024).toFixed(1)}KB`;
const expFiles = j.files.map((f) => [
  f.name,
  f.exists === false ? "not found" : fmt(f.bytes),
  f.exempt !== undefined ? `exempt — ${f.exempt}` : f.limitBytes === null ? "—" : fmt(f.limitBytes),
  f.name === "RESUME-HERE.md" ? (j.resumeBehindDays === null ? "—" : String(j.resumeBehindDays)) : "",
]);
const expBall = j.boardRows.map((r) => [r.id, r.title ?? "—", r.status ?? "—", r.ball ?? "—"]);

const fileRows = bodies[0] ? rowsOf(bodies[0]) : [];
const ballRows = j.boardRows.length && bodies[1] ? rowsOf(bodies[1]) : [];
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const firstDiff = (a, b) => { for (let i = 0; i < Math.max(a.length, b.length); i++) if (!same(a[i], b[i])) return { i, page: a[i], cli: b[i] }; return null; };

// Gate lines: text of each GateLine div after the "Gate" heading, before "File health".
const gateBlock = html.split(">Gate</h4>")[1]?.split(">File health</h4>")[0] ?? "";
const pageText = decode(html);

console.log(JSON.stringify({
  project,
  cli: { result: j.result, checks: j.checks.length, files: j.files.length, resumeBehindDays: j.resumeBehindDays, boardRows: j.boardRows.length, nullBall: j.boardRows.filter((r) => r.ball === null).length },
  page: {
    heading: decode(html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1] ?? ""),
    headers: heads,
    gateLinesInOrder: j.checks.every((c, i) => gateBlock.includes(`>${c.severity.toUpperCase()}</span>`)) &&
      (() => { let at = 0; for (const c of j.checks) { const k = decode(gateBlock).indexOf(c.severity.toUpperCase() + c.text, at); if (k < 0) return false; at = k + 1; } return true; })(),
    noGateLinesText: pageText.includes("No lines from the gate."),
    noBoardRowsText: pageText.includes("No board rows."),
    fileRows: fileRows.length, fileRowsMatch: same(fileRows, expFiles), fileDiff: firstDiff(fileRows, expFiles),
    ballRows: ballRows.length, ballDashCells: ballRows.filter((r) => r[3] === "—").length, ballRowsMatch: same(ballRows, expBall), ballDiff: firstDiff(ballRows, expBall),
    refreshHint: (pageText.match(/Updated \d\d:\d\d:\d\d · refreshes every 60 s/) ?? [null])[0],
  },
}, null, 1));
