// TASK-105 / TASK-106 Postgres list, against call_scribe on the owner's dev Postgres.
// Run with cwd = call-scribe-back (Bun loads its .env; the URL is never printed):
//   bun <this file>
// Needs port 3101 free (one back per database: the clean-up deletes rows). Synthetic rows only.
// Every row it creates carries a marker file name and is removed in `finally`.
import { SQL } from "bun";
import { mkdtemp, mkdir, writeFile, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Imports resolve from the cwd (the back repo), so no machine path is written in this file.
const src = (p: string) => join(process.cwd(), "src", p);
const { pgRecordingStore } = await import(src("recordings/store"));
const { pgSessionStore } = await import(src("auth/sessions"));
const { runCleanup } = await import(src("recordings/cleanup"));

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL: missing");
const sql = new SQL(url);
const store = pgRecordingStore(sql);
const sessions = pgSessionStore(sql);
const MARK = "pgcheck-synthetic.m4a";
const ids: string[] = [];
let failed = 0;
const check = (name: string, ok: boolean, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? " — " + extra : ""}`);
  if (!ok) failed++;
};
const mk = async (clientId = crypto.randomUUID()) => {
  const r = await store.insert({ id: crypto.randomUUID(), clientId, fileName: MARK, sizeBytes: 12345678901, source: "file" });
  if (r.created) ids.push(r.row.id);
  return r;
};

const pre = await sql`SELECT count(*)::int AS n FROM recordings`;
if (pre[0].n !== 0) {
  console.log(`STOP: recordings holds ${pre[0].n} rows before the run; writing nothing.`);
  await sql.close();
  process.exit(3);
}
const tmp = await mkdtemp(join(tmpdir(), "cs-pgcheck-"));
try {
  // --- create, ON CONFLICT, bigint
  const a = await mk();
  check("insert → created, status uploading, bigint size round-trips", a.created && a.row.status === "uploading" && a.row.sizeBytes === 12345678901, `size=${a.row.sizeBytes}`);
  const dup = await store.insert({ id: crypto.randomUUID(), clientId: a.row.clientId, fileName: MARK, sizeBytes: 1, source: "file" });
  check("same clientId again → created=false, existing row back", !dup.created && dup.row.id === a.row.id);
  const cid = crypto.randomUUID();
  const race = await Promise.all([mk(cid), mk(cid), mk(cid), mk(cid)]);
  const createdN = race.filter((r) => r.created).length;
  check("4 concurrent creates, same clientId → exactly 1 created, all same id, no throw", createdN === 1 && new Set(race.map((r) => r.row.id)).size === 1, `created=${createdN}`);
  check("findByClientId finds it", (await store.findByClientId(cid))?.id === race[0]!.row.id);

  // --- intake, list, get
  check("setIntakeResult → true", await store.setIntakeResult(a.row.id, "queued", 61000));
  check("setIntakeResult on a missing id → false", !(await store.setIntakeResult(crypto.randomUUID(), "queued", 1)));
  const got = await store.get(a.row.id);
  check("get → queued, durationMs 61000", got?.status === "queued" && got.durationMs === 61000);
  const list1 = await store.list();
  check("list hides uploading rows", list1.every((r) => r.status !== "uploading") && list1.some((r) => r.id === a.row.id));

  // --- claimNext / SKIP LOCKED
  const b = await mk();
  await store.setIntakeResult(b.row.id, "queued", 1000);
  const [c1, c2, c3] = await Promise.all([store.claimNext(), store.claimNext(), store.claimNext()]);
  const claimed = [c1, c2, c3].filter(Boolean).map((r) => r!.id).sort();
  check("3 concurrent claimNext with 2 queued → 2 distinct rows, 1 null", claimed.length === 2 && claimed[0] !== claimed[1] && [c1, c2, c3].filter((x) => x === null).length === 1, `claimed=${claimed.length}`);
  check("claimed rows are now transcribing", (await store.get(a.row.id))?.status === "transcribing" && (await store.get(b.row.id))?.status === "transcribing");

  // --- jsonb
  const turns = [{ speaker: 1, text: "synthetic line one ไทย" }, { speaker: 2, text: 'quote " and \\ backslash' }];
  check("storeTurns (transcribing → summarizing) → true", await store.storeTurns(a.row.id, turns));
  const back = await store.get(a.row.id);
  check("jsonb read-back equals what was stored (Thai, quote, backslash)", JSON.stringify(back?.turns) === JSON.stringify(turns) && back?.status === "summarizing");
  check("storeTurns on a row not in transcribing → false (guard)", !(await store.storeTurns(a.row.id, turns)));
  check("storeSummary → done", (await store.storeSummary(a.row.id, "synthetic summary")) && (await store.get(a.row.id))?.status === "done");
  check("storeSummary again → false (guard)", !(await store.storeSummary(a.row.id, "x")));

  // --- no_speech / failed / requeue
  check("markNoSpeech (transcribing → no_speech)", (await store.markNoSpeech(b.row.id)) && (await store.get(b.row.id))?.status === "no_speech");
  const f = await mk();
  await store.setIntakeResult(f.row.id, "queued", 1000);
  const fc = await store.claimNext();
  check("claimNext takes the oldest queued", fc?.id === f.row.id);
  check("markFailed transcription_failed + code", (await store.markFailed(f.row.id, "transcription_failed", "provider_failed")) && (await store.get(f.row.id))?.errorCode === "provider_failed");
  const rq = await store.requeueFailed(f.row.id);
  check("requeueFailed → queued, error cleared", rq?.status === "queued" && rq.errorCode === null);
  check("requeueFailed on a non-failed row → null", (await store.requeueFailed(f.row.id)) === null);
  // summary failure keeps turns; retry claims straight to summarizing
  await store.claimNext();
  await store.storeTurns(f.row.id, turns);
  await store.markFailed(f.row.id, "summary_failed", "output_truncated");
  const kept = await store.get(f.row.id);
  check("summary_failed keeps turns", JSON.stringify(kept?.turns) === JSON.stringify(turns));
  await store.requeueFailed(f.row.id);
  const again = await store.claimNext();
  check("claimNext on a row with turns → summarizing (no new transcription)", again?.id === f.row.id && again.status === "summarizing");

  // --- boot recovery
  const g = await mk();
  await store.setIntakeResult(g.row.id, "queued", 1000);
  await store.claimNext(); // g → transcribing; f is summarizing
  const n = await store.requeueInFlight();
  check("requeueInFlight → 2 (one transcribing, one summarizing), turns kept", n === 2 && (await store.get(f.row.id))?.status === "queued" && (await store.get(f.row.id))?.turns !== null, `n=${n}`);

  // --- clean-up: stale uploading row + expired session, fresh ones stay
  const old = await mk();
  const fresh = await mk();
  await sql`UPDATE recordings SET created_at = now() - interval '25 hours' WHERE id = ${old.row.id}`;
  const storage = join(tmp, "storage");
  await mkdir(join(storage, old.row.id), { recursive: true });
  await writeFile(join(storage, old.row.id, "part"), "x");
  await mkdir(join(storage, fresh.row.id), { recursive: true });
  await sessions.create("pgcheck-expired-" + crypto.randomUUID(), new Date(Date.now() - 1000));
  const freshHash = "pgcheck-fresh-" + crypto.randomUUID();
  await sessions.create(freshHash, new Date(Date.now() + 3600_000));
  const r = await runCleanup({ store, sessions, storageDir: storage });
  check("clean-up: 1 old uploading row + 1 expired session removed", r.uploadsRemoved === 1 && r.sessionsRemoved === 1, JSON.stringify(r));
  check("clean-up: old row and folder gone, fresh row and folder stay", (await store.get(old.row.id)) === null && (await store.get(fresh.row.id)) !== null && !(await readdir(storage)).includes(old.row.id) && (await readdir(storage)).includes(fresh.row.id));
  check("clean-up: fresh session stays", await sessions.isValid(freshHash));
  await sessions.remove(freshHash);

  // --- delete
  check("remove → true, then false", (await store.remove(g.row.id)) && !(await store.remove(g.row.id)));
} finally {
  for (const id of ids) await sql`DELETE FROM recordings WHERE id = ${id}`;
  await sql`DELETE FROM sessions WHERE token_hash LIKE 'pgcheck-%'`;
  const left = await sql`SELECT count(*)::int AS n FROM recordings`;
  const sl = await sql`SELECT count(*)::int AS n FROM sessions`;
  console.log(`clean-up: recordings left=${left[0].n} sessions left=${sl[0].n}`);
  await rm(tmp, { recursive: true, force: true });
  await sql.close();
}
console.log(failed === 0 ? "ALL PASS" : `${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
