// Harness (Tanya, 2026-09-23): TEST-006 cleanup — DELETEs only hire_requests rows whose user is
// a qa-tanya-hire* account (rows this round created; scoped by email, never a blanket delete).
// Run from possibility-back: bun --env-file=.env run <abs path>
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL!, { connect_timeout: 10 });
const del = await sql`
  delete from hire_requests h using users u
  where h.user_id = u.id and u.email like 'qa-tanya-hire%'
  returning h.id`;
console.log(`deleted hire_requests rows: ${del.length}`, del.map((r) => r.id));
await sql.end();
