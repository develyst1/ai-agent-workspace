// Harness (Fern, 2026-09-21): READ-ONLY — prints a session cookie for an existing user by email (no insert/update).
// Run from possibility-back: bun --env-file=.env run <abs path to this file> <email>
import postgres from "postgres";
import { signSession } from "../../../../../../possibility/possibility-back/src/lib/session";
const email = process.argv[2];
if (!email) { console.error("usage: <email>"); process.exit(2); }
const sql = postgres(process.env.DATABASE_URL!, { connect_timeout: 10 });
const [u] = await sql`select id, email, tier from users where email = ${email}`;
await sql.end();
if (!u) { console.error("no such user"); process.exit(1); }
console.log(`${u.email} tier=${u.tier} possibility_session=${await signSession(u.id)}`);
process.exit(0);
