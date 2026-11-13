/**
 * TEST-142 part 2 (Twenty) — READ-ONLY on sid after the day-end. cwd = smart-scheduler-back.
 * Prints DB host only; refuses anything but sid. SELECTs only; names/ids of MY rows + aggregate counts only.
 */
import fs from "node:fs";
import postgres from "H:/scheduler/smart-scheduler-back/node_modules/postgres/src/index.js";
const SID_HOST = "154.197.124.206";
const raw = process.env.DATABASE_URL!;
const host = new URL(raw).hostname;
console.log(`DB host: ${host}`);
if (host !== SID_HOST) throw new Error("Refusing: not sid");
const S = JSON.parse(fs.readFileSync("H:/ai-agent-workplace/ai-agent-workspace/smart-scheduler/ai-worker/tests/harness/state/test142-sid.json", "utf8"));
const sql = postgres(raw, { max: 1 });
try {
  const jrCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name='job_runs' ORDER BY ordinal_position`;
  console.log(`job_runs cols: ${jrCols.map((c: any) => c.column_name).join(",")}`);
  const jr = await sql`SELECT * FROM job_runs ORDER BY 1 DESC LIMIT 0`;
  const runs = await sql.unsafe(`SELECT * FROM job_runs WHERE row_to_json(job_runs)::text ILIKE '%end%' ORDER BY ${jrCols.some((c: any) => c.column_name === "started_at") ? "started_at" : "1"} DESC LIMIT 4`);
  for (const r of runs) console.log(`job_run: ${JSON.stringify(r).slice(0, 400)}`);
  void jr;
  const teacher = Object.fromEntries((await sql`SELECT id, nickname FROM teachers`).map((t: any) => [t.id, t.nickname]));
  const nm = (id: string | null) => (id ? teacher[id] ?? id : null);
  for (const k of ["A1", "A2", "A4", "C1", "D1", "F1", "G1", "J1", "J2", "K1"]) {
    const [c] = await sql`SELECT first_teacher_id, latest_teacher_id, coach_changed_at, bonus100_pick FROM course_packages WHERE id = ${S[k].courseId}`;
    console.log(`course ${k}: first=${nm(c.first_teacher_id)} latest=${nm(c.latest_teacher_id)} changed=${c.coach_changed_at ? "yes" : "no"} pick=${c.bonus100_pick}`);
  }
  for (const k of ["A3", "B1", "B2", "E1", "H1"]) {
    const [v] = await sql`SELECT first_teacher_id FROM vouchers WHERE id = ${S[k].voucherId}`;
    console.log(`voucher ${k}: first=${nm(v.first_teacher_id)}`);
  }
  const fill = await sql`
    SELECT
      (SELECT count(*)::int FROM course_packages) AS c_all,
      (SELECT count(*)::int FROM course_packages c WHERE EXISTS (SELECT 1 FROM bookings b WHERE b.course_id = c.id AND b.status = 'ATTENDED')) AS c_with_att,
      (SELECT count(*)::int FROM course_packages WHERE first_teacher_id IS NOT NULL) AS c_first,
      (SELECT count(*)::int FROM course_packages c WHERE first_teacher_id IS NULL AND EXISTS (SELECT 1 FROM bookings b WHERE b.course_id = c.id AND b.status = 'ATTENDED')) AS c_missing,
      (SELECT count(*)::int FROM course_packages WHERE source = 'IMPORT' AND first_teacher_id IS NOT NULL) AS c_import_first,
      (SELECT count(*)::int FROM vouchers v WHERE EXISTS (SELECT 1 FROM bookings b WHERE b.voucher_id = v.id AND b.status = 'ATTENDED')) AS v_with_att,
      (SELECT count(*)::int FROM vouchers WHERE first_teacher_id IS NOT NULL) AS v_first,
      (SELECT count(*)::int FROM vouchers v WHERE first_teacher_id IS NULL AND EXISTS (SELECT 1 FROM bookings b WHERE b.voucher_id = v.id AND b.status = 'ATTENDED')) AS v_missing`;
  console.log(`fill: ${JSON.stringify(fill[0])}`);
  // first coach == the earliest ATTENDED row's teacher, for every stamped course (spot the whole table)
  const wrong = await sql`
    WITH e AS (SELECT DISTINCT ON (b.course_id) b.course_id, b.teacher_id FROM bookings b
               WHERE b.status = 'ATTENDED' AND b.course_id IS NOT NULL ORDER BY b.course_id, b.date, b.start_time, b.id)
    SELECT count(*)::int AS n FROM course_packages c JOIN e ON e.course_id = c.id WHERE c.first_teacher_id IS DISTINCT FROM e.teacher_id`;
  console.log(`courses whose first coach != earliest ATTENDED row's teacher: ${wrong[0].n}`);
  const sys = await sql`SELECT count(*)::int AS n FROM course_packages c JOIN teachers t ON t.id = c.first_teacher_id WHERE t.is_system`;
  console.log(`courses whose first coach is the system teacher: ${sys[0].n}`);
  const [pb] = await sql`SELECT status, teacher_id FROM bookings WHERE id = ${S.F5other.bookingId}`;
  console.log(`park block: status=${pb.status} teacher=${nm(pb.teacher_id)}`);
  const mv = await sql`SELECT value_minor, reason, ref_type, idempotency_key, created_at FROM bo.movement WHERE ref_id = ${S.F5other.bookingId} OR idempotency_key LIKE ${"%" + S.F5other.bookingId + "%"}`;
  console.log(`park block movements: ${mv.length} ${JSON.stringify(mv)}`);
} finally { await sql.end(); }
