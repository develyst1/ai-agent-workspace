// TASK-001 evidence harness (Fern, 2026-10-05) — throwaway, NOT product code.
// Imports the real src/lib/gate.ts from harness-console-front and calls listProjects/runGate
// against (a) the real workspace and (b) fixture workspaces built in the OS temp folder.
// Writes nothing in the workspace: fixtures live under os.tmpdir() and are removed at the end.
//
// Usage (absolute paths come from machine.local.md, never from this file):
//   FRONT=<harness-console-front path> WS=<ai-agent-workspace path> node task-001-runner.mjs
import { register } from "node:module";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const FRONT = process.env.FRONT;
const WS = process.env.WS;
if (!FRONT || !WS) throw new Error("set FRONT and WS");

// Resolve "@/x" → FRONT/src/x.ts(x) and stub "server-only" (a Next.js build-time guard).
const srcUrl = pathToFileURL(path.join(FRONT, "src") + path.sep).href;
const hooks = `
export async function resolve(spec, ctx, next) {
  if (spec === "server-only") return { url: "data:text/javascript,", shortCircuit: true };
  if (spec.startsWith("@/")) return next(${JSON.stringify(srcUrl)} + spec.slice(2) + ".ts", ctx);
  return next(spec, ctx);
}`;
register("data:text/javascript," + encodeURIComponent(hooks));

const gate = await import(pathToFileURL(path.join(FRONT, "src", "lib", "gate.ts")).href);
const show = (label, v) =>
  console.log(`--- ${label}\n` + JSON.stringify(v, (k, x) => (k === "data" ? { project: x.project, result: x.result, checks: x.checks.length } : x)));

// (a) real workspace — read-only gate runs
process.env.HARNESS_WORKSPACE_PATH = WS;
const list = await gate.listProjects();
show("listProjects() [real]", list);
show("runGate(harness-console) [real]", await gate.runGate("harness-console"));
show("runGate(smart-scheduler) [real]", await gate.runGate("smart-scheduler"));
show("runGate(no-such-project) [real]", await gate.runGate("no-such-project"));

// (b) fixture workspaces in OS temp: one fake check-hygiene.mjs per error kind
const tmp = mkdtempSync(path.join(os.tmpdir(), "hc-task001-"));
const make = (name, body) => {
  const dir = mkdtempSync(path.join(tmp, name + "-"));
  writeFileSync(path.join(dir, "check-hygiene.mjs"), body);
  return dir;
};
try {
  const cases = [
    ["timeout", make("timeout", "setTimeout(() => {}, 30000);")],
    ["not-json", make("notjson", "console.log('RESULT: PASS');")],
    ["schema", make("schema", "console.log(JSON.stringify({ schema: 2, ok: true }));")],
  ];
  for (const [label, dir] of cases) {
    process.env.HARNESS_WORKSPACE_PATH = dir;
    const t0 = Date.now();
    const r = await gate.runGate("x");
    show(`runGate [fixture ${label}] (${((Date.now() - t0) / 1000).toFixed(1)} s)`, r);
  }
  // spawn: valid fixture workspace, but the node binary path cannot be started
  process.env.HARNESS_WORKSPACE_PATH = cases[1][1];
  const realExec = process.execPath;
  process.execPath = path.join(tmp, "no-such-node.exe");
  show("runGate [fixture spawn]", await gate.runGate("x"));
  process.execPath = realExec;
  // reasonOf for each kind (SPEC-001 §1.4)
  for (const e of [
    { kind: "gate", code: "NO_AI_WORKER", message: "msg" },
    { kind: "timeout" },
    { kind: "not-json" },
    { kind: "schema", schema: 2 },
    { kind: "spawn", message: "m" },
  ])
    console.log(`reasonOf(${e.kind}) = ${gate.reasonOf(e)}`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
