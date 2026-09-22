// Harness (Jason, 2026-09-22): read-only checks for TASK-011. Run from possibility-back: bun --env-file=.env run <file> [email]
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL!, { connect_timeout: 10 });
const cols = (await sql`select column_name, is_nullable from information_schema.columns where table_name='users' and column_name in ('google_sub','password_hash') order by 1`).map(r => `${r.column_name}:${r.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'}`);
console.log("users columns:", cols.join(", "));
console.log("users count:", (await sql`select count(*)::int n from users`)[0]!.n, "| google_sub is null:", (await sql`select count(*)::int n from users where google_sub is null`)[0]!.n);
const e = process.argv[2];
if (e) for (const r of await sql`select email, left(password_hash,10) h, google_sub from users where email=${e}`) console.log("  row:", JSON.stringify(r));
await sql.end();
