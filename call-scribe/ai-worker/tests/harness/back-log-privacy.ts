// TASK-105 DoD "Logs": boots the back on MEMORY stores (no database), uploads synthetic audio under a
// recognisable file name, hits the error paths, and exits. Run with all output redirected to a file, then grep it.
// Usage (repo path comes from machine.local.md, never written here):
//   CALL_SCRIBE_BACK=<path> bun <this file> > out.log 2>&1 ; grep -c "$NAME" out.log
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.env.CALL_SCRIBE_BACK;
if (!root) throw new Error("set CALL_SCRIBE_BACK to the call-scribe-back path");
const imp = (p: string) => import(join(root, p));
const { createApp } = await imp("src/http/app.ts");
const { memorySessionStore } = await imp("src/auth/sessions.ts");
const { memoryRecordingStore } = await imp("src/recordings/store.ts");
const { mountRecordings } = await imp("src/recordings/mount.ts");

const NAME = process.env.SECRET_NAME ?? "SECRET-CALL-NAME-7391.m4a";
const dir = await mkdtemp(join(tmpdir(), "cs-harness-"));
const audio = join(dir, "a.m4a");
const gen = Bun.spawn(["ffmpeg", "-y", "-v", "error", "-nostdin", "-f", "lavfi", "-i", "sine=frequency=440:duration=3", "-c:a", "aac", audio]);
await gen.exited;

const sessions = memorySessionStore();
const store = memoryRecordingStore();
const hash = await Bun.password.hash("harness-throwaway");
const env = { storageDir: join(dir, "storage"), ffmpegPath: "ffmpeg", ffprobePath: "ffprobe", audioBitrate: "40k", silenceDb: -60, maxUploadBytes: 4294967296, gatewayMaxBytes: 104857600 };
const app = createApp({ env: { frontOrigin: "http://localhost:3100", ownerPasswordHash: hash, cookieSecure: false }, sessions });
mountRecordings(app, env, store, sessions);
const server = Bun.serve({ port: 3101, hostname: "127.0.0.1", fetch: app.fetch });
console.log(`harness server on ${server.hostname}:${server.port}`);

const base = "http://127.0.0.1:3101";
const login = await fetch(`${base}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: "harness-throwaway" }) });
const cookie = login.headers.get("set-cookie")!.split(";")[0]!;
const h = { cookie };
const bytes = new Uint8Array(await readFile(audio));
const created = await (await fetch(`${base}/api/recordings`, { method: "POST", headers: { ...h, "content-type": "application/json" }, body: JSON.stringify({ clientId: crypto.randomUUID(), fileName: NAME, sizeBytes: bytes.length, source: "file" }) })).json();
await fetch(`${base}/api/recordings/${created.id}/chunks/0`, { method: "PUT", headers: { ...h, "content-type": "application/octet-stream" }, body: bytes });
const done = await fetch(`${base}/api/recordings/${created.id}/complete`, { method: "POST", headers: { ...h, "content-type": "application/json" }, body: "{}" });
console.log(`complete -> ${done.status}`);
// error paths carrying the name: a refused file and a bad chunk
const bad = await (await fetch(`${base}/api/recordings`, { method: "POST", headers: { ...h, "content-type": "application/json" }, body: JSON.stringify({ clientId: crypto.randomUUID(), fileName: NAME, sizeBytes: 50, source: "file" }) })).json();
await fetch(`${base}/api/recordings/${bad.id}/chunks/0`, { method: "PUT", headers: { ...h, "content-type": "application/octet-stream" }, body: new Uint8Array(50) });
const refused = await fetch(`${base}/api/recordings/${bad.id}/complete`, { method: "POST", headers: { ...h, "content-type": "application/json" }, body: "{}" });
console.log(`refused complete -> ${refused.status}`);
await fetch(`${base}/api/recordings/${bad.id}/chunks/9`, { method: "PUT", headers: { ...h, "content-type": "application/octet-stream" }, body: new Uint8Array(1) });
const list = await (await fetch(`${base}/api/recordings`, { headers: h })).json();
console.log(`list -> ${list.recordings.length} recording(s)`);

server.stop(true);
await rm(dir, { recursive: true, force: true });
