// Harness (Tanya, 2026-09-21): read-only — lists users (id, email, display_name, tier, created_at) + counts on the working DB.
// Run from possibility-back: bun --env-file=.env run <abs path to this file>
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL!, { connect_timeout: 10 });
const rows = await sql`select id, google_sub, email, display_name, tier, created_at, updated_at from users order by created_at`;
console.log(`users count: ${rows.length}`);
for (const r of rows) console.log(`  ${r.email.padEnd(30)} sub=${String(r.google_sub).slice(0,14).padEnd(14)} name=${r.display_name} tier=${r.tier} created=${r.created_at.toISOString()} updated=${r.updated_at.toISOString()} id=${r.id}`);
const [{ n }] = await sql`select count(*)::int n from ideas`;
console.log(`ideas count: ${n}`);
await sql.end();
