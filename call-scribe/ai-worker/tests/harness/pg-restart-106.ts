// TASK-106 real restart (AC-16) and TASK-105 upload path, on the real Postgres, with a slow fake gateway.
// Run with cwd = call-scribe-back:  bun <this file>     Needs 3101 free (one back per database).
// Starts the back as its own child process (killed by this script, never by name), a fake gateway on a free
// port (test/fake-gateway.ts, synthetic, no network), uploads a generated tone, kills the back mid-job.
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SQL } from "bun";

const cwd = process.cwd();
const { startFakeGateway } = await import(join(cwd, "test/fake-gateway"));
const B = "http://127.0.0.1:3101";
const PASSWORD = "tmp-" + crypto.randomUUID();
const hash = await Bun.password.hash(PASSWORD);
const sql = new SQL(process.env.DATABASE_URL!);
const tmp = await mkdtemp(join(tmpdir(), "cs-restart-"));
let failed = 0;
const check = (n: string, ok: boolean, x = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${n}${x ? " — " + x : ""}`);
  if (!ok) failed++;
};

const pre = await sql`SELECT count(*)::int AS n FROM recordings`;
if (pre[0].n !== 0) {
  console.log(`STOP: recordings holds ${pre[0].n} rows; writing nothing.`);
  process.exit(3);
}

const fake = startFakeGateway({ delayMs: 2500, runningPolls: 1 });
const logs: string[] = [];
function startBack() {
  // process.execPath: the real bun binary, so kill() stops the server itself and not a shim that leaves it behind
  const p = Bun.spawn([process.execPath, "src/index.ts"], {
    cwd,
    env: { ...process.env, OWNER_PASSWORD_HASH: hash, LLM_GATEWAY_URL: fake.url, LLM_GATEWAY_KEY: "throwaway", STORAGE_DIR: join(tmp, "storage") },
    stdout: "pipe",
    stderr: "pipe",
  });
  const pump = async (s: ReadableStream) => {
    for await (const c of s) logs.push(new TextDecoder().decode(c));
  };
  void pump(p.stdout as ReadableStream);
  void pump(p.stderr as ReadableStream);
  return p;
}
async function up(ms = 8000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try {
      if ((await fetch(`${B}/health`)).ok) return;
    } catch {}
    await Bun.sleep(100);
  }
  throw new Error("back did not start");
}
const status = async (id: string) => (await sql`SELECT status, error_code FROM recordings WHERE id = ${id}`)[0];
async function waitStatus(id: string, want: string[], ms = 120000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const s = await status(id);
    if (s && want.includes(s.status)) return s.status as string;
    await Bun.sleep(40);
  }
  throw new Error(`timeout waiting for ${want} (now ${(await status(id))?.status})`);
}

let back = startBack();
try {
  await up();
  const login = await fetch(`${B}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: PASSWORD }) });
  const cookie = login.headers.get("set-cookie")!.split(";")[0]!;
  const H = { cookie };
  // synthetic audio
  const wav = join(tmp, "tone.wav");
  const ff = Bun.spawn(["ffmpeg", "-y", "-v", "error", "-nostdin", "-f", "lavfi", "-i", "sine=frequency=440:duration=4", wav]);
  await ff.exited;
  const bytes = new Uint8Array(await Bun.file(wav).arrayBuffer());
  async function uploadOne() {
    const cid = crypto.randomUUID();
    const c = await fetch(`${B}/api/recordings`, { method: "POST", headers: { ...H, "content-type": "application/json" }, body: JSON.stringify({ clientId: cid, fileName: "restart-synthetic.wav", sizeBytes: bytes.byteLength, source: "file" }) });
    const { id } = (await c.json()) as { id: string };
    const p = await fetch(`${B}/api/recordings/${id}/chunks/0`, { method: "PUT", headers: { ...H, "content-type": "application/octet-stream" }, body: bytes });
    const done = await fetch(`${B}/api/recordings/${id}/complete`, { method: "POST", headers: { ...H, "content-type": "application/json" }, body: "{}" });
    return { id, chunk: p.status, complete: done.status };
  }

  // --- A: kill during transcribing
  const a = await uploadOne();
  check("upload: create → chunk 204 → complete 202", a.chunk === 204 && a.complete === 202, `chunk=${a.chunk} complete=${a.complete}`);
  await waitStatus(a.id, ["transcribing"]);
  console.log(`A before kill: status=${(await status(a.id)).status} transcribe_calls=${fake.calls.transcribe}`);
  back.kill();
  await back.exited;
  console.log(`A after kill (db): status=${(await status(a.id)).status}`);
  back = startBack();
  await up();
  const endA = await waitStatus(a.id, ["done", "transcription_failed", "summary_failed"]);
  check("A: restarted during transcribing → finishes done", endA === "done", `final=${endA}`);
  check("A: log shows boot recovery", logs.join("").includes("requeued 1 in-flight"), "grep 'requeued 1 in-flight'");

  // --- B: kill during summarizing → no new transcription call
  const trBefore = fake.calls.transcribe;
  const b = await uploadOne();
  await waitStatus(b.id, ["summarizing"]);
  const trAtKill = fake.calls.transcribe;
  console.log(`B before kill: status=${(await status(b.id)).status} transcribe_calls=${trAtKill - trBefore} (this recording)`);
  back.kill();
  await back.exited;
  back = startBack();
  await up();
  const endB = await waitStatus(b.id, ["done", "transcription_failed", "summary_failed"]);
  check("B: restarted during summarizing → done", endB === "done", `final=${endB}`);
  check("B: no new transcription call after the restart", fake.calls.transcribe === trAtKill, `calls ${trAtKill} → ${fake.calls.transcribe}`);

  // --- API reads of the stored result (jsonb through the real route)
  const one = (await (await fetch(`${B}/api/recordings/${b.id}`, { headers: H })).json()) as any;
  check("GET one → done with turns and summary", one.status === "done" && Array.isArray(one.turns) && one.turns.length > 0 && typeof one.summary === "string");
  const list = (await (await fetch(`${B}/api/recordings`, { headers: H })).json()) as any;
  const rows = Array.isArray(list) ? list : list.recordings;
  check("GET list → newest first, no turns/summary", rows.length === 2 && rows[0].id === b.id && rows.every((r: any) => !("turns" in r) && !("summary" in r)));
  check("logged out → 401", (await fetch(`${B}/api/recordings`)).status === 401);

  // --- C: delete during processing
  const c = await uploadOne();
  await waitStatus(c.id, ["transcribing"]);
  const del = await fetch(`${B}/api/recordings/${c.id}`, { method: "DELETE", headers: H });
  await Bun.sleep(3500);
  check("C: delete during processing → 204/200, row gone", del.status < 300 && (await status(c.id)) === undefined, `delete=${del.status}`);
  const del2 = await fetch(`${B}/api/recordings/${c.id}`, { method: "DELETE", headers: H });
  check("C: second delete → 404", del2.status === 404);
  const dirs = [...new Bun.Glob("*").scanSync({ cwd: join(tmp, "storage"), onlyFiles: false })];
  check("C: folder gone (only A and B folders remain)", !dirs.includes(c.id) && dirs.length === 2, `dirs=${dirs.length}`);
  check("C: no error lines in the back's log", !/error|failed|exception/i.test(logs.join("").replace(/status=\S*_failed/g, "")), "grep -i error");

  // --- logs: file name and fake turn text never logged
  const all = logs.join("");
  check("logs hold no file name and no turn text", !all.includes("restart-synthetic") && !all.includes("synthetic line"), "grep restart-synthetic / synthetic line");

  for (const id of [a.id, b.id]) await fetch(`${B}/api/recordings/${id}`, { method: "DELETE", headers: H });
  await fetch(`${B}/api/auth/logout`, { method: "POST", headers: H });
} finally {
  back.kill();
  await back.exited;
  fake.stop();
  await sql`DELETE FROM recordings WHERE file_name = 'restart-synthetic.wav'`;
  await sql`DELETE FROM sessions`;
  const l = await sql`SELECT (SELECT count(*) FROM recordings)::int AS r, (SELECT count(*) FROM sessions)::int AS s`;
  console.log(`clean-up: recordings left=${l[0].r} sessions left=${l[0].s}`);
  await sql.close();
  await rm(tmp, { recursive: true, force: true });
}
console.log(failed === 0 ? "ALL PASS" : `${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
