// TEST-102's stub cases: the real front build, the real back and a local stub gateway, on the tester's own database.
// Proves: app and back behaviour on each outcome, at phone width, in headless desktop Chrome, through a recording proxy.
// Does NOT prove: real AI results (the stub's turns are fixed and ignore the audio), Android, a finger, a real mic.
//
// Run from a folder with no .env:
//   node local-test102-stub.mjs --root <folder with back/ front/ gw/ fx/ storage/ shots/> --env <call-scribe-qa-env> \
//     --req <REQ-101 file> --out <results.json> --watch <q11-watch.ts> --watch-out <file.jsonl> [--only 1.1,1.2] [--group files]
//     [--case-limit 300] seconds per case  [--keep-watch] the watch outlives the run; stop it by the pid printed
// Proving the harness itself, never for a result: --plant-hang --plant-gap --plant-clean add cases that must be caught.
// A case hit by a box pause is not judged: it reads PAUSE and runs once more at the end.
// Starts and stops everything itself, on 3120 front, 3121 back, 3122 gateway, 3123 proxy. Refuses a taken port, and any
// database not named call_scribe_test. Never prints the database URL, the password or a cookie.
import { spawn, spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, openSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { randomBytes, randomUUID } from "node:crypto";
import { isAbsolute, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); if (i >= 0) return process.argv[i + 1]; if (d === undefined) throw new Error(`missing --${n}`); return d; };
const root = resolve(arg("root"));
const envFile = resolve(arg("env"));
const reqText = readFileSync(resolve(arg("req")), "utf8");
const outFile = resolve(arg("out"));
const only = arg("only", "").split(",").filter(Boolean);
const groupFilter = arg("group", "").split(",").filter(Boolean);
const caseLimitMs = Number(arg("case-limit", "300")) * 1000;
const flag = (n) => process.argv.includes(`--${n}`);
const FX = join(root, "fx"), STORAGE = join(root, "storage"), SHOTS = join(root, "shots"), LOGS = join(root, "logs");
mkdirSync(LOGS, { recursive: true });
const FRONT = "http://localhost:3120", BACK = "http://localhost:3121", GW = "http://127.0.0.1:3122";
const BUN = spawnSync("bun", ["-e", "console.log(process.execPath)"], { encoding: "utf8" }).stdout.trim();
const DB_URL = readFileSync(envFile, "utf8").match(/^DATABASE_URL=(.+)$/m)[1].trim().replace(/^["']|["']$/g, "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const { chromium } = await import(pathToFileURL(join(root, "front/node_modules/playwright/index.mjs")).href);

// Expected strings come from the REQ's table, never from the app. A string not in the REQ stops the run.
const S = {
  sending: "กำลังส่งไฟล์ อย่าเพิ่งปิดแอป", sent: "ส่งไฟล์แล้ว กำลังถอดเสียงและสรุป ปิดแอปได้ เดี๋ยวกลับมาดูผลทีหลัง",
  unsupported: "แอปเปิดไฟล์นี้ไม่ได้ ยังไม่ได้เก็บอะไรไว้ ลองเลือกไฟล์อื่น",
  micRefused: "แอปใช้ไมค์ไม่ได้ ยังไม่ได้อัดอะไร กรุณาอนุญาตไมค์ในการตั้งค่าของมือถือ หรือเลือกไฟล์แทน",
  sendFailed: "ส่งไฟล์ไม่สำเร็จ ไฟล์ในเครื่องยังอยู่ กดลองใหม่ได้เลย", cutOff: "การอัดหยุดกลางคัน เก็บเสียงเท่าที่อัดได้ไว้แล้ว",
  transFailed: "ถอดเสียงไม่สำเร็จ แต่ไฟล์เสียงยังอยู่ กดลองใหม่ได้เลย", sumFailed: "ถอดเสียงเสร็จแล้ว แต่สรุปไม่สำเร็จ กดลองสรุปใหม่ได้เลย",
  tooLarge: "ไฟล์นี้ใหญ่เกินไป ยังไม่ได้เก็บอะไรไว้ ลองไฟล์ที่สั้นลง",
  refused: "ถอดเสียงไฟล์นี้ไม่ได้ ไฟล์อาจเสีย ไฟล์เสียงยังอยู่ ลองเลือกไฟล์อื่นได้", outCut: "สายนี้ยาวเกินกว่าจะถอดได้ครบ ไฟล์เสียงยังอยู่ แต่ยังไม่มีผลให้ดู",
  busy: "ตอนนี้ยังถอดเสียงไม่ได้ ไฟล์เสียงยังอยู่ ลองใหม่อีกสักครู่", noSpeech: "ไม่พบเสียงพูดในไฟล์นี้",
  confirm: "ลบเสียงและผลของรายการนี้เลยไหม ลบแล้วเอาคืนไม่ได้", sumCut: "ถอดเสียงเสร็จแล้ว แต่สรุปยาวเกินจนได้ไม่ครบ จึงยังไม่มีสรุปให้ดู",
  wrongPw: "รหัสผ่านไม่ถูกต้อง ลองใหม่อีกครั้ง", tooMany: "ใส่รหัสผิดหลายครั้ง รอ 15 นาทีแล้วลองใหม่", noMic: "ไม่พบไมค์ในเครื่อง ยังไม่ได้อัดอะไร เลือกไฟล์แทนได้",
  sendKept: "ส่งเสียงที่อัดได้", empty: "ยังไม่มีเสียงที่บันทึกไว้", record: "อัดเสียง", pick: "เลือกไฟล์", stop: "หยุดอัด", retry: "ลองใหม่", login: "เข้าสู่ระบบ", logout: "ออกจากระบบ",
  speaker1: "ผู้พูด 1", speaker2: "ผู้พูด 2", conversation: "บทสนทนา", summary: "สรุป",
};
for (const [k, v] of Object.entries(S)) if (!reqText.includes(v)) throw new Error(`expected string ${k} is not in the REQ`);
const reached = new Set();

// --- processes ----------------------------------------------------------------------------------------------------
const procs = {};
function start(name, cmd, args, cwd, env) {
  const fd = openSync(join(LOGS, `${name}.log`), "a");
  const detached = name === "watch" && flag("keep-watch");
  procs[name] = spawn(cmd, args, { cwd, detached, env: { PATH: process.env.PATH, HOME: process.env.HOME, ...env }, stdio: ["ignore", fd, fd] });
  if (detached) procs[name].unref();
}
async function stop(name) {
  const p = procs[name];
  if (!p || p.exitCode !== null) return;
  const done = new Promise((r) => p.once("exit", r));
  p.kill();
  await Promise.race([done, sleep(5000)]);
  if (p.exitCode === null && p.signalCode === null) { p.kill("SIGKILL"); await done; }
  delete procs[name];
}
const up = (url) => fetch(url, { signal: AbortSignal.timeout(2000) }).then(() => true, () => false);
async function waitUp(url) { for (let i = 0; i < 120; i++) { if (await up(url)) return; await sleep(250); } throw new Error(`no answer: ${url}`); }

const password = randomBytes(24).toString("base64url");
const passwordHash = spawnSync(BUN, ["-e", "console.log(await Bun.password.hash(process.env.P))"], { env: { ...process.env, P: password }, encoding: "utf8" }).stdout.trim();
const backEnv = (extra = {}) => ({ DATABASE_URL: DB_URL, PORT: "3121", HOST: "127.0.0.1", FRONT_ORIGIN: FRONT, COOKIE_SECURE: "false", OWNER_PASSWORD_HASH: passwordHash, STORAGE_DIR: STORAGE, LLM_GATEWAY_URL: "http://127.0.0.1:3123", LLM_GATEWAY_KEY: "qa-local-stub-key-not-real", ...extra });
async function startBack(extra) { await stop("back"); start("back", BUN, ["src/index.ts"], join(root, "back"), backEnv(extra)); await waitUp(`${BACK}/health`); }
let gwMode = null;
async function startGw(mode = "ok", delay = 300, extra = {}) {
  const key = JSON.stringify([mode, delay, extra]);
  if (gwMode === key && procs.gw) return;
  await stop("gw");
  start("gw", BUN, ["src/index.ts"], join(root, "gw"), { AUTH_ENABLED: "false", PORT: "3122", AUDIO_TRANSCRIBE_PROVIDER: "stub", AUDIO_SUMMARY_PROVIDER: "stub", AUDIO_STUB_MODE: mode, AUDIO_STUB_DELAY_MS: String(delay), ...extra });
  await waitUp(`${GW}/`);
  gwMode = key;
}
async function stopGw() { await stop("gw"); gwMode = null; }

// --- proxy: records what the back sends the gateway; can answer in the stub's place ---------------------------------
const proxy = { log: [], inject: null, jobs: {}, lastAudio: null };
const proxyServer = createServer(async (req, res) => {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = Buffer.concat(chunks);
  const kind = req.url.includes("/audio/transcriptions") ? "transcribe" : req.url.includes("/audio/summaries") ? "summary" : "poll";
  const jobId = kind === "poll" ? req.url.split("/").pop() : null;
  const entry = { t: Date.now(), method: req.method, kind, jobKind: jobId ? proxy.jobs[jobId] : null, bytes: body.length };
  proxy.log.push(entry);
  if (kind === "transcribe") proxy.lastAudio = body;
  const ans = proxy.inject?.(entry);
  if (ans) { entry.injected = ans.status; res.writeHead(ans.status, { "content-type": "application/json" }); return res.end(JSON.stringify(ans.json ?? {})); }
  try {
    const r = await fetch(GW + req.url, { method: req.method, headers: { ...(req.headers["content-type"] ? { "content-type": req.headers["content-type"] } : {}), authorization: req.headers.authorization ?? "" }, body: req.method === "GET" ? undefined : body });
    const text = await r.text();
    entry.status = r.status;
    if (kind !== "poll") { try { const id = JSON.parse(text)?.data?.job_id; if (id) proxy.jobs[id] = kind; } catch {} }
    res.writeHead(r.status, { "content-type": r.headers.get("content-type") ?? "application/json" });
    res.end(text);
  } catch { entry.status = "unreachable"; res.socket.destroy(); }
});
const count = (k) => proxy.log.filter((e) => e.kind === k && e.method === "POST").length;

// --- back helpers --------------------------------------------------------------------------------------------------
let cookie = "";
async function apiLogin() {
  const r = await fetch(`${BACK}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) });
  if (r.status !== 204) throw new Error(`login ${r.status}`);
  cookie = r.headers.get("set-cookie").split(";")[0];
}
// Anything slow or failing at the back, whoever asked, with the box's own clock: a stall and a box freeze look alike.
const backEvents = [];
const uptime = () => Math.round(Number(readFileSync("/proc/uptime", "utf8").split(" ")[0]));
function noteBack(by, method, path, ms, status) {
  if (ms > 8000 || (typeof status !== "number") || status >= 500) backEvents.push({ t: new Date().toISOString(), up: uptime(), by, method, path: path.replace(/[0-9a-f-]{36}/g, ":id"), ms, status });
}
const api = async (p, init = {}) => {
  const a = Date.now();
  try {
    const r = await fetch(BACK + p, { ...init, headers: { cookie, ...(init.headers ?? {}) } });
    noteBack("api", init.method ?? "GET", p, Date.now() - a, r.status);
    return r;
  } catch (e) { noteBack("api", init.method ?? "GET", p, Date.now() - a, e.name); throw e; }
};
let plantListFailures = 0;
const list = async () => {
  if (plantListFailures > 0) { plantListFailures--; throw new Error("planted 500"); }
  const r = await api("/api/recordings");
  if (r.status !== 200) throw new Error(`list answered ${r.status}`);
  return (await r.json()).recordings;
};
const rec = async (id) => { const r = await api(`/api/recordings/${id}`); return r.status === 200 ? r.json() : { httpStatus: r.status }; };
const TERMINAL = ["done", "no_speech", "transcription_failed", "summary_failed"];
async function waitStatus(id, want = TERMINAL, ms = 90000) {
  const end = Date.now() + ms;
  for (;;) { const r = await rec(id); if (want.includes(r.status)) return r; if (Date.now() > end) throw new Error(`recording stayed ${r.status ?? r.httpStatus}, waited for ${want}`); await sleep(300); }
}
async function apiUpload(file, name = "QA-api.mp3") {
  const buf = readFileSync(join(FX, file));
  const c = await api("/api/recordings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ clientId: randomUUID(), fileName: name, sizeBytes: buf.length, source: "file" }) });
  const { id, chunkSizeBytes } = await c.json();
  for (let i = 0; i * chunkSizeBytes < buf.length; i++) await api(`/api/recordings/${id}/chunks/${i}`, { method: "PUT", headers: { "content-type": "application/octet-stream" }, body: buf.subarray(i * chunkSizeBytes, (i + 1) * chunkSizeBytes) });
  const done = await api(`/api/recordings/${id}/complete`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
  return { id, status: done.status };
}
function dbRows() {
  const script = 'const s=new Bun.SQL(process.env.U,{max:1});const r=await s`SELECT (SELECT current_database()) d,(SELECT count(*)::int FROM recordings) n,(SELECT count(*)::int FROM recordings WHERE status=\'uploading\') up`;console.log(JSON.stringify(r[0]));await s.close();';
  const out = spawnSync(BUN, ["-e", script], { cwd: root, env: { PATH: process.env.PATH, HOME: process.env.HOME, U: DB_URL }, encoding: "utf8" });
  return JSON.parse(out.stdout.trim());
}
const folders = () => (existsSync(STORAGE) ? readdirSync(STORAGE) : []);
const filesOf = (id) => { const d = join(STORAGE, id); return existsSync(d) ? readdirSync(d) : []; };
function probe(path) {
  const o = spawnSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type,codec_name,sample_rate,channels:format=duration", "-of", "json", path], { encoding: "utf8" });
  try { return JSON.parse(o.stdout); } catch { return { streams: [] }; }
}
const stored = (id) => probe(join(STORAGE, id, "audio.m4a"));
// Survives a 500 or a refused request, and says so if it never could: a case must not start on someone's leftovers.
async function cleanAll() {
  proxy.inject = null;
  let last;
  for (let i = 0; i < 6; i++) {
    try {
      for (const r of await list()) await api(`/api/recordings/${r.id}`, { method: "DELETE" });
      return;
    } catch (e) { last = e; await sleep(3000); }
  }
  throw new Error(`clean-up could not reach the back: ${last?.message}`);
}

// --- browser helpers -----------------------------------------------------------------------------------------------
const TRACK = () => {
  window.__phases = [];
  window.__texts = new Set();
  window.__dialogs = 0;
  // Playwright gives null for Blob request bodies, so read what the page really hands to fetch.
  window.__puts = {};
  const realFetch = window.fetch.bind(window);
  window.fetch = (u, i) => { if (i?.method === "PUT" && i.body) window.__puts[String(u).split("/").pop()] = i.body; return realFetch(u, i); };
  new MutationObserver(() => {
    const el = document.querySelector("[data-testid=send-status]");
    const p = el?.getAttribute("data-phase");
    if (p && window.__phases.at(-1) !== p) window.__phases.push(p);
    document.querySelectorAll("[role=alert],[role=status]").forEach((a) => a.textContent && window.__texts.add(a.textContent.trim()));
  }).observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
};
let browser;
// Everything a case opens, closed when it ends however it ends. Round 1 left a Chrome open after every error.
const live = new Set();
async function closeLive() { for (const x of live) await Promise.race([x.close().catch(() => {}), sleep(5000)]); live.clear(); }
// What left the page, by piece index, as one Buffer; each piece counted once however many tries it took.
async function readPuts(page) {
  const b64 = await page.evaluate(async () => {
    const keys = Object.keys(window.__puts).sort((a, b) => Number(a) - Number(b));
    const blob = new Blob(keys.map((k) => window.__puts[k]));
    return await new Promise((res) => { const f = new FileReader(); f.onload = () => res(String(f.result).split(",")[1] ?? ""); f.readAsDataURL(blob); });
  });
  return Buffer.from(b64, "base64");
}
async function newPage({ b = browser, width = 390, logged = true } = {}) {
  const ctx = await b.newContext({ viewport: { width, height: 844 }, locale: "th-TH" });
  live.add(ctx);
  await ctx.addInitScript(TRACK);
  if (logged) await ctx.addCookies([{ name: "cs_session", value: cookie.split("=")[1], domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" }]);
  const page = await ctx.newPage();
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(e.name));
  const began = new Map();
  page.on("request", (q) => { if (q.url().startsWith(BACK)) began.set(q, Date.now()); });
  const ended = (q, status) => { const a = began.get(q); if (a) noteBack("page", q.method(), new URL(q.url()).pathname, Date.now() - a, status); };
  page.on("requestfinished", async (q) => ended(q, (await q.response().catch(() => null))?.status() ?? "none"));
  page.on("requestfailed", (q) => ended(q, q.failure()?.errorText ?? "failed"));
  await page.goto(FRONT);
  return { ctx, page };
}
const fxPath = (f) => (isAbsolute(f) ? f : join(FX, f));
const pick = (page, file) => page.setInputFiles("[data-testid=file-input]", typeof file === "string" ? fxPath(file) : file);
const phaseOf = (page) => page.locator("[data-testid=send-status]").getAttribute("data-phase");
async function waitPhase(page, want, ms = 60000) { await page.locator(`[data-testid=send-status][data-phase=${want}]`).waitFor({ timeout: ms }); }
const statusText = (page) => page.locator("[data-testid=send-status] p").innerText();
const shot = (page, name) => page.screenshot({ path: join(SHOTS, `${name}.png`) });
const seen = (...keys) => keys.forEach((k) => reached.add(k));
const openId = (page, id) => page.goto(`${FRONT}/#r=${id}`);
const failureText = (page) => page.locator("[data-testid=result-failure] p").innerText({ timeout: 15000 });
const newestId = async () => (await list())[0]?.id;

// --- cases ---------------------------------------------------------------------------------------------------------
const results = [];
const cases = [];
const c = (group, id, title, fn) => cases.push({ group, id, title, fn });
function checker() {
  const notes = [], fails = [];
  return { notes, fails, ok: (cond, msg) => { (cond ? notes : fails).push(msg); return cond; }, note: (m) => notes.push(m) };
}
function saveResults() { writeFileSync(outFile, JSON.stringify({ reached: [...reached], unreached: Object.keys(S).filter((k) => !reached.has(k)), backEvents, pauses: typeof pauses === "undefined" ? [] : pauses, results }, null, 1)); }

const AAC = (p) => { const a = p.streams?.find((s) => s.codec_type === "audio"); return a?.codec_name === "aac" && a?.sample_rate === "16000" && a?.channels === 1; };
const hasVideo = (p) => (p.streams ?? []).some((s) => s.codec_type === "video");

async function throughApp(t, file, label, { expectName } = {}) {
  await startGw("ok");
  const { ctx, page } = await newPage();
  await pick(page, file);
  await waitPhase(page, "sent");
  const phases = await page.evaluate(() => window.__phases);
  t.ok(phases.includes("sending"), `${label}: showed sending (phases ${phases.join(">")})`);
  t.ok((await statusText(page)) === S.sent, `${label}: "after sending" text exact`);
  seen("sending", "sent", "pick", "record");
  const id = await newestId();
  const r = await waitStatus(id);
  t.ok(r.status === "done", `${label}: ended ${r.status}`);
  t.ok(AAC(stored(id)), `${label}: stored file AAC 16 kHz mono`);
  if (expectName) t.ok(r.fileName === expectName, `${label}: name stored as ${r.fileName}`);
  await ctx.close();
  return { id, r };
}

// ---- files
for (const [n, f] of [["m4a", "ok-en.m4a"], ["mp3", "ok-en.mp3"], ["wav", "ok-en-two-voices.wav"], ["opus", "ok-en.opus"], ["webm", "ok-en.webm"], ["flac", "ok-en.flac"], ["ogg", "ok-en.ogg"]]) {
  c("files", `1.1-${n}`, `AC-1 format ${n}`, async (t) => { await throughApp(t, f, n); });
}
c("files", "1.2", "AC-1 both actions reachable at 390 and 360", async (t) => {
  for (const width of [390, 360]) {
    const { ctx, page } = await newPage({ width });
    await page.getByRole("button", { name: S.pick }).waitFor();
    const m = await page.evaluate(([rec, pick]) => {
      const out = { docW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth, hits: [] };
      for (const name of [rec, pick]) {
        const el = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === name);
        const r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        out.hits.push({ name, w: Math.round(r.width), h: Math.round(r.height), hit: hit === el || el.contains(hit) });
      }
      return out;
    }, [S.record, S.pick]);
    t.ok(m.docW === m.clientW, `${width}px: no sideways scroll (${m.docW}/${m.clientW})`);
    for (const h of m.hits) t.ok(h.hit && h.h >= 44, `${width}px: ${h.name} is hit at its centre, ${h.w}x${h.h}`);
    await shot(page, `1.2-home-${width}`);
    await ctx.close();
  }
});
c("files", "1.3", "AC-1 no extension", async (t) => { await throughApp(t, "ok-en-no-extension", "no extension"); });
c("files", "1.4", "AC-1 Thai file name", async (t) => {
  const name = "ไฟล์ทดสอบ ชื่อไทย มีวรรค (1).mp3";
  await throughApp(t, name, "thai", { expectName: name });
  const { ctx, page } = await newPage();
  t.ok((await page.locator("[data-testid=recording-name]").first().innerText()) === name, "name shows correctly in the list");
  await shot(page, "1.4-thai-name");
  await ctx.close();
});
c("files", "1.5", "AC-1 double tap on the button", async (t) => {
  // There is no send button: a pick sends at once. So the real double tap is on เลือกไฟล์, and again while sending.
  await startGw("ok");
  const { ctx, page } = await newPage();
  const posts = [], choosers = [];
  page.on("request", (q) => { if (q.method() === "POST" && q.url().endsWith("/api/recordings")) posts.push(1); });
  page.on("filechooser", (c) => choosers.push(c));
  await page.route("**/chunks/*", async (route) => { await sleep(2500); await route.continue().catch(() => {}); });
  const btn = page.getByRole("button", { name: S.pick, exact: true });
  await btn.dblclick();
  for (let i = 0; i < 40 && !choosers.length; i++) await sleep(100);
  await choosers[0].setFiles(join(FX, "ok-en.mp3"));
  await waitPhase(page, "sending");
  t.ok(await btn.isDisabled(), "while sending, the button is disabled");
  await btn.click({ force: true, timeout: 2000 }).catch(() => {});
  await waitPhase(page, "sent");
  const rows = await list();
  const r = await waitStatus(rows[0].id);
  await sleep(6000);
  t.note(`choosers opened by the double tap: ${choosers.length}`);
  t.ok(posts.length === 1 && rows.length === 1 && count("transcribe") === 1, `one recording, one job (creates ${posts.length}, rows ${rows.length}, jobs ${count("transcribe")}), ended ${r.status}`);
  await ctx.close();
});
c("files", "1.6", "Decodable, on no list", async (t) => { await throughApp(t, "ok-en-unlisted.wma", "wma"); });
c("files", "21.1", "AC-21 video, browser strip", async (t) => {
  await startGw("ok");
  const { ctx, page } = await newPage();
  await pick(page, "ok-en-screen.mp4");
  await waitPhase(page, "sent");
  const left = await readPuts(page);
  const f = join(root, "left-page.bin");
  writeFileSync(f, left);
  const p = probe(f);
  t.ok(!hasVideo(p) && p.streams.length > 0, `what left the page has no video stream (${p.streams.map((s) => s.codec_type).join(",")}, ${left.length} B of ${statSync(join(FX, "ok-en-screen.mp4")).size} B picked)`);
  const id = await newestId();
  const r = await waitStatus(id);
  t.ok(r.status === "done", `ended ${r.status}`);
  t.ok(filesOf(id).join() === "audio.m4a" && !hasVideo(stored(id)), `kept only ${filesOf(id).join()}`);
  rmSync(f);
  await ctx.close();
});
c("files", "21.2", "AC-21 back as fallback; 21.3 no picture kept", async (t) => {
  await startGw("ok");
  const { ctx, page } = await newPage();
  await page.evaluate(() => localStorage.setItem("cs_strip_in_progress", "1"));
  await pick(page, "ok-en-screen.mp4");
  await waitPhase(page, "sent");
  const sent = (await readPuts(page)).length;
  t.ok(sent === statSync(join(FX, "ok-en-screen.mp4")).size, `the original was sent, ${sent} B`);
  const id = await newestId();
  const r = await waitStatus(id);
  t.ok(r.status === "done", `ended ${r.status}`);
  t.ok(filesOf(id).join() === "audio.m4a", `kept only ${filesOf(id).join()}`);
  t.ok(!hasVideo(stored(id)), "stored file has no video");
  const b = proxy.lastAudio;
  const i = b.indexOf("\r\n\r\n") + 4, j = b.lastIndexOf(Buffer.from("\r\n--"));
  const f = join(root, "at-proxy.bin");
  writeFileSync(f, b.subarray(i, j));
  t.ok(!hasVideo(probe(f)) && probe(f).streams.length === 1, "what reached the gateway is audio only");
  rmSync(f);
  await ctx.close();
});
c("files", "21.4", "Video with no sound, both paths", async (t) => {
  for (const flag of [false, true]) {
    const { ctx, page } = await newPage();
    if (flag) await page.evaluate(() => localStorage.setItem("cs_strip_in_progress", "1"));
    const before = dbRows().n, fBefore = folders().length;
    await pick(page, "bad-video-no-sound.mp4");
    await waitPhase(page, "unsupported");
    t.ok((await statusText(page)) === S.unsupported, `${flag ? "fallback" : "strip"}: unsupported message`);
    t.ok(dbRows().n === before && folders().length === fBefore, `${flag ? "fallback" : "strip"}: nothing kept`);
    await ctx.close();
  }
  seen("unsupported");
});

// ---- refusals
for (const [id, title, files] of [["6.1", "text named .mp3", ["bad-text-as.mp3"]], ["6.2", "0 bytes", ["bad-zero.mp3", "bad-zero.m4a"]], ["6.3", "corrupt", ["bad-random.m4a", "bad-cut-header.m4a", "bad-midfile-corrupt.mp3"]], ["6.4", "picture named .mp3", ["bad-image-as.mp3"]], ["6.6", "plain .txt", ["bad-plain.txt"]]]) {
  c("refuse", id, `AC-6 ${title}`, async (t) => {
    await startGw("ok");
    const { ctx, page } = await newPage();
    await page.getByText(S.empty).waitFor();
    for (const f of files) {
      const before = dbRows(), fBefore = folders().length;
      proxy.log = [];
      await pick(page, f);
      await waitPhase(page, "unsupported");
      t.ok((await statusText(page)) === S.unsupported, `${f}: unsupported message`);
      await sleep(500);
      const after = dbRows();
      t.ok(after.n === before.n && folders().length === fBefore, `${f}: no row or folder (rows ${before.n}->${after.n}, folders ${fBefore}->${folders().length})`);
      t.ok((await page.locator("[data-testid=recording-open]").count()) === 0, `${f}: list unchanged`);
      await sleep(2500);
      t.ok(proxy.log.length === 0, `${f}: gateway calls ${proxy.log.length}`);
    }
    if (id === "6.6") t.note(`picker accept: ${await page.locator("[data-testid=file-input]").getAttribute("accept")}`);
    await ctx.close();
  });
}
c("refuse", "6.7", "AC-6 app still works after a refusal", async (t) => {
  await startGw("ok");
  const { ctx, page } = await newPage();
  await pick(page, "bad-text-as.mp3");
  await waitPhase(page, "unsupported");
  await pick(page, "ok-en.mp3");
  await waitPhase(page, "sent");
  const r = await waitStatus(await newestId());
  t.ok(r.status === "done", `ended ${r.status}`);
  await ctx.close();
});

// ---- result
c("result", "X.1", "Empty list", async (t) => {
  const { ctx, page } = await newPage();
  await page.getByText(S.empty).waitFor({ timeout: 15000 });
  t.ok(true, "empty message exact, on an empty store");
  seen("empty");
  await shot(page, "X.1-empty");
  await ctx.close();
});
c("result", "3.2+4.2", "Shown in full, labels", async (t) => {
  await startGw("ok");
  const { id } = await apiUpload("ok-en.mp3");
  const r = await waitStatus(id);
  for (const width of [390, 360]) {
    const { ctx, page } = await newPage({ width });
    await openId(page, id);
    await page.locator("[data-testid=result-turn]").first().waitFor();
    const shown = await page.locator("[data-testid=result-turn]").allInnerTexts();
    t.ok(JSON.stringify(shown) === JSON.stringify(r.turns.map((x) => x.text)), `${width}px: all ${r.turns.length} turns shown, same text`);
    const m = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, cli: document.documentElement.clientWidth, clipped: [...document.querySelectorAll("[data-testid=result-turn]")].filter((e) => e.scrollWidth > e.clientWidth + 1).length }));
    t.ok(m.doc === m.cli && m.clipped === 0, `${width}px: nothing clipped (${m.doc}/${m.cli}, clipped ${m.clipped})`);
    const body = await page.locator("main").first().innerText();
    t.ok(body.includes(S.speaker1) && body.includes(S.speaker2), `${width}px: labels ${S.speaker1}, ${S.speaker2}`);
    t.ok(body.includes(S.conversation) && (await page.locator("[data-testid=result-summary]").innerText()).includes(r.summary), `${width}px: conversation and summary sections`);
    await shot(page, `3.2-result-${width}`);
    await ctx.close();
  }
  seen("speaker1", "speaker2", "conversation", "summary");
});
c("result", "20.1", "AC-20 no speech from the gateway", async (t) => {
  await startGw("no_speech");
  proxy.log = [];
  const { id } = await apiUpload("ok-en.mp3");
  const r = await waitStatus(id);
  t.ok(r.status === "no_speech", `ended ${r.status}`);
  const { ctx, page } = await newPage();
  await openId(page, id);
  t.ok((await failureText(page)) === S.noSpeech, "no-speech message");
  t.ok((await page.locator("[data-testid=result-conversation]").count()) === 0, "no empty result section");
  t.ok(count("summary") === 0, `summary calls ${count("summary")}`);
  seen("noSpeech");
  await ctx.close();
});
for (const [id, f, title] of [["20.4", "nospeech-silence-30s.wav", "silence at intake"], ["20.3", "edge-silence-tenth-second.wav", "tiny file"]]) {
  c("result", id, `AC-20 ${title}`, async (t) => {
    await startGw("ok");
    proxy.log = [];
    const { ctx, page } = await newPage();
    await pick(page, f);
    await waitPhase(page, "sent");
    const nid = await newestId();
    const r = await waitStatus(nid);
    t.ok(r.status === "no_speech", `ended ${r.status}`);
    await openId(page, nid);
    t.ok((await failureText(page)) === S.noSpeech, "no-speech message");
    await sleep(2500);
    t.ok(proxy.log.length === 0, `gateway calls ${proxy.log.length}`);
    await ctx.close();
  });
}

// ---- failures
async function failThenFix(t, mode, wanted, msg, key) {
  await startGw(mode);
  proxy.log = [];
  const { id } = await apiUpload("ok-en.mp3");
  const r = await waitStatus(id);
  t.ok(r.status === wanted, `ended ${r.status} (${r.errorCode})`);
  const { ctx, page } = await newPage();
  await openId(page, id);
  t.ok((await failureText(page)) === msg, `message exact: ${key}`);
  seen(key);
  return { id, r, ctx, page };
}
c("fail", "7.1", "AC-7 retry works", async (t) => {
  const { id, ctx, page } = await failThenFix(t, "fail", "transcription_failed", S.transFailed, "transFailed");
  await startGw("ok");
  let chooser = 0, puts = 0;
  page.on("filechooser", () => chooser++);
  page.on("request", (q) => { if (q.method() === "PUT") puts++; });
  const retried = page.waitForResponse((q) => q.url().endsWith("/retry"));
  await page.locator("[data-testid=result-retry]").click();
  t.ok((await retried).status() === 202, "retry accepted");
  seen("retry");
  const r = await waitStatus(id);
  t.ok(r.status === "done", `after retry: ${r.status}`);
  t.ok(chooser === 0 && puts === 0, `file choosers ${chooser}, PUTs ${puts}`);
  t.ok((await list()).length === 1, "same recording, list count 1");
  await page.locator("[data-testid=result-turn]").first().waitFor({ timeout: 15000 });
  t.ok(true, "result shows without leaving the screen");
  await ctx.close();
});
c("fail", "7.2", "AC-7 still failing", async (t) => {
  const { id, ctx, page } = await failThenFix(t, "fail", "transcription_failed", S.transFailed, "transFailed");
  await page.locator("[data-testid=result-retry]").click();
  await sleep(1000);
  const r = await waitStatus(id, TERMINAL);
  await page.locator("[data-testid=result-failure]").waitFor({ timeout: 20000 });
  t.ok(r.status === "transcription_failed", `after retry: ${r.status}`);
  t.ok((await failureText(page)) === S.transFailed, "same message");
  t.ok((await list()).length === 1, "one entry");
  t.ok(AAC(stored(id)), "audio intact, probed");
  await ctx.close();
});
c("fail", "7.3", "AC-7 retry twice fast", async (t) => {
  const { id, ctx, page } = await failThenFix(t, "fail", "transcription_failed", S.transFailed, "transFailed");
  proxy.log = [];
  const statuses = await page.evaluate(async ([back, id]) => {
    const go = () => fetch(`${back}/api/recordings/${id}/retry`, { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: "{}" }).then((r) => r.status);
    return Promise.all([go(), go()]);
  }, [BACK, id]);
  await waitStatus(id, TERMINAL);
  await sleep(6000);
  t.note(`two retries answered ${statuses.join(",")}`);
  t.ok(count("transcribe") === 1, `transcription calls ${count("transcribe")}`);
  await ctx.close();
});
c("fail", "7.4", "No retry: transcript cut off", async (t) => {
  const { id, r, ctx, page } = await failThenFix(t, "truncated", "transcription_failed", S.outCut, "outCut");
  t.ok(r.errorCode === "output_truncated" && r.retryable === false, `code ${r.errorCode}, retryable ${r.retryable}`);
  t.ok((await page.locator("[data-testid=result-retry]").count()) === 0, "no retry button");
  t.ok((await page.locator("[data-testid=result-conversation],[data-testid=result-summary]").count()) === 0, "no partial result");
  t.ok(AAC(stored(id)), "audio intact");
  await ctx.close();
});
c("fail", "7.9", "No retry: provider refused", async (t) => {
  await startGw("ok");
  proxy.inject = (e) => (e.kind === "poll" ? { status: 200, json: { data: { status: "failed", error: { code: "provider_rejected_audio", retryable: false } } } } : null);
  const { id } = await apiUpload("ok-en.mp3");
  const r = await waitStatus(id);
  t.ok(r.errorCode === "provider_rejected_audio" && !r.retryable, `${r.status} ${r.errorCode} retryable ${r.retryable}`);
  const { ctx, page } = await newPage();
  await openId(page, id);
  t.ok((await failureText(page)) === S.refused, "message exact");
  t.ok((await page.locator("[data-testid=result-retry]").count()) === 0, "no retry button");
  t.ok(AAC(stored(id)), "audio intact");
  seen("refused");
  await ctx.close();
});
c("fail", "7.5", "Gateway unreachable, then not configured", async (t) => {
  await stopGw();
  const a = await apiUpload("ok-en.mp3");
  const r = await waitStatus(a.id);
  t.ok(r.status === "transcription_failed" && r.errorCode === "gateway_unreachable" && r.retryable, `stopped: ${r.status} ${r.errorCode} retryable ${r.retryable}`);
  const { ctx, page } = await newPage();
  await openId(page, a.id);
  t.ok((await failureText(page)) === S.transFailed, "stopped: message exact, with retry");
  t.ok((await page.locator("[data-testid=result-retry]").count()) === 1, "stopped: retry button");
  await startGw("ok", 300, { AUDIO_TRANSCRIBE_PROVIDER: "", AUDIO_SUMMARY_PROVIDER: "" });
  const b = await apiUpload("ok-en.mp3", "QA-b.mp3");
  const r2 = await waitStatus(b.id);
  t.ok(r2.status === "transcription_failed" && r2.errorCode === "gateway_rejected" && r2.retryable, `no provider: ${r2.status} ${r2.errorCode} retryable ${r2.retryable}`);
  await ctx.close();
});
c("fail", "7.6", "Job lost in a restart", async (t) => {
  await startGw("ok", 8000);
  proxy.log = [];
  const a = await apiUpload("ok-en.mp3");
  await waitStatus(a.id, ["transcribing"]);
  await sleep(1500);
  await startGw("ok", 301);
  const r = await waitStatus(a.id);
  t.ok(r.status === "done", `restart once: ended ${r.status} (${r.errorCode})`);
  t.ok(count("transcribe") === 2, `restart once: submits ${count("transcribe")}`);
  proxy.log = [];
  proxy.inject = (e) => (e.kind === "poll" && e.jobKind === "transcribe" ? { status: 404, json: { error: "job_not_found" } } : null);
  const b = await apiUpload("ok-en.mp3", "QA-b.mp3");
  const r2 = await waitStatus(b.id);
  t.ok(r2.status === "transcription_failed" && r2.errorCode === "job_lost" && r2.retryable, `lost twice: ${r2.status} ${r2.errorCode}`);
  t.ok(count("transcribe") === 2, `lost twice: submits ${count("transcribe")}`);
  const { ctx, page } = await newPage();
  await openId(page, b.id);
  t.ok((await failureText(page)) === S.transFailed, "lost twice: message exact");
  await ctx.close();
});
c("fail", "7.7", "Busy", async (t) => {
  await startGw("ok");
  proxy.inject = (e) => (e.kind === "transcribe" ? { status: 429, json: { error: "busy" } } : null);
  const { id } = await apiUpload("ok-en.mp3");
  const r = await waitStatus(id);
  t.ok(r.errorCode === "busy" && r.retryable, `${r.status} ${r.errorCode} retryable ${r.retryable}`);
  const { ctx, page } = await newPage();
  await openId(page, id);
  t.ok((await failureText(page)) === S.busy, "message exact");
  t.ok((await page.locator("[data-testid=result-retry]").count()) === 1, "retry offered");
  t.ok(AAC(stored(id)), "audio intact");
  seen("busy");
  await ctx.close();
});
c("fail", "7.10", "Queue order", async (t) => {
  await startGw("ok", 1000);
  proxy.log = [];
  const ids = [];
  for (const n of ["QA-1.mp3", "QA-2.mp3", "QA-3.mp3"]) ids.push((await apiUpload("ok-en.mp3", n)).id);
  let maxBusy = 0;
  const finished = [];
  for (let i = 0; i < 600 && finished.length < 3; i++) {
    const rows = await list();
    maxBusy = Math.max(maxBusy, rows.filter((r) => ["transcribing", "summarizing"].includes(r.status)).length);
    for (const r of rows) if (r.status === "done" && !finished.includes(r.id)) finished.push(r.id);
    await sleep(200);
  }
  t.ok(finished.length === 3, `all finished (${finished.length})`);
  t.ok(maxBusy <= 1, `at most one at a time (${maxBusy})`);
  t.ok(JSON.stringify(finished) === JSON.stringify(ids), "oldest first");
});
c("fail", "15.1+15.2", "AC-15 summary fails, retry summary only, also after reopening", async (t) => {
  const { id, r, ctx, page } = await failThenFix(t, "summary_fail", "summary_failed", S.sumFailed, "sumFailed");
  t.ok(r.turns?.length > 0, `turns kept: ${r.turns?.length}`);
  t.ok((await page.locator("[data-testid=result-turn]").count()) === r.turns.length, "transcript shows");
  await page.close();
  const p2 = await ctx.newPage();
  await p2.goto(`${FRONT}/#r=${id}`);
  t.ok((await failureText(p2)) === S.sumFailed, "reopened: same message");
  await startGw("ok");
  proxy.log = [];
  const retried = p2.waitForResponse((q) => q.url().endsWith("/retry"));
  await p2.locator("[data-testid=result-retry]").click();
  t.ok((await retried).status() === 202, "retry accepted");
  const done = await waitStatus(id, ["done", "summary_failed"]);
  t.ok(done.status === "done", `after retry: ${done.status}`);
  await sleep(1000);
  t.ok(count("transcribe") === 0 && count("summary") === 1, `transcription calls ${count("transcribe")}, summary calls ${count("summary")}`);
  await ctx.close();
});
c("fail", "15.3", "No retry: summary cut off", async (t) => {
  await startGw("ok");
  proxy.inject = (e) => (e.kind === "poll" && e.jobKind === "summary" ? { status: 200, json: { data: { status: "failed", error: { code: "output_truncated", retryable: false } } } } : null);
  const { id } = await apiUpload("ok-en.mp3");
  const r = await waitStatus(id);
  t.ok(r.status === "summary_failed" && r.errorCode === "output_truncated" && !r.retryable, `${r.status} ${r.errorCode}`);
  const { ctx, page } = await newPage();
  await openId(page, id);
  t.ok((await failureText(page)) === S.sumCut, "message exact");
  t.ok((await page.locator("[data-testid=result-retry]").count()) === 0, "no retry");
  t.ok((await page.locator("[data-testid=result-turn]").count()) > 0, "transcript shows");
  t.ok((await page.locator("[data-testid=result-summary]").count()) === 0, "no partial summary");
  seen("sumCut");
  await ctx.close();
});
c("fail", "14.1", "AC-14 upload lost midway", async (t) => {
  await startGw("ok");
  const big = join(root, "big-14.wav");
  spawnSync("ffmpeg", ["-y", "-v", "error", "-f", "lavfi", "-i", "sine=f=330:d=420", "-ar", "16000", "-ac", "1", big]);
  const { ctx, page } = await newPage();
  const puts = [];
  let offline = false;
  page.on("response", async (q) => { if (q.request().method() === "PUT" && q.status() === 204) { puts.push(q.url().split("/").pop()); if (!offline) { offline = true; await ctx.setOffline(true); } } });
  await page.route("**/chunks/*", async (route) => { await sleep(200); await route.continue().catch(() => route.abort()); });
  await pick(page, big);
  await waitPhase(page, "failed");
  t.ok((await statusText(page)) === S.sendFailed, "send-failed message");
  seen("sendFailed");
  const firstRound = [...puts];
  await ctx.setOffline(false);
  puts.length = 0;
  await page.getByRole("button", { name: S.retry }).click();
  await waitPhase(page, "sent");
  t.ok(firstRound.length > 0 && !puts.some((p) => firstRound.includes(p)), `only the missing pieces sent again (before ${firstRound.join()}; retry ${puts.join()})`);
  const rows = await list();
  t.ok(rows.length === 1, `one recording (${rows.length})`);
  await waitStatus(rows[0].id);
  rmSync(big);
  await ctx.close();
});
c("fail", "14.5", "AC-14 closed while sending", async (t) => {
  await startGw("ok");
  const big = join(root, "big-14.wav");
  spawnSync("ffmpeg", ["-y", "-v", "error", "-f", "lavfi", "-i", "sine=f=330:d=420", "-ar", "16000", "-ac", "1", big]);
  const { ctx, page } = await newPage();
  let rid = null;
  page.on("response", async (q) => { if (q.request().method() === "POST" && q.url().endsWith("/api/recordings")) rid = (await q.json()).id; });
  await page.route("**/chunks/*", async (route) => { await sleep(3000); await route.continue().catch(() => {}); });
  await pick(page, big);
  await waitPhase(page, "sending");
  await sleep(500);
  await page.close();
  const p2 = await ctx.newPage();
  await p2.goto(FRONT);
  await p2.getByText(S.empty).waitFor({ timeout: 15000 });
  t.ok(true, "no row stuck in the list");
  t.note(`database holds ${dbRows().up} uploading row(s), not listed`);
  await p2.setInputFiles("[data-testid=file-input]", join(FX, "ok-en.mp3"));
  await p2.locator("[data-testid=send-status][data-phase=sent]").waitFor({ timeout: 30000 });
  t.ok(true, "picking a file again works");
  if (rid) { const d = await api(`/api/recordings/${rid}`, { method: "DELETE" }); t.note(`my uploading row removed, ${d.status}`); }
  rmSync(big);
  await ctx.close();
});
c("fail", "14.8", "Send refused, too large", async (t) => {
  const size = statSync(join(FX, "ok-en.mp3")).size;
  await startGw("ok");
  await startBack({ MAX_UPLOAD_BYTES: String(size) });
  let { ctx, page } = await newPage();
  await pick(page, "ok-en.mp3");
  await waitPhase(page, "sent");
  t.ok(true, `at the limit (${size} B): goes through`);
  await waitStatus(await newestId());
  const big = join(root, "over.mp3");
  writeFileSync(big, Buffer.concat([readFileSync(join(FX, "ok-en.mp3")), Buffer.from([0])]));
  const before = dbRows().n, fB = folders().length;
  await pick(page, big);
  await waitPhase(page, "too_large");
  t.ok((await statusText(page)) === S.tooLarge && dbRows().n === before && folders().length === fB, "one byte over: too-large message, nothing kept");
  seen("tooLarge");
  await ctx.close();
  await cleanAll();
  await startBack({ GATEWAY_MAX_BYTES: "1000" });
  ({ ctx, page } = await newPage());
  const b2 = dbRows().n, f2 = folders().length;
  await pick(page, "ok-en.mp3");
  await waitPhase(page, "too_large");
  t.ok(dbRows().n === b2 && folders().length === f2, "gateway limit low: too-large message, nothing kept");
  await ctx.close();
  rmSync(big);
  await startBack();
});
c("fail", "14.7", "AC-14 half a file", async (t) => {
  const { r } = await throughApp(t, "edge-half-of-mp3.mp3", "half");
  t.note(`durationMs ${r.durationMs}`);
});
c("fail", "16.1", "AC-16 closed after sent", async (t) => {
  await startGw("ok", 15000);
  const { ctx, page } = await newPage();
  await pick(page, "ok-en.mp3");
  await waitPhase(page, "sent");
  const id = await newestId();
  await page.close();
  const p2 = await ctx.newPage();
  await p2.goto(`${FRONT}/#r=${id}`);
  await p2.locator("[data-testid=result-processing]").waitFor({ timeout: 15000 });
  t.ok((await p2.locator("[data-testid=result-processing]").innerText()) === S.sent, "reopened: still processing, message exact");
  await p2.locator("[data-testid=result-turn]").first().waitFor({ timeout: 90000 });
  t.ok(true, "same screen then shows the result, no reload");
  await ctx.close();
});
c("fail", "16.2", "AC-16 back restarted while transcribing", async (t) => {
  await startGw("ok", 10000);
  const { id } = await apiUpload("ok-en.mp3");
  await waitStatus(id, ["transcribing"]);
  await startBack();
  const r0 = await rec(id);
  t.note(`right after boot: ${r0.status}`);
  await startGw("ok", 300);
  const r = await waitStatus(id);
  t.ok(r.status === "done", `finished: ${r.status} (${r.errorCode})`);
});
c("fail", "16.3", "AC-16 back restarted while summarising", async (t) => {
  await startGw("ok", 9000);
  proxy.log = [];
  const { id } = await apiUpload("ok-en.mp3");
  await waitStatus(id, ["summarizing"]);
  await startBack();
  const r = await waitStatus(id);
  t.ok(r.status === "done", `finished: ${r.status} (${r.errorCode})`);
  t.ok(count("transcribe") === 1, `transcription calls ${count("transcribe")}`);
});
c("fail", "8.1+8.3+8.4", "AC-8 reopen: new tab, gateway gone, back restarted", async (t) => {
  await startGw("ok");
  const { id } = await apiUpload("ok-en.mp3");
  const r = await waitStatus(id);
  const check = async (p, label) => {
    await p.locator("[data-testid=recording-open]").first().click();
    await p.locator("[data-testid=result-turn]").first().waitFor({ timeout: 15000 });
    t.ok(JSON.stringify(await p.locator("[data-testid=result-turn]").allInnerTexts()) === JSON.stringify(r.turns.map((x) => x.text)), `${label}: opens, same text, still logged in`);
  };
  const { ctx, page } = await newPage();
  await page.close();
  let p2 = await ctx.newPage();
  await p2.goto(FRONT);
  await check(p2, "new tab");
  await stopGw();
  p2 = await ctx.newPage();
  await p2.goto(FRONT);
  await check(p2, "gateway stopped");
  await startGw("ok");
  await startBack();
  p2 = await ctx.newPage();
  await p2.goto(FRONT);
  await check(p2, "back restarted");
  await ctx.close();
});
c("fail", "8.2", "AC-8 browser restarted", async (t) => {
  await startGw("ok");
  const { id } = await apiUpload("ok-en.mp3");
  await waitStatus(id);
  const dir = join(root, "profile-8");
  rmSync(dir, { recursive: true, force: true });
  let pc = await chromium.launchPersistentContext(dir, { channel: "chrome", viewport: { width: 390, height: 844 } });
  live.add(pc);
  let p = await pc.newPage();
  await p.goto(FRONT);
  await p.locator("input[type=password]").fill(password);
  await p.getByRole("button", { name: S.login }).click();
  await p.locator("[data-testid=recording-open]").first().waitFor();
  seen("login");
  await pc.close();
  pc = await chromium.launchPersistentContext(dir, { channel: "chrome", viewport: { width: 390, height: 844 } });
  live.add(pc);
  p = await pc.newPage();
  await p.goto(FRONT);
  await p.locator("[data-testid=recording-open]").first().click({ timeout: 15000 });
  await p.locator("[data-testid=result-turn]").first().waitFor({ timeout: 15000 });
  t.ok(true, "after a browser restart: opens, still logged in");
  await pc.close();
  rmSync(dir, { recursive: true, force: true });
});

// ---- who can reach it
const uuid0 = "00000000-0000-4000-8000-000000000000";
c("access", "17.1+17.2", "AC-17 no login, every route, known id, path tricks", async (t) => {
  await startGw("ok");
  const { id } = await apiUpload("ok-en.mp3");
  await waitStatus(id);
  const before = dbRows().n;
  const j = { "content-type": "application/json" };
  const routes = [
    ["GET", "/api/auth/me"], ["POST", "/api/auth/logout"], ["GET", "/api/recordings"], ["POST", "/api/recordings", j, JSON.stringify({ clientId: randomUUID(), fileName: "QA-x", sizeBytes: 5, source: "file" })],
    ["GET", `/api/recordings/${id}`], ["PUT", `/api/recordings/${id}/chunks/0`, { "content-type": "application/octet-stream" }, "x"], ["POST", `/api/recordings/${id}/complete`, j, "{}"], ["POST", `/api/recordings/${id}/retry`, j, "{}"], ["DELETE", `/api/recordings/${id}`],
  ];
  for (const [m, p, h, b] of routes) {
    const r = await fetch(BACK + p, { method: m, headers: h, body: b });
    const text = await r.text();
    t.ok(r.status === 401 && text.includes("unauthorized"), `no cookie ${m} ${p.replace(id, ":id")}: ${r.status}`);
  }
  t.ok(dbRows().n === before && (await rec(id)).status === "done", "rows unchanged, recording intact");
  for (const p of ["/api/recordings/..%2F..%2Fetc", "/api/recordings/../../etc/passwd", `/${id}/audio.m4a`, `/storage/${id}/audio.m4a`, `/api/recordings/${id}/audio.m4a`, "/audio.m4a"]) {
    const none = await fetch(BACK + p);
    const body = await none.arrayBuffer();
    t.ok([401, 404].includes(none.status) && body.byteLength < 200, `no cookie GET ${p.replace(id, ":id")}: ${none.status}`);
    const withC = await api(p);
    const b2 = await withC.arrayBuffer();
    t.ok([400, 404].includes(withC.status) && b2.byteLength < 200, `logged in GET ${p.replace(id, ":id")}: ${withC.status}`);
  }
});
c("access", "17.5+17.6", "Login wrong password, too many tries", async (t) => {
  await startBack();
  const { ctx, page } = await newPage({ logged: false });
  const tryPw = async (pw) => { await page.locator("input[type=password]").fill(pw); await page.getByRole("button", { name: S.login }).click(); };
  await tryPw("wrong-1");
  await page.getByText(S.wrongPw).waitFor({ timeout: 10000 });
  t.ok((await ctx.cookies()).every((x) => x.name !== "cs_session"), "wrong password: message, no cookie");
  await tryPw(password);
  await page.getByRole("button", { name: S.logout }).waitFor({ timeout: 10000 });
  t.ok(true, "then the right one: in");
  seen("wrongPw", "login", "logout");
  await ctx.close();
  await startBack();
  const c2 = await newPage({ logged: false });
  for (let i = 1; i <= 5; i++) {
    await c2.page.locator("input[type=password]").fill(`wrong-${i}`);
    await c2.page.getByRole("button", { name: S.login }).click();
    await c2.page.getByText(S.wrongPw).waitFor({ timeout: 10000 });
    await sleep(200);
  }
  await c2.page.locator("input[type=password]").fill(password);
  await c2.page.getByRole("button", { name: S.login }).click();
  await c2.page.getByText(S.tooMany).waitFor({ timeout: 10000 });
  t.ok((await c2.ctx.cookies()).every((x) => x.name !== "cs_session"), "after 5 wrong, even the right one: 429 message, no cookie");
  seen("tooMany");
  await shot(c2.page, "17.6-too-many");
  await c2.ctx.close();
  await startBack();
});
c("access", "17.7", "Log out", async (t) => {
  await apiLogin();
  const old = cookie;
  const { ctx, page } = await newPage();
  await page.getByRole("button", { name: S.logout }).click();
  await page.locator("input[type=password]").waitFor({ timeout: 10000 });
  const r = await fetch(`${BACK}/api/recordings`, { headers: { cookie: old } });
  t.ok(r.status === 401, `old cookie after logout: ${r.status}`);
  await ctx.close();
  await apiLogin();
});
c("access", "17.8", "Another site", async (t) => {
  const r = await fetch(`${BACK}/api/auth/me`, { headers: { cookie, origin: "http://evil.example" } });
  t.ok(r.headers.get("access-control-allow-origin") === null, `other origin: allow-origin ${r.headers.get("access-control-allow-origin")}`);
  const ok = await fetch(`${BACK}/api/auth/me`, { headers: { cookie, origin: FRONT } });
  t.ok(ok.headers.get("access-control-allow-origin") === FRONT, "FRONT_ORIGIN: allowed, so the check can fail");
  const ctx = await browser.newContext();
  live.add(ctx);
  const page = await ctx.newPage();
  await page.goto("http://[::1]:3120"); // same server, another origin: the front listens on [::1] only
  const blocked = await page.evaluate((b) => fetch(`${b}/api/auth/me`, { credentials: "include" }).then((x) => `read ${x.status}`, (e) => e.name), BACK);
  t.ok(blocked === "TypeError", `a page on another origin: ${blocked}`);
  await ctx.close();
});
c("access", "17.9", "Cookie", async (t) => {
  await startBack({ COOKIE_SECURE: "" });
  const r = await fetch(`${BACK}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) });
  const sc = r.headers.get("set-cookie") ?? "";
  const flags = sc.split(";").slice(1).map((x) => x.trim().split("=")[0]);
  t.ok(flags.includes("HttpOnly") && flags.includes("Secure") && /SameSite=Lax/.test(sc), `flags: ${flags.join(", ")} / SameSite=${/SameSite=(\w+)/.exec(sc)?.[1]}`);
  await startBack();
  const { ctx, page } = await newPage();
  t.ok(!(await page.evaluate(() => document.cookie)).includes("cs_session"), "script on the page cannot read it");
  await ctx.close();
});
c("access", "17.10", "Hostile file name", async (t) => {
  await startGw("ok");
  const { ctx, page } = await newPage();
  let dialogs = 0;
  page.on("dialog", (d) => { dialogs++; d.dismiss(); });
  const buf = readFileSync(join(FX, "ok-en.mp3"));
  const html = "<img src=x onerror=alert(1)>.mp3";
  await pick(page, { name: html, mimeType: "audio/mpeg", buffer: buf });
  await waitPhase(page, "sent");
  const tricky = "../../../QA-x.mp3";
  const c1 = await api("/api/recordings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ clientId: randomUUID(), fileName: tricky, sizeBytes: buf.length, source: "file" }) });
  const { id } = await c1.json();
  await api(`/api/recordings/${id}/chunks/0`, { method: "PUT", headers: { "content-type": "application/octet-stream" }, body: buf });
  await api(`/api/recordings/${id}/complete`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
  await page.reload();
  await page.locator("[data-testid=recording-name]").first().waitFor();
  const names = await page.locator("[data-testid=recording-name]").allInnerTexts();
  t.ok(names.includes(html) && names.includes(tricky), `both shown as plain text: ${JSON.stringify(names)}`);
  t.ok(dialogs === 0 && (await page.locator("main img").count()) === 0, `nothing ran (dialogs ${dialogs})`);
  const stray = spawnSync("find", [root, "-maxdepth", "4", "-name", "QA-x*", "-not", "-path", "*/node_modules/*"], { encoding: "utf8" }).stdout.trim();
  t.ok(stray === "", `nothing named after it on disk: "${stray}"`);
  await ctx.close();
});
c("access", "17.3", "AC-17 keys stay on the server", async (t) => {
  const out = spawnSync("grep", ["-rlE", "qa-local-stub-key-not-real|LLM_GATEWAY|:3123|:3122|OWNER_PASSWORD|DATABASE_URL", join(root, "front/.next/static"), join(root, "front/public")], { encoding: "utf8" });
  t.ok(out.stdout.trim() === "", `built front files naming them: ${out.stdout.trim().split("\n").filter(Boolean).length}`);
  const dbHit = spawnSync("grep", ["-rlF", DB_URL, join(root, "front/.next/static")], { encoding: "utf8" }).stdout.trim();
  t.ok(dbHit === "", "database URL value absent (matched, never printed)");
});

// ---- delete
c("delete", "18.1+18.2", "AC-18 cancel, then confirm", async (t) => {
  await startGw("ok");
  const { id } = await apiUpload("ok-en.mp3");
  await waitStatus(id);
  const { ctx, page } = await newPage();
  await openId(page, id);
  await page.locator("[data-testid=result-delete]").click();
  t.ok((await page.locator("[data-testid=result-confirm] p").innerText()) === S.confirm, "confirm text exact");
  seen("confirm");
  await page.getByRole("button", { name: "ยกเลิก" }).click();
  t.ok((await rec(id)).status === "done" && filesOf(id).length === 1, "cancel: nothing changes");
  await page.locator("[data-testid=result-delete]").click();
  await page.locator("[data-testid=result-confirm-yes]").click();
  await page.getByText(S.empty).waitFor({ timeout: 10000 });
  t.ok((await rec(id)).httpStatus === 404, "confirm: GET answers 404");
  t.ok(!existsSync(join(STORAGE, id)), "confirm: folder gone");
  t.ok(dbRows().n === 0, "confirm: row gone");
  await ctx.close();
});
c("delete", "18.3", "AC-18 only that one", async (t) => {
  await startGw("ok");
  const a = await apiUpload("ok-en.mp3", "QA-a.mp3");
  const b = await apiUpload("ok-en.mp3", "QA-b.mp3");
  await waitStatus(a.id); await waitStatus(b.id);
  await api(`/api/recordings/${a.id}`, { method: "DELETE" });
  const r = await rec(b.id);
  t.ok(r.status === "done" && r.turns?.length > 0 && filesOf(b.id).includes("audio.m4a"), "the other is intact");
  t.ok(!existsSync(join(STORAGE, a.id)), "deleted one gone");
});
c("delete", "18.4", "AC-18 while processing", async (t) => {
  await startGw("ok", 8000);
  const { id } = await apiUpload("ok-en.mp3");
  await waitStatus(id, ["transcribing"]);
  await sleep(1000);
  const d = await api(`/api/recordings/${id}`, { method: "DELETE" });
  t.ok(d.status === 204, `delete answered ${d.status}`);
  await sleep(25000);
  t.ok((await rec(id)).httpStatus === 404, "stays gone after the job ended");
  t.ok(!existsSync(join(STORAGE, id)), "no folder came back");
  t.ok(dbRows().n === 0, "no row came back");
});
c("delete", "18.5", "AC-18 a failed one", async (t) => {
  const { id, ctx, page } = await failThenFix(t, "fail", "transcription_failed", S.transFailed, "transFailed");
  await page.locator("[data-testid=result-delete]").click();
  await page.locator("[data-testid=result-confirm-yes]").click();
  await page.getByText(S.empty).waitFor({ timeout: 10000 });
  t.ok((await rec(id)).httpStatus === 404 && !existsSync(join(STORAGE, id)) && dbRows().n === 0, "row and folder gone");
  await ctx.close();
});

// ---- microphone: each case launches its own Chrome with the fake-mic flags
const micArgs = (wav) => ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", `--use-file-for-fake-audio-capture=${join(FX, wav)}`];
const STOP_TRACKS = () => {
  const gum = navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices);
  if (gum) navigator.mediaDevices.getUserMedia = async (c) => { const s = await gum(c); window.__stream = s; return s; };
};
async function micPage(wav) {
  const b = await chromium.launch({ channel: "chrome", args: micArgs(wav) });
  live.add(b);
  const { ctx, page } = await newPage({ b });
  await ctx.addInitScript(STOP_TRACKS);
  await page.reload();
  return { b, ctx, page };
}
const tapRecord = (page) => page.getByRole("button", { name: S.record, exact: true }).click();
const stateLine = (page) => page.locator("[data-testid=rec-state]").waitFor({ timeout: 10000 });
c("mic", "2.1", "AC-2 measured", async (t) => {
  await startGw("ok");
  const { b, ctx, page } = await micPage("mic-en-then-silence.wav");
  await tapRecord(page);
  await stateLine(page);
  await sleep(10000);
  await page.locator("[data-testid=rec-stop]").click();
  seen("stop");
  const id = await waitFirstRow();
  const r = await waitStatus(id);
  const f = join(root, "mic.bin");
  writeFileSync(f, await readPuts(page));
  const start = spawnSync("ffmpeg", ["-hide_banner", "-t", "2", "-i", f, "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf8" }).stderr.match(/max_volume: (-?[\d.]+)/)?.[1];
  t.ok(r.status === "done" && r.source === "mic", `same processing: ${r.status}, source ${r.source}`);
  t.ok(Math.abs(r.durationMs / 1000 - 10) <= 1, `duration ${r.durationMs} ms, against 10 s ±1 s`);
  t.ok(Number(start) > -40, `start not silent: first 2 s max ${start} dB`);
  rmSync(f);
  await ctx.close(); await b.close();
});
async function waitFirstRow(ms = 20000) { const end = Date.now() + ms; for (;;) { const id = await newestId(); if (id) return id; if (Date.now() > end) throw new Error("no row appeared"); await sleep(250); } }
c("mic", "2.3", "AC-2 mic refused", async (t) => {
  const b = await chromium.launch({ channel: "chrome", args: ["--use-fake-device-for-media-stream", "--deny-permission-prompts"] });
  live.add(b);
  const { ctx, page } = await newPage({ b });
  await tapRecord(page);
  const el = page.locator("[data-testid=rec-error]");
  await el.waitFor({ timeout: 15000 });
  t.note(`kind ${await el.getAttribute("data-kind")}`);
  t.ok((await el.locator("p").first().innerText()) === S.micRefused, "mic-refused message exact");
  t.ok((await list()).length === 0, "no empty recording in the list");
  seen("micRefused");
  await ctx.close(); await b.close();
});
c("mic", "2.4", "No microphone", async (t) => {
  const { ctx, page } = await newPage();
  await ctx.addInitScript(() => { navigator.mediaDevices.getUserMedia = async () => { throw new DOMException("none", "NotFoundError"); }; });
  await page.reload();
  await tapRecord(page);
  const el = page.locator("[data-testid=rec-error]");
  await el.waitFor({ timeout: 15000 });
  t.ok((await el.locator("p").first().innerText()) === S.noMic, "no-mic message exact");
  t.note("forced: getUserMedia made to answer NotFoundError, since this box's Chrome cannot be run with no device on demand");
  t.ok((await list()).length === 0, "nothing recorded");
  seen("noMic");
  await ctx.close();
});
c("mic", "14.2", "AC-14 recording not yet sent, offline", async (t) => {
  await startGw("ok");
  const { b, ctx, page } = await micPage("mic-en-then-silence.wav");
  await ctx.setOffline(true);
  await tapRecord(page);
  await stateLine(page);
  await sleep(6000);
  await page.locator("[data-testid=rec-stop]").click();
  await sleep(3000);
  await shot(page, "14.2-offline-stop");
  await page.close();
  await ctx.setOffline(false);
  const p2 = await ctx.newPage();
  await p2.goto(FRONT);
  const cut = p2.locator("[data-testid=rec-cut-off]");
  await cut.waitFor({ timeout: 15000 });
  t.ok((await cut.locator("p").first().innerText()) === S.cutOff, "new tab: cut-off message");
  seen("cutOff", "sendKept");
  await p2.locator("[data-testid=rec-send-kept]").click();
  const id = await waitFirstRow();
  const r = await waitStatus(id);
  t.ok(r.status === "done", `sending it works: ${r.status}`);
  t.note(`kept ${r.durationMs} ms of about 6 s`);
  await ctx.close(); await b.close();
});
c("mic", "14.3", "AC-14 mic lost at 20 s", async (t) => {
  await startGw("ok");
  const { b, ctx, page } = await micPage("mic-en-then-silence.wav");
  await tapRecord(page);
  await stateLine(page);
  await sleep(20000);
  await page.evaluate(() => { const tr = window.__stream.getAudioTracks()[0]; tr.stop(); tr.dispatchEvent(new Event("ended")); });
  const cut = page.locator("[data-testid=rec-cut-off]");
  await cut.waitFor({ timeout: 10000 });
  t.ok((await cut.locator("p").first().innerText()) === S.cutOff, "cut-off message");
  await page.locator("[data-testid=rec-send-kept]").click();
  const r = await waitStatus(await waitFirstRow());
  t.note(`kept ${r.durationMs} ms of 20 s; lost ${(20000 - r.durationMs) / 1000} s (Q5: reported, no line)`);
  t.ok(r.durationMs > 0 && r.status === "done", `not all lost: ${r.status}`);
  await ctx.close(); await b.close();
});
c("mic", "14.4", "AC-14 page dies at 20 s", async (t) => {
  await startGw("ok");
  const { b, ctx, page } = await micPage("mic-en-then-silence.wav");
  await tapRecord(page);
  await stateLine(page);
  await sleep(20000);
  const cdp = await ctx.newCDPSession(page);
  // Never awaited: Page.crash does not answer, which hung round 1 at this line.
  const crashed = page.waitForEvent("crash", { timeout: 10000 }).then(() => true, () => false);
  void cdp.send("Page.crash").catch(() => {});
  t.ok(await crashed, "the page really crashed");
  const p2 = await ctx.newPage();
  await p2.goto(FRONT);
  const cut = p2.locator("[data-testid=rec-cut-off]");
  await cut.waitFor({ timeout: 15000 });
  t.ok((await cut.locator("p").first().innerText()) === S.cutOff, "reopened: cut-off message");
  await p2.locator("[data-testid=rec-send-kept]").click();
  const r = await waitStatus(await waitFirstRow());
  t.note(`kept ${r.durationMs} ms of 20 s; lost ${(20000 - r.durationMs) / 1000} s (Q5: reported, no line)`);
  t.ok(r.durationMs > 0 && r.status === "done", `not all lost: ${r.status}`);
  await ctx.close(); await b.close();
});
c("mic", "14.6", "AC-14 empty never finished", async (t) => {
  await startGw("ok");
  let m = await micPage("mic-en-then-silence.wav");
  await tapRecord(m.page);
  await stateLine(m.page);
  await m.page.locator("[data-testid=rec-stop]").click();
  await sleep(6000);
  const rows = await list();
  const anyDone = rows.filter((r) => r.status === "done");
  t.ok(anyDone.length === 0, `record and stop at once: done rows ${anyDone.length} (rows ${rows.map((r) => r.status).join() || "none"})`);
  t.note(`on screen: ${JSON.stringify(await m.page.evaluate(() => [...window.__texts]))}`);
  await m.ctx.close(); await m.b.close();
  await cleanAll();
  m = await micPage("nospeech-silence-30s.wav");
  await tapRecord(m.page);
  await stateLine(m.page);
  await sleep(8000);
  await m.page.locator("[data-testid=rec-stop]").click();
  const r = await waitStatus(await waitFirstRow());
  t.ok(r.status === "no_speech", `silent fake mic ended ${r.status}, not finished`);
  await m.ctx.close(); await m.b.close();
});

// ---- after the others, over what they left behind
c("after", "X.3", "Personal data in logs", async (t) => {
  const logs = ["back", "gw"].map((n) => join(LOGS, `${n}.log`)).filter(existsSync).map((f) => readFileSync(f, "utf8")).join("\n");
  const tokens = ["ok-en", "QA-", "ไฟล์ทดสอบ", "onerror", "พัสดุ", "ทีเอช", password];
  for (const x of tokens) t.ok(!logs.includes(x), x === password ? "the password is absent" : `"${x}" is absent`);
  t.note(`${logs.split("\n").length} log lines searched`);
});

// --- planted, for proving the harness; each must be caught, and none can reach a real result ----------------------
if (flag("plant-hang")) c("plant", "plant-hang", "a case that never ends", () => new Promise(() => {}));
let plantedGap = false;
if (flag("plant-gap")) c("plant", "plant-gap", "a case hit by a pause", async (t) => {
  if (!plantedGap) { plantedGap = true; Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 7000); t.ok(false, "failed during the pause"); return; }
  t.ok(true, "second attempt, no pause");
});
if (flag("plant-clean")) c("plant", "plant-clean", "clean-up meets a 500 twice", async (t) => {
  plantListFailures = 2;
  await cleanAll();
  t.ok(plantListFailures === 0, "clean-up retried past two failures");
});

// --- run -----------------------------------------------------------------------------------------------------------
for (const u of [FRONT, BACK, GW, "http://127.0.0.1:3123"]) if (await up(u)) { console.error(`refused: something answers on ${u}`); process.exit(4); }
const dbNow = dbRows();
if (dbNow.d !== "call_scribe_test") { console.error("refused: wrong database"); process.exit(3); }
if (dbNow.n !== 0) console.log(`note: ${dbNow.n} rows already in my database`);

await new Promise((r) => proxyServer.listen(3123, "127.0.0.1", r));
start("front", process.execPath, ["server.js"], join(root, "front/.next/standalone"), { PORT: "3120", HOSTNAME: "localhost" });
await waitUp(FRONT);
await startGw("ok");
await startBack();
await apiLogin();
browser = await chromium.launch({ channel: "chrome", handleSIGTERM: false });

// The stall watch (SPEC-102 Q11): its own process and its own session, since 17.7 logs the main one out.
const watchLogin = await fetch(`${BACK}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) });
const keepWatch = flag("keep-watch");
start("watch", BUN, [arg("watch")], root, { WATCH_DB: DB_URL, WATCH_COOKIE: watchLogin.headers.get("set-cookie").split(";")[0], WATCH_BACK: BACK, WATCH_OUT: resolve(arg("watch-out")) });

// A pause, seen from inside: this timer fires every second, so a long silence means this process did not run.
// Wall against uptime alone misses about half of them (TEST-102 § Stub round 1).
const pauses = [];
let lastBeat = Date.now();
const beat = setInterval(() => {
  const now = Date.now();
  if (now - lastBeat > 5000) pauses.push({ startMs: lastBeat, endMs: now, ms: now - lastBeat });
  lastBeat = now;
}, 1000);
let stopping = false;
let stopNow;
const stopSignal = new Promise((_, rej) => { stopNow = rej; });
stopSignal.catch(() => {});
process.once("SIGTERM", () => { stopping = true; stopNow(new Error("stopped by SIGTERM")); });

let code = 0;
try {
  const selected = cases.filter((x) => (only.length ? only.includes(x.id) : true) && (groupFilter.length ? groupFilter.includes(x.group) : true));
  const queue = selected.map((x) => ({ x, attempt: 1 }));
  while (queue.length && !stopping) {
    const { x, attempt } = queue.shift();
    const t = checker();
    const began = Date.now(), upBegan = uptime();
    let error = null;
    let timer;
    const limit = new Promise((_, rej) => { timer = setTimeout(() => rej(new Error(`time limit ${caseLimitMs / 1000} s`)), caseLimitMs); });
    try {
      await Promise.race([(async () => { await cleanAll(); await x.fn(t); })(), limit, stopSignal]);
    } catch (e) {
      error = `${e.name}: ${String(e.message).split(DB_URL).join("<url>").split(password).join("<pw>").split("\n")[0].slice(0, 200)}`;
    }
    clearTimeout(timer);
    await closeLive();
    await sleep(1100); // let the pause monitor see the end of a pause that touched this case
    const hit = pauses.filter((g) => g.endMs >= began && g.startMs <= Date.now());
    let result = error ? "ERROR" : t.fails.length ? "FAIL" : "PASS";
    if (result !== "PASS" && hit.length && !stopping) {
      // Not judged: run once more at the end. A second pause keeps it PAUSE, never a pass or a defect.
      result = "PAUSE";
      if (attempt === 1) queue.push({ x, attempt: 2 });
    }
    results.push({ id: x.id, group: x.group, title: x.title, result, attempt, began: new Date(began).toISOString(), secs: Math.round((Date.now() - began) / 1000), upSecs: uptime() - upBegan, pausesInCase: hit.map((g) => g.ms), fails: t.fails, notes: t.notes, error });
    console.log(`${result.padEnd(5)} ${x.id.padEnd(12)} ${Math.round((Date.now() - began) / 1000)}s ${t.fails.join(" | ")}${error ?? ""}${hit.length ? ` [pause ${hit.map((g) => g.ms).join()} ms]` : ""}`);
    saveResults();
  }
  await cleanAll();
} catch (e) {
  console.error(`stopped: ${e.name}`);
  code = 1;
} finally {
  if (keepWatch) console.log(`watch left running, stop it by pid: ${procs.watch?.pid}`);
  else await stop("watch");
  clearInterval(beat);
  await closeLive();
  await browser.close().catch(() => {});
  await stop("back"); await stopGw(); await stop("front");
  proxyServer.close();
  const left = dbRows();
  console.log(`rows left: ${left.n}; folders left: ${folders().length}`);
  for (const u of [FRONT, BACK, GW]) if (await up(u)) { console.log(`STILL ANSWERS: ${u}`); code = 1; }
  const tally = results.reduce((a, r) => ((a[r.result] = (a[r.result] ?? 0) + 1), a), {});
  console.log(JSON.stringify(tally));
}
process.exit(code);
