// TEST-108 layer 2 — the REAL caw-back API + runner, with QA's stub as CLAUDE_BIN. AC-2 (a refusal does not end the hop; the 10th does),
// AC-3 (after a crash / the hop cap / the refusal cap, no card is left in "doing"; it says why; a dependant is not blocked forever).
// usage (cwd = caw-back of the build under test): bun --no-env-file run <this file> <harness dir> <guard-hooks workspace>
import { chmodSync, mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const [harness, hooksWorkspace] = process.argv.slice(2);
const BACK = process.cwd();
const { BP_PROJECT, fakeBlueprint } = await import(join(BACK, "test/helpers/fake-blueprint.ts"));
const PORT = 4541, API = `http://127.0.0.1:${PORT}`;
const note = (c: string, ok: boolean, d: string) => console.log(`${ok ? "OK " : "BAD"} ${c} — ${d}`);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const call = async (method: string, path: string, body?: unknown) => { const r = await fetch(API + path, { method, headers: { "x-caw-actor": "operator", ...(body === undefined ? {} : { "content-type": "application/json" }) }, body: body === undefined ? undefined : JSON.stringify(body) }); const j = await r.json().catch(() => null); if (!r.ok) throw new Error(`${method} ${path}: ${r.status} ${JSON.stringify(j)}`); return j as any; };

const fake = fakeBlueprint();
const RUN_ROOT = mkdtempSync(join(tmpdir(), "qa108-root-"));
mkdirSync(join(RUN_ROOT, ".claude", "skills", "qa"), { recursive: true });
writeFileSync(join(RUN_ROOT, ".claude", "skills", "qa", "SKILL.md"), "TEST-108 stand-in skill.\n");
symlinkSync(join(hooksWorkspace, "scripts"), join(RUN_ROOT, "scripts"));
const work = join(RUN_ROOT, "work"); mkdirSync(work);
const modeFile = join(RUN_ROOT, "mode.txt"); writeFileSync(modeFile, "ok");
const stub = join(RUN_ROOT, "qa-claude.sh");
writeFileSync(stub, `#!/bin/sh\nQA_MODE_FILE='${modeFile}' exec "${process.execPath}" --no-env-file run '${join(harness, "qa-claude.ts")}' "$@"\n`); chmodSync(stub, 0o700);

const api = Bun.spawn([process.execPath, "--no-env-file", "run", "src/index.ts"], { cwd: BACK, stdout: "ignore", stderr: "ignore", env: { ...process.env, PORT: String(PORT), HOST: "127.0.0.1", DATABASE_URL: `pglite:file:${join(RUN_ROOT, "db")}`, CAW_POLL_MS: "0", BLUEPRINT_URL: fake.url } });
for (let i = 0; i < 100; i++) { try { if ((await fetch(`${API}/health`)).ok) break; } catch {} await sleep(200); }
const project = await call("POST", "/v1/projects", { blueprintProjectId: BP_PROJECT, version: 1 });
const worker = await call("POST", "/v1/workers", { name: "QA108", role: "BE", skills: ["qa"], model: "haiku", effort: "low" });
await call("POST", `/v1/projects/${project.id}/chain/members`, { workerId: worker.id });
await call("PATCH", `/v1/projects/${project.id}/workspace`, { roots: [work] });
const runner = Bun.spawn([process.execPath, "--no-env-file", "run", "src/runner/main.ts"], { cwd: BACK, stdout: Bun.file(join(harness, "runner.log")), stderr: Bun.file(join(harness, "runner.err.log")), env: { ...process.env, CAW_API_URL: API, CAW_WORKSPACE_ROOT: RUN_ROOT, RUNNER_POLL_MS: "300", RUNNER_HOP_MAX_MS: "15000", CLAUDE_BIN: stub } });
for (let i = 0; i < 100 && !(await call("GET", "/v1/team-status")).running; i++) await sleep(200);

async function hopFor(mode: string, title: string, extra: Record<string, unknown> = {}, cardId?: string) {
  writeFileSync(modeFile, mode);
  const card = cardId ? await call("GET", `/v1/cards/${cardId}`) : await call("POST", `/v1/projects/${project.id}/cards`, { title, todo: "TEST-108", anchor: { key: "STEP-004", version: 1 }, assigneeId: worker.id, ...extra });
  const hop = await call("POST", `/v1/projects/${project.id}/hops`, { cardId: card.id, workerId: worker.id });
  let h: any = null;
  for (let i = 0; i < 150; i++) { h = (await call("GET", `/v1/projects/${project.id}/hops`)).hops.find((x: any) => x.id === hop.id); if (h?.endedAt) break; await sleep(300); }
  await sleep(600);
  return { hop: h, card: await call("GET", `/v1/cards/${card.id}`) };
}
try {
  // AC-2: one refusal, the hop goes on
  let r = await hopFor("refuse1", "refuse once");
  note("AC-2 one refusal does not end the hop", r.hop.outcome !== "stopped" && r.hop.outcome !== "failed", `outcome ${r.hop.outcome}`);
  note("AC-2 the note names the real reason in the PM's words", /คำสั่งนี้ทำไม่ได้: docker ไม่ใช่คำสั่งที่ worker ใช้ได้ — ทำต่อด้วยวิธีอื่น/.test(r.hop.note), JSON.stringify(r.hop.note));
  note("AC-2 the worker carried on (its comment landed)", JSON.stringify(await call("GET", `/v1/cards/${r.card.id}/context`)).includes("carried on another way"), "");
  // AC-2 cap: the 10th refusal stops it; AC-3: the card is not left doing
  r = await hopFor("cap", "ten refusals");
  note("AC-2 the 10th refusal stops the hop, with the cap note", r.hop.outcome === "stopped" && r.hop.note.includes("หยุดไว้: คำสั่งถูกปฏิเสธครบ 10 ครั้งในก้าวเดียว"), `${r.hop.outcome} · ${JSON.stringify(r.hop.note).slice(0, 220)}`);
  note("AC-3 after the refusal cap: card todo + stoppedMidway", r.card.status === "todo" && !!r.card.stoppedMidway, `${r.card.status} · ${JSON.stringify(r.card.stoppedMidway)}`);
  // AC-3 crash, with a dependant
  const a = await hopFor("crash", "crashes");
  const b = await call("POST", `/v1/projects/${project.id}/cards`, { title: "depends on the crashed card", todo: "TEST-108", anchor: { key: "STEP-004", version: 1 }, assigneeId: worker.id, dependsOn: [a.card.id] });
  note("AC-3 after a crash: card todo + stoppedMidway", a.card.status === "todo" && !!a.card.stoppedMidway, `${a.hop.outcome} · ${a.card.status} · ${JSON.stringify(a.card.stoppedMidway)}`);
  const bView = await call("GET", `/v1/cards/${b.id}`);
  note("AC-3 the dependant waits, not dead", bView.workable === false, `dependant workable ${bView.workable}`);
  const again = await hopFor("ok", "", {}, a.card.id);
  await call("PATCH", `/v1/cards/${a.card.id}/status`, { status: "done" });
  const bAfter = await call("GET", `/v1/cards/${b.id}`);
  note("AC-3 the crashed card gets another turn, and when it is done the dependant is workable", again.hop.outcome !== "failed" && bAfter.workable === true, `second hop ${again.hop.outcome}, card after it ${again.card.status}, stoppedMidway ${JSON.stringify(again.card.stoppedMidway)}; dependant workable ${bAfter.workable}`);
  // AC-3 hop cap (RUNNER_HOP_MAX_MS 15 s)
  r = await hopFor("hang", "hangs");
  note("AC-3 after the hop time cap: card todo + stoppedMidway", r.card.status === "todo" && !!r.card.stoppedMidway, `${r.hop.outcome} · ${JSON.stringify(r.hop.note).slice(0, 120)} · ${r.card.status} · ${JSON.stringify(r.card.stoppedMidway)}`);
  const doing = (await call("GET", `/v1/projects/${project.id}/cards`)).cards.filter((c: any) => c.status === "doing");
  const running = (await call("GET", `/v1/projects/${project.id}/hops`)).hops.filter((h: any) => !h.endedAt);
  note("AC-3 no card left in doing without a running hop", doing.every((c: any) => running.some((h: any) => h.cardId === c.id)), `doing ${doing.length}, running hops ${running.length}`);
  console.log(`project ${project.id} — API ${API} (left up for the screen check; Ctrl+C / kill to stop)`);
} catch (e) { console.log("ERROR", (e as Error).message); }
finally { runner.kill(); await sleep(500); api.kill(); fake.stop?.(); }
