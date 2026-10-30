// TEST-109 layer 2 — the REAL caw-back API + runner (REQ-113 build), QA's stub (test-108/qa-claude.ts, mode "api"):
// a refused API call is soft (hop goes on, REQ-113 wording) · the runner writes the env-configured ports into the hook (AC-3).
// usage (cwd = caw-back of the build under test): bun --no-env-file run <this file> <test-108 harness dir> <guard-hooks workspace>
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const [harness, hooksWorkspace] = process.argv.slice(2);
const BACK = process.cwd();
const { BP_PROJECT, fakeBlueprint } = await import(join(BACK, "test/helpers/fake-blueprint.ts"));
const PORT = 4551, API = `http://127.0.0.1:${PORT}`;
const note = (c: string, ok: boolean, d: string) => console.log(`${ok ? "OK " : "BAD"} ${c} — ${d}`);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const call = async (method: string, path: string, body?: unknown) => { const r = await fetch(API + path, { method, headers: { "x-caw-actor": "operator", ...(body === undefined ? {} : { "content-type": "application/json" }) }, body: body === undefined ? undefined : JSON.stringify(body) }); const j = await r.json().catch(() => null); if (!r.ok) throw new Error(`${method} ${path}: ${r.status} ${JSON.stringify(j)}`); return j as any; };
const fake = fakeBlueprint();
const RUN_ROOT = mkdtempSync(join(tmpdir(), "qa109-root-"));
mkdirSync(join(RUN_ROOT, ".claude", "skills", "qa"), { recursive: true });
writeFileSync(join(RUN_ROOT, ".claude", "skills", "qa", "SKILL.md"), "TEST-109 stand-in skill.\n");
symlinkSync(join(hooksWorkspace, "scripts"), join(RUN_ROOT, "scripts"));
const work = join(RUN_ROOT, "work"); mkdirSync(work);
const modeFile = join(RUN_ROOT, "mode.txt"); writeFileSync(modeFile, "api");
const stub = join(RUN_ROOT, "qa-claude.sh");
writeFileSync(stub, `#!/bin/sh\nQA_MODE_FILE='${modeFile}' exec "${process.execPath}" --no-env-file run '${join(harness, "qa-claude.ts")}' "$@"\n`); chmodSync(stub, 0o700);
const api = Bun.spawn([process.execPath, "--no-env-file", "run", "src/index.ts"], { cwd: BACK, stdout: "ignore", stderr: "ignore", env: { ...process.env, PORT: String(PORT), HOST: "127.0.0.1", DATABASE_URL: `pglite:file:${join(RUN_ROOT, "db")}`, CAW_POLL_MS: "0", BLUEPRINT_URL: fake.url } });
for (let i = 0; i < 100; i++) { try { if ((await fetch(`${API}/health`)).ok) break; } catch {} await sleep(200); }
const project = await call("POST", "/v1/projects", { blueprintProjectId: BP_PROJECT, version: 1 });
const worker = await call("POST", "/v1/workers", { name: "QA109", role: "BE", skills: ["qa"], model: "haiku", effort: "low" });
await call("POST", `/v1/projects/${project.id}/chain/members`, { workerId: worker.id });
await call("PATCH", `/v1/projects/${project.id}/workspace`, { roots: [work] });
const BP_WEB = "http://127.0.0.1:3119";
const runner = Bun.spawn([process.execPath, "--no-env-file", "run", "src/runner/main.ts"], { cwd: BACK, stdout: "ignore", stderr: "ignore", env: { ...process.env, CAW_API_URL: API, CAW_WORKSPACE_ROOT: RUN_ROOT, RUNNER_POLL_MS: "300", CLAUDE_BIN: stub, BLUEPRINT_URL: fake.url, BLUEPRINT_WEB_URL: BP_WEB } });
for (let i = 0; i < 100 && !(await call("GET", "/v1/team-status")).running; i++) await sleep(200);
try {
  const card = await call("POST", `/v1/projects/${project.id}/cards`, { title: "api refusal", todo: "TEST-109", anchor: { key: "STEP-004", version: 1 }, assigneeId: worker.id });
  const hop = await call("POST", `/v1/projects/${project.id}/hops`, { cardId: card.id, workerId: worker.id });
  let h: any = null;
  for (let i = 0; i < 100; i++) { h = (await call("GET", `/v1/projects/${project.id}/hops`)).hops.find((x: any) => x.id === hop.id); if (h?.endedAt) break; await sleep(300); }
  note("AC-1 a refused API call does not end the hop", h.outcome !== "stopped" && h.outcome !== "failed", `outcome ${h.outcome}`);
  note("AC-1 the note carries REQ-113's reason", h.note.includes("worker เรียก API ของ CAW หรือ Blueprint ตรง ๆ ไม่ได้ — ใช้เครื่องมือของ CAW แทน"), JSON.stringify(h.note));
  const settings = readFileSync(`${modeFile}.settings.json`, "utf8");
  const bpPort = new URL(fake.url).host;
  const hookCmd = (JSON.stringify(JSON.parse(settings).hooks ?? {}).match(/read-guard\.ts[^"]*/) ?? [""])[0];
  note("AC-3 the hook the runner wrote carries the env-configured ports", settings.includes(`127.0.0.1:${PORT}`) && settings.includes(bpPort) && settings.includes("127.0.0.1:3119"), `CAW ${PORT} ${settings.includes(`127.0.0.1:${PORT}`)} · BP ${bpPort} ${settings.includes(bpPort)} · BP web 3119 ${settings.includes("127.0.0.1:3119")} · hook: ${hookCmd.slice(0, 220)}`);
} catch (e) { console.log("ERROR", (e as Error).message); }
finally { runner.kill(); await sleep(500); api.kill(); fake.stop?.(); }
