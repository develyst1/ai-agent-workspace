// TEST-112 (REQ-112, CAW side) — the REAL caw-back API + runner + caw-front, against QA's Blueprint stand-in (project P3 = TEST-106's
// spec; `relatedDecisions` off = today, on = SPEC-106 § REQ-112 addition as QA reads it), with QA's stub CLI. No gateway, no live CLI, no .env.
// usage (cwd = the caw-back export): bun --no-env-file run <this file> <harness dir> <caw-front export dir> <guard-hooks workspace>
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
const [H, FRONT, HOOKS_WS] = process.argv.slice(2);
const BACK = process.cwd();
const OUT = join(H, "out"); mkdirSync(OUT, { recursive: true });
const BP_PORT = 4290, PORT = 4541, WEB_PORT = 3541;
const BP = `http://127.0.0.1:${BP_PORT}`, API = `http://127.0.0.1:${PORT}`, WEB = `http://127.0.0.1:${WEB_PORT}`;
const P3 = "00000000-0000-4000-8000-0000000001c2";
const t0 = Date.now(); const ts = () => `${((Date.now() - t0) / 1000).toFixed(1)}s`;
const note = (c: string, ok: boolean, d: string) => console.log(`${ok ? "OK " : "BAD"} [${ts()}] ${c} — ${d}`);
const info = (s: string) => console.log(`    [${ts()}] ${s}`);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const call = async (method: string, path: string, body?: unknown, extra: Record<string, string> = {}) => {
  const r = await fetch(API + path, { method, headers: { "x-caw-actor": "operator", ...extra, ...(body === undefined ? {} : { "content-type": "application/json" }) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await r.text(); let j: any = null; try { j = JSON.parse(text); } catch { j = text; }
  return { status: r.status, j };
};
const qa = async (path: string, body: unknown) => (await fetch(BP + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })).json() as Promise<any>;
const until = async (what: string, secs: number, f: () => Promise<boolean>) => { const s = Date.now(); for (;;) { if (await f()) return (Date.now() - s) / 1000; if (Date.now() - s > secs * 1000) { info(`gave up waiting ${secs}s for: ${what}`); return -1; } await sleep(500); } };
const save = (name: string, v: unknown) => writeFileSync(join(OUT, name), typeof v === "string" ? v : JSON.stringify(v, null, 1));
const SENT = "ส่วนนี้ใน spec ยังไม่มีงานไหนรับไป:";

const RUN = mkdtempSync(join(tmpdir(), "qa112-"));
const STATE = join(RUN, "bp-state.json"), BPLOG = join(OUT, "bp-calls.log"); writeFileSync(BPLOG, "");
const work = join(RUN, "work"); mkdirSync(work);
symlinkSync(join(HOOKS_WS, "scripts"), join(RUN, "scripts"));
mkdirSync(join(RUN, ".claude", "skills", "qa"), { recursive: true }); writeFileSync(join(RUN, ".claude", "skills", "qa", "SKILL.md"), "TEST-112 stand-in skill.\n");
const modeFile = join(RUN, "mode.txt"); writeFileSync(modeFile, "read");
writeFileSync(`${modeFile}.items.json`, JSON.stringify([{ title: "สร้างหน้า Health Board", todo: "TEST-112: the builder's card, anchored on the screen as in TEST-106", anchor: { key: "SCR-001" }, workerId: "self", dependsOn: [], hops: 2 }]));
const stub = join(RUN, "qa-claude.sh");
writeFileSync(stub, `#!/bin/sh\nQA_MODE_FILE='${modeFile}' exec "${process.execPath}" --no-env-file run '${join(H, "qa-claude.ts")}' "$@"\n`); chmodSync(stub, 0o700);
const cleanEnv = Object.fromEntries(Object.entries(process.env).filter(([k]) => !["DATABASE_URL", "CAW_WORKSPACE_ROOT", "CLAUDE_BIN", "CAW_POLL_MS", "BLUEPRINT_URL", "CAW_API_URL"].includes(k)));
let bp: ReturnType<typeof Bun.spawn> | null = null;
const bpUp = async () => { bp = Bun.spawn([process.execPath, "--no-env-file", "run", join(H, "bp-standin.mjs"), String(BP_PORT), join(BACK, "test/fixtures/blueprint"), STATE, BPLOG], { stdout: "ignore", stderr: Bun.file(join(OUT, "bp.err.log")), env: cleanEnv }); await until("stand-in up", 15, async () => { try { return (await fetch(`${BP}/v1/projects/${P3}/spec`)).ok; } catch { return false; } }); };
await bpUp();
const api = Bun.spawn([process.execPath, "--no-env-file", "run", "src/index.ts"], { cwd: BACK, stdout: Bun.file(join(OUT, "api.log")), stderr: Bun.file(join(OUT, "api.err.log")), env: { ...cleanEnv, PORT: String(PORT), HOST: "127.0.0.1", DATABASE_URL: `pglite:file:${join(RUN, "db")}`, BLUEPRINT_URL: BP } });
await until("api up", 30, async () => { try { return (await fetch(`${API}/health`)).ok; } catch { return false; } });
const web = Bun.spawn([join(FRONT, "node_modules/.bin/next"), "start", "-p", String(WEB_PORT), "-H", "127.0.0.1"], { cwd: FRONT, stdout: Bun.file(join(OUT, "web.log")), stderr: Bun.file(join(OUT, "web.err.log")), env: { ...cleanEnv, CAW_API_URL: API } });
await until("web up", 60, async () => { try { return (await fetch(WEB)).status < 500; } catch { return false; } });
const runner = Bun.spawn([process.execPath, "--no-env-file", "run", "src/runner/main.ts"], { cwd: BACK, stdout: Bun.file(join(OUT, "runner.log")), stderr: Bun.file(join(OUT, "runner.err.log")), env: { ...cleanEnv, CAW_API_URL: API, CAW_WORKSPACE_ROOT: RUN, RUNNER_POLL_MS: "300", RUNNER_HOP_MAX_MS: "60000", CLAUDE_BIN: stub } });
const { chromium } = createRequire(join(FRONT, "package.json"))("@playwright/test");
const browser = await chromium.launch({ channel: "chrome" }); const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const shot = async (url: string, name: string) => { await page.goto(WEB + url, { waitUntil: "networkidle" }); await page.waitForTimeout(800); await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true }); return (await page.textContent("body")) ?? ""; };
const lines = (text: string) => (text.match(new RegExp(`${SENT}[^ส]*?(?=${SENT}|$)`, "g")) ?? []).map((s) => s.slice(0, 90));
const uncoveredKeys = (j: any) => (j?.uncovered ?? []).map((u: any) => `${u.key}:${u.decisions.join("+")}`).join(" · ");
const hopOn = async (cardId: string, workerId: string, pid: string) => {
  const h = await call("POST", `/v1/projects/${pid}/hops`, { cardId, workerId });
  await until(`hop ${h.j?.id} ended`, 60, async () => !!(await call("GET", `/v1/projects/${pid}/hops`)).j.hops.find((x: any) => x.id === h.j.id)?.endedAt);
  const f = `${modeFile}.card-${h.j.id}.json`; return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null;
};

try {
  // ---------------- set-up: TEST-106's spec, no relatedDecisions yet (today) ----------------
  const pr = await call("POST", "/v1/projects", { blueprintProjectId: P3 }); const pid = pr.j.id;
  const worker = (await call("POST", "/v1/workers", { name: "QA112", role: "BE", skills: ["qa"], model: "haiku", effort: "low" })).j;
  if (!worker?.id) throw new Error(`worker not created: ${JSON.stringify(worker)}`);
  await call("POST", `/v1/projects/${pid}/chain/members`, { workerId: worker.id });
  await call("PUT", `/v1/projects/${pid}/chain/entry`, { workerId: worker.id });
  await call("PATCH", `/v1/projects/${pid}/workspace`, { roots: [work] });
  await until("runner running", 30, async () => !!(await call("GET", "/v1/team-status")).j?.running);

  // ---------------- AC-2 on the proposal ----------------
  const msg = await call("POST", `/v1/projects/${pid}/chat`, { text: "ช่วยตัดงานสร้างหน้า Health Board ตาม spec ให้หน่อย" });
  let w = await until("the entry worker proposed", 60, async () => (await call("GET", `/v1/projects/${pid}/proposals`)).j?.proposals?.some((x: any) => x.status === "open"));
  const prop = (await call("GET", `/v1/projects/${pid}/proposals`)).j.proposals.find((x: any) => x.status === "open");
  info(`chat message ${msg.status}; proposal after ${w}s: ${prop?.id} items ${JSON.stringify(prop?.items?.map((i: any) => i.anchor))}`);
  const covP = await call("GET", `/v1/projects/${pid}/coverage?proposalId=${prop?.id}`); save("ac2-coverage-proposal.json", covP.j);
  note("AC-2 coverage for the proposal (one item on SCR-001): STEP-002 (DEC-001…003) and WRK-001 (DEC-004, DEC-006) uncovered", covP.status === 200 && uncoveredKeys(covP.j) === "STEP-002:DEC-001+DEC-002+DEC-003 · WRK-001:DEC-004+DEC-006", `${covP.status} ${uncoveredKeys(covP.j)}`);
  const chatText = await shot(`/p/${pid}/chat`, "ac2-proposal");
  note("AC-2 the proposal block shows the PM's sentence for STEP-002 and WRK-001 (key + title)", chatText.includes(`${SENT} STEP-002 เช็คสถานะทั้ง 4 บริการ`) && chatText.includes(`${SENT} WRK-001 I-Space Health Board`), JSON.stringify(lines(chatText)));
  note("AC-2 advisory only: the proposal can still be accepted", true, "");
  const acc = await call("POST", `/v1/proposals/${prop.id}/accept`);
  const cardS = acc.j.cards?.[0];
  note("AC-2 accept works with uncovered parts (D4: never blocks)", acc.status === 200 && cardS?.anchor?.key === "SCR-001", `${acc.status} card ${cardS?.number} anchor ${JSON.stringify(cardS?.anchor)}`);

  // ---------------- AC-2 on the board ----------------
  const covB = await call("GET", `/v1/projects/${pid}/coverage`); save("ac2-coverage-board.json", covB.j);
  note("AC-2 board coverage (cards only) gives the same two parts", uncoveredKeys(covB.j) === "STEP-002:DEC-001+DEC-002+DEC-003 · WRK-001:DEC-004+DEC-006", uncoveredKeys(covB.j));
  const boardText = await shot(`/p/${pid}`, "ac2-board");
  note("AC-2 the board shows the PM's sentence for both parts", boardText.includes(`${SENT} STEP-002 เช็คสถานะทั้ง 4 บริการ`) && boardText.includes(`${SENT} WRK-001 I-Space Health Board`), JSON.stringify(lines(boardText)));
  const hrefs = await page.$$eval("a[href]", (as: any[]) => as.map((a) => a.getAttribute("href")).filter((h: string) => /STEP-002|WRK-001/.test(h)));
  note("AC-2 each key links to Blueprint (D3)", hrefs.length >= 2, JSON.stringify(hrefs.slice(0, 2)));

  // ---------------- before TASK-117: the worker's context, today ----------------
  const before = await hopOn(cardS.id, worker.id, pid); save("ac1-hop-none.json", before);
  note("today (no relatedDecisions): the card context has DEC-005 only — the 10 s / 3 s rules do not reach the worker yet", JSON.stringify(before?.context?.spec?.decisions?.map((d: any) => d.key)) === '["DEC-005"]' && before?.context?.spec?.relatedDecisions === undefined, `decisions ${JSON.stringify(before?.context?.spec?.decisions?.map((d: any) => d.key))}, relatedDecisions ${JSON.stringify(before?.context?.spec?.relatedDecisions)}`);
  note("AC-1 (D1) the worker's prompt tells it to follow spec.decisions AND spec.relatedDecisions", /spec\.decisions/.test(before?.prompt ?? "") && /spec\.relatedDecisions/.test(before?.prompt ?? ""), JSON.stringify((before?.prompt ?? "").split("\n").find((l: string) => l.includes("relatedDecisions")) ?? ""));

  // ---------------- Blueprint starts sending relatedDecisions (as when TASK-117 ships; the spec revision does NOT change) ----------------
  await qa("/qa/related", { project: P3, mode: "contract" });
  const covStale = await call("GET", `/v1/projects/${pid}/coverage`);
  note("memo (SPEC-109 D2) right after Blueprint gains the field, same revision", true, `uncovered now: ${uncoveredKeys(covStale.j) || "none"} (revision ${covStale.j?.revision})`);
  const after = await hopOn(cardS.id, worker.id, pid); save("ac1-hop-contract.json", after);
  const rel = after?.context?.spec?.relatedDecisions ?? [];
  const relText = JSON.stringify(rel);
  note("AC-1 the builder's card context carries the 10-second and 3-second rules (via STEP-002)", relText.includes("10 วินาที") && relText.includes("3 วินาที") && rel.some((r: any) => r.decision.key === "DEC-002" && r.via === "STEP-002") && rel.some((r: any) => r.decision.key === "DEC-003" && r.via === "STEP-002"), JSON.stringify(rel.map((r: any) => `${r.decision.key}<${r.via}`)));
  note("AC-1 passed through whole: relatedDecisionsMore and decisions unchanged", after?.context?.spec?.relatedDecisionsMore === false && JSON.stringify(after?.context?.spec?.decisions?.map((d: any) => d.key)) === '["DEC-005"]', "");
  await qa("/qa/edit", { project: P3, key: "DATA-001", title: "ServiceStatus (QA bump)" }); // a real spec edit raises the revision
  w = await until("coverage after the revision moves", 30, async () => (await call("GET", `/v1/projects/${pid}/coverage`)).j?.uncovered?.length === 0);
  const covC = await call("GET", `/v1/projects/${pid}/coverage`); save("ac2-coverage-contract.json", covC.j);
  note("AC-2 with relatedDecisions: nothing uncovered once the revision moves", covC.j?.uncovered?.length === 0, `after ${w}s, revision ${covC.j?.revision}`);
  const boardC = await shot(`/p/${pid}`, "ac2-board-covered");
  note("AC-2 the board shows no uncovered line when everything is covered", !boardC.includes(SENT), "");

  // ---------------- AC-4: a part with no extra rules ----------------
  const cardD = (await call("POST", `/v1/projects/${pid}/cards`, { title: "data card", todo: "TEST-112 AC-4", anchor: { key: "DATA-001" }, assigneeId: worker.id })).j;
  const dC = (await call("GET", `/v1/cards/${cardD.id}/context`)).j;
  await qa("/qa/related", { project: P3, mode: "none" });
  const dN = (await call("GET", `/v1/cards/${cardD.id}/context`)).j;
  const strip = (s: any) => { const { relatedDecisions: _r, relatedDecisionsMore: _m, ...rest } = s ?? {}; return JSON.stringify(rest); };
  note("AC-4 a part with no extra rules: relatedDecisions [] and the rest of its context unchanged", JSON.stringify(dC?.spec?.relatedDecisions) === "[]" && strip(dC?.spec) === strip(dN?.spec), `relatedDecisions ${JSON.stringify(dC?.spec?.relatedDecisions)}; same otherwise ${strip(dC?.spec) === strip(dN?.spec)}`);
  await qa("/qa/related", { project: P3, mode: "contract" });

  // ---------------- D4: Blueprint down → coverage 502, board still renders ----------------
  bp!.kill(); await until("CAW notices", 30, async () => (await call("GET", `/v1/projects/${pid}`)).j.spec?.reachable === false);
  const cDown = await call("GET", `/v1/projects/${pid}/coverage?proposalId=${prop.id}`);
  const boardDown = await shot(`/p/${pid}`, "d4-board-down");
  note("D4 Blueprint down: coverage → 502 blueprint_unreachable; the board still renders, no coverage line, the REQ-105 sentence", cDown.status === 502 && !boardDown.includes(SENT) && boardDown.includes("ติดต่อ Blueprint ไม่ได้ตอนนี้"), `${cDown.status} ${JSON.stringify(cDown.j).slice(0, 80)}`);
  await bpUp();

  // ---------------- D1: the MCP description, read through MCP itself ----------------
  const mcpProc = Bun.spawn([process.execPath, "--no-env-file", "run", "src/mcp/server.ts"], { cwd: BACK, stdin: "pipe", stdout: "pipe", stderr: "ignore", env: { ...cleanEnv, CAW_API_URL: API, CAW_WORKER_ID: worker.id } });
  const send = (o: unknown) => { mcpProc.stdin.write(JSON.stringify(o) + "\n"); mcpProc.stdin.flush(); };
  send({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "qa", version: "1" } } });
  send({ jsonrpc: "2.0", method: "notifications/initialized" });
  send({ jsonrpc: "2.0", id: 2, method: "tools/list" });
  let buf = ""; const reader = mcpProc.stdout.getReader(); const dec = new TextDecoder(); const stop = Date.now() + 10000;
  while (!buf.includes('"id":2') && Date.now() < stop) { const { value, done } = await Promise.race([reader.read(), sleep(1000).then(() => ({ value: undefined, done: false }))]) as any; if (done) break; if (value) buf += dec.decode(value); }
  mcpProc.kill();
  const tools = buf.split("\n").map((l) => { try { return JSON.parse(l); } catch { return null; } }).find((m) => m?.id === 2)?.result?.tools ?? [];
  const cc = tools.find((t: any) => t.name === "card_context");
  note("D1 MCP card_context description names spec.decisions and spec.relatedDecisions", /spec\.decisions/.test(cc?.description ?? "") && /spec\.relatedDecisions/.test(cc?.description ?? ""), JSON.stringify(cc?.description ?? "not found").slice(0, 300));
  save("final-coverage.json", (await call("GET", `/v1/projects/${pid}/coverage`)).j);
} catch (e) { console.log("ERROR", (e as Error).stack); }
finally { await browser.close(); runner.kill(); web.kill(); api.kill(); bp?.kill(); await sleep(800); console.log(`run dir ${RUN}`); }
