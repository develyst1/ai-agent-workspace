// SPEC-102 Q11: the database stall probe. Same read-only recipe every pass; labels ok / symptom / could not ask.
// Starts one back from a snapshot, logs in once, keeps the session, then:
//   baseline (3 runs) -> gap -> pass -> ... -> one pass of 5 overlapping /me calls.
// Each pass times: /health, /api/auth/me, SELECT 1 on one long-lived connection, SELECT 1 on a new connection.
//
// Run with cwd = a folder with no .env, and the tester's own env file:
//   bun --env-file=<call-scribe-qa-env> q11-db-stall-probe.ts --back <snapshot> --storage <dir> --out <file.jsonl>
// Dry-run flags, for proving the instrument can tell the labels apart; never for a real result:
//   --gaps 0.02,0.02   minutes between passes (default 1,5,15,30)
//   --threshold-ms 1   a lower symptom line (default 8000)
//   --plant-no-back    point the HTTP checks at a closed port, so they must say "could not ask"
//
// Never prints DATABASE_URL, the password, the hash or the cookie. Errors: class name and code only.
import { SQL } from "bun";
import { appendFileSync, openSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { loadavg } from "node:os";

const EXPECTED_DB = "call_scribe_test";
const CAP_MS = 60_000;

function arg(name: string, dflt?: string): string {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0) return process.argv[i + 1]!;
  if (dflt === undefined) throw new Error(`missing --${name}`);
  return dflt;
}
const backDir = arg("back");
const storageDir = arg("storage");
const outFile = arg("out");
const port = Number(arg("port", "3121"));
const gapsMin = arg("gaps", "1,5,15,30").split(",").map(Number);
const thresholdMs = Number(arg("threshold-ms", "8000"));
const plantNoBack = process.argv.includes("--plant-no-back");
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL: missing");

const httpPort = plantNoBack ? port + 1 : port;
const base = `http://127.0.0.1:${httpPort}`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const clean = (e: unknown) => {
  const x = e as { name?: string; code?: string };
  return `${x?.name ?? "Error"}${x?.code ? `:${x.code}` : ""}`;
};

type Row = { t: string; pass: string; check: string; ms: number; label: string; status?: number; err?: string; pid?: number };
const rows: Row[] = [];
function record(r: Row) {
  rows.push(r);
  appendFileSync(outFile, JSON.stringify(r) + "\n");
  console.log(`${r.t} ${r.pass.padEnd(10)} ${r.check.padEnd(20)} ${String(r.ms).padStart(7)} ms  ${r.label}${r.status ? ` ${r.status}` : ""}${r.err ? ` ${r.err}` : ""}`);
}
const label = (ms: number) => (ms > thresholdMs ? "symptom" : "ok");

async function timeHttp(pass: string, check: string, path: string, wantStatus: number, cookie?: string) {
  const t = new Date().toISOString();
  const start = performance.now();
  try {
    const res = await fetch(base + path, {
      headers: { Connection: "close", ...(cookie ? { Cookie: cookie } : {}) },
      keepalive: false,
      signal: AbortSignal.timeout(CAP_MS),
    });
    await res.arrayBuffer();
    const ms = Math.round(performance.now() - start);
    record({ t, pass, check, ms, status: res.status, label: res.status === wantStatus ? label(ms) : "could not ask" });
  } catch (e) {
    const ms = Math.round(performance.now() - start);
    const timedOut = (e as Error).name === "TimeoutError";
    record({ t, pass, check, ms, label: timedOut ? "symptom" : "could not ask", err: clean(e) });
  }
}

// A race, not a timeout on the query: a pending query cannot be cancelled here, so its time is only reported.
async function timeSql(pass: string, check: string, run: () => Promise<unknown>, after?: () => Promise<number>) {
  const t = new Date().toISOString();
  const start = performance.now();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const cap = new Promise<"cap">((r) => (timer = setTimeout(() => r("cap"), CAP_MS)));
  try {
    const won = await Promise.race([run().then(() => "done" as const), cap]);
    const ms = Math.round(performance.now() - start);
    if (won === "cap") {
      record({ t, pass, check, ms, label: "symptom", err: "no answer by the cap" });
      return;
    }
    const pid = after ? await after() : undefined;
    record({ t, pass, check, ms, label: label(ms), pid });
  } catch (e) {
    record({ t, pass, check, ms: Math.round(performance.now() - start), label: "could not ask", err: clean(e) });
  } finally {
    clearTimeout(timer);
  }
}

const sqlOptions = { url, max: 1, idleTimeout: 0, maxLifetime: 0, connectionTimeout: CAP_MS / 1000 };

async function timeFresh(pass: string, check = "select1-new") {
  const fresh = new SQL(sqlOptions);
  await timeSql(pass, check, () => fresh`SELECT 1`);
  fresh.close().catch(() => {}); // not awaited: a stuck close must not stop the pass
}

const long = new SQL(sqlOptions);
const longPid = async () => Number((await long`SELECT pg_backend_pid() AS p`)[0].p);

// While /me is still out at the symptom line, ask the database directly: "at the same moment" is what D1, D2 predict.
async function timeMeWithWatch(pass: string, cookie: string) {
  const watch = setTimeout(() => void timeFresh(pass, "select1-new-in-stall"), thresholdMs);
  await timeHttp(pass, "me", "/api/auth/me", 200, cookie);
  clearTimeout(watch);
}

async function onePass(pass: string, cookie: string) {
  appendFileSync(outFile, JSON.stringify({ t: new Date().toISOString(), pass, loadavg1m: loadavg()[0] }) + "\n");
  await timeHttp(pass, "health", "/health", 200);
  await timeMeWithWatch(pass, cookie);
  await timeSql(pass, "select1-long", () => long`SELECT 1`, longPid);
  await timeFresh(pass);
}

// Guard first: this probe runs on the tester's database and no other.
const db = (await long`SELECT current_database() AS d`)[0].d as string;
if (db !== EXPECTED_DB) {
  console.error(`refused: connected database is not ${EXPECTED_DB}`);
  process.exit(3);
}
console.log(`database ok: ${db}; symptom over ${thresholdMs} ms; gaps ${gapsMin.join(",")} min`);

const password = randomBytes(24).toString("base64url");
const backLog = openSync(`${outFile}.back.log`, "a");
// A back already on this port would be measured in place of ours, with the wrong password. Refuse.
const taken = await fetch(`http://127.0.0.1:${port}/health`, { keepalive: false }).then(() => true, () => false);
if (taken) {
  console.error(`refused: something already answers on port ${port}`);
  process.exit(4);
}
// process.execPath, not "bun": on this box `bun` is a shell launcher, and killing it leaves the real server running.
const back = Bun.spawn([process.execPath, "src/index.ts"], {
  cwd: backDir,
  stdout: backLog,
  stderr: backLog,
  env: {
    PATH: process.env.PATH!,
    HOME: process.env.HOME!,
    DATABASE_URL: url,
    PORT: String(port),
    HOST: "127.0.0.1",
    FRONT_ORIGIN: "http://localhost:3120",
    COOKIE_SECURE: "false",
    OWNER_PASSWORD_HASH: await Bun.password.hash(password),
    STORAGE_DIR: storageDir,
    LLM_GATEWAY_URL: "http://127.0.0.1:9",
    LLM_GATEWAY_KEY: "unused-no-rows-reach-the-worker",
  },
});
const stopBack = () => {
  try {
    back.kill();
  } catch {}
};
process.on("SIGTERM", () => {
  stopBack();
  process.exit(143);
});
process.on("SIGINT", () => {
  stopBack();
  process.exit(130);
});

let exitCode = 0;
try {
  let up = false;
  for (let i = 0; i < 60 && !up; i++) {
    up = await fetch(`http://127.0.0.1:${port}/health`, { keepalive: false }).then((r) => r.ok, () => false);
    if (!up) await sleep(250);
  }
  if (!up) throw new Error("back did not answer /health");

  // The one login. A write (one session row), and the only one in the recipe; removed at the end.
  const loginStart = performance.now();
  const login = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Connection: "close" },
    body: JSON.stringify({ password }),
    keepalive: false,
    signal: AbortSignal.timeout(CAP_MS),
  });
  const loginMs = Math.round(performance.now() - loginStart);
  record({ t: new Date().toISOString(), pass: "setup", check: "login-once", ms: loginMs, status: login.status, label: login.status === 204 ? label(loginMs) : "could not ask" });
  if (login.status !== 204) throw new Error(`login answered ${login.status}`);
  const cookie = (login.headers.get("set-cookie") ?? "").split(";")[0]!;

  for (let i = 1; i <= 3; i++) await onePass(`baseline-${i}`, cookie);

  for (const min of gapsMin) {
    await sleep(min * 60_000);
    await onePass(`gap-${min}m`, cookie);
  }

  // One pass of 5 overlapping /me calls, with the direct checks at the same moment.
  const pass = "overlap-5";
  await Promise.all([
    ...[1, 2, 3, 4, 5].map((n) => timeHttp(pass, `me-${n}`, "/api/auth/me", 200, cookie)),
    timeSql(pass, "select1-long", () => long`SELECT 1`, longPid),
    timeFresh(pass),
  ]);

  // Remove the one session row, then say what is left. Read back, not assumed.
  const out = await fetch(`http://127.0.0.1:${port}/api/auth/logout`, { method: "POST", headers: { Cookie: cookie, Connection: "close" }, keepalive: false, signal: AbortSignal.timeout(CAP_MS) });
  const left = await long`SELECT (SELECT count(*) FROM sessions) AS sessions, (SELECT count(*) FROM recordings) AS recordings`;
  console.log(`logout ${out.status}; rows left: sessions=${left[0].sessions} recordings=${left[0].recordings}`);
} catch (e) {
  console.error(`probe stopped: ${(e as Error).message}`);
  exitCode = 1;
} finally {
  stopBack();
  await back.exited;
  await long.close().catch(() => {});
  const still = await fetch(`http://127.0.0.1:${port}/health`, { keepalive: false }).then(() => true, () => false);
  console.log(`after stop, port ${port}: ${still ? "STILL ANSWERS" : "refuses"}`);
  if (still) exitCode = 1;
}

const median = (a: number[]) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const checks = ["health", "me", "select1-long", "select1-new"];
console.log("\nbaseline medians (ms):");
for (const c of checks) {
  const v = rows.filter((r) => r.pass.startsWith("baseline") && r.check === c).map((r) => r.ms);
  if (v.length) console.log(`  ${c}: ${median(v)}  (runs ${v.join(", ")})`);
}
const count = (l: string) => rows.filter((r) => r.label === l).length;
console.log(`labels: ok=${count("ok")} symptom=${count("symptom")} could-not-ask=${count("could not ask")}`);
console.log(`long-lived connection pids seen: ${[...new Set(rows.filter((r) => r.pid).map((r) => r.pid))].join(", ")}`);
process.exit(exitCode);
