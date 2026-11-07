// TASK-106 DoD "Final": the back's real intake, worker and gateway client against the LOCAL STUB gateway
// (run from a snapshot, see TASK-106). Memory stores: no database. Synthetic tone only. Prints ids-free lines.
// Usage: CALL_SCRIBE_BACK=<path> GATEWAY_URL=http://127.0.0.1:3109 bun <this file>
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.env.CALL_SCRIBE_BACK;
const gatewayUrl = process.env.GATEWAY_URL ?? "http://127.0.0.1:3109";
if (!root) throw new Error("set CALL_SCRIBE_BACK to the call-scribe-back path");
const imp = (p: string) => import(join(root, p));
const { createApp } = await imp("src/http/app.ts");
const { memorySessionStore } = await imp("src/auth/sessions.ts");
const { memoryRecordingStore } = await imp("src/recordings/store.ts");
const { mountRecordings } = await imp("src/recordings/mount.ts");
const { createGatewayClient } = await imp("src/gateway/client.ts");
const { createWorker } = await imp("src/worker/worker.ts");

const dir = await mkdtemp(join(tmpdir(), "cs-harness-"));
const audio = join(dir, "a.m4a");
await Bun.spawn(["ffmpeg", "-y", "-v", "error", "-nostdin", "-f", "lavfi", "-i", "sine=frequency=440:duration=4", "-c:a", "aac", audio]).exited;

const sessions = memorySessionStore();
const store = memoryRecordingStore();
const env = { storageDir: join(dir, "storage"), ffmpegPath: "ffmpeg", ffprobePath: "ffprobe", audioBitrate: "40k", silenceDb: -60, maxUploadBytes: 4294967296, gatewayMaxBytes: 104857600 };
const hash = await Bun.password.hash("harness-throwaway");
const app = createApp({ env: { frontOrigin: "http://localhost:3100", ownerPasswordHash: hash, cookieSecure: false }, sessions });
mountRecordings(app, env, store, sessions);
const worker = createWorker({
  store,
  gateway: createGatewayClient({ baseUrl: gatewayUrl, key: "harness-not-a-key" }),
  storageDir: env.storageDir,
  idleMs: 50,
  timing: { pollIntervalMs: 500, limitMs: 60000 },
});

const login = await app.request("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: "harness-throwaway" }) });
const cookie = login.headers.get("set-cookie")!.split(";")[0]!;
const call = (p: string, init: RequestInit = {}) => app.request(p, { ...init, headers: { cookie, ...(init.headers as object) } });
const json = (b: unknown): RequestInit => ({ method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) });

const bytes = new Uint8Array(await readFile(audio));
const created = (await (await call("/api/recordings", json({ clientId: crypto.randomUUID(), fileName: "synthetic.m4a", sizeBytes: bytes.length, source: "file" }))).json()) as { id: string };
await call(`/api/recordings/${created.id}/chunks/0`, { method: "PUT", headers: { "content-type": "application/octet-stream" }, body: new Blob([bytes]) });
const completed = (await (await call(`/api/recordings/${created.id}/complete`, json({}))).json()) as { status: string };
console.log(`after complete: status=${completed.status}`);

void worker.start();
const seen: string[] = [];
const end = Date.now() + 60000;
for (;;) {
  const rec = (await (await call(`/api/recordings/${created.id}`)).json()) as { status: string; errorCode: string | null; retryable: boolean; turns: unknown[] | null; summary: string | null };
  if (seen.at(-1) !== rec.status) seen.push(rec.status);
  if (["done", "no_speech", "transcription_failed", "summary_failed"].includes(rec.status) || Date.now() > end) {
    console.log(`statuses seen: ${seen.join(" -> ")}`);
    console.log(`final: status=${rec.status} errorCode=${rec.errorCode} retryable=${rec.retryable} turns=${rec.turns ? rec.turns.length : null} summaryChars=${rec.summary ? rec.summary.length : null}`);
    break;
  }
  await Bun.sleep(100);
}
await worker.stop();
await rm(dir, { recursive: true, force: true });
