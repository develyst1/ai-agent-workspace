/**
 * QA harness (Twenty, TEST-142) — READ-ONLY schema check of migration 0074 on sid.
 * Run with cwd = smart-scheduler-back (Bun loads its .env). Prints the DB HOST only, never the URL.
 * Refuses unless the host is sid (154.197.124.206). Only SELECTs from the catalog; no row data.
 */
import postgres from "H:/scheduler/smart-scheduler-back/node_modules/postgres/src/index.js";

const SID_HOST = "154.197.124.206";
const raw = process.env.DATABASE_URL;
if (!raw) throw new Error("DATABASE_URL not set");
const host = new URL(raw).hostname;
console.log(`DB host: ${host}`);
if (host !== SID_HOST) throw new Error(`Refusing: host is not sid (${SID_HOST})`);

const sql = postgres(raw, { max: 1 });
try {
  await sql`SET TRANSACTION READ ONLY`.catch(() => {});
  const cols = await sql`
    SELECT table_name, column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name IN ('course_packages','vouchers')
      AND column_name IN ('from_trial_booking_id','prev_course_id','prev_voucher_id','first_teacher_id',
        'coach_changed_at','latest_teacher_id','bonus100_pick','bonus100_pick_by','bonus100_pick_at')
    ORDER BY table_name, column_name`;
  for (const c of cols) console.log(`col ${c.table_name}.${c.column_name} ${c.data_type} nullable=${c.is_nullable}`);
  const cons = await sql`
    SELECT conname, pg_get_constraintdef(oid) AS def FROM pg_constraint
    WHERE conname IN ('course_prev_one_chk','voucher_prev_one_chk','course_bonus100_pick_chk')`;
  for (const c of cons) console.log(`check ${c.conname}: ${c.def}`);
  const idx = await sql`
    SELECT indexname, indexdef FROM pg_indexes
    WHERE indexname IN ('course_from_trial_uq','voucher_from_trial_uq')`;
  for (const i of idx) console.log(`index ${i.indexname}: ${i.indexdef}`);
  const led = await sql`SELECT count(*)::int AS n FROM drizzle.__drizzle_migrations_scheduling`;
  console.log(`ledger rows: ${led[0].n}`);
  const filled = await sql`
    SELECT
      (SELECT count(*)::int FROM course_packages WHERE first_teacher_id IS NOT NULL) AS c_first,
      (SELECT count(*)::int FROM course_packages WHERE from_trial_booking_id IS NOT NULL OR prev_course_id IS NOT NULL OR prev_voucher_id IS NOT NULL) AS c_links,
      (SELECT count(*)::int FROM vouchers WHERE first_teacher_id IS NOT NULL) AS v_first,
      (SELECT count(*)::int FROM course_packages) AS c_all`;
  console.log(`counts: ${JSON.stringify(filled[0])}`);
} finally {
  await sql.end();
}
