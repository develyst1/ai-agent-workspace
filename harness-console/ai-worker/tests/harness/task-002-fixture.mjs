// TASK-002 evidence harness (Fern, 2026-10-05) — throwaway, NOT product code.
// Builds a FIXTURE workspace in the OS temp folder (never in the real workspace): a fake
// check-hygiene.mjs that speaks the gate's --json schema 1 for three fake desks.
//   alpha — PASS / no checks, or FAIL after `fail`   (AC-5: PASS → FAIL with no click)
//   beta  — prints `RESULT: PASS` (not JSON)          (AC-6: one card errors, others render)
//   gamma — PASS, 2 warn lines, newestLogDate null    (< 3 lines, `Last moved: —`)
// Usage:
//   node task-002-fixture.mjs setup          → prints the fixture folder (point HARNESS_WORKSPACE_PATH at it)
//   node task-002-fixture.mjs fail <dir>     → alpha's gate now answers FAIL
//   node task-002-fixture.mjs listfail <dir> → `--list` now answers { ok:false }
//   node task-002-fixture.mjs clean <dir>    → removes the fixture folder
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const FAKE_GATE = `
import { existsSync } from "node:fs";
const here = new URL(".", import.meta.url);
const has = (f) => existsSync(new URL(f, here));
const out = (o) => console.log(JSON.stringify({ schema: 1, gate: "fixture", ...o }));
const args = process.argv.slice(2);
if (args[0] === "--list") {
  if (has("list-fail")) { out({ ok: false, error: { code: "FIXTURE", message: "fixture list failure" } }); process.exit(2); }
  out({ ok: true, projects: ["alpha", "beta", "gamma"] });
} else if (args[0] === "alpha") {
  const fail = has("alpha-fail");
  out({ ok: true, project: "alpha", result: fail ? "FAIL" : "PASS", counts: { fail: fail ? 1 : 0, warn: 0 },
    checks: fail ? [{ severity: "fail", text: "fixture: alpha went FAIL" }] : [],
    files: [], resumeBehindDays: null, newestLogDate: "2026-10-05", boardRows: [] });
  process.exit(fail ? 1 : 0);
} else if (args[0] === "beta") {
  console.log("RESULT: PASS");
} else if (args[0] === "gamma") {
  out({ ok: true, project: "gamma", result: "PASS", counts: { fail: 0, warn: 2 },
    checks: [{ severity: "warn", text: "fixture: gamma warn one" }, { severity: "warn", text: "fixture: gamma warn two" }],
    files: [], resumeBehindDays: null, newestLogDate: null, boardRows: [] });
}
`;

const [cmd, dir] = process.argv.slice(2);
if (cmd === "setup") {
  const d = mkdtempSync(path.join(os.tmpdir(), "hc-task002-"));
  writeFileSync(path.join(d, "check-hygiene.mjs"), FAKE_GATE);
  console.log(d);
} else if (cmd === "fail") writeFileSync(path.join(dir, "alpha-fail"), "");
else if (cmd === "listfail") writeFileSync(path.join(dir, "list-fail"), "");
else if (cmd === "clean") rmSync(dir, { recursive: true, force: true });
else throw new Error("usage: setup | fail <dir> | listfail <dir> | clean <dir>");
