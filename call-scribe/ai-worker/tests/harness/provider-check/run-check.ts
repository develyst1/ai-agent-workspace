// TASK-103 run script: ONE provider x ONE variant, through the gateway's own routes, then the summary on the result.
//
// bun run-check.ts --repo <gateway dir> --provider <gemini|xai|stub> --variant <file.m4a> --label <name> \
//     --out <dir> --limit-usd <n> --ledger <file.json> --est-usd <cost estimate of this run> --est-basis "<how>" \
//     [--script script-S103.json] [--port 3961] [--poll-ms 5000] [--timeout-s 1800] [--no-summary] [--live-real] [--attach]
//
// Guards:
//  - A provider other than `stub` is refused unless the gateway dir has a bunfig.toml that preloads refuse-fetch.ts
//    (every outbound call is logged and refused), OR --live-real is passed. Prep never passes --live-real.
//  - The gateway dir's .env is only tested for a line naming an AUDIO_*_PROVIDER (refused if present); it is never
//    printed or copied. Bun itself loads the keys from it when the gateway starts.
//  - A busy port is refused before anything starts. The gateway is started as `process.execPath src/index.ts`
//    (not `bun run start`: `bun` is a shell wrapper here and a kill would stop only the wrapper, F-015) with
//    AUTH_ENABLED=true and a random bearer key written to a temporary api-keys.json, which is removed on every exit
//    path. After stopping, the port must no longer answer; if it does it is killed by port and the run exits 1.
//  - The row reports the provider/model the JOB says it ran. A mismatch with --provider exits 1.
//  - --attach (tests only): use a gateway already listening on --port instead of starting one.
// Cost: the ledger holds the running total. Before a real run, ledger + --est-usd must fit under --limit-usd, and
// the estimate is added BEFORE the call. In refuse-fetch mode nothing can be spent, so nothing is added.
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { score } from "./score";
import { bootEpoch, loadLedger, saveLedger, stamp, pauseCheck, pauseLine, EXIT_PAUSED, MAX_LIMIT_USD, LONG_MAX_LEDGER_USD } from "./pause";
// Pause (pause.ts): the boot epoch is checked at the start, before the first call, on every poll and after each job. A move of
// more than 2 s stops the run with exit 4: the server is stopped, api-keys.json removed, the row says `INVALID: paused`, its
// timing is not used, and the ledger keeps its charge (a request already sent may be billed anyway). While the ledger records
// a pause every run refuses (exit 4) until Silver clears it. Restarting after exit 4 is Silver's decision.
// Length: a clip over 5 minutes is refused unless --long, and --long also needs the ledger to show a FINISHED short run
// (<= 5 min, transcription done) for the same provider. One `long` per provider, never repeated.

const argv = process.argv.slice(2);
const flag = (n: string) => argv.includes(`--${n}`);
const opt = (n: string, d?: string) => { const i = argv.lastIndexOf(`--${n}`); return i >= 0 ? argv[i + 1] : d; }; // last one wins

let cleanup: Array<() => void> = [];
let exiting = false;
const runCleanup = () => { if (exiting) return; exiting = true; for (const f of cleanup.reverse()) { try { f(); } catch {} } };
process.on("exit", runCleanup);
for (const s of ["SIGINT", "SIGTERM"] as const) process.on(s, () => { runCleanup(); process.exit(130); });
const die = (m: string, c = 2): never => { console.error(m); process.exit(c); };

const repo = opt("repo") ?? die("--repo required");
const provider = opt("provider") ?? die("--provider required");
const variant = opt("variant") ?? die("--variant required");
const label = opt("label") ?? die("--label required");
const outDir = opt("out") ?? die("--out required");
const limit = Number(opt("limit-usd") ?? die("--limit-usd required"));
const ledgerPath = opt("ledger") ?? die("--ledger required");
const est = Number(opt("est-usd") ?? die("--est-usd required"));
const estBasis = opt("est-basis") ?? die("--est-basis required: say how the estimate was made");
const scriptPath = opt("script", new URL("./script-S103.json", import.meta.url).pathname)!;
const port = Number(opt("port", "3961"));
const pollMs = Number(opt("poll-ms", "5000"));
const timeoutS = Number(opt("timeout-s", "1800"));
if (!["gemini", "xai", "stub"].includes(provider)) die("provider must be gemini, xai or stub");
if (!existsSync(variant)) die(`variant not found: ${variant}`);
if (!(limit > 0) || !(est >= 0)) die("limit and estimate must be numbers");
if (limit > MAX_LIMIT_USD) die(`REFUSING: --limit-usd ${limit} is above the owner's ceiling ${MAX_LIMIT_USD} (pause.ts). The owner raises it, not a flag.`);
// The gateway's default for both steps is the MEDIUM tier. A non-stub run must NAME the small models, and the job's own
// result.model must match: a mismatch exits non-zero, like the provider. (Re-size, owner 2026-11-07: small models only.)
const transcribeModel = opt("transcribe-model"), summaryModel = opt("summary-model");
if (provider !== "stub" && (!transcribeModel || !summaryModel))
  die("REFUSING: a non-stub provider needs --transcribe-model and --summary-model. Left unnamed, the gateway would use its medium tier.");

const bunfig = existsSync(`${repo}/bunfig.toml`) ? readFileSync(`${repo}/bunfig.toml`, "utf8") : "";
const refuseMode = /refuse-fetch/.test(bunfig);
const ledger = loadLedger(ledgerPath);
const real = provider !== "stub" && !refuseMode;
const startEpoch = bootEpoch();
async function pauseGuard(where: string) {
  const r = pauseCheck(ledgerPath, startEpoch);
  if (!r) return;
  console.error(`${pauseLine(r)} (${where})`);
  if (!r.refused) { // the row for this run: not valid, timing not used
    mkdirSync(outDir, { recursive: true });
    writeFileSync(`${outDir}/result-${label}.json`, JSON.stringify({ row: { label, provider_asked: provider, status: "INVALID: paused", move_s: r.move_s, where } }, null, 2));
    console.log(JSON.stringify({ label, status: "INVALID: paused", move_s: r.move_s }));
  }
  process.exit(EXIT_PAUSED); // the exit handler stops the server and removes api-keys.json
}
await pauseGuard("start");
const clipSeconds = Number(spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", variant], { encoding: "utf8" }).stdout.trim());
if (!(clipSeconds > 0)) die(`REFUSING: ffprobe could not read the length of ${variant}`);
const LONG_S = 300;
if (clipSeconds > LONG_S && !flag("long")) die(`REFUSING: the clip is ${clipSeconds.toFixed(0)} s, over 5 minutes. A long clip needs --long.`);
if (flag("long") && ledger.total_usd > LONG_MAX_LEDGER_USD) die(`REFUSING: --long only when the ledger is at or under ${LONG_MAX_LEDGER_USD}; it is ${ledger.total_usd}.`);
if (flag("long") && !ledger.entries.some((e: any) => e.kind === "run-finished" && e.provider === provider && e.duration_s <= LONG_S && e.transcription_status === "done"))
  die(`REFUSING: --long needs the ledger to show a finished short run (<= 5 min, transcription done) for ${provider}. None recorded.`);
// The limit is checked first, so a run that cannot fit stops before anything else is looked at or started.
if (real && ledger.total_usd + est > limit)
  die(`STOP: ledger ${ledger.total_usd} + this run ${est} would pass the limit ${limit}. NOT RUN.`, 3);
if (provider !== "stub" && !refuseMode && !flag("live-real"))
  die("REFUSING: a real provider needs --live-real (Silver's word), or refuse-fetch.ts preloaded in the gateway dir's bunfig.toml.");
if (existsSync(`${repo}/.env`) && /^\s*(export\s+)?AUDIO_(TRANSCRIBE|SUMMARY)_PROVIDER=["']?[A-Za-z0-9]/m.test(readFileSync(`${repo}/.env`, "utf8")))
  die(`REFUSING: ${repo}/.env names an AUDIO provider. Name it on the command line instead.`);

const base = `http://localhost:${port}`;
const answers = async () => { try { await fetch(base + "/", { signal: AbortSignal.timeout(1500) }); return true; } catch { return false; } };
const keyFile = `${repo}/api-keys.json`;
const allowLog = `${outDir}/allow-${label}.log`; // the gateway's allow-list preload writes LOADED and every REFUSED host here
const bearer = randomUUID();
let server: ReturnType<typeof spawn> | undefined;
let stopFailed = false;

if (!flag("attach")) {
  // Any listener at all, including one that never answers HTTP: the exit handler's `fuser -k` would otherwise kill it.
  if (spawnSync("fuser", [`${port}/tcp`], { stdio: "ignore" }).status === 0) die(`REFUSING: something is already listening on port ${port}. Nothing was started.`);
  if (await answers()) die(`REFUSING: something already answers on port ${port}. Nothing was started.`);
  if (existsSync(keyFile)) die(`REFUSING: ${keyFile} already exists. Not touching it.`);
}
mkdirSync(outDir, { recursive: true });

if (!flag("attach")) {
  mkdirSync(outDir, { recursive: true });
  rmSync(allowLog, { force: true });
  writeFileSync(keyFile, JSON.stringify([{ key: bearer, project: "task103-harness", disabled: false }]));
  cleanup.push(() => rmSync(keyFile, { force: true }));
  const env: Record<string, string | undefined> = {
    ...process.env, PORT: String(port), AUTH_ENABLED: "true",
    AUDIO_TRANSCRIBE_PROVIDER: provider, AUDIO_SUMMARY_PROVIDER: provider, ALLOWLIST_LOG: allowLog,
    ...(transcribeModel ? { AUDIO_TRANSCRIBE_MODEL: transcribeModel } : {}), ...(summaryModel ? { AUDIO_SUMMARY_MODEL: summaryModel } : {}),
    ...(provider === "stub" ? { AUDIO_STUB_DELAY_MS: process.env.RUNCHECK_STUB_DELAY_MS ?? "100" } : {}), // the env var is for tests
  };
  // the allow-list preload is ALWAYS on the gateway process: any host but the two providers and localhost is refused
  server = spawn(process.execPath, ["--preload", new URL("./allow-hosts.ts", import.meta.url).pathname, "src/index.ts"], { cwd: repo, env: env as any, stdio: "ignore" });
  const s = server;
  cleanup.push(() => {
    // the kill is synchronous enough for an exit handler: signal, then force by port
    try { s.kill("SIGTERM"); } catch {}
    spawnSync("fuser", ["-k", `${port}/tcp`], { stdio: "ignore" });
  });
}

const H: Record<string, string> = { authorization: `Bearer ${bearer}` };
async function ready() {
  for (let i = 0; i < 100; i++) { if (await answers()) return; await Bun.sleep(100); }
  die("gateway did not start", 1);
}
// Every fetch has its own limit (a gateway that stops answering must not hang a paid run): a poll 30 s, an upload or a
// summary POST 120 s; both settable for tests. A timed-out poll is tried again until --timeout-s, then ends as
// harness_timeout (exit 1). A timed-out POST is NEVER retried (it may have been billed): the run ends non-zero, the ledger
// keeps the charge, and the exit handler cleans up as on any other exit.
const pollLimitMs = Number(opt("poll-limit-s", "30")) * 1000;
const callLimitMs = Number(opt("call-limit-s", "120")) * 1000;
const isTimeout = (e: any) => e?.name === "TimeoutError" || e?.name === "AbortError";
async function postOnce(url: string, init: RequestInit): Promise<any> {
  try {
    return await (await fetch(url, { ...init, signal: AbortSignal.timeout(callLimitMs) })).json();
  } catch (e: any) {
    return die(`FAILED: POST ${new URL(url).pathname} got no usable answer within ${callLimitMs / 1000} s (${e?.name ?? "error"}). Not retried: it may have been billed. The ledger keeps the charge.`, 1);
  }
}
async function poll(id: string): Promise<any> {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutS * 1000) {
    let j: any;
    try {
      j = await (await fetch(`${base}/audio/jobs/${id}`, { headers: H, signal: AbortSignal.timeout(pollLimitMs) })).json();
    } catch (e: any) {
      if (!isTimeout(e)) throw e;            // any other error ends the run (the exit handler cleans up)
      await pauseGuard("poll timed out");    // a frozen box may be a paused one
      await Bun.sleep(pollMs);               // a timed-out poll is tried again, until --timeout-s
      continue;
    }
    await pauseGuard("poll");
    if (j?.data?.status === "done" || j?.data?.status === "failed") return j;
    if (j?.success === false) return j;
    await Bun.sleep(pollMs);
  }
  return { success: true, data: { status: "failed", error: { code: "harness_timeout", retryable: false } } };
}

await ready();
// The allow-list must be loaded in THIS gateway before anything is submitted (the preload says LOADED in its log).
if (!flag("attach")) {
  if (!(existsSync(allowLog) && /^LOADED$/m.test(readFileSync(allowLog, "utf8"))))
    die("FAILED: the allow-list preload is not loaded in the gateway. Nothing was submitted, nothing charged.", 1);
  console.error("allow-list check: preload LOADED in the gateway");
}
// Auth must be ON before anything is submitted: an unauthenticated read has to be refused. The client sends a bearer key
// either way, so without this a gateway with auth off would pass every other check. (Skipped for --attach, which owns no server.)
if (!flag("attach")) {
  const st = await fetch(`${base}/audio/jobs/x`, { signal: AbortSignal.timeout(pollLimitMs) }).then(r => r.status, () => -1);
  if (st !== 401) die(`FAILED: an unauthenticated GET /audio/jobs/x answered ${st}, not 401: auth is not enforced. Nothing was submitted, nothing charged.`, 1);
  console.error("auth check: unauthenticated GET /audio/jobs/x -> 401");
}
// From here on the run may spend: the estimate is charged right after the auth check, before the first call.
await pauseGuard("before the first call");
if (real) {
  stamp(ledger);
  ledger.total_usd = Number((ledger.total_usd + est).toFixed(6));
  ledger.entries.push({ kind: "run", label, provider, est_usd: est, basis: estBasis });
  saveLedger(ledgerPath, ledger);
}
const script = JSON.parse(readFileSync(scriptPath, "utf8"));
const t0 = Date.now();
const fd = new FormData();
fd.append("file", new Blob([readFileSync(variant)]), "clip.m4a");
const post: any = await postOnce(`${base}/audio/transcriptions`, { method: "POST", body: fd, headers: H });
if (!post?.data?.job_id) die(`submit failed: ${JSON.stringify(post).slice(0, 120)}`, 1);
await pauseGuard("after submit");
const tJob = await poll(post.data.job_id);
await pauseGuard("after the transcription job");
const elapsed = Number(((Date.now() - t0) / 1000).toFixed(1));

let sJob: any;
if (!flag("no-summary") && tJob?.data?.status === "done" && tJob.data.result && !tJob.data.result.no_speech) {
  const sp: any = await postOnce(`${base}/audio/summaries`, {
    method: "POST", headers: { ...H, "content-type": "application/json" }, body: JSON.stringify({ turns: tJob.data.result.turns }),
  });
  if (sp?.data?.job_id) sJob = await poll(sp.data.job_id);
  await pauseGuard("after the summary job");
}

// Stop the server for real and prove the port is free (skipped for --attach, which does not own the server).
if (server) {
  try { server.kill("SIGTERM"); } catch {}
  for (let i = 0; i < 30 && (await answers()); i++) await Bun.sleep(100);
  if (await answers()) {
    spawnSync("fuser", ["-k", `${port}/tcp`], { stdio: "ignore" });
    await Bun.sleep(300);
    stopFailed = true;
    console.error(`WARNING: the gateway still answered on ${port} after SIGTERM; killed it by port.`);
  }
  if (await answers()) die(`FAILED: port ${port} still answers after kill by port.`, 1);
}

const ran = { transcription: { provider: tJob?.data?.result?.provider, model: tJob?.data?.result?.model },
              summary: { provider: sJob?.data?.result?.provider, model: sJob?.data?.result?.model } };
const mismatch = [ran.transcription.provider, ran.summary.provider].filter(p => p !== undefined && p !== provider);
if (provider !== "stub") {
  if (ran.transcription.model !== undefined && ran.transcription.model !== transcribeModel) mismatch.push(`transcription model ${ran.transcription.model} (asked ${transcribeModel})`);
  if (ran.summary.model !== undefined && ran.summary.model !== summaryModel) mismatch.push(`summary model ${ran.summary.model} (asked ${summaryModel})`);
}
if (real && !mismatch.length) { // what the --long gate reads: a finished run, with its length and outcome
  const l = loadLedger(ledgerPath);
  l.entries.push({ kind: "run-finished", label, provider, variant: variant.split("/").pop(), duration_s: Number(clipSeconds.toFixed(1)), transcription_status: tJob?.data?.status });
  saveLedger(ledgerPath, l);
}
const row = {
  label, provider_asked: provider, provider_ran: ran,
  allow_list_refused: server && existsSync(allowLog) ? readFileSync(allowLog, "utf8").split("\n").filter(l => l.startsWith("REFUSED")).length : null, variant: variant.split("/").pop(), refuse_mode: refuseMode,
  ...score(script, tJob, sJob, elapsed, real ? est : 0), ledger_total_usd: ledger.total_usd, cost_basis: real ? `ESTIMATE: ${estBasis}` : "none (nothing can be spent)",
};
// Job JSON holds transcript text of SYNTHETIC audio only; kept in the out dir, which the caller removes or points at a mktemp folder.
writeFileSync(`${outDir}/result-${label}.json`, JSON.stringify({ row, transcript_job: tJob, summary_job: sJob }, null, 2));
console.log(JSON.stringify(row, null, 2));
if (mismatch.length) die(`MISMATCH: asked for ${provider}, the job says it ran ${mismatch.join(", ")}. This row is not valid.`, 1);
if (stopFailed) process.exit(1);
process.exit(tJob?.data?.status === "done" ? 0 : 1);
