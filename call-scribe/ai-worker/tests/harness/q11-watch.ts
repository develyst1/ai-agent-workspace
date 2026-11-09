// SPEC-102 Q11: the stall watch, run beside TEST-102's stub cases. Every 15 s, at the same moment: the back's /me,
// SELECT 1 on one long-lived connection, SELECT 1 on a new connection. Read-only, numbers and labels only.
// A separate process, so its waits never block the harness, and the harness's work never delays its timing.
// Started by local-test102-stub.mjs, which passes URL and cookie by env; stop it with SIGTERM. Prints neither.
import { SQL } from "bun";
import { appendFileSync } from "node:fs";

const { WATCH_DB: url, WATCH_COOKIE: cookie, WATCH_BACK: back, WATCH_OUT: out } = process.env;
if (!url || !cookie || !back || !out) throw new Error("missing WATCH_ env");
const SYMPTOM_MS = 8000, CAP_MS = 60000, EVERY_MS = 15000;
const opts = { url, max: 1, idleTimeout: 0, maxLifetime: 0, connectionTimeout: CAP_MS / 1000 };
const long = new SQL(opts);
const clean = (e: unknown) => { const x = e as { name?: string; code?: string }; return `${x?.name ?? "Error"}${x?.code ? `:${x.code}` : ""}`; };
const sinceBoot = () => Math.round(Number(require("node:fs").readFileSync("/proc/uptime", "utf8").split(" ")[0]));

async function timed(run: () => Promise<unknown>) {
  const a = performance.now();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const cap = new Promise<"cap">((r) => (timer = setTimeout(() => r("cap"), CAP_MS)));
  try {
    const won = await Promise.race([run(), cap]);
    const ms = Math.round(performance.now() - a);
    if (won === "cap") return { ms, label: "symptom", err: "no answer by the cap" };
    return { ms, label: ms > SYMPTOM_MS ? "symptom" : "ok" };
  } catch (e) {
    return { ms: Math.round(performance.now() - a), label: "could not ask", err: clean(e) };
  } finally {
    clearTimeout(timer);
  }
}

// One line per check, written as it ends, plus one when a tick begins: a check still out when the run dies is then
// visible as a begun tick with a check missing, not lost with the tick.
const write = (o: object) => appendFileSync(out!, JSON.stringify(o) + "\n");
let tickNo = 0;
let longOut = false;
async function tick() {
  const n = ++tickNo;
  const t = new Date().toISOString();
  write({ tick: n, t, up: sinceBoot(), begin: true });
  // upEnd is the since-boot clock when the check ended, so a pause inside a check can be told from one before it.
  const check = async (name: string, run: () => Promise<unknown>) => write({ tick: n, t, check: name, ...(await timed(run)), upEnd: sinceBoot() });
  const fresh = new SQL(opts);
  await Promise.all([
    check("me", async () => {
      const r = await fetch(`${back}/api/auth/me`, { headers: { cookie: cookie!, Connection: "close" }, keepalive: false, signal: AbortSignal.timeout(CAP_MS) });
      await r.arrayBuffer();
      if (r.status !== 200) throw Object.assign(new Error("status"), { name: "Status", code: String(r.status) });
    }),
    check("health", async () => {
      const r = await fetch(`${back}/health`, { headers: { Connection: "close" }, keepalive: false, signal: AbortSignal.timeout(CAP_MS) });
      await r.arrayBuffer();
      if (r.status !== 200) throw Object.assign(new Error("status"), { name: "Status", code: String(r.status) });
    }),
    // One long-lived check at a time: round 1 queued them behind a dead connection, and counted one wait up to 24 times.
    longOut ? Promise.resolve(write({ tick: n, t, check: "long", skipped: "an earlier one is still out" })) : (longOut = true, check("long", () => long`SELECT 1`).finally(() => { longOut = false; })),
    check("new", () => fresh`SELECT 1`),
  ]);
  fresh.close().catch(() => {});
}

process.on("SIGTERM", () => process.exit(0));
await tick();
setInterval(() => void tick().catch(() => {}), EVERY_MS);
