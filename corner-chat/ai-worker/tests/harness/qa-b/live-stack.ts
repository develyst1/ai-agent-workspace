// QA Team B (Tefany) — REAL-LINE live sitting (SPEC-002 § Real-LINE live run plan), owner present. Throwaway harness.
//
//   bun live-stack.ts        → re-creates corner_chat_test_qa_b on the owner's server, starts the fake gateway (:3992, AI
//                              STUB from gw.json), the back end (:8192) with LINE_LIVE=1 + LINE_API_BASE=https://api.line.me
//                              on the PROCESS ENV ONLY (never written to a file), and the app's web build (:3292).
//                              Ctrl-C / stop: everything stops and the QA DB is dropped.
// The real LINE channel secret and token come from corner-chat-back/.env (Bun's own .env load); this script never
// reads, prints or passes them. It aborts unless the back end's startup line says exactly `line: target=live`.
// The tunnel (cloudflared) is started separately, in its own process, by QA.
import { readFileSync, writeFileSync, createWriteStream } from "node:fs";
import { SQL } from "bun";

const BACK = "H:/corner-chat/corner-chat-back";
const APPREPO = "H:/corner-chat/corner-chat-app";
const HERE = import.meta.dir;
const SECRETS =
  "C:/Users/KUYDONG/AppData/Local/Temp/claude/H--ai-agent-workplace-ai-agent-workspace/8d6900d1-df1c-46d4-ad43-288e19b60fa9/scratchpad/qa-b-secrets.json";
const DB_NAME = "corner_chat_test_qa_b_live"; // own name per script (TASK-039 Q, 2026-11-02): never shares, never force-drops another run
const PORT = 8192, GW_PORT = 3992, APP_PORT = 3292;

const dotenv = readFileSync(`${BACK}/.env`, "utf8");
const adminUrl = dotenv.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/m)?.[1]?.replace(/^["']|["']$/g, "");
if (!adminUrl) throw new Error("no DATABASE_URL in the back repo's .env");
if (["127.0.0.1", "localhost", "::1"].includes(new URL(adminUrl).hostname)) throw new Error("refusing: a local Postgres (rule 4)");
const qaUrl = new URL(adminUrl); qaUrl.pathname = `/${DB_NAME}`;
const maintUrl = new URL(adminUrl); maintUrl.pathname = "/postgres";

// TASK-039: never cut off a live run. If anything is connected to this DB, stop and say so instead of dropping it.
{
  const s = new SQL(maintUrl.toString());
  try {
    const [{ n }] = await s`select count(*)::int n from pg_stat_activity where datname = ${DB_NAME}`;
    if (n > 0) { console.error(`refusing: ${n} connection(s) are using ${DB_NAME} — another QA-B run is up; stop it first`); process.exit(3); }
  } finally { await s.close(); }
}

const admin = async (stmt: string) => { const s = new SQL(maintUrl.toString()); try { await s.unsafe(stmt); } finally { await s.close(); } };
await admin(`DROP DATABASE IF EXISTS "${DB_NAME}" WITH (FORCE)`);
await admin(`CREATE DATABASE "${DB_NAME}"`);
const secrets = JSON.parse(readFileSync(SECRETS, "utf8"));

// the parent's own env must not carry a fake base or a made-up LINE value into the child
const base = { ...process.env };
for (const k of ["LINE_API_BASE", "LINE_LIVE", "LINE_CHANNEL_SECRET", "LINE_CHANNEL_ACCESS_TOKEN"]) delete base[k];
const env = {
  ...base,
  NODE_ENV: "development", PORT: String(PORT), HOST: "127.0.0.1",
  DATABASE_URL: qaUrl.toString(), DATABASE_URL_TEST: "",
  SECRET_KEY: secrets.secretKey, OWNER_EMAIL: secrets.ownerEmail, OWNER_PASSWORD: secrets.ownerPassword, OWNER_NAME: "QA-B Owner",
  ADMIN_WEB_ORIGIN: "http://localhost:3193",
  ZIMBRA_IMAP_HOST: "127.0.0.1", ZIMBRA_IMAP_PORT: "9", ZIMBRA_SMTP_HOST: "127.0.0.1", ZIMBRA_SMTP_PORT: "9", MAIL_POLL_SECONDS: "0",
  FILTER_PAUSED: "false", LLM_GATEWAY_URL: `http://127.0.0.1:${GW_PORT}`, LLM_GATEWAY_KEY: "",
  FCM_SERVICE_ACCOUNT_JSON: "",
  LINE_LIVE: "1", LINE_API_BASE: "https://api.line.me",   // D44: command line / process env only
};
const gw = Bun.spawn(["bun", `${HERE}/../fake-gateway/server.ts`, `${HERE}/gw.json`, "--port", String(GW_PORT)], { stdout: "ignore", stderr: "ignore" });
const mig = Bun.spawnSync(["bun", "scripts/migrate.ts"], { cwd: BACK, env });
if (mig.exitCode !== 0) { gw.kill(); await admin(`DROP DATABASE IF EXISTS "${DB_NAME}" WITH (FORCE)`); throw new Error(`migrate failed (DB dropped)`); }

const log = createWriteStream(`${HERE}/live-backend.log`);
const back = Bun.spawn(["bun", "src/index.ts"], { cwd: BACK, env, stdout: "pipe", stderr: "pipe" });
let startup = "";
for (const s of [back.stdout, back.stderr]) (async () => { for await (const c of s as any) { const t = Buffer.from(c).toString(); startup += t; log.write(c); } })();
const vlog = createWriteStream(`${HERE}/live-vite.log`);
const vite = Bun.spawn(["npx", "vite", "--host", "127.0.0.1", "--port", String(APP_PORT), "--strictPort"], {
  cwd: APPREPO, env: { ...process.env, VITE_FAKE: "false", VITE_PROXY_TARGET: `http://127.0.0.1:${PORT}` }, stdout: "pipe", stderr: "pipe",
});
for (const s of [vite.stdout, vite.stderr]) (async () => { for await (const c of s as any) vlog.write(c); })();

let stopping = false;
const stop = async (why: string) => {
  if (stopping) return; stopping = true;
  console.log(`stopping: ${why}`);
  back.kill(); gw.kill(); vite.kill(); log.end(); vlog.end();
  await Bun.sleep(800);
  await admin(`DROP DATABASE IF EXISTS "${DB_NAME}" WITH (FORCE)`).catch((e) => console.log(`drop failed: ${e.message}`));
  console.log(`dropped ${DB_NAME}`);
  process.exit(0);
};
process.on("SIGINT", () => stop("SIGINT")); process.on("SIGTERM", () => stop("SIGTERM"));

for (let i = 0; ; i++) {
  try { if ((await fetch(`http://127.0.0.1:${PORT}/api/v1/health`)).ok && (await fetch(`http://127.0.0.1:${APP_PORT}/`)).ok) break; } catch {}
  if (i > 160) await stop("did not come up");
  await Bun.sleep(250);
}
const target = startup.match(/line: target=(\w+)/)?.[1] ?? "unknown";
if (target !== "live") await stop(`startup line says target=${target}, not live — nothing may be sent`);
writeFileSync(`${HERE}/live.ready`, new Date().toISOString());
console.log(`READY · line: target=${target} · back :${PORT} · app :${APP_PORT} · AI stub :${GW_PORT} · DB ${DB_NAME}`);
await back.exited;
await stop("back end exited");
