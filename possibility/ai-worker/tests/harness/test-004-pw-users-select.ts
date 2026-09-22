// Harness (Tanya, 2026-09-22): READ-ONLY — REQ-006 AC-9: password_hash shape for every email+password user on the SIT DB
// (prefix only, never the full hash), google_sub null/non-null, tier; plus the total users count.
// Run from possibility-back: bun --env-file=.env run <abs path to this file>
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL!, { connect_timeout: 10 });
const rows = await sql`select email, display_name, tier, google_sub is not null as has_google, password_hash is not null as has_pw,
  left(password_hash, 10) hash_prefix, length(password_hash) hash_len, created_at from users order by created_at`;
console.log(`users count: ${rows.length}`);
for (const r of rows) console.log(`  ${r.email.padEnd(32)} google=${r.has_google} pw=${r.has_pw} hash=${r.hash_prefix ?? "-"}${r.hash_len ? "…(" + r.hash_len + ")" : ""} tier=${r.tier} created=${r.created_at.toISOString()}`);
const [{ plain }] = await sql`select count(*)::int plain from users where password_hash is not null and password_hash not like '$argon2id$%'`;
console.log(`rows whose password_hash is NOT argon2id: ${plain}`);
await sql.end();
