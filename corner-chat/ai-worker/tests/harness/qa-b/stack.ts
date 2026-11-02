// QA Team B (Tefany) — keeps a local stack up for the TEST-005 web rows. Throwaway harness, not product code.
//
//   bun stack.ts            → resets corner_chat_qa_tefany, starts fake LINE API + fake gateway (:3992) + back end (:8192)
//                             and the app's Vite dev server (:3292, VITE_FAKE=false, /api → :8192). Ctrl-C stops all.
//
// Same isolation as test-004.ts: own database corner_chat_test_qa_b on the owner's server (D43), dropped on Ctrl-C/stop, made-up LINE secret, LINE/gateway/mail all fake or closed ports.
// Writes nothing into any product repo; Vite's own cache (node_modules/.vite, git-ignored) is the app's normal dev cache.
import { readFileSync, writeFileSync, existsSync, createWriteStream } from "node:fs";
import { SQL } from "bun";

const BACK = "H:/corner-chat/corner-chat-back";
const APPREPO = "H:/corner-chat/corner-chat-app";
const HERE = import.meta.dir;
const SECRETS =
  "C:/Users/KUYDONG/AppData/Local/Temp/claude/H--ai-agent-workplace-ai-agent-workspace/8d6900d1-df1c-46d4-ad43-288e19b60fa9/scratchpad/qa-b-secrets.json";
const DB_NAME = "corner_chat_test_qa_b_stack"; // own name per script (TASK-039 Q, 2026-11-02): never shares, never force-drops another run
const PORT = 8192, GW_PORT = 3992, APP_PORT = 3292;

const dotenv = readFileSync(`${BACK}/.env`, "utf8");
// D43 + CLAUDE.md rule 4: the owner's DATABASE_URL only (never a local Postgres); only the database name is swapped.
const adminUrl = dotenv.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/m)?.[1]?.replace(/^["']|["']$/g, "");
if (!adminUrl) throw new Error("no DATABASE_URL in the back repo's .env (the owner gives it; D43)");
const au = new URL(adminUrl);
if (["127.0.0.1", "localhost", "::1"].includes(au.hostname)) throw new Error("refusing: a local Postgres (CLAUDE.md rule 4)");
const qaUrl = new URL(adminUrl); qaUrl.pathname = `/${DB_NAME}`;
// CREATE/DROP only, through the maintenance DB "postgres" (as scripts/db-init.ts does); no other database is touched.
const maintUrl = new URL(adminUrl); maintUrl.pathname = "/postgres";

// TASK-039: never cut off a live run. If anything is connected to this DB, stop and say so instead of dropping it.
{
  const s = new SQL(maintUrl.toString());
  try {
    const [{ n }] = await s`select count(*)::int n from pg_stat_activity where datname = ${DB_NAME}`;
    if (n > 0) { console.error(`refusing: ${n} connection(s) are using ${DB_NAME} — another QA-B run is up; stop it first`); process.exit(3); }
  } finally { await s.close(); }
}

{
  const s = new SQL(maintUrl.toString());
  await s.unsafe(`DROP DATABASE IF EXISTS "${DB_NAME}" WITH (FORCE)`);
  await s.unsafe(`CREATE DATABASE "${DB_NAME}"`);
  await s.close();
}
if (!existsSync(SECRETS)) throw new Error("run test-004.ts once first (it creates the QA-B secrets file)");
const secrets = JSON.parse(readFileSync(SECRETS, "utf8"));

const { startFakeLineApi } = await import(`${BACK}/src/modules/line/testing/fake-line-api.ts`);
const line = startFakeLineApi();
const gw = Bun.spawn(["bun", `${HERE}/../fake-gateway/server.ts`, `${HERE}/gw.json`, "--port", String(GW_PORT)], { stdout: "ignore", stderr: "ignore" });
const env = {
  ...process.env,
  NODE_ENV: "development", PORT: String(PORT), HOST: "127.0.0.1",
  DATABASE_URL: qaUrl.toString(), DATABASE_URL_TEST: "",
  SECRET_KEY: secrets.secretKey, OWNER_EMAIL: secrets.ownerEmail, OWNER_PASSWORD: secrets.ownerPassword, OWNER_NAME: "QA-B Owner",
  ADMIN_WEB_ORIGIN: "http://localhost:3193",
  ZIMBRA_IMAP_HOST: "127.0.0.1", ZIMBRA_IMAP_PORT: "9", ZIMBRA_SMTP_HOST: "127.0.0.1", ZIMBRA_SMTP_PORT: "9", MAIL_POLL_SECONDS: "0",
  FILTER_PAUSED: "false", LLM_GATEWAY_URL: `http://127.0.0.1:${GW_PORT}`, LLM_GATEWAY_KEY: "",
  FCM_SERVICE_ACCOUNT_JSON: "",
  LINE_CHANNEL_SECRET: "qa-b-made-up-channel-secret", LINE_CHANNEL_ACCESS_TOKEN: "qa-b-made-up-token", LINE_API_BASE: line.baseUrl,
};
const mig = Bun.spawnSync(["bun", "scripts/migrate.ts"], { cwd: BACK, env });
if (mig.exitCode !== 0) throw new Error(`migrate failed: ${mig.stderr.toString().slice(0, 400)}`);
const log = createWriteStream(`${HERE}/stack-backend.log`);
const back = Bun.spawn(["bun", "src/index.ts"], { cwd: BACK, env, stdout: "pipe", stderr: "pipe" });
for (const s of [back.stdout, back.stderr]) (async () => { for await (const c of s as any) log.write(c); })();
const vlog = createWriteStream(`${HERE}/stack-vite.log`);
const vite = Bun.spawn(["npx", "vite", "--host", "127.0.0.1", "--port", String(APP_PORT), "--strictPort"], {
  cwd: APPREPO, env: { ...process.env, VITE_FAKE: "false", VITE_PROXY_TARGET: `http://127.0.0.1:${PORT}` }, stdout: "pipe", stderr: "pipe",
});
for (const s of [vite.stdout, vite.stderr]) (async () => { for await (const c of s as any) vlog.write(c); })();

const stop = async () => {
  back.kill(); gw.kill(); vite.kill(); line.stop(); log.end(); vlog.end();
  await Bun.sleep(500);
  const s = new SQL(maintUrl.toString()); // D43: dropped after each run
  try { await s.unsafe(`DROP DATABASE IF EXISTS "${DB_NAME}" WITH (FORCE)`); } finally { await s.close(); }
  process.exit(0);
};
process.on("SIGINT", stop); process.on("SIGTERM", stop);
for (let i = 0; ; i++) {
  try { if ((await fetch(`http://127.0.0.1:${PORT}/api/v1/health`)).ok && (await fetch(`http://127.0.0.1:${APP_PORT}/`)).ok) break; } catch {}
  if (i > 160) { console.error("stack did not come up"); stop(); }
  await Bun.sleep(250);
}
writeFileSync(`${HERE}/stack.ready`, new Date().toISOString());
console.log(`READY back :${PORT} · app :${APP_PORT} · gateway :${GW_PORT} · fake LINE ${line.baseUrl}`);
await back.exited;
