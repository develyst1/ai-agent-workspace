// TEST-110 JOINT RUN (REQ-105 AC-1…AC-6) — the REAL blueprint-back (with TASK-113's v2 routes) + blueprint-front + caw-back API + runner +
// caw-front, QA's stub CLI as the worker, QA's net (qa-net.mjs) between CAW and Blueprint. No gateway (Blueprint's GATEWAY_URL = a refusing
// stub), no live CLI, no .env. usage (cwd = the caw-back export):
//   bun --no-env-file run <this file> <joint harness dir> <export root> <guard-hooks workspace> <refusing stub url>
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
const [J, X, HOOKS_WS, REFUSE] = process.argv.slice(2);
const BACK = process.cwd(), H = join(J, "..");
const OUT = join(J, "out"); mkdirSync(OUT, { recursive: true });
const BPB_PORT = 4292, PROXY = 4290, RELAY = 4288, CTL = 4287, PORT = 4541, WEB = 3541, BPW = 3142;
const BPB = `http://127.0.0.1:${BPB_PORT}`, BPV = `http://127.0.0.1:${PROXY}`, API = `http://127.0.0.1:${PORT}`, CAWWEB = `http://127.0.0.1:${WEB}`, BPWEB = `http://127.0.0.1:${BPW}`;
const t0 = Date.now(); const ts = () => `${((Date.now() - t0) / 1000).toFixed(1)}s`;
const note = (c: string, ok: boolean, d: string) => console.log(`${ok ? "OK " : "BAD"} [${ts()}] ${c} — ${d}`);
const info = (s: string) => console.log(`    [${ts()}] ${s}`);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const save = (name: string, v: unknown) => writeFileSync(join(OUT, name), typeof v === "string" ? v : JSON.stringify(v, null, 1));
const until = async (what: string, secs: number, f: () => Promise<boolean>) => { const s = Date.now(); for (;;) { try { if (await f()) return (Date.now() - s) / 1000; } catch {} if (Date.now() - s > secs * 1000) { info(`gave up waiting ${secs}s for: ${what}`); return -1; } await sleep(250); } };
const call = async (method: string, path: string, body?: unknown, extra: Record<string, string> = {}) => {
  const r = await fetch(API + path, { method, headers: { "x-caw-actor": "operator", ...extra, ...(body === undefined ? {} : { "content-type": "application/json" }) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await r.text(); let j: any = null; try { j = JSON.parse(text); } catch { j = text; } return { status: r.status, j };
};
const BY = { "content-type": "application/json", "x-blueprint-by": encodeURIComponent("โด่ง") };
const bp = async (method: string, path: string, body?: unknown) => { const r = await fetch(BPB + path, { method, headers: BY, body: body === undefined ? undefined : JSON.stringify(body) }); const t = await r.text(); let j: any; try { j = JSON.parse(t); } catch { j = t; } return { status: r.status, j }; };
const net = (p: string) => fetch(`http://127.0.0.1:${CTL}/qa/${p}`).then((r) => r.json());
// QA's edits go through Blueprint's own write routes — the way the PM's edits reach it
const edit = async (pid: string, key: string, title: string) => bp("POST", `/v1/projects/${pid}/change-sets`, { cause: { kind: "operator" }, changes: [{ op: "part.update", key, title }] });
const label = async (pid: string, text: string) => bp("POST", `/v1/projects/${pid}/versions`, { label: text });

const RUN = mkdtempSync(join(tmpdir(), "qa110j-"));
const work = join(RUN, "work"); mkdirSync(work);
symlinkSync(join(HOOKS_WS, "scripts"), join(RUN, "scripts"));
mkdirSync(join(RUN, ".claude", "skills", "qa"), { recursive: true }); writeFileSync(join(RUN, ".claude", "skills", "qa", "SKILL.md"), "TEST-110 joint stand-in skill.\n");
const modeFile = join(RUN, "mode.txt"); writeFileSync(modeFile, "read");
const stub = join(RUN, "qa-claude.sh");
writeFileSync(stub, `#!/bin/sh\nQA_MODE_FILE='${modeFile}' exec "${process.execPath}" --no-env-file run '${join(H, "qa-claude.ts")}' "$@"\n`); chmodSync(stub, 0o700);
const cleanEnv = Object.fromEntries(Object.entries(process.env).filter(([k]) => !["DATABASE_URL", "CAW_WORKSPACE_ROOT", "CLAUDE_BIN", "CAW_POLL_MS", "BLUEPRINT_URL", "CAW_API_URL", "CAW_NOTIFY_URL", "GATEWAY_URL", "CAW_URL"].includes(k)));
const procs: ReturnType<typeof Bun.spawn>[] = [];
const spawn = (cmd: string[], cwd: string, env: Record<string, string>, name: string) => { const p = Bun.spawn(cmd, { cwd, stdout: Bun.file(join(OUT, `${name}.log`)), stderr: Bun.file(join(OUT, `${name}.err.log`)), env: { ...cleanEnv, ...env } }); procs.push(p); return p; };
const NETLOG = join(OUT, "net.log"); writeFileSync(NETLOG, "");
spawn([process.execPath, "--no-env-file", "run", join(J, "qa-net.mjs"), String(PROXY), BPB, String(RELAY), `${API}/v1/notify`, String(CTL), NETLOG], J, {}, "net");
spawn([process.execPath, "--no-env-file", "run", "src/index.ts"], join(X, "blueprint-back"), { PORT: String(BPB_PORT), DATABASE_URL: "pglite:memory", GATEWAY_URL: REFUSE, CAW_NOTIFY_URL: `http://127.0.0.1:${RELAY}/notify` }, "bp-back");
await until("blueprint-back up", 30, async () => (await fetch(`${BPB}/v1/projects`)).ok);
spawn([process.execPath, "--no-env-file", "run", "src/index.ts"], BACK, { PORT: String(PORT), HOST: "127.0.0.1", DATABASE_URL: `pglite:file:${join(RUN, "db")}`, BLUEPRINT_URL: BPV }, "caw-api"); // CAW_POLL_MS unset = the 10 s default
await until("caw api up", 30, async () => (await fetch(`${API}/health`)).ok);
spawn([join(X, "caw-front/node_modules/.bin/next"), "start", "-p", String(WEB), "-H", "127.0.0.1"], join(X, "caw-front"), { CAW_API_URL: API, BLUEPRINT_URL: BPWEB }, "caw-web");
spawn([join(X, "blueprint-front/node_modules/.bin/next"), "start", "-p", String(BPW), "-H", "127.0.0.1"], join(X, "blueprint-front"), { BLUEPRINT_API_URL: BPB, CAW_URL: CAWWEB }, "bp-web");
await until("webs up", 60, async () => (await fetch(CAWWEB)).status < 500 && (await fetch(BPWEB)).status < 500);
const { chromium } = createRequire(join(X, "caw-front/package.json"))("@playwright/test");
const browser = await chromium.launch({ channel: "chrome" }); const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: "bp_by", value: encodeURIComponent("โด่ง"), url: BPWEB }]);
const page = await ctx.newPage(); page.setDefaultTimeout(30000);
const shot = async (url: string, name: string) => { await page.goto(url, { waitUntil: "networkidle" }); await page.waitForTimeout(500); await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true }); return { url: page.url(), text: (await page.textContent("body")) ?? "", seen: await page.innerText("body") }; }; // `seen` = what is painted (no script data)
const UNREACH = "ติดต่อ Blueprint ไม่ได้ตอนนี้ — ทำงานต่อจาก spec ล่าสุดที่อ่านได้";
let runner: ReturnType<typeof Bun.spawn> | null = null;

try {
  // ---------------- Blueprint projects, made the way a PM makes them ----------------
  const p1 = (await bp("POST", "/v1/projects", { name: "TEST-110 joint Health Board", theme: "clean-blue" })).j.id;
  const p2 = (await bp("POST", "/v1/projects", { name: "TEST-110 joint no label", theme: "clean-blue" })).j.id;
  const ref = (k: string) => ({ op: "part.add", ref: k, });
  const O = { stamp: "operator", date: "2026-10-30", note: "TEST-110 joint run seed (the change-set route, as TEST-106)" }; // part.add / link.add require origin (blueprint-back src/spec/types.ts:59,76)
  const cs = await bp("POST", `/v1/projects/${p1}/change-sets`, { cause: { kind: "operator" }, changes: [
    { op: "part.add", ref: "$w", kind: "work", title: "I-Space Health Board", body: { goal: "หน้าเว็บเดียว ดูว่าบริการของ I-Space ตัวไหนเปิดอยู่" }, origin: O },
    { op: "part.add", ref: "$scr", kind: "screen", title: "หน้า Health Board", body: { fields: [], actions: [{ name: "checkNow", label: "เช็คตอนนี้" }], states: [] }, origin: O },
    { op: "part.add", ref: "$s1", kind: "step", title: "เปิดหน้า Health Board", body: { ends: false }, origin: O },
    { op: "part.add", ref: "$s2", kind: "step", title: "เช็คสถานะทั้ง 4 บริการ", body: { ends: true }, origin: O },
    { op: "link.add", kind: "has_step", from: "$w", to: "$s1", origin: O }, { op: "link.add", kind: "has_step", from: "$w", to: "$s2", origin: O }, { op: "link.add", kind: "next", from: "$s1", to: "$s2", origin: O },
    { op: "part.add", ref: "$d", kind: "decision", title: "เช็คใหม่เองทุก 10 วินาที", body: { rule: "เช็คใหม่เองทุก 10 วินาที และมีปุ่ม \"เช็คตอนนี้\"" }, origin: O },
    { op: "link.add", kind: "covers", from: "$d", to: "$s2", origin: O },
  ] });
  const K = cs.j.keys ?? {}; const STEP = K["$s2"], SCR = K["$scr"];
  if (cs.status !== 201) throw new Error(`seed change-set ${cs.status}: ${JSON.stringify(cs.j).slice(0, 300)}`);
  info(`Blueprint p1 ${p1} (change-set ${cs.status}, keys ${JSON.stringify(K)}) · p2 ${p2} (no parts, no label)`);
  ignoreUnused(ref);
  // the real v2 answers, recorded (the contract-drift check SPEC-107 Risks names)
  for (const [n, path] of [["spec", `/v1/projects/${p1}/spec`], ["context", `/v1/projects/${p1}/spec/parts/${STEP}/context`], ["changes", `/v1/projects/${p1}/spec/changes?after=0`]] as const) save(`real-v2-${n}.json`, (await bp("GET", path)).j);
  const rl = await bp("POST", `/v1/projects/${p1}/spec/locate`, { request: "เช็คสถานะบริการ" }); save("real-v2-locate.json", rl.j);

  // ---------------- AC-3: Blueprint's own button, no label ----------------
  await page.goto(`${BPWEB}/p/${p2}/ready`, { waitUntil: "networkidle" });
  const btn = page.getByText("ส่งไปสร้างที่ CAW").first();
  const href = (await btn.count()) ? await btn.evaluate((el: any) => el.closest("a")?.getAttribute("href") ?? el.getAttribute("href")) : null;
  info(`blueprint-front ready page: button ${await btn.count()} href ${href}`);
  if (await btn.count()) { await Promise.all([page.waitForURL(/3541/, { timeout: 30000 }).catch(() => {}), btn.click()]); await page.waitForLoadState("networkidle"); }
  await page.screenshot({ path: join(OUT, "ac3-from-blueprint-button.png"), fullPage: true });
  const landed = page.url(), t3 = (await page.textContent("body")) ?? "";
  note("AC-3 Blueprint's \"ส่งไปสร้างที่ CAW\" on a project with NO label → a CAW board, no \"ลิงก์นี้ไม่ครบ\"", /3541\/p\/[0-9a-f-]{36}/.test(landed) && !t3.includes("ลิงก์นี้ไม่ครบ") && t3.includes("ยังไม่มีป้าย"), `href ${href} → ${landed}`);

  // ---------------- CAW project on p1; card A before any label ----------------
  const pr = await call("POST", "/v1/projects", { blueprintProjectId: p1 }); const pid = pr.j.id;
  note("AC-3 API: CAW project from a real Blueprint project with no label", pr.status === 201 && pr.j.version === 0 && pr.j.latestLabel === null, `${pr.status} spec ${JSON.stringify(pr.j.spec)}`);
  const worker = (await call("POST", "/v1/workers", { name: "QA110J", role: "BE", skills: ["qa"], model: "haiku", effort: "low" })).j;
  if (!worker?.id) throw new Error(`worker: ${JSON.stringify(worker)}`);
  await call("POST", `/v1/projects/${pid}/chain/members`, { workerId: worker.id });
  await call("PATCH", `/v1/projects/${pid}/workspace`, { roots: [work] });
  const cardA = (await call("POST", `/v1/projects/${pid}/cards`, { title: "A — before any label", todo: "TEST-110 joint", anchor: { key: STEP }, assigneeId: worker.id })).j;
  note("AC-4 card A cut with no label", cardA.anchorLabel === null && cardA.anchor?.version === 0, JSON.stringify({ anchor: cardA.anchor, anchorLabel: cardA.anchorLabel }));

  // ---------------- AC-1: an edit, no label, poll only (push off) ----------------
  await net("push-off");
  let e = await edit(p1, STEP, "เช็คสถานะทั้ง 4 บริการ (แก้ครั้งที่ 1)"); let te = Date.now();
  let w = await until("CAW shows card A changed + the part reader shows the new text", 40, async () => (await call("GET", `/v1/cards/${cardA.id}`)).j.specChangedVersion !== null && JSON.stringify((await call("GET", `/v1/projects/${pid}/parts/${STEP}`)).j).includes("แก้ครั้งที่ 1"));
  note("AC-1 (poll only) an edit in Blueprint, no label → CAW flags the card and the part reader shows the new text within 30 s", w >= 0 && w <= 30, `edit ${e.status}; after ${w}s`);
  // with the push on
  await net("push-on");
  const cardA2 = (await call("POST", `/v1/projects/${pid}/cards`, { title: "A2 — push", todo: "TEST-110 joint", anchor: { key: SCR }, assigneeId: worker.id })).j;
  e = await edit(p1, SCR, "หน้า Health Board (แก้ครั้งที่ 2)"); te = Date.now();
  w = await until("push path", 40, async () => (await call("GET", `/v1/cards/${cardA2.id}`)).j.specChangedVersion !== null);
  const pushed = readFileSync(NETLOG, "utf8").split("\n").filter((l) => l.includes("push RELAYED")).length;
  note("AC-1 (push on) the same, through Blueprint's spec.changed push", w >= 0 && w <= 30 && pushed > 0, `after ${w}s; pushes relayed ${pushed}`);
  const b1 = await shot(`${CAWWEB}/p/${pid}`, "ac1-board");
  note("AC-1 the board shows the cards as changed", b1.text.includes("spec เปลี่ยน"), "");

  // ---------------- AC-4: labels v1, v2 ----------------
  const l1 = await label(p1, "v1");
  w = await until("v1 in CAW", 40, async () => (await call("GET", `/v1/projects/${pid}`)).j.latestLabel?.label === "v1");
  note("AC-4 Blueprint's label v1 reaches CAW", l1.status === 201 && w >= 0, `label ${l1.status}; after ${w}s`);
  const cardB = (await call("POST", `/v1/projects/${pid}/cards`, { title: "B — cut at v1", todo: "TEST-110 joint", anchor: { key: STEP }, assigneeId: worker.id })).j;
  await label(p1, "v2");
  w = await until("v2 in CAW", 40, async () => (await call("GET", `/v1/projects/${pid}`)).j.latestLabel?.label === "v2");
  const bB = (await call("GET", `/v1/cards/${cardB.id}`)).j;
  note("AC-4 project shows v2, card B keeps v1", w >= 0 && bB.anchorLabel === "v1", `after ${w}s; B ${bB.anchorLabel}`);
  const h = await shot(`${CAWWEB}/p/${pid}`, "ac4-board"); const cA = await shot(`${CAWWEB}/p/${pid}/c/${cardA.id}`, "ac4-card-a"); const cB = await shot(`${CAWWEB}/p/${pid}/c/${cardB.id}`, "ac4-card-b");
  note("AC-4 header ป้าย v2 · card A ตัดงานก่อนมีป้าย · card B ตัดงานที่ป้าย v1 · content = latest", h.text.includes("ป้าย v2") && cA.text.includes("ตัดงานก่อนมีป้าย") && cB.text.includes("ตัดงานที่ป้าย v1") && cB.text.includes("แก้ครั้งที่ 1"), "");

  // ---------------- AC-2: a hop keeps its start text ----------------
  runner = spawn([process.execPath, "--no-env-file", "run", "src/runner/main.ts"], BACK, { CAW_API_URL: API, CAW_WORKSPACE_ROOT: RUN, RUNNER_POLL_MS: "300", RUNNER_HOP_MAX_MS: "120000", CLAUDE_BIN: stub }, "runner");
  await until("runner running", 30, async () => !!(await call("GET", "/v1/team-status")).j?.running);
  writeFileSync(modeFile, "pin"); rmSync(`${modeFile}.started`, { force: true }); rmSync(`${modeFile}.go`, { force: true });
  const hop1 = await call("POST", `/v1/projects/${pid}/hops`, { cardId: cardB.id, workerId: worker.id });
  await until("hop 1 read", 60, async () => existsSync(`${modeFile}.started`));
  await edit(p1, STEP, "เช็คสถานะทั้ง 4 บริการ (แก้กลางก้าว)");
  await until("operator sees the mid-hop edit", 40, async () => JSON.stringify((await call("GET", `/v1/cards/${cardB.id}/context`)).j).includes("แก้กลางก้าว"));
  writeFileSync(`${modeFile}.go`, "go");
  const hopDone = async (id: string) => until(`hop ${id}`, 90, async () => !!(await call("GET", `/v1/projects/${pid}/hops`)).j.hops.find((x: any) => x.id === id)?.endedAt);
  await hopDone(hop1.j.id); writeFileSync(modeFile, "read");
  const hop2 = await call("POST", `/v1/projects/${pid}/hops`, { cardId: cardB.id, workerId: worker.id }); await hopDone(hop2.j.id); await sleep(800);
  const said = JSON.stringify((await call("GET", `/v1/cards/${cardB.id}/context`)).j).match(/TEST-110 (start|mid)-read \(hop [^)]+\): [^"\\]+/g) ?? []; save("ac2-worker-reads.txt", said.join("\n"));
  const of = (k: string, id: string) => said.find((s) => s.includes(`${k}-read (hop ${id})`)) ?? "";
  note("AC-2 hop 1 reads its start text before AND after the mid-hop edit", of("start", hop1.j.id).includes("แก้ครั้งที่ 1") && of("mid", hop1.j.id).includes("แก้ครั้งที่ 1") && !of("mid", hop1.j.id).includes("แก้กลางก้าว"), `${of("start", hop1.j.id)} | ${of("mid", hop1.j.id)}`);
  note("AC-2 hop 2 reads the new text", of("start", hop2.j.id).includes("แก้กลางก้าว"), of("start", hop2.j.id));

  // ---------------- AC-5: Blueprint unreachable 60 s (QA's net down; blueprint-back keeps its data) ----------------
  const revBefore = (await call("GET", `/v1/projects/${pid}`)).j.spec?.revision;
  await net("down"); const down = Date.now();
  w = await until("CAW notices", 40, async () => (await call("GET", `/v1/projects/${pid}`)).j.spec?.reachable === false);
  const cD = await call("GET", `/v1/cards/${cardA.id}/context`);
  note("AC-5 CAW shows unreachable and serves the last read", w >= 0 && cD.status === 200 && cD.j.specRead?.fromCache === true, `after ${w}s; context ${cD.status} ${JSON.stringify(cD.j.specRead)}`);
  const hop3 = await call("POST", `/v1/projects/${pid}/hops`, { cardId: cardA.id, workerId: worker.id }); await hopDone(hop3.j.id); await sleep(800);
  const s3 = (JSON.stringify((await call("GET", `/v1/cards/${cardA.id}/context`)).j).match(/TEST-110 start-read \(hop [^)]+\): [^"\\]+/g) ?? []).find((s) => s.includes(hop3.j.id)) ?? "";
  note("AC-5 a hop started while unreachable works on the last read", s3.includes("fromCache=true") && s3.includes(" 200 "), s3 || "no worker read");
  const bD = await shot(`${CAWWEB}/p/${pid}`, "ac5-board-down");
  note("AC-5 the board says so (PM's sentence)", bD.text.includes(UNREACH), "");
  await edit(p1, STEP, "เช็คสถานะทั้ง 4 บริการ (แก้ตอน CAW มองไม่เห็น)"); // saved in Blueprint while CAW cannot see it
  const left = 60_000 - (Date.now() - down); if (left > 0) await sleep(left);
  await net("up"); info(`net down for ${((Date.now() - down) / 1000).toFixed(0)}s`);
  w = await until("CAW catches up", 40, async () => (await call("GET", `/v1/projects/${pid}`)).j.spec?.reachable === true && JSON.stringify((await call("GET", `/v1/cards/${cardA.id}/context`)).j).includes("แก้ตอน CAW มองไม่เห็น"));
  const firstAfter = readFileSync(NETLOG, "utf8").split("\n").find((l) => l.includes(`bp GET /v1/projects/${p1}/spec/changes`) && new Date(l.split(" ")[0]!).getTime() > down + 60_000 - 2000);
  note("AC-5 back: CAW catches up with the edit made while it could not see, without a restart", w >= 0, `after ${w}s; first pull ${firstAfter?.split(" ").slice(2).join(" ")} (CAW's last revision before: ${revBefore})`);
  const bU = await shot(`${CAWWEB}/p/${pid}`, "ac5-board-back");
  note("AC-5 the sentence is gone", !bU.text.includes(UNREACH), "");

  // ---------------- Q6: an old label with no name (QA's proxy rewrites latestLabel.label → null; Blueprint can no longer make one) ----------------
  const p3 = (await bp("POST", "/v1/projects", { name: "TEST-110 joint old label", theme: "clean-blue" })).j.id;
  const s3seed = await bp("POST", `/v1/projects/${p3}/change-sets`, { cause: { kind: "operator" }, changes: [{ op: "part.add", ref: "$w", kind: "work", title: "งานเก่า", body: { goal: "Q6" }, origin: { stamp: "operator", date: "2026-10-30", note: "TEST-110 Q6 seed" } }] });
  const s3k = s3seed.j.keys?.["$w"];
  await label(p3, "ชื่อที่จะถูกลบ"); await label(p3, "ชื่อที่จะถูกลบ 2"); // version 2
  await net("nameless-on");
  const pr3 = await call("POST", "/v1/projects", { blueprintProjectId: p3 }); const pid3 = pr3.j.id;
  note("Q6 CAW takes a nameless label (version 2, label null) without error", pr3.status === 201 && pr3.j.latestLabel?.version === 2 && pr3.j.latestLabel?.label === null, `${pr3.status} latestLabel ${JSON.stringify(pr3.j.latestLabel)}`);
  await call("POST", `/v1/projects/${pid3}/chain/members`, { workerId: worker.id });
  const c3 = await call("POST", `/v1/projects/${pid3}/cards`, { title: "Q6 card", todo: "TEST-110 Q6", anchor: { key: s3k }, assigneeId: worker.id }); const card3 = c3.j;
  note("Q6 a card cut while the label has no name: anchor.version 2, anchorLabel null", c3.status === 201 && card3.anchor?.version === 2 && card3.anchorLabel === null, `${c3.status} ${JSON.stringify({ anchor: card3.anchor, anchorLabel: card3.anchorLabel })}`);
  const q6h = await shot(`${CAWWEB}/p/${pid3}`, "q6-board"); const q6l = await shot(`${CAWWEB}/`, "q6-list"); const q6c = await shot(`${CAWWEB}/p/${pid3}/c/${card3.id}`, "q6-card");
  note("Q6 header shows ป้าย 2, never \"ป้าย null\" (painted text)", q6h.seen.includes("ป้าย 2") && !q6h.seen.includes("null"), JSON.stringify(q6h.seen.match(/ป้าย [^\s]{0,12}/g)?.slice(0, 3)));
  note("Q6 projects list chip shows ป้าย 2 for it, no \"null\" painted on the list", q6l.seen.includes("ป้าย 2") && !q6l.seen.includes("null"), "");
  note("Q6 its card page: ตัดงานที่ป้าย 2, no null painted", q6c.seen.includes("ตัดงานที่ป้าย 2") && !q6c.seen.includes("null"), JSON.stringify(q6c.seen.match(/ตัดงาน[^\n]{0,20}/)?.[0]));
  await net("nameless-off");

  // ---------------- AC-6 ----------------
  const v1calls = readFileSync(NETLOG, "utf8").split("\n").filter((l) => / bp (GET|POST) /.test(l) && /\/versions|\/v1\/projects\/[^/]+\/locate|\/versions\/\d+\/parts/.test(l));
  note("AC-6 / D1: CAW called no v1 versions / locate / versioned context on the real Blueprint", v1calls.length === 0, `${v1calls.length} ${v1calls.slice(0, 2).join(" | ")}`);
  const rb = await call("POST", `/v1/projects/${pid}/rebuild-check`);
  note("AC-6 rebuild-check same", rb.j?.same === true, JSON.stringify(rb.j).slice(0, 100));
  const v1 = await bp("GET", `/v1/projects/${p1}/versions?after=0`);
  note("AC-6 Blueprint's v1 feed still answers (unchanged route)", v1.status === 200 && Array.isArray(v1.j.versions) && v1.j.versions.length === 2, `${v1.status} versions ${v1.j.versions?.length}`);
  save("final-cards.json", (await call("GET", `/v1/projects/${pid}/cards`)).j);
} catch (err) { console.log("ERROR", (err as Error).stack); }
finally { await browser.close(); for (const p of [runner, ...procs]) p?.kill(); await sleep(1000); console.log(`run dir ${RUN}`); }
function ignoreUnused(_: unknown) {}
