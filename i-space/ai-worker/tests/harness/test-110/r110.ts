// TEST-110 (REQ-105, CAW side) — the REAL caw-back API + runner + caw-front, against QA's Blueprint stand-in (bp-standin.mjs, SPEC-106 v2),
// with QA's stub CLI (qa-claude.ts). No gateway, no live CLI, no .env (every child: --no-env-file, DATABASE_URL = PGlite file).
// usage (cwd = the caw-back export): bun --no-env-file run <this file> <harness dir> <caw-front export dir> <guard-hooks workspace>
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
const [H, FRONT, HOOKS_WS] = process.argv.slice(2);
const BACK = process.cwd();
const OUT = join(H, "out"); mkdirSync(OUT, { recursive: true });
const BP_PORT = 4290, PORT = 4541, WEB_PORT = 3541;
const BP = `http://127.0.0.1:${BP_PORT}`, API = `http://127.0.0.1:${PORT}`, WEB = `http://127.0.0.1:${WEB_PORT}`;
const P1 = JSON.parse(readFileSync(join(BACK, "test/fixtures/blueprint/project-200.json"), "utf8")).project.id;
const P2 = "00000000-0000-4000-8000-0000000000c2";
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

const RUN = mkdtempSync(join(tmpdir(), "qa110-"));
const STATE = join(RUN, "bp-state.json"), BPLOG = join(OUT, "bp-calls.log"); writeFileSync(BPLOG, "");
const work = join(RUN, "work"); mkdirSync(work);
// as TEST-108: the runner proves its guard hooks at start (src/runner/guard.ts) and a worker needs ≥ 1 skill (routes/workers.ts Skills .min(1))
symlinkSync(join(HOOKS_WS, "scripts"), join(RUN, "scripts"));
mkdirSync(join(RUN, ".claude", "skills", "qa"), { recursive: true }); writeFileSync(join(RUN, ".claude", "skills", "qa", "SKILL.md"), "TEST-110 stand-in skill.\n");
const modeFile = join(RUN, "mode.txt"); writeFileSync(modeFile, "read");
const stub = join(RUN, "qa-claude.sh");
writeFileSync(stub, `#!/bin/sh\nQA_MODE_FILE='${modeFile}' exec "${process.execPath}" --no-env-file run '${join(H, "qa-claude.ts")}' "$@"\n`); chmodSync(stub, 0o700);
const cleanEnv = Object.fromEntries(Object.entries(process.env).filter(([k]) => !["DATABASE_URL", "CAW_WORKSPACE_ROOT", "CLAUDE_BIN", "CAW_POLL_MS", "BLUEPRINT_URL", "CAW_API_URL"].includes(k)));
let bp: ReturnType<typeof Bun.spawn> | null = null;
const bpUp = async () => { bp = Bun.spawn([process.execPath, "--no-env-file", "run", join(H, "bp-standin.mjs"), String(BP_PORT), join(BACK, "test/fixtures/blueprint"), STATE, BPLOG], { stdout: "ignore", stderr: Bun.file(join(OUT, "bp.err.log")), env: cleanEnv }); await until("stand-in up", 15, async () => { try { return (await fetch(`${BP}/v1/projects/${P1}/spec`)).ok; } catch { return false; } }); };
await bpUp();
// CAW_POLL_MS deliberately UNSET: the 10 s default is what SPEC-107 D9 ships (AC-1 ≤ 30 s without a push). No CAW_NOTIFY: pull only.
const api = Bun.spawn([process.execPath, "--no-env-file", "run", "src/index.ts"], { cwd: BACK, stdout: Bun.file(join(OUT, "api.log")), stderr: Bun.file(join(OUT, "api.err.log")), env: { ...cleanEnv, PORT: String(PORT), HOST: "127.0.0.1", DATABASE_URL: `pglite:file:${join(RUN, "db")}`, BLUEPRINT_URL: BP } });
await until("api up", 30, async () => { try { return (await fetch(`${API}/health`)).ok; } catch { return false; } });
const web = Bun.spawn([join(FRONT, "node_modules/.bin/next"), "start", "-p", String(WEB_PORT), "-H", "127.0.0.1"], { cwd: FRONT, stdout: Bun.file(join(OUT, "web.log")), stderr: Bun.file(join(OUT, "web.err.log")), env: { ...cleanEnv, CAW_API_URL: API } });
await until("web up", 60, async () => { try { return (await fetch(WEB)).status < 500; } catch { return false; } });
const { chromium } = createRequire(join(FRONT, "package.json"))("@playwright/test");
const browser = await chromium.launch({ channel: "chrome" }); const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const shot = async (url: string, name: string) => { await page.goto(WEB + url, { waitUntil: "networkidle" }); await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true }); return { url: page.url(), text: (await page.textContent("body")) ?? "" }; };
let runner: ReturnType<typeof Bun.spawn> | null = null;
const UNREACH = "ติดต่อ Blueprint ไม่ได้ตอนนี้ — ทำงานต่อจาก spec ล่าสุดที่อ่านได้";

try {
  // ---------------- AC-3: start with NO label ----------------
  const s3 = await shot(`/start?project=${P2}`, "ac3-start-no-label");
  note("AC-3 /start?project=<no label> opens a board (no version in the link)", /\/p\/[0-9a-f-]{36}$/.test(s3.url) && !s3.text.includes("ลิงก์นี้ไม่ครบ"), `landed ${s3.url.replace(WEB, "")}; "ลิงก์นี้ไม่ครบ" ${s3.text.includes("ลิงก์นี้ไม่ครบ")}`);
  note("AC-3 the header says ยังไม่มีป้าย", s3.text.includes("ยังไม่มีป้าย"), "");
  const s3b = await shot(`/start`, "ac3-start-incomplete");
  note("AC-3 neighbour: /start with no project → the new incomplete sentence", s3b.text.includes("ลิงก์นี้ไม่ครบ ต้องมีโปรเจกต์") && !s3b.text.includes("เวอร์ชัน"), JSON.stringify(s3b.text.match(/ลิงก์นี้ไม่ครบ[^\n]{0,40}/)?.[0]));

  // ---------------- set-up on P1 (no label yet) ----------------
  const pr = await call("POST", "/v1/projects", { blueprintProjectId: P1 });
  const pid = pr.j.id; save("p1-created.json", pr.j);
  note("AC-3 API: POST /v1/projects with no version → 201, latestLabel null, version 0", pr.status === 201 && pr.j.latestLabel === null && pr.j.version === 0, `${pr.status} version ${pr.j.version} latestLabel ${JSON.stringify(pr.j.latestLabel)} spec ${JSON.stringify(pr.j.spec)}`);
  const worker = (await call("POST", "/v1/workers", { name: "QA110", role: "BE", skills: ["qa"], model: "haiku", effort: "low" })).j;
  if (!worker?.id) throw new Error(`worker not created: ${JSON.stringify(worker)}`);
  await call("POST", `/v1/projects/${pid}/chain/members`, { workerId: worker.id });
  await call("PATCH", `/v1/projects/${pid}/workspace`, { roots: [work] });
  const cardA = (await call("POST", `/v1/projects/${pid}/cards`, { title: "A — cut before any label", todo: "TEST-110", anchor: { key: "STEP-004" }, assigneeId: worker.id })).j;
  note("AC-4 a card cut with no label: anchorLabel null, anchor.version 0", cardA.anchorLabel === null && cardA.anchor?.version === 0, JSON.stringify({ anchor: cardA.anchor, anchorLabel: cardA.anchorLabel }));

  // ---------------- AC-4: labels are tags ----------------
  await qa("/qa/label", { project: P1, label: "v1" });
  let w = await until("CAW sees label v1", 30, async () => (await call("GET", `/v1/projects/${pid}`)).j.latestLabel?.label === "v1");
  note("AC-4 a label added in Blueprint reaches CAW (no edit, no restart)", w >= 0, `after ${w}s`);
  const cardB = (await call("POST", `/v1/projects/${pid}/cards`, { title: "B — cut at v1", todo: "TEST-110", anchor: { key: "STEP-004" }, assigneeId: worker.id })).j;
  note("AC-4 a card cut at v1 keeps anchorLabel v1", cardB.anchorLabel === "v1" && cardB.anchor?.version === 1, JSON.stringify({ anchor: cardB.anchor, anchorLabel: cardB.anchorLabel }));
  await qa("/qa/label", { project: P1, label: "v2" });
  w = await until("CAW sees label v2", 30, async () => (await call("GET", `/v1/projects/${pid}`)).j.latestLabel?.label === "v2");
  const bAfter = (await call("GET", `/v1/cards/${cardB.id}`)).j;
  note("AC-4 project shows v2; card B still says v1", w >= 0 && bAfter.anchorLabel === "v1", `v2 after ${w}s; card B anchorLabel ${bAfter.anchorLabel}`);
  const h4 = await shot(`/p/${pid}`, "ac4-board");
  note("AC-4 board header: ป้าย v2", h4.text.includes("ป้าย v2"), JSON.stringify(h4.text.match(/ป้าย v\d[^\n]{0,10}/g)?.slice(0, 3)));
  const cA = await shot(`/p/${pid}/c/${cardA.id}`, "ac4-card-a");
  const cB = await shot(`/p/${pid}/c/${cardB.id}`, "ac4-card-b");
  note("AC-4 card A page: ตัดงานก่อนมีป้าย", cA.text.includes("ตัดงานก่อนมีป้าย"), "");
  note("AC-4 card B page: ตัดงานที่ป้าย v1 (history)", cB.text.includes("ตัดงานที่ป้าย v1") && !cB.text.includes("ตัดงานที่ป้าย v2"), "");
  const list = await shot(`/`, "ac4-projects-list");
  note("AC-4 projects list chip: ป้าย v2 (no 'spec เวอร์ชัน')", list.text.includes("ป้าย v2") && !list.text.includes("spec เวอร์ชัน"), "");

  // ---------------- AC-1 on the stand-in (indicator only; AC-1's verdict needs the real Blueprint) ----------------
  const before = (await call("GET", `/v1/projects/${pid}/parts/STEP-004`)).j;
  await qa("/qa/edit", { project: P1, key: "STEP-004", title: "QA-AC1 ผู้ดูแลพิจารณา (แก้แล้ว)" });
  w = await until("card flagged + part reader new text", 40, async () => {
    const c = (await call("GET", `/v1/cards/${cardB.id}`)).j; const p = (await call("GET", `/v1/projects/${pid}/parts/STEP-004`)).j;
    return c.specChangedVersion !== null && JSON.stringify(p).includes("QA-AC1");
  });
  note("AC-1 (stand-in) an edit without a label: card flagged and the part reader shows the new text within 30 s", w >= 0 && w <= 30, `after ${w}s (before: ${JSON.stringify(before?.spec?.part?.title ?? before?.part?.title ?? before).slice(0, 80)})`);
  const bFlag = (await call("GET", `/v1/cards/${cardB.id}`)).j;
  note("AC-1 / D7 the flagged card is still workable", bFlag.workable === true, `specChangedVersion ${bFlag.specChangedVersion}, workable ${bFlag.workable}`);
  const b1 = await shot(`/p/${pid}`, "ac1-board-flagged");
  note("AC-1 the board shows the card as changed", b1.text.includes("spec เปลี่ยน"), "");

  // ---------------- AC-2: a hop keeps its start text ----------------
  runner = Bun.spawn([process.execPath, "--no-env-file", "run", "src/runner/main.ts"], { cwd: BACK, stdout: Bun.file(join(OUT, "runner.log")), stderr: Bun.file(join(OUT, "runner.err.log")), env: { ...cleanEnv, CAW_API_URL: API, CAW_WORKSPACE_ROOT: RUN, RUNNER_POLL_MS: "300", RUNNER_HOP_MAX_MS: "120000", CLAUDE_BIN: stub } });
  await until("runner running", 30, async () => !!(await call("GET", "/v1/team-status")).j?.running);
  writeFileSync(modeFile, "pin"); rmSync(`${modeFile}.started`, { force: true }); rmSync(`${modeFile}.go`, { force: true });
  const hop1 = await call("POST", `/v1/projects/${pid}/hops`, { cardId: cardB.id, workerId: worker.id });
  note("AC-2 hop 1 starts on the flagged card (D7)", hop1.status === 201 || hop1.status === 200, `${hop1.status} ${JSON.stringify(hop1.j).slice(0, 120)}`);
  w = await until("hop 1 read its start text", 60, async () => existsSync(`${modeFile}.started`));
  info(`hop 1 started reading after ${w}s`);
  await qa("/qa/edit", { project: P1, key: "STEP-004", title: "QA-AC2 ข้อความใหม่กลางก้าว" });
  w = await until("CAW pulled the mid-hop edit", 40, async () => JSON.stringify((await call("GET", `/v1/cards/${cardB.id}/context`)).j).includes("QA-AC2"));
  note("AC-2 mid-hop: the operator (no hop) already reads the new text", w >= 0, `after ${w}s`);
  writeFileSync(`${modeFile}.go`, "go");
  const hopDone = async (id: string) => until(`hop ${id} ended`, 60, async () => !!(await call("GET", `/v1/projects/${pid}/hops`)).j.hops.find((h: any) => h.id === id)?.endedAt);
  await hopDone(hop1.j.id);
  writeFileSync(modeFile, "read");
  const hop2 = await call("POST", `/v1/projects/${pid}/hops`, { cardId: cardB.id, workerId: worker.id });
  await hopDone(hop2.j.id); await sleep(800);
  const ctxB = (await call("GET", `/v1/cards/${cardB.id}/context`)).j; save("ac2-card-b-context.json", ctxB);
  const said = JSON.stringify(ctxB).match(/TEST-110 (start|mid)-read \(hop [^)]+\): [^"\\]+/g) ?? [];
  save("ac2-worker-reads.txt", said.join("\n"));
  const of = (kind: string, hop: string) => said.find((s) => s.includes(`${kind}-read (hop ${hop})`)) ?? "";
  note("AC-2 hop 1 start read: the text it started with", of("start", hop1.j.id).includes("QA-AC1") && of("start", hop1.j.id).includes("pinned=true"), of("start", hop1.j.id));
  note("AC-2 hop 1 mid read, AFTER the edit: still its start text", of("mid", hop1.j.id).includes("QA-AC1") && !of("mid", hop1.j.id).includes("QA-AC2"), of("mid", hop1.j.id));
  note("AC-2 hop 2 (next hop) reads the new text", of("start", hop2.j.id).includes("QA-AC2"), of("start", hop2.j.id));
  const late = (await call("GET", `/v1/cards/${cardB.id}/context`, undefined, { "x-caw-actor": `worker:${worker.id}`, "x-caw-hop": hop1.j.id })).j;
  const opLate = (await call("GET", `/v1/cards/${cardB.id}/context`, undefined, { "x-caw-hop": hop1.j.id })).j;
  note("AC-2 D5 neighbour: the operator with hop 1's id gets the latest (D5: any other caller → latest)", opLate?.spec?.part?.title?.includes("QA-AC2") && opLate?.specRead?.pinned === false, `${opLate?.spec?.part?.title} pinned ${opLate?.specRead?.pinned}`);
  note("AC-2 D5 neighbour: hop 1's WORKER still gets the pin after the hop ended", late?.spec?.part?.title?.includes("QA-AC1") && late?.specRead?.pinned === true, `${late?.spec?.part?.title} pinned ${late?.specRead?.pinned}`);
  const other = (await call("GET", `/v1/cards/${cardA.id}/context`, undefined, { "x-caw-actor": `worker:${worker.id}`, "x-caw-hop": hop1.j.id })).j;
  note("AC-2 D5 neighbour: hop 1's id on ANOTHER card → latest, not the pin", other?.spec?.part?.title?.includes("QA-AC2") && other?.specRead?.pinned === false, `${other?.spec?.part?.title} pinned ${other?.specRead?.pinned}`);

  // ---------------- AC-5: Blueprint down for 60 s ----------------
  const revBefore = (await call("GET", `/v1/projects/${pid}`)).j.spec?.revision;
  bp!.kill(); const down = Date.now(); info(`stand-in stopped (CAW last revision ${revBefore})`);
  w = await until("CAW shows Blueprint unreachable", 40, async () => (await call("GET", `/v1/projects/${pid}`)).j.spec?.reachable === false);
  note("AC-5 CAW notices Blueprint is down", w >= 0, `after ${w}s; spec ${JSON.stringify((await call("GET", `/v1/projects/${pid}`)).j.spec)}`);
  const cDown = await call("GET", `/v1/cards/${cardA.id}/context`);
  note("AC-5 card context still answers from the last read (fromCache)", cDown.status === 200 && cDown.j.specRead?.fromCache === true && JSON.stringify(cDown.j).includes("QA-AC2"), `${cDown.status} ${JSON.stringify(cDown.j.specRead)} ${cDown.j?.spec?.part?.title}`);
  const pDown = await call("GET", `/v1/projects/${pid}/parts/STEP-004`);
  note("AC-5 the part reader still answers from the last read", pDown.status === 200 && JSON.stringify(pDown.j).includes("QA-AC2"), `${pDown.status}`);
  const hop3 = await call("POST", `/v1/projects/${pid}/hops`, { cardId: cardA.id, workerId: worker.id });
  await hopDone(hop3.j.id); await sleep(800);
  const said3 = JSON.stringify((await call("GET", `/v1/cards/${cardA.id}/context`)).j).match(/TEST-110 start-read \(hop [^)]+\): [^"\\]+/g) ?? [];
  note("AC-5 a hop started while Blueprint is down still works on the last read", said3.some((s) => s.includes(hop3.j.id) && s.includes("QA-AC2") && s.startsWith("TEST-110 start-read") && / 200 /.test(` ${s.split(": ")[1]}`)), said3.find((s) => s.includes(hop3.j.id)) ?? "no worker read");
  const bD = await shot(`/p/${pid}`, "ac5-board-down");
  const cD = await shot(`/p/${pid}/c/${cardA.id}`, "ac5-card-down");
  note("AC-5 the board says Blueprint is unreachable (PM's sentence)", bD.text.includes(UNREACH), "");
  note("AC-5 the card page says it too and still shows the part", cD.text.includes(UNREACH) && cD.text.includes("QA-AC2"), "");
  const left = 60_000 - (Date.now() - down); if (left > 0) await sleep(left);
  info(`stand-in down for ${((Date.now() - down) / 1000).toFixed(0)}s; starting it again (same state file)`);
  await bpUp();
  const back = Date.now();
  await qa("/qa/edit", { project: P1, key: "STEP-004", title: "QA-AC5 หลัง Blueprint กลับมา" });
  w = await until("CAW catches up after Blueprint is back", 40, async () => {
    const p = (await call("GET", `/v1/projects/${pid}`)).j; const ctx = (await call("GET", `/v1/cards/${cardA.id}/context`)).j;
    return p.spec?.reachable === true && JSON.stringify(ctx).includes("QA-AC5") && ctx.specRead?.fromCache === false;
  });
  note("AC-5 CAW catches up without a restart (reachable, new text, card flagged)", w >= 0 && (await call("GET", `/v1/cards/${cardA.id}`)).j.specChangedVersion !== null && api.exitCode === null, `after ${w}s since the edit; api pid ${api.pid} alive ${api.exitCode === null}`);
  const changesCalls = readFileSync(BPLOG, "utf8").split("\n").filter((l) => l.includes(`/v1/projects/${P1}/spec/changes`));
  const firstAfterBack = changesCalls.find((l) => new Date(l.split(" ")[0]!).getTime() >= back);
  note("AC-5 the first pull after the outage resumes from CAW's last revision", !!firstAfterBack && firstAfterBack.includes(`after=${revBefore}`), `${firstAfterBack?.split(" ").slice(1).join(" ")} (last revision before: ${revBefore})`);
  const bU = await shot(`/p/${pid}`, "ac5-board-back");
  note("AC-5 the unreachable sentence is gone when Blueprint is back", !bU.text.includes(UNREACH), "");

  // ---------------- AC-6 neighbours: the push receiver ----------------
  const n1 = await call("POST", "/v1/notify", { event: "version.confirmed", projectId: P1, version: 2, confirmedAt: new Date().toISOString() });
  const n2 = await call("POST", "/v1/notify", { projectId: P1 });
  const n3 = await call("POST", "/v1/notify", { event: "spec.changed", projectId: P1, revision: 99, at: new Date().toISOString() });
  const n4 = await call("POST", "/v1/notify", { event: "something.else", projectId: P1 });
  note("AC-6 /v1/notify: version.confirmed 202 · no event 400 · spec.changed 202 · unknown event 202", n1.status === 202 && n2.status === 400 && n3.status === 202 && n4.status === 202, `${n1.status} · ${n2.status} · ${n3.status} · ${n4.status}`);
  const v1Calls = readFileSync(BPLOG, "utf8").split("\n").filter((l) => /\/versions|\/v1\/projects\/[^/]+\/locate|\/parts\/[^/]+\/context/.test(l) && !l.includes("/spec/"));
  note("D1: CAW made no v1 version/locate/context call to Blueprint", v1Calls.length === 0, `${v1Calls.length} — ${v1Calls.slice(0, 3).join(" | ")}`);
  const rb = await call("POST", `/v1/projects/${pid}/rebuild-check`);
  note("AC-6 rebuild-check stays clean after spec.revised / anchor events", rb.j?.same === true, JSON.stringify(rb.j).slice(0, 160));
  save("final-project.json", (await call("GET", `/v1/projects/${pid}`)).j); save("final-cards.json", (await call("GET", `/v1/projects/${pid}/cards`)).j);
} catch (e) { console.log("ERROR", (e as Error).stack); }
finally { await browser.close(); runner?.kill(); web.kill(); api.kill(); bp?.kill(); await sleep(800); console.log(`run dir ${RUN}`); }
