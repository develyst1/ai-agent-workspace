// Harness (Tanya, 2026-09-23): TEST-006 admin enablement — resets the password of MY OWN QA
// account `qa-tanya-pw1@example.com` (row I created in TEST-004; the old password lived only in
// a dead session's notes). Touches no other row. Then verifies via SIT API that login works and
// /auth/me now reports isAdmin:true (owner put this email on ADMIN_EMAILS 2026-09-23).
// Run from possibility-back: QA_PW='<new password>' bun --env-file=.env run <abs path>
import postgres from "postgres";
const PW = process.env.QA_PW;
if (!PW || PW.length < 8) { console.error("set QA_PW (>=8 chars)"); process.exit(2); }
const sql = postgres(process.env.DATABASE_URL!, { connect_timeout: 10 });
const hash = await Bun.password.hash(PW); // argon2id, same as registerWithPassword
const mine = await sql`update users set password_hash = ${hash}, updated_at = now() where email = 'qa-tanya-pw1@example.com' returning id, email`;
console.log(`reset rows: ${mine.length}`, mine.map((r) => r.email));
await sql.end();

const login = await fetch("https://possibility.develyst.online/api/v1/auth/login", {
  method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ email: "qa-tanya-pw1@example.com", password: PW }),
});
console.log("login:", login.status);
const cookie = login.headers.get("set-cookie")?.split(";")[0];
const me = await (await fetch("https://possibility.develyst.online/api/v1/auth/me", { headers: { cookie } })).json();
console.log("me:", JSON.stringify({ email: me.user?.email, tier: me.user?.tier, isAdmin: me.user?.isAdmin }));
